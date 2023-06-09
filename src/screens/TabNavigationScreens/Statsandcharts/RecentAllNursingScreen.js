import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet,  ActivityIndicator, SectionList } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BottomButton from "../../../components/BottomButton";
import showSimpleAlert from '../../../utils/showSimpleAlert';
import Request from '../../../api/Request';
import BallIndicator from '../../../components/BallIndicator';
import JSFunctionUtils from '../../../utils/JSFunctionUtils';
import Swipeout from 'react-native-swipeout-mod';
import FastImage from 'react-native-fast-image';
import { trackEvent } from '../../../utils/tracking';

export default function TotalNursingScreen({ route, navigation }) {

  const [state, setState] = useState({
    isModalVisible: false,
    sessionData: [],
    isModalFooterVisible: false,
    pagenumber: 1,
    LastRecored: 0,
    isRefresh: false,
    rowIndex: ''
  })
  useEffect(() => {
    sessionListApi(true, false)
  }, [])
  const sessionListApi = async (values, valuesfooter) => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: values,
      isModalFooterVisible: valuesfooter
    }))
    let params = {
      page_no: state.pagenumber,
      limit: 9,
      type: '1'
    }
    let response = await Request.post('nursing/list', params)
    if (response.status === 'SUCCESS') {

      setState(oldState => ({
        ...oldState,
        sessionData: state.isRefresh ? response.data.nursing : JSFunctionUtils.uniqueArrayDate(state.sessionData, response.data.nursing, "id"),
        isModalVisible: false,
        pagenumber: response.data.total_records === state.sessionData.length ? state.pagenumber : state.pagenumber + 1,
        isModalFooterVisible: false,
        LastRecored: response.data.total_records,
        isRefresh: false,
      }))
    }
    else {
      setState(oldState => ({
        ...oldState,
        isModalVisible: false,
        isModalFooterVisible: false

      }));
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const deleteApi = async (nursing_id, indexs, id) => {
    action_event('Delete')
    setState(oldState => ({
      ...oldState,
      isModalVisible: true,
    }))
    let params = {
      nursing_id: nursing_id,
    }
    let response = await Request.post('nursing/delete', params)
    if (response.status === 'SUCCESS') {
      showSimpleAlert(response.message)
      var indmain = state.sessionData.findIndex(data => data.id === id)
      var array = [...state.sessionData];
      array[indmain].data = [...state.sessionData[indmain].data.filter((data, index) => index != indexs)];
      if (array[indmain].data.length == 0) {
        array = array.filter(data => data.id != id)
      }
      setState(oldState => ({
        ...oldState,
        sessionData: array,
        isModalVisible: false,
      }))
    }
    else {
      setState(oldState => ({
        ...oldState,
        isModalVisible: false,
      }));
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const addupdate = (newdata, isnew, deleteid) => {
    if (!newdata) {
      var indmain = state.sessionData.findIndex(data => data.id === deleteid.id)
      var array = [...state.sessionData];
      array[indmain].data = [...state.sessionData[indmain].data.filter((data, index) => data.nursing_id != deleteid.nursing_id)];
      if (array[indmain].data.length == 0) {
        array = array.filter(data => data.id != deleteid.id)
      }
      setState(oldState => ({
        ...oldState,
        sessionData: array,
      }))
    }
    else {
      if (isnew) {
        const dataarray = [{ id: newdata.id, title: newdata.title, data: [newdata] }]
        setState(oldState => ({
          ...oldState,
          sessionData: JSFunctionUtils.uniqueArrayDate(state.sessionData, dataarray, "id", "start_time"),
          LastRecored: isnew ? state.LastRecored + 1 : state.LastRecored,
        }))
      }
      else {
        var indmain = state.sessionData.findIndex(data => data.id === newdata.id)
        var indsub = indmain != -1 ? state.sessionData[indmain].data.findIndex(data => data.nursing_id === newdata.nursing_id) : -1
        if (indsub != -1) {
          state.sessionData[indmain].data[indsub] = newdata;
          state.sessionData[indmain].data = state.sessionData[indmain].data.sort((a, b) => (a.start_time > b.start_time) ? -1 : ((b.start_time > a.start_time) ? 1 : 0))
          setState(oldState => ({
            ...oldState,
            sessionData: state.sessionData,
          }))
        }
        else {
          for (let i = 0; i < state.sessionData.length; i++) {
            const olddata = state.sessionData[i].data.filter((data, index) => data.nursing_id == newdata.nursing_id)
            state.sessionData[i].data = [...state.sessionData[i].data.filter((data, index) => data.nursing_id != newdata.nursing_id)];
            if (olddata.length > 0) {
              if (state.sessionData[i].id == olddata[0].id) {
                if (state.sessionData[i].data.length == 0) {
                  state.sessionData = state.sessionData.filter(data => data.id != olddata[0].id)
                }
              }
            }
          }
          const dataarray = [{ id: newdata.id, title: newdata.title, data: [newdata] }]
          setState(oldState => ({
            ...oldState,
            sessionData: JSFunctionUtils.uniqueArrayDate(state.sessionData, dataarray, "id", "start_time"),
          }))
        }

      }

    }



  }
  const Action_continue = () => {
    action_event('Add Missing Session')
    navigation.navigate(route.params.from == 'tracking' ? 'EditNursingScreen1' : 'EditNursingScreen', { Data: undefined, from: route.params.from == 'tracking' ? 'tracking' : 'recent', onGoBack: (data, isnew, deleteid) => addupdate(data, isnew, deleteid) })
  }
  const onRefresh = () => {
    state.pagenumber = 1
    state.LastRecored = 0
    state.isRefresh = true

    sessionListApi(false, false)

  }
  const fetchMore = () => {
    const NotComplete = state.LastRecored > state.sessionData.map(item => item.data.length).reduce((a, b) => a + b) ? true : false
    if (NotComplete) {
      sessionListApi(false, true)
    }
  };
  const renderFooter = () => {
    return (
      <View style={{ height: 120 }}>
        {state.isModalFooterVisible ?
          <ActivityIndicator color={colors.Blue} style={{ marginLeft: 8 }}
            size={'large'}
            hidesWhenStopped={true} />
          : null}
      </View>
    );
  }
  const onSwipeOpen = (rowIndex) => {
    setState(oldState => ({
      ...oldState,
      rowIndex: rowIndex,

    }));

  }

  const onSwipeClose = (rowIndex) => {
    if (rowIndex === state.rowIndex) {
      setState(oldState => ({
        ...oldState,
        rowIndex: null,

      }));
    }
  }
  const action_event = (action) => {
    const trackEventparam = { action: action }
    trackEvent({ event: 'Recent_Nursing_Sessions', trackEventparam })
  }
  const renderItem = ({ item, index, section }) => {
    var checkvalues = index + '' + section.id
    return (
      <Swipeout backgroundColor={'transparent'}
        onOpen={() => (onSwipeOpen(checkvalues))}
        close={state.rowIndex !== checkvalues}
        onClose={() => (onSwipeClose(checkvalues))}
        rowIndex={index}
        sectionId={0}
        buttonWidth={30}
        autoClose={true}
        right={[{
          onPress: () => {
            action_event('Edit')
            navigation.navigate(route.params.from == 'tracking' ? 'EditNursingScreen1' : 'EditNursingScreen', { Data: item, from: route.params.from == 'tracking' ? 'tracking' : 'recent', onGoBack: (data, isnew, deleteid) => addupdate(data, isnew, deleteid) })},
          backgroundColor: 'transparent',
          component: (
            <View style={{ alignItems: 'center', flex: 1, justifyContent: "center" }}>
              <FastImage source={importImages.editicon1} style={{ height: 33, width: 33 }} />
            </View>
          ),
        },
        {
          onPress: () => deleteApi(item.nursing_id, index, section.id),
          backgroundColor: 'transparent',
          component: (
            <View style={{ alignItems: 'center', flex: 1, justifyContent: "center" }}>
              <FastImage source={importImages.deleteicon} style={{ height: 25, width: 25 }} />
            </View>
          ),
        }]} >

        <View style={{ marginBottom: 7, flexDirection: 'row', width: deviceWidth - 34, justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
          <FastImage
            source={importImages.defaultProfileImg}
            style={{ height: 50, width: 50, borderRadius: 50 / 2 }}>
            <FastImage
              source={{ uri: item.mother_image }}
              style={{ height: 50, width: 50, borderRadius: 50 / 2 }}></FastImage>
          </FastImage>
          <View style={[styles.itemBackground, { width: deviceWidth - 94, }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginStart: 10, marginEnd: 15 }}>
              <Text style={styles.inactiveText}>{item.start_time + ' - ' + item.end_time}</Text>
              <Text style={{ color: colors.textLable, fontFamily: fonts.rubikRegular, fontSize: 16 }}>{JSFunctionUtils.formatTimeString(item.duration, false, true)}</Text>
            </View>

          </View>
        </View>
      </Swipeout>


    );
  }

  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      <Header
        leftBtnOnPress={() => { action_event('Back'), navigation.goBack() }}
        titleStyle={{ color: colors.Blue }}
      />

      <View style={{ width: deviceWidth - 34, alignItems: 'center', alignSelf: 'center' }}>
        <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.mainHeadertext} adjustsFontSizeToFit={true} numberOfLines={1}>{'Recent Nursing Sessions'}</Text>

        </View>

      </View>
      <View style={styles.container}>
        <SectionList
          sections={state.sessionData}
          style={{ marginTop: 5 }}
          keyExtractor={(item, index) => item + index}
          renderItem={renderItem}
          // bounces={false}
          onEndReachedThreshold={0.07}
          onEndReached={fetchMore}
          onRefresh={() => onRefresh()}
          refreshing={state.isRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (

            <Text style={stylesBackground.NodataStyle}>{state.isModalVisible ? '' : 'No data found'}</Text>
          )}
          contentContainerStyle={state.sessionData.length > 0 ? {} : { flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}
          ListFooterComponent={renderFooter}

          renderSectionHeader={({ section: { title } }) => (
            <View style={{ }}>
              <Text style={styles.Headertext}>{title}</Text>
            </View>
          )}
        />

        <BottomButton text={'Add missing session'} onPress={() => Action_continue()} container={{ position: 'absolute', bottom: -20, }} />


      </View>
      {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}

    </View >

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: deviceWidth - 34,
    alignSelf: 'center',
  },

  mainHeadertext: {
    color: colors.Blue,
    fontSize: 28,
    fontFamily: fonts.rubikBold,
    textTransform: 'capitalize',
    width: deviceWidth - 34,
  },
  Headertext: {
    marginTop: 11,

    color: colors.Blue,
    fontSize: 16,
    fontFamily: fonts.rubikMedium,

  },
  itemBackground: { backgroundColor: colors.White, borderRadius: 10, height: 60, justifyContent: 'center', borderColor: 'rgba(34, 50, 99, 0.2)', borderWidth: 1 },
  inactiveText: { fontSize: 12, fontFamily: fonts.rubikMedium, color: colors.Blue },


});


import React, { useState, useEffect, useRef, } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, FlatList, ActivityIndicator } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import Request from '../../../api/Request';
import BallIndicator from '../../../components/BallIndicator';
import { deviceWidth } from '../../../constants';
import StorageService from '../../../utils/StorageService';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import { trackEvent } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';
import { hasNotch } from 'react-native-device-info';
import TextField from '../../../components/TextField';
import JSFunctionUtils from '../../../utils/JSFunctionUtils';
var searchFlag = false
import * as RNLocalize from "react-native-localize";
import { Platform } from 'react-native';
let cancelToken
import axios from 'axios';
import apiConfigs from '../../../api/apiConfig';

export default function MeditationScreen({ route, navigation }) {
  const [state, setState] = useState({
    meditationsList: [],
    isModalVisible: false,
    isModalFooterVisible: false,
    pagenumber: 1,
    LastRecored: 0,
    screentype: '1',
    refSearch: useRef(),
    searchTxt: '',
    isRefresh: false,

  })


  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Prevent default action
      StorageService.clearArt()
    });
    navigation.addListener('focus', () => {
      getData()
    });
    return unsubscribe;
  }, [])
  const getData = async () => {
    state.refSearch.current.clear()
    state.meditationsList = []
    var data = await StorageService.getItem('clickMeditation')
    state.screentype = data != null ? data : '1'
    state.pagenumber = 1
    state.LastRecored = 0
    state.searchTxt = ''
    MeditationApi(true)
  }
  const action_DetailsScreen = async (index, item) => {
    navigation.navigate('MeditationDetailesScreen', { meditationsData: state.meditationsList, index: index, isNotification: false })
  }


  const renderItem = ({ item, index }) => {
    return (
      <View style={{ marginBottom: 7 }}>
        <TouchableWithoutFeedback onPress={() => action_DetailsScreen(index, item)}>
          <View style={styles.listViewStyle}>
          <View style={styles.listImageStyle}>
          <FastImage
                source={importImages.defaultImg}
                style={[styles.listImageStyle,]}>
                <FastImage
                  source={{ uri: item.image }}
                  style={[styles.listImageStyle,]}></FastImage>
              </FastImage>
            </View>
            <Text style={styles.listTextStyle}>{item.name}</Text>
          </View>
        </TouchableWithoutFeedback>
      </View >
    )
  }

  const MeditationApi = async (values, param, checkfotter) => {
    const getallComplete = state.LastRecored == state.meditationsList.length ? false : true
    setState(oldState => ({
      ...oldState,
      isModalVisible: values,
      isModalFooterVisible: checkfotter ? checkfotter : getallComplete,
    }))
    let params = {
      page_no: param ? 1 : state.pagenumber,
      limit: 0,
      type: state.screentype,
      search: param ? param : ''
    }
    let response = await Request.post('meditation/list', params)
    if (response.status === 'SUCCESS') {
      if (param) {
        setState(oldState => ({
          ...oldState,
          meditationsList: response.data.meditations,
          isModalVisible: false,
          isModalFooterVisible: false,
          LastRecored: response.data.total_records,
          isRefresh: false,

        }))
      }
      else {
        setState(oldState => ({
          ...oldState,
          meditationsList: state.isRefresh ? response.data.meditations : JSFunctionUtils.uniqueArray(state.meditationsList, response.data.meditations, "meditation_id"),
          isModalVisible: false,
          isModalFooterVisible: false,
          LastRecored: response.data.total_records,
          isRefresh: false,
          pagenumber: response.data.total_records === state.meditationsList.length ? state.pagenumber : state.pagenumber + 1,

        }))
      }
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
  const getDeviceToken = async () => {
    const deviceToken = await StorageService.getItem(StorageService.STORAGE_KEYS.DEVICE_TOKEN);
    return deviceToken;
  }
  const getToken = async () => {
    const authToken = await StorageService.getItem(StorageService.STORAGE_KEYS.AUTH_TOKEN);
    if (authToken) {
      return "Bearer " + authToken;
    }
    else {
      return '@#Slsjpoq$S1o08#MnbAiB%UVUV&Y*5EU@exS1o!08L9TSlsjpo#FKDFJSDLFJSDLFJSDLFJSDQY';
      // default_auth_token
    }
  }
  const MeditationApiSearch = async (values, param, checkfotter) => {
    const getallComplete = state.LastRecored == state.meditationsList.length ? false : true
    setState(oldState => ({
      ...oldState,
      isModalVisible: values,
      isModalFooterVisible: checkfotter ? checkfotter : getallComplete,
    }))
    let params = {
      page_no: param ? 1 : state.pagenumber,
      limit: 0,
      type: state.screentype,
      search: param ? param : ''
    }
    if (typeof cancelToken != typeof undefined) {
      cancelToken.cancel("Operation canceled due to new request.")
    }
    cancelToken = axios.CancelToken.source()
    axios.post(`${apiConfigs.SERVER_API_URL}${'meditation/list'}`, params, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'language': 'en',
        'device_id': await getDeviceToken(),
        'device_type': Platform.OS === 'android' ? '1' : '2',
        'os': Platform.OS === 'android' ? 'android' : 'ios',
        'app_version': '1',
        'Authorization': await getToken(),
        'timezone': RNLocalize.getTimeZone(),
      },
      cancelToken: cancelToken.token

    })
      .then((responses) => {
        let response = responses.data
        if (response.status === 'SUCCESS') {
          if (param) {
            setState(oldState => ({
              ...oldState,
              meditationsList: response.data.meditations,
              isModalVisible: false,
              isModalFooterVisible: false,
              LastRecored: response.data.total_records,
              isRefresh: false,
            }))
          }
          else {
            setState(oldState => ({
              ...oldState,
              meditationsList: state.isRefresh ? response.data.meditations : JSFunctionUtils.uniqueArray(state.meditationsList, response.data.meditations, "meditation_id"),
              isModalVisible: false,
              isModalFooterVisible: false,
              LastRecored: response.data.total_records,
              isRefresh: false,
              pagenumber: response.data.total_records === state.meditationsList.length ? state.pagenumber : state.pagenumber + 1,
            }))
          }
        }
      })
      .catch((error) => {
        setState(oldState => ({
          ...oldState,
          isModalVisible: false,
          isModalFooterVisible: error.message == 'Operation canceled due to new request.' ? true : false
        }));

      })
   
   
  }
  const fetchMore = () => {
    const NotComplete = state.LastRecored != state.meditationsList.length ? true : false
    if (NotComplete) {
      if (state.searchTxt == '') {
        MeditationApi(false)
      }
    }
  };
  const onRefresh = () => {
    if (state.searchTxt == '') {
      state.meditationsList = []
      state.pagenumber = 1
      state.LastRecored = 0
      state.isRefresh = true
      MeditationApi(false)
    }

  }
  const handleSearch = (text) => {
    var text = text.trim();
    state.searchTxt = text
    state.meditationsList = text == '' ? [] : state.meditationsList
    state.pagenumber = text == '' ? 1 : state.pagenumber
    state.LastRecored = text == '' ? 0 : state.LastRecored
    searchFlag = text.length > 0 ? true : searchFlag
    if (searchFlag) {
      MeditationApiSearch(false, text, true)
      searchFlag = text.length == 0 ? false : searchFlag;
    }
  }
  const renderFooter = () => {
    return (
      //Footer View with Load More button
      <View style={styles.footer}>
        {state.isModalFooterVisible ?
          <ActivityIndicator color={colors.Blue} style={{ marginLeft: 8 }}
            size={'large'}
            hidesWhenStopped={true} />
          : null}
      </View>
    );
  }
  const action_event = (action) => {
    const trackEventparam = { action: action }
    trackEvent({ event: 'Meditations', trackEventparam })
  }
  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      {/* <Header
        headerTitle={'Meditations'}
        leftBtnOnPress={null}
        titleStyle={{ color: colors.Blue, fontSize: 28, fontFamily: fonts.rubikBold, marginLeft: 25 }}
        style={{ alignItems: 'center', justifyContent: 'flex-start' }}
      /> */}
      <Header
        leftBtnOnPress={() => {action_event('Menu Hamburger'),navigation.openDrawer()}}
        menu={true}
        leftBtnStyle={{
          shadowColor: colors.background,
          elevation: 5,
          shadowOffset: {
            width: 3,
            height: 2
          },
          shadowOpacity: 0.20,
          shadowRadius: 6,
        }}
        headerTitle={'Meditations'}
        titleStyle={styles.mainHeader}
      />
      {/* <Text style={styles.mainHeader}>{'Meditations'}</Text> */}
      <View style={{ width: deviceWidth - 45, alignSelf: 'center', }}>
        <TextField
          key={'Search'}
          placeholder={'Search'}
          ImageSrc={importImages.searchicons}
          isShowImg={true}
          inputRef={state.refSearch}
          onChangeText={(text) => handleSearch(text)}
          blurOnSubmit={true}
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.container}>
        <FlatList
          data={state.meditationsList}
          renderItem={renderItem}
          // bounces={false}
          onEndReachedThreshold={0.05}
          onEndReached={fetchMore}
          onRefresh={() => onRefresh()}
          refreshing={state.isRefresh}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (

            <Text style={stylesBackground.NodataStyle}>{state.isRefresh ? '' : state.isModalVisible || state.isModalFooterVisible ? '' : 'No data found'}</Text>
          )}
          contentContainerStyle={state.meditationsList.length > 0 ? {} : { flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}
          ListFooterComponent={renderFooter}

        />
      </View>
      {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}
    </View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: deviceWidth - 50,
    alignSelf: 'center',
    marginTop: 15

  },

  listViewStyle: {
    flexDirection: 'row',
    marginVertical: 13,

  },

  listImageStyle: {
    height: 105,
    width: 105,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listTextStyle: {
    fontFamily: fonts.rubikSemiBold,
    fontSize: 16,
    color: colors.Blue,
    marginLeft: 5,
    marginTop: 15,
    width: (deviceWidth + 50) / 2

  },
  mainHeader: {
    color: colors.Blue,
    fontSize: 26,
    fontFamily: fonts.rubikBold,
    marginLeft: 25,
    textTransform: 'capitalize'
  },
  footer: {
    height: hasNotch() ? 120 : 100,
  },
});


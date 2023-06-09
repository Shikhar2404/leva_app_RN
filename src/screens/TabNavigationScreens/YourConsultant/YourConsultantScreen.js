import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet,ActivityIndicator, TouchableOpacity, FlatList, } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth,  } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import Request from '../../../api/Request';
import BallIndicator from '../../../components/BallIndicator';
import JSFunctionUtils from '../../../utils/JSFunctionUtils';
import { trackEvent } from '../../../utils/tracking'
import FastImage from 'react-native-fast-image';
import { hasNotch } from 'react-native-device-info';
export default function YourConsultantScreen({ route, navigation }) {
  const [state, setState] = useState({
    ConsultantData: [],
    isModalVisible: false,
    isModalFooterVisible: false,
    isRefresh: false,
    pagenumber: 1,
    LastRecored: 0,
    arrayholder: [],
  })

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      ConsultantActionAPI(true)
    });
    return unsubscribe;
  }, []);

  const ConsultantActionAPI = async (values) => {
    const getallComplete = state.LastRecored == state.ConsultantData.length ? false : true
    setState(oldState => ({
      ...oldState,
      isModalVisible: values,
      isModalFooterVisible: state.isRefresh ? false : getallComplete
    }));
    let params = {
      page_no: state.pagenumber,
      limit: 10,
    }
    let response = await Request.post('consultant/list', params)
    if (response.status === "SUCCESS") {
      setState(oldState => ({
        ...oldState,
        isModalVisible: false,
        pagenumber: response.data.list.total_record === state.ConsultantData.length ? state.pagenumber : state.pagenumber + 1,
        ConsultantData: state.isRefresh ? response.data.list : JSFunctionUtils.uniqueArray(state.ConsultantData, response.data.list, "consultant_id"),
        arrayholder: state.isRefresh ? response.data.list : JSFunctionUtils.uniqueArray(state.arrayholder, response.data.list, "consultant_id"),
        isRefresh: false,
        isModalFooterVisible: false,
        LastRecored: response.data.list.total_record
      }));
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

  const renderFooter = () => {
    return (
      <View style={styles.footer}>
        {state.isModalFooterVisible ?
          <ActivityIndicator color={colors.Blue} style={{ marginLeft: 8 }}
            size={'large'}
            hidesWhenStopped={true} />
          : null}
      </View>
    );
  }

  const onRefresh = () => {
    state.pagenumber = 1
    state.LastRecored = 0
    state.isRefresh = true
    ConsultantActionAPI(false)

  }

  const fetchMore = () => {
    const NotComplete = state.LastRecored != state.ConsultantData.length ? true : false
    if (NotComplete) {
      ConsultantActionAPI(false)
    }
  };


  const handleSearch = (text) => {
    const newData = state.arrayholder.filter(function (item) {
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    setState(oldState => ({
      ...oldState,
      ConsultantData: newData,
    }));
  }
  const clickScheduleCall = (item) => {
    const trackEventparam = { action: 'Schedule Video Call', name: item.name, price: item.price }
    trackEvent({ event: 'Find_Your_Consultant', trackEventparam });
    navigation.navigate('BookConsultantScreen', { data: item })

  }

  const renderItemConsultant = ({ item, index }) => {
    return (
      <View style={styles.innerContainerStyle}>
        <View style={{ flexDirection: 'row', margin: 15, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ width: '40%', justifyContent: 'center', alignItems: 'center' }}>
            <FastImage source={{ uri: item.image }} style={styles.imageperson} ></FastImage>
            <Text style={styles.priceStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{item.price}</Text>
          </View>
          <View style={{ width: '55%', }}>
            <Text style={styles.nameStyle} adjustsFontSizeToFit={true}>{item.name}</Text>
            <Text style={styles.textAdreesStyle} numberOfLines={3}>{item.address + ' Consultant'}</Text>
            <TouchableOpacity style={styles.learnButtonStyle} onPress={() => {
              const trackEventparam = { action: 'Learn More', name: item.name, price: item.price }
              trackEvent({ event: 'Find_Your_Consultant', trackEventparam }), navigation.navigate('AboutConsultantScreen', { data: item })
            }}>
              <Text style={styles.learnTextStyle}>{'Learn More'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.scheduleButtonStyle} onPress={() => clickScheduleCall(item)}>
              <Text style={styles.shedulTextStyle}>{'Schedule Video Call'}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

    )
  }
  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      {/* <Header
        headerTitle={'Find Your Consultant'}
        leftBtnOnPress={null}
        titleStyle={{ color: colors.Blue, fontSize: 30, fontFamily: fonts.rubikBold, marginLeft: 25 }}
        style={{ alignItems: 'center', justifyContent: 'flex-start' }}
      /> */}
      <Header
        leftBtnOnPress={() => {
          const trackEventparam = { action: 'Menu Hamburger' }
          trackEvent({ event: 'Find_Your_Consultant', trackEventparam })
          navigation.openDrawer()
        }}
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
        titleStyle={{ color: colors.background }}
      />
      <Text style={styles.mainHeader} adjustsFontSizeToFit={true} numberOfLines={1}>{'Find Your Consultant'}</Text>

      <View style={styles.container}>
        {/* <View style={{ width: deviceWidth - 45, alignSelf: 'center' }}>
          <TextField
            key={'Search'}
            ref={null}
            placeholder={'Search For a Lactation Consultant'}
            ImageSrc={importImages.searchicons}
            isShowImg={true}
            onChangeText={(text) => handleSearch(text)}
            blurOnSubmit={true}
            autoCapitalize={'none'}
          />
        </View> */}
        <FlatList
          data={state.ConsultantData}
          renderItem={renderItemConsultant}
          showsVerticalScrollIndicator={false}
          onRefresh={() => onRefresh()}
          keyboardShouldPersistTaps={'handled'}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.07}
          onEndReached={fetchMore}
          ListFooterComponent={renderFooter}
          refreshing={state.isRefresh}
          ListEmptyComponent={() => (
            <Text style={stylesBackground.NodataStyle}>{state.isModalVisible ? '' : 'No data found'}</Text>
          )}
          contentContainerStyle={state.ConsultantData.length > 0 ? { justifyContent: 'center', alignItems: 'center', } : { flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}
        />

      </View>
      {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15

  },
  scheduleButtonStyle: {
    marginTop: 10,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.Blue,
    justifyContent: 'center',
    alignItems: 'center'
  },
  shedulTextStyle: {
    fontFamily: fonts.rubikRegular,
    fontSize: 12,
    color: colors.White,
  },
  learnButtonStyle: {
    marginTop: 10,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: colors.Blue,
    justifyContent: 'center',
    alignItems: 'center'
  },
  learnTextStyle: {
    fontFamily: fonts.rubikRegular,
    fontSize: 12,
    color: colors.Blue,
    alignSelf: 'center',
  },
  noDataStyle: {
    color: colors.Blue,
    fontFamily: fonts.rubikBold,
    fontSize: 30,
  },
  innerContainerStyle: {
    backgroundColor: colors.White,
    width: deviceWidth - 45,
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.Blue,
  },
  textAdreesStyle: {
    color: colors.Blue,
    fontFamily: fonts.rubikRegular,
    fontSize: 12,
    height: 47
  },
  nameStyle: {
    color: colors.Blue,
    fontFamily: fonts.rubikBold,
    fontSize: 16
  },
  priceStyle: {
    color: colors.Blue,
    fontFamily: fonts.rubikBold,
    fontSize: 20,
    marginTop: 13,
  },
  imageperson: {
    width: '100%',
    height: 150,
    borderRadius: 18,
  },
  footer: {
    height: hasNotch() ? 120 : 100,
  },
  mainHeader: {
    color: colors.Blue,
    fontSize: 28,
    fontFamily: fonts.rubikBold,
    marginLeft: 25,
    textTransform: 'capitalize'
  },
});

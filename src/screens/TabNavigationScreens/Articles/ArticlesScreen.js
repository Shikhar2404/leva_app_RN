import React, { useState, useEffect, useRef, } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, FlatList, ActivityIndicator } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import Request from '../../../api/Request';
import BallIndicator from '../../../components/BallIndicator';
import { deviceWidth } from '../../../constants';
import JSFunctionUtils from '../../../utils/JSFunctionUtils';
import { useNavigation } from '@react-navigation/native';
import StorageService from '../../../utils/StorageService';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import { trackEvent } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';
import { hasNotch } from 'react-native-device-info';
import TextField from '../../../components/TextField';
import axios from 'axios';
import apiConfigs from '../../../api/apiConfig';
var searchFlag = false
import * as RNLocalize from "react-native-localize";
import { Platform } from 'react-native';
let cancelToken

export default function ArticlesScreen({ route, navigation }) {
  const navigations = useNavigation()
  const [state, setState] = useState({
    articleList: [],
    isModalVisible: false,
    isModalFooterVisible: false,
    pagenumber: 1,
    LastRecored: 0,
    isRefresh: false,
    screentype: '1',
    milestone_id: '',
    searchTxt: '',
    refSearch: useRef(),

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
  /**Get the device token */
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
  const getData = async () => {
    state.refSearch.current.clear()
    state.articleList = []
    var data = await StorageService.getItem('clickArticle')
    var milestone_id = await StorageService.getItem('clickArticleMiId')
    state.milestone_id = milestone_id != null ? milestone_id : ''
    state.screentype = data != null ? data : '1'
    state.pagenumber = 1
    state.LastRecored = 0
    state.searchTxt = ''
    await articleApi(true)
  }
  const click_Article = (item) => {
  

    navigation.navigate('ArticlesDetailesScreen', { id: item.article_id })
  }
  const renderItem = ({ item, index }) => {
    return (
      <View style={{ marginBottom: 7, }}>
        <TouchableWithoutFeedback onPress={() => click_Article(item)}>
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
        </TouchableWithoutFeedback >
      </View >
    )
  }

  const articleApi = async (values, param, checkfotter) => {
    const id = await StorageService.getItem('child_id')
    const getallComplete = state.LastRecored == state.articleList.length ? false : true
    setState(oldState => ({
      ...oldState,
      isModalVisible: values,
      isModalFooterVisible: checkfotter ? checkfotter : getallComplete,
    }))
  
    let params = {
      milestone_id: state.milestone_id,
      page_no: param ? 1 : state.pagenumber,
      limit: 10,
      type: state.screentype,
      search: param ? param : '',
      child_id: id != null ? id : ''
    }
    let response = await Request.post('article/list', params)
    if (response.status === 'SUCCESS') {
      if (param) {
        setState(oldState => ({
          ...oldState,
          articleList: response.data.articles,
          isModalVisible: false,
          screentype: state.screentype,
          isModalFooterVisible: false,
          LastRecored: response.data.total_records,
          isRefresh: false,
        }))
      }
      else {
        setState(oldState => ({
          ...oldState,
          articleList: state.isRefresh ? response.data.articles : JSFunctionUtils.uniqueArray(state.articleList, response.data.articles, "article_id"),
          isModalVisible: false,
          screentype: state.screentype,
          isModalFooterVisible: false,
          LastRecored: response.data.total_records,
          isRefresh: false,
          pagenumber: response.data.total_records === state.articleList.length ? state.pagenumber : state.pagenumber + 1,
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
  const action_event = (action) => {
    const trackEventparam = { action: action }
    trackEvent({ event: 'Articles', trackEventparam })
  }
  const articleApiSearch = async (values, param, checkfotter) => {
    const id = await StorageService.getItem('child_id')
    setState(oldState => ({
      ...oldState,
      isModalVisible: values,
      isModalFooterVisible: checkfotter,
    }))
  
    let params = {
      milestone_id: state.milestone_id,
      page_no: param ? 1 : state.pagenumber,
      limit: 10,
      type: state.screentype,
      search: param ? param : '',
      child_id: id != null ? id : ''
    }
    if (typeof cancelToken != typeof undefined) {
      cancelToken.cancel("Operation canceled due to new request.")
    }
    cancelToken = axios.CancelToken.source()
    axios.post(`${apiConfigs.SERVER_API_URL}${'article/list'}`, params, {
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
              articleList: response.data.articles,
              isModalVisible: false,
              screentype: state.screentype,
              isModalFooterVisible: false,
              LastRecored: response.data.total_records,
            }))
          }
          else {
            setState(oldState => ({
              ...oldState,
              articleList: state.isRefresh ? response.data.articles : JSFunctionUtils.uniqueArray(state.articleList, response.data.articles, "article_id"),
              isModalVisible: false,
              screentype: state.screentype,
              isModalFooterVisible: false,
              LastRecored: response.data.total_records,
              pagenumber: response.data.total_records === state.articleList.length ? state.pagenumber : state.pagenumber + 1,
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

  const handleSearch = async (text) => {
    var text = text.trim();
    state.searchTxt = text
    state.articleList = text == '' ? [] : state.articleList
    state.pagenumber = text == '' ? 1 : state.pagenumber
    state.LastRecored = text == '' ? 0 : state.LastRecored
    searchFlag = text.length > 0 ? true : searchFlag
    if (searchFlag) {

      await articleApiSearch(false, text, true)
      searchFlag = text.length == 0 ? false : searchFlag;
    }
  }
  const onRefresh = async () => {
    if (state.searchTxt == '') {
      state.articleList = []
      state.pagenumber = 1
      state.LastRecored = 0
      state.isRefresh = true
      await articleApi(false)
    }

  }
  const fetchMore = async () => {
    const NotComplete = state.LastRecored != state.articleList.length ? true : false
    if (NotComplete) {
      if (state.searchTxt == '') {
        await articleApi(false)
      }
    }
  };
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
  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
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
        headerTitle={'Articles'}
        titleStyle={styles.mainHeader}
      />
      <View style={{ width: deviceWidth - 45, alignSelf: 'center', }}>

        <TextField
          key={'Search'}
          inputRef={state.refSearch}
          placeholder={'Search'}
          ImageSrc={importImages.searchicons}
          isShowImg={true}
          onChangeText={(text) => handleSearch(text)}
          blurOnSubmit={true}
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.container}>
        <FlatList
          data={state.articleList}
          renderItem={renderItem}
          onEndReachedThreshold={0.07}
          onEndReached={fetchMore}
          onRefresh={() => onRefresh()}
          refreshing={state.isRefresh}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={stylesBackground.NodataStyle}>{state.isRefresh ? '' : state.isModalVisible || state.isModalFooterVisible ? '' : 'No data found'}</Text>
          )}
          contentContainerStyle={state.articleList.length > 0 ? {} : { flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}
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
    marginTop: 5
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
  mainHeader: {
    color: colors.Blue,
    fontSize: 26,
    fontFamily: fonts.rubikBold,
    marginLeft: 25,
    textTransform: 'capitalize'
  },

  listTextStyle: {
    fontFamily: fonts.rubikSemiBold,
    fontSize: 16,
    color: colors.Blue,
    marginLeft: 5,
    marginTop: 15,
    width: (deviceWidth + 50) / 2

  },
  footer: {
    height: hasNotch() ? 120 : 100,
  },

});


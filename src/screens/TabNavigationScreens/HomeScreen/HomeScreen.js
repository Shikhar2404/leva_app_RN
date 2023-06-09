import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, FlatList, BackHandler, TouchableOpacity, ScrollView, Modal, SafeAreaView, Platform } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import StorageService from '../../../utils/StorageService';
import BallIndicator from '../../../components/BallIndicator';
import Request from '../../../api/Request';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import Tooltip from 'react-native-walkthrough-tooltip';
import { trackEvent } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';
import { hasNotch } from 'react-native-device-info';
import { getAvailablePurchases } from 'react-native-iap';
import NetInfo from "@react-native-community/netinfo";
import SubscriptionModalView from '../../../components/SubscriptionModalView'
import apiConfigs from '../../../api/apiConfig';
import Share from 'react-native-share';
export default function HomeScreen({ route, navigation }) {

  const [state, setState] = useState({
    HomeDataList: [],
    isModalVisible: false,
    child_id: '',
    charthome: '',
    isToolTip: false,
    isToolTip1: false,
    isToolTip2: false,
    isToolTip3: false,
    isSubscribe: false,
    sub_message: '',
    sub_title: '',
    button_text: '',

  })

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setState(oldState => ({
        ...oldState,
        isSubscribe: false,
      }));
      const charthomed = await StorageService.getItem('charthome')
      state.charthome = charthomed != null ? charthomed : ''
      await StorageService.clearHome()
      if (charthomed != false) {
        await checkSubscriptionValidate()
        await AllDetailsHomeApi()
      }
    });
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      goBackNav1
    );
    return () => { unsubscribe, backHandler.remove() };
  }, []);
  const goBackNav1 = () => {
    /**
     * Returning false will let the event to bubble up & let other event listeners
     * or the system's default back action to be executed.
     */
    return false;
  }
  const AllDetailsHomeApi = async () => {
    const id = await StorageService.getItem('child_id')

    setState(oldState => ({
      ...oldState,
      isModalVisible: true,
      charthome: state.charthome
    }))
    let params = {
      child_id: id != null ? id : ''
    }
    let response = await Request.post('Home', params)
    if (response.status === 'SUCCESS') {
      await StorageService.saveItem('child_id', response.data[0].child.child_id)
      await StorageService.saveItem('childbate', response.data[0].child.dob)
      const checkdata = await StorageService.getItem('signup')
      await StorageService.saveItem('signup', false)
      await StorageService.saveItem('is_water_allow', response.data[0].child.is_water_allow)

      setState(oldState => ({
        ...oldState,
        HomeDataList: response.data,
        isModalVisible: false,
        isToolTip: checkdata ? response.data[0].child.dob ? true : false : false
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
  const checkSubscriptionValidate = async () => {
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        setState(oldState => ({ ...oldState, isModalVisible: true }))
        const purchaseData = await StorageService.getItem(StorageService.STORAGE_KEYS.PURCHASE_DATA);
        if (purchaseData) {
          validateReceiptApi(purchaseData)
        }
        else {
          onGetPurchasesData()
        }
      }
      else {
        showSimpleAlert(ConstantsText.noNetworkAlert)
      }
    })

  }
  const onClickShare = async () => {
    const trackEventparam = { name: state.HomeDataList[0].child.name + "’s Tracking", action: state.HomeDataList[0].child.content, DOB: state.HomeDataList[0].child.age_text }
    trackEvent({ event: 'Home_Child_Info_Share', trackEventparam })
    const title = state.HomeDataList[0].child.name + "’s Tracking"
    const message = state.HomeDataList[0].child.content
    let options = Platform.select({
      default: {
        title: title,
        message: message,
      }
    });
    try {
      await Share.open(options);
    } catch (err) {
    }
  }
  const validateReceiptApi = async (data) => {
    let params = {}
    if (data) {
      await StorageService.saveItem(StorageService.STORAGE_KEYS.PURCHASE_DATA, data);
      params = { product_id: data.productId, token: Platform.OS == 'ios' ? data.transactionReceipt : data.purchaseToken }

    }

    let response = await Request.post('subscription', params)
    if (response.status === 'SUCCESS') {
      if (!response.data.is_expired) {
        await StorageService.saveItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED, '1');
      }
      else {
        /** if subscription expired then remove purchase data */
        await StorageService.deleteItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED);
        await StorageService.deleteItem(StorageService.STORAGE_KEYS.PURCHASE_DATA);
      }
    }
    else {
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const articleFavApi = async (article_id, item, index) => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true
    }))
    let params = {
      article_id: article_id
    }
    let response = await Request.post('user/like-unlike-article', params)
    setState(oldState => ({
      ...oldState,
      isModalVisible: false,
    }))
    if (response.status === 'SUCCESS') {
      if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
        setState(oldState => ({
          ...oldState,
          sub_title: response.title,
          sub_message: response.message,
          button_text: response.button_text,
          isSubscribe: true
        }))
      } else {
        const trackEventparam = { name: item.name, Like: response.data.isLike }
        trackEvent({ event: 'Favorite_Article', trackEventparam })
        state.HomeDataList[1].articles[index].isLike = response.data.isLike
        setState(oldState => ({
          ...oldState,
        }))
      }
    }
    else {
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const meditationFavApi = async (meditation_id, item, index) => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true
    }))
    let params = {
      meditation_id: meditation_id
    }
    let response = await Request.post('user/like-unlike-meditation', params)
    setState(oldState => ({
      ...oldState,
      isModalVisible: false,
    }))
    if (response.status === 'SUCCESS') {
      if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
        setState(oldState => ({
          ...oldState,
          sub_title: response.title,
          sub_message: response.message,
          button_text: response.button_text,
          isSubscribe: true
        }))
      } else {
        const trackEventparam = { name: item.name, Like: response.data.isLike }
        trackEvent({ event: 'Favorite_Meditation', trackEventparam })
        state.HomeDataList[2].meditations[index].isLike = response.data.isLike
        setState(oldState => ({
          ...oldState,
        }))
      }

    }
    else {
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const videoFavApi = async (video_id, item, index) => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true
    }))
    let params = {
      video_id: video_id
    }
    let response = await Request.post('user/like-unlike-video', params)
    setState(oldState => ({
      ...oldState,
      isModalVisible: false,
    }));
    if (response.status === 'SUCCESS') {
      if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
        setState(oldState => ({
          ...oldState,
          isModalVisible: false,
          sub_title: response.title,
          sub_message: response.message,
          button_text: response.button_text,
          isSubscribe: true
        }))
      } else {
        const trackEventparam = { name: item.name, Like: response.data.isLike }
        trackEvent({ event: 'Favorite_Video', trackEventparam })
        state.HomeDataList[3].videos[index].isLike = response.data.isLike
        setState(oldState => ({
          ...oldState,

        }))
      }
    }
    else {

      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const onGetPurchasesData = async () => {
    const Purchases = await getAvailablePurchases()
    if (Purchases && Purchases.length > 0) {
      const sortedAvailablePurchases = Purchases.sort(
        (a, b) => b.transactionDate - a.transactionDate
      );
      validateReceiptApi(Platform.OS == 'android' ? Purchases[0] : sortedAvailablePurchases[0])
    }
    else {
      validateReceiptApi()

    }
  }
  const articlesRecommendedRenderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback onPress={() => navigation.navigate('ArticlesDetailesScreen', { id: item.article_id })}>
        <View style={{ marginStart: index == 0 ? 10 : 0, marginEnd: index == state.HomeDataList[1].articles.length - 1 ? 10 : 0 }}>
          <View style={styles.listViewStyle}>
            <View style={{ margin: 15 }}>
              <FastImage
                source={importImages.defaultImg1}
                style={styles.listImageStyle}>
                <FastImage
                  source={{ uri: item.image }}
                  style={styles.listImageStyle}
                ></FastImage>
              </FastImage>
            </View>
            <TouchableOpacity style={styles.listHeartStyle} onPress={() => articleFavApi(item.article_id, item, index)}>
              <FastImage source={item.isLike ? importImages.heartIcon : importImages.likeIcon} style={{ height: 30, width: 30 }} />
            </TouchableOpacity>
            <Text style={styles.listTextStyle} numberOfLines={2}>{item.name}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  const meditationRenderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback onPress={() => navigation.navigate('MeditationDetailesScreen', { meditationsData: state.HomeDataList[2].meditations, index: index, isNotification: false })}>
        <View style={{ marginStart: index == 0 ? 10 : 0, marginEnd: index == state.HomeDataList[2].meditations.length - 1 ? 10 : 0 }}>
          <View style={styles.listViewStyle}>
            <View style={{ margin: 15 }}>
              <FastImage
                source={importImages.defaultImg1}
                style={styles.listImageStyle}>
                <FastImage
                  source={{ uri: item.image }}
                  style={styles.listImageStyle}
                ></FastImage>
              </FastImage>
            </View>
            <TouchableOpacity style={styles.listHeartStyle} onPress={() => meditationFavApi(item.meditation_id, item, index)}>
              <FastImage source={item.isLike ? importImages.heartIcon : importImages.likeIcon} style={{ height: 30, width: 30 }} />
            </TouchableOpacity>

            <Text style={styles.listTextStyle} numberOfLines={2}>{item.name}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
  const videoRenderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback onPress={() => navigation.navigate('VideoDetailesScreen', { id: item.video_id })}>
        <View style={{ marginStart: index == 0 ? 10 : 0, marginEnd: index == state.HomeDataList[3].videos.length - 1 ? 10 : 0 }}>
          <View style={styles.listViewStyle}>
            <View style={{ margin: 15 }}>
              <FastImage style={[styles.listImageStyle, { backgroundColor: colors.Lightgray }]} source={{ uri: item.image }} />

              <View style={{
                position: 'absolute', height: 114,
                width: 187,
                margin: 15,
                alignItems: 'center', justifyContent: 'center'
              }}>
                <FastImage source={importImages.mplayicon} style={{ height: 40, width: 40, }} />

              </View>
            </View>
            <TouchableOpacity style={styles.listHeartStyle} onPress={() => videoFavApi(item.video_id, item, index)}>
              <FastImage source={item.isLike ? importImages.heartIcon : importImages.likeIcon} style={{ height: 30, width: 30 }} />
            </TouchableOpacity>

            <Text style={styles.listTextStyle} numberOfLines={2}>{item.name}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
  const goDetailsScreeen = async (item) => {
    navigation.navigate('AppoinmentsDetailsScreen', { data: item })
  }
  const renderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback onPress={() => goDetailsScreeen(item)}>
        <View style={{ backgroundColor: colors.White, borderRadius: 15, borderWidth: 1, borderColor: '#E9E9E9', flex: 1, marginTop: 30, width: deviceWidth - 40, alignSelf: 'center' }}>
          <View style={{ flexDirection: 'row', margin: 11, width: deviceWidth - 50, flex: 1 }}>
            <View style={{ width: '25%', alignItems: 'flex-end' }}>
              <FastImage source={{ uri: item.consultant_image }} style={{ height: 60, width: 60, borderRadius: 60 / 2, marginEnd: 10 }} />
            </View>
            <View style={{ width: '75%' }}>
              <Text style={{ color: colors.Blue, fontFamily: fonts.rubikSemiBold, fontSize: 18 }}>{'Upcoming ' + item.consultant_address + ' Consultant: ' + item.consultant_name}</Text>
              <Text style={{ color: '#00172E', fontFamily: fonts.rubikRegular, fontSize: 16, marginTop: 11, opacity: 0.5 }}>{'Date: ' + item.event_date}</Text>
              <Text style={{ color: '#00172E', fontFamily: fonts.rubikRegular, fontSize: 16, marginTop: 11, opacity: 0.5 }}>{'Time: ' + item.event_time}</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
  const click_Article = async () => {
    action_event('Home', 'Articles See All')
    await StorageService.saveItem('clickArticle', '1')
    navigation.navigate('ArticlesScreen')

  }
  const goChildProfile = async () => {
    navigation.navigate('ChildProfileScreen')
  }


  const click_meditation = async () => {
    action_event('Home', 'Meditations See All')
    await StorageService.saveItem('clickMeditation', '1')
    navigation.navigate('MeditationScreen')
  }
  const action_event = (type, action) => {
    const trackEventparam = { action: action }
    trackEvent({ event: type, trackEventparam })
  }
  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      <Header
        // headerTitle={'Jasmin’s Tracking:'}
        leftBtnOnPress={() => { action_event('Home','Hamburger'), navigation.openDrawer()}}

        menu={true}
        headerTitle={state.HomeDataList.length > 0 ? 'Welcome, ' + state.HomeDataList[0].child.user_name : ''}
        titleStyle={{ color: colors.Blue, fontFamily: fonts.rubikRegular, fontSize: 16 }}
      />
      {state.HomeDataList.length > 0 ?
        <View>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={{}}>
            {state.HomeDataList[0].child.dob ?
              <View style={styles.serviceTabViewStyle}>


                <Text style={styles.servicesHeadingTextStyle}>{state.HomeDataList[0].child.name + "’s Tracking"}</Text>

                <View style={styles.servicesViewStyle}>
                  <View style={styles.servicesSubViewStyle}>
                    <Tooltip
                      backgroundColor={"rgba(0,0,0,0)"}
                      allowChildInteraction={false}
                      isVisible={state.isToolTip}
                      contentStyle={{ width: deviceWidth / 1.7, borderRadius: 10, marginStart: -10, padding: 0 }}
                      content={
                        <View style={{ width: '100%', marginTop: 20, }}>
                          <View style={{ marginStart: 16, marginEnd: 16 }}>
                            <Text style={{ fontSize: 15, fontFamily: fonts.rubikMedium, color: colors.Blue }}>{'Explore Nursing:'}</Text>
                            <Text style={{ fontSize: 12, fontFamily: fonts.rubikRegular, color: colors.Blue, opacity: 0.5, marginTop: 10 }}>{'Track your nursing, including when and how long your baby feeds, when to nurse next and which breast to use first.'}</Text>
                          </View>
                          <View style={{ marginTop: 26, borderTopColor: colors.Blue, height: 43, flexDirection: 'row', justifyContent: 'space-between', }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row', width: '100%', }}>
                              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 0.65 }}>
                                <Text style={{ fontSize: 14, fontFamily: fonts.rubikRegular, color: colors.Blue, opacity: 0.5 }}>{'Back'}</Text>
                              </View>
                              <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                              </View>
                            </View>
                            <TouchableWithoutFeedback onPress={() => { action_event('Explore_Nursing', 'Next'), setState(oldState => ({ ...oldState, isToolTip1: true, isToolTip: false, })) }}>
                              <View style={{ backgroundColor: colors.Darkpink, justifyContent: 'center', alignItems: 'center', flex: 0.5 }}>
                                <Text style={{ fontSize: 14, fontFamily: fonts.rubikRegular, color: colors.White, }}>{'Next'}</Text>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </View>
                      }
                      placement="bottom"
                    >
                      <TouchableOpacity onPress={() => {
                        action_event('Home', 'Nursing')
                        navigation.navigate('NursingScreen')
                      }} style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <FastImage source={importImages.nursingHomeIcon} style={{ height: 58, width: 58 }}></FastImage>
                        <Text style={styles.serviceTextStyle}>{'nursing'}</Text>
                      </TouchableOpacity>
                    </Tooltip>
                  </View>
                  <View style={styles.servicesSubViewStyle}>
                    <Tooltip
                      backgroundColor={"rgba(0,0,0,0)"}
                      allowChildInteraction={false}
                      isVisible={state.isToolTip1}
                      contentStyle={{ width: deviceWidth / 1.7, borderRadius: 10, marginStart: -10, padding: 0 }}
                      content={
                        <View style={{ width: '100%', marginTop: 20, }}>
                          <View style={{ marginStart: 16, marginEnd: 16 }}>
                            <Text style={{ fontSize: 15, fontFamily: fonts.rubikMedium, color: colors.Blue }}>{'Explore Pumping:'}</Text>
                            <Text style={{ fontSize: 12, fontFamily: fonts.rubikRegular, color: colors.Blue, opacity: 0.5, marginTop: 10 }}>{'Log your pumping - track the start time, duration, output, notes for pumping sessions, and review your stats on the graph.'}</Text>
                          </View>
                          <View style={{ marginTop: 26, borderTopColor: colors.Blue, height: 43, flexDirection: 'row', justifyContent: 'space-between', }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row', width: '100%', }}>
                              <TouchableWithoutFeedback onPress={() => { action_event('Explore_Pumping', 'Back'), setState(oldState => ({ ...oldState, isToolTip1: false, isToolTip: true, })) }}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 0.65 }}>
                                  <Text style={{ fontSize: 14, fontFamily: fonts.rubikRegular, color: colors.Blue }}>{'Back'}</Text>
                                </View>
                              </TouchableWithoutFeedback>
                              <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                              </View>
                            </View>
                            <TouchableWithoutFeedback onPress={() => { action_event('Explore_Pumping', 'Next'), setState(oldState => ({ ...oldState, isToolTip1: false, isToolTip2: true, })) }}>
                              <View style={{ backgroundColor: colors.Darkpink, justifyContent: 'center', alignItems: 'center', flex: 0.5 }}>
                                <Text style={{ fontSize: 14, fontFamily: fonts.rubikRegular, color: colors.White, }}>{'Next'}</Text>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </View>
                      }
                      placement="bottom"
                    >
                      <TouchableOpacity onPress={() => {
                        action_event('Home', 'Pumping')
                        navigation.navigate('PumpingScreen')
                      }} style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <FastImage source={importImages.pumpingHomeIcon} style={{ width: 58, height: 58 }}></FastImage>
                        <Text style={styles.serviceTextStyle}>{'pumping'}</Text>
                      </TouchableOpacity>
                    </Tooltip>
                  </View>
                  <View style={styles.servicesSubViewStyle}>
                    <Tooltip
                      backgroundColor={"rgba(0,0,0,0)"}
                      allowChildInteraction={false}
                      isVisible={state.isToolTip2}
                      contentStyle={{ width: deviceWidth / 1.7, borderRadius: 10, marginStart: -10, padding: 0 }}
                      content={
                        <View style={{ width: '100%', marginTop: 20, }}>
                          <View style={{ marginStart: 16, marginEnd: 16 }}>
                            <Text style={{ fontSize: 15, fontFamily: fonts.rubikMedium, color: colors.Blue }}>{'Explore Bottle:'}</Text>
                            <Text style={{ fontSize: 12, fontFamily: fonts.rubikRegular, color: colors.Blue, opacity: 0.5, marginTop: 10 }}>{'Record your bottle feeds, including when your baby last fed, how much they drink, and their total daily volumes.'}</Text>
                          </View>
                          <View style={{ marginTop: 26, borderTopColor: colors.Blue, height: 43, flexDirection: 'row', justifyContent: 'space-between', }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row', width: '100%', }}>
                              <TouchableWithoutFeedback onPress={() => { action_event('Explore_Bottle', 'Back'), setState(oldState => ({ ...oldState, isToolTip2: false, isToolTip1: true, })) }}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 0.65 }}>
                                  <Text style={{ fontSize: 14, fontFamily: fonts.rubikRegular, color: colors.Blue }}>{'Back'}</Text>
                                </View>
                              </TouchableWithoutFeedback>
                              <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue, opacity: 0.5 }}></View>
                              </View>
                            </View>
                            <TouchableWithoutFeedback onPress={() => { action_event('Explore_Bottle', 'Next'), setState(oldState => ({ ...oldState, isToolTip2: false, isToolTip3: true, })) }}>
                              <View style={{ backgroundColor: colors.Darkpink, justifyContent: 'center', alignItems: 'center', flex: 0.5 }}>
                                <Text style={{ fontSize: 14, fontFamily: fonts.rubikRegular, color: colors.White, }}>{'Next'}</Text>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </View>
                      }
                      placement="bottom"
                    >
                      <TouchableOpacity onPress={() => {
                        action_event('Home', 'Bottle')
                        navigation.navigate('BottleScreen')
                      }} style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <FastImage source={importImages.bottleHomeIcon} style={{ height: 58, width: 58 }}></FastImage>
                        <Text style={styles.serviceTextStyle}>{'bottle'}</Text>
                      </TouchableOpacity>
                    </Tooltip>
                  </View>
                  <View style={styles.servicesSubViewStyle}>
                    <Tooltip
                      backgroundColor={"rgba(0,0,0,0)"}
                      allowChildInteraction={false}
                      isVisible={state.isToolTip3}
                      contentStyle={{ width: deviceWidth / 1.7, borderRadius: 10, marginStart: -10, padding: 0 }}
                      content={
                        <View style={{ width: '100%', marginTop: 20, }}>
                          <View style={{ marginStart: 16, marginEnd: 16 }}>
                            <Text style={{ fontSize: 15, fontFamily: fonts.rubikMedium, color: colors.Blue }}>{'Explore Diaper:'}</Text>
                            <Text style={{ fontSize: 12, fontFamily: fonts.rubikRegular, color: colors.Blue, opacity: 0.5, marginTop: 10 }}>{"Track your baby's diapers, including how many wet and dirty diapers they produce a day, and the color and consistency of their stools."}</Text>
                          </View>
                          <View style={{ marginTop: 26, borderTopColor: colors.Blue, height: 43, flexDirection: 'row', justifyContent: 'space-between', }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row', width: '100%', }}>
                              <TouchableWithoutFeedback onPress={() => { action_event('Explore_Diaper', 'Back'), setState(oldState => ({ ...oldState, isToolTip3: false, isToolTip2: true, })) }}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 0.65 }}>
                                  <Text style={{ fontSize: 14, fontFamily: fonts.rubikRegular, color: colors.Blue }}>{'Back'}</Text>
                                </View>
                              </TouchableWithoutFeedback>
                              <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: '22%', height: 1, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                                <View style={{ width: 5, height: 5, borderRadius: 5 / 2, backgroundColor: colors.Blue }}></View>
                              </View>
                            </View>
                            <TouchableWithoutFeedback onPress={() => { action_event('Explore_Diaper', 'Finish'), setState(oldState => ({ ...oldState, isToolTip3: false, })) }}>
                              <View style={{ backgroundColor: colors.Darkpink, justifyContent: 'center', alignItems: 'center', flex: 0.5 }}>
                                <Text style={{ fontSize: 14, fontFamily: fonts.rubikRegular, color: colors.White, }}>{'Finish'}</Text>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </View>
                      }
                      placement="bottom"
                    >
                      <TouchableOpacity onPress={() => {
                        action_event('Home', 'Diaper')
                        navigation.navigate('DiaperScreen')
                      }} style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <FastImage source={importImages.diaperHomeIcon} style={{ height: 58, width: 58 }}></FastImage>
                        <Text style={styles.serviceTextStyle}>{'diaper'}</Text>
                      </TouchableOpacity>
                    </Tooltip>
                  </View>

                </View>
                <View style={styles.serviceProfileViewStyle}>
                  <TouchableWithoutFeedback onPress={() => goChildProfile()}>
                    <View style={{ borderWidth: 8, borderRadius: 40, borderColor: colors.Purple, }}>
                      <View style={styles.serviceImageStyle}>
                        <FastImage
                          source={importImages.appicon}
                          style={[styles.serviceImageStyle]}>
                          <FastImage
                            source={{ uri: state.HomeDataList[0].child.image }}
                            style={[styles.serviceImageStyle]}
                          ></FastImage>
                        </FastImage>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
              :
              <View style={styles.serviceTabViewStyle}>
                <Text style={styles.servicesHeadingTextStyle}>{state.HomeDataList[0].child.name + "’s Tracking"}</Text>
                <Text style={styles.servicessubHeadingTextStyle}>{state.HomeDataList[0].child.age_text}</Text>
                <View style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.4)', width: deviceWidth - 85, marginTop: 23, alignSelf: 'center' }} />
                <View style={{ marginBottom: 25, marginTop: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', width: deviceWidth - 85, alignSelf: 'center' }}>
                  <Text style={{ width: deviceWidth - 120, fontFamily: fonts.rubikRegular, fontSize: 16, color: colors.White }}>{state.HomeDataList[0].child.content}</Text>
                  <TouchableWithoutFeedback onPress={() => onClickShare()}>
                    <View>
                      <FastImage source={importImages.shareiconHome} style={{ height: 34, width: 34, marginEnd: -10 }}></FastImage>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
                <View style={styles.serviceProfileViewStyle}>
                  <TouchableWithoutFeedback onPress={() => goChildProfile()}>
                    <View style={{ borderWidth: 8, borderRadius: 40, borderColor: colors.Purple, }}>
                      <View style={styles.serviceImageStyle}>
                        <FastImage
                          source={importImages.appicon}
                          style={[styles.serviceImageStyle]}>
                          <FastImage
                            source={{ uri: state.HomeDataList[0].child.image }}
                            style={[styles.serviceImageStyle]}
                          ></FastImage>
                        </FastImage>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            }
            <View style={styles.container}>
              <FlatList
                data={state.HomeDataList[4].appointment}
                renderItem={renderItem}
                bounces={true}
                // horizontal
                scrollEnabled={false}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
              />
              <Text style={styles.listHeaderStyle}>{'Articles'}</Text>
              <FlatList
                data={state.HomeDataList[1].articles}
                renderItem={articlesRecommendedRenderItem}
                bounces={false}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginVertical: 10 }}
              />
              <TouchableWithoutFeedback onPress={() => click_Article()}>

                <View style={styles.buttonViewStyle}>
                  <Text style={styles.buttonTextStyle}>{'see all'}</Text>
                </View>
              </TouchableWithoutFeedback>
              <Text style={styles.listHeaderStyle}>{'Meditations'}</Text>
              <FlatList
                data={state.HomeDataList[2].meditations}
                renderItem={meditationRenderItem}
                bounces={false}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginVertical: 10 }}
              />
              <TouchableWithoutFeedback onPress={() => click_meditation()}>
                <View style={styles.buttonViewStyle}>
                  <Text style={styles.buttonTextStyle}>{'see all'}</Text>
                </View>
              </TouchableWithoutFeedback>
              <Text style={styles.listHeaderStyle}>{'Videos'}</Text>
              <FlatList
                data={state.HomeDataList[3].videos}
                renderItem={videoRenderItem}
                bounces={false}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginVertical: 10 }}
              />
              <TouchableWithoutFeedback onPress={() => {
                action_event('Home', 'Videos See All')
                navigation.navigate('VideoScreen', { type: "1" })
              }}>
                <View style={styles.buttonViewStyle}>
                  <Text style={styles.buttonTextStyle}>{'see all'}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <View style={[styles.footer, {}]}></View>
          </ScrollView>
        </View>
        : null}
      <Modal
        animationType={'slide'}
        animated={true}
        visible={state.charthome != '' ? true : false}
        transparent={true}
        onRequestClose={() => setState(oldState => ({ ...oldState, charthome: '' }))}>
        <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, charthome: '' }))}>
          <View style={[styles.mstyles,]}>
            <TouchableWithoutFeedback onPress={null}>
              <SafeAreaView>
                <View style={[styles.mcontainerstyle,]}>
                  <View style={{ marginStart: 20, marginEnd: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, }}>
                    <View style={{ height: 40, width: 40, borderRadius: 20 }}>
                      <FastImage source={importImages.successiconchart} style={{ height: 40, width: 40 }}></FastImage>
                    </View>
                    <Text style={{ fontSize: 14, fontFamily: fonts.rubikMedium, color: colors.White }}>{'Tracking Saved'}</Text>
                    <TouchableWithoutFeedback onPress={() => {
                      action_event('Home', 'View Stats')
                      setState(oldState => ({ ...oldState, charthome: '' })), navigation.navigate(state.charthome)
                    }}>

                      <View style={{ backgroundColor: colors.Purple, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, fontFamily: fonts.rubikMedium, color: colors.White, marginStart: 10, marginEnd: 10 }}>{'View Stats'}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              </SafeAreaView>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {!state.isToolTip && !state.isToolTip1 && !state.isToolTip2 && !state.isToolTip3 ? null : <View style={[stylesBackground.backgroundimgcontainer, { backgroundColor: 'rgba(0, 0, 0, 0.56)' }]}></View>}

      {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}
      {state.isSubscribe ?
        <SubscriptionModalView
          style={{ height: '100%', }}
          BlurViewStyle={[{ width: deviceWidth, height: '100%' }]}
          containerstyle={[{ width: deviceWidth, height: '100%' }]}
          message={state.sub_message}
          title={state.sub_title}
          button_text={state.button_text}
          subScribeOnClick={() => { navigation.navigate('SubscriptionScreen') }}
          onClose={() => {
            navigation.setOptions({
              tabBarStyle: { backgroundColor: colors.Blue, borderRadius: 20, height: 81, bottom: Platform.OS === 'ios' ? hasNotch() ? 34 : 17 : 17, position: 'absolute', left: 20, right: 20 },
            });
            setState(oldState => ({
              ...oldState,
              isSubscribe: false,
            }));
          }}
        />
        : null}
    </View >

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  serviceTabViewStyle: {
    backgroundColor: colors.Purple,
    width: deviceWidth - 40,
    alignSelf: 'center',
    borderRadius: 20,
    marginTop: 29,
  },

  serviceProfileViewStyle: {
    alignItems: 'center',
    position: 'absolute',
    top: -28,
    right: 0, left: 0

  },

  serviceImageStyle: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  servicesHeadingTextStyle: {
    fontFamily: fonts.rubikSemiBold,
    fontSize: 20,
    color: colors.White,
    alignSelf: 'center',
    textTransform: 'capitalize',
    marginTop: 50

  },
  servicessubHeadingTextStyle: {
    fontFamily: fonts.rubikRegular,
    fontSize: 16,
    color: colors.White,
    alignSelf: 'center',
    marginTop: 9

  },
  servicesViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  servicesSubViewStyle: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 30,
  },

  serviceTextStyle: {
    fontFamily: fonts.rubikSemiBold,
    fontSize: 12,
    color: colors.White,
    textTransform: 'capitalize',
  },

  listHeaderStyle: {
    fontFamily: fonts.rubikBold,
    fontSize: 20,
    color: colors.Blue,
    marginStart: 21,
    marginTop: 30
  },

  buttonViewStyle: {
    borderWidth: 1,
    width: deviceWidth - 44,
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    borderColor: colors.Blue,
    height: 50,
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: colors.textinputBackground
  },

  buttonTextStyle: {
    fontFamily: fonts.rubikBold,
    fontSize: 16,
    color: colors.Blue,
    textTransform: 'capitalize',
  },

  listViewStyle: {
    borderRadius: 20,
    shadowColor: colors.Purple,
    elevation: 5,
    shadowOffset: {
      width: 3,
      height: 2
    },
    shadowOpacity: 0.39,
    shadowRadius: 10,
    backgroundColor: colors.lightestPink,
    margin: 10,
  },

  listImageStyle: {
    height: 114,
    width: 187,
    borderRadius: 10,
  },

  listHeartStyle: {
    position: 'absolute',
    right: 25,
    top: 25,
    height: 30,
    width: 30
  },

  listTextStyle: {
    fontFamily: fonts.rubikRegular,
    fontSize: 16,
    color: colors.Blue,
    marginStart: 15,
    marginBottom: 23,
    width: 187,
    height: 40
    // height:40
  },



  footer: {
    height: Platform.OS == 'ios' ? hasNotch() ? 245 : 199 : 180,
  },
  mstyles: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.transparent,
  },
  mcontainerstyle: {
    width: deviceWidth,
    borderRadius: 7,
    backgroundColor: colors.Blue,
    width: deviceWidth - 60,
    height: 60,
    marginTop: 35,


  }
});

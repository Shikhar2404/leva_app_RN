import React, { useState, useEffect, } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, FlatList, ActivityIndicator } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import Request from '../../../api/Request';
import BallIndicator from '../../../components/BallIndicator';
import { deviceWidth } from '../../../constants';
import JSFunctionUtils from '../../../utils/JSFunctionUtils';
import StorageService from '../../../utils/StorageService';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import FastImage from 'react-native-fast-image';
import { hasNotch } from 'react-native-device-info';
import NavigationService from '../../../utils/NavigationService';
import { trackEvent } from '../../../utils/tracking';
export default function NotificationListScreen({ route, navigation }) {
  const [state, setState] = useState({
    notificationList: [],
    isModalVisible: false,
    isModalFooterVisible: false,
    pagenumber: 1,
    LastRecored: 0,
    isRefresh: false,
    screentype: '1',
    milestone_id: ''
  })
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      notificationApi(true)
    });
    return unsubscribe;
  }, [])

  const handleNotificationRedirection = async (notification) => {
    const bdate = await StorageService.getItem('childbate');
    if (notification.type == '1') {
      NavigationService.resetAction('DrawerNavigation')
    }
    else if (notification.type == '2') {
      navigation.navigate('ArticlesDetailesScreen', { id: notification.fk_article_id })
    }
    else if (notification.type == '4') {
      await StorageService.saveItem('child_id', notification.fk_child_id)
      setTimeout(() => {
        navigation.navigate('ChildProfileScreen')
      }, 500);
    }
    else if (notification.type == '5') {
      navigation.navigate('MeditationDetailesScreen', { meditationsData: [], index: -1, isNotification: notification.fk_meditation_id, })
    }
    else if (notification.type == '6') {
      navigation.navigate('VideoDetailesScreen', { id: notification.fk_video_id })
    }
    else if (notification.type == '7') {
      NavigationService.resetAction('DrawerNavigation')
      if (bdate) {
        setTimeout(() => {
          navigation.navigate('NursingScreen')
        }, 500);
      }
    }
    else if (notification.type == '8') {
      NavigationService.resetAction('DrawerNavigation')
      if (bdate) {
        setTimeout(() => {
          navigation.navigate('PumpingScreen')
        }, 500);
      }
    }
    else if (notification.type == '9') {
      NavigationService.resetAction('DrawerNavigation')
      if (bdate) {
        setTimeout(() => {
          navigation.navigate('DiaperScreen')
        }, 500);
      }
    }
    else if (notification.type == '10') {
      NavigationService.resetAction('DrawerNavigation')
      if (bdate) {
        setTimeout(() => {
          navigation.navigate('BottleScreen')
        }, 500);

      }
    }
    else if (notification.type == '11') {
      navigation.navigate('ChildProfileScreen')
    }
    else if (notification.type == '12') {
      NavigationService.resetAction('DrawerNavigation')
    }
    else if (notification.type == '13') {
      NavigationService.resetAction('DrawerNavigation')
    }
    else if (notification.type == '14') {
      NavigationService.resetAction('DrawerNavigation')
      if (bdate) {
        setTimeout(() => {
          navigation.navigate('TotalGrowthScreen', { child_id: '' })
        }, 500);
      }
    }

  }
  const renderItem = ({ item, index }) => {
    return (
      <View style={{ backgroundColor: colors.White, borderRadius: 10, borderWidth: 1, borderColor: '#E9E9E9', flex: 1, marginTop: 10 }}>
        <TouchableWithoutFeedback onPress={() => handleNotificationRedirection(item)}>
          <View style={{ flexDirection: 'row', margin: 11, width: deviceWidth - 50, flex: 1 }}>

            <View style={{ width: '94%', }}>
              <Text style={{ color: colors.Blue, fontFamily: fonts.rubikSemiBold, fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: colors.Blue, fontFamily: fonts.rubikRegular, fontSize: 15 }}>{item.content}</Text>
              <Text style={{ color: '#00172E', fontFamily: fonts.rubikRegular, fontSize: 13, marginTop: 10, opacity: 0.5 }}>{item.date_time}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }

  const notificationApi = async (values) => {
    const getallComplete = state.LastRecored == state.notificationList.length ? false : true
    setState(oldState => ({
      ...oldState,
      isModalVisible: values,
      isModalFooterVisible: getallComplete
    }))
    let params = {
      page_no: state.pagenumber,
      limit: 10,
    }
    let response = await Request.post('notification/list', params)
    if (response.status === 'SUCCESS') {
      var list = state.isRefresh ? response.data.list : JSFunctionUtils.uniqueArray(state.notificationList, response.data.list, "user_notification_id")
      setState(oldState => ({
        ...oldState,
        notificationList: list.sort((objA, objB) => Number(objB.id) - Number(objA.id)),
        isModalVisible: false,
        pagenumber: response.data.total_records === state.notificationList.length ? state.pagenumber : state.pagenumber + 1,
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
  const onRefresh = () => {
    state.pagenumber = 1
    state.LastRecored = 0
    state.isRefresh = true
    notificationApi(false)

  }
  const fetchMore = () => {
    const NotComplete = state.LastRecored != state.notificationList.length ? true : false
    if (NotComplete) {
      notificationApi(false)
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
        leftBtnOnPress={() => {
          const trackEventparam = { action:'Back'}
          trackEvent({ event: 'Notifications_List', trackEventparam })
         
          navigation.goBack()}}
        titleStyle={{ color: colors.background }}
      />


      <View style={styles.container}>
        <View>
          <Text style={styles.titleStyle}>{'Notifications'}</Text>
        </View>
        <FlatList
          data={state.notificationList}
          renderItem={renderItem}
          onEndReachedThreshold={0.07}
          onEndReached={fetchMore}
          onRefresh={() => onRefresh()}
          refreshing={state.isRefresh}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (

            <Text style={stylesBackground.NodataStyle}>{state.isModalVisible ? '' : 'No data found'}</Text>
          )}
          contentContainerStyle={state.notificationList.length > 0 ? {} : { flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}
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
    alignSelf: 'center'
  },
  titleStyle: {
    color: colors.Blue,
    fontSize: 28,
    fontFamily: fonts.rubikBold,
  },
  footer: {
    height: hasNotch() ? 60 : 40,
  },

});


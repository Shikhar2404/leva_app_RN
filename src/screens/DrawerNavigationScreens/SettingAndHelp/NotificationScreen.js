import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet,  FlatList, ScrollView } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BallIndicator from '../../../components/BallIndicator';
import Request from '../../../api/Request'
import showSimpleAlert from '../../../utils/showSimpleAlert';
import ToggleSwitch from 'toggle-switch-react-native'
import { trackEvent } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';

export default function NotificationScreen({ route, navigation }) {
  const [state, setState] = useState({
    isModalVisible: false,
    settingData: [],
    push_notification: true,
    email_notification: true,
  })
  useEffect(() => {
    getNotificationApi()
  }, [])
  const OnPressItem = async (item, index) => {
   
    const checkdata = item.status == 1 ? 0 : 1
    state.settingData[index].status = checkdata
    var checckall = state.settingData.filter(item => item.status == 1)
    if (checckall.length > 0) {
      state.push_notification = true
    }
    else {
      state.push_notification = false
    }
    const trackEventparam = { action: item.name,status:checkdata == 1 ? true : false }
    trackEvent({ event: 'Notifications', trackEventparam })
    await NotificationApi()
  }
  const OnPressItememail = async (item) => {
    state.email_notification = item
    const trackEventparam = { action: 'Receive Emails',status:item }
    trackEvent({ event: 'Notifications', trackEventparam })
    await NotificationApi()
  }
  const OnPressItempush = async (items) => {
    state.push_notification = items
    const trackEventparam = { action: 'Receive Push Notifications',status:items }
    trackEvent({ event: 'Notifications', trackEventparam })
    state.settingData = state.settingData.map(item => items ? { ...item, status: 1 } : { ...item, status: 0 })
    await NotificationApi()
  }

  const NotificationApi = async () => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true,
    }))
    const param = {
      push_notification: state.settingData,
      setting: {
        push_notification: state.push_notification,
        email_notification: state.email_notification
      }
    }
    let response = await Request.post('user/notification-management', param)
    setState(oldState => ({
      ...oldState,
      isModalVisible: false,
    }))
    if (response.status === 'SUCCESS') {

    }
    else {
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const getNotificationApi = async () => {

    setState(oldState => ({
      ...oldState,
      isModalVisible: true,
    }))
    let response = await Request.post('user/get-notification-management',)

    if (response.status === 'SUCCESS') {

      setState(oldState => ({
        ...oldState,
        settingData: response.data.push_notification,
        email_notification: response.data.setting.email_notification,
        push_notification: response.data.setting.push_notification,
        isModalVisible: false,

      }))


    }
    else {
      if (response) {
        setState(oldState => ({
          ...oldState,
          isModalVisible: false,
        }))
        showSimpleAlert(response.message)
      }
    }
  }
  const renderItem = ({ item, index }) => {
    return (

      <View style={[styles.inactiveBackground, {borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: index == state.settingData.length - 1 ? 0 : 1, width: deviceWidth - 90, alignSelf:'center' }]}>

        <View style={{ }}>
          <ToggleSwitch
            isOn={item.status == 1 ? true : false}
            onColor={'#473E8D'}
            offColor="rgba(120, 120, 128, 0.16)"
            label={item.name}
            labelStyle={{ color: '#00172E', fontFamily: fonts.rubikMedium, fontSize: 16, marginStart: 0, textAlign: 'justify', alignItems: 'center', height: 20, }}
            size="medium"
            style={{ width: deviceWidth - 95, flexDirection: 'row',  justifyContent: 'space-between', alignItems: 'center', }}
            onToggle={isOn => OnPressItem(item, index)}

          />
        </View>

      </View>

    );
  }

  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      <Header
        leftBtnOnPress={() => navigation.goBack()}
        titleStyle={{ color: colors.background }}
      />
      <View style={styles.container}>
        <View>
          <Text style={styles.titleStyle}>{'Notifications'}</Text>
        </View>
        {state.settingData.length > 0 ?
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ backgroundColor: colors.White, borderColor: '#E6E6E6', borderWidth: 1, borderRadius: 10, marginTop: 30 }}>
              <View style={[styles.inactiveBackground, { backgroundColor: colors.Purple, borderBottomWidth: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>

              <View style={{ width: deviceWidth - 90, alignSelf:'center' }}>
                  <ToggleSwitch
                    isOn={state.push_notification ? true : false}
                    onColor={'#473E8D'}
                    offColor="rgba(120, 120, 128, 0.16)"
                    label={'Receive Push Notifications'}
                    labelStyle={{ color: colors.White, fontFamily: fonts.rubikBold, fontSize: 16,marginStart:0, textAlign: 'justify', alignItems: 'center', height: 20, }}
                    size="medium"
                    style={{ width: deviceWidth - 90, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}
                    onToggle={isOn => OnPressItempush(!state.push_notification)}
                  />
                </View>

              </View>
              <FlatList
                data={state.settingData}
                renderItem={renderItem}
                bounces={false}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <View style={[{ marginTop: 15, borderRadius: 10, height: 65, justifyContent: 'center', borderColor: 'rgba(0, 0, 0, 0.2)', borderWidth: 1, marginBottom: 20,backgroundColor:'#FDF5F5' }]}>

              <View style={{ width: deviceWidth - 90, alignSelf:'center' }}>
                <ToggleSwitch
                  isOn={state.email_notification ? true : false}
                  onColor={'#473E8D'}
                  offColor="rgba(120, 120, 128, 0.16)"
                  label={'Receive Emails'}
                  labelStyle={{ color: '#00172E', fontFamily: fonts.rubikMedium, fontSize: 16, marginStart: 0, textAlign: 'justify', alignItems: 'center', height: 20, }}
                  size="medium"
                  style={{ width: deviceWidth - 90, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}
                  onToggle={isOn => OnPressItememail(!state.email_notification)}
                />
              </View>

            </View>
          </ScrollView>
          : null}
      </View>
      {state.isModalVisible &&
        <BallIndicator visible={state.isModalVisible} />
      }
    </View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: deviceWidth - 50,
    alignSelf: 'center',

  },

  titleStyle: {
    color: colors.Blue,
    fontSize: 28,
    fontFamily: fonts.rubikBold,
  },

  inactiveBackground: { height: 65, justifyContent: 'center', alignItems:'center' },
  inactiveText: { fontSize: 16, fontFamily: fonts.rubikMedium, color: '#00172E', },
});

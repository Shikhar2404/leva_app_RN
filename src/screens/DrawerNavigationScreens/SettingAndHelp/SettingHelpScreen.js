import React, { useState, useEffect, } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, FlatList } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BallIndicator from '../../../components/BallIndicator';
import Request from '../../../api/Request'
import showSimpleAlert from '../../../utils/showSimpleAlert';
import StorageService from '../../../utils/StorageService';
import FastImage from 'react-native-fast-image';
import { trackEvent } from '../../../utils/tracking';

export default function SettingHelpScreen({ route, navigation }) {
  const [state, setState] = useState({
    isModalVisible: false,
    settingData: [{ icon: importImages.changepasswordicon, name: 'Change Password', id: 1 },
    { icon: importImages.contacticon, name: 'Contact Us', id: 2 },
    { icon: importImages.notificationicon, name: 'Notification', id: 3 },
    { icon: importImages.notificationicon, name: 'Manage Subscription', id: 4 },
    { icon: importImages.privacypolicyicon, name: 'Privacy Policy', id: 5 }, { icon: importImages.tcicon, name: 'Terms & Conditions', id: 6 }],
    userdata: {}

  })
  useEffect(() => {
    StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS).then(data => {
      setState(oldState => ({
        ...oldState,
        userdata: data
      }));
    });
  }, []);
  const getPrivacyPolicyData = async () => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true
    }));
    let response = await Request.get('user/get-privacy-policy')
    setState(oldState => ({
      ...oldState,
      isModalVisible: false,
    }));
    if (response.status === "SUCCESS") {
      navigation.navigate('WebViewScreen', { url: response.data.content, title: response.data.title, type: 'html' })

    }
    else {

      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const getTermsData = async () => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true
    }));
    let response = await Request.get('user/get-terms-and-condition')
    setState(oldState => ({
      ...oldState,
      isModalVisible: false,
    }));
    if (response.status === "SUCCESS") {

      navigation.navigate('WebViewScreen', { url: response.data.content, title: response.data.title, type: 'html' })
    }
    else {
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const OnPressItem = (item) => {
    const trackEventparam = { action:item.name}
    trackEvent({ event: 'Settings_and_Help', trackEventparam })
    if (item.id == 1) {
      navigation.navigate('ChangePasswordScreen')
    }
    if (item.id == 2) {
      navigation.navigate('ContactUsScreen')
    }
    if (item.id == 3) {
      navigation.navigate('NotificationScreen')
    }
    if (item.id == 4) {
      navigation.navigate('SubscriptionScreen')
    }
    if (item.id == 5) {
      getPrivacyPolicyData()
    }
    if (item.id == 6) {
      getTermsData()
    }
  }

  const renderItem = ({ item, index }) => {
    if ((state.userdata.apple_id != '' || state.userdata.facebook_id != '' || state.userdata.google_id != '') && index == 0) {
      return null
    }
    else {
      return (
        <TouchableWithoutFeedback onPress={() => OnPressItem(item)}>
          <View style={[styles.inactiveBackground]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                {item.id == 4 ?
                  <View style={{ height: 35, width: 35, borderRadius: 35 / 2, backgroundColor: colors.Blue, alignItems: 'center',justifyContent:'center' }}>
                    <Text style={{fontSize:20,fontFamily:fonts.rubikBold,color:colors.White}}>{'$'}</Text>
                  </View>
                  :
                  <FastImage source={item.icon} style={{ height: 35, width: 35, }} />
                }
                <Text style={styles.inactiveText}>{item.name}</Text>
              </View>
              <FastImage source={importImages.Rarrowicon} style={{ height: 25, width: 25, }} resizeMode={'center'} />
            </View>
          </View>
        </TouchableWithoutFeedback>

      );
    }

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
          <Text style={styles.titleStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Settings and Help'}</Text>
        </View>

        <FlatList
          data={state.settingData}
          renderItem={renderItem}
          style={{ marginTop: 20 }}
          bounces={false}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
        />
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
    width: deviceWidth - 34,
    alignSelf: 'center',

  },

  titleStyle: {
    color: colors.Blue,
    fontSize: 28,
    fontFamily: fonts.rubikBold,
  },

  inactiveBackground: { height: 65, justifyContent: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 1 },
  inactiveText: { fontSize: 16, fontFamily: fonts.rubikMedium, color: '#00172E', marginStart: 13 },
});

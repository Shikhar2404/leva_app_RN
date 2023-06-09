import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, } from '../../../utils/font';
import {  deviceWidth, } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import BallIndicator from '../../../components/BallIndicator';
import Request from '../../../api/Request';
import moment from 'moment'
import showSimpleAlert from '../../../utils/showSimpleAlert';
import StorageService from '../../../utils/StorageService';
import { WebView } from 'react-native-webview';
import BottomButton from '../../../components/BottomButton';
import axios from 'axios';
import { trackEvent } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';
import { hasNotch } from 'react-native-device-info';
export default function BookConsultantScreen({ route, navigation }) {
  const [state, setState] = useState({
    consiltantData: route.params.data,
    userData: {},
    isSuccess: false,
    duration: 30,
    start_time: '',
    end_time: '',
    timeZoneName: '',
    location: '',
    user: 'https://api.calendly.com/users/CFFDSHUMFSFJXLE6',
    organization: 'https://api.calendly.com/organizations/BHHDTHWIF7U2MBZL',
    Authorization: 'Bearer eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNjYyNTQzMjE5LCJqdGkiOiJhNTYxOGNlMi0yMzg4LTRhN2MtYWJlYy0yZmRhYmU5MmQwMTIiLCJ1c2VyX3V1aWQiOiJDRkZEU0hVTUZTRkpYTEU2In0.iQzQWFDvLmIpQtj38bgpx_MIQn2RTEl676BuPULVW2mTdQp5MZvdNJ_y9HRO-MtkIJrDhMPtQOy0pIh1PSbyFA',
    isModalVisible: false,

  })
  useEffect(() => {
    StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS).then(data => {
      setState(oldState => ({
        ...oldState,
        userData: data
      }));

    });
  }, []);
  const bookConsultantAPI = async (data) => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true,
    }));

    let params = Object.assign(JSON.parse(data), { consultant_id: state.consiltantData.consultant_id })
    var amount = await data.invitee_payment_amount ? data.invitee_payment_amount : ''
    let response = await Request.post('appointment/save', params)
    if (response.status === "SUCCESS") {
      const data1 = JSON.parse(data)
      setState(oldState => ({
        ...oldState,
        isSuccess: true,

        start_time: data1.event_start_time,
        end_time: data1.event_end_time,
        timeZoneName: response.data.timeZoneName,

      }));
      await getAppoinmentsUri(data1.event_start_time, data1.event_end_time, data1.invitee_email)

    }
    else {
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const getAppoinmentsUri = async (min_start_time, max_start_time, invitee_email) => {
    const options = {
      method: 'GET',
      url: 'https://api.calendly.com/scheduled_events',
      params: {
        user: state.user,
        organization: state.organization,
        invitee_email: invitee_email,
        count: 1,
        status: 'active',
        max_start_time: max_start_time,
        min_start_time: min_start_time
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: state.Authorization
      },
    };
    axios(options)
      .then(async (response) => {
        await getAppoinmentstype(response.data.collection[0].event_type, response.data.collection[0].location.join_url)
      })
      .catch(err => {
        console.log(err);
      });
  }
  const getAppoinmentstype = async (event, location) => {
    fetch(event, {
      "method": "GET",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": state.Authorization
      }
    })
      .then(res => res.json())
      .then(response => {
        setState(oldState => ({
          ...oldState,
          duration: response.resource.duration,
          location: location,
          isModalVisible: false
        }))
      })
      .catch(err => {
        console.error(err);
      });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.pink }]}>
      <SafeAreaView style={{ backgroundColor: colors.Darkpink }}>
      </SafeAreaView>
      <View style={{ height: 110, backgroundColor: colors.Darkpink, alignItems: 'center' }}>
        <View style={{ marginTop: 20, alignItems: "center" }}>
          {state.isSuccess ?
            <FastImage source={importImages.confirmCon} style={{ height: 158, width: 158 }}></FastImage>
            :
            <View>
              <FastImage source={importImages.ProfileIcon} style={{ height: 158, width: 158, borderRadius: 158 / 2, }}></FastImage>
              <View style={{ position: 'absolute', bottom: 0, top: 0, alignSelf: 'center', justifyContent: 'center' }}>
                <FastImage style={{
                  height: 145, width: 145, borderRadius: 145 / 2, alignSelf: 'center',
                }} source={{ uri: state.consiltantData.image }}></FastImage>
              </View>
            </View>
          }
          {state.isSuccess ? null :
            <View style={{ width: deviceWidth - 50, marginTop: 30, alignItems: "center", }}>
              <Text style={styles.nameStyle}>{state.consiltantData.name}</Text>
              <Text style={styles.textAdreesStyle} numberOfLines={3}>{state.consiltantData.address + ' Consultant'}</Text>
            </View>
          }
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ left: 17, position: 'absolute', top: 10 }}>
          <FastImage source={importImages.backImg} style={{ height: 29, width: 29 }}></FastImage>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, marginTop: state.isSuccess ? 130 : 200 }}>
        {state.isSuccess ?
          <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} style={{}}>

              <View style={{ width: deviceWidth - 50, alignSelf: 'center', marginBottom: hasNotch() ? 100 : 80 }} >
                <Text style={{ fontSize: 20, fontFamily: fonts.rubikBold, color: '#3D3D3D', }}>{'Your meeting is confirmed'}</Text>
                {state.duration != '' ?
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 40 }}>
                    <FastImage source={importImages.clock_icon} style={{ height: 41, width: 41 }}></FastImage>
                    <Text style={{ fontSize: 16, fontFamily: fonts.rubikRegular, color: '#323F4B', marginStart: 10 }}>{state.duration + ' min'}</Text>
                  </View>
                  : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                  <FastImage source={importImages.webc_icon} style={{ height: 41, width: 41 }}></FastImage>
                  <TouchableWithoutFeedback onPress={() => { Linking.openURL(state.location) }}>
                    <View>
                      <Text style={{ fontSize: 16, fontFamily: fonts.rubikRegular, color: '#323F4B', marginStart: 10, textDecorationLine: 'underline' }}>{'Web conferencing details.'}</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
                {state.timeZoneName != '' ?
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                    <FastImage source={importImages.country_icon} style={{ height: 41, width: 41 }}></FastImage>
                    <Text style={{ fontSize: 16, fontFamily: fonts.rubikRegular, color: '#323F4B', marginStart: 10 }}>{state.timeZoneName}</Text>
                  </View>
                  : null}
                {state.start_time != '' ?
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, width: deviceWidth - 50, }}>
                    <FastImage source={importImages.cal_icon} style={{ height: 41, width: 41 }}></FastImage>
                    <View style={{ width: deviceWidth / 1.5, }}>
                      <Text style={{ fontSize: 16, fontFamily: fonts.rubikRegular, color: '#323F4B', marginStart: 10 }}>{moment(state.start_time).format('h:mma - ') + moment(state.end_time).format('h:mma dddd, MMMM DD, YYYY')}</Text>
                    </View>
                  </View>
                  : null}
                <Text style={{ fontSize: 12, fontFamily: fonts.rubikSemiBold, color: '#3D3D3D', marginTop: 50 }}>{'A calendar invitation has been sent to your email address '}</Text>

              </View>
            </ScrollView>
            <BottomButton text={'Continue'} onPress={() => {
              const trackEventparam = { duration: state.duration + ' min', location: 'Web conferencing details.', url: state.location, datetime: moment(state.start_time).format('h:mma - ') + moment(state.end_time).format('h:mma dddd, MMMM DD, YYYY') }
              trackEvent({ event: 'Appointment_Booked', trackEventparam })
              navigation.goBack()
            }} container={{ position: 'absolute', bottom: -20, width: deviceWidth - 50, alignSelf: 'center' }} />

          </View>
          :

          <WebView
            source={{
              html:
                `
                <html>
                  <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1,height=device-height" />
                  </head>
                  <body
                      style="
                      display: flex;
                      justify-content: center;
                      flex-direction: column;
                      align-items: center;
                      background-color: #FFF5F5;"
                      >
                      <div class="calendly-inline-widget" data-auto-load="false" style="width:100%;height:100%;">
                        <script type="text/javascript" src="https://calendly.com/assets/external/calendly-squarespace.js"></script>
                        <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js"></script>
                        <script>
                            var name = "`+ state.userData.name + `";
                            var email = "`+ state.userData.email + `";
                            Calendly.initInlineWidget({
                            url: "`+ state.consiltantData.calendly_url + `?hide_event_type_details=1&hide_landing_page_details=1&hide_gdpr_banner=1&background_color=fff5f5&primary_color=223263",
                            prefill:{
                                name: name,
                                email: email,
                            }  ,
                            });
                          
                        </script>
                      </div>
                  </body>
                </html>
              `
            }}
            showsVerticalScrollIndicator={false}
            style={{
              backgroundColor: 'transparent'
            }}
            onMessage={(event) => {
              bookConsultantAPI(event.nativeEvent.data)

            }}
          ></WebView>
        }
      </View>
      {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}

    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pink,
  },

  textAdreesStyle: {
    color: colors.Blue,
    fontFamily: fonts.rubikRegular,
    fontSize: 16,
    height: 47
  },
  nameStyle: {
    color: colors.Blue,
    fontFamily: fonts.rubikBold,
    fontSize: 30
  },
});

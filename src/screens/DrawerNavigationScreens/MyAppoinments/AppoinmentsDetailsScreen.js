import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView, Linking, Alert } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { ConstantsText, deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BottomButton from "../../../components/BottomButton";
import Request from '../../../api/Request';
import axios from 'axios'
import showSimpleAlert from '../../../utils/showSimpleAlert';
import BallIndicator from '../../../components/BallIndicator';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import { hasNotch } from 'react-native-device-info';
import { trackEvent } from '../../../utils/tracking';

export default function AppoinmentsDetailsScreen({ route, navigation }) {

  const [state, setState] = useState({
    AppointmentData: { ...route.params.data },
    isModalVisible: false,
    CalData: {},
    duration: 30,
    start_time: '',
    end_time: '',
    timeZoneName: '',
    user: 'https://api.calendly.com/users/CFFDSHUMFSFJXLE6',
    organization: 'https://api.calendly.com/organizations/BHHDTHWIF7U2MBZL',
    Authorization: 'Bearer eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNjYyNTQzMjE5LCJqdGkiOiJhNTYxOGNlMi0yMzg4LTRhN2MtYWJlYy0yZmRhYmU5MmQwMTIiLCJ1c2VyX3V1aWQiOiJDRkZEU0hVTUZTRkpYTEU2In0.iQzQWFDvLmIpQtj38bgpx_MIQn2RTEl676BuPULVW2mTdQp5MZvdNJ_y9HRO-MtkIJrDhMPtQOy0pIh1PSbyFA'
  })
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      MyAppoinmentsDetailsApi()

    });
    return unsubscribe;
  }, [])
  const goDetailsScreeen = async (item) => {
    const trackEventparam = { action: 'Edit' }
    trackEvent({ event: 'Appointment_details', trackEventparam })
    navigation.navigate('EditAppointmentScreen', { CalData: state.CalData, data: state.AppointmentData })

  }
  const cancellationApi = () => {
    const trackEventparam = { action: 'Cancel Appointment' }
    trackEvent({ event: 'Appointment_details', trackEventparam })
    setState(oldState => ({
      ...oldState,
      isModalVisible: true,
    }))
    fetch(state.CalData.event + "/cancellation", {
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": state.Authorization
      },
      "body": "{\"reason\":\"string\"}"
    })
      .then(response => {
        deleteBookingAPI()
      })
      .catch(err => {
        console.error(err);
      });
  }
  const deleteBookingAPI = async () => {
    let params = { appointment_id: state.AppointmentData.appointment_id }
    let response = await Request.post('appointment/delete', params)
    setState(oldState => ({
      ...oldState,
      isModalVisible: false,
    }))
    if (response.status === "SUCCESS") {
      showSimpleAlert(response.message)
      navigation.goBack()

    }
    else {
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const MyAppoinmentsDetailsApi = async () => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true,
    }))
    let response = await Request.post('appointment/detail', { appointment_id: state.AppointmentData.appointment_id })
    if (response.status === 'SUCCESS') {
      setState(oldState => ({
        ...oldState,
        isModalVisible: false,
        start_time: response.data.event_start_time,
        end_time: response.data.event_end_time,
        timeZoneName: response.data.timeZoneName,
        AppointmentData: { ...response.data }
      }))
      await getAppoinmentsUri(response.data.event_start_time, response.data.event_end_time)
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
  const cancellationAlert = () => {
    Alert.alert(
      ConstantsText.appName,
      ConstantsText.Areyousureyouwanttocancelyourappointment,
      [
        { text: "Ok", onPress: () => cancellationApi() },
        { text: "Cancel", onPress: () => { } }
      ],
      { cancelable: false }
    );
  }
  const getAppoinmentsUri = async (min_start_time, max_start_time) => {
    const options = {
      method: 'GET',
      url: 'https://api.calendly.com/scheduled_events',
      params: {
        user: state.user,
        organization: state.organization,
        invitee_email: state.AppointmentData.invitee_email,
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
        await getAppoinmentstype(response.data.collection[0].event_type)
        await getAppoinmentsData(response.data.collection[0].uri)
      })
      .catch(err => {
        console.log(err);
      });
  }
  const getAppoinmentstype = async (event) => {
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
        }))
      })
      .catch(err => {
        console.error(err);
      });
  }
  const getAppoinmentsData = async (uri) => {
    const options = {
      method: 'GET',
      url: uri + '/invitees',
      params: {
        email: state.AppointmentData.invitee_email,
        count: 1,
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: state.Authorization
      },
    };
    axios(options)
      .then(response => {
        setState(oldState => ({
          ...oldState,
          CalData: { ...response.data.collection[0] },
        }))
      })
      .catch(err => {
        console.log(err);
      });



  }
  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      <Header
        leftBtnOnPress={() => {
          const trackEventparam = { action: 'Back' }
          trackEvent({ event: 'Appointment_details', trackEventparam })
          navigation.goBack()
        }}
        titleStyle={{ color: colors.Blue }}
      />
      <View style={{ width: deviceWidth - 50, alignItems: 'center', alignSelf: 'center' }}>
        <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.mainHeadertext} adjustsFontSizeToFit={true} numberOfLines={1}>{'Appointment Details'}</Text>
        </View>
      </View>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={{}}>
          <View style={{ backgroundColor: colors.White, borderRadius: 15, borderWidth: 1, borderColor: '#E9E9E9', }}>
            <View style={{ flexDirection: 'row', margin: 35, width: deviceWidth - 50, }}>
              <View style={{ width: '20%', alignItems: 'flex-end' }}>
                <FastImage source={{ uri: state.AppointmentData.consultant_image }} style={{ height: 60, width: 60, borderRadius: 60 / 2, marginEnd: 10 }} />
              </View>
              <View style={{ width: '65%', }}>
                <Text style={{ color: colors.Blue, fontFamily: fonts.rubikSemiBold, fontSize: 18 }}>{state.AppointmentData.consultant_address + ' Consultant:'}</Text>
                <Text style={{ color: colors.Blue, fontFamily: fonts.rubikSemiBold, fontSize: 18 }}>{state.AppointmentData.consultant_name}</Text>
              </View>
            </View>
          </View>
          <View style={{ marginBottom: hasNotch() ? 180 : 150 }}>
            {state.duration != '' ?
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 40 }}>
                <FastImage source={importImages.clock_icon} style={{ height: 41, width: 41 }}></FastImage>
                <Text style={{ fontSize: 16, fontFamily: fonts.rubikRegular, color: '#323F4B', marginStart: 10 }}>{state.duration + ' min'}</Text>
              </View>
              : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
              <FastImage source={importImages.webc_icon} style={{ height: 41, width: 41 }}></FastImage>
              <TouchableWithoutFeedback onPress={() => {
                const trackEventparam = { action: 'Web conference details' }
                trackEvent({ event: 'Appointment_details', trackEventparam })
                Linking.openURL('https://www.google.com/search?q=googe+meet&oq=googe+meet&aqs=chrome..69i57j0i10i433l4j0i10j0i10i433j0i10j0i10i433l2.2992j0j4&sourceid=chrome&ie=UTF-8')
              }}>
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

          </View>
        </ScrollView>


        <BottomButton text={'Edit'} onPress={() => goDetailsScreeen()} container={{ position: 'absolute', bottom: 50, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.Blue }} textstyle={{ color: colors.Blue, textTransform: 'none' }} />
        <BottomButton text={'Cancel Appointment'} onPress={() => cancellationAlert()} container={{ position: 'absolute', bottom: -20, }} />

      </View>
      {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}

    </View >

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 35,
    alignSelf: 'center',
    width: deviceWidth - 50
  },

  mainHeadertext: {
    color: colors.Blue,
    fontSize: 26,
    fontFamily: fonts.rubikBold,
    textTransform: 'capitalize'

  },


});


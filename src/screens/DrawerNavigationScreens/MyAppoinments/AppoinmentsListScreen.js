import React, { useState, useEffect, } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback,  FlatList,  } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import Request from '../../../api/Request';
import BallIndicator from '../../../components/BallIndicator';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import FastImage from 'react-native-fast-image';
import { trackEvent } from '../../../utils/tracking';

export default function AppoinmentsListScreen({ route, navigation }) {

  const [state, setState] = useState({
    AppointmentList: [],
    type: route.params.type,
    isModalVisible: false,

  })
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      MyAppoinmentsApi()
    });
    return unsubscribe;

  }, [])
  const MyAppoinmentsApi = async () => {

    setState(oldState => ({
      ...oldState,
      isModalVisible: true,
    }))
    let response = await Request.post('appointment/list')
    if (response.status === 'SUCCESS') {
      state.AppointmentList = []
      setState(oldState => ({
        ...oldState,
        isModalVisible: false,
        AppointmentList: [...response.data]
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
  const goDetailsScreeen = async (item) => {
    if (state.type === "Upcoming") {
      navigation.navigate('AppoinmentsDetailsScreen', { data: item })

    }
  }
  const renderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback onPress={() => goDetailsScreeen(item)}>
        <View style={{ backgroundColor: colors.White, borderRadius: 15, borderWidth: 1, borderColor: '#E9E9E9', flex: 1, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', margin: 11, width: deviceWidth - 50, flex: 1 }}>
            <View style={{ width: '25%', alignItems: 'flex-end' }}>
              <FastImage source={{ uri: item.consultant_image }} style={{ height: 60, width: 60, borderRadius: 60 / 2, marginEnd: 10 }} />
            </View>
            <View style={{ width: '75%' }}>
              <Text style={{ color: colors.Blue, fontFamily: fonts.rubikSemiBold, fontSize: 18 }}>{item.consultant_address + ' Consultant:'}</Text>
              <Text style={{ color: colors.Blue, fontFamily: fonts.rubikSemiBold, fontSize: 18 }}>{item.consultant_name}</Text>
              <Text style={{ color: '#00172E', fontFamily: fonts.rubikRegular, fontSize: 16, marginTop: 11, opacity: 0.5 }}>{'Date: ' + item.event_date}</Text>
              <Text style={{ color: '#00172E', fontFamily: fonts.rubikRegular, fontSize: 16, marginTop: 11, opacity: 0.5 }}>{'Time: ' + item.event_time}</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      <Header
        leftBtnOnPress={() => {
          const trackEventparam = { action:'Back'}
          trackEvent({ event: state.type === 'Past' ? 'Past_Appointments' : 'Upcoming_Appointments', trackEventparam })
          navigation.goBack()}}
        titleStyle={{ color: colors.Blue }}
      />
      <View style={{ width: deviceWidth - 50, alignItems: 'center', alignSelf: 'center' }}>
        <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.mainHeadertext} adjustsFontSizeToFit={true} numberOfLines={1}>{state.type === 'Past' ? 'Past Appointments' : 'Upcoming Appointments'}</Text>
        </View>
      </View>

      <View style={styles.container}>
        <FlatList
          data={state.AppointmentList.length > 0 ? state.AppointmentList.length == 1 ? state.AppointmentList[0].items : state.AppointmentList[state.type === 'Past' ? 0 : 1].items : []}
          renderItem={renderItem}
          bounces={true}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={stylesBackground.NodataStyle}>{state.isModalVisible ? '' : 'No data found'}</Text>
          )}
          contentContainerStyle={state.AppointmentList.length > 0 ? {} : { flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}
        />

      </View>
      {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}

    </View >

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 35,
    alignItems: 'center'
  },

  mainHeadertext: {
    color: colors.Blue,
    fontSize: 26,
    fontFamily: fonts.rubikBold,
    textTransform: 'capitalize'

  },


});


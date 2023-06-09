import React, { useState, useEffect, } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, FlatList } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth, } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import BallIndicator from '../../../components/BallIndicator';
import Request from '../../../api/Request'
import showSimpleAlert from '../../../utils/showSimpleAlert';
import moment from 'moment'
import FastImage from 'react-native-fast-image';
import { trackEvent } from '../../../utils/tracking';

export default function MomDetailsScreen({ route, navigation }) {
  const [state, setState] = useState({
    name: '',
    youare: '',
    bdate: '',
    profession: '',
    feet: '',
    inches: '',
    weight: "",
    youareData: [{ label: 'A new mom', value: '1' },
    { label: 'An expectant mom', value: '2' },],
    professionData: [{ label: 'Stay at home mom', value: '1' },
    { label: 'Business woman', value: '2' },
    { label: 'Teacher', value: '3' },
    { label: 'Other', value: '4' }],
    datepicker: false,
    isModalVisible: false,
    interest_list: [],
    ImageUri: '',
  })
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getUserDetails()

    });
    return unsubscribe;
  }, [])

  //API Calling
  const getUserDetails = async () => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true
    }));
    let response = await Request.post('user/detail')
    if (response.status === "SUCCESS") {
      setState(oldState => ({
        ...oldState,
        isModalVisible: false,
        name: response.data.name,
        youare: response.data.motherhood_status.toString(),
        bdate: response.data.dob,
        feet: response.data.feet,
        inches: response.data.inches,
        weight: response.data.weight,
        profession: response.data.profession,
        interest_list: response.data.interest_list.filter(item => item.interest_id != '1'),
        ImageUri: response.data.image
      }));
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

  const action_event = (action) => {
    const trackEventparam = { action: action }
    trackEvent({ event: 'Mother_Profile', trackEventparam })
  }
  const renderItemInterest = ({ item, index }) => {


    return (

      <View style={{ marginBottom: 10, marginEnd: 10, }}>
        <View style={{ borderRadius: 10, height: 42, backgroundColor: colors.Darkpink, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.InterestTextStyle}  >{item.name}</Text>
        </View>
      </View>
    );



  }
  const renderItem = ({ item, index }) => {
    return (

      <View>
        <View style={[{ flexDirection: 'row', alignItems: 'center', }]}>
          <FastImage
            source={importImages.defaultProfileImg}
            style={{ width: 60, height: 60, borderRadius: 60 / 2 }} >
            <FastImage
              source={{ uri: state.ImageUri }}
              style={{ width: 60, height: 60, borderRadius: 60 / 2 }} ></FastImage>
          </FastImage>
          <View>
            <Text style={styles.TextStyle}>{state.name}</Text>
            <Text style={[styles.TextStyle, { fontFamily: fonts.rubikRegular, fontSize: 12, }]}>{state.profession != '' ? state.professionData[Number(state.profession) - 1].label : ''}</Text>
          </View>
        </View>

        <View style={{ marginTop: 10, }}>
          <View style={{ width: deviceWidth - 40, alignSelf: 'center', backgroundColor: colors.White, borderRadius: 15, borderWidth: 1, borderColor: '#E9E9E9', flex: 1, marginTop: 25, paddingHorizontal: 20, paddingVertical: 20, alignItems: 'flex-start', justifyContent: 'space-between', flexDirection: 'row', }}>
            <View style={{ width: '100%', }}>
              <Text style={{ fontFamily: fonts.rubikBold, fontSize: 20, color: colors.Blue, marginEnd: 15, width: '90%', }}>{state.name}</Text>
              <Text style={{ fontFamily: fonts.rubikRegular, fontSize: 16, color: colors.Blue, marginTop: 4 }}>{state.youare === '1' ? 'A new mom' : state.youare === '2' ? 'An expectant mom' : ''}</Text>
              {state.bdate ?
                <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'space-between', alignItems: "center", }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <FastImage source={importImages.birthicon} style={{ height: 16, width: 12 }}></FastImage>
                    <Text style={{ fontFamily: fonts.rubikRegular, fontSize: 16, color: '#7F8A96', marginStart: 8 }}>{state.bdate ? moment(state.bdate).format('MM/DD/YYYY') : ''}</Text>
                  </View>
                  {state.weight ?
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      <FastImage source={importImages.weighticonm} style={{ height: 16, width: 12 }}></FastImage>
                      <Text style={{ fontFamily: fonts.rubikRegular, fontSize: 16, color: '#7F8A96', marginStart: 8 }}>{state.weight + ' lbs'}</Text>
                    </View>
                    : null}
                  {state.feet || state.inches ?
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                      <FastImage source={importImages.highticon} style={{ height: 16, width: 12 }}></FastImage>
                      <Text style={{ fontFamily: fonts.rubikRegular, fontSize: 16, color: '#7F8A96', marginStart: 8 }}>{state.feet ? state.feet + ' ft ' : ''}{state.inches ? state.inches + ' in' : ''}</Text>
                    </View>
                    : null}
                </View>
                : null}






            </View>
            <TouchableWithoutFeedback onPress={() => {
              action_event('Edit')
              navigation.navigate('EditProfileScreen', { childData: state.selecteditem, onBackRefresh: () => onBackRefresh() })}}>
              <View style={{ height: 30, width: 30, alignItems: 'center', position: 'absolute', right: 20, top: 15, justifyContent: 'center' }}>
                <FastImage source={importImages.edit2Icon} style={{ height: 17, width: 17 }} ></FastImage>
              </View>
            </TouchableWithoutFeedback>
          </View>

        </View>
        <View style={{ marginTop: 30, width: deviceWidth - 40, alignSelf: 'center' }}>
          <Text style={styles.headingTextStyle}>{'Interests'}</Text>
          <FlatList
            data={state.interest_list}
            renderItem={renderItemInterest}
            bounces={false}
            key={index}
            numColumns={5}
            columnWrapperStyle={{ flexWrap: "wrap" }}
            style={{ marginTop: 20 }}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>

      </View>
    );
  }
  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={[stylesBackground.backgroundimgcontainer, {}]} resizeMode={'stretch'}></FastImage>
      <Header
        headerTitle={''}
        leftBtnOnPress={() => {
          action_event('Back')
          navigation.goBack()}}
        titleStyle={{ color: colors.background }}
      />

      <View style={styles.container}>


        <View>
          <Text style={styles.titleStyle}>{'Mother Profile'}</Text>
        </View>
        <View style={{ flex: 1, }}>
          <KeyboardAwareFlatList
            data={state.name ? ['1'] : []}
            renderItem={renderItem}
            style={{ marginTop: 28 }}
            bounces={false}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
    width: deviceWidth - 40,
    alignSelf: 'center',
    height: '100%'
  },

  titleStyle: {
    color: colors.Blue,
    fontSize: 30,
    fontFamily: fonts.rubikBold,
    textTransform: 'capitalize'
  },
  TextStyle: {
    fontFamily: fonts.rubikSemiBold,
    color: colors.Blue,
    marginStart: 10,
    fontSize: 20
  },
  InterestTextStyle: {
    fontFamily: fonts.rubikRegular,
    color: colors.Blue,
    fontSize: 16,
    marginStart: 10, marginEnd: 10,
    textAlign: 'center'
  },
  headingTextStyle: {
    fontFamily: fonts.rubikSemiBold,
    color: colors.Blue,
    fontSize: 20
  },

});

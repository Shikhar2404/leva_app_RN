import React, { useState, useEffect, useRef, } from 'react';
import { View, Text, StyleSheet,  TouchableWithoutFeedback, Keyboard, BackHandler, Platform } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { ConstantsText, deviceWidth, } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BottomButton from "../../../components/BottomButton";
import TextField from "../../../components/TextField";
import DropDownField from "../../../components/DropDownField";
import CalenderModal from "../../../components/CalenderModal";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import BallIndicator from '../../../components/BallIndicator';
import Request from '../../../api/Request'
import showSimpleAlert from '../../../utils/showSimpleAlert';
import moment from 'moment'
import StorageService from '../../../utils/StorageService';
import NavigationService from '../../../utils/NavigationService';
import FastImage from 'react-native-fast-image';
import SubscriptionModalView from '../../../components/SubscriptionModalView'
import apiConfigs from '../../../api/apiConfig';
import { trackEvent } from '../../../utils/tracking';
export default function AddBabyScreen({ route, navigation }) {
  const [state, setState] = useState({
    babyname: '',
    babyduedate: '',
    babyborndate: '',
    lbs: '',
    ounces: '',
    typedatelable: '',
    datepicker: false,
    dropdownpicker: false,
    datepicker1: false,
    feet: '',
    inches: '',
    isModalVisible: false,
    motherhood_status: 1,
    refMed: useRef(),
    genderData: [{ label: 'Male', value: '1' },
    { label: 'Female', value: '2' },],
    gender: '',
    isbabyborn: '',


    isSubscribe: false,
    sub_message: '',
    sub_title: '',
    button_text: '',
  })

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const IS_SUBSCRIBED = await StorageService.getItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED);
      if (IS_SUBSCRIBED) {
        setState(oldState => ({
          ...oldState,
          isSubscribe: false,
        }));
      }
      StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS).then(userData => {
        setState(oldState => ({
          ...oldState,
          babyname: '',
          babyduedate: '',
          babyborndate: '',
          lbs: '',
          ounces: '',
          typedatelable: '',
          feet: '',
          inches: '',
          gender: '',
          isbabyborn: userData.motherhood_status == 1 ? 'Yes' : '',
          motherhood_status: userData.motherhood_status,
        }));

      }).catch(error => { })
    });
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      goBackNav1
    ); return () => { unsubscribe, backHandler.remove() };

  }, [state.isFocus]);

  const getDate = (date) => {
    setState(oldState => ({
      ...oldState,
      babyduedate: date,
      datepicker: false,
    }));

  };
  const getDate1 = (date) => {
    setState(oldState => ({
      ...oldState,
      babyborndate: date,
      datepicker1: false,
    }));

  };
  const goBackNav1 = () => {
    setState(oldState => ({
      ...oldState,
      isSubscribe: false,

    }));
  }
  const goBackNav = async () => {
    setState(oldState => ({
      ...oldState,
      isSubscribe: false,
    }));
    setTimeout(async () => {

      navigation.goBack()
    }, 10);
  }

  const handleChangeOfText = (key, value) => {
    setState(oldState => ({
      ...oldState,
      [key]: value,
    }));


  };
  const Action_updateMomProfile = async (type) => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true
    }));
     if(type === 'Yes')
     {
      let param = {
        motherhood_status:'1',
      }      
      let response = await Request.post('user/update-profile', param)
      if (response.status === "SUCCESS") {
        const userData = await StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS);
        userData.motherhood_status = 1
        await StorageService.saveItem(StorageService.STORAGE_KEYS.USER_DETAILS, userData)
        setState(oldState => ({
          ...oldState,
          isbabyborn: 'Yes' ,
          motherhood_status:1,
          isModalVisible: false
        }));
      }
      else {
        setState(oldState => ({
          ...oldState,
          isModalVisible: false
        }));
        if (response) {
          showSimpleAlert(response.message)
        }
      }
    }
    else{
      setState(oldState => ({
        ...oldState,
        isModalVisible: false,
        isbabyborn: 'No' 
      }));
    }
    
  }
  const Action_continue = async () => {
    if (state.babyname.trim() === '') {
      alert(ConstantsText.Pleaseenteryourbabysname)
    }
    else if (state.babyduedate === '') {
      alert(ConstantsText.Pleaseselectbabyduedate)
    }

    else {
      setState(oldState => ({
        ...oldState,
        isModalVisible: true
      }));
      let param = {
        name: state.babyname.trim(),
        due_date: state.babyduedate,
        dob: state.babyborndate,
        gender: state.gender != '' ? state.gender.value : '',
        lbs: state.lbs,
        ounces: state.ounces,
        feet: state.feet,
        inches: state.inches,

      }
      let response = await Request.post('user/store-child-info', param)

      if (response.status === "SUCCESS") {
        setState(oldState => ({
          ...oldState,
          isModalVisible: false,
          button_text: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.button_text : '',
          sub_title: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.title : '',
          sub_message: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.message : '',
          isSubscribe: response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false
        }));
        if (response.code != apiConfigs.USER_UNSUBSCRIBE) {
          let lbsdata = state.lbs ? state.lbs + ' lbs | ' : ''
          let ouncesdata = state.ounces ? state.ounces + ' ounces' : ''
          const trackEventparam = {  name: state.babyname,  BabyDueDate: state.babyduedate,  DOB: state.babyborndate, gender:state.gender != '' ? state.gender.value : '', Height: state.inches, Weight: lbsdata+ouncesdata }
          trackEvent({ event: 'Add_Baby', trackEventparam })
          await StorageService.saveItem('childbate', state.babyborndate)
          await StorageService.saveItem('child_id', response.data.child.child_id)
          if (state.motherhood_status == 1) {
            navigation.navigate('MoreAboutYourChildScreen', { child_id: response.data.child.child_id, bdate: state.babyborndate })
          }
          else {
            NavigationService.resetAction('DrawerNavigation')
          }
        }
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
  }
  const renderItem = ({ item, index }) => {
    return (

      <View>
        {state.isbabyborn == '' ?
          <View>
            <Text style={{ fontSize: 16, color: '#00172E', fontFamily: fonts.rubikSemiBold, textTransform: 'capitalize' }}>{'Has your baby already been born?'}</Text>
            <View style={{ flexDirection: 'row', width: deviceWidth - 50, marginTop: 10, marginBottom: 10, }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '40%', }}>
                <TouchableWithoutFeedback onPress={() => Action_updateMomProfile('Yes')}>
                  <View style={{ backgroundColor: colors.Darkpink, height: 26, width: 26, borderRadius: 26 / 2, alignItems: 'center', justifyContent: 'center', borderWidth: state.isbabyborn === 'Yes' ? 1 : 0, borderColor: colors.Blue }}>
                    <View style={{ backgroundColor: state.isbabyborn === 'Yes' ? colors.Blue : colors.White, height: 11.66, width: 11.66, borderRadius: 11.66 / 2 }}>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <Text style={{ color: colors.Blue, fontFamily: fonts.rubikMedium, fontSize: 16, marginStart: 15 }}>{'Yes'}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '40%', }}>
              <TouchableWithoutFeedback onPress={() => Action_updateMomProfile('No')}>
                  <View style={{ backgroundColor: colors.Darkpink, height: 26, width: 26, borderRadius: 26 / 2, alignItems: 'center', justifyContent: 'center', borderWidth: state.isbabyborn === 'No' ? 1 : 0, borderColor: colors.Blue }}>
                    <View style={{ backgroundColor: state.isbabyborn === 'No' ? colors.Blue : colors.White, height: 11.66, width: 11.66, borderRadius: 11.66 / 2 }}>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <Text style={{ color: colors.Blue, fontFamily: fonts.rubikMedium, fontSize: 16, marginStart: 15 }}>{'No'}</Text>
              </View>
            </View>
          </View>
          :
          <View>
            <TextField
              key={'babyname'}
              ref={null}
              value={state.babyname}
              placeholder={'Your baby’s name'}
              ImageSrc={importImages.babynameIcon}
              isShowImg={true}
              onChangeText={(text) => handleChangeOfText("babyname", text, 0)}
              blurOnSubmit={true}
              lable={'Baby’s Name'}
              returnKeyType={"done"}
              autoCapitalize='words'
            />
            <TouchableWithoutFeedback onPress={() => {
              setState(oldState => ({
                ...oldState,
                datepicker: true,
                typedatelable: state.motherhood_status == 1 ? 'When was your baby due?' : 'When is your baby due',
              })),
                Keyboard.dismiss()
            }
            }>
              <View>
                <TextField
                  key={'babyduedate'}
                  ref={null}
                  value={state.babyduedate != '' ? moment(state.babyduedate).format('MM/DD/YYYY') : ''}
                  placeholder={state.motherhood_status == 1 ? 'When was your baby due?' : 'When is your baby due'}
                  ImageSrc={importImages.bdateIcon}
                  isShowImg={true}
                  onChangeText={(text) => handleChangeOfText("babyduedate", text)}
                  blurOnSubmit={false}
                  lable={'Baby Due Date'}
                  editable={false}
                  isClear={state.babyduedate === '' ? false : true}
                  type={'bdate'}
                  isONClear={() => setState(oldState => ({ ...oldState, babyduedate: '', datepicker: false, }))}
                  autoCapitalize={'none'}
                  returnKeyType={"next"}
                />
              </View>
            </TouchableWithoutFeedback>

            {state.motherhood_status == 1 ?
              <View>
                <TouchableWithoutFeedback onPress={() => {
                  setState(oldState => ({
                    ...oldState,
                    datepicker1: true,
                    typedatelable: 'When was your baby born?',
                  })),
                    Keyboard.dismiss()
                }
                }>
                  <View>
                    <TextField
                      key={'babyborndate'}
                      ref={null}
                      value={state.babyborndate != '' ? moment(state.babyborndate).format('MM/DD/YYYY') : ''}
                      placeholder={'When was your baby born?'}
                      ImageSrc={importImages.bdateIcon}
                      isShowImg={true}
                      onChangeText={(text) => handleChangeOfText("babyborndate", text)}
                      blurOnSubmit={false}
                      lable={'Baby Birth Date'}
                      editable={false}
                      isClear={state.babyborndate === '' ? false : true}
                      type={'bdate'}
                      isONClear={() => setState(oldState => ({ ...oldState, babyborndate: '', datepicker: false, }))}
                      autoCapitalize={'none'}
                      returnKeyType={"next"}
                    />
                  </View>
                </TouchableWithoutFeedback>
                <DropDownField
                  key={'gender'}
                  ref={null}
                  data={state.genderData}
                  value={state.gender}
                  placeholder={'What is your child’s gender?'}
                  ImageSrc={importImages.downarrowIcon}
                  isShowImg={true}
                  icontype={'1'}
                  onChange={(values) => handleChangeOfText("gender", values)}
                  lable={'Gender'}

                />

                <View style={{ flexDirection: 'row', width: deviceWidth - 50, }}>
                  <View style={{ flexDirection: 'row', }}>

                    <TextField
                      key={'lbs'}
                      textInputStyle={{ width: 70 }}
                      ref={null}
                      value={state.lbs}
                      placeholder={'Lbs'}
                      isShowImg={false}
                      onChangeText={(text) => handleChangeOfText("lbs", text)}
                      blurOnSubmit={true}
                      lable={'weight'}
                      keyboardType={'decimal-pad'}
                      autoCapitalize={'none'}
                      returnKeyType={"done"}
                    />
                    <Text style={{ color: colors.textLable, fontSize: 16, fontFamily: fonts.rubikRegular, position: 'absolute', right: -30, bottom: 30 }}>{'lbs'}</Text>
                  </View>
                  <View style={{ marginStart: 50, flexDirection: 'row', }}>
                    <TextField
                      key={'ounces'}
                      ref={null}
                      textInputStyle={{ width: 70, }}
                      value={state.ounces}
                      placeholder={'Ounces'}
                      isShowImg={false}
                      lable={' '}
                      onChangeText={(text) => handleChangeOfText("ounces", text)}
                      blurOnSubmit={true}
                      keyboardType={'decimal-pad'}
                      autoCapitalize={'none'}
                      returnKeyType={"done"}
                    />
                    <Text style={{ color: colors.textLable, fontSize: 16, fontFamily: fonts.rubikRegular, position: 'absolute', right: Platform.OS == 'android' ? -70 : -60, bottom: 30 }}>{'ounces'}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', width: deviceWidth - 50, marginBottom: 120 }}>
                  <View style={{ flexDirection: 'row', }}>
                    <TextField
                      key={'inches'}
                      ref={null}
                      textInputStyle={{ width: 70, }}
                      value={state.inches}
                      placeholder={'Inches'}
                      isShowImg={false}
                      onChangeText={(text) => handleChangeOfText("inches", text)}
                      blurOnSubmit={true}
                      lable={'Height (in)'}
                      keyboardType={'decimal-pad'}
                      autoCapitalize={'none'}
                      returnKeyType={"done"}
                      lableStyle={{ textTransform: 'none' }}
                    />
                    <Text style={{ color: colors.textLable, fontSize: 16, fontFamily: fonts.rubikRegular, position: 'absolute', right: -20, bottom: 10 }}>{' '}</Text>
                  </View>
                </View>
              </View>
              : null}
          </View>
        }
        <CalenderModal
          visible={state.datepicker}
          transparent={true}
          type=''
          valuesdate={state.babyduedate === '' ? moment(new Date()).format('YYYY-MM-DD') : state.babyduedate}
          lable={state.typedatelable}
          getDate={getDate}
          maxDate={undefined}
          CloseModal={() =>
            setState(oldState => ({
              ...oldState,
              datepicker: false,
              babyduedate: state.babyduedate,

            }))} />
        <CalenderModal
          visible={state.datepicker1}
          transparent={true}
          type=''
          valuesdate={state.babyborndate === '' ? moment(new Date()).format('YYYY-MM-DD') : state.babyborndate}
          getDate={getDate1}
          maxDate={undefined}
          CloseModal={() =>
            setState(oldState => ({
              ...oldState,
              datepicker1: false,
              babyborndate: state.babyborndate,
            }))} />
      </View>
    );
  }
  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      <Header
        headerTitle={''}
        leftBtnOnPress={() => goBackNav()}
        titleStyle={{ color: colors.background }}
      />
      <View style={styles.container}>
        <View>
          <Text style={styles.titleStyle}>{'Add Baby'}</Text>
          <Text style={styles.subtitleStyle}>{'Add your baby’s details so that you can accurately track their feeding and activities'}</Text>
        </View>
        <View style={{ flex: 1, }}>
          <KeyboardAwareFlatList
            data={[1]}
            renderItem={renderItem}
            style={{ marginTop: 28 }}
            keyExtractor={(item, index) => index.toString()}
            extraHeight={Platform.OS === 'ios' ? -75 : 50}
            showsVerticalScrollIndicator={false}
            keyboardOpeningTime={0}
            keyboardShouldPersistTaps={'handled'}
            bounces={false}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            enableResetScrollToCoords={false}
          />
          <BottomButton text={'Continue'} onPress={() => Action_continue()} container={{ position: 'absolute', bottom: 0 }} />

        </View>
      </View>
      {state.isModalVisible &&
        <BallIndicator visible={state.isModalVisible} />
      }
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
            setState(oldState => ({
              ...oldState,
              isSubscribe: false,
            }));
          }}
        />
        : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: deviceWidth - 34,
    alignSelf: 'center',
    height: '100%'
  },
  titleStyle: {
    color: colors.Blue,
    fontSize: 30,
    fontFamily: fonts.rubikBold,
    textTransform: 'capitalize'
  },
  subtitleStyle: {
    marginTop: 10,
    color: colors.Blue,
    fontSize: 16,
    fontFamily: fonts.rubikRegular,
    opacity: 0.7

  },

});
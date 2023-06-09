import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Image, Keyboard, TouchableOpacity, TouchableWithoutFeedback,  } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { ConstantsText, deviceWidth, } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BallIndicator from '../../../components/BallIndicator';
import TextField from "../../../components/TextField";
import CalenderModal from "../../../components/CalenderModal";
import DropDownField from "../../../components/DropDownField";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import Request from '../../../api/Request'
import showSimpleAlert from '../../../utils/showSimpleAlert';
import moment from 'moment';
import ImagePickerView from '../../../components/ImagePickerView';
import BottomButton from "../../../components/BottomButton";
import StorageService from '../../../utils/StorageService';
import { trackEvent } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';
import { hasNotch } from 'react-native-device-info';
import ModalView from '../../../components/ModalView';

export default function EditChildProfileScreen({ route, navigation }) {
  const [state, setState] = useState({
    isImagePickerVisible: false,
    image: '',
    isFocus: false,
    babyname: '',
    babyduedate: '',
    babyborndate: '',
    typedatelable: '',
    datepicker: false,
    dropdownpicker: false,
    datepicker1: false,
    inches: '',
    ounces: '',
    lbs: '',
    isModalVisible: false,
    child_id: '',
    refMed: useRef(),
    genderData: [{ label: 'Male', value: '1' },
    { label: 'Female', value: '2' },],
    gender: '',
    motherhood_status: 1,
    bloodtypeData: [
      { label: 'A+', value: '1' },
      { label: 'A-', value: '2' },
      { label: 'B+', value: '3' },
      { label: 'B-', value: '4' },
      { label: 'AB+', value: '5' },
      { label: 'AB-', value: '6' },
      { label: 'O+', value: '7' },
      { label: 'O-', value: '8' }],
    nutritionData: [{ label: 'Water', value: '1' },
    { label: 'Formula', value: '2' },
    { label: 'Milk', value: '3' }],
    nutrition: '',
    medicalconcern: '',
    bloodtype: '',
    allergies: '',
    nutritionlable: '',
    bloodtypelable: '',
    genderlable: '',
    isbdate: route.params.isbdate,
    stateMSg: '',
    bdateAdded: false

  })

  useEffect(() => {

    loaddata()

  }, [state.isFocus]);
  const updatedata = async () => {
    let chiledDetail = route.params.childData
    StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS).then(userData => {
      setState(oldState => ({
        ...oldState,
        motherhood_status: userData.motherhood_status,
        child_id: chiledDetail.child_id,
        babyname: chiledDetail.name,
        babyduedate: chiledDetail.due_date,
        babyborndate: chiledDetail.dob,
        gender: chiledDetail.gender ? state.genderData[Number(chiledDetail.gender) - 1] : '',
        image: chiledDetail.image,
        inches: chiledDetail.inches.toString(),
        lbs: chiledDetail.lbs.toString(),
        ounces: chiledDetail.ounces.toString(),
        bloodtype: chiledDetail.blood_type ? state.bloodtypeData[Number(chiledDetail.blood_type) - 1] : '',
        nutrition: chiledDetail.nutrition ? state.nutritionData[Number(chiledDetail.nutrition) - 1] : '',
        bdateAdded: chiledDetail.dob ? true : false,
        medicalconcern: chiledDetail.medical_concerns,
        allergies: chiledDetail.allergies,
        nutritionlable: chiledDetail.nutrition ? state.nutritionData[Number(chiledDetail.nutrition) - 1].label : '',
        bloodtypelable: chiledDetail.blood_type ? state.bloodtypeData[Number(chiledDetail.blood_type) - 1].label : '',
        genderlable: chiledDetail.gender ? state.genderData[Number(chiledDetail.gender) - 1].label : '',
      }));

    }).catch(error => { })
  }
  const loaddata = async () => {
    let chiledDetail = route.params.childData
    await updatedata()
    setTimeout(() => {
      setState(oldState => ({
        ...oldState,
        nutritionData: chiledDetail.dob ? moment().diff(chiledDetail.dob, 'month', true) > 6 ? state.nutritionData : state.nutritionData.filter(item => item.value != '1') : state.nutritionData
      }));
    }, 1000);

  }
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
      nutritionData: moment().diff(date, 'month', true) > 6 ? [{ label: 'Water', value: '1' },
      { label: 'Formula', value: '2' },
      { label: 'Milk', value: '3' }] : state.nutritionData.filter(item => item.value != '1')
    }));
  };
  const onFocus = (values) => {
    setState(oldState => ({
      ...oldState,
      isFocus: values,
    }))
  };
  const onBlur = (values) => {
    setState(oldState => ({
      ...oldState,
      isFocus: values,
    }))
  };
  const handleChangeOfText = (key, value) => {
    setState(oldState => ({
      ...oldState,
      [key]: value,
    }));
  };

  const onGetURI = (image) => {
    //image.path
    setState(oldState => ({
      ...oldState,
      image: image.path,
      isImagePickerVisible: false,
    }));
  };

  const updateChildDetailsApi = async (type) => {
    if (state.babyname.trim() === '') {
      alert(ConstantsText.Pleaseenteryourbabysname)
    }
    else if (state.babyduedate === '') {
      alert(ConstantsText.Pleaseselectbabyduedate)
    }

    else {
      setState(oldState => ({
        ...oldState,
        isModalVisible: true,

      }));
      let objImg = {
        name: 'babyimg.jpg',
        type: 'image/jpeg',
        uri: state.image,
      }
      var data = new FormData()
      data.append('child_id', state.child_id)
      data.append('name', state.babyname.toString().trim())
      data.append('due_date', state.babyduedate)
      data.append('dob', state.babyborndate)
      data.append('gender', state.gender ? state.gender.value : '')
      data.append('image', state.image ? objImg : '')
      data.append('inches', state.inches)
      data.append('lbs', state.lbs)
      data.append('ounces', state.ounces)
      data.append('allergies', state.allergies)
      data.append('blood_type', state.bloodtype ? state.bloodtype.value : '')
      data.append('nutrition', state.nutrition ? state.nutrition.value : '')
      data.append('medical_concerns', state.medicalconcern)
      let response = await Request.postImg('user/save-child-detail', data)
      if (response.status === "SUCCESS") {
        setState(oldState => ({
          ...oldState,
          isModalVisible: false,
          stateMSg: ConstantsText.Congratulations
        }));
        await StorageService.saveItem('childbate', state.babyborndate)
        if (route.params.isbdate) {
          const trackEventparam = { DOB: state.babyborndate }
          trackEvent({ event: 'Add_birth_date', trackEventparam })
          const userData = await StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS);
          userData.motherhood_status = 1
          await StorageService.saveItem(StorageService.STORAGE_KEYS.USER_DETAILS, userData)
          setTimeout(() => {
            setState(oldState => ({
              ...oldState,
              isbdate: false,
            }));
            route.params.onBackRefresh()
            navigation.goBack()
          }, 5000);
        }
        else if (!state.bdateAdded && state.babyborndate != '') {
          const trackEventparam = { DOB: state.babyborndate }
          trackEvent({ event: 'Add_birth_date', trackEventparam })
          setState(oldState => ({
            ...oldState,
            isbdate: true, 
          }));
          const userData = await StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS);
          userData.motherhood_status = 1
          await StorageService.saveItem(StorageService.STORAGE_KEYS.USER_DETAILS, userData)
          setTimeout(() => {
            setState(oldState => ({
              ...oldState,
              isbdate: false,
            }));
            route.params.onBackRefresh()
            navigation.goBack()
          }, 5000);
        }
        else {
          let lbsdata = state.lbs ? state.lbs + ' lbs | ' : ''
          let ouncesdata = state.ounces ? state.ounces + ' ounces' : ''
          const trackEventparam = {
            name: state.babyname.toString().trim(),
            BabyDueDate: state.babyduedate,
            DOB: state.babyborndate,
            gender: state.gender ? state.gender.label : '',
            Height: state.inches,
            Weight: lbsdata + ouncesdata,
            Bloodtype: state.bloodtype ? state.bloodtype.label : '',
            Nutrition: state.nutrition ? state.nutrition.label : '',
            Concerns: state.medicalconcern,
            Allergies: state.allergies,
          }
          trackEvent({ event: 'Edit_Child_Profile', trackEventparam })
          route.params.onBackRefresh()
          navigation.goBack()
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
      <View style={{}}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
            <View>
              <TouchableOpacity onPress={() => setState((oldState) => ({
                ...oldState,
                isImagePickerVisible: (state.motherhood_status == 1 || state.babyborndate) && !state.isbdate ?
                  true : false
              }))} >
                <View style={{ marginTop: 30 }}>
                  <FastImage
                    source={importImages.appicon}
                    style={styles.babyimageStyle}>
                    <FastImage
                      source={{ uri: state.image }}
                      style={styles.babyimageStyle}>
                    </FastImage>
                  </FastImage>
                </View>
                {(state.motherhood_status == 1 || state.babyborndate) && !state.isbdate ? <FastImage source={importImages.editicon} style={styles.editImageStyle}></FastImage> : null}
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 10, }}>
              <Text style={styles.subtitleStyle}>{state.babyname}</Text>
              <Text style={styles.childtextStyle}>{'Child'}</Text>
            </View>
          </View>
          <Text style={styles.childStyle}>{'Child Detail'}</Text>
        </View>
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
          autoCapitalize={'words'}
          returnKeyType={"done"}
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
        {state.motherhood_status == 1 || state.babyborndate ?
          <View >
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
                  value={state.babyborndate ? moment(state.babyborndate).format('MM/DD/YYYY') : ''}
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
              placeholder={state.genderlable ? state.genderlable : 'What is your child’s gender?'}
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
                <Text style={{ color: colors.textLable, fontSize: 16, fontFamily: fonts.rubikRegular, position: 'absolute', right: -30, bottom: 30 }}>{' lbs'}</Text>
              </View>
              <View style={{ marginStart: 50, flexDirection: 'row', }}>
                <TextField
                  key={'ounces'}
                  ref={null}
                  textInputStyle={{ width: 70, }}
                  value={state.ounces}
                  placeholder={'Ounces'}
                  isShowImg={false}
                  onChangeText={(text) => handleChangeOfText("ounces", text)}
                  blurOnSubmit={true}
                  lable={' '}
                  keyboardType={'decimal-pad'}
                  autoCapitalize={'none'}
                  returnKeyType={"done"}
                />
                <Text style={{ color: colors.textLable, fontSize: 16, fontFamily: fonts.rubikRegular, position: 'absolute', right: Platform.OS == 'android' ? -70 : -60, bottom: 30 }}>{'ounces'}</Text>

              </View>


            </View>
            <View style={{ flexDirection: 'row', width: deviceWidth - 50, }}>
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
            <DropDownField
              key={'nutrition'}
              ref={null}
              data={state.nutritionData}
              value={state.nutrition}
              placeholder={state.nutritionlable ? state.nutritionlable : 'What does your baby drink?'}
              ImageSrc={importImages.downarrowIcon}
              isShowImg={true}
              icontype={'1'}

              onChange={(values) => handleChangeOfText("nutrition", values)}
              lable={'Nutrition'}
            />
            <DropDownField
              key={'bloodtype'}
              ref={null}
              data={state.bloodtypeData}
              value={state.bloodtype}
              placeholder={state.bloodtypelable ? state.bloodtypelable : 'What is your child’s blood type?'}
              ImageSrc={importImages.downarrowIcon}
              isShowImg={true}
              icontype={'1'}
              onChange={(values) => handleChangeOfText("bloodtype", values)}
              lable={'Blood Type'}
            />
            <TextField
              key={'allergies'}
              ref={null}
              value={state.allergies}
              placeholder={'Describe your child’s allergies'}
              isShowImg={false}
              onChangeText={(text) => handleChangeOfText("allergies", text)}
              // onSubmitEditing={() => handleSubmitEditing(state.motherInfoData[i + 1])}
              blurOnSubmit={true}
              lable={'Allergies'}
              autoCapitalize={'none'}
              returnKeyType={"done"}
            />
            <TextField
              key={'medicalconcern'}
              inputRef={state.refMed}
              value={state.medicalconcern}
              placeholder={'Any concerns?'}
              isShowImg={false}
              onChangeText={(text) => handleChangeOfText("medicalconcern", text)}
              multiline={true}
              lable={'Concerns'}
              containerStyle={{ marginBottom: hasNotch() ? 120 : 100 }}
              autoCapitalize={'none'}
              textInputStyle={{ height: 110, marginTop: 20, textAlignVertical: 'top' }}
              returnKeyType={"next"}
            />
          </View>
          : null}
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
        leftBtnOnPress={() => navigation.goBack()}
        titleStyle={{ color: colors.background }}
      />
      <View style={styles.container}>
        <Text style={styles.titleStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Edit Child Profile'}</Text>

        <View style={{ flex: 1 }}>
          <KeyboardAwareFlatList
            data={[1]}
            renderItem={renderItem}
            style={{}}
            keyExtractor={(item, index) => index.toString()}
            extraScrollHeight={state.isFocus ? Platform.OS === 'ios' ? 200 : 120 : 0}
            extraHeight={state.isFocus ? 0 : Platform.OS === 'ios' ? -100 : 50}
            showsVerticalScrollIndicator={false}
            keyboardOpeningTime={0}
            keyboardShouldPersistTaps={'handled'}
            enableOnAndroid={true}
            bounces={false}
            enableAutomaticScroll={true}
            enableResetScrollToCoords={true}

          />
          <BottomButton text={'Save'} onPress={() => updateChildDetailsApi()} container={{ position: 'absolute', bottom: 0 }} />
        </View>
      </View>
      {state.isModalVisible &&
        <BallIndicator visible={state.isModalVisible} />
      }
      <ImagePickerView
        visible={state.isImagePickerVisible}
        transparent={true}
        CloseModal={() =>
          setState(oldState => ({
            ...oldState,
            isImagePickerVisible: false,
          }))}
        onGetURI={onGetURI}
      />


      <ModalView
        visible={state.isbdate}
        transparent={true}
        containerstyle={{ width: deviceWidth - 50, backgroundColor: colors.lightPink }}
        showloader={state.isModalVisible}
        components={
          <View>
            {state.stateMSg ?
              <Image source={importImages.bdategif} style={{ width: deviceWidth - 50, height: 150, position: 'absolute', left: -45, }} />
              : null}
            <View style={state.stateMSg ? { height: 150 } : {}}>

              <View style={{ width: deviceWidth - 140, }}>
                {state.stateMSg ?
                  <View style={{ height: 150, justifyContent: 'center' }}>

                    <Text style={{ fontFamily: fonts.rubikBold, fontSize: 23, color: '#323F4B', textAlign: 'center', alignSelf: 'center' }}>{state.stateMSg}</Text>
                  </View>
                  : null}
                <Text style={{ fontFamily: fonts.rubikBold, fontSize: 20, color: '#323F4B', textAlign: 'center' }}>{state.stateMSg ? '' : " Enter " + state.babyname + "’s\nBirth Date"}</Text>
                <TouchableWithoutFeedback onPress={() => { setState(oldState => ({ ...oldState, isbdate: false })), route.params.onBackRefresh(), navigation.goBack() }}>
                  <View style={{ width: 12, height: 12, position: 'absolute', right: -20 }}>
                    <FastImage source={importImages.crossIcon} style={{ height: 19, width: 19 }}></FastImage>
                  </View>
                </TouchableWithoutFeedback>
              </View>
              {!state.stateMSg ?
                <TouchableWithoutFeedback onPress={() => {
                  setState(oldState => ({
                    ...oldState,
                    datepicker1: true,
                    typedatelable: 'When was your baby born?',
                  })),
                    Keyboard.dismiss()
                }
                }>
                  <View style={{ marginTop: 43 }}>
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
                : null}
              {!state.stateMSg ?
                <BottomButton text={'Submit'} onPress={() => updateChildDetailsApi('bdate')} container={{ marginBottom: 20, width: deviceWidth - 510, marginTop: 25 }} />
                : null}
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

          </View>
        }
      />
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
    marginTop: 30,
    color: colors.Blue,
    fontSize: 20,
    fontFamily: fonts.rubikSemiBold,
    color: colors.Blue
  },
  childtextStyle: {
    marginTop: 10,
    fontFamily: fonts.rubikRegular,
    fontSize: 12,
    color: colors.Blue
  },
  babyimageStyle: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
  },
  editImageStyle: {
    height: 25,
    width: 25,
    borderRadius: 25 / 2,
    marginLeft: 30,
    position: 'absolute',
    top: 70
  },
  childStyle: {
    marginTop: 36,
    fontFamily: fonts.rubikBold,
    fontSize: 20,
    color: colors.Black,
    marginBottom: 25

  },
});

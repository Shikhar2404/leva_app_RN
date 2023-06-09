import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, FlatList, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { ConstantsText, deviceWidth, } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BottomButton from "../../../components/BottomButton";
import TextField from "../../../components/TextField";
import CalenderModal from "../../../components/CalenderModal";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import BallIndicator from '../../../components/BallIndicator';
import Request from '../../../api/Request'
import showSimpleAlert from '../../../utils/showSimpleAlert';
import moment from 'moment'
import StorageService from '../../../utils/StorageService';
import ImagePickerView from "../../../components/ImagePickerView";
import { trackEvent } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';
import { hasNotch } from 'react-native-device-info';

export default function EditProfileScreen({ route, navigation }) {
  const [state, setState] = useState({
    name: '',
    youare: "",
    bdate: '',
    profession: '',
    feet: '',
    inches: '',
    weight: "",
    datepicker: false,
    youareData: [{ label: 'A new mom', value: '1' },
    { label: 'An expectant mom', value: '2' },],
    professionData: [{ label: 'Stay at home mom', value: '1' },
    { label: 'Business woman', value: '2' },
    { label: 'Teacher', value: '3' },
    { label: 'Other', value: '4' }],
    isModalVisible: false,
    interest_list: [],
    ImageUri: '',
    youarelable: '',
    professionlable: '',
    interest_ids: [],
    isImagePickerVisible: false,


  })
  useEffect(() => {
    getUserDetails()
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
        interest_list: response.data.interest_list,
        name: response.data.name,
        youare: response.data.motherhood_status.toString(),
        bdate: response.data.dob,
        profession: response.data.profession,
        feet: response.data.feet,
        inches: response.data.inches,
        weight: response.data.weight,
        ImageUri: response.data.image,
        youarelable: response.data.motherhood_status != '' ? state.youareData[Number(response.data.motherhood_status) - 1].label : '',
        professionlable: response.data.profession != '' ? state.professionData[Number(response.data.profession) - 1].label : '',
        interest_ids: response.data.interest_list.map(item => item.interest_id)

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

  const Action_continue = async () => {
    if (state.name.trim() === '') {
      alert(ConstantsText.Pleaseentername)
    }
    else if (state.youare === '') {
      alert(ConstantsText.Pleaseselectmotherhoodstatus)
    }
    else if (state.bdate === '') {
      alert(ConstantsText.PleaseselectbirthDate)
    }
    else if (state.interest_ids.length < 0) {
      alert(ConstantsText.Pleasepickyourinterests)
    }
    else if (Number(state.feet) > 9) {
      alert(ConstantsText.Pleaseentervalidfeet)
    }
    else if (Number(state.inches) > 12) {
      alert(ConstantsText.Pleaseentervalidinches)
    }
    else {
      setState(oldState => ({
        ...oldState,
        isModalVisible: true
      }));
      let param = {
        name: state.name.trim(),
        motherhood_status: state.youare,
        dob: state.bdate,
        profession: state.profession.value,
        weight: state.weight,
        feet: state.feet,
        inches: state.inches,
        interest_ids: state.interest_ids
      }
      let response = await Request.post('user/update-profile', param)

      setState(oldState => ({
        ...oldState,
        isModalVisible: false
      }));
      if (response.status === "SUCCESS") {
        let feetdata = state.feet ? state.feet + ' ft | ' : ''
        let inchesdata = state.inches ? state.inches + ' in' : ''
        const trackEventparam = {
          name: state.name, status: state.youare == '1' ? 'A new mom' : 'An expectant mom',
          DOB: state.bdate, Height: feetdata + inchesdata, Weight: state.weight
        }
        trackEvent({ event: 'Edit_Mother_Profile', trackEventparam })
        const userData = await StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS);
        userData.profession = response.data.user.profession
        userData.motherhood_status = Number(state.youare)
        userData.name = response.data.user.name
        await StorageService.saveItem(StorageService.STORAGE_KEYS.USER_DETAILS, userData)
        alert(response.message)
        navigation.goBack()
      }
      else {
        if (response) {
          showSimpleAlert(response.message)
        }
      }
    }
  }
  const getDate = (date) => {
    setState(oldState => ({
      ...oldState,
      bdate: date,
      datepicker: false,
    }));

  };
  const handleChangeOfText = (key, value) => {
    setState(oldState => ({
      ...oldState,
      [key]: value,
    }));

  };
  const onGetURI = (image) => {
    setState(oldState => ({
      ...oldState,
      isImagePickerVisible: false,
      ImageUri: image.path,
    }));
    Update_Profile(image.path)

  };
  const refresh = (item, alldata) => {
    setState(oldState => ({
      ...oldState,
      interest_list: alldata,
      interest_ids: item
    }));
  }
  const Update_Profile = async (path) => {
    setState(oldState => ({
      ...oldState,
      isModalVisible: true
    }));
    let formData = new FormData()
    let objImg = {
      name: 'image.jpg',
      type: 'image/jpeg',
      uri: path,
    }
    formData.append('image', objImg)
    let response = await Request.postImg('user/update-profile-picture', formData)

    setState(oldState => ({
      ...oldState,
      isModalVisible: false
    }));
    if (response.status === "SUCCESS") {
      const userData = await StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS);
      userData.image = response.data.user.image

      await StorageService.saveItem(StorageService.STORAGE_KEYS.USER_DETAILS, userData)
    }
    else {
      if (response) {
        showSimpleAlert(response.message)
      }
    }

  }
  const delete_Item = (items) => {
    state.interest_list = state.interest_list.filter(item => item.interest_id != items.interest_id),
      setState(oldState => ({
        ...oldState,
        interest_ids: state.interest_list.map(item => item.interest_id)
      }));
  }
  const renderItemInterest = ({ item, index }) => {
    if (item.interest_id != '1') {

      return (

        <View style={{ marginBottom: 10, marginEnd: 10, }}>
          <View style={{ borderRadius: 10, height: 42, backgroundColor: colors.Darkpink, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.InterestTextStyle}  >{item.name}</Text>
          </View>
          <View style={{ height: 30, width: 30, position: 'absolute', right: -13, top: -13, justifyContent: 'center', alignItems: 'center', }}>
            <TouchableWithoutFeedback onPress={() => delete_Item(item)} style={{ height: '100%', width: 30, justifyContent: 'center', alignItems: 'center', }}>
              <FastImage source={importImages.closeicon} style={{ height: 16, width: 16 }} ></FastImage>
            </TouchableWithoutFeedback>
          </View>
        </View>
      );
    }
    else {
      return (

        <View style={{ marginBottom: 10, justifyContent: 'center', }}>
          <TouchableOpacity onPress={() => navigation.navigate('PickYourInterestsScreen', { from: 'edit', fromDataS: state.interest_list, onGoBack: (item, alldata) => refresh(item, alldata), })}>
            <View style={{ height: 42, width: (deviceWidth - 60) / 3, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.Blue, borderRadius: 10, }}>
              <Text style={[styles.InterestTextStyle.color, { color: colors.White }]} >{item.name}</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  }
  const renderItem = ({ item, index }) => {
    return (

      <View>
        <View style={[{ flexDirection: 'row', alignItems: 'center', }]}>
          <TouchableWithoutFeedback onPress={() =>
            setState(oldState => ({
              ...oldState,
              isImagePickerVisible: true
            }))}>
            <View style={{}}>
              <FastImage
                source={importImages.defaultProfileImg}
                style={{ width: 60, height: 60, borderRadius: 60 / 2 }} >
                <FastImage
                  source={{ uri: state.ImageUri }}
                  style={{ width: 60, height: 60, borderRadius: 60 / 2 }} ></FastImage>
              </FastImage>
              <View style={{ position: 'absolute', right: -3, bottom: -3 }}>
                <FastImage source={importImages.editicon} style={{ height: 25, width: 25 }}></FastImage>
              </View>
            </View>
          </TouchableWithoutFeedback>
          <View>
            <Text style={styles.TextStyle}>{state.name}</Text>
            <Text style={[styles.TextStyle, { fontFamily: fonts.rubikRegular, fontSize: 12, }]}>{state.professionlable}</Text>
          </View>
        </View>

        <View style={{ marginTop: 35 }}>
          <Text style={styles.headingTextStyle}>{'My Details'}</Text>

        </View>
        <View style={{ marginTop: 20 }}>
          <TextField
            key={'name'}
            ref={null}
            value={state.name}
            placeholder={'First name'}
            onChangeText={(text) => handleChangeOfText("name", text, 0)}
            blurOnSubmit={true}
            lable={'Name'}
            autoCapitalize={'words'}
            returnKeyType={"done"}
          />
          <Text style={{ fontSize: 12, color: colors.textLable, fontFamily: fonts.rubikRegular, textTransform: 'capitalize' }}>{'You Are...'}</Text>
          <View style={{ flexDirection: 'row', width: deviceWidth - 50, marginTop: 10, marginBottom: 10, }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, youare: '1' }))}>
                <View style={{ backgroundColor: colors.Darkpink, height: 26, width: 26, borderRadius: 26 / 2, alignItems: 'center', justifyContent: 'center', borderWidth: state.youare === '1' ? 1 : 0, borderColor: colors.Blue }}>
                  <View style={{ backgroundColor: state.youare === '1' ? colors.Blue : colors.White, height: 11.66, width: 11.66, borderRadius: 11.66 / 2 }}>
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <Text style={{ color: colors.textLable, fontFamily: fonts.rubikRegular, fontSize: 16, marginStart: 15 }}>{'A new mom'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginStart: 20, }}>
              <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, youare: '2' }))}>
                <View style={{ backgroundColor: colors.Darkpink, height: 26, width: 26, borderRadius: 26 / 2, alignItems: 'center', justifyContent: 'center', borderWidth: state.youare === '2' ? 1 : 0, borderColor: colors.Blue }}>
                  <View style={{ backgroundColor: state.youare === '2' ? colors.Blue : colors.White, height: 11.66, width: 11.66, borderRadius: 11.66 / 2 }}>
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <Text style={{ color: colors.textLable, fontFamily: fonts.rubikRegular, fontSize: 16, marginStart: 15 }}>{'An expectant\nmom'}</Text>
            </View>
          </View>
          <TouchableWithoutFeedback onPress={() =>
            setState(oldState => ({
              ...oldState,
              datepicker: true,
            }))}>
            <View>
              <TextField
                key={'bdate'}
                ref={null}
                value={state.bdate != '' ? moment(state.bdate).format('MM/DD/YYYY') : ''}
                placeholder={'DOB'}
                isShowImg={true}
                onChangeText={(text) => handleChangeOfText("bdate", text)}
                blurOnSubmit={false}
                lable={'Birth Date'}
                editable={false}
                isClear={state.bdate === '' ? false : true}
                type={'bdate'}
                isONClear={() => setState(oldState => ({ ...oldState, bdate: '', datepicker: false, }))}
                autoCapitalize={'none'}
                returnKeyType={"next"}
              />
            </View>
          </TouchableWithoutFeedback>



          <View style={{ flexDirection: 'row', width: deviceWidth - 50, }}>
            <View style={{ flexDirection: 'row', }}>

              <TextField
                key={'feet'}
                textInputStyle={{ width: 70 }}
                ref={null}
                value={state.feet}
                placeholder={'Feet'}
                isShowImg={false}
                onChangeText={(text) => handleChangeOfText("feet", text)}
                blurOnSubmit={true}
                lable={'Height'}
                keyboardType={'decimal-pad'}
                autoCapitalize={'none'}
                returnKeyType={"done"}
              />
              <Text style={{ color: colors.textLable, fontSize: 16, fontFamily: fonts.rubikRegular, position: 'absolute', right: -20, bottom: 30 }}>{' ft'}</Text>

            </View>
            <View style={{ marginStart: 30, flexDirection: 'row', }}>
              <TextField
                key={'Inches'}
                ref={null}
                textInputStyle={{ width: 70, }}
                value={state.inches}
                placeholder={'Inches'}
                isShowImg={false}
                lable={' '}
                onChangeText={(text) => handleChangeOfText("inches", text)}
                blurOnSubmit={true}
                keyboardType={'decimal-pad'}
                autoCapitalize={'none'}
                returnKeyType={"done"}
              />
              <Text style={{ color: colors.textLable, fontSize: 16, fontFamily: fonts.rubikRegular, position: 'absolute', right: -20, bottom: 30 }}>{' in'}</Text>
            </View>

          </View>
          <TextField
            key={'weight'}
            ref={null}
            value={state.weight}
            placeholder={'How much do you weigh? (lbs)'}
            onChangeText={(text) => handleChangeOfText("weight", text)}
            blurOnSubmit={true}
            lable={'Weight (lbs)'}
            keyboardType={'decimal-pad'}
            autoCapitalize={'none'}
            returnKeyType={"done"}
            lableStyle={{ textTransform: 'none' }}

          />
        </View>
        <CalenderModal
          visible={state.datepicker}
          transparent={true}
          type=''
          lable='DOB'
          maxDate={new Date()}
          valuesdate={state.bdate === '' ? moment(new Date()).format('YYYY-MM-DD') : state.bdate}
          getDate={getDate}
          CloseModal={() =>
            setState(oldState => ({
              ...oldState,
              bdate: state.bdate,
              datepicker: false,
            }))} />
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
        <View style={{ marginTop: 20 }}>
          <Text style={styles.headingTextStyle}>{'Interests'}</Text>
          <FlatList
            data={state.interest_list}
            renderItem={renderItemInterest}
            bounces={false}
            key={index}
            numColumns={5}
            columnWrapperStyle={{ flexWrap: "wrap" }}
            style={{ marginTop: 20, marginBottom: hasNotch() ? 130 : 110 }}
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
        leftBtnOnPress={() => navigation.goBack()}
        titleStyle={{ color: colors.background }}
      />

      <View style={styles.container}>


        <View>
          <Text style={styles.titleStyle}>{'Edit Mother Profile'}</Text>
        </View>
        <View style={{ flex: 1, }}>
          <KeyboardAwareFlatList
            data={['1']}
            renderItem={renderItem}
            style={{ marginTop: 28 }}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraHeight={Platform.OS === 'ios' ? -75 : 50}
            keyboardOpeningTime={0}
            resetScrollToCoords={false}
            keyboardShouldPersistTaps={'handled'}
            bounces={false}
          />
          <BottomButton text={'Save'} onPress={() => Action_continue()} container={{ position: 'absolute', bottom: 0 }} />

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
  TextStyle: {
    fontFamily: fonts.rubikSemiBold,
    color: colors.Blue,
    marginStart: 10,
    fontSize: 20
  },
  InterestTextStyle: {
    fontFamily: fonts.rubikRegular,
    color: colors.Blue,
    fontSize: 15,
    marginStart: 10, marginEnd: 10,
    textAlign: 'center'
  },
  headingTextStyle: {
    fontFamily: fonts.rubikSemiBold,
    color: colors.Blue,
    fontSize: 20
  },

});

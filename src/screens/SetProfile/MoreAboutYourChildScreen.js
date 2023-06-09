import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet,TouchableWithoutFeedback, Platform } from 'react-native';
import { colors } from '../../utils/color'
import { fonts, stylesBackground } from '../../utils/font'
import { deviceWidth, } from '../../constants'
import { importImages } from '../../utils/importImages'
import Header from "../../components/Header";
import BottomButton from "../../components/BottomButton";
import TextField from "../../components/TextField";
import DropDownField from "../../components/DropDownField";
import ImagePickerView from "../../components/ImagePickerView";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import BallIndicator from '../../components/BallIndicator';
import Request from '../../api/Request'
import showSimpleAlert from '../../utils/showSimpleAlert';
import NavigationService from '../../utils/NavigationService'
import FastImage from 'react-native-fast-image';
import { hasNotch } from 'react-native-device-info';
import moment from 'moment';
import { trackEvent } from '../../utils/tracking';
export default function MoreAboutYourChildScreen({ route, navigation }) {
  const [state, setState] = useState({
    bloodtype: '',
    allergies: '',
    ImageUri: '',
    bloodtypeData: [
      { label: 'A+', value: '1' },
      { label: 'A-', value: '2' },
      { label: 'B+', value: '3' },
      { label: 'B-', value: '4' },
      { label: 'AB+', value: '5' },
      { label: 'AB-', value: '6' },
      { label: 'O+', value: '7' },
      { label: 'O-', value: '8' }],
    isImagePickerVisible: false,
    isModalVisible: false,
    child_id: route.params.child_id,
    nutrition: '',
    medicalconcern: '',
    isFocus: false,
    nutritionData: [{ label: 'Water', value: '1' },
    { label: 'Formula', value: '2' },
    { label: 'Milk', value: '3' }],
  })
  const handleChangeOfText = (key, value) => {
    setState(oldState => ({
      ...oldState,
      [key]: value,
    }));

  };
  useEffect(() => {
    setState(oldState => ({
      ...oldState,
      nutritionData: route.params.bdate ? moment().diff(route.params.bdate, 'month', true) > 6 ? state.nutritionData : state.nutritionData.filter(item => item.value != '1') : state.nutritionData,
    }))

  }, [state.isFocus]);
  const onGetURI = (image) => {
    setState(oldState => ({
      ...oldState,
      isImagePickerVisible: false,
      ImageUri: image.path
    }))
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

  const Action_continue = async () => {

    setState(oldState => ({
      ...oldState,
      isModalVisible: true
    }));
    let formData = new FormData()
    let objImg = {
      name: 'babyimg.jpg',
      type: 'image/jpeg',
      uri: state.ImageUri,
    }

    formData.append('child_id', state.child_id)
    formData.append('allergies', state.allergies)
    formData.append('blood_type', state.bloodtype != '' ? state.bloodtype.value : '')
    formData.append('nutrition', state.nutrition != '' ? state.nutrition.value : '')
    formData.append('medical_concerns', state.medicalconcern)
    formData.append('image', state.ImageUri != '' ? objImg : '')
    let response = await Request.postImg('user/save-child-detail', formData)
    setState(oldState => ({
      ...oldState,
      isModalVisible: false
    }));
    if (response.status === "SUCCESS") {
      const trackEventparam = { Nutrition: state.nutrition != '' ? state.nutrition.value : '', Bloodtype: state.bloodtype != '' ? state.bloodtype.value : '', Allergies:state.allergies, Concerns: state.medicalconcern }
      trackEvent({ event: 'More_About_Your_Child', trackEventparam })
      NavigationService.resetAction('DrawerNavigation')
    }
    else {
      if (response) {
        showSimpleAlert(response.message)
      }
    }

  }
  const renderItem = ({ item, index }) => {
    return (

      <View>
        <View style={{ alignItems: 'center', }}>
          <TouchableWithoutFeedback onPress={() =>
            setState(oldState => ({
              ...oldState,
              isImagePickerVisible: true
            }))}>
            <View style={{ marginBottom: 35, alignItems: 'center', justifyContent: 'center', width: 174, height: 174, borderRadius: 174 / 2, }}>
              <FastImage source={state.ImageUri != '' ? { uri: state.ImageUri } : importImages.ProfileIcon} style={{ width: 174, height: 174, borderRadius: 174 / 2 }}></FastImage>
              {state.ImageUri != '' ? null
                :
                <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', }}>
                  <FastImage source={importImages.ProfileIconEdit} style={{ height: 57, width: 57 }} ></FastImage>
                </View>}
            </View>
          </TouchableWithoutFeedback>
        </View>

        <DropDownField
          key={'nutrition'}
          ref={null}
          data={state.nutritionData}
          value={state.nutrition}
          placeholder={'What does your baby drink?'}
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
          placeholder={'What is your child’s blood type?'}
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
          // blurOnSubmit={true}
          onFocus={onFocus}
          onBlur={onBlur}
          multiline={true}
          lable={'Concerns'}
          containerStyle={{ marginBottom: hasNotch() ? 120 : 100 }}
          autoCapitalize={'none'}
          textInputStyle={{ height: 110, marginTop: 20, textAlignVertical: 'top' }}
          returnKeyType={"next"}
        />

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


        <View>
          <Text style={styles.titleStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'More About Your Child'}</Text>
          <Text style={styles.subtitleStyle}>{'Optional'}</Text>
        </View>
        <View style={{ flex: 1, }}>
          <KeyboardAwareFlatList
            data={[1]}
            renderItem={renderItem}
            style={{ marginTop: 30 }}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            keyboardOpeningTime={0}
            extraScrollHeight={state.isFocus ? Platform.OS === 'ios' ? 200 : 120 : 0}
            extraHeight={state.isFocus ? 0 : Platform.OS === 'ios' ? -100 : 50}
            keyboardShouldPersistTaps={'handled'}
            bounces={false}
          />
          <BottomButton text={'Continue'} onPress={() => Action_continue()} container={{ position: 'absolute', bottom: 0 }} />

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
  subtitleStyle: {
    marginTop: 10,
    color: colors.Blue,
    fontSize: 16,
    fontFamily: fonts.rubikRegular,
    opacity: 0.7

  },

});

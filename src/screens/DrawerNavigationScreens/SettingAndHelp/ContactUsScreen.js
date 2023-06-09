import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet,  } from 'react-native';
import { colors } from '../../../utils/color'
import { ConstantsText, deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import { fonts, stylesBackground } from '../../../utils/font'
import TextField from '../../../components/TextField';
import BottomButton from "../../../components/BottomButton";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BallIndicator from '../../../components/BallIndicator';
import Request from '../../../api/Request';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import StorageService from '../../../utils/StorageService';
import { trackEvent } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';

export default function ContactUsScreen({ route, navigation }) {
    const [state, setState] = useState({
        name: '',
        email:"",
        msg: '',
        streref: useRef(),
        strmsfref: useRef(),
        isFocus: false,
        isModalVisible: false,

    })
    useEffect(() => {
        StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS).then(data =>
          {
            setState(oldState => ({
              ...oldState,
              name: data.name,
              email:data.email
            }));
    
          });
         }, [state.isFocus]);
 
    const submitButtonValidation = () => {
        const ConfirmValid = validationofPage();
        if (ConfirmValid) {
            ContactUsApi();
        }
    }
    const ContactUsApi = async () => {
        
        setState(oldState => ({
            ...oldState,
            isModalVisible: true
        }));
        let params = {
            name: state.name,
            email: state.email,
            message: state.msg
        }
        let response = await Request.post('user/add-contact-us', params)
        const trackEventparam = { action: state.msg }
        trackEvent({ event: 'Contact_Us', trackEventparam })
        setState(oldState => ({
            ...oldState,
            isModalVisible: false
        }));
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
    const validationofPage = () => {
        if (state.msg.trim() === '') {
            alert(ConstantsText.pleaseenterhowmaywehelpyou)
            return false;
        }
        else {
            return true
        }
    }
    const handleChangeOfText = (key, value) => {
        setState(oldState => ({
            ...oldState,
            [key]: value,
        }));
    };
    const handleSubmitEditing = (nextTextField) => {
        if (nextTextField) {
            nextTextField.current.focus();
        } else {
            Keyboard.dismiss();
        }
    }
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
                    <Text style={styles.titleStyle}>{'Contact Us'}</Text>
                </View>
                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                    extraScrollHeight={state.isFocus ? Platform.OS === 'ios' ? 200 : 120 : 0}
                    extraHeight={state.isFocus ? 0 : Platform.OS === 'ios' ? -100 : 50}
                    keyboardOpeningTime={0}
                    keyboardShouldPersistTaps={'handled'}
                    bounces={false}
                >
                    <View style={{ marginTop: 38, flex: 1 }}>
                        <TextField
                            key={'name'}
                            ref={null}
                            value={state.name}
                            ImageSrc={importImages.userIcon}
                            placeholder={'First name'}
                            onChangeText={(text) => handleChangeOfText("name", text)}
                            blurOnSubmit={false}
                            lable={'Name'}
                            autoCapitalize={'none'}
                            returnKeyType={"next"}
                            onSubmitEditing={() => handleSubmitEditing(state.streref)}
                        />

                        <TextField
                            key={'email'}
                            value={state.email}
                            ImageSrc={importImages.emailicon}
                            inputRef={state.streref}
                            placeholder={'Type your email address'}
                            onChangeText={(text) => handleChangeOfText("email", text)}
                            blurOnSubmit={false}
                            lable={'E-mail'}
                            keyboardType={'email-address'}
                            autoCapitalize={'none'}
                            returnKeyType={"next"}
                            onSubmitEditing={() => handleSubmitEditing(state.strmsfref)}
                        />
                        <TextField
                            key={'msg'}
                            value={state.msg}
                            inputRef={state.strmsfref}
                            placeholder={''}
                            onChangeText={(text) => handleChangeOfText("msg", text)}
                            blurOnSubmit={true}
                            lable={'How May we Help you?'}
                            multiline={true}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            maxLength={200}
                            containerStyle={{ marginBottom: 50 }}
                            autoCapitalize={'none'}
                            textInputStyle={{ height: 110, marginTop: 20, textAlignVertical: 'top' }}
                            returnKeyType={"next"}
                        />
                    </View>
                </KeyboardAwareScrollView>
                <BottomButton text={'Submit'} onPress={() => submitButtonValidation()} container={{ position: 'absolute', bottom: -10 }} />

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
        fontSize: 30,
        fontFamily: fonts.rubikBold,
    },
    subtitleStyle: {
        marginTop: 10,
        color: colors.Blue,
        fontSize: 16,
        fontFamily: fonts.rubikRegular,
        opacity: 0.7

    },

});

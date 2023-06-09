import React, { useState,  useRef } from 'react';
import { View, Text, StyleSheet,  TouchableOpacity, Keyboard } from 'react-native';
import { colors } from '../../../utils/color'
import { ConstantsText, deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import { fonts, stylesBackground } from '../../../utils/font'
import TextField from '../../../components/TextField';
import BottomButton from "../../../components/BottomButton";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Request from '../../../api/Request';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import BallIndicator from '../../../components/BallIndicator';
import FastImage from 'react-native-fast-image';

export default function ChangePasswordScreen({ route, navigation }) {
    const [state, setState] = useState({
        password: '',
        npassword: '',
        cpassword: '',
        passref: useRef(),
        passrefc: useRef(),
        isModalVisible: false

    })
    const submitButtonValidation = () => {
        const ConfirmValid = validationofPage();
        if (ConfirmValid) {
            changePasswordApi();
        }
    }
    const changePasswordApi = async () => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true
        }));
        let params = {
            password: state.password,
            new_password: state.npassword,
            confirm_password: state.cpassword
        }
        let response = await Request.post('user/change-password', params)
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
        const strongRegexpass = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})");
        if (state.password === '') {
            alert(ConstantsText.Pleaseentercurrentpassword)
            return false;
        }
        else if (!strongRegexpass.test(state.password)) {
            alert(ConstantsText.PasswordVaild)
            return false;
        }
        else if (state.npassword === '') {
            alert(ConstantsText.Pleaseenternewpassword)
            return false;
        }
        else if (!strongRegexpass.test(state.npassword)) {
            alert(ConstantsText.PasswordVaild)
            return false;
        }
        else if (state.cpassword === '') {
            alert(ConstantsText.Pleaseenterreenterpassword)
            return false;
        }
        else if (state.npassword != state.cpassword) {
            alert(ConstantsText.Newpasswordandreenterpassworddosenotmatch)
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
                    <Text style={styles.titleStyle}>{'Change Password'}</Text>
                </View>
                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                    extraHeight={Platform.OS === 'ios' ? -75 : 50}
                    keyboardOpeningTime={0}
                    keyboardShouldPersistTaps={'handled'}
                    bounces={false}
                >
                    <View style={{ marginTop: 38, flex: 1 }}>
                        <TextField
                            key={'password'}
                            ref={null}
                            value={state.password}
                            placeholder={'Type your Current Password'}
                            onChangeText={(text) => handleChangeOfText("password", text)}
                            blurOnSubmit={false}
                            onSubmitEditing={() => handleSubmitEditing(state.passref)}
                            lable={'Current Password'}
                            autoCapitalize={'none'}
                            returnKeyType={"next"}
                            secureTextEntry={true}
                            isPasswordField={true}
                        />
                        <TouchableOpacity style={styles.forgotAreaStyle} onPress={() => navigation.navigate('ResetPasswordScreen')}>
                            <Text style={styles.forgetTextStyle}>{'Forgot Password?'}</Text>
                        </TouchableOpacity>
                        <TextField
                            key={'npassword'}
                            inputRef={state.passref}
                            value={state.npassword}
                            placeholder={'Type your New Password'}
                            onChangeText={(text) => handleChangeOfText("npassword", text)}
                            blurOnSubmit={false}
                            onSubmitEditing={() => handleSubmitEditing(state.passrefc)}
                            lable={'Create New Password'}
                            autoCapitalize={'none'}
                            returnKeyType={"next"}
                            secureTextEntry={true}
                            isPasswordField={true}
                        />
                        <TextField
                            key={'cpassword'}
                            value={state.cpassword}
                            inputRef={state.passrefc}
                            containerStyle={{ marginBottom: 50 }}
                            placeholder={'Re-enter New Password'}
                            onChangeText={(text) => handleChangeOfText("cpassword", text)}
                            blurOnSubmit={true}
                            lable={'Re-enter New Password'}
                            autoCapitalize={'none'}
                            returnKeyType={"done"}
                            secureTextEntry={true}
                            isPasswordField={true}
                        />
                    </View>
                </KeyboardAwareScrollView>
                <BottomButton text={'Save Changes'} onPress={() => submitButtonValidation()} container={{ position: 'absolute', bottom: -10 }} />

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
    forgetTextStyle: {
        fontFamily: fonts.rubikSemiBold,
        color: colors.Blue
    },
    forgotAreaStyle: {
        fontSize: 12,
        alignSelf: 'flex-end',
        marginBottom: 30
    },
});

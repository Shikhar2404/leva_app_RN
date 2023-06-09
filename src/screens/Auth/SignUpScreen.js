import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../../utils/color'
import { ConstantsText,  deviceWidth } from '../../constants';
import { importImages } from '../../utils/importImages';
import { fonts, stylesBackground } from '../../utils/font'
import TextField from '../../components/TextField';
import { Image, Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BottomButton from '../../components/BottomButton';
import { hasNotch } from 'react-native-device-info';
import Header from '../../components/Header';
import NavigationService from '../../utils/NavigationService'
import Request from '../../api/Request';
import showSimpleAlert from '../../utils/showSimpleAlert';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import BallIndicator from '../../components/BallIndicator';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';
import StorageService from '../../utils/StorageService';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { trackEvent } from '../../utils/tracking';
import FastImage from 'react-native-fast-image';
import apiConfigs from '../../api/apiConfig';

export default function SignUpScreen({ route, navigation }) {
    const [state, setState] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        facebook_id: '',
        apple_id: '',
        google_id: '',
        isModalVisible: false,
        passref: useRef(),
        isAcceptPrivacy: false

    })
    useEffect(() => {
        GoogleSignin.configure({
            webClientId:
                '924524413163-t65ikhn64qo6dhu0h4hde5925n4vdt80.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
            offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
        });
    }, []);
    const handleChangeOfText = (key, value) => {
        setState(oldState => ({
            ...oldState,
            [key]: value,
            facebook_id: '',
            apple_id: '',
            google_id: '',
        }));
    };
    const validationofPage = () => {
        const strongRegex = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$");
        const strongRegexpass = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})");

        if (state.email === '') {
            alert(ConstantsText.Pleaseenteremail)
            return false;
        }
        else if (!strongRegex.test(state.email)) {
            alert(ConstantsText.Pleaseenteravalidemail)
            return false;
        }
        else if (state.password === '') {
            alert(ConstantsText.Pleaseenterpassword)
            return false;
        }
        else if (!strongRegexpass.test(state.password)) {
            alert(ConstantsText.PasswordVaild)
            return false;
        }
        else if (!state.isAcceptPrivacy) {
            alert(ConstantsText.PrivacyTerms)
            return false;
        }
        else {
            SignUPAPI('1')
        }
    }
    const loginWithApple = async () => {
        if (!state.isAcceptPrivacy) {
            alert(ConstantsText.PrivacyTerms)
        }
        else {
            try {
                const appleAuthRequestResponse = await appleAuth.performRequest({
                    requestedOperation: appleAuth.Operation.LOGIN,
                    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
                });

                if (appleAuthRequestResponse) {
                    const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
                    if (credentialState === appleAuth.State.AUTHORIZED) {
                        if (appleAuthRequestResponse.user) {
                            state.email = appleAuthRequestResponse.email == null ? '' : appleAuthRequestResponse.email
                            state.first_name = appleAuthRequestResponse.fullName.givenName == null ? '' : appleAuthRequestResponse.fullName.givenName
                            state.first_name = appleAuthRequestResponse.fullName.familyName ? state.first_name + ' ' + appleAuthRequestResponse.fullName.familyName : state.first_name + ''
                            state.password = ''
                            state.facebook_id = ''
                            state.apple_id = appleAuthRequestResponse.user
                            state.google_id = ''
                            SignUPAPI('4')
                        }
                    }
                    else if (credentialState === appleAuth.State.NOT_FOUND) {
                    }
                    else if (credentialState === appleAuth.State.REVOKED) {
                    }
                    else if (credentialState === appleAuth.State.TRANSFERRED) {
                    }
                    else {
                    }
                }
            } catch (error) {
                if (!appleAuth.isSupported) {
                    showSimpleAlert(ConstantsText.applemsg)
                }
            }
        }
    }
    const handleSubmitEditing = (nextTextField) => {
        if (nextTextField) {
            nextTextField.current.focus();
        } else {
            Keyboard.dismiss();
        }
    }
    /**Coding for Google Icon */
    const loginWithGoogle = async () => {
        if (!state.isAcceptPrivacy) {
            alert(ConstantsText.PrivacyTerms)
        }
        else {
            try {
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();
                state.email = userInfo.user.email ? userInfo.user.email : ''
                state.password = ''
                state.facebook_id = ''
                state.apple_id = ''
                state.google_id = userInfo.user.id
                SignUPAPI('2')
            } catch (error) {
                if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                    // user cancelled the login flow
                } else if (error.code === statusCodes.IN_PROGRESS) {
                    // operation (e.g. sign in) is in progress already
                } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                    // play services not available or outdated
                } else {
                    // some other error happened
                }
            }
        }
    }

    //API Calling
    const SignUPAPI = async (type) => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true
        }));
        let para = {
            register_type: type,
            email: state.email,
            password: state.password,
            google_id: state.google_id,
            facebook_id: state.facebook_id,
            apple_id: state.apple_id,
            name: state.first_name
        }
        let response = await Request.post('user/sign-up', para)
        const trackEventparam = { action: type == '1' ? 'Email Sign Up' : type == '2' ? 'Google Sign Up' : type == '3' ? 'Facebook Sign Up' : 'Apple Sign Up' }
        trackEvent({ event: 'Create_Account', trackEventparam })
        setState(oldState => ({
            ...oldState,
            isModalVisible: false
        }));
        if (response.status === "SUCCESS") {
            if (!(response.data && Object.keys(response.data).length === 0 && Object.getPrototypeOf(response.data) === Object.prototype)) {
                if (!response.data.is_interest_selected) {
                    Request.setToken(response.data.token)
                    await StorageService.saveItem(StorageService.STORAGE_KEYS.USER_DETAILS, response.data)
                    NavigationService.resetAction('PickYourInterestsScreen', { from: '' })
                }
                else if (!response.data.is_mother_detail_added) {
                    Request.setToken(response.data.token)
                    await StorageService.saveItem(StorageService.STORAGE_KEYS.USER_DETAILS, response.data)
                    NavigationService.resetAction('MotherInformationScreen', { from: 'login' })
                }
                else if (!response.data.is_child_detail_added) {
                    Request.setToken(response.data.token)
                    await StorageService.saveItem(StorageService.STORAGE_KEYS.USER_DETAILS, response.data)
                    NavigationService.resetAction('ChildInformationScreen', { from: 'login' })
                }
                else {
                    Request.setToken(response.data.token)
                    await StorageService.saveItem(StorageService.STORAGE_KEYS.USER_DETAILS, response.data)
                    NavigationService.resetAction('DrawerNavigation')
                }
            }
            else {
                NavigationService.resetAction('CheckyourEmailScreen', { email: state.email })

            }

        }
        else {
            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }

    /**Coding for Facbook Icon */
    const loginWithFacebook = () => {
        if (!state.isAcceptPrivacy) {
            alert(ConstantsText.PrivacyTerms)
        }
        else {
            LoginManager.logOut()
            LoginManager.logInWithPermissions(['public_profile', 'email']).then(
                function (result) {
                    if (result.isCancelled) {
                    } else {
                        AccessToken.getCurrentAccessToken().then((data) => {
                            // const { accessToken } = datapicture.type(large),
                            fetch('https://graph.facebook.com/v2.5/me?fields=email,name,first_name,last_name,friends&access_token=' + data.accessToken)
                                .then((response) => response.json())
                                .then((json) => {
                                    state.email = json.email ? json.email : ''
                                    state.password = ''
                                    state.facebook_id = json.id
                                    state.apple_id = ''
                                    state.google_id = ''
                                    SignUPAPI('3')
                                })
                                .catch((error) => {
                                })
                        })
                    }
                },
                function (error) {
                }
            )
        }
    };
    return (
        <View style={stylesBackground.container}>
            <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
            <Header
                headerTitle={''}
                leftBtnOnPress={null}
                titleStyle={{ color: colors.background }}
            />
            <View style={styles.container}>
                <Text style={styles.SignInTextStyle}>{'Create Account'}</Text>
                <Text style={styles.welcomeTestStyle}>{"Enter your info to sign up and start your Leva journey"}</Text>

                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                    extraHeight={Platform.OS === 'ios' ? -75 : 50}
                    keyboardOpeningTime={0}
                    keyboardShouldPersistTaps={'handled'}
                    bounces={true}
                >

                    <View style={{ alignSelf: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 43, }}>
                        <TouchableOpacity onPress={() => loginWithGoogle()}>
                            <Image source={importImages.googleIcon} />
                        </TouchableOpacity>
                        {Platform.OS === 'ios' ? <TouchableOpacity onPress={() => loginWithApple()} style={{ marginStart: 30 }}>
                            <Image source={importImages.appleicon} />
                        </TouchableOpacity>
                            : null}
                        <TouchableOpacity onPress={() => loginWithFacebook()} style={{ marginStart: 30, }}>
                            <Image source={importImages.facebookIcon} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.createUsingTextStyle}>{'Or sign up with email'}</Text>
                    <View style={{ marginTop: 30 }}>

                        <TextField
                            key={'email'}
                            ref={null}
                            value={state.email}
                            placeholder={'Type your email address'}
                            ImageSrc={importImages.emailicon}
                            isShowImg={true}
                            onChangeText={(text) => handleChangeOfText("email", text)}
                            onSubmitEditing={() => handleSubmitEditing(state.passref)}
                            blurOnSubmit={false}
                            lable={'E-mail'}
                            keyboardType={'email-address'}
                            autoCapitalize={'none'}
                            returnKeyType={"next"}
                        />
                        <TextField
                            key={'password'}
                            inputRef={state.passref}
                            value={state.password}
                            placeholder={'Type your Password'}
                            onChangeText={(text) => handleChangeOfText("password", text)}
                            blurOnSubmit={true}
                            lable={'Password'}
                            autoCapitalize={'none'}
                            returnKeyType={"done"}
                            secureTextEntry={true}
                            isPasswordField={true}
                        />
                        <Text style={{ fontSize: 12, fontFamily: fonts.rubikRegular, color: colors.textLable, width: deviceWidth - 50, }}>{'Password must be at least 6 characters long. Password should have one capital letter, one numeric letter, and one special character.'}</Text>
                        <View style={{ marginTop: 15, flexDirection: 'row', width: deviceWidth - 50, marginBottom: hasNotch() ? 10 : 180 }}>
                            <TouchableOpacity onPress={() => setState(oldState => ({ ...oldState, isAcceptPrivacy: !state.isAcceptPrivacy }))}>
                                <View>
                                    <FastImage source={state.isAcceptPrivacy ? importImages.checkIConSignup : importImages.uncheckIConSignup} style={{ height: 22, width: 22 }} ></FastImage>
                                </View>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', marginStart: 10, alignItems: "center" }}>
                                <Text style={{ fontSize: 12, fontFamily: fonts.rubikRegular, color: colors.Blue, }}>{"I accept the "}</Text>
                                <TouchableOpacity onPress={() => {
                                    const trackEventparam = { action: 'Terms & Conditions' }
                                    trackEvent({ event: 'Create_Account', trackEventparam })
                                    navigation.navigate('WebViewScreen', { url: apiConfigs.termsAndConditionUrl, title: 'Terms & Conditions', type: 'url' })
                                }}>
                                    <View>
                                        <Text style={{ fontFamily: fonts.rubikBold, textDecorationLine: 'underline', fontSize: 12, color: colors.Blue, }}>{"Terms & Conditions"}</Text>
                                    </View>
                                </TouchableOpacity>
                                <Text style={{ fontSize: 12, fontFamily: fonts.rubikRegular, color: colors.Blue, }}>{" and "}</Text>
                                <TouchableOpacity onPress={() => {
                                    const trackEventparam = { action: 'Privacy policy' }
                                    trackEvent({ event: 'Create_Account', trackEventparam })
                                    navigation.navigate('WebViewScreen', { url:apiConfigs.privacyPolicyUrl, title: 'Privacy policy', type: 'url' })
                                }}>
                                    <View>
                                        <Text style={{ fontFamily: fonts.rubikBold, textDecorationLine: 'underline', fontSize: 12, color: colors.Blue, }}>{"Privacy Policy"}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
                <BottomButton text={'Continue'} onPress={() => validationofPage()} container={{ position: 'absolute', bottom: 40, }} />
                <BottomButton text={'Already a Member? Login'} onPress={() => {
                    const trackEventparam = { action: 'Already a member? Login' }
                    trackEvent({ event: 'Create_Account', trackEventparam })

                    navigation.navigate('SignInScreen')
                }} container={{ position: 'absolute', bottom: -25, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.Blue }} textstyle={{ color: colors.Blue, textTransform: 'none' }} />

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
    SignInTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 30,
        color: colors.Blue,
    },
    welcomeTestStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
        color: colors.Blue,
        marginTop: 10,
        opacity: 0.7

    },
    createUsingTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 13,
        alignSelf: 'center',
        color: colors.Blue,
        marginTop: 30,
        opacity: 0.65
    },
 
  
    textFontStyle: {
        flexDirection: 'row',
        alignSelf: "center",

    },
    SignupTextStyle: {
        color: colors.Blue,
        fontSize: 15,
        fontFamily: fonts.rubikRegular,

    },
    IamUserTextStyle: {
        color: colors.Blue,
        fontSize: 15,
        fontFamily: fonts.rubikRegular,
        opacity: 0.65

    }
})

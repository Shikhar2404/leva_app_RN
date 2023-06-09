import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, AppState, Platform, NativeModules } from 'react-native';
import { colors } from '../../utils/color'
import { deviceWidth } from '../../constants'
import { importImages } from '../../utils/importImages'
import Header from "../../components/Header";
import { fonts, stylesBackground } from '../../utils/font'
import BottomButton from "../../components/BottomButton";
import showSimpleAlert from '../../utils/showSimpleAlert';
import NavigationService from '../../utils/NavigationService';
import Request from '../../api/Request';
import StorageService from '../../utils/StorageService';
import BallIndicator from '../../components/BallIndicator';
import FastImage from 'react-native-fast-image';

export default function CheckyourEmailScreen({ route, navigation }) {

    const { MailBoxModule } = NativeModules;


    let appState = AppState.currentState
    const [state, setState] = useState({
        email: '',
        isModalVisible: false
    })
    const _handleAppStateChange = (nextAppState) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            Checkapi()
        }
        appState = nextAppState;
    }
    useEffect(() => {
        AppState.addEventListener('change', _handleAppStateChange);

        const unsubscribe = navigation.addListener('focus', () => {
            Checkapi()
        });
        return unsubscribe;
    }, [navigation]);

    const Checkapi = async () => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true
        }));
        let param = {
            email: route.params.email,
        }
        let response = await Request.post('user/verify-status', param)
        setState(oldState => ({
            ...oldState,
            isModalVisible: false
        }));
        if (response.status === "SUCCESS") {
            if (response.data.verify_status) {
                Request.setToken(response.data.token)
                await StorageService.saveItem(StorageService.STORAGE_KEYS.USER_DETAILS, response.data)
                NavigationService.resetAction('PickYourInterestsScreen', { from: '' })
            }
        }
        else {
            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }
    const reSendApi = async () => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true
        }));
        let param = {
            email: route.params.email,
        }
        let response = await Request.post('user/resend-link', param)
        setState(oldState => ({
            ...oldState,
            isModalVisible: false
        }));
        if (response.status === "SUCCESS") {
            showSimpleAlert(response.message)
        }
        else {
            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }
    const openMailApp = () => {
        if (Platform.OS === 'android') {
            MailBoxModule.launchMailApp() // UIMailLauncher is the 
            return;
        }
        Linking.openURL('message:0').then(supported => {
            return;
        }).catch(err => {
            Linking.openURL('https://google.com')
        });; // iOS
    }
    return (
        <View style={stylesBackground.container}>
            <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
            <Header
                headerTitle={''}
                leftBtnOnPress={null}
                titleStyle={{ color: colors.background }}
            />
            <View style={styles.container}>
                <View>
                    <Text style={styles.titleStyle}>{'Check your Email'}</Text>
                    <Text style={styles.subtitleStyle}>{'Please check your email to verify your account'}</Text>
                </View>
                <View style={{ marginTop: 95, flex: 1 }}>
                    <View style={{ alignItems: 'center' }}>
                        <FastImage source={importImages.bigWhiteEmailIcon} style={{ width: 144, height: 144, }}></FastImage>
                    </View>
                    <BottomButton text={'Open Mail App'} onPress={() => openMailApp()} container={{ marginTop: 53, bottom: 0 }} />
                    <View style={{ marginTop: 20 }}>
                        <View >
                            <Text style={styles.Footerstyle}>{"Did you not receive the email? Check your spam filter,"}<Text style={styles.Footerstyle}>{"or "}<TouchableOpacity onPress={() => reSendApi()}><Text style={[styles.Footerstyle, { textDecorationLine: 'underline', fontFamily: fonts.rubikBold }]}>{"click here to have us resend it."}</Text></TouchableOpacity></Text></Text>

                        </View>
                    </View>
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
    },
    titleStyle: {
        color: colors.Blue,
        fontSize: 30,
        fontFamily: fonts.rubikBold,
    },
    subtitleStyle: {
        color: colors.Blue,
        fontSize: 16,
        fontFamily: fonts.rubikRegular,
        marginTop: 6,
        opacity: 0.65,
    },
    Footerstyle: {
        color: colors.Blue,
        textAlign: 'center',
        fontSize: 12,
        fontFamily: fonts.rubikRegular,
    }
});

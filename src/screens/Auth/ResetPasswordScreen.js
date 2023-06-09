import React, { useState, } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../utils/color'
import { ConstantsText, deviceWidth } from '../../constants'
import { importImages } from '../../utils/importImages'
import Header from "../../components/Header";
import { fonts, stylesBackground } from '../../utils/font'
import TextField from '../../components/TextField';
import Request from '../../api/Request';
import showSimpleAlert from '../../utils/showSimpleAlert';
import BallIndicator from '../../components/BallIndicator';
import FastImage from 'react-native-fast-image';
export default function ResetPasswordScreen({ route, navigation }) {
    const [state, setState] = useState({
        email: '',
        isModalVisible: false
    })
    const handleChangeOfText = (key, value) => {
        setState(oldState => ({
            ...oldState,
            [key]: value,
        }));
    };
    const submitButtonValidation = () => {
        const ConfirmValid = validationofPage();
        if (ConfirmValid) {
            ResetPasswordScreenApi();
        }
    }
    const ResetPasswordScreenApi = async () => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true
        }));
        let params = {
            email: state.email
        }
        let response = await Request.post('user/forgot-password', params)
        setState(oldState => ({
            ...oldState,
            isModalVisible: false
        }));
        if (response.status === "SUCCESS") {
            navigation.navigate('CheckyourResetPassEmailScreen')
        }
        else {
            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }
    const validationofPage = () => {
        const strongRegex = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$");
        if (state.email === '') {
            alert(ConstantsText.Pleaseenteremail)
            return false;
        }
        else if (!strongRegex.test(state.email)) {
            alert(ConstantsText.Pleaseenteravalidemail)
            return false;
        }
        else {
            return true
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
                    <Text style={styles.titleStyle}>{'Reset Password'}</Text>
                    <Text style={styles.subtitleStyle}>{'Forgot your password? No worries. We know what baby brain is like. Enter your email address, and we’ll get you sorted out!'}</Text>
                </View>
                <View style={{ marginTop: 100, flex: 1 }}>
                    <TextField
                        key={'email'}
                        ref={null}
                        value={state.email}
                        placeholder={'Type your email address'}
                        ImageSrc={importImages.emailicon}
                        isShowImg={true}
                        onChangeText={(text) => handleChangeOfText("email", text)}
                        blurOnSubmit={true}
                        lable={'E-mail'}
                        keyboardType={'email-address'}
                        autoCapitalize={'none'}
                        returnKeyType={"done"}
                    />
                    <View style={[styles.container1]}>
                        <TouchableOpacity onPress={() => submitButtonValidation()} style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>

                            <Text style={[styles.textstyle]}>{'Continue'}</Text>
                        </TouchableOpacity>

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
        marginTop: 10,
        color: colors.Blue,
        fontSize: 16,
        fontFamily: fonts.rubikRegular,
        opacity: 0.7

    },
    container1: {
        backgroundColor: colors.Blue,
        borderRadius: 10,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        width: '100%'
    },
    textstyle: {
        color: colors.White,
        fontSize: 16,
        fontFamily: fonts.rubikSemiBold,
        textTransform: 'capitalize'
    },
});

import React, {  } from 'react';
import { View, Text, StyleSheet,  } from 'react-native';
import { colors } from '../../utils/color'
import { deviceWidth } from '../../constants'
import { importImages } from '../../utils/importImages'
import Header from "../../components/Header";
import { fonts, stylesBackground } from '../../utils/font'
import BottomButton from "../../components/BottomButton";
import { hasNotch } from 'react-native-device-info';
import { openInbox } from "react-native-email-link";
import FastImage from 'react-native-fast-image';

export default function CheckyourResetPassEmailScreen({ route, navigation }) {
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
                    <Text style={styles.titleStyle}>{'Check your Email'}</Text>
                    <Text style={styles.subtitleStyle}>{'We have emailed you so that you can reset your password'}</Text>
                </View>
                <View style={{ marginTop: 95, flex: 1 }}>
                    <View style={{ alignItems: 'center' }}>
                        <FastImage source={importImages.bigWhiteEmailIcon} style={{ width: 144, height: 144, }}></FastImage>
                    </View>
                    <BottomButton text={'Open Mail App'} onPress={() => openInbox()} container={{ marginTop: 53,bottom:0 }} />
                    <View style={{ position: 'absolute', height: Platform.OS === 'ios' ? hasNotch() ? 60 : 34 : 34, left: 0, right: 0, bottom: 0, justifyContent: 'center', marginBottom: hasNotch() ? 5 : 0 }}>
                        <View >
                            <Text style={styles.Footerstyle}>{"Please don’t hesitate to reach out to us \nif you need help at contact@levaapp.com"}</Text>
                        </View>
                    </View>
                </View>

            </View>
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

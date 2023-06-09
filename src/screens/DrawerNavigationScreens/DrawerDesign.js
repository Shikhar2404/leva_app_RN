import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet,  TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../../utils/color'
import { fonts,  } from '../../utils/font'
import { ConstantsText,  deviceWidth } from '../../constants'
import { importImages } from '../../utils/importImages'
import {
    DrawerContentScrollView,
    getDrawerStatusFromState,
} from '@react-navigation/drawer';
import NavigationService from '../../utils/NavigationService';
import StorageService from '../../utils/StorageService';
import Request from '../../api/Request'
import showSimpleAlert from '../../utils/showSimpleAlert';
import TrackPlayer from 'react-native-track-player';
import { useIsFocused } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { trackEvent } from '../../utils/tracking';

export default function DrawerDesign(props) {
    const isFocused = useIsFocused();

    const [state, setState] = useState({
        name: '',
        profile: '',
        isModalVisible: false,
        count: '',
        IS_SUBSCRIBED: '',
        bannerImg: '',
        bannerStatus: 0
    })
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('state', async () => {
            const isDrawerOpen = getDrawerStatusFromState(props.navigation.getState()) === 'open';
            if (isDrawerOpen) {
                const IS_SUBSCRIBED = await StorageService.getItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED);
                if (!IS_SUBSCRIBED) {
                    await subscriptionBannerApi()
                }
                await notificationcountApi()
                StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS).then(userData => {
                    setState(oldState => ({
                        ...oldState,
                        name: userData.name,
                        profile: userData.image,
                        IS_SUBSCRIBED: IS_SUBSCRIBED
                    }));
                }).catch(error => { })
            }
        });
        return unsubscribe;
    }, [isFocused]);
    const notificationcountApi = async (values) => {
        let response = await Request.post('notification/count')
        if (response.status === 'SUCCESS') {
            setState(oldState => ({
                ...oldState,
                count: response.data.unread_count != 0 ? response.data.unread_count.toString() : ''

            }))
        }
        else {
            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }
    const subscriptionBannerApi = async () => {
        let response = await Request.post('upsell-banner')
        if (response.status === 'SUCCESS') {
            setState(oldState => ({
                ...oldState,
                bannerImg: response.data.image,
                bannerStatus: response.data.status
            }))
        }
        else {
            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }

    const alertBox = () => {
        const trackEventparam = { action: 'Sign Out' }
        trackEvent({ event: 'Side_Menu', trackEventparam })
        Alert.alert(
            ConstantsText.appName,
            ConstantsText.logOutMessage,
            [
                { text: "Ok", onPress: () => logOut() },
                { text: "Cancel", onPress: () => { } }
            ],
            { cancelable: false }
        );
    }
    const logOut = async () => {
        await TrackPlayer.reset()
        let response = await Request.post('user/logout')
        if (response.status === "SUCCESS") {
            StorageService.clear()
            showSimpleAlert(response.message)
            NavigationService.resetAction('SignInScreen')
        }
        else {

            if (response) {
                showSimpleAlert(response.message)
            }
        }

    }
    return (
        <View style={{ flex: 1, }}>
            <DrawerContentScrollView scrollEnabled={false}

                {...props}
                contentContainerStyle={{ backgroundColor: colors.lightPink, flex: 1, marginTop: 10 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.headerStyle} onPress={() => props.navigation.navigate('MomDetailsScreen')}>
                        <FastImage
                            source={importImages.defaultProfileImg}
                            style={{ height: 60, width: 60, borderRadius: 60 / 2, marginLeft: 20 }}>
                            <FastImage
                                source={{ uri: state.profile }}
                                style={{ height: 60, width: 60, borderRadius: 60 / 2, }}></FastImage>
                        </FastImage>
                        <View style={styles.headerSubVewStyle}>
                            <Text style={styles.headerNameStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{state.name}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.signoutStyle} onPress={() => {
                        const trackEventparam = { action: 'Favorites' }
                        trackEvent({ event: 'Side_Menu', trackEventparam })
                        props.navigation.navigate('FavoritesScreen')
                    }}>
                        <FastImage source={importImages.FavoritesIcon} style={{ height: 45, width: 45 }}></FastImage>
                        <Text style={styles.signoutTextStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Favorites'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.signoutStyle} onPress={() => {
                        const trackEventparam = { action: 'My Appointments' }
                        trackEvent({ event: 'Side_Menu', trackEventparam })
                        props.navigation.navigate('MyAppoinmentsScreen')
                    }}>
                        <FastImage source={importImages.MyAppointmentsIcon} style={{ height: 45, width: 45 }}></FastImage>
                        <Text style={styles.signoutTextStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'My Appointments'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.signoutStyle} onPress={() => {
                        const trackEventparam = { action: 'Stats and charts' }
                        trackEvent({ event: 'Side_Menu', trackEventparam })
                        props.navigation.navigate('StatsandchartsScreen', {})
                    }}>
                        <FastImage source={importImages.StatsandchartsIcon} style={{ height: 45, width: 45 }}></FastImage>
                        <Text style={styles.signoutTextStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Stats and charts'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.signoutStyle} onPress={() => {
                        const trackEventparam = { action: 'Shop' }
                        trackEvent({ event: 'Side_Menu', trackEventparam })
                        props.navigation.navigate('WebViewScreen', { url: "https://www.levaapp.com/store", title: 'Shop', type: 'url' })
                    }}>
                        <FastImage source={importImages.shopicon} style={{ height: 45, width: 45 }}></FastImage>
                        <Text style={styles.signoutTextStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Shop'}</Text>
                    </TouchableOpacity>
                    <View style={styles.lineStyle}></View>
                    <TouchableOpacity style={styles.signoutStyle}
                        onPress={() => {
                            const trackEventparam = { action: 'Baby profile' }
                            trackEvent({ event: 'Side_Menu', trackEventparam })
                            props.navigation.navigate('ChildProfileScreen')
                        }} >
                        <FastImage source={importImages.BabyProfile} style={{ height: 45, width: 45 }}></FastImage>
                        <Text style={styles.signoutTextStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Baby profile'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.signoutStyle}
                        onPress={() => {
                            const trackEventparam = { action: 'Add Baby' }
                            trackEvent({ event: 'Side_Menu', trackEventparam })
                            props.navigation.navigate('AddBabyScreen')
                        }}>
                        <FastImage source={importImages.AddBabyIcon} style={{ height: 45, width: 45 }}></FastImage>
                        <Text style={styles.signoutTextStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Add Baby'}</Text>
                    </TouchableOpacity>
                    {/* NotificationListScreen */}
                    <View style={styles.lineStyle}></View>
                    <TouchableOpacity style={styles.signoutStyle} onPress={() => {
                        const trackEventparam = { action: 'Notifications' }
                        trackEvent({ event: 'Side_Menu', trackEventparam })
                        props.navigation.navigate('NotificationListScreen')
                    }}>
                        <View>
                            <FastImage source={importImages.Mnotificationicon} style={{ height: 45, width: 45 }}></FastImage>

                            {state.count != '' ?
                                <View style={{ backgroundColor: colors.Blue, height: 20, width: 20, borderRadius: 20 / 2, position: 'absolute', right: -5, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: colors.White, fontFamily: fonts.rubikSemiBold, fontSize: 12 }}>{state.count}</Text>
                                </View>
                                : null}
                        </View>
                        <Text style={styles.signoutTextStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Notifications'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.signoutStyle} onPress={() => {
                        const trackEventparam = { action: 'Settings and Help' }
                        trackEvent({ event: 'Side_Menu', trackEventparam })
                        props.navigation.navigate('SettingHelpScreen')
                    }}>
                        <FastImage source={importImages.SettingsandHelp} style={{ height: 45, width: 45 }}></FastImage>
                        <Text style={styles.signoutTextStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Settings and Help'}</Text>
                    </TouchableOpacity>

                    {!state.IS_SUBSCRIBED && state.bannerStatus == 1 ?
                        <TouchableOpacity onPress={() => { props.navigation.navigate('SubscriptionScreen') }}>
                            <View style={[styles.signoutStyle, { backgroundColor: colors.Purple, height: 100, width: 224, borderRadius: 10, marginTop: 22, }]}>
                                <FastImage source={{ uri: state.bannerImg }} style={{ height: 100, width: 224, borderRadius: 10, }} />
                            </View>
                        </TouchableOpacity>
                        : null}
                </ScrollView>
                <View style={styles.subViewStyle}>
                    <TouchableOpacity style={styles.signoutStyle} onPress={() => alertBox()} disabled={state.isModalVisible}>
                        <FastImage source={importImages.SignOutIcon} style={{ height: 45, width: 45 }}></FastImage>
                        <Text style={styles.signoutTextStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Sign Out'}</Text>
                    </TouchableOpacity>
                </View>
            </DrawerContentScrollView>


        </View>
    );
}
const styles = StyleSheet.create({
    headerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },


    headerSubVewStyle: {
        marginLeft: 10,
        flex: 1,
        marginEnd: 10
    },

    headerNameStyle: {
        color: colors.Blue,
        fontSize: 20,
        fontFamily: fonts.rubikSemiBold
    },

   

    subViewStyle: {
        position: 'absolute',
        bottom: 0,
        paddingBottom: 30,
        width: deviceWidth,
        backgroundColor: colors.lightPink
    },

    lineStyle: {
        borderBottomWidth: 1,
        borderBottomColor: colors.Blue,
        width: '88%',
        alignSelf: 'center',
        marginTop: 15
    },

    signoutStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginStart: 20,
        marginTop: 20
    },

    signoutTextStyle: {
        color: colors.Blue,
        marginStart: 10,
        fontFamily: fonts.rubikRegular,
        fontSize: 16
    }

});


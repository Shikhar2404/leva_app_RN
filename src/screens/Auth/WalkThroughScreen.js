import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../../utils/color'
import { importImages } from '../../utils/importImages';
import { fonts } from '../../utils/font';
import { Image, Text, View, StyleSheet, FlatList, TouchableOpacity, Platform,  AppState,  } from 'react-native';
import { deviceWidth } from '../../constants';
import NavigationService from '../../utils/NavigationService'
import { hasNotch } from 'react-native-device-info';
import StorageService from '../../utils/StorageService';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { trackEvent } from '../../utils/tracking';
import FastImage from 'react-native-fast-image';


export default function WalkThroughScreen({ route, navigation }) {
    const flatListRef = useRef();
    const [data, setdata] = useState(undefined)
    let appState = AppState.currentState

    const [selectedIndex, setselectedIndex] = useState(0)
    const [Imagedata, setImagedata] = useState([
        {
            id: 1,
            WalkTrough: importImages.WalkTrough1,
            WalkTroughStep: importImages.WalkTrough1Step1,
            BackgroundRight: importImages.BackgroundRight,
            text: "Track your\nbaby feeding",
            smalltext: "Track nursing, pumping, and diaper\n  counts with Leva",
            text_event: "Track_your_baby_feeding",

        },
        {
            id: 2,
            WalkTrough: importImages.WalkTrough2,
            WalkTroughStep: importImages.WalkTrough2Step2,
            BackgroundRight: importImages.BackgroundRight,
            text: "Full community\nsupport",
            smalltext: "No judgment, just full support for\nwhatever you are experiencing",
            text_event: "Full_community_support",

        },
        {
            id: 3,
            WalkTrough: importImages.WalkTrough3,
            WalkTroughStep: importImages.WalkTrough3Step3,
            BackgroundRight: importImages.BackgroundRight,
            text: "Professional\nfeeding advice",
            smalltext: "Personalized, professional advice\nfrom lactation consultants",
            text_event: "Professional_feeding_advice",

        }
    ])
    const _handleAppStateChange = (nextAppState) => {
        checkScreen()
        appState = nextAppState;
    }
    const checkScreen = async () => {
        var valstore = true
        StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS).then(async (userData) => {
            if (userData != null) {
                if (userData.is_interest_selected && userData.is_mother_detail_added && userData.is_child_detail_added) {
                    if (Platform.OS == 'ios') {
                        const unsubscribe = await dynamicLinks().getInitialLink(handleDynamicLink)
                        const unsubscribe2 = await dynamicLinks().onLink(handleDynamicLink)
                        return () => { unsubscribe, unsubscribe2 };
                    }
                    else {
                        await dynamicLinks().getInitialLink().then((link) => {
                            handleDynamicLink(link)
                        }).catch((error) => {
                        })
                        dynamicLinks().onLink(handleDynamicLink)
                    }
                }
            }
        }).catch(error => { })

    }
    const handleDynamicLink = (link) => {
        if (link) {
            navigationCheck(link)
        }
    };
    const navigationCheck = (link) => {
        var article_id = link.url.substring(link.url.lastIndexOf("=") + 1);
        NavigationService.replaceaction('ArticlesDetailesScreen', { id: article_id })


    }
    useEffect(() => {
        AppState.addEventListener('change', _handleAppStateChange);
        StorageService.getItem(StorageService.STORAGE_KEYS.USER_DETAILS).then(async (userData) => {
            if (userData != null) {
                if (!userData.is_interest_selected) {
                    NavigationService.resetAction('PickYourInterestsScreen', { from: '' })
                }
                else if (!userData.is_mother_detail_added) {
                    NavigationService.resetAction('MotherInformationScreen', { from: 'login' })
                }
                else if (!userData.is_child_detail_added) {
                    NavigationService.resetAction('ChildInformationScreen', { from: 'login' })
                }
                else {
                    NavigationService.resetAction('DrawerNavigation')
                }
            }
            else {
                setdata(true)
            }
        }).catch(error => { })
    }, [])
    const renderItem = ({ item, index }) => {
        return (
            <View style={{ flex: 1, width: deviceWidth, justifyContent: 'center' }}>
                <View style={{ position: 'absolute', height: '100%', width: '100%' }} >
                    <FastImage source={item.WalkTrough} resizeMode='cover' style={{ height: '100%', width: '100%' }}></FastImage>
                </View>

                <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 100 }}>
                    <View style={{ height: deviceWidth - 50, width: deviceWidth }}>
                        <FastImage source={item.WalkTroughStep} resizeMode='contain' style={{ height: '100%', width: '100%' }}></FastImage>
                    </View>
                    <Text style={{ textAlign: 'center', fontFamily: fonts.rubikBold, color: colors.Blue, fontSize: 30, marginTop: 30 }}>{item.text}</Text>
                    <Text style={{ textAlign: 'center', fontFamily: fonts.rubikRegular, color: colors.Blue, fontSize: 16, marginTop: 15, opacity: 0.7 }}>{item.smalltext}</Text>
                </View>

                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'flex-end' }}>
                    <Image source={item.BackgroundRight} resizeMode='cover' style={{}}></Image>
                </View>
            </View>
        );
    }


    const nevigationbutton = () => {
        const trackEventparam = { action: 'Next' }
        trackEvent({ event: Imagedata[selectedIndex].text_event, trackEventparam })
        if (selectedIndex < 2) {
            flatListRef.current.scrollToIndex({
                animated: true,
                index: selectedIndex + 1,
            });
        }
        else {
            NavigationService.resetAction('SignInScreen')
        }
    }
    const skipbutton = () => {
        const trackEventparam = { action: 'Skip' }
        trackEvent({ event: Imagedata[selectedIndex].text_event, trackEventparam })
        NavigationService.resetAction('SignInScreen')
    }
    return (

        <View style={styles.Container}>
            {data ?
                <View style={styles.Container}>
                    <FlatList
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        data={Imagedata}
                        renderItem={renderItem}
                        ref={flatListRef}
                        bounces={false}
                        pagingEnabled={true}
                        onScroll={(event) => {
                            setselectedIndex(Math.round(event.nativeEvent.contentOffset.x / deviceWidth));
                        }}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    <View style={{ position: 'absolute', bottom: Platform.OS === 'ios' ? hasNotch ? 41 : 30 : 30, flexDirection: 'row', justifyContent: 'space-between', width: deviceWidth - 70, alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => skipbutton()}>
                            <Text style={styles.skipStyle}>{'Skip'}</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', marginLeft: 20, }}>
                            {Imagedata && Imagedata.map((itemObj, index) => {
                                return (<View style={{
                                    marginLeft: 4,
                                    height: 8,
                                    width: 8,
                                    borderRadius: 8 / 2,
                                    opacity: selectedIndex == index ? 1 : 0.5,
                                    backgroundColor: colors.Blue
                                }} />)
                            })}
                        </View>
                        <TouchableOpacity onPress={() => nevigationbutton()}>
                            <View style={styles.circle}>
                                <Text style={styles.nextText}>{'Next'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                :
                null}
        </View>
    );
}
const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: colors.pink,
        alignItems: 'center'
    },

    skipStyle: {
        color: colors.Blue,
        fontSize: 16,
        fontFamily: fonts.rubikRegular

    },
    circle: {
        alignSelf: 'flex-end',

        height: 54,
        width: 54,
        backgroundColor: colors.Blue,
        borderRadius: 54 / 2,
    },
    nextText: {
        color: colors.White,
        fontSize: 16,
        marginTop: 15,
        alignSelf: 'center',
        fontFamily: fonts.rubikRegular
    }
})


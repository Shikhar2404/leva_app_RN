import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback,FlatList, ScrollView,  Modal, AppState, Animated } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { ConstantsText, deviceHeight, deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import { hasNotch } from 'react-native-device-info';
import Header from "../../../components/Header";
import BottomButton from "../../../components/BottomButton";
import BallIndicator from '../../../components/BallIndicator';
import Request from '../../../api/Request';
import Stopwatch from "../../../components/stopwatch";
import AppPlayer from '../../../utils/AppPlayer';
import TrackPlayer, { Event, State, useTrackPlayerEvents } from 'react-native-track-player';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import StorageService from '../../../utils/StorageService';
import moment from 'moment';
import JSFunctionUtils from '../../../utils/JSFunctionUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackEvent } from '../../../utils/tracking'
import FastImage from 'react-native-fast-image';
import SubscriptionModalView from '../../../components/SubscriptionModalView'
import apiConfigs from '../../../api/apiConfig';
const options = {

    text: {
        fontFamily: fonts.rubikBold,
        fontSize: 20,
        color: colors.Black
    }
};
export default function NursingScreen({ route, navigation }) {
    let appState = AppState.currentState

    const [state, setState] = useState({
        isModalVisible: false,
        timerRef: useRef(null),
        isResetleft: false,
        isResetright: false,
        isStartleft: false,
        isStartright: false,
        selectMeditaionModal: false,

        pagenumber: 1,
        LastRecored: 0,
        meditationList: [],
        selectedMedi: [],
        isPlaying: false,
        lefttime: 0,
        righttime: 0,
        leftvalback: true,
        rightvalback: true,
        lastSession: undefined,

        isSubscribe: false,
        sub_message: '',
        sub_title: '',
        button_text: '',

        opacity: new Animated.Value(0)

    })
    const nursingDetails = async () => {
        const IS_SUBSCRIBED = await StorageService.getItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED);
        if (IS_SUBSCRIBED) {
            setState(oldState => ({
                ...oldState,
                isSubscribe: false
            }))
        }
        nursinglastsession()
        var left = await StorageService.getItem('nursinglefttime')
        var right = await StorageService.getItem('nursingrighttime')
        if (left != null) {
            if (left.status) {
                var timetwocurrentdateduration = new Date().getTime() - new Date(Math.floor(new Date(left.currentDatetime).getTime()))
                var duration = timetwocurrentdateduration + left.duration
                setState(oldState => ({
                    ...oldState,
                    lefttime: duration,
                    isStartleft: true,
                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
            else {
                setState(oldState => ({
                    ...oldState,
                    lefttime: left.duration,
                    isStartleft: false,

                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
        }
        if (right != null) {
            if (right.status) {
                var timetwocurrentdateduration = new Date().getTime() - new Date(Math.floor(new Date(right.currentDatetime).getTime()))
                var duration = timetwocurrentdateduration + right.duration
                setState(oldState => ({
                    ...oldState,
                    righttime: duration,
                    isStartright: true,
                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
            else {
                setState(oldState => ({
                    ...oldState,
                    righttime: right.duration,
                    isStartright: false,

                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
        }
        await AppPlayer.initializePlayer();
        let index = await TrackPlayer.getCurrentTrack()
        if (index != null) {

            const data = await TrackPlayer.getTrack(index)
            const Playerstates = await TrackPlayer.getState()
            if (Playerstates != State.Paused) {
                await TrackPlayer.play()
            }
            setState(oldState => ({
                ...oldState,
                selectedMedi: [data],
                isPlaying: Playerstates === State.Paused ? false : true

            }))
            // await MeditationsDetailsApi(data)

        }
    }
    const nursingDetailsbackground = async () => {
        var left = await StorageService.getItem('nursinglefttime')
        var right = await StorageService.getItem('nursingrighttime')
        if (left != null) {
            if (left.status) {
                var timetwocurrentdateduration = new Date().getTime() - new Date(Math.floor(new Date(left.currentDatetime).getTime()))
                var duration = timetwocurrentdateduration + left.duration
                setState(oldState => ({
                    ...oldState,
                    lefttime: duration,
                    isStartleft: true,
                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
            else {
                setState(oldState => ({
                    ...oldState,
                    lefttime: left.duration,
                    isStartleft: false,

                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
        }
        if (right.status) {
            if (state.rightvalback) {
                var timetwocurrentdateduration = new Date().getTime() - new Date(Math.floor(new Date(right.currentDatetime).getTime()))
                var duration = timetwocurrentdateduration + right.duration
                setState(oldState => ({
                    ...oldState,
                    righttime: duration,
                    isStartright: true,
                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
            else {
                setState(oldState => ({
                    ...oldState,
                    righttime: right.duration,
                    isStartleft: false,
                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
        }



    }
    useEffect(() => {
        AppState.addEventListener('change', _handleAppStateChange);
        navigation.addListener('focus', () => {
            Animated.timing(state.opacity, {
                toValue: 0,
                duration: 400
            }).start(() => {
                Animated.timing(state.opacity, {
                    toValue: 1,
                    duration: 200
                }).start()
            })
            nursingDetails()
        });
    }, [])
    const _handleAppStateChange = async (nextAppState) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            nursingDetailsbackground()
        }
        appState = nextAppState;
    }

    const nursinglastsession = async () => {
        let response = await Request.post('nursing/last-session')
        if (response.status === 'SUCCESS') {
            setState(oldState => ({
                ...oldState,
                lastSession: response.data,
            }))
        }

    }
    const getFormattedTimeLeft = async (time, duration) => {
        state.lefttime = duration
        if (time != '00:00:00') {
            const obj = { duration: duration, status: state.isStartleft, currentDatetime: Math.floor(new Date().getTime()) }
            StorageService.saveItem('nursinglefttime', obj)
        }
    };

    const getFormattedTimeRight = async (time, duration) => {
        state.righttime = duration
        if (time != '00:00:00') {
            const obj = { duration: duration, status: state.isStartright, currentDatetime: Math.floor(new Date().getTime()) }
            StorageService.saveItem('nursingrighttime', obj)
        }
    };
    const click_SelectMediList = () => {
        if (state.meditationList.length > 0) {
            setState(oldState => ({
                ...oldState,
                selectMeditaionModal: true
            }))
        }
        else {
            MeditationApi(true)

        }
    }
    const fetchMore = () => {
        MeditationApi(false)
    };

    //API Calling
    const Savetracking = async (type) => {
        const child_id = await StorageService.getItem('child_id')

        var nursing_type = state.lefttime && state.righttime ? "3" : state.lefttime ? "1" : state.righttime ? "2" : ""
        if (nursing_type) {
            const objleft = { nursing_type: "1", duration: state.lefttime }
            const objright = { nursing_type: "2", duration: state.righttime }
            var nursing_detail = nursing_type == "3" ? [objleft, objright] : nursing_type == "1" ? [objleft] : [objright]
            setState(oldState => ({
                ...oldState,
                isStartleft: false,
                isStartright: false,
                isModalVisible: true,
            }));
            TrackPlayer.pause();
            let param = {
                nursing_id: '',
                child_id: child_id,
                start_date_time: moment(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
                nursing_type: nursing_type,
                nursing_detail: nursing_detail
            }
            let response = await Request.post('nursing/store', param)

            if (response.status === "SUCCESS") {
                setState(oldState => ({
                    ...oldState, isModalVisible: false,
                    button_text: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.button_text : '',
                    sub_title: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.title : '',
                    sub_message: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.message : '',
                    isSubscribe: response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false
                }));
                if (response.code != apiConfigs.USER_UNSUBSCRIBE) {
                    const trackEventparam = {
                        Left_time: JSFunctionUtils.formatTimeString(state.lefttime, false, true),
                        Right_time: JSFunctionUtils.formatTimeString(state.righttime, false, true),
                        name: state.selectedMedi.length > 0 ? state.selectedMedi[0].title : ''
                    }
                    trackEvent({ event: 'Nursing_Tracking', trackEventparam });
                    StorageService.clearTimenur()
                    await StorageService.saveItem('charthome', 'TotalNursingScreen')
                    navigation.navigate('HomeScreen')
                }
                else {

                }

            }
            else {
                setState(oldState => ({ ...oldState, isModalVisible: false }));
                if (response) {
                    showSimpleAlert(response.message)
                }
            }
        }
        else {
            showSimpleAlert(ConstantsText.Pleasestarttrackinganyofoneleftright)
        }


    }
    const resetTimerDataLeft = async () => {
        AsyncStorage.removeItem('nursinglefttime')
        setState(oldState => ({ ...oldState, lefttime: 0, isStartleft: false }))
    }

    const resetTimerDataRight = async () => {
        AsyncStorage.removeItem('nursingrighttime')
        setState(oldState => ({ ...oldState, righttime: 0, isStartright: false }))
    }
    const setAudioInPlayer = async (data) => {
        for (let index = 0; index < data.length; index++) {
            const trackPlayerAsset = {
                id: data[index].meditation_id,
                url: data[index].audio,
                title: data[index].name,
                artist: 'Leva',
                description: data[index].isLike.toString(),
                artwork: data[index].image
            }
            await TrackPlayer.add(trackPlayerAsset);
        }
    }
    const MeditationApi = async (values) => {
        const getallComplete = state.LastRecored == state.meditationList.length ? false : true

        setState(oldState => ({
            ...oldState,
            isModalVisible: values,
            isModalFooterVisible: getallComplete
        }))
        let params = {
            page_no: state.pagenumber,
            limit: 0,
            type: '1'
        }
        let response = await Request.post('meditation/list', params)
        if (response.status === 'SUCCESS') {
            var meditationData = [...response.data.meditations]
            var meditationDatabyliked = meditationData.sort(function (x, y) { return (x.interest_name === y.interest_name) ? 0 : x.interest_name === "Breastfeeding" ? -1 : 1 })
            state.meditationList = meditationDatabyliked.sort(function (x, y) { return (x.isLike === y.isLike) ? 0 : x.isLike ? -1 : 1 })
            setState(oldState => ({
                ...oldState,
                meditationList: state.meditationList,
                isModalVisible: false,
                pagenumber: response.data.total_records === state.meditationList.length ? state.pagenumber : state.pagenumber + 1,
                isModalFooterVisible: false,
                LastRecored: response.data.total_records,
                selectMeditaionModal: true
            }))
        }
        else {
            setState(oldState => ({
                ...oldState,
                isModalVisible: false,
                isModalFooterVisible: false


            }));
            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }
    useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
        if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
            var index = await TrackPlayer.getCurrentTrack();
            const data = await TrackPlayer.getTrack(index);
            setState(oldState => ({
                ...oldState,
                isPlaying: true,
                selectedMedi: [data]
            }));
            await MeditationsDetailsApi(data)

        }
    });
    useTrackPlayerEvents([Event.PlaybackQueueEnded], async event => {
        if (event.type === Event.PlaybackQueueEnded) {
            if (state.isPlaying) {
                var index = await TrackPlayer.getCurrentTrack();
                await TrackPlayer.skip(index)
                await TrackPlayer.pause()
                await TrackPlayer.seekTo(0)
                if (index == state.meditationList.length - 1) {
                    setState(oldState => ({
                        ...oldState,
                        isPlaying: false
                    }))
                }

            }
        }
    });
    const onSelectMedi = async (item, index) => {
        await resetTrack()
        await setAudioInPlayer(state.meditationList)
        await TrackPlayer.skip(index)
        await TrackPlayer.play()
        const obj = {
            artist: 'Leva',
            description: item.isLike.toString(),
            artwork: item.image,
            id: item.meditation_id,
            title: item.name,
            url: item.audio,
        }
        setState(oldState => ({
            ...oldState,
            selectedMedi: [obj],
            selectMeditaionModal: false,
            isPlaying: true
        }));
        await MeditationsDetailsApi(obj)
    }
    const resetTrack = async () => {
        try {
            await TrackPlayer.reset()
        } catch (error) {
        }
    }
    const onPlayPausePress = async () => {
        const IS_SUBSCRIBED = await StorageService.getItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED);
        if (state.isPlaying) {
            TrackPlayer.pause();
            setState(oldState => ({
                ...oldState,
                isPlaying: false,

            }));
        }
        else {
            TrackPlayer.play();
            setState(oldState => ({
                ...oldState,
                isPlaying: true,

            }));
        }
        if (!IS_SUBSCRIBED) {
            await MeditationsDetailsApi(state.selectedMedi[0])
        }



    };
    const MeditationsDetailsApi = async (data) => {
        let params = {
            meditation_id: data.id
        }
        let response = await Request.post('meditation/detail', params)
        if (response.status === 'SUCCESS') {
            let index = await TrackPlayer.getCurrentTrack()
            let status = state.isPlaying
            if (index != null) {
                status = await TrackPlayer.getState()
            }
            setState(oldState => ({
                ...oldState,
                isPlaying: response.code == apiConfigs.USER_UNSUBSCRIBE ? false : status === State.Playing,
                button_text: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.button_text : '',
                sub_title: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.title : '',
                sub_message: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.message : '',
                isSubscribe: response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false,
            }))
            if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
                TrackPlayer.pause();
            }
        }
        else {
            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }
    const NextPlay = async () => {
        TrackPlayer.skipToNext()
        TrackPlayer.play();
        var currentindex = await TrackPlayer.getCurrentTrack();
        var data = await TrackPlayer.getTrack(currentindex)
        setState(oldState => ({
            ...oldState,
            selectedMedi: [data],
            isPlaying: true
        }))
        await MeditationsDetailsApi(data)

    }
    const PreviousPlay = async () => {
        TrackPlayer.skipToPrevious()
        TrackPlayer.play();
        var currentindex = await TrackPlayer.getCurrentTrack();
        var data = await TrackPlayer.getTrack(currentindex)
        setState(oldState => ({
            ...oldState,
            selectedMedi: [data],
            isPlaying: true
        }))
        await MeditationsDetailsApi(data)

    }
    const Action_Missing_continue = () => {
        navigation.navigate('EditNursingScreen1', { Data: undefined, from: 'tracking', onGoBack: (data, isnew, deleteid) => { } })
    }
    const bothclick = async () => {
        var pumpingtime = await StorageService.getItem('pumpingtime')
        if (pumpingtime) {
            const obj = { duration: pumpingtime.duration, status: false, currentDatetime: Math.floor(new Date().getTime()) }
            StorageService.saveItem('pumpingtime', obj)
        }
        setState(oldState => ({ ...oldState, isStartright: !state.isStartright, isStartleft: !state.isStartleft }))
    }
    const renderItem = ({ item, index }) => {
        return (
            <TouchableWithoutFeedback onPress={() => onSelectMedi(item, index)}>

                <View style={{ marginBottom: state.meditationList.length - 1 == index ? 30 : 7 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: deviceWidth - 50, borderRadius: 5, borderBottomWidth: 0.5, borderColor: colors.Blue, padding: 10 }}>
                        <FastImage source={{ uri: item.image }} style={{ height: 50, width: 50, borderRadius: 10 }}></FastImage>
                        <Text style={{ marginStart: 10, color: colors.Blue, fontFamily: fonts.rubikRegular, fontSize: 16 }}>{item.name}</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>

        )
    }
    const boxInterpolation = state.opacity.interpolate({
        inputRange: [0, 1],
        outputRange: ["transparent", "rgba(0, 0, 0, 0.15)"]
    })
    return (
        <View style={[stylesBackground.container, { backgroundColor: 'transparent' }]}>
            <Animated.View style={[{
                width: '100%',
                height: '100%', backgroundColor: boxInterpolation, position: 'absolute',
            }]}>
            </Animated.View>
            <View style={{ flex: 1, justifyContent: 'flex-end', }}>
                <View style={{ flex: 0.8, borderTopRightRadius: 30, borderTopLeftRadius: 30, backgroundColor: colors.pinkShade, }}>
                    <Header
                        headerTitle={'Nursing Tracking'}
                        leftBtnOnPress={null}
                        titleStyle={{ color: colors.Blue, fontSize: 20, fontFamily: fonts.rubikBold }}
                        rightBtn={<FastImage source={importImages.crossIcon} style={{ height: 20, width: 20 }}></FastImage>}
                        rightBtnOnPress={() => {
                            Animated.timing(state.opacity, {
                                toValue: 1,
                                duration: 100
                            }).start(() => {
                                Animated.timing(state.opacity, {
                                    toValue: 0,
                                    duration: 100
                                }).start()
                            })
                            setTimeout(async () => {
                                await StorageService.saveItem('charthome', false)
                                navigation.goBack()
                            }, 200);

                        }}
                        safeAreaView={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 10 }}
                        style={{ alignItems: 'center', backgroundColor: colors.pinkShade, borderTopRightRadius: 30, borderTopLeftRadius: 30 }}
                    />
                    <Text style={styles.discriptionTextStyle}>{'Tap the top left or right button to start the timer'}</Text>

                    <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={{}}>
                        <View style={styles.container}>
                            <View style={styles.timerViewStyle}>
                                <View style={styles.leftRightButtonStyle}>
                                    <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, isStartleft: !state.isStartleft }))}>
                                        <View style={styles.imageStyle}>
                                            <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                                {state.isStartleft ?
                                                    <FastImage source={importImages.nursingleftGif} style={{ width: 145, height: 130, }} />
                                                    :
                                                    <FastImage source={importImages.nursingLeftIcon} style={{ width: 145, height: 130, }} />
                                                }
                                            </View>
                                            <View style={{ position: 'absolute', bottom: 25, alignSelf: 'center' }}>
                                                <FastImage source={state.isStartleft ? importImages.npause : importImages.nplay} style={{ height: 30, width: 30 }} />
                                                <Text style={styles.buttonTextStyle}>{'Left'}</Text>
                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <Stopwatch
                                            laps={true}
                                            msecs={false}
                                            reset={state.isResetleft}
                                            options={options}
                                            startTime={state.lefttime}
                                            start={state.isStartleft}
                                            getTime={(time, duration) => getFormattedTimeLeft(time, duration)} />
                                        <TouchableWithoutFeedback onPress={() => resetTimerDataLeft()}>
                                            <View style={{ height: 20, width: 20, marginStart: 5 }}>
                                                <FastImage source={importImages.refreshIcon} style={{ height: 20, width: 20, }} />
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                </View>
                                <View style={styles.leftRightButtonStyle}>
                                    <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, isStartright: !state.isStartright }))}>
                                        <View style={styles.imageStyle}>
                                            {state.isStartright ?
                                                <FastImage source={importImages.nursingrightGif} style={{ width: 145, height: 130, }} />
                                                :
                                                <FastImage source={importImages.nursingRightIcon} style={{ width: 145, height: 130, }} />
                                            }
                                            <View style={{ position: 'absolute', bottom: 25, alignSelf: 'center' }}>
                                                <FastImage source={state.isStartright ? importImages.npause : importImages.nplay} style={{ height: 30, width: 30 }} />
                                                <Text style={styles.buttonTextStyle}>{'Right'}</Text>
                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <Stopwatch
                                            laps={true}
                                            msecs={false}
                                            reset={state.isResetright}
                                            options={options}
                                            startTime={state.righttime}
                                            start={state.isStartright}
                                            getTime={(time, duration) => getFormattedTimeRight(time, duration)} />
                                        <TouchableWithoutFeedback onPress={() => resetTimerDataRight()}>
                                            <View style={{ height: 20, width: 20, marginStart: 5 }}>
                                                <FastImage source={importImages.refreshIcon} style={{ height: 20, width: 20, }} />
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.leftRightBothView}>


                                <TouchableWithoutFeedback onPress={() => bothclick()}>
                                    <View>
                                        <Text style={[state.isStartright && state.isStartleft ? styles.leftRightText : styles.bothText, {}]}>{'Both'}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            {state.lastSession ?
                                <View style={styles.sessionViewStyle}>
                                    <Text style={styles.sessionTextStyle}>{'Your Last Session:'}</Text>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.sessionResultStyle}>{state.lastSession.type === 'Both' ? JSFunctionUtils.formatTimeString(state.lastSession.duration, false, true) + ' ' + state.lastSession.type + ' Breasts' : JSFunctionUtils.formatTimeString(state.lastSession.duration, false, true) + ' ' + state.lastSession.type + ' Breast'}</Text>
                                        {state.lastSession.type === 'Both' ? <Text style={[styles.sessionResultStyle,]}>{JSFunctionUtils.formatTimeString(state.lastSession.left_duration, false, true) + ' Left, ' + JSFunctionUtils.formatTimeString(state.lastSession.right_duration, false, true) + ' Right'}</Text> : null}
                                    </View>
                                </View>
                                : null}

                            <Text style={styles.meditationTextStyle}>{'Meditations for Nursing'}</Text>

                            {state.selectedMedi.length > 0 ?
                                <TouchableWithoutFeedback onPress={() => click_SelectMediList()}>
                                    <View style={styles.audioViewStyle}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: (deviceWidth - 100) / 2 }}>
                                            <FastImage style={styles.audioImageStyle} source={{ uri: state.selectedMedi[0].artwork }} />
                                            <View style={styles.audioSubViewStyle}>
                                                <Text style={styles.audioNameStyle}>{state.selectedMedi[0].title}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.buttonViewStyle}>
                                            <TouchableWithoutFeedback onPress={() => PreviousPlay()}>
                                                <FastImage source={importImages.skipback} style={styles.startstopButtonStyle} />
                                            </TouchableWithoutFeedback>
                                            <TouchableWithoutFeedback onPress={() => onPlayPausePress()}>
                                                <FastImage source={state.isPlaying ? importImages.nursingTrackPauseIcon : importImages.nursingTrackStartIcon} style={styles.startstopButtonStyle} />
                                            </TouchableWithoutFeedback>
                                            <TouchableWithoutFeedback onPress={() => NextPlay()}>
                                                <FastImage source={importImages.nursingTrackSkipIcon} style={{ height: 24, width: 24 }} />
                                            </TouchableWithoutFeedback>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                                :
                                <BottomButton text={'Select meditation for play'} container={{ marginBottom: 0, marginTop: 15 }} textstyle={{ fontFamily: fonts.rubikBold, textTransform: 'none' }} onPress={() => click_SelectMediList()} />

                            }
                            <BottomButton text={'Save your tracking'} container={{ marginBottom: 15, width: deviceWidth - 44, alignSelf: 'center', marginTop: 30 }} textstyle={{ fontFamily: fonts.rubikBold, textTransform: 'none' }} onPress={() => Savetracking()} />
                            <View style={{ flexDirection: 'row', marginStart: 10, alignItems: "center", justifyContent: 'center', marginBottom: hasNotch() ? 35 : 20, }}>
                                <TouchableWithoutFeedback onPress={() => Action_Missing_continue()}>

                                    <View style={{ borderBottomColor: colors.grey, borderBottomWidth: 1 }}>
                                        <Text style={{ fontFamily: fonts.rubikBold, fontSize: 17, color: colors.grey, marginBottom: 2 }}>{"Add missing session"}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    </ScrollView>

                    <Modal
                        animationType={'slide'}
                        animated={true}
                        visible={state.selectMeditaionModal}
                        transparent={true}
                        onRequestClose={() => setState(oldState => ({ ...oldState, selectMeditaionModal: false }))}>
                        <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, selectMeditaionModal: false }))}>
                            <View style={[styles.mstyles,]}>
                                <TouchableWithoutFeedback onPress={null}>

                                    <View style={[styles.mcontainerstyle,]}>
                                        <FlatList
                                            data={state.meditationList}
                                            renderItem={renderItem}
                                            bounces={false}
                                            onEndReachedThreshold={0.05}
                                            // onEndReached={fetchMore}
                                            keyExtractor={(item, index) => index.toString()}
                                            showsVerticalScrollIndicator={false}
                                            ListEmptyComponent={() => (

                                                <Text style={stylesBackground.NodataStyle}>{state.isModalVisible ? '' : 'No data found'}</Text>
                                            )}
                                            contentContainerStyle={state.meditationList.length > 0 ? {} : { flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>

                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                    {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}

                </View>

            </View>
            {state.isSubscribe ?
                <SubscriptionModalView
                    style={{ height: '100%', }}
                    BlurViewStyle={[{ width: deviceWidth, height: '100%' }]}
                    containerstyle={[{ width: deviceWidth, height: '100%' }]}
                    message={state.sub_message}
                    title={state.sub_title}
                    button_text={state.button_text}
                    subScribeOnClick={() => { navigation.navigate('SubscriptionScreen1') }}
                    onClose={() => { navigation.goBack() }}

                />
                : null}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: deviceWidth - 44,
        alignSelf: 'center',
    },

    discriptionTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 12,
        color: colors.Blue,
        alignSelf: 'center',
        textAlign: 'center',
        marginTop: -15
    },

    timerViewStyle: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 45,
    },

    leftRightButtonStyle: {
        alignItems: 'center',
    },

    imageStyle: {
        marginBottom: 21,
    },

    buttonTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 12,
        color: colors.textinputBackground,
        marginTop: 7
    },

 

    leftRightBothView: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
    },

    leftRightText: {
        fontFamily: fonts.rubikSemiBold,
        fontSize: 20,
        color: colors.Blue
    },

    bothText: {
        fontFamily: fonts.rubikRegular,
        fontSize: 20,
        color: colors.Blue,

        opacity: 0.5
    },

    sessionViewStyle: {
        marginTop: 42,
        justifyContent: 'center'

    },

    sessionTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Blue,
    },

    sessionResultStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
        color: colors.grey,
    },

    meditationTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Blue,
        marginTop: 30
    },

    audioViewStyle: {
        flexDirection: 'row',
        backgroundColor: colors.Blue,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 19,
        borderRadius: 7,
        paddingVertical: 10,
        marginTop: 15,
        width: deviceWidth - 50
    },

    audioImageStyle: {
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: colors.White
    },

    audioSubViewStyle: {
        marginLeft: 13
    },

    audioNameStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.White,
    },



    buttonViewStyle: {
        flexDirection: 'row',
    },

    startstopButtonStyle: {
        marginRight: 15,
        height: 24, width: 24
    },
    mstyles: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: colors.transparent,
    },
    mcontainerstyle: {
        alignItems: 'center',
        justifyContent: 'center',
        width: deviceWidth,
        backgroundColor: colors.White,
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 20,
        width: deviceWidth,
        height: deviceHeight / 2
    }
});


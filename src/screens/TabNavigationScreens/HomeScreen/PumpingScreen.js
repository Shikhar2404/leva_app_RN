import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback,FlatList, ScrollView, Animated,  Modal, TextInput, Keyboard, AppState,  } from 'react-native';
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
import TrackPlayer, {  Event, State,  useTrackPlayerEvents } from 'react-native-track-player';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import StorageService from '../../../utils/StorageService';
import moment from 'moment';
import { trackEvent } from '../../../utils/tracking';
import JSFunctionUtils from '../../../utils/JSFunctionUtils';
import FastImage from 'react-native-fast-image';
import SubscriptionModalView from '../../../components/SubscriptionModalView'
import apiConfigs from '../../../api/apiConfig';

const options = {

    text: {
        fontFamily: fonts.rubikBold,
        fontSize: 35,
        color: colors.Black
    }
};
export default function PumpingScreen({ route, navigation }) {
    let appState = AppState.currentState

    const [state, setState] = useState({
        isModalVisible: false,
        timerRef: useRef(null),
        isResetTimer: false,
        isStarttTmer: false,
        selectMeditaionModal: false,

        pagenumber: 1,
        LastRecored: 0,
        meditationList: [],
        selectedMedi: [],
        isPlaying: false,

        refleft: useRef(),
        refright: useRef(),
        leftamt: '',
        rightamt: '',
        onTap: false,
        leftvalback: true,
        starttime: 0,
        isPause: false,

        isSubscribe: false,
        sub_message: '',
        sub_title: '',
        button_text:'',

        opacity: new Animated.Value(0)


    })
    const pumpingDetails = async () => {
        const IS_SUBSCRIBED = await StorageService.getItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED);
        if (IS_SUBSCRIBED) {
            setState(oldState => ({
                ...oldState,
                isSubscribe: false
            }))
        }
        var starttimeStorage = await StorageService.getItem('pumpingtime')
        if (starttimeStorage != null) {
            if (starttimeStorage.status) {
                var timetwocurrentdateduration = new Date().getTime() - new Date(Math.floor(new Date(starttimeStorage.currentDatetime).getTime()))
                var duration = timetwocurrentdateduration + starttimeStorage.duration
                setState(oldState => ({
                    ...oldState,
                    starttime: duration,
                    isStarttTmer: true,
                    isPause: true
                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
            else {
                setState(oldState => ({
                    ...oldState,
                    starttime: starttimeStorage.duration,
                    isStarttTmer: false,

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
            pumpingDetails()
        });
    }, [])
    const pumpingDetailsbackground = async () => {
        var starttimeStorage = await StorageService.getItem('pumpingtime')
        if (starttimeStorage != null) {
            if (starttimeStorage.status) {
                var timetwocurrentdateduration = new Date().getTime() - new Date(Math.floor(new Date(starttimeStorage.currentDatetime).getTime()))
                var duration = timetwocurrentdateduration + starttimeStorage.duration
                setState(oldState => ({
                    ...oldState,
                    starttime: duration,
                    isStarttTmer: true,
                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
            else {
                setState(oldState => ({
                    ...oldState,
                    starttime: starttimeStorage.duration,
                    isStarttTmer: false,

                }))
                setState(oldState => ({
                    ...oldState,
                }))
            }
        }

    }
    const _handleAppStateChange = (nextAppState) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            pumpingDetailsbackground()
        }
        appState = nextAppState;
    }

    const getFormattedTime = async (time, duration) => {
        state.starttime = duration
        if (time != '00:00:00') {
            const obj = { duration: duration, status: state.isStarttTmer, currentDatetime: Math.floor(new Date().getTime()) }
            StorageService.saveItem('pumpingtime', obj)

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
            var meditationDatabyliked = meditationData.sort(function (x, y) { return (x.interest_name === y.interest_name) ? 0 : x.interest_name === "Pumping" ? -1 : 1 })
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
            artist: 'Meditation',
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
                button_text:response.code == apiConfigs.USER_UNSUBSCRIBE ? response.button_text : '',
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
    const handleSubmitEditing = (nextTextField) => {
        if (nextTextField) {
            nextTextField.current.focus();
        } else {
            Keyboard.dismiss();
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
    //API Calling
    const Savetracking = async (type) => {
        if (state.leftamt != '' || state.rightamt != '') {

            setState(oldState => ({
                ...oldState,
                isModalVisible: true,
                isStarttTmer: false,
            }));
            TrackPlayer.pause();

            let param = {
                pumping_id: '',
                start_date_time: moment(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
                duration: state.starttime,
                right_ounces: state.rightamt,
                left_ounces: state.leftamt
            }
            let response = await Request.post('pumping/store', param)
            if (response.status === "SUCCESS") {
                setState(oldState => ({
                    ...oldState, isModalVisible: false,
                    button_text:response.code == apiConfigs.USER_UNSUBSCRIBE ? response.button_text : '',
                    sub_title: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.title : '',
                    sub_message: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.message : '',
                    isSubscribe: response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false
                }));
                if (response.code != apiConfigs.USER_UNSUBSCRIBE) {
                    const trackEventparam = {
                        duration: JSFunctionUtils.formatTimeString(state.starttime, false, true),
                        name: state.selectedMedi.length > 0 ? state.selectedMedi[0].title : '',
                        Right_time: state.rightamt, Left_time: state.leftamt,
                    }
                    trackEvent({ event: 'Pumping_Tracking', trackEventparam });
                    StorageService.clearTime()
                    await StorageService.saveItem('charthome', 'TotalPumpedScreen')
                    navigation.navigate('HomeScreen')
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
            showSimpleAlert(ConstantsText.Pleaseenteranyofoneleftrightamounts)
        }


    }
    const Action_Missing_continue = () => {
        navigation.navigate('EditPumpingScreen1', { Data: undefined, from: 'tracking', onGoBack: (data, isnew, deleteid) => { } })
    }
    const startClick = async () => {
        var nursinglefttime = await StorageService.getItem('nursinglefttime')
        if (nursinglefttime) {
            const obj = { duration: nursinglefttime.duration, status: false, currentDatetime: Math.floor(new Date().getTime()) }
            StorageService.saveItem('nursinglefttime', obj)
        }
        var nursingrighttime = await StorageService.getItem('nursingrighttime')
        if (nursingrighttime) {
            const obj = { duration: nursingrighttime.duration, status: false, currentDatetime: Math.floor(new Date().getTime()) }
            StorageService.saveItem('nursingrighttime', obj)
        }
        setState(oldState => ({ ...oldState, isStarttTmer: !state.isStarttTmer, isPause: !state.isPause }))
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
    const resetTimerData = async () => {
        await StorageService.clearTime()
        setState(oldState => ({ ...oldState, starttime: 0, isStarttTmer: false, isPause: false }))
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
                        headerTitle={'Pumping Tracking'}
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
                            setTimeout(async() => {
                                await StorageService.saveItem('charthome',false)
                                navigation.goBack()
                            }, 200);

                        }}               
                                 safeAreaView={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 10 }}
                        style={{ alignItems: 'center', backgroundColor: colors.pinkShade, borderTopRightRadius: 30, borderTopLeftRadius: 30 }}
                    />
                    <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={{}}>
                        <TouchableWithoutFeedback onPress={() => handleSubmitEditing(state.refleft)}>
                            <View>
                                <Text style={styles.discriptionTextStyle}>{'Tap to enter amounts'}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <View style={styles.container}>
                            <View style={styles.timerViewStyle}>
                                <View style={styles.leftRightButtonStyle}>
                                    <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, stopwatchStartleft: !state.stopwatchStartleft }))}>
                                        <View style={styles.imageStyle}>
                                            <FastImage source={importImages.nursingleftGif} style={{ width: 145, height: 130, }} />
                                            <View style={{ position: 'absolute', bottom: 30, alignSelf: 'center', alignItems: 'center' }}>
                                                <TextInput
                                                    placeholder='0oz'
                                                    placeholderTextColor={'white'}
                                                    maxLength={4}
                                                    autoFocus={state.onTap}
                                                    ref={state.refleft}
                                                    keyboardType={'decimal-pad'}
                                                    autoCapitalize={'none'}
                                                    blurOnSubmit={true}
                                                    value={state.leftamt}
                                                    // onSubmitEditing={() => handleSubmitEditing(state.refright)}
                                                    onChangeText={(text) => setState(oldState => ({ ...oldState, leftamt: text }))}

                                                    returnKeyType={'done'}
                                                    style={{ color: colors.White, fontFamily: fonts.rubikRegular, fontSize: 20, height: 45, width: 70, textAlign: 'center' }}
                                                />
                                                <Text style={styles.buttonTextStyle}>{state.leftamt != '' ? 'Left (oz)' : 'Left'}</Text>
                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>

                                </View>
                                <View style={styles.leftRightButtonStyle}>
                                    <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, stopwatchStartright: !state.stopwatchStartright }))}>
                                        <View style={styles.imageStyle}>
                                            <FastImage source={importImages.nursingrightGif} style={{ width: 145, height: 130, }} />

                                            <View style={{ position: 'absolute', bottom: 30, alignSelf: 'center', alignItems: 'center' }}>
                                                <TextInput
                                                    placeholder='0oz'
                                                    placeholderTextColor={'white'}
                                                    maxLength={4}
                                                    ref={state.refright}
                                                    keyboardType={'decimal-pad'}
                                                    autoCapitalize={'none'}
                                                    returnKeyType={'done'}
                                                    blurOnSubmit={true}
                                                    value={state.rightamt}
                                                    onChangeText={(text) => setState(oldState => ({ ...oldState, rightamt: text }))}
                                                    style={{ color: colors.White, fontFamily: fonts.rubikRegular, fontSize: 20, height: 45, width: 70, textAlign: 'center' }}
                                                />
                                                <Text style={styles.buttonTextStyle}>{state.rightamt != '' ? 'Right (oz)' : 'Right'}</Text>

                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>

                                </View>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <Stopwatch
                                    laps={true}
                                    msecs={false}
                                    reset={state.isResetTimer}
                                    options={options}
                                    startTime={state.starttime}
                                    start={state.isStarttTmer}
                                    getTime={(time, duration) => getFormattedTime(time, duration)} />

                                <View style={styles.playPauseViewStyle}>
                                    {state.starttime != 0 || state.isPause ?
                                        <TouchableWithoutFeedback onPress={() => resetTimerData()}>
                                            <View style={[styles.btnTextStyle, { marginEnd: 30 }]}>
                                                <FastImage source={importImages.pumpingStopIcon} style={{ height: 51, width: 51 }}></FastImage>
                                                <Text style={styles.timerPauseTextStyle}>{'stop'}</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        : null}
                                    {state.isPause ?
                                        <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, isPause: !state.isPause, isStarttTmer: !state.isStarttTmer, }))}>
                                            <View style={[styles.btnTextStyle,]}>
                                                <FastImage source={importImages.pumpingPauseIcon} style={{ height: 51, width: 51 }}></FastImage>
                                                <Text style={styles.timerPauseTextStyle}>{'pause'}</Text>
                                            </View>
                                        </TouchableWithoutFeedback>

                                        :
                                        <TouchableWithoutFeedback onPress={() => startClick()}>
                                            <View style={styles.btnTextStyle}>
                                                <FastImage source={importImages.pumpingPlayIcon} style={{ height: 51, width: 51 }}></FastImage>
                                                <Text style={styles.timerPauseTextStyle}>{'start timer'}</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    }
                                </View>




                            </View>


                            <Text style={styles.meditationTextStyle}>{'Meditations for Pumping'}</Text>

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
        </View >
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
        fontSize: 20,
        color: colors.Blue,
        alignSelf: 'center',
        textAlign: 'center',
        marginTop: 10
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
        marginBottom: 34,
    },

    buttonTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 12,
        color: colors.textinputBackground,
        marginTop: -5
    },

    timerStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 20,
        color: colors.Black
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
        flexDirection: 'row',
        marginTop: 42,
        alignItems: 'center',
        marginStart: 8
    },

    sessionTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
        color: colors.Blue,
    },

    sessionResultStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
        color: colors.grey,
        marginLeft: 45
    },

    meditationTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Blue,
        marginTop: 39
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

    appNameStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 12,
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
    },
    playPauseViewStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    btnTextStyle: {
        alignItems: 'center',
        marginTop: 30
    },


    timerPauseTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 11,
        color: colors.Blue,
        textTransform: 'uppercase',
        marginTop: 3
    },
    timerStartTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 7,
        color: colors.Blue,
        textTransform: 'uppercase'
    },
});


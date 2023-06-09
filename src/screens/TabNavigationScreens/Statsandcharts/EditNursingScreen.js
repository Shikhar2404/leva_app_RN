import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, BackHandler, TouchableWithoutFeedback } from 'react-native';
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
import CalenderModal from "../../../components/CalenderModal";
import moment from 'moment'
import { Keyboard } from 'react-native';
import JSFunctionUtils from '../../../utils/JSFunctionUtils';
import FastImage from 'react-native-fast-image';
import SubscriptionModalView from '../../../components/SubscriptionModalView'
import apiConfigs from '../../../api/apiConfig';
import StorageService from '../../../utils/StorageService';
import { trackEvent } from '../../../utils/tracking';
export default function EditNursingScreen({ route, navigation }) {

    const [state, setState] = useState({
        lefttime: '',
        righttime: '',
        notes: '',
        data: route.params.Data,
        isModalVisible: false,
        datepicker: false,
        isShowDay: false,
        isShowDayText: 1,
        isSelect: '',
        nursing_id: '',
        child_id: '',
        start_date_time: '',
        cal_date: '',

        isSubscribe: false,
        sub_message: '',
        sub_title: '',
        button_text: '',

    })
    useEffect(() => {
        if (state.data) {
            setState(oldState => ({
                ...oldState,
                isShowDayText: state.data.nursing_type,
                notes: state.data.note,
                start_date_time: state.data.start_date_time,
                lefttime: state.data.left.duration,
                righttime: state.data.right.duration,
                child_id: state.data.fk_child_id,
                nursing_id: state.data.nursing_id,
                cal_date: state.data.start_date,
            }));

        }
        const unsubscribe = navigation.addListener('focus', async () => {
            const IS_SUBSCRIBED = await StorageService.getItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED);
            if (IS_SUBSCRIBED) {
                setState(oldState => ({
                    ...oldState,
                    isSubscribe: false
                }))
            }
        });
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            goBackNav1
        );
        return () => { unsubscribe, backHandler.remove() };
    }, []);
    const goBackNav1 = () => {
        setState(oldState => ({
            ...oldState,
            isSubscribe: false,

        }));
    }
    const getDate = (date, time, time1) => {
        setState(oldState => ({
            ...oldState,
            datepicker: false,
            cal_date: date,
            start_date_time: date + 'T' + time1,
        }));
    }

    const getTime = (time) => {
        var hr = '', min = '', sec = '', format = '', duration = 0
        if (time != '') {
            hr = time.slice(0, 2)
            min = time.slice(3, 5)
            sec = time.slice(6, 8)
            duration = new Date().setHours(hr, min, sec, 0) - new Date().setHours(0, 0, 0, 0)
        }
        setState(oldState => ({
            ...oldState,
            lefttime: state.isSelect == 'lefttime' ? duration : state.lefttime,
            righttime: state.isSelect == 'righttime' ? duration : state.righttime,
            datepicker: false,

        }));


    };
    const deleteApi = async () => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true,
        }))
        let params = {
            nursing_id: state.nursing_id,
        }
        let response = await Request.post('nursing/delete', params)
        setState(oldState => ({
            ...oldState,
            isModalVisible: false,
        }))
        if (response.status === 'SUCCESS') {
            showSimpleAlert(response.message)
            var data = false
            var isnew = false
            var deleteid = { nursing_id: state.nursing_id, id: state.data.id }
            if (route.params.from == 'tracking') {
                const trackEventparam = { Left_time: JSFunctionUtils.formatTimeString(state.lefttime, false, true), Right_time: JSFunctionUtils.formatTimeString(state.righttime, false, true), datetime: state.start_date_time, Note: state.notes, Last_Side:state.isShowDayText == 1 ? 'Left' : state.isShowDayText == 2 ? 'Right' : 'Both'}
                trackEvent({ event: 'Delete_Nursing_Sessions', trackEventparam })
                navigation.goBack();
                route.params.onGoBack(data, isnew, deleteid);
                navigation.navigate('RecentAllNursingScreen1', { from: 'tracking' })
            }
            else {
                route.params.onGoBack(data, isnew, deleteid);
                navigation.goBack();
            }

        }
        else {

            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }
    const Savetracking = async (type) => {
        var nursing_type = state.lefttime && state.righttime ? "3" : state.lefttime ? "1" : state.righttime ? "2" : ""
        if (state.start_date_time == '') {
            showSimpleAlert(ConstantsText.Pleaseselectdate)
        }
        else {
            if (nursing_type) {
                const objleft = { nursing_type: "1", duration: state.lefttime }
                const objright = { nursing_type: "2", duration: state.righttime }
                var nursing_detail = nursing_type == "3" ? [objleft, objright] : nursing_type == "1" ? [objleft] : [objright]
                setState(oldState => ({
                    ...oldState,
                    isModalVisible: true,
                }));
                let param = {
                    nursing_id: state.nursing_id,
                    child_id: state.child_id,
                    start_date_time: state.start_date_time,
                    nursing_type: nursing_type,
                    note: state.notes,
                    nursing_detail: nursing_detail
                }
                let response = await Request.post('nursing/store', param)
                if (response.status === "SUCCESS") {
                    const trackEventparam = { Left_time: JSFunctionUtils.formatTimeString(state.lefttime, false, true), Right_time: JSFunctionUtils.formatTimeString(state.righttime, false, true), datetime: state.start_date_time, Note: state.notes, Last_Side:state.isShowDayText == 1 ? 'Left' : state.isShowDayText == 2 ? 'Right' : 'Both'}
                    trackEvent({ event: state.data ? 'Edit_Nursing_Sessions' : 'Add_Nursing_Session', trackEventparam })
                    setState(oldState => ({
                        ...oldState, isModalVisible: false,
                        button_text: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.button_text : '',
                        sub_title: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.title : '',
                        sub_message: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.message : '',
                        isSubscribe: response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false
                    }));
                    if (response.code != apiConfigs.USER_UNSUBSCRIBE) {
                        var data = response.data
                        var isnew = state.nursing_id != '' ? false : true
                        var deleteid = {}
                        if (route.params.from == 'tracking') {
                            navigation.goBack();
                            route.params.onGoBack(data, isnew, deleteid);
                            navigation.navigate('RecentAllNursingScreen1', { from: 'tracking' })
                        }
                        else {
                            route.params.onGoBack(data, isnew, deleteid);
                            navigation.goBack();
                        }
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
                showSimpleAlert(ConstantsText.Pleaseentersessionsdataanyofoneleftright)
            }

        }
    }

    const handleChangeOfText = (key, value) => {
        setState(oldState => ({
            ...oldState,
            [key]: value,
        }));
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
                    <Text style={styles.titleStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{state.data ? 'Edit Nursing Sessions' : 'Add Nursing Session'}</Text>
                </View>
                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                    keyboardOpeningTime={0}
                    keyboardShouldPersistTaps={'handled'}
                    bounces={true}
                >

                    <View style={{ flexDirection: 'row', width: deviceWidth - 34, justifyContent: 'space-between', marginTop: 35, }}>
                        <View style={{ width: '47%' }}>
                            <TouchableWithoutFeedback onPress={() => {
                                setState(oldState => ({
                                    ...oldState,
                                    datepicker: true,
                                    isSelect: 'lefttime'
                                })), Keyboard.dismiss()
                            }}>
                                <View>
                                    <TextField
                                        key={'lefttime'}
                                        textInputStyle={{ width: '100%', }}
                                        ref={null}
                                        value={JSFunctionUtils.formatTimeString(state.lefttime, false, true)}
                                        placeholder={''}
                                        isShowImg={false}
                                        onChangeText={(text) => handleChangeOfText("lefttime", text)}
                                        blurOnSubmit={true}
                                        editable={false}
                                        type={'bdate'}
                                        lable={'Left Breast'}
                                        autoCapitalize={'none'}
                                        lableStyle={{ fontFamily: fonts.rubikBold, color: colors.Blue, fontSize: 16 }}

                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <TouchableWithoutFeedback onPress={() => {
                            setState(oldState => ({
                                ...oldState,
                                datepicker: true,
                                isSelect: 'righttime'
                            })), Keyboard.dismiss()
                        }}>
                            <View style={{ width: '47%' }}>
                                <TextField
                                    key={'righttime'}
                                    ref={null}
                                    textInputStyle={{ width: '100%', }}
                                    value={JSFunctionUtils.formatTimeString(state.righttime, false, true)}
                                    placeholder={''}
                                    isShowImg={false}
                                    onChangeText={(text) => handleChangeOfText("righttime", text)}
                                    blurOnSubmit={true}
                                    lable={'Right Breast'}
                                    editable={false}
                                    type={'bdate'}
                                    autoCapitalize={'none'}
                                    lableStyle={{ fontFamily: fonts.rubikBold, color: colors.Blue, fontSize: 16 }}
                                />

                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                    <TouchableWithoutFeedback onPress={() => {
                        setState(oldState => ({
                            ...oldState,
                            datepicker: true,
                            isSelect: 'datetime'
                        })),
                            Keyboard.dismiss()
                    }}>
                        <View>
                            <TextField
                                key={'start_date_time'}
                                ref={null}
                                value={state.start_date_time != '' ? moment(state.start_date_time).format('MM/DD/YYYY h:mm A') : ''}
                                placeholder={'Select date and time'}
                                ImageSrc={importImages.clockIcons}
                                isShowImg={true}
                                onChangeText={(text) => handleChangeOfText("start_date_time", text)}
                                blurOnSubmit={true}
                                editable={false}
                                lable={'Date & Time'}
                                type={'bdate'}
                                autoCapitalize={'none'}
                                returnKeyType={"done"}
                                lableStyle={{ fontFamily: fonts.rubikBold, color: colors.Blue, fontSize: 16 }}

                            />
                        </View>
                    </TouchableWithoutFeedback>

                    <TextField
                        key={'notes'}
                        ref={null}
                        value={state.notes}
                        placeholder={'Tap to add note'}
                        ImageSrc={importImages.noteIcons}
                        isShowImg={true}
                        onChangeText={(text) => handleChangeOfText("notes", text)}
                        blurOnSubmit={true}
                        lable={'Note'}
                        autoCapitalize={'none'}
                        returnKeyType={"done"}
                        lableStyle={{ fontFamily: fonts.rubikBold, color: colors.Blue, fontSize: 16 }}

                    />
                    {state.data ?
                        <View style={{ marginTop: 10, marginStart: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ height: 45, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={styles.mainHeadertext}>{'Last side: '}</Text>
                                </View>
                                <View style={{ marginStart: 16, backgroundColor: colors.Darkpink, borderTopRightRadius: 10, borderTopLeftRadius: 10, borderBottomRightRadius: 10, borderBottomLeftRadius: 10, width: state.isShowDay ? 100 : 90 }}>
                                    <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, isShowDay: !state.isShowDay }))}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 }}>
                                            <Text style={{ fontSize: 16, color: colors.Blue, fontFamily: fonts.rubikRegular, marginStart: 10 }}>{state.isShowDayText == 1 ? 'Left' : state.isShowDayText == 2 ? 'Right' : 'Both'}</Text>
                                            <FastImage source={importImages.downarrowIcon} style={{ height: 25, width: 25, marginStart: 14, marginEnd: 10 }}></FastImage>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    {state.isShowDay ?
                                        <View>
                                            <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, isShowDayText: state.isShowDayText == 1 ? 2 : state.isShowDayText == 2 ? 1 : 1, isShowDay: !state.isShowDay }))}>
                                                <View style={{ backgroundColor: colors.Darkpink, borderBottomRightRadius: 10, borderBottomLeftRadius: 10, alignItems: 'flex-start', justifyContent: 'center', height: 45, width: state.isShowDay ? 100 : 90 }}>
                                                    <View style={{ backgroundColor: colors.Blue, borderTopWidth: state.isShowDay ? 0.5 : 0, height: 0.5, position: 'absolute', top: 0, marginStart: 10, marginEnd: 10, width: 75 }}></View>
                                                    <Text style={{ fontSize: 16, color: colors.Blue, fontFamily: fonts.rubikRegular, marginStart: 10 }}>{state.isShowDayText == 1 ? 'Right' : state.isShowDayText == 2 ? 'Left' : 'Left'}</Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                            <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, isShowDayText: state.isShowDayText == 1 ? 3 : state.isShowDayText == 2 ? 3 : 2, isShowDay: !state.isShowDay }))}>
                                                <View style={{ backgroundColor: colors.Darkpink, borderBottomRightRadius: 10, borderBottomLeftRadius: 10, alignItems: 'flex-start', justifyContent: 'center', height: 45, width: state.isShowDay ? 100 : 90 }}>
                                                    <View style={{ backgroundColor: colors.Blue, borderTopWidth: state.isShowDay ? 0.5 : 0, height: 0.5, position: 'absolute', top: 0, marginStart: 10, marginEnd: 10, width: 75 }}></View>
                                                    <Text style={{ fontSize: 16, color: colors.Blue, fontFamily: fonts.rubikRegular, marginStart: 10 }}>{state.isShowDayText == 1 ? 'Both' : state.isShowDayText == 2 ? 'Both' : 'Right'}</Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </View>
                                        : null}
                                </View>
                            </View>

                        </View>
                        : null}
                    <View style={{ height: 200 }}></View>
                </KeyboardAwareScrollView>
                <BottomButton text={'Save'} onPress={() => Savetracking()} container={{ position: 'absolute', bottom:  -10 }} />
                {state.data ? <BottomButton text={'Delete'} onPress={() => deleteApi()} container={{ position: 'absolute', bottom: 50, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.Blue }} textstyle={{ color: colors.Blue }} /> : null}

                <CalenderModal
                    visible={state.datepicker}
                    transparent={true}
                    maxDate={new Date()}
                    minDate={state.isSelect == 'datetime' ? new Date().setMonth(new Date().getMonth() - 2) : undefined}
                    lable={'Nursing Session'}
                    bdate={state.isSelect == 'datetime' ? state.start_date_time != '' ? state.start_date_time : undefined : undefined}
                    type1={state.isSelect == 'datetime' ? 'datetime' : 'time'}
                    valuesdate={state.cal_date != '' ? state.cal_date : moment(new Date()).format('YYYY-MM-DD')}
                    getDate={(date, time, time1) => getDate(date, time, time1)}
                    getTime={(time) => getTime(time)}
                    CloseModal={() =>
                        setState(oldState => ({
                            ...oldState,
                            datepicker: false,
                        }))} />

            </View>

            {state.isModalVisible &&
                <BallIndicator visible={state.isModalVisible} />
            }
            {state.isSubscribe ?
                <SubscriptionModalView
                    style={{ height: '100%', }}
                    BlurViewStyle={[{ width: deviceWidth, height: '100%' }]}
                    containerstyle={[{ width: deviceWidth, height: '100%' }]}
                    message={state.sub_message}
                    title={state.sub_title}
                    button_text={state.button_text}
                    subScribeOnClick={() => { navigation.navigate(route.params.from == 'tracking' ? 'SubscriptionScreen1' : 'SubscriptionScreen') }}
                    onClose={() => {
                        setState(oldState => ({
                            ...oldState,
                            isSubscribe: false,

                        }));
                        setTimeout(() => {
                            navigation.goBack()
                        }, 10);

                    }}
                />
                : null}
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
        width: deviceWidth - 34
    },
    subtitleStyle: {
        marginTop: 10,
        color: colors.Blue,
        fontSize: 16,
        fontFamily: fonts.rubikRegular,
        opacity: 0.7

    },
    mainHeadertext: {
        color: colors.Blue,
        fontSize: 16,
        fontFamily: fonts.rubikRegular,
        textTransform: 'capitalize'

    },

});

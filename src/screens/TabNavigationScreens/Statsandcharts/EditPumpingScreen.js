import React, { useState, useEffect, } from 'react';
import { View, Text, StyleSheet, BackHandler, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../../../utils/color'
import { ConstantsText, deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import { fonts, stylesBackground } from '../../../utils/font'
import TextField from '../../../components/TextField';
import BottomButton from "../../../components/BottomButton";
import BallIndicator from '../../../components/BallIndicator';
import Request from '../../../api/Request';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import CalenderModal from "../../../components/CalenderModal";
import moment from 'moment'
import { Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import SubscriptionModalView from '../../../components/SubscriptionModalView'
import apiConfigs from '../../../api/apiConfig';
import StorageService from '../../../utils/StorageService';
import { trackEvent } from '../../../utils/tracking';
export default function EditPumpingScreen({ route, navigation }) {

    const [state, setState] = useState({
        leftamt: '',
        rightamt: '',
        notes: '',
        data: route.params.Data,
        isModalVisible: false,
        datetimepicker: false,
        cal_date: '',
        start_date_time: '',
        pumping_id: '',
        duration: 0,

        isSubscribe: false,
        sub_message: '',
        sub_title: '',
        button_text: '',

    })
    useEffect(() => {
        if (state.data) {
            setState(oldState => ({
                ...oldState,
                notes: state.data.note,
                cal_date: state.data.start_date,
                start_date_time: state.data.start_date_time,
                leftamt: state.data.left_ounces.toString(),
                rightamt: state.data.right_ounces.toString(),
                pumping_id: state.data.pumping_id,
                duration: state.data.duration
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
            cal_date: date,
            start_date_time: date + 'T' + time1,
            datetimepicker: false,
        }));

    };
    const deleteApi = async () => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true,
        }))
        let params = {
            pumping_id: state.pumping_id,
        }
        let response = await Request.post('pumping/delete', params)
        setState(oldState => ({
            ...oldState,
            isModalVisible: false,
        }))
        if (response.status === 'SUCCESS') {
            const trackEventparam = { Left_time:state.leftamt,Right_time:state.rightamt,datetime: state.start_date_time,Note:state.notes }
            trackEvent({ event:'Delete_Pumping_Sessions', trackEventparam })
            showSimpleAlert(response.message)
            var data = false
            var isnew = false
            var deleteid = { pumping_id: state.pumping_id, id: state.data.id }
            if (route.params.from == 'tracking') {
                navigation.goBack();
                route.params.onGoBack(data, isnew, deleteid);
                navigation.navigate('RecentAllPumpedScreen1', { from: 'tracking' })
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
    //API Calling
    const Savetracking = async () => {
        if (state.cal_date == '') {
            showSimpleAlert(ConstantsText.Pleaseselectdate)
        }
        else {
            if (state.leftamt.trim() != '' || state.rightamt.trim() != '') {
                setState(oldState => ({
                    ...oldState,
                    isModalVisible: true,
                }));

                let param = {
                    pumping_id: state.pumping_id,
                    start_date_time: state.start_date_time,
                    duration: 0,
                    right_ounces: state.rightamt,
                    left_ounces: state.leftamt,
                    note: state.notes,
                }
                let response = await Request.post('pumping/store', param)
                if (response.status === "SUCCESS") {
                    const trackEventparam = { Left_time:state.leftamt,Right_time:state.rightamt,datetime: state.start_date_time,Note:state.notes }
                    trackEvent({ event: state.data ? 'Edit_Pumping_Sessions' : 'Add_Pumping_Session', trackEventparam })
                    setState(oldState => ({
                        ...oldState, isModalVisible: false,
                        button_text: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.button_text : '',
                        sub_title: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.title : '',
                        sub_message: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.message : '',
                        isSubscribe: response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false
                    }));
                    if (response.code != apiConfigs.USER_UNSUBSCRIBE) {
                        var data = response.data
                        var isnew = state.pumping_id != '' ? false : true
                        var deleteid = {}
                        if (route.params.from == 'tracking') {
                            navigation.goBack();
                            route.params.onGoBack(data, isnew, deleteid);
                            navigation.navigate('RecentAllPumpedScreen1', { from: 'tracking' })
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
                showSimpleAlert(ConstantsText.Pleaseenteranyofoneleftrightamounts)
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
                    <Text style={styles.titleStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{state.data ? 'Edit Pumping Sessions' : 'Add Pumping Session'}</Text>
                </View>
                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                    keyboardOpeningTime={0}
                    keyboardShouldPersistTaps={'handled'}
                    bounces={true}
                >
                    <View style={{ flexDirection: 'row', width: deviceWidth - 34, justifyContent: 'space-between', marginTop: 35 }}>
                        <View style={{ width: '47%' }}>
                            <View>
                                <TextField
                                    key={'leftamt'}
                                    textInputStyle={{ width: '100%', }}
                                    ref={null}
                                    value={state.leftamt}
                                    placeholder={'oz'}
                                    maxLength={4}
                                    isShowImg={false}
                                    onChangeText={(text) => handleChangeOfText("leftamt", text)}
                                    blurOnSubmit={true}
                                    keyboardType={'decimal-pad'}
                                    lable={'Left Breast'}
                                    autoCapitalize={'none'}
                                    returnKeyType={'done'}
                                    lableStyle={{ fontFamily: fonts.rubikBold, color: colors.Blue, fontSize: 16 }}

                                />
                            </View>
                        </View>
                        <View style={{ width: '47%' }}>
                            <TextField
                                key={'rightamt'}
                                ref={null}
                                textInputStyle={{ width: '100%', }}
                                value={state.rightamt}
                                placeholder={'oz'}
                                isShowImg={false}
                                maxLength={4}
                                onChangeText={(text) => handleChangeOfText("rightamt", text)}
                                blurOnSubmit={true}
                                lable={'Right Breast'}
                                keyboardType={'decimal-pad'}
                                autoCapitalize={'none'}
                                returnKeyType={'done'}
                                lableStyle={{ fontFamily: fonts.rubikBold, color: colors.Blue, fontSize: 16 }}
                            />

                        </View>
                    </View>
                    <TouchableWithoutFeedback onPress={() => {
                        setState(oldState => ({
                            ...oldState,
                            datetimepicker: true,
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
                    <View style={{ height: 200 }}></View>

                </KeyboardAwareScrollView>
                <BottomButton text={'Save'} onPress={() => Savetracking()} container={{ position: 'absolute', bottom: -10 }} />
                {state.data ? <BottomButton text={'Delete'} onPress={() => deleteApi()} container={{ position: 'absolute', bottom: 50, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.Blue }} textstyle={{ color: colors.Blue }} /> : null}

                <CalenderModal
                    visible={state.datetimepicker}
                    transparent={true}
                    maxDate={new Date()}
                    minDate={new Date().setMonth(new Date().getMonth() - 2)}
                    lable={'Pumping Session'}
                    type1={'datetime'}
                    bdate={state.start_date_time != '' ? state.start_date_time : undefined}
                    valuesdate={state.cal_date != '' ? state.cal_date : moment(new Date()).format('YYYY-MM-DD')}
                    getDate={(date, time, time1) => getDate(date, time, time1)}
                    CloseModal={() =>
                        setState(oldState => ({
                            ...oldState,
                            datetimepicker: false,
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
        width: deviceWidth - 34,
    },
    subtitleStyle: {
        marginTop: 10,
        color: colors.Blue,
        fontSize: 16,
        fontFamily: fonts.rubikRegular,
        opacity: 0.7

    },

});

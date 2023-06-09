import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, Platform, TouchableWithoutFeedback, BackHandler,  FlatList,  TouchableOpacity,Keyboard } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { ConstantsText, deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import CalenderModal from "../../../components/CalenderModal";
import moment from 'moment';
import DropDownField from '../../../components/DropDownField';
import BottomButton from "../../../components/BottomButton";
import BallIndicator from '../../../components/BallIndicator';
import TextField from '../../../components/TextField';
import Request from '../../../api/Request';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import StorageService from '../../../utils/StorageService';
import FastImage from 'react-native-fast-image';
import SubscriptionModalView from '../../../components/SubscriptionModalView'
import apiConfigs from '../../../api/apiConfig';
import { trackEvent } from '../../../utils/tracking';
export default function EditBottleScreen({ route, navigation }) {
    const [state, setState] = useState({
        isModalVisible: false,
        nutritionData: [{ label: 'Milk', value: '3' }, { label: 'Formula', value: '2' }, { label: 'Water', value: '1' },],
        datepicker: false,
        bottleData: [{ quantity: '', liquid_type: '' }],
        objmain: { quantity: '', liquid_type: '' },
        child_id: '',
        data: route.params.Data,
        bottle_id: '',
        cal_date: '',
        start_date_time: '',

        isSubscribe: false,
        sub_message: '',
        sub_title: '',
        button_text: '',


    })
    useEffect(() => {
        if (state.data) {
            state.bottleData = []
            state.data.details.map((item) => {
                const obj = { quantity: item.quantity, liquid_type: item.liquid_type }
                state.bottleData.push(obj)
            })
            setState(oldState => ({
                ...oldState,
                cal_date: state.data.date_only,
                start_date_time: state.data.date_time,
                bottle_id: state.data.bottle_id,
                child_id: state.data.fk_child_id,

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
            const is_water_allow = await StorageService.getItem('is_water_allow');
            if (!is_water_allow) {
                setState(oldState => ({
                    ...oldState,
                    nutritionData: state.nutritionData.filter(item => item.value != '1'),
                }));
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
    const deleteApi = async () => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true,
        }))
        let params = {
            bottle_id: state.bottle_id,
        }
        let response = await Request.post('bottle/delete', params)
        setState(oldState => ({
            ...oldState,
            isModalVisible: false,
        }))
        if (response.status === 'SUCCESS') {
            showSimpleAlert(response.message)
            var data = false
            var isnew = false
            var deleteid = { bottle_id: state.bottle_id, id: state.data.id }
            if (route.params.from == 'tracking') {
                let liquid_type = state.bottleData.filter(item => item.quantity != '' && item.liquid_type != '').map((item, index) => {
                    var dataind = state.nutritionData.find(items => items.value == item.liquid_type)
                    return dataind.label
                }).toString()
                let quantity = state.bottleData.filter(item => item.quantity != '' && item.liquid_type != '').map(item => item.quantity).toString()
                const trackEventparam = { quantity: quantity, liquid_type: liquid_type, datetime: state.start_date_time }
                trackEvent({ event: 'Delete_Bottle_Sessions', trackEventparam })
                navigation.goBack();
                route.params.onGoBack(data, isnew, deleteid);
                navigation.navigate('RecentAllBottlesScreen1', { from: 'tracking' })
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
    const Savetracking = async () => {
        if (state.cal_date == '') {
            showSimpleAlert(ConstantsText.Pleaseselectdate)
        }
        else if (state.bottleData[0].quantity == '') {
            showSimpleAlert(ConstantsText.PleaseEnterquantity)
        }
        else if (state.bottleData[0].liquid_type == '') {
            showSimpleAlert(ConstantsText.PleaseSelectliquidtype)
        }
        else {
            setState(oldState => ({
                ...oldState,
                isModalVisible: true,
            }));
            let params = {
                bottle_id: state.bottle_id,
                child_id: state.child_id,
                date_time: state.start_date_time,
                details: state.bottleData.filter(item => item.quantity != '' && item.liquid_type != '')
            }
            let response = await Request.post('bottle/store', params)
            if (response.status === "SUCCESS") {
                let liquid_type = state.bottleData.filter(item => item.quantity != '' && item.liquid_type != '').map((item, index) => {
                    var dataind = state.nutritionData.find(items => items.value == item.liquid_type)
                    return dataind.label
                }).toString()
                let quantity = state.bottleData.filter(item => item.quantity != '' && item.liquid_type != '').map(item => item.quantity).toString()
                const trackEventparam = { quantity: quantity, liquid_type: liquid_type, datetime: state.start_date_time }
                trackEvent({ event: state.data ? 'Edit_Bottle_Sessions' : 'Add_Bottle_Sessions', trackEventparam })
                setState(oldState => ({
                    ...oldState, isModalVisible: false,
                    button_text: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.button_text : '',
                    sub_title: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.title : '',
                    sub_message: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.message : '',
                    isSubscribe: response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false
                }));
                if (response.code != apiConfigs.USER_UNSUBSCRIBE) {
                    var data = response.data
                    var isnew = state.bottle_id != '' ? false : true
                    var deleteid = {}
                    if (route.params.from == 'tracking') {
                        navigation.goBack();
                        route.params.onGoBack(data, isnew, deleteid);
                        navigation.navigate('RecentAllBottlesScreen1', { from: 'tracking' })
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
    }
    const handleChangeOfText = (key, index, text, value) => {
        const obj = { quantity: text, liquid_type: value }
        state.bottleData[index] = { ...obj }
        setState(oldState => ({
            ...oldState,
        }));
    };

    const getDate = (date, time, time1) => {
        setState(oldState => ({
            ...oldState,
            datepicker: false,
            cal_date: date,
            start_date_time: date + 'T' + time1,
        }));
    }


    const bottlerenderItem = ({ index, item }) => {
        let qty = item.quantity.toString()
        return (
            <View style={{ justifyContent: 'center', }}>
                <Text style={styles.quantity}>{'Quantity'}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                    <View style={{ width: '57%', }}>
                        <TextField
                            key={'quantity'}
                            textInputStyle={{ width: '85%', marginEnd: 20, textAlign: 'center', }}
                            ref={null}
                            value={qty.trim()}
                            style={{}}
                            placeholder={'oz'}
                            isShowImg={false}
                            maxLength={3}
                            lable={' '}
                            multiline={Platform.OS == 'android' ? true : false}
                            innerContainerStyle={{ height: 60 }}
                            onChangeText={(text) => handleChangeOfText('quantity', index, text, item.liquid_type)}
                            blurOnSubmit={true}
                            keyboardType={'decimal-pad'}
                            autoCapitalize={'none'}
                            returnKeyType={"done"}
                        />
                    </View>
                    <View style={{ width: '37%' }}>
                        <DropDownField
                            key={'liquid_type'}
                            ref={null}
                            bottled={true}
                            // ImageSrc={importImages.downarrowIcon}
                            placeholderStyle={{ marginStart: 0, textAlign: 'center', }}
                            selectedTextStyle={{ marginStart: 0, textAlign: 'center', }}
                            data={state.nutritionData}
                            value={item.liquid_type.toString()}
                            placeholder={item.liquid_type.toString() != '' ? item.liquid_type.toString() == '1' ? 'Water' : item.liquid_type.toString() == '2' ? 'Formula' : 'Milk' : 'Select Liquid'}
                            isShowImg={true}
                            icontype={'1'}
                            onChange={(values) => handleChangeOfText('liquid_type', index, item.quantity, values.value)}
                        />
                    </View>
                </View>
            </View>
        )
    }

    const addMoreItems = () => {
        state.bottleData.push(state.objmain)
        setState(oldState => ({
            ...oldState,
        }));
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
                    <Text style={styles.titleStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{state.data ? 'Edit Bottle Sessions' : 'Add Bottle Sessions'}</Text>
                </View>
                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                    keyboardOpeningTime={0}
                    extraHeight={Platform.OS === 'ios' ? -75 : 50}
                    keyboardShouldPersistTaps={'handled'}
                    bounces={false}
                    enableAutomaticScroll={true}
                >
                    <View style={{ width: deviceWidth - 34, }}>

                        <TouchableWithoutFeedback onPress={() => {
                            setState(oldState => ({
                                ...oldState,
                                datepicker: true,
                            })),
                                Keyboard.dismiss()
                        }}>
                            <View style={{ marginTop: 45 }}>
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
                        <FlatList
                            data={state.bottleData}
                            renderItem={bottlerenderItem}
                            bounces={false}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        <TouchableOpacity style={styles.addMoreStyle} onPress={() => addMoreItems()}>
                            <Text style={styles.addMoreTextStyle} >{'+ Add more'}</Text>
                        </TouchableOpacity>
                        <BottomButton text={'Save'} onPress={() => Savetracking()} container={{ marginTop: 45, marginBottom: 10 }} />
                        {state.data ? <BottomButton text={'Delete'} onPress={() => deleteApi()} container={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.Blue, }} textstyle={{ color: colors.Blue }} /> : null}

                    </View>
                    <CalenderModal
                        visible={state.datepicker}
                        transparent={true}
                        maxDate={new Date()}
                        minDate={new Date().setMonth(new Date().getMonth() - 2)}
                        lable={'Bottle Session'}
                        bdate={state.start_date_time != '' ? state.start_date_time : undefined}
                        type1={'datetime'}
                        valuesdate={state.cal_date != '' ? state.cal_date : moment(new Date()).format('YYYY-MM-DD')}
                        getDate={(date, time, time1) => getDate(date, time, time1)}
                        CloseModal={() =>
                            setState(oldState => ({
                                ...oldState,
                                datepicker: false,
                            }))} />

                </KeyboardAwareScrollView>
            </View>
            {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}
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
        </View >
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
    timeStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Blue,
        marginTop: 45,
        marginBottom: -10
    },
    quantity: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Blue,
        marginBottom: -10,
        marginTop: 15

    },
    addMoreStyle: {
        alignSelf: 'flex-end',
    },
    addMoreTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Blue,
        marginVertical: 20
    },
    learnTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
        color: colors.White,
        alignSelf: 'center',
        marginVertical: 15,
    },
    learnMoreButtonStyle: {
        width: '100%',
        height: 50,
        borderRadius: 10,
        backgroundColor: colors.Blue,
        marginVertical: 35
    },
});


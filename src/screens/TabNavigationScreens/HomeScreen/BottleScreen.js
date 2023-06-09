import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, Platform, TouchableWithoutFeedback, FlatList,  Animated, TouchableOpacity,  Keyboard } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { ConstantsText,  deviceWidth } from '../../../constants'
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
import { trackEvent } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';
import SubscriptionModalView from '../../../components/SubscriptionModalView'
import apiConfigs from '../../../api/apiConfig';
import { hasNotch } from 'react-native-device-info';
export default function BottleScreen({ route, navigation }) {
    const [state, setState] = useState({
        isModalVisible: false,
        nutritionData: [{ label: 'Milk', value: '3' }, { label: 'Formula', value: '2' }, { label: 'Water', value: '1' },],

        datepicker: false,
        bottleData: [{ quantity: '', liquid_type: '' }],
        objmain: { quantity: '', liquid_type: '' },

        cal_date: '',
        start_date_time: '',

        isSubscribe: false,
        sub_message: '',
        sub_title: '',
        button_text: '',

        opacity: new Animated.Value(0)

    })
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            Animated.timing(state.opacity, {
                toValue: 0,
                duration: 400
            }).start(() => {
                Animated.timing(state.opacity, {
                    toValue: 1,
                    duration: 200
                }).start()
            })
            const IS_SUBSCRIBED = await StorageService.getItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED);
            if (IS_SUBSCRIBED) {
                setState(oldState => ({
                    ...oldState,
                    isSubscribe: false,
                }));
            }
            const is_water_allow = await StorageService.getItem('is_water_allow');
            if (!is_water_allow) {
                setState(oldState => ({
                    ...oldState,
                    nutritionData: state.nutritionData.filter(item => item.value != '1'),
                }));
            }
        });
        return () => { unsubscribe };

    }, []);
    /**Calling the API */
    const bottleTrackingAPI = async () => {
        const child_id = await StorageService.getItem('child_id')
        if (state.start_date_time == '') {
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
                child_id: child_id,
                date_time: state.start_date_time,
                details: state.bottleData.filter(item => item.quantity != '' && item.liquid_type != '')
            }
            let response = await Request.post('bottle/store', params)
            if (response.status === "SUCCESS") {
                setState(oldState => ({
                    ...oldState, isModalVisible: false,
                    button_text: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.button_text : '',
                    sub_title: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.title : '',
                    sub_message: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.message : '',
                    isSubscribe: response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false
                }));
                if (response.code != apiConfigs.USER_UNSUBSCRIBE) {
                    let liquid_type = state.bottleData.filter(item => item.quantity != '' && item.liquid_type != '').map((item, index) => {
                        var dataind = state.nutritionData.find(items => items.value == item.liquid_type) 
                        return dataind.label
                    }).toString()
                    let quantity = state.bottleData.filter(item => item.quantity != '' && item.liquid_type != '').map(item => item.quantity).toString()
                    const trackEventparam = { quantity: quantity, liquid_type: liquid_type, datetime: moment(state.start_date_time).format('h:mm A') }
                    trackEvent({ event: 'Bottle_Tracking', trackEventparam });
                    StorageService.clearTimenur()
                    await StorageService.saveItem('charthome', 'TotalBottlesScreen')
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
    }
    const Action_Missing_continue = () => {
        navigation.navigate('EditBottleScreen1', { Data: undefined, from: 'tracking', onGoBack: (data, isnew, deleteid) => { } })
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }} >
                <View style={{ justifyContent: 'center' }}>
                    <Text style={[styles.quantity,]}>{'Quantity'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '75%', alignItems: 'center' }}>
                    <View style={{ width: '48%', }}>
                        <TextField
                            key={'quantity'}
                            textInputStyle={{ width: '92%', marginEnd: 0, marginStart: 0, textAlign: 'center', }}
                            ref={null}
                            value={qty.trim()}
                            placeholder={'oz'}
                            isShowImg={false}
                            onChangeText={(text) => handleChangeOfText('quantity', index, text, item.liquid_type)}
                            blurOnSubmit={true}
                            maxLength={3}
                            multiline={Platform.OS == 'android' ? true : false}
                            innerContainerStyle={{ height: 60 }}
                            lable={' '}
                            keyboardType={'decimal-pad'}
                            autoCapitalize={'none'}
                            returnKeyType={"done"}
                        />
                    </View>
                    <View style={{ width: '48%', marginEnd: 1 }}>
                        <DropDownField
                            key={'liquid_type'}
                            ref={null}
                            bottled={true}
                            placeholderStyle={{ marginStart: 0, textAlign: 'center', }}
                            selectedTextStyle={{ marginStart: 0, textAlign: 'center', }}
                            data={state.nutritionData}
                            value={item.liquid_type}
                            placeholder={'Select Liquid'}
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
                <View style={{ height: '80%', borderTopRightRadius: 30, borderTopLeftRadius: 30, backgroundColor: colors.pinkShade, }}>
                    <Header
                        headerTitle={'Bottle Tracking'}
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
                    <KeyboardAwareScrollView
                        showsVerticalScrollIndicator={false}
                        enableOnAndroid={true}
                        keyboardOpeningTime={0}
                        extraHeight={Platform.OS === 'ios' ? -75 : 50}
                        keyboardShouldPersistTaps={'handled'}
                        resetScrollToCoords={false}
                        enableAutomaticScroll={true}
                    >
                        <View style={{ width: deviceWidth - 50, alignSelf: 'center', }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ justifyContent: 'center' }}>
                                    <Text style={styles.timeStyle}>{'Time'}</Text>

                                </View>
                                <View style={{ width: '75%', }}>
                                    <TouchableWithoutFeedback onPress={() => {
                                        setState(oldState => ({
                                            ...oldState,
                                            datepicker: true,
                                        })), Keyboard.dismiss()
                                    }}>
                                        <View style={{}}>
                                            <TextField
                                                key={'start_date_time'}
                                                ref={null}
                                                value={state.start_date_time != '' ? moment(state.start_date_time).format('h:mm A') : ''}
                                                placeholder={'Select date and time'}
                                                ImageSrc={importImages.clockIcons}
                                                isShowImg={true}
                                                onChangeText={(text) => handleChangeOfText("start_date_time", text)}
                                                blurOnSubmit={true}
                                                editable={false}
                                                lable={''}
                                                type={'bdate'}
                                                autoCapitalize={'none'}
                                                returnKeyType={"done"}
                                            />
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </View>

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
                        </View>

                        <CalenderModal
                            visible={state.datepicker}
                            transparent={true}
                            lable={'Bottle Session'}
                            type1={'datetime'}
                            maxDate={new Date()}

                            valuesdate={state.cal_date != '' ? state.cal_date : moment(new Date()).format('YYYY-MM-DD')}
                            getDate={(date, time, time1) => getDate(date, time, time1)}
                            CloseModal={() =>
                                setState(oldState => ({
                                    ...oldState,
                                    datepicker: false,
                                }))} />
                    </KeyboardAwareScrollView>
                    <BottomButton text={'Save'} container={{ marginBottom: 15, width: deviceWidth - 44, alignSelf: 'center' }} textstyle={{ fontFamily: fonts.rubikBold, textTransform: 'none' }} onPress={() => bottleTrackingAPI()} />
                    <View style={{ flexDirection: 'row', marginStart: 10, alignItems: "center", justifyContent: 'center', marginBottom: hasNotch() ? 35 : 20, }}>
                        <TouchableWithoutFeedback onPress={() => Action_Missing_continue()}>

                            <View style={{ borderBottomColor: colors.grey, borderBottomWidth: 1 }}>
                                <Text style={{ fontFamily: fonts.rubikBold, fontSize: 17, color: colors.grey, marginBottom: 2 }}>{"Add missing session"}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
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
    timeStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Blue,
        marginTop: 12

    },
    quantity: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Blue,
        marginTop: 12
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
});


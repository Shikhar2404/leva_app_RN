import React, { useState, useEffect, } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback,  FlatList, Animated, TouchableOpacity, Modal,  } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BallIndicator from '../../../components/BallIndicator';
import TextField from "../../../components/TextField";
import Request from '../../../api/Request';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BottomButton from '../../../components/BottomButton';
import StorageService from '../../../utils/StorageService';
import moment from 'moment';
import { trackEvent } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';
import SubscriptionModalView from '../../../components/SubscriptionModalView'
import apiConfigs from '../../../api/apiConfig';
import { hasNotch } from 'react-native-device-info';
export default function DiaperScreen({ route, navigation }) {
    const [state, setState] = useState({
        isModalVisible: false,
        diaper_situation_ids: [],
        selectedDiaper: 0,
        isSelectedStyle: -1,
        stoolModalVisible: false,
        stoolData: [],
        storeIdStoolData: '',
        stoolColor: [],
        diaperTypesData: [
            { name: 'BM', imageActive: importImages.bmactive, imageDeactive: importImages.bmdeactive },
            { name: 'Wet', imageActive: importImages.wetactive, imageDeactive: importImages.wetdeactive },
            { name: 'Dry', imageActive: importImages.dryactive, imageDeactive: importImages.drydeactive },
        ],
        daiperData: [],
        selectedquantitysize: -1,
        note: '',
        storeIdStoolColor: '',
        stool_color_name: '',
        stool_consistency_name: '',

        isSubscribe: false,
        sub_message: '',
        sub_title: '',
        button_text:'',
        qtyData:['Small', 'Medium', 'Large'],
        isMsgTrue: false,
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
            const bdate = await StorageService.getItem('childbate');
            const IS_SUBSCRIBED = await StorageService.getItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED);
            if (IS_SUBSCRIBED) {
                setState(oldState => ({
                    ...oldState,
                    isSubscribe: false,
                }));
            }
            if (bdate) {
                setState(oldState => ({
                    ...oldState,
                    isMsgTrue: moment().diff(bdate, 'day', true) > 5 ? true : false,
                }));
            }
        });
        diaperSituationListApi(state.selectedDiaper)
        return () => { unsubscribe };

    }, [])
    var namrSC = state.stool_color_name ? state.stool_color_name.toLowerCase().replace(/\s/g, '') : ''
    const handleChangeOfText = (key, value) => {
        setState(oldState => ({
            ...oldState,
            [key]: value,
        }));
    };

    const selectedRadioIndex = (index, item) => {
        if (item.is_selected) {
            state.diaper_situation_ids = [...state.diaper_situation_ids.filter(data => data != item.id)]
        }
        else {
            state.diaper_situation_ids.push(item.id)
        }
        state.daiperData[index].is_selected = !item.is_selected

        setState(oldState => ({
            ...oldState,
        }));
    }

    const renderItem = ({ item, index }) => {
        return (
            <View>
                <TouchableOpacity onPress={() => selectedRadioIndex(index, item)} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: index == 0 ? 16 : 22, marginEnd: 2, marginBottom: 2 }}>
                    <Text style={styles.diaperTextStyle}>{item.name}</Text>
                    <FastImage source={item.is_selected ? importImages.SelectedRadioButtons : importImages.RadioButtons} style={{ height: 26, width: 26 }} ></FastImage>
                </TouchableOpacity>
            </View>
        )
    }

    /**Passing the index value */
    const calltheIndexValue = (index, item) => {
        setState(oldState => ({
            ...oldState,
            storeIdStoolData: item.id,
            stool_consistency_name: item.name,
            stoolModalVisible: false
        }))
    }
    const StoolRenderItem = ({ item, index }) => {
        return (
            <View style={{}}>
                <TouchableOpacity onPress={() => calltheIndexValue(index, item)} style={state.storeIdStoolData == item.id ? { backgroundColor: 'white' } : {}}>
                    <Text style={styles.stoolConsistanName}>{item.name}</Text>
                </TouchableOpacity>
                {[state.stoolData.length - 1 == index ? null : <View style={styles.line}></View>]}
            </View>
        )
    }

    const callTheIndex = (index, item) => {
        setState(oldState => ({
            ...oldState,
            storeIdStoolColor: item.id,
            stool_color_name: item.name,
            stoolModalVisible: false
        }))

    }

    const StoolColorRenderItem = ({ index, item }) => {
        return (
            <View style={{}}>
                <TouchableOpacity onPress={() => callTheIndex(index, item)} style={state.storeIdStoolColor == item.id ? { backgroundColor: 'white' } : {}}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10, marginStart: 20 }} >
                        <Text style={styles.stoolName}>{item.name}</Text>
                        <FastImage source={{ uri: item.concat }} style={[styles.StoolImageStyle, { borderColor: state.storeIdStoolColor == item.id ? item.name.toLowerCase().replace(/\s/g, '') != 'white' ? item.name.toLowerCase().replace(/\s/g, '') : 'gray' : 'white' }]}></FastImage>
                    </View>
                    {[state.stoolColor.length - 1 == index ? null : <View style={styles.line}></View>]}
                </TouchableOpacity>
            </View>
        )
    }

    const selectDipaerType = (item, index) => {
        diaperSituationListApi(index)
    }

    const renderItemOfTypesData = ({ item, index }) => {
        return (
            <View style={{ marginTop: 20, marginHorizontal: 20 }}>
                <TouchableOpacity onPress={() => selectDipaerType(item, index)}>
                    <FastImage source={state.selectedDiaper === index ? item.imageActive : item.imageDeactive} style={{ height: 75, width: 75, }} ></FastImage>
                    <Text style={[styles.bmtextStyle, state.selectedDiaper === index ? {} : { opacity: 0.5 }]}>{item.name}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const managequantitysize = (index) => {
        setState(oldState => ({
            ...oldState,
            selectedquantitysize: index,
        }))
    }

    /**FlatList to manage the quantity size  */
    const renderItemQuantity = ({ item, index }) => {
        return (
            <View style={{}}>
                <View style={{ width: (deviceWidth - 50) / 3, }} >
                    <View style={{ height: 85, width: '100%' }}>
                        <View style={{ marginEnd: index != 2 ? 7 : 0, marginTop: 20 }}>
                            <TouchableOpacity onPress={() => managequantitysize(index)} style={state.selectedquantitysize === index ? styles.qtyActiveBtn : styles.qtyInActiveBtn}>
                                <Text style={state.selectedquantitysize === index ? styles.activeTextStyle : styles.inactiveTextStyle}>{item}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

        )
    }

    const modalAndColorApi = (item, index) => {
        stoolColorAPI()
    }

    const modalAndConsistencyAPI = (item, index) => {
        stoolConsistencyAPI()
    }

    /**API for DiaperSession */
    const SaveSessionAPI = async () => {

        const child_id = await StorageService.getItem('child_id')

        setState(oldState => ({
            ...oldState,
            isModalVisible: true,
        }));
        let params = {
            child_id: child_id,
            date_time: moment(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
            type: state.selectedDiaper + 1,
            diaper_situation_ids: state.diaper_situation_ids,
            quantity: state.selectedquantitysize + 1,
            stool_consistency_id: state.storeIdStoolData,
            stool_color_id: state.storeIdStoolColor,
            note: state.note,
        }
        let response = await Request.post('diaper/store', params)
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
                    Diaper_Type: state.diaperTypesData[state.selectedDiaper], Diaper_SubType: state.daiperData.filter(data => data.is_selected).map(item => item.name).toString(), quantity: state.qtyData[state.selectedquantitysize], Note: state.note,
                    Stool_Consistency: state.stool_consistency_name, Stool_Color: state.stool_color_name,
                    alert:namrSC == 'white' || namrSC == 'red' || (namrSC == 'black' && state.isMsgTrue) ? 'You selected a stool color that you should discuss with your pediatrician.' :''
                }
                trackEvent({ event: 'Diaper_Tracking', trackEventparam });
                await StorageService.saveItem('charthome', 'TotalDiaperScreen')
                navigation.navigate('HomeScreen')
            }
        }
        else {
            setState(oldState => ({ ...oldState, isModalVisible: false }));
            if (response) {
                showSimpleAlert(response.message)
            }
        }
        // }
    }

    /** API for diaper-situation-list */
    const diaperSituationListApi = async (index) => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true,
            selectedDiaper: index,
            diaper_situation_ids: [],
            selectedquantitysize: -1,
            storeIdStoolData: '',
            storeIdStoolColor: '',
            note: '',
            stool_color_name: '',
            stool_consistency_name: '',
            isSelectedStyle: -1,

        }));
        let params = {
            type: index + 1,
        }
        let response = await Request.post('diaper-situation-list', params)
        if (response.status === "SUCCESS") {
            setState(oldState => ({
                ...oldState,
                isModalVisible: false,
                daiperData: response.data
            }));
        }
        else {
            setState(oldState => ({
                ...oldState,
                isModalVisible: false,
            }));
            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }


    /**API for Stool color */
    const stoolColorAPI = async () => {
        if (state.stoolColor.length > 0) {
            setState(oldState => ({
                ...oldState,
                stoolModalVisible: true,
                isSelectedStyle: 1
            }));
        }
        else {
            setState(oldState => ({
                ...oldState,
                isModalVisible: true,
                isSelectedStyle: 1
            }));
            let response = await Request.post('stool-color-list')
            if (response.status === "SUCCESS") {
                setState(oldState => ({
                    ...oldState,
                    isModalVisible: false,
                    stoolModalVisible: true,
                    stoolColor: response.data
                }));
            }
            else {
                setState(oldState => ({
                    ...oldState,
                    isModalVisible: false,
                }));
                if (response) {
                    showSimpleAlert(response.message)
                }
            }
        }
    }

    /**API for stool consistency */
    const stoolConsistencyAPI = async () => {
        if (state.stoolData.length > 0) {
            setState(oldState => ({
                ...oldState,
                stoolModalVisible: true,
                isSelectedStyle: 0

            }));
        }
        else {
            setState(oldState => ({
                ...oldState,
                isModalVisible: true,
                isSelectedStyle: 0
            }));
            let response = await Request.post('stool-consistency-list')
            if (response.status === "SUCCESS") {
                setState(oldState => ({
                    ...oldState,
                    isModalVisible: false,
                    stoolModalVisible: true,
                    stoolData: response.data
                }));
            }
            else {
                setState(oldState => ({
                    ...oldState,
                    isModalVisible: false,
                }));
                if (response) {
                    showSimpleAlert(response.message)
                }
            }
        }
    }
    const Action_Missing_continue = () => {
        navigation.navigate('EditDiaperScreen1', { Data: undefined, from: 'tracking', onGoBack: (data, isnew, deleteid) => { } })
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
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <View style={{ flex: 0.8, borderTopRightRadius: 30, borderTopLeftRadius: 30, backgroundColor: colors.pinkShade, }}>
                    <Header
                        headerTitle={'Diaper Tracking'}
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
                    <KeyboardAwareScrollView
                        showsVerticalScrollIndicator={false}
                        enableOnAndroid={true}
                        keyboardOpeningTime={0}
                        keyboardShouldPersistTaps={'handled'}
                        bounces={true}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                            <FlatList
                                data={state.diaperTypesData}
                                renderItem={renderItemOfTypesData}
                                keyExtractor={(item, index) => index.toString()}
                                horizontal={true}
                                scrollEnabled={false}
                                showsHorizontalScrollIndicator={false}

                            />
                            <View style={{ marginTop: 40 }}>
                                <TextField
                                    key={'note'}
                                    ref={null}
                                    value={state.note}
                                    placeholder={'Tap to add note'}
                                    ImageSrc={importImages.exiticon}
                                    isShowImg={true}
                                    onChangeText={(text) => handleChangeOfText("note", text, 0)}
                                    blurOnSubmit={true}
                                    lable={'Note'}
                                    autoCapitalize={'none'}
                                    lableStyle={{ fontFamily: fonts.rubikBold, color: colors.Blue, fontSize: 16 }}

                                />
                            </View>
                            <View style={{ flex: 1, width: deviceWidth - 50 }}>
                                <FlatList
                                    data={state.daiperData}
                                    renderItem={renderItem}
                                    bounces={false}
                                    keyExtractor={(item, index) => index.toString()}
                                    scrollEnabled={false}
                                />
                            </View>
                            {state.selectedDiaper === 0 || state.selectedDiaper === 1 ?
                                <View style={{ width: deviceWidth - 50,}}>
                                    <Text style={styles.quantityTextStyle}>{'Quantity'}</Text>
                                    <View style={{ flex: 1 }}>
                                        <FlatList
                                            data={state.qtyData}
                                            renderItem={renderItemQuantity}
                                            horizontal={true}
                                            scrollEnabled={false}
                                            bounces={false}
                                            keyExtractor={(item, index) => index.toString()}
                                            showsHorizontalScrollIndicator={false}
                                        />
                                    </View>
                                    {state.selectedDiaper != 1 ?
                                        <View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                <View style={{ width: '55%' }}>
                                                    <Text style={styles.stoolConsisTextStyle}>{'Stool Consistency:'}</Text>
                                                </View>
                                                <View style={{ width: '45%' }}>
                                                    <Text style={styles.stoolConsisTextStyle}>{'Stool Color:'}</Text>
                                                </View>
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
                                                <View style={{ width: '55%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                                    <TouchableOpacity onPress={() => modalAndConsistencyAPI()}
                                                        style={[state.stool_consistency_name != '' ? styles.qtyActiveBtn : styles.qtyInActiveBtn]}>
                                                        <Text style={[state.stool_consistency_name != '' ? styles.activeTextStyle : styles.inactiveTextStyle, { marginHorizontal: 25 }]}>{state.stool_consistency_name != '' ? state.stool_consistency_name : 'Tap to set'}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{ width: '45%', alignItems: 'flex-start', justifyContent: 'center', }}>
                                                    <TouchableOpacity onPress={() => modalAndColorApi()}
                                                        style={[state.stool_color_name != '' ? styles.qtyActiveBtn : styles.qtyInActiveBtn, {}]}>
                                                        <Text style={[state.stool_color_name != '' ? styles.activeTextStyle : styles.inactiveTextStyle, { marginHorizontal: 25 }]}>{state.stool_color_name != '' ? state.stool_color_name : 'Tap to set'}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            {namrSC == 'white' || namrSC == 'red' || (namrSC == 'black' && state.isMsgTrue) ?
                                                <View style={{ width: deviceWidth - 40, marginTop: 20, backgroundColor: '#EB5757', borderRadius: 10, justifyContent: 'center', alignItems: 'center',alignSelf:'center' }}>
                                                    <Text style={{ marginStart: 10, marginEnd: 10, fontSize: 16, fontFamily: fonts.rubikRegular, color: colors.White,marginTop:10,marginBottom:10 }}>{'You selected a stool color that you should discuss with your pediatrician.'}</Text>
                                                </View>
                                                : null}
                                        </View>
                                        : null}

                                </View>
                                : null}
                            <BottomButton text={'Save'} container={{ width: deviceWidth - 40, alignSelf: 'center', marginBottom: 15, marginTop: 30 }} textstyle={{ fontFamily: fonts.rubikBold, textTransform: 'none' }} onPress={() => SaveSessionAPI()} />
                            <View style={{ flexDirection: 'row', marginStart: 10, alignItems: "center", justifyContent: 'center', marginBottom: hasNotch() ? 35 : 20, backgroundColor: colors.lightPink }}>
                                <TouchableWithoutFeedback onPress={() => Action_Missing_continue()}>

                                    <View style={{ borderBottomColor: colors.grey, borderBottomWidth: 1 }}>
                                        <Text style={{ fontFamily: fonts.rubikBold, fontSize: 17, color: colors.grey, marginBottom: 2 }}>{"Add missing session"}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>

                    <Modal
                        animated={true}
                        animationType="slide"
                        transparent={true}
                        visible={state.stoolModalVisible}
                        onRequestClose={() => setState(oldState => ({ ...oldState, stoolModalVisible: false }))}>
                        <TouchableWithoutFeedback onPress={() => setState(oldState => ({ ...oldState, stoolModalVisible: false, }))}>
                            <View style={[styles.stoolContainstyles,]}>
                                <TouchableWithoutFeedback onPress={null}>
                                    <View style={[styles.stoolContaincontainerstyle]}>
                                        <TouchableOpacity style={{ paddingHorizontal: 50, width: 12, height: 12, alignSelf: 'flex-end' }} onPress={() => setState(oldState => ({ ...oldState, stoolModalVisible: false }))}>
                                            <FastImage source={importImages.crossIcon} style={{ height: 24, width: 24 }}></FastImage>
                                        </TouchableOpacity>
                                        <Text style={styles.HeadingStyle}>{state.isSelectedStyle == 0 ? 'Stool Consistency' : 'Stool Color'}</Text>
                                        <View style={styles.stoolModalViews}>
                                            <FlatList
                                                data={state.isSelectedStyle == 0 ? state.stoolData : state.stoolColor}
                                                renderItem={state.isSelectedStyle == 0 ? StoolRenderItem : StoolColorRenderItem}
                                                bounces={false}
                                                keyExtractor={(item, index) => index.toString()}
                                                scrollEnabled={false}
                                            />
                                        </View>
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
    bmtextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 20,
        color: colors.Blue,
        marginTop: 10,
        alignSelf: 'center'
    },
    diaperTextStyle: {
        fontFamily: fonts.rubikMedium,
        fontSize: 16,
        color: colors.Blue,
    },
    quantityTextStyle: {
        fontFamily: fonts.rubikBold,
        color: colors.Blue,
        fontSize: 16,
        marginTop: 32,
    },
    stoolConsisTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Blue,
    },
    inactiveTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
        color: colors.Blue,
    },
    activeTextStyle: {
        fontSize: 16,
        fontFamily: fonts.rubikRegular,
        color: colors.White,
    },
    qtyActiveBtn: {
        height: 48,
        borderRadius: 10,
        backgroundColor: colors.Blue,
        alignItems: 'center',
        justifyContent: 'center'
    },
    qtyInActiveBtn: {
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.Blue,
        backgroundColor: colors.White,
        alignItems: 'center',
        justifyContent: 'center'

    },

    stoolContainstyles: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparent,
    },
    stoolContaincontainerstyle: {
        backgroundColor: colors.pinkShade,
        borderRadius: 40,
        paddingVertical: 36,
        width: deviceWidth - 40,
    },
    stoolModalViews: {
        marginTop: 15
    },
    StoolImageStyle: {
        marginRight: 20,
        height: 36,
        width: 36,
        borderRadius: 36 / 2,
        borderColor: 'white',
        borderWidth: 1
    },
    line: {
        width: deviceWidth,
        borderWidth: 0.5,
        opacity: 0.1,
        color: colors.Black,
        borderRadius: 10
    },

    stoolName: {
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
        color: colors.Blue,
        paddingHorizontal: 20,
        alignSelf: 'center'
    },
    stoolConsistanName: {
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
        color: colors.Blue,
        marginTop: 20,
        marginBottom: 20,
        marginStart: 20,
        marginEnd: 20
    },
    HeadingStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 20,
        color: colors.Blue,
        alignSelf: 'center',
    },

});


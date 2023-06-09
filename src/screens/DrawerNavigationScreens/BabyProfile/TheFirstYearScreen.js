import React, { useState, useEffect, useRef, } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableWithoutFeedback, Modal, TouchableOpacity,BackHandler} from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth, } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BallIndicator from '../../../components/BallIndicator';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import Request from '../../../api/Request';
import FastImage from 'react-native-fast-image';
import { trackEvent } from '../../../utils/tracking';
import FastImageView from '../../../components/FastImageView';
import BottomButton from '../../../components/BottomButton';
import apiConfigs from '../../../api/apiConfig';
import ImagePickerView from '../../../components/ImagePickerView';
import Share from 'react-native-share';
import ModalView from '../../../components/ModalView';
import StorageService from '../../../utils/StorageService';
import SubscriptionModalView from '../../../components/SubscriptionModalView'

export default function TheFirstYearScreen({ route, navigation, item, onClickFunction }) {

    const [state, setState] = useState({
        child_id: route.params.childData.child_id,
        child_name: route.params.childData.name,

        childMilestoneData: [],
        selected: 0,
        eyeContactModalVisible: false,
        thatsOkModalVisible: false,
        perfectModalVisible: false,
        getBabyMilstone: '',
        flatlistRef: useRef(),
        isSubscribe: false,
        sub_message: '',
        sub_title: '',
        button_text: '',
    })

    useEffect(() => {
        TheFirstYearrecordAPI()
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
    const TheFirstYearrecordAPI = async () => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true
        }));
        let params = {
            child_id: state.child_id,
        }
        let response = await Request.post('child/milestone', params)
        if (response.status === "SUCCESS") {
            state.selected = response.data ? response.data.findIndex(item => item.is_selected) == -1 ? 0 : response.data.findIndex(item => item.is_selected) : 0
            setState(oldState => ({
                ...oldState,
                isModalVisible: false,
                childMilestoneData: response.data ? response.data : [],
                selected: state.selected
            }));
            setTimeout(() => {
                state.flatlistRef.current.scrollToIndex({ animated: true, index: state.selected })
            }, 300);
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
    const notYetbtnAction = async () => {

        const trackEventparam = { name: state.getBabyMilstone.name, action: 'Yes' }
        trackEvent({ event: 'Milestone_Popup', trackEventparam })
        await addBabyMilestoneApi(0);  //passed 0 if not yet action
    }

    const yesBtnAction = async () => {

        const trackEventparam = { name: state.getBabyMilstone.name, action: "Not Yet" }
        trackEvent({ event: 'Milestone_Popup', trackEventparam })
        await addBabyMilestoneApi(1); //passed 1 if yes action

    }
    /**Add babay milestone */
    const addBabyMilestoneApi = async (isCompleted) => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true,
            eyeContactModalVisible: false
        }));
        let params = {
            child_id: state.child_id,
            milestone_id: state.getBabyMilstone.milestone_id,
            is_completed: isCompleted
        }
        let response = await Request.post('child/add-baby-milestone', params)
        if (response.status === "SUCCESS") {
            const index = state.childMilestoneData[state.selected].data.findIndex(item => item.milestone_id == response.data.fk_milestone_id)
            state.childMilestoneData[state.selected].data[index].is_completed = response.data.is_completed
            setState(oldState => ({
                ...oldState,
                isModalVisible: false,
                childMilestoneData: state.childMilestoneData,
                thatsOkModalVisible: isCompleted == 0 ? true : false,
                perfectModalVisible: isCompleted == 1 ? true : false,
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
    const onGetURI = (image) => {
        //image.path
        onShare(`data:${image.mime};base64,${image.data}`, image.path)
    };
    const onShare = async (image, url) => {
        const title = state.child_name + ' is ' + state.getBabyMilstone.name + '!'
        const message = state.getBabyMilstone.description
        let options = Platform.select({
            default: {
                title: title,
                message: title + '\n' + message,
                url: image,
            }
        });
        try {
            await Share.open(options);
            uploadShareImageApi(url)
        } catch (err) {
            setState(oldState => ({
                ...oldState,
                isImagePickerVisible: false,
                perfectModalVisible: false

            }));
        }
    }
    /** childListAPI calling */
    const uploadShareImageApi = async (url) => {
        setState(oldState => ({
            ...oldState,
            isImagePickerVisible: false,
            perfectModalVisible: false,
            isModalVisible: true,
        }));
        let objImg = {
            name: 'milestone.jpg',
            type: 'image/jpeg',
            uri: url,
        }
        var data = new FormData()
        data.append('child_id', state.child_id)
        data.append('milestone_id', state.getBabyMilstone.milestone_id)
        data.append('image', objImg)
        let response = await Request.postImg('child/share-milestone', data)
        if (response.status === "SUCCESS") {
            setState(oldState => ({
                ...oldState,
                isModalVisible: false,
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
    const actionForMilestomeModel = async (item, index) => {
        await MilestoneDetailsApi(item)

    }
    const MilestoneDetailsApi = async (item) => {
        setState(oldState => ({
            ...oldState,
            isModalVisible: true
        }));
        let params = {
            milestone_id: item.milestone_id,
        }
        let response = await Request.post('child/milestone-detail', params)
        if (response.status === "SUCCESS") {
            setState(oldState => ({
                ...oldState,
                isModalVisible: false,
                button_text: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.button_text : '',
                sub_title: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.title : '',
                sub_message: response.code == apiConfigs.USER_UNSUBSCRIBE ? response.message : '',
                isSubscribe: response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false,
                eyeContactModalVisible: response.code != apiConfigs.USER_UNSUBSCRIBE ? true : false,
                getBabyMilstone: item
            }));

        }
        else {
            setState(oldState => ({
                ...oldState,
                isModalVisible: false
            }));
            if (response) {
                showSimpleAlert(response.message)
            }
        }
    }
    /**nevigation of Learn more for ArticleScreen */
    const articalNevigation = async () => {
        const trackEventparam = { action: 'Learn More' }
        trackEvent({ event: 'Milestone_Popup', trackEventparam })
        setState(oldState => ({
            ...oldState,
            thatsOkModalVisible: false
        }))
        await StorageService.saveItem('clickArticle', '4')
        await StorageService.saveItem('clickArticleMiId', state.getBabyMilstone.milestone_id)
        navigation.navigate('ArticlesScreen')
    }
    const renderItem = ({ item, index }) => {
        return (
            <TouchableWithoutFeedback onPress={() => {
                const trackEventparam = { action: item.duration }
                trackEvent({ event: 'The_First_Year', trackEventparam })
                state.childMilestoneData[index].is_selected = !item.is_selected, setState(oldState => ({ ...oldState, selected: index }))
            }}>
                <View>
                    <View style={{ marginTop: 38, alignItems: 'center', justifyContent: 'center', marginStart: index == 0 ? 0 : 18, borderBottomColor: colors.Blue, borderBottomWidth: state.selected == index ? 3 : 0, marginBottom: state.selected == index ? 0 : 3 }}>
                        <Text style={[styles.monthTextStyle, state.selected == index ? { color: colors.Blue } : { color: colors.Black, }]}>{item.duration}</Text>
                    </View>
                    <View style={styles.linestyle}></View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
    const renderItem1 = ({ item, index }) => {
        const deviceWidthN = 55
        const deviceWidthImg = (deviceWidth - deviceWidthN) / 2
        const deviceHeightImg = (deviceWidth - deviceWidthN) / 2

        return (
            <TouchableWithoutFeedback onPress={() => actionForMilestomeModel(item, index)}>

                <View style={{
                    marginBottom: 20,
                    marginStart: 19 / 2, marginEnd: 19 / 2, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: deviceHeightImg, width: deviceWidthImg, backgroundColor: colors.White, borderRadius: 8, shadowColor: 'rgba(0, 0, 0, 0.03)',
                    shadowOffset: { width: 10, height: 0 },
                    shadowOpacity: 10,
                    shadowRadius: 10,
                    // Android
                    elevation: 10,
                }}>
                    <View style={{ height: 95, width: 95, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ height: item.is_completed == 1 ? 92 : 90, width: item.is_completed == 1 ? 92 : 90, borderRadius: item.is_completed == 1 ? 92 / 2 : 90 / 2, borderColor: colors.Blue, borderWidth: item.is_completed == 1 ? 2 : 0, justifyContent: 'center', alignItems: "center", alignSelf: 'center', backgroundColor: item.is_completed == 1 ? colors.lightestPink : '#E6EAF0' }}>
                            <FastImageView source={{ uri: item.image }} style={styles.iconimagestyle} />
                        </View>
                        {item.is_completed == 1 ?
                            <View style={{ height: 25, width: 95, position: 'absolute', bottom: -10, justifyContent: 'center', alignItems: "center", alignSelf: 'center', }}>
                                <View style={{ height: 25, width: 25, backgroundColor: colors.White, borderRadius: 25 / 2, justifyContent: 'center', alignItems: "center", }}>

                                    <View style={{ height: 20, width: 20, backgroundColor: colors.Blue, borderRadius: 20 / 2, justifyContent: 'center', alignItems: "center", }}>
                                        <FastImage source={importImages.RightMilestone} style={{ height: 12, width: 12, }} tintColor={'white'} resizeMode={'contain'}></FastImage>
                                    </View>

                                </View>
                            </View>
                            : null}
                    </View>
                    <Text style={[{ marginTop: 18, fontFamily: fonts.rubikSemiBold, fontSize: 16, color: colors.Blue, width: deviceWidthImg - 30, textAlign: 'center' }]}>{item.name}</Text>

                </View>
            </TouchableWithoutFeedback>
        )
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
                <Text style={styles.titleStyle}>{'The First Year'}</Text>
                <View style={{
                    width: deviceWidth - 34,
                }}>

                    <FlatList
                        data={state.childMilestoneData}
                        renderItem={renderItem}
                        bounces={false}
                        horizontal
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{}}
                        ref={state.flatlistRef}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <FlatList
                        data={state.childMilestoneData.length > 0 ? state.childMilestoneData[state.selected].data : []}
                        renderItem={renderItem1}
                        bounces={false}
                        contentContainerStyle={{}}
                        numColumns={2}
                        style={{ marginTop: 26 }}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>

            </View>
            {/* eyeContact   */}
            <Modal
                animated={true}
                animationType="fade"
                transparent={true}
                visible={state.eyeContactModalVisible}
                onRequestClose={() => setState(oldState => ({
                    ...oldState,
                    eyeContactModalVisible: false
                }))}>
                <TouchableWithoutFeedback onPress={() => setState(oldState => ({
                    ...oldState,
                    eyeContactModalVisible: false,
                }))}>
                    <View style={[styles.EyesContainstyles,]}>
                        <TouchableWithoutFeedback onPress={() => setState(oldState => ({
                            ...oldState,
                            eyeContactModalVisible: true
                        }))}>
                            <View style={[styles.EyesContaincontainerstyle]}>
                                <View style={styles.EyesContainModalViews}>
                                    <TouchableOpacity style={{ width: 12, height: 12, alignSelf: 'flex-end', marginEnd: 7, marginTop: 7 }} onPress={() => setState(oldState => ({
                                        ...oldState,
                                        eyeContactModalVisible: false
                                    }))}>
                                        <FastImage source={importImages.crossIcon} style={{ height: 19, width: 19 }}></FastImage>
                                    </TouchableOpacity>
                                    <FastImage source={{ uri: state.getBabyMilstone.image }} style={styles.EyesContainImageStyle}></FastImage>
                                    <View style={{ marginTop: 15, justifyContent: 'center', alignItems: 'center', width: deviceWidth - 80, }}>
                                        <View style={{}} >
                                            <Text style={styles.motorTextStyle}>{state.getBabyMilstone.name}</Text>
                                            <Text style={styles.lifeTextStyle}>{state.getBabyMilstone.subtitle}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.whatTextStyle}>{'What to look for:'}</Text>
                                    <Text style={styles.yourbabayTextStyle}>{state.getBabyMilstone.description}</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, marginHorizontal: 70 }}>
                                        <TouchableOpacity onPress={() => notYetbtnAction(0)}>
                                            <View style={{ width: 51, height: 51, borderRadius: 51 / 2, backgroundColor: colors.Blue, justifyContent: 'center', alignItems: 'center' }}>
                                                <FastImage source={importImages.crossIcon} style={{ width: 12, height: 12, }} tintColor={colors.White}></FastImage>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => yesBtnAction(1)}>
                                            <FastImage source={importImages.yesicon} style={{ width: 51, height: 51 }}></FastImage>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', marginTop: 4, marginHorizontal: 65, justifyContent: 'space-around' }}>
                                        <Text style={styles.notTextStyle}>{'Not yet'}</Text>
                                        <Text style={styles.yesTextStyle}>{'Yes'}</Text>
                                    </View>
                                </View>

                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* thatsOk   */}
            <Modal
                animated={true}
                animationType="fade"
                transparent={true}
                visible={state.thatsOkModalVisible}
                onRequestClose={() => setState(oldState => ({
                    ...oldState,
                    thatsOkModalVisible: false
                }))}>
                <TouchableWithoutFeedback onPress={() => setState(oldState => ({
                    ...oldState,
                    thatsOkModalVisible: false,
                }))}>
                    <View style={[styles.EyesContainstyles,]}>
                        <TouchableWithoutFeedback onPress={() => setState(oldState => ({
                            ...oldState,
                            eyeContactModalVisible: true
                        }))}>
                            <View style={[styles.EyesContaincontainerstyle]}>

                                <View style={styles.EyesContainModalViews}>
                                    <TouchableOpacity style={{ width: 12, height: 12, alignSelf: 'flex-end', marginEnd: 7, marginTop: 7 }} onPress={() => setState(oldState => ({
                                        ...oldState,
                                        thatsOkModalVisible: false
                                    }))}>
                                        <FastImage source={importImages.crossIcon} style={{ height: 19, width: 19 }}></FastImage>
                                    </TouchableOpacity>
                                    <FastImage source={importImages.okicon} style={styles.EyesContainImageStyle}></FastImage>
                                    <Text style={styles.thatOkTextStyle}>{'That’s Ok!'}</Text>
                                    <Text style={styles.noWorriesTextStyle}>{'No worries, mama! Lots of babies take a little more time to complete this milestone.'}</Text>
                                    <TouchableOpacity onPress={() => articalNevigation()} style={styles.learnMoreButtonStyle}>
                                        <Text style={styles.learnTextStyle}>{'Learn More'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.exitButtonStyle} onPress={() => {
                                        const trackEventparam = { action: 'Exit' }
                                        trackEvent({ event: 'Milestone_Popup', trackEventparam })
                                        setState(oldState => ({ ...oldState, thatsOkModalVisible: false }))
                                    }} >
                                        <Text style={styles.ExitTextStyle}>{'Exit'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* perfect */}
            <Modal
                animated={true}
                animationType="fade"
                transparent={true}
                visible={state.perfectModalVisible}
                onRequestClose={() => setState(oldState => ({
                    ...oldState,
                    perfectModalVisible: false
                }))}>
                <TouchableWithoutFeedback onPress={() => setState(oldState => ({
                    ...oldState,
                    perfectModalVisible: false,
                }))}>
                    <View style={[styles.EyesContainstyles,]}>
                        <TouchableWithoutFeedback onPress={() => setState(oldState => ({
                            ...oldState,
                            perfectModalVisible: true
                        }))}>
                            <View style={[styles.EyesContaincontainerstyle]}>
                                <TouchableOpacity style={{ width: 12, height: 12, alignSelf: 'flex-end' }} onPress={() => setState(oldState => ({
                                    ...oldState,
                                    perfectModalVisible: false
                                }))}>
                                    <FastImage source={importImages.crossIcon} style={{ height: 19, width: 19 }}></FastImage>
                                </TouchableOpacity>
                                <View style={styles.perfectModalViews}>
                                    <FastImage source={importImages.perfecticon} style={styles.perfectContainImageStyle}></FastImage>
                                    <Text style={styles.perfectTextStyle}>{'Perfect'}</Text>
                                    <Text style={styles.mamaTextStyle}>{'Congratulations mama! Your baby is \n right on track.'}</Text>
                                    <BottomButton text={'Share'} onPress={() => {
                                        const trackEventparam = { action: 'Share Image' }
                                        trackEvent({ event: 'Milestone_Popup', trackEventparam })
                                        setState(oldState => ({ ...oldState, isImagePickerVisible: true, }))
                                    }} container={{ marginBottom: 20, alignSelf: 'center', marginTop: 20 }} />


                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        <ImagePickerView
                            visible={state.isImagePickerVisible}
                            transparent={true}
                            CloseModal={() =>
                                setState(oldState => ({
                                    ...oldState,
                                    isImagePickerVisible: false,
                                }))}
                            onGetURI={onGetURI}
                        />
                    </View>
                </TouchableWithoutFeedback>

            </Modal>
            {state.isSubscribe ?
                <SubscriptionModalView
                    style={{ height: '100%', }}
                    BlurViewStyle={[{ width: deviceWidth, height: '100%' }]}
                    containerstyle={[{ width: deviceWidth, height: '100%' }]}
                    message={state.sub_message}
                    title={state.sub_title}
                    button_text={state.button_text}
                    subScribeOnClick={() => { navigation.navigate('SubscriptionScreen') }}
                    onClose={() => {
                        setState(oldState => ({
                            ...oldState,
                            isSubscribe: false,
                        }));
                    }}
                />
                : null}
            {
                state.isModalVisible &&
                <BallIndicator visible={state.isModalVisible} />
            }
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: deviceWidth,
        alignSelf: 'center',
        height: '100%',
        alignItems: 'center'
    },
    titleStyle: {
        color: colors.Blue,
        width: deviceWidth - 34,

        fontSize: 28,
        fontFamily: fonts.rubikBold,
        textTransform: 'capitalize',
    },
    linestyle: {
        height: 1,
        opacity: 0.2,
        backgroundColor: colors.Black,
    },

    monthTextStyle: {
        fontFamily: fonts.rubikSemiBold,
        fontSize: 20,
        marginBottom: 10


    },

    iconimagestyle: {
        height: 75,
        width: 75,
        borderRadius: 75 / 2,
        alignSelf: 'center'
    },
    EyesContainstyles: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.transparent,
    },
    EyesContaincontainerstyle: {
        backgroundColor: colors.pinkShade,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 20,
        width: deviceWidth - 40,
    },
    EyesContainImageStyle: {
        alignSelf: 'center',
        height: 158,
        width: 158,
        borderRadius: 158 / 2,
    },
    motorTextStyle: {
        fontFamily: fonts.rubikSemiBold,
        fontSize: 20,
        color: colors.Blue,
    },
    lifeTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 12,
        color: colors.Blue,
    },
    whatTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Black,
        marginTop: 26
    },
    yourbabayTextStyle: {
        marginTop: 10,
        fontSize: 12,
        fontFamily: fonts.rubikRegular,
        color: colors.Black
    },
    notTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 14,
        color: colors.Blue
    },
    yesTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 14,
        color: colors.Blue,
        marginRight: 10
    },
    thatOkTextStyle: {
        fontFamily: fonts.rubikBold,
        color: colors.Blue,
        fontSize: 20,
        alignSelf: 'center',
        marginTop: 34
    },
    noWorriesTextStyle: {
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
        textAlign: 'center',
        color: colors.Blue,
        marginTop: 10
    },
    learnMoreButtonStyle: {
        width: '100%',
        height: 50,
        borderRadius: 10,
        backgroundColor: colors.Blue,
        marginTop: 25
    },
    learnTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.White,
        alignSelf: 'center',
        marginVertical: 15
    },
    exitButtonStyle: {
        marginTop: 10,
        height: 50,
        width: "100%",
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.Blue,
        marginVertical: 5,
    },
    ExitTextStyle: {
        fontFamily: fonts.rubikBold,
        fontSize: 16,
        color: colors.Blue,
        alignSelf: 'center',
        marginVertical: 15,
    },
    perfectModalViews: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    perfectContainImageStyle: {
        height: 158,
        width: 158,
        borderRadius: 158 / 2,
    },
    perfectTextStyle: {
        marginTop: 30,
        fontFamily: fonts.rubikRegular,
        fontSize: 20,
        color: colors.Blue
    },
    mamaTextStyle: {
        marginTop: 10,
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
        textAlign: 'center',
        color: colors.Blue
    },

    iconimagestyle: {
        height: 55,
        width: 55,
        borderRadius: 55 / 2,
        alignSelf: 'center'
    },

});



import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  BackHandler,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { colors } from "../../../utils/color";
import { fonts, stylesBackground } from "../../../utils/font";
import { deviceWidth } from "../../../constants";
import { importImages } from "../../../utils/importImages";
import BallIndicator from "../../../components/BallIndicator";
import Request from "../../../api/Request";
import moment from "moment";
import showSimpleAlert from "../../../utils/showSimpleAlert";
import StorageService from "../../../utils/StorageService";
import BottomButton from "../../../components/BottomButton";
import { trackEvent } from "../../../utils/tracking";
import FastImage from "react-native-fast-image";
import SubscriptionModalView from "../../../components/SubscriptionModalView";
import apiConfigs from "../../../api/apiConfig";
import ImagePickerView from "../../../components/ImagePickerView";
import Share from "react-native-share";
import ModalView from "../../../components/ModalView";
import FastImageView from "../../../components/FastImageView";

export default function ChildProfileScreen({ route, navigation }) {
  const [state, setState] = useState({
    name: "",
    datepicker: false,
    gender: "",
    isModalVisible: false,
    childModalVisible: false,
    eyeContactModalVisible: false,
    thatsOkModalVisible: false,
    perfectModalVisible: false,
    selectedChild: 0,
    selecteditem: {},
    childListData: [],
    childData: "",
    isFocus: false,
    milestonedata: [],
    getBabyMilstone: "",
    bloodtypeData: [
      { label: "A+", value: "1" },
      { label: "A-", value: "2" },
      { label: "B+", value: "3" },
      { label: "B-", value: "4" },
      { label: "AB+", value: "5" },
      { label: "AB-", value: "6" },
      { label: "O+", value: "7" },
      { label: "O-", value: "8" },
    ],
    nutritionData: [
      { label: "Water", value: "1" },
      { label: "Formula", value: "2" },
      { label: "Milk", value: "3" },
    ],

    isSubscribe: false,
    sub_message: "",
    sub_title: "",
    button_text: "",

    isImagePickerVisible: false,
    shareImg: "",
    shareImgUrl: "",
    ischeckSomething: false,
  });
  const goBackNav1 = () => {
    setState((oldState) => ({
      ...oldState,
      isSubscribe: false,
    }));
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const IS_SUBSCRIBED = await StorageService.getItem(
        StorageService.STORAGE_KEYS.IS_SUBSCRIBED
      );
      if (IS_SUBSCRIBED) {
        setState((oldState) => ({
          ...oldState,
          isSubscribe: false,
        }));
      }
      const id = await StorageService.getItem("child_id");
      await childDetailsApi(id);
      await childListApi();
    });
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      goBackNav1
    );
    return () => {
      unsubscribe, backHandler.remove();
    };
  }, [state.isFocus]);

  /** refresh data back from edit */
  const onBackRefresh = () => {
    if (Object.keys(state.selecteditem).length > 0) {
      childDetailsApi(state.selecteditem.child_id);
    }
  };
  const selectedRadioIndex = async (index, item) => {
    await StorageService.saveItem("child_id", item.child_id);
    await StorageService.saveItem("childbate", item.dob);
    childDetailsApi(item.child_id);
  };

  const ModalCalled = async () => {
    setState((oldState) => ({
      ...oldState,
      childModalVisible: true,
    }));
  };

  const notYetbtnAction = async () => {
    const trackEventparam = { name: state.getBabyMilstone.name, action: "Yes" };
    trackEvent({ event: "Milestone_Popup", trackEventparam });
    await addBabyMilestoneApi(0); //passed 0 if not yet action
  };

  const yesBtnAction = async () => {
    const trackEventparam = {
      name: state.getBabyMilstone.name,
      action: "Not Yet",
    };
    trackEvent({ event: "Milestone_Popup", trackEventparam });
    await addBabyMilestoneApi(1); //passed 1 if yes action
  };

  const actionForMilestomeModel = async (item, index) => {
    await MilestoneDetailsApi(item);
  };

  /**flatlist data of mileStone*/
  const renderchilditemmilestone = ({ item, index }) => {
    return (
      <View
        style={{
          width: deviceWidth / 3,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ height: 120 }}>
          <TouchableOpacity
            onPress={() => actionForMilestomeModel(item, index)}
          >
            <View
              style={{
                height: 65,
                width: 65,
                borderRadius: 65 / 2,
                borderColor: colors.Blue,
                borderWidth: item.is_completed == 1 ? 2 : 0,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <FastImageView
                source={{ uri: item.thumbnail_image }}
                style={styles.iconimagestyle}
              />
            </View>
            {item.is_completed == 1 ? (
              <View
                style={{
                  height: 25,
                  width: 65,
                  position: "absolute",
                  bottom: -10,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                }}
              >
                <View
                  style={{
                    height: 25,
                    width: 25,
                    backgroundColor: colors.pink,
                    borderRadius: 25 / 2,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      height: 20,
                      width: 20,
                      backgroundColor: colors.Blue,
                      borderRadius: 20 / 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FastImage
                      source={importImages.RightMilestone}
                      style={{ height: 12, width: 12 }}
                      tintColor={"white"}
                      resizeMode={"contain"}
                    ></FastImage>
                  </View>
                </View>
              </View>
            ) : null}
          </TouchableOpacity>
          <View style={{ marginTop: 12 }}>
            <Text numberOfLines={2} style={styles.nameTextStyle}>
              {item.short_name}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /** childListAPI calling */
  const childListApi = async () => {
    let response = await Request.post("user/child-list");
    if (response.status === "SUCCESS") {
      setState((oldState) => ({
        ...oldState,
        childListData: response.data.child_list,
      }));
    } else {
      if (response) {
        showSimpleAlert(response.message);
      }
    }
  };
  const onShare = async (image, url) => {
    const title =
      state.selecteditem.name + " is " + state.getBabyMilstone.name + "!";
    const message = state.getBabyMilstone.description;
    let options = Platform.select({
      default: {
        title: title,
        message: title + "\n" + message,
        url: image,
      },
    });
    try {
      await Share.open(options);
      uploadShareImageApi(url);
    } catch (err) {
      setState((oldState) => ({
        ...oldState,
        isImagePickerVisible: false,
        perfectModalVisible: false,
      }));
    }
  };
  /** childListAPI calling */
  const uploadShareImageApi = async (url) => {
    setState((oldState) => ({
      ...oldState,
      isImagePickerVisible: false,
      perfectModalVisible: false,
      isModalVisible: true,
    }));
    let objImg = {
      name: "milestone.jpg",
      type: "image/jpeg",
      uri: url,
    };
    var data = new FormData();
    data.append("child_id", state.selecteditem.child_id);
    data.append("milestone_id", state.getBabyMilstone.milestone_id);
    data.append("image", objImg);
    let response = await Request.postImg("child/share-milestone", data);
    if (response.status === "SUCCESS") {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
      }));
    } else {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
      }));
      if (response) {
        showSimpleAlert(response.message);
      }
    }
  };
  const onGetURI = (image) => {
    //image.path
    onShare(`data:${image.mime};base64,${image.data}`, image.path);
  };

  /**childdata API calling */
  const childDetailsApi = async (child_id) => {
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
      selectedChild: child_id,
      childModalVisible: false,
    }));
    let params = {
      child_id: child_id,
    };
    let response = await Request.post("child/detail", params);
    if (response.status === "SUCCESS") {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
        selecteditem: response.data,
        milestonedata: response.data.milestone,
      }));
    } else {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
      }));
      if (response) {
        showSimpleAlert(response.message);
      }
    }
  };

  /**Add babay milestone */
  const addBabyMilestoneApi = async (isCompleted) => {
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
      eyeContactModalVisible: false,
    }));
    let params = {
      child_id: state.selecteditem.child_id,
      milestone_id: state.getBabyMilstone.milestone_id,
      is_completed: isCompleted,
    };
    let response = await Request.post("child/add-baby-milestone", params);
    if (response.status === "SUCCESS") {
      const index = state.milestonedata.findIndex(
        (item) => item.milestone_id == response.data.fk_milestone_id
      );
      state.milestonedata[index].is_completed = response.data.is_completed;
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
        milestonedata: state.milestonedata,
        thatsOkModalVisible: isCompleted == 0 ? true : false,
        perfectModalVisible: isCompleted == 1 ? true : false,
      }));
    } else {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
      }));
      if (response) {
        showSimpleAlert(response.message);
      }
    }
  };
  const updateSomethingStatusApi = async () => {
    const trackEventparam = { action: "Has your pregnancy ended?" };
    trackEvent({ event: "Something_has_changed", trackEventparam });
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
    }));
    let params = {
      child_id: state.selecteditem.child_id,
      is_something_change: 1,
    };
    let response = await Request.post("child/update-something-change", params);
    if (response.status === "SUCCESS") {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
        ischeckSomething: false,
      }));
      navigation.goBack();
      navigation.navigate("ArticlesDetailesScreen", {
        id: "593dc328-a4b2-45ad-9390-e5e903c9bdb9",
      });
    } else {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
      }));
      if (response) {
        showSimpleAlert(response.message);
      }
    }
  };
  const MilestoneDetailsApi = async (item) => {
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
    }));
    let params = {
      milestone_id: item.milestone_id,
    };
    let response = await Request.post("child/milestone-detail", params);
    if (response.status === "SUCCESS") {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
        button_text:
          response.code == apiConfigs.USER_UNSUBSCRIBE
            ? response.button_text
            : "",
        sub_title:
          response.code == apiConfigs.USER_UNSUBSCRIBE ? response.title : "",
        sub_message:
          response.code == apiConfigs.USER_UNSUBSCRIBE ? response.message : "",
        isSubscribe:
          response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false,
        eyeContactModalVisible:
          response.code != apiConfigs.USER_UNSUBSCRIBE ? true : false,
        getBabyMilstone: item,
      }));

      if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
      }
    } else {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
      }));
      if (response) {
        showSimpleAlert(response.message);
      }
    }
  };
  /**nevigation of Learn more for ArticleScreen */
  const articalNevigation = async () => {
    const trackEventparam = { action: "Learn More" };
    trackEvent({ event: "Milestone_Popup", trackEventparam });
    setState((oldState) => ({
      ...oldState,
      thatsOkModalVisible: false,
    }));
    await StorageService.saveItem("clickArticle", "4");
    await StorageService.saveItem(
      "clickArticleMiId",
      state.getBabyMilstone.milestone_id
    );
    navigation.navigate("ArticlesScreen");
  };
  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => selectedRadioIndex(index, item)}>
        <View style={styles.modalView}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FastImage
              source={importImages.appicon}
              style={styles.babyimageStyle}
            >
              <FastImage
                source={{ uri: item.image }}
                style={styles.babyimageStyle}
              ></FastImage>
            </FastImage>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.subtitleStyle}>{item.name}</Text>
            </View>
          </View>
          <FastImage
            source={
              state.selectedChild === item.child_id
                ? importImages.SelectedRadioButtons
                : importImages.RadioButtons
            }
            style={{ height: 26, width: 26 }}
          ></FastImage>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <FastImage
        source={importImages.BackgroundAll}
        style={stylesBackground.backgroundimgcontainer}
        resizeMode={"stretch"}
      ></FastImage>
      <SafeAreaView style={{ backgroundColor: colors.Purple }}></SafeAreaView>
      <View style={{ flex: 1 }}>
        <View style={styles.TextViewcontainer}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 60,
            }}
          >
            <TouchableOpacity
              style={styles.textViewStyle}
              onPress={() => ModalCalled()}
            >
              <Text style={styles.titleStyle} numberOfLines={1}>
                {state.selecteditem.name}
              </Text>
              {state.selecteditem.name ? (
                <FastImage
                  source={importImages.dropDownwhiteIcons}
                  style={{ height: 32, width: 29 }}
                ></FastImage>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const trackEventparam = { action: "Back" };
                trackEvent({ event: "Child_Profile", trackEventparam });
                navigation.goBack();
              }}
              style={styles.backImageStyle}
            >
              <FastImage
                source={importImages.backImg}
                style={{ height: 29, width: 29 }}
              ></FastImage>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitleStyles}>
            {state.selecteditem.dob == ""
              ? state.selecteditem.age_text
              : state.selecteditem.age}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.Scrollcontainer}
            bounces={false}
          >
            <View style={{ marginBottom: 140 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.textbabyStyle}>
                  {state.selecteditem.name
                    ? state.selecteditem.dob
                      ? "Baby’s Milestones"
                      : "Baby’s Development"
                    : ""}
                </Text>

                <View style={styles.imageiconStyle}>
                  {state.selecteditem.dob ? (
                    <View style={{}}>
                      <FlatList
                        data={state.milestonedata}
                        renderItem={renderchilditemmilestone}
                        horizontal={true}
                        bounces={false}
                        keyExtractor={(item, index) => index.toString()}
                        showsHorizontalScrollIndicator={false}
                      />
                    </View>
                  ) : state.selecteditem.name &&
                    state.selecteditem.dob == "" ? (
                    <View
                      style={{
                        width: deviceWidth - 50,
                        alignSelf: "center",
                        backgroundColor: colors.White,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#E9E9E9",
                        flex: 1,
                        paddingHorizontal: 20,
                        paddingVertical: 20,
                        alignItems: "flex-start",
                        justifyContent: "center",
                      }}
                    >
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: fonts.rubikRegular,
                            fontSize: 16,
                            color: "#00172E",
                          }}
                        >
                          {state.selecteditem.content}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>
              {state.selecteditem.name ? (
                <View
                  style={{
                    width: deviceWidth - 50,
                    alignSelf: "center",
                    backgroundColor: colors.White,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#E9E9E9",
                    flex: 1,
                    marginTop: 25,
                    paddingHorizontal: 20,
                    paddingVertical: 20,
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexDirection: "row",
                  }}
                >
                  <View style={{ width: "90%" }}>
                    <View style={{ flexDirection: "row" }}>
                      <Text
                        style={{
                          fontFamily: fonts.rubikBold,
                          fontSize: 19,
                          color: colors.Blue,
                          marginEnd: 15,
                        }}
                      >
                        {state.selecteditem.name}
                      </Text>
                    </View>
                    {state.selecteditem.due_date ? (
                      <View style={{}}>
                        <View
                          style={{
                            flexDirection: "row",
                            marginTop: 15,
                            alignItems: "center",
                          }}
                        >
                          <FastImage
                            source={
                              state.selecteditem.dob
                                ? importImages.birthicon
                                : importImages.babybornicon
                            }
                            style={{ height: 16, width: 12 }}
                          ></FastImage>
                          <Text
                            style={{
                              fontFamily: fonts.rubikRegular,
                              fontSize: 16,
                              color: "rgba(127, 138, 150, 1)",
                              marginStart: 10,
                            }}
                          >
                            {state.selecteditem.dob
                              ? moment(state.selecteditem.dob).format(
                                  "MM/DD/YYYY"
                                )
                              : moment(state.selecteditem.due_date).format(
                                  "MM/DD/YYYY"
                                )}
                          </Text>
                        </View>
                        {state.selecteditem.dob ? (
                          <View style={{}}>
                            {state.selecteditem.gender ||
                            state.selecteditem.lbs ||
                            state.selecteditem.ounces ||
                            state.selecteditem.inches ||
                            state.selecteditem.blood_type ||
                            state.selecteditem.nutrition ? (
                              <View
                                style={{ height: 20, width: deviceWidth }}
                              ></View>
                            ) : null}
                            {state.selecteditem.gender ? (
                              <View
                                style={{
                                  width: deviceWidth - 100,
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  paddingTop: 15,
                                  paddingBottom: 15,
                                  borderTopWidth: 0.5,
                                  borderColor: "rgba(127, 138, 150, 1)",
                                  flexDirection: "row",
                                }}
                              >
                                <Text
                                  style={{
                                    fontFamily: fonts.rubikSemiBold,
                                    fontSize: 16,
                                    color: "rgba(0, 23, 46, 1)",
                                  }}
                                >
                                  {"Gender"}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: fonts.rubikRegular,
                                    fontSize: 16,
                                    color: "rgba(127, 138, 150, 1)",
                                    opacity: 50,
                                  }}
                                >
                                  {state.selecteditem.gender == 1
                                    ? "Male"
                                    : "Female"}
                                </Text>
                              </View>
                            ) : null}
                            {state.selecteditem.lbs ||
                            state.selecteditem.ounces ? (
                              <View
                                style={{
                                  width: deviceWidth - 100,
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  paddingTop: 15,
                                  paddingBottom: 15,
                                  borderTopWidth: 0.5,
                                  borderColor: "rgba(127, 138, 150, 1)",
                                  flexDirection: "row",
                                }}
                              >
                                <Text
                                  style={{
                                    fontFamily: fonts.rubikSemiBold,
                                    fontSize: 16,
                                    color: "rgba(0, 23, 46, 1)",
                                  }}
                                >
                                  {"Weight"}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: fonts.rubikRegular,
                                    fontSize: 16,
                                    color: "rgba(127, 138, 150, 1)",
                                    opacity: 50,
                                  }}
                                >
                                  {state.selecteditem.lbs != ""
                                    ? state.selecteditem.lbs + " lb "
                                    : ""}
                                  {state.selecteditem.ounces != ""
                                    ? state.selecteditem.ounces + " oz"
                                    : ""}
                                </Text>
                              </View>
                            ) : null}
                            {state.selecteditem.inches ? (
                              <View
                                style={{
                                  width: deviceWidth - 100,
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  paddingTop: 15,
                                  paddingBottom: 15,
                                  borderTopWidth: 0.5,
                                  borderColor: "rgba(127, 138, 150, 1)",
                                  flexDirection: "row",
                                }}
                              >
                                <Text
                                  style={{
                                    fontFamily: fonts.rubikSemiBold,
                                    fontSize: 16,
                                    color: "rgba(0, 23, 46, 1)",
                                  }}
                                >
                                  {"Height"}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: fonts.rubikRegular,
                                    fontSize: 16,
                                    color: "rgba(127, 138, 150, 1)",
                                    opacity: 50,
                                  }}
                                >
                                  {state.selecteditem.inches + " in"}
                                </Text>
                              </View>
                            ) : null}
                            {state.selecteditem.blood_type ? (
                              <View
                                style={{
                                  width: deviceWidth - 100,
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  paddingTop: 15,
                                  paddingBottom: 15,
                                  borderTopWidth: 0.5,
                                  borderColor: "rgba(127, 138, 150, 1)",
                                  flexDirection: "row",
                                }}
                              >
                                <Text
                                  style={{
                                    fontFamily: fonts.rubikSemiBold,
                                    fontSize: 16,
                                    color: "rgba(0, 23, 46, 1)",
                                  }}
                                >
                                  {"Blood Group"}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: fonts.rubikRegular,
                                    fontSize: 16,
                                    color: "rgba(127, 138, 150, 1)",
                                    opacity: 50,
                                  }}
                                >
                                  {
                                    state.bloodtypeData[
                                      Number(state.selecteditem.blood_type) - 1
                                    ].label
                                  }
                                </Text>
                              </View>
                            ) : null}
                            {state.selecteditem.nutrition ? (
                              <View
                                style={{
                                  width: deviceWidth - 100,
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  paddingTop: 15,
                                  borderTopWidth: 0.5,
                                  borderColor: "rgba(127, 138, 150, 1)",
                                  flexDirection: "row",
                                }}
                              >
                                <Text
                                  style={{
                                    fontFamily: fonts.rubikSemiBold,
                                    fontSize: 16,
                                    color: "rgba(0, 23, 46, 1)",
                                  }}
                                >
                                  {"Nutrition"}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: fonts.rubikRegular,
                                    fontSize: 16,
                                    color: "rgba(127, 138, 150, 1)",
                                    opacity: 50,
                                  }}
                                >
                                  {
                                    state.nutritionData[
                                      Number(state.selecteditem.nutrition) - 1
                                    ].label
                                  }
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      const trackEventparam = { action: "Edit" };
                      trackEvent({ event: "Child_Profile", trackEventparam });
                      navigation.navigate("EditChildProfileScreen", {
                        childData: state.selecteditem,
                        onBackRefresh: () => onBackRefresh(),
                        isbdate: false,
                      });
                    }}
                  >
                    <View
                      style={{
                        height: 30,
                        width: 30,
                        alignItems: "center",
                        position: "absolute",
                        right: 20,
                        top: 15,
                        justifyContent: "center",
                      }}
                    >
                      <FastImage
                        source={importImages.edit2Icon}
                        style={{ height: 17, width: 17 }}
                      ></FastImage>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              ) : null}
              {state.selecteditem.dob &&
              (state.selecteditem.allergies ||
                state.selecteditem.medicalconcern) ? (
                <View
                  style={{
                    width: deviceWidth - 50,
                    alignSelf: "center",
                    backgroundColor: colors.White,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#E9E9E9",
                    flex: 1,
                    marginTop: 10,
                    paddingHorizontal: 20,
                    paddingVertical: 20,
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  {state.selecteditem.allergies ? (
                    <View
                      style={{
                        width: deviceWidth - 100,
                        justifyContent: "center",
                        alignItems: "flex-start",
                        paddingBottom: state.selecteditem.medicalconcern
                          ? 15
                          : 0,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.rubikSemiBold,
                          fontSize: 16,
                          color: "rgba(0, 23, 46, 1)",
                        }}
                      >
                        {"Allergies"}
                      </Text>
                      <Text
                        style={{
                          fontFamily: fonts.rubikRegular,
                          fontSize: 16,
                          color: "rgba(127, 138, 150, 1)",
                          opacity: 50,
                          marginTop: 10,
                        }}
                      >
                        {state.selecteditem.allergies}
                      </Text>
                    </View>
                  ) : null}
                  {state.selecteditem.medical_concerns ? (
                    <View
                      style={{
                        width: deviceWidth - 100,
                        justifyContent: "center",
                        alignItems: "flex-start",
                        paddingTop: 15,
                        borderTopWidth: 0.5,
                        borderColor: "rgba(127, 138, 150, 1)",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.rubikSemiBold,
                          fontSize: 16,
                          color: "rgba(0, 23, 46, 1)",
                        }}
                      >
                        {"Concerns"}
                      </Text>
                      <Text
                        style={{
                          fontFamily: fonts.rubikRegular,
                          fontSize: 16,
                          color: "rgba(127, 138, 150, 1)",
                          opacity: 50,
                          marginTop: 10,
                        }}
                      >
                        {state.selecteditem.medical_concerns}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {state.selecteditem.dob == "" ? (
                <View
                  style={{
                    width: deviceWidth - 50,
                    alignSelf: "center",
                    marginTop: 42,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() => {
                      setState((oldState) => ({
                        ...oldState,
                        ischeckSomething: true,
                      }));
                    }}
                  >
                    <View
                      style={{
                        borderBottomColor: colors.Blue,
                        borderBottomWidth: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.rubikBold,
                          fontSize: 15,
                          color: colors.Blue,
                          marginBottom: 2,
                        }}
                      >
                        {"Something has changed"}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              ) : null}
            </View>
            <View style={styles.buttonStyle}></View>
          </ScrollView>
          {state.selecteditem.dob ? (
            <BottomButton
              text={"Track Growth"}
              onPress={() => {
                const trackEventparam = { action: "Track Growth" };
                trackEvent({ event: "Child_Profile", trackEventparam });
                navigation.navigate("TotalGrowthScreen", {
                  child_id: state.selecteditem.child_id,
                });
              }}
              container={{
                position: "absolute",
                bottom: 50,
                backgroundColor: colors.textinputBackground,
                borderWidth: 1,
                borderColor: colors.Blue,
                width: deviceWidth - 50,
                alignSelf: "center",
              }}
              textstyle={{ color: colors.Blue }}
            />
          ) : null}
          {state.selecteditem.dob ? (
            <BottomButton
              text={"See Milestones"}
              onPress={() => {
                const trackEventparam = { action: "See Milestones" };
                trackEvent({ event: "Child_Profile", trackEventparam });
                navigation.navigate("TheFirstYearScreen", {
                  childData: state.selecteditem,
                });
              }}
              container={{
                position: "absolute",
                bottom: -20,
                width: deviceWidth - 50,
                alignSelf: "center",
              }}
            />
          ) : null}
        </View>
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 190 / 2,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
          }}
          disabled={true}
        >
          <FastImage
            source={importImages.ProfileIcon}
            style={styles.ImportImageStyle}
          ></FastImage>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              top: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FastImage
              source={importImages.appicon}
              style={{
                height: 145,
                width: 145,
                borderRadius: 145 / 2,
                alignSelf: "center",
              }}
            >
              <FastImage
                source={{ uri: state.selecteditem.image }}
                style={{
                  height: 145,
                  width: 145,
                  borderRadius: 145 / 2,
                  alignSelf: "center",
                }}
              ></FastImage>
            </FastImage>
          </View>
        </TouchableOpacity>
      </View>

      {/* list modals    */}
      <Modal
        animated={true}
        animationType="slide"
        transparent={true}
        visible={state.childModalVisible}
        onRequestClose={() =>
          setState((oldState) => ({
            ...oldState,
            childModalVisible: false,
          }))
        }
      >
        <TouchableWithoutFeedback
          onPress={() =>
            setState((oldState) => ({
              ...oldState,
              childModalVisible: false,
            }))
          }
        >
          <View style={[styles.styles1]}>
            <TouchableWithoutFeedback
              onPress={() =>
                setState((oldState) => ({
                  ...oldState,
                  childModalVisible: true,
                }))
              }
            >
              <View
                style={[
                  styles.containerstyle,
                  { height: state.childListData.length > 2 ? "70%" : "30%" },
                ]}
              >
                <View style={styles.modalViews}>
                  <FlatList
                    data={state.childListData}
                    renderItem={renderItem}
                    bounces={false}
                    style={{ marginTop: 20 }}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                  ></FlatList>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
        {state.isModalVisible && (
          <BallIndicator visible={state.isModalVisible} />
        )}
      </Modal>

      {/* eyeContact   */}
      <Modal
        animated={true}
        animationType="fade"
        transparent={true}
        visible={state.eyeContactModalVisible}
        onRequestClose={() =>
          setState((oldState) => ({
            ...oldState,
            eyeContactModalVisible: false,
          }))
        }
      >
        <TouchableWithoutFeedback
          onPress={() =>
            setState((oldState) => ({
              ...oldState,
              eyeContactModalVisible: false,
            }))
          }
        >
          <View style={[styles.EyesContainstyles]}>
            <TouchableWithoutFeedback
              onPress={() =>
                setState((oldState) => ({
                  ...oldState,
                  eyeContactModalVisible: true,
                }))
              }
            >
              <View style={[styles.EyesContaincontainerstyle]}>
                <View style={styles.EyesContainModalViews}>
                  <TouchableOpacity
                    style={{
                      width: 12,
                      height: 12,
                      alignSelf: "flex-end",
                      marginEnd: 7,
                      marginTop: 7,
                    }}
                    onPress={() =>
                      setState((oldState) => ({
                        ...oldState,
                        eyeContactModalVisible: false,
                      }))
                    }
                  >
                    <FastImage
                      source={importImages.crossIcon}
                      style={{ height: 19, width: 19 }}
                    ></FastImage>
                  </TouchableOpacity>
                  <FastImage
                    source={{ uri: state.getBabyMilstone.image }}
                    style={styles.EyesContainImageStyle}
                  ></FastImage>
                  <View
                    style={{
                      marginTop: 15,
                      justifyContent: "center",
                      alignItems: "center",
                      width: deviceWidth - 80,
                    }}
                  >
                    <View style={{}}>
                      <Text style={styles.motorTextStyle}>
                        {state.getBabyMilstone.name}
                      </Text>
                      <Text style={styles.lifeTextStyle}>
                        {state.getBabyMilstone.subtitle}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.whatTextStyle}>
                    {"What to look for:"}
                  </Text>
                  <Text style={styles.yourbabayTextStyle}>
                    {state.getBabyMilstone.description}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      marginTop: 30,
                      marginHorizontal: 70,
                    }}
                  >
                    <TouchableOpacity onPress={() => notYetbtnAction(0)}>
                      <View
                        style={{
                          width: 51,
                          height: 51,
                          borderRadius: 51 / 2,
                          backgroundColor: colors.Blue,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <FastImage
                          source={importImages.crossIcon}
                          style={{ width: 12, height: 12 }}
                          tintColor={colors.White}
                        ></FastImage>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => yesBtnAction(1)}>
                      <FastImage
                        source={importImages.yesicon}
                        style={{ width: 51, height: 51 }}
                      ></FastImage>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 4,
                      marginHorizontal: 65,
                      justifyContent: "space-around",
                    }}
                  >
                    <Text style={styles.notTextStyle}>{"Not yet"}</Text>
                    <Text style={styles.yesTextStyle}>{"Yes"}</Text>
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
        onRequestClose={() =>
          setState((oldState) => ({
            ...oldState,
            thatsOkModalVisible: false,
          }))
        }
      >
        <TouchableWithoutFeedback
          onPress={() =>
            setState((oldState) => ({
              ...oldState,
              thatsOkModalVisible: false,
            }))
          }
        >
          <View style={[styles.EyesContainstyles]}>
            <TouchableWithoutFeedback
              onPress={() =>
                setState((oldState) => ({
                  ...oldState,
                  eyeContactModalVisible: true,
                }))
              }
            >
              <View style={[styles.EyesContaincontainerstyle]}>
                <View style={styles.EyesContainModalViews}>
                  <TouchableOpacity
                    style={{
                      width: 12,
                      height: 12,
                      alignSelf: "flex-end",
                      marginEnd: 7,
                      marginTop: 7,
                    }}
                    onPress={() =>
                      setState((oldState) => ({
                        ...oldState,
                        thatsOkModalVisible: false,
                      }))
                    }
                  >
                    <FastImage
                      source={importImages.crossIcon}
                      style={{ height: 19, width: 19 }}
                    ></FastImage>
                  </TouchableOpacity>
                  <FastImage
                    source={importImages.okicon}
                    style={styles.EyesContainImageStyle}
                  ></FastImage>
                  <Text style={styles.thatOkTextStyle}>{"That’s Ok!"}</Text>
                  <Text style={styles.noWorriesTextStyle}>
                    {
                      "No worries, mama! Lots of babies take a little more time to complete this milestone."
                    }
                  </Text>
                  <TouchableOpacity
                    onPress={() => articalNevigation()}
                    style={styles.learnMoreButtonStyle}
                  >
                    <Text style={styles.learnTextStyle}>{"Learn More"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.exitButtonStyle}
                    onPress={() => {
                      const trackEventparam = { action: "Exit" };
                      trackEvent({ event: "Milestone_Popup", trackEventparam });
                      setState((oldState) => ({
                        ...oldState,
                        thatsOkModalVisible: false,
                      }));
                    }}
                  >
                    <Text style={styles.ExitTextStyle}>{"Exit"}</Text>
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
        onRequestClose={() =>
          setState((oldState) => ({
            ...oldState,
            perfectModalVisible: false,
          }))
        }
      >
        <TouchableWithoutFeedback
          onPress={() =>
            setState((oldState) => ({
              ...oldState,
              perfectModalVisible: false,
            }))
          }
        >
          <View style={[styles.EyesContainstyles]}>
            <TouchableWithoutFeedback
              onPress={() =>
                setState((oldState) => ({
                  ...oldState,
                  perfectModalVisible: true,
                }))
              }
            >
              <View style={[styles.EyesContaincontainerstyle]}>
                <TouchableOpacity
                  style={{ width: 12, height: 12, alignSelf: "flex-end" }}
                  onPress={() =>
                    setState((oldState) => ({
                      ...oldState,
                      perfectModalVisible: false,
                    }))
                  }
                >
                  <FastImage
                    source={importImages.crossIcon}
                    style={{ height: 19, width: 19 }}
                  ></FastImage>
                </TouchableOpacity>
                <View style={styles.perfectModalViews}>
                  <FastImage
                    source={importImages.perfecticon}
                    style={styles.perfectContainImageStyle}
                  ></FastImage>
                  <Text style={styles.perfectTextStyle}>{"Perfect"}</Text>
                  <Text style={styles.mamaTextStyle}>
                    {"Congratulations mama! Your baby is \n right on track."}
                  </Text>
                  <BottomButton
                    text={"Share"}
                    onPress={() => {
                      const trackEventparam = { action: "Share Image" };
                      trackEvent({ event: "Milestone_Popup", trackEventparam });
                      setState((oldState) => ({
                        ...oldState,
                        isImagePickerVisible: true,
                      }));
                    }}
                    container={{
                      marginBottom: 20,
                      alignSelf: "center",
                      marginTop: 20,
                    }}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
            <ImagePickerView
              visible={state.isImagePickerVisible}
              transparent={true}
              CloseModal={() =>
                setState((oldState) => ({
                  ...oldState,
                  isImagePickerVisible: false,
                }))
              }
              onGetURI={onGetURI}
            />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <ModalView
        visible={state.ischeckSomething}
        transparent={true}
        style={{ justifyContent: "flex-end" }}
        animationType={"slide"}
        containerstyle={{
          width: deviceWidth,
          backgroundColor: colors.lightPink,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          borderRadius: 0,
        }}
        close={() => {
          setState((oldState) => ({ ...oldState, ischeckSomething: false }));
        }}
        components={
          <View>
            <View style={{ width: deviceWidth - 50 }}>
              <Text
                style={{
                  fontFamily: fonts.rubikBold,
                  fontSize: 20,
                  color: "#323F4B",
                  textAlign: "center",
                }}
              >
                {}
              </Text>
              <TouchableWithoutFeedback
                onPress={() => {
                  setState((oldState) => ({
                    ...oldState,
                    ischeckSomething: false,
                  }));
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    position: "absolute",
                    right: 0,
                  }}
                >
                  <FastImage
                    source={importImages.crossIcon}
                    style={{ height: 19, width: 19 }}
                  ></FastImage>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <View style={{ marginTop: 20 }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  const trackEventparam = { action: "Was your baby born?" };
                  trackEvent({
                    event: "Something_has_changed",
                    trackEventparam,
                  });
                  setState((oldState) => ({
                    ...oldState,
                    ischeckSomething: false,
                  })),
                    navigation.navigate("EditChildProfileScreen", {
                      childData: state.selecteditem,
                      onBackRefresh: () => onBackRefresh(),
                      isbdate: true,
                    });
                }}
              >
                <View
                  style={[
                    {
                      marginTop: 15,
                      borderRadius: 10,
                      height: 65,
                      justifyContent: "center",
                      borderColor: "rgba(0, 0, 0, 0.2)",
                      borderWidth: 1,
                      alignItems: "center",
                      backgroundColor: colors.textinputBackground,
                    },
                  ]}
                >
                  <Text
                    style={{
                      marginStart: 20,
                      marginEnd: 20,
                      fontFamily: fonts.rubikBold,
                      fontSize: 15,
                      color: colors.Blue,
                    }}
                  >
                    {"Was your baby born?"}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <View style={{}}>
              <TouchableWithoutFeedback
                onPress={() => updateSomethingStatusApi()}
              >
                <View
                  style={[
                    {
                      marginTop: 15,
                      borderRadius: 10,
                      height: 65,
                      justifyContent: "center",
                      borderColor: "rgba(0, 0, 0, 0.2)",
                      borderWidth: 1,
                      marginBottom: 20,
                      alignItems: "center",
                      backgroundColor: colors.textinputBackground,
                    },
                  ]}
                >
                  <Text
                    style={{
                      marginStart: 20,
                      marginEnd: 20,
                      fontFamily: fonts.rubikBold,
                      fontSize: 15,
                      color: colors.Blue,
                    }}
                  >
                    {"Has your pregnancy ended?"}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        }
      />
      {state.isModalVisible && <BallIndicator visible={state.isModalVisible} />}
      {state.isSubscribe ? (
        <SubscriptionModalView
          style={{ height: "100%" }}
          BlurViewStyle={[{ width: deviceWidth, height: "100%" }]}
          containerstyle={[{ width: deviceWidth, height: "100%" }]}
          message={state.sub_message}
          title={state.sub_title}
          button_text={state.button_text}
          subScribeOnClick={() => {
            navigation.navigate("SubscriptionScreen");
          }}
          onClose={() => {
            setState((oldState) => ({
              ...oldState,
              isSubscribe: false,
            }));
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pink,
  },

  TextViewcontainer: {
    backgroundColor: colors.Purple,
    height: 180,
  },
  backImageStyle: {
    left: 15,
    position: "absolute",
  },
  imageiconStyle: {
    marginTop: 30,
  },

  textViewStyle: {
    flexDirection: "row",
    justifyContent: "center",
    width: deviceWidth / 2,
  },
  subtitleStyles: {
    color: colors.White,
    fontSize: 16,
    fontFamily: fonts.rubikRegular,
    textAlign: "center",
    marginTop: -5,
    textTransform: "capitalize",
  },
  ImportImageStyle: {
    height: 158,
    width: 158,
    borderRadius: 158 / 2,
  },
  Scrollcontainer: {
    marginTop: 88,
  },
  textbabyStyle: {
    fontFamily: fonts.rubikBold,
    fontSize: 20,
    color: colors.Black,
    marginTop: 10,
    alignSelf: "center",
  },
  titleStyle: {
    color: colors.White,
    fontSize: 30,
    fontFamily: fonts.rubikBold,
    alignSelf: "center",
  },

  buttonStyle: {
    marginTop: 10,
    paddingBottom: 30,
  },

  babyimageStyle: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
  },
  subtitleStyle: {
    color: colors.Blue,
    fontSize: 20,
    fontFamily: fonts.rubikSemiBold,
    color: colors.Blue,
    width: deviceWidth / 2,
  },
  modalView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: deviceWidth - 60,
    marginVertical: 10,
  },
  modalViews: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: deviceWidth - 60,
  },
  styles1: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: colors.transparent,
  },
  containerstyle: {
    alignItems: "center",
    width: deviceWidth,
    backgroundColor: colors.pinkShade,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  EyesContainstyles: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    alignSelf: "center",
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
    marginTop: 26,
  },
  yourbabayTextStyle: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: fonts.rubikRegular,
    color: colors.Black,
  },
  notTextStyle: {
    fontFamily: fonts.rubikRegular,
    fontSize: 14,
    color: colors.Blue,
  },
  yesTextStyle: {
    fontFamily: fonts.rubikRegular,
    fontSize: 14,
    color: colors.Blue,
    marginRight: 10,
  },
  thatOkTextStyle: {
    fontFamily: fonts.rubikBold,
    color: colors.Blue,
    fontSize: 20,
    alignSelf: "center",
    marginTop: 34,
  },
  noWorriesTextStyle: {
    fontFamily: fonts.rubikRegular,
    fontSize: 16,
    textAlign: "center",
    color: colors.Blue,
    marginTop: 10,
  },
  learnMoreButtonStyle: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.Blue,
    marginTop: 25,
  },
  learnTextStyle: {
    fontFamily: fonts.rubikBold,
    fontSize: 16,
    color: colors.White,
    alignSelf: "center",
    marginVertical: 15,
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
    alignSelf: "center",
    marginVertical: 15,
  },
  perfectModalViews: {
    justifyContent: "center",
    alignItems: "center",
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
    color: colors.Blue,
  },
  mamaTextStyle: {
    marginTop: 10,
    fontFamily: fonts.rubikRegular,
    fontSize: 16,
    textAlign: "center",
    color: colors.Blue,
  },

  iconimagestyle: {
    height: 55,
    width: 55,
    borderRadius: 55 / 2,
    alignSelf: "center",
  },
  nameTextStyle: {
    fontFamily: fonts.rubikRegular,
    fontSize: 16,
    textAlign: "center",
    alignSelf: "center",
    color: colors.Blue,
    width: 100,
  },
});

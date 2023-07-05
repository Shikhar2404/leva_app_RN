import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  TouchableWithoutFeedback,
} from "react-native";
import { colors } from "../../../utils/color";
import { ConstantsText, deviceWidth } from "../../../constants";
import { importImages } from "../../../utils/importImages";
import Header from "../../../components/Header";
import { fonts, stylesBackground } from "../../../utils/font";
import TextField from "../../../components/TextField";
import BottomButton from "../../../components/BottomButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import BallIndicator from "../../../components/BallIndicator";
import Request from "../../../api/Request";
import showSimpleAlert from "../../../utils/showSimpleAlert";
import CalenderModal from "../../../components/CalenderModal";
import moment from "moment";
import { Keyboard } from "react-native";
import { trackEvent } from "../../../utils/tracking";
import FastImage from "react-native-fast-image";
import SubscriptionModalView from "../../../components/SubscriptionModalView";
import apiConfigs from "../../../api/apiConfig";
import StorageService from "../../../utils/StorageService";
export default function AddGrowthScreen({ route, navigation }) {
  const [state, setState] = useState({
    typedata: "",
    notes: "",
    data: route.params.Data,
    isModalVisible: false,
    datepicker: false,
    child_id: route.params.child_id,
    type: route.params.type,
    pounds: "",
    gender: route.params.gender,
    age: route.params.age,
    start_date: "",

    isSubscribe: false,
    sub_message: "",
    sub_title: "",
    button_text: "",
  });
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
    });
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      goBackNav1
    );
    return () => {
      unsubscribe, backHandler.remove();
    };
  }, []);
  const goBackNav1 = () => {
    setState((oldState) => ({
      ...oldState,
      isSubscribe: false,
    }));
  };
  const getDate = (date) => {
    setState((oldState) => ({
      ...oldState,
      datepicker: false,
      start_date: date,
    }));
  };
  const Savetracking = async () => {
    if (state.typedata == "" && state.type != 1) {
      showSimpleAlert(
        state.type == 2
          ? ConstantsText.Pleaseenterheightgrowth
          : ConstantsText.Pleaseenterheadsizegrowth
      );
    } else if (
      state.pounds === "" &&
      state.typedata === "" &&
      state.type == 1
    ) {
      showSimpleAlert(ConstantsText.Pleaseenterweightgrowth);
    } else if (state.start_date == "") {
      showSimpleAlert(ConstantsText.Pleaseselectdate);
    } else {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: true,
      }));
      let param = {
        growth_id: "",
        child_id: state.child_id,
        date_time: state.start_date,
        inches: state.type == 2 ? state.typedata : "",
        ounces: state.type == 1 ? state.typedata : "",
        head_size: state.type == 3 ? state.typedata : "",
        lbs: state.type == 1 ? state.pounds : "",
        note: state.notes,
      };
      let response = await Request.post("child/store-child-growth", param);
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
            response.code == apiConfigs.USER_UNSUBSCRIBE
              ? response.message
              : "",
          isSubscribe:
            response.code == apiConfigs.USER_UNSUBSCRIBE ? true : false,
        }));
        if (response.code != apiConfigs.USER_UNSUBSCRIBE) {
          if (state.type == 1) {
            const trackEventparam = {
              Weight: state.pounds + "/" + state.typedata,
              Select_Date: state.start_date,
              Note: state.notes,
            };
            trackEvent({ event: "Add_Weight_Growth", trackEventparam });
          } else if (state.type == 2) {
            const trackEventparam = {
              Height: state.typedata,
              Select_Date: state.start_date,
              Note: state.notes,
            };
            trackEvent({ event: "Add_Height_Growth", trackEventparam });
          } else {
            const trackEventparam = {
              Head_Size: state.typedata,
              Select_Date: state.start_date,
              Note: state.notes,
            };
            trackEvent({ event: "Add_Head_Size_Growth", trackEventparam });
          }
          navigation.navigate("TotalGrowthScreen", { child_id: "" });
        }

        if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
          const trackEventparam = { action: "Paywall_AddGrowth_Screen" };
          trackEvent({ event: "Paywall_AddGrowth_Screen", trackEventparam });
        }
      } else {
        setState((oldState) => ({ ...oldState, isModalVisible: false }));
        if (response) {
          showSimpleAlert(response.message);
        }
      }
    }
  };

  const handleChangeOfText = (key, value) => {
    setState((oldState) => ({
      ...oldState,
      [key]: value,
    }));
  };

  return (
    <View style={stylesBackground.container}>
      <FastImage
        source={importImages.BackgroundAll}
        style={stylesBackground.backgroundimgcontainer}
        resizeMode={"stretch"}
      ></FastImage>
      <Header
        headerTitle={""}
        leftBtnOnPress={() => navigation.goBack()}
        titleStyle={{ color: colors.background }}
      />

      <View style={styles.container}>
        <View>
          <Text
            style={styles.titleStyle}
            adjustsFontSizeToFit={true}
            numberOfLines={1}
          >
            {state.type == 1
              ? "Add Weight Growth"
              : state.type == 2
              ? "Add Height Growth"
              : "Add Head Size Growth"}
          </Text>
        </View>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          keyboardOpeningTime={0}
          keyboardShouldPersistTaps={"handled"}
          bounces={true}
        >
          {state.type == 1 ? (
            <View
              style={{
                flexDirection: "row",
                width: deviceWidth - 34,
                marginTop: 30,
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", width: "50%" }}>
                <TextField
                  key={"pounds"}
                  textInputStyle={{ width: 70, textAlign: "center" }}
                  ref={null}
                  value={state.pounds}
                  placeholder={""}
                  isShowImg={false}
                  onChangeText={(text) => handleChangeOfText("pounds", text)}
                  blurOnSubmit={true}
                  lable={"weight"}
                  keyboardType={"decimal-pad"}
                  autoCapitalize={"none"}
                  returnKeyType={"done"}
                  innerContainerStyle={{ marginStart: 10, marginEnd: 10 }}
                  lableStyle={{
                    fontFamily: fonts.rubikBold,
                    color: colors.Blue,
                    fontSize: 16,
                  }}
                />
                <View
                  style={{
                    justifyContent: "center",
                    marginTop: 10,
                    marginStart: 5,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textLable,
                      fontSize: 16,
                      fontFamily: fonts.rubikRegular,
                      marginTop: 10,
                    }}
                  >
                    {"pounds"}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", width: "50%" }}>
                <TextField
                  key={"typedata"}
                  ref={null}
                  textInputStyle={{ width: 70, textAlign: "center" }}
                  value={state.typedata.trim()}
                  placeholder={""}
                  isShowImg={false}
                  onChangeText={(text) => handleChangeOfText("typedata", text)}
                  blurOnSubmit={true}
                  innerContainerStyle={{ marginStart: 10, marginEnd: 10 }}
                  keyboardType={"decimal-pad"}
                  autoCapitalize={"none"}
                  lable={" "}
                  returnKeyType={"done"}
                />
                <View
                  style={{
                    justifyContent: "center",
                    marginTop: 10,
                    marginStart: 5,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textLable,
                      fontSize: 16,
                      fontFamily: fonts.rubikRegular,
                    }}
                  >
                    {"ounces"}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                width: deviceWidth - 34,
                justifyContent: "space-between",
                marginTop: 30,
                alignItems: "center",
              }}
            >
              <View style={{ width: "57%" }}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    setState((oldState) => ({
                      ...oldState,
                      datepicker: true,
                    })),
                      Keyboard.dismiss();
                  }}
                >
                  <View>
                    <TextField
                      key={"typedata"}
                      textInputStyle={{
                        textAlign: "center",
                        width: "95%",
                        marginStart: 0,
                      }}
                      ref={null}
                      value={state.typedata.trim()}
                      placeholder={""}
                      maxLength={4}
                      isShowImg={false}
                      onChangeText={(text) =>
                        handleChangeOfText("typedata", text)
                      }
                      blurOnSubmit={true}
                      keyboardType={"decimal-pad"}
                      lable={
                        state.type == 1
                          ? "Weight"
                          : state.type == 2
                          ? "Height"
                          : "Head Size"
                      }
                      autoCapitalize={"none"}
                      returnKeyType={"done"}
                      lableStyle={{
                        fontFamily: fonts.rubikBold,
                        color: colors.Blue,
                        fontSize: 16,
                      }}
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>

              <View style={{ width: "38%" }}>
                <TextField
                  ref={null}
                  textInputStyle={{ textAlign: "center" }}
                  value={"Inches"}
                  placeholder={""}
                  isShowImg={false}
                  blurOnSubmit={true}
                  lable={" "}
                  editable={false}
                  type={"bdate"}
                  autoCapitalize={"none"}
                  lableStyle={{
                    fontFamily: fonts.rubikBold,
                    color: colors.Blue,
                    fontSize: 16,
                  }}
                />
              </View>
            </View>
          )}
          <TouchableWithoutFeedback
            onPress={() => {
              setState((oldState) => ({
                ...oldState,
                datepicker: true,
              })),
                Keyboard.dismiss();
            }}
          >
            <View>
              <TextField
                key={"start_date"}
                ref={null}
                value={
                  state.start_date != ""
                    ? moment(state.start_date, "").format("MM/DD/YYYY")
                    : ""
                }
                placeholder={"Select a date"}
                ImageSrc={importImages.clockIcons}
                isShowImg={true}
                onChangeText={(text) => handleChangeOfText("start_date", text)}
                blurOnSubmit={true}
                editable={false}
                lable={"Date"}
                type={"bdate"}
                autoCapitalize={"none"}
                returnKeyType={"done"}
                lableStyle={{
                  fontFamily: fonts.rubikBold,
                  color: colors.Blue,
                  fontSize: 16,
                }}
              />
            </View>
          </TouchableWithoutFeedback>

          <TextField
            key={"notes"}
            ref={null}
            value={state.notes}
            placeholder={"Tap to add note"}
            ImageSrc={importImages.noteIcons}
            isShowImg={true}
            onChangeText={(text) => handleChangeOfText("notes", text)}
            blurOnSubmit={true}
            lable={"Note"}
            autoCapitalize={"none"}
            returnKeyType={"done"}
            lableStyle={{
              fontFamily: fonts.rubikBold,
              color: colors.Blue,
              fontSize: 16,
            }}
          />
          <View style={{ height: 200 }}></View>
        </KeyboardAwareScrollView>
        <BottomButton
          text={"Save"}
          onPress={() => Savetracking()}
          container={{ position: "absolute", bottom: -10 }}
        />

        <CalenderModal
          visible={state.datepicker}
          transparent={true}
          // minDate={state.data ? new Date().setMonth(new Date().getMonth() - 2) : undefined}
          lable={"Growth Session"}
          valuesdate={
            state.start_date != ""
              ? state.start_date
              : moment(new Date()).format("YYYY-MM-DD")
          }
          getDate={(date) => getDate(date)}
          CloseModal={() =>
            setState((oldState) => ({
              ...oldState,
              datepicker: false,
            }))
          }
        />
      </View>

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
            setTimeout(() => {
              navigation.goBack();
            }, 10);
          }}
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: deviceWidth - 34,
    alignSelf: "center",
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
    opacity: 0.7,
  },
  mainHeadertext: {
    color: colors.Blue,
    fontSize: 16,
    fontFamily: fonts.rubikRegular,
    textTransform: "capitalize",
  },
});

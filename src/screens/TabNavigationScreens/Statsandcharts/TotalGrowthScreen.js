import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  BackHandler,
  ScrollView,
} from "react-native";
import { colors } from "../../../utils/color";
import { fonts, stylesBackground } from "../../../utils/font";
import { deviceHeight, deviceWidth } from "../../../constants";
import { importImages } from "../../../utils/importImages";
import Header from "../../../components/Header";
import BottomButton from "../../../components/BottomButton";
import showSimpleAlert from "../../../utils/showSimpleAlert";
import Request from "../../../api/Request";
import BallIndicator from "../../../components/BallIndicator";
import { LineChart } from "react-native-gifted-charts";
import StorageService from "../../../utils/StorageService";
import FastImage from "react-native-fast-image";
import SubscriptionModalView from "../../../components/SubscriptionModalView";
import apiConfigs from "../../../api/apiConfig";
import { trackEvent } from "../../../utils/tracking";
export default function TotalGrowthScreen({ route, navigation }) {
  const [state, setState] = useState({
    isModalVisible: false,
    istype: "",
    dataGraph: [],
    dataGraph1: [],
    dataGraph2: [],
    maxValue: 0,
    minValue: 0,
    child_id: route.params.child_id,
    image: "",
    name: "",
    age: "",
    gender: "",

    isSubscribe: false,
    sub_message: "",
    sub_title: "",
    button_text: "",
  });
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      graphDataApi();
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
  const graphDataApi = async () => {
    const id = await StorageService.getItem("child_id");

    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
      isShowDayText: state.isShowDayText,
      istype: state.istype,
      child_id: state.child_id != "" ? state.child_id : id,
    }));
    const param = { child_id: id, type: state.istype };
    let response = await Request.post("child/growth-chart-3", param);
    console.log("response=>", JSON.stringify(response));
    if (response.status === "SUCCESS") {
      state.dataGraph = [];
      state.dataGraph1 = [];
      state.dataGraph2 = [];
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
        image: response.data.length > 0 ? response.data[0].image : "",
        name: response.data.length > 0 ? response.data[0].name : "",
        dataGraph: response.data.length > 0 ? response.data[0].growth : [],
        dataGraph1: response.data.length > 0 ? response.data[0].approx_min : [],
        dataGraph2: response.data.length > 0 ? response.data[0].approx_max : [],
        minValue: response.data.length > 0 ? response.data[0].min : 0,
        maxValue: response.data.length > 0 ? response.data[0].max : 0,
        gender: response.data.length > 0 ? response.data[0].gender : "",
        age: response.data.length > 0 ? response.data[0].age : "",
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
      }));

      if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
        const trackEventparam = { action: "Paywall_Growth_Screen" };
        trackEvent({ event: "Paywall_Growth_Screen", trackEventparam });
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
  const Action_continue = () => {
    action_event("See Recent Growth Entries");
    navigation.navigate("RecentAllGrowthScreen", {
      child_id: state.child_id,
      onGoBack: undefined,
    });
  };
  const Action_Addcontinue = () => {
    action_event("Add Growth Update");
    navigation.navigate("ListGrowthSelectionScreen", {
      child_id: state.child_id,
      type: "add",
      gender: state.gender,
      age: state.age,
    });
  };
  const click_Weight = () => {
    action_event("Weight");
    state.istype = "";
    graphDataApi();
  };
  const click_Height = () => {
    action_event("Height");
    state.istype = "1";
    graphDataApi();
  };
  const click_Head = () => {
    action_event("Head Size");
    state.istype = "2";
    graphDataApi();
  };
  const action_event = (action) => {
    const trackEventparam = { action: action };
    trackEvent({ event: "Growth_Chart", trackEventparam });
  };
  return (
    <View style={stylesBackground.container}>
      <FastImage
        source={importImages.BackgroundAll}
        style={stylesBackground.backgroundimgcontainer}
        resizeMode={"stretch"}
      ></FastImage>
      <Header
        leftBtnOnPress={() => {
          action_event("Back"), navigation.goBack();
        }}
        titleStyle={{ color: colors.Blue }}
      />

      <View
        style={{
          width: deviceWidth - 34,
          alignItems: "center",
          alignSelf: "center",
        }}
      >
        <View style={{ width: "100%", alignItems: "flex-start" }}>
          <Text
            style={styles.mainHeadertext}
            adjustsFontSizeToFit={true}
            numberOfLines={1}
          >
            {"Growth Chart"}
          </Text>
        </View>
      </View>
      <View style={styles.container}>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 30 }}
        >
          <FastImage
            source={importImages.appicon}
            style={{ height: 60, width: 60, borderRadius: 60 / 2 }}
          >
            <FastImage
              source={{ uri: state.image }}
              style={{ height: 60, width: 60, borderRadius: 60 / 2 }}
            ></FastImage>
          </FastImage>
          <Text
            style={{
              color: colors.Blue,
              fontFamily: fonts.rubikSemiBold,
              fontSize: 20,
              marginStart: 10,
            }}
          >
            {state.name}
          </Text>
        </View>
        <View
          style={{
            width: deviceWidth - 34,
            height: 50,
            marginTop: 30,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableWithoutFeedback onPress={() => click_Weight()}>
            <View
              style={
                state.istype == ""
                  ? styles.activebtnStyle
                  : styles.inactivebtnStyle
              }
            >
              <Text
                style={
                  state.istype == "" ? styles.activeStyle : styles.inactiveStyle
                }
              >
                {"Weight"}
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => click_Height()}>
            <View
              style={
                state.istype == "1"
                  ? styles.activebtnStyle
                  : styles.inactivebtnStyle
              }
            >
              <Text
                style={
                  state.istype == "1"
                    ? styles.activeStyle
                    : styles.inactiveStyle
                }
              >
                {"Height"}
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => click_Head()}>
            <View
              style={
                state.istype == "2"
                  ? styles.activebtnStyle
                  : styles.inactivebtnStyle
              }
            >
              <Text
                style={
                  state.istype == "2"
                    ? styles.activeStyle
                    : styles.inactiveStyle
                }
              >
                {"Head Size"}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        {state.dataGraph.length > 0 ? (
          <View style={{ flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={true}
              style={{ flex: 1 }}
            >
              <View
                style={{
                  marginTop: 10,
                  alignItems: "center",
                  height: deviceHeight / 2.3,
                  marginBottom: 165,
                }}
              >
                <LineChart
                  curved
                  isAnimated
                  animationDuration={1200}
                  width={deviceWidth / 1.3}
                  data={state.dataGraph1}
                  data2={state.dataGraph2}
                  data3={state.dataGraph}
                  hideDataPoints
                  thickness={2}
                  thickness1={2}
                  thickness2={2}
                  color={colors.grayDark}
                  color2={colors.Darkpink}
                  color3={colors.Blue}
                  startFillColor={colors.pink}
                  endFillColor={colors.pink}
                  dashWidth={0}
                  initialSpacing={1}
                  yAxisLabelWidth={80}
                  yAxisLabelContainerStyle={{ width: 80 }}
                  yAxisTextStyle={{
                    color: colors.Blue,
                    fontSize: 10,
                    fontFamily: fonts.rubikBold,
                  }}
                  xAxisLabelTextStyle={{
                    color: colors.Blue,
                    fontSize: 9,
                    fontFamily: fonts.rubikBold,
                    textAlign: "center",
                  }}
                  labley={state.istype == "" ? " lbs" : " in"}
                  minValue={state.minValue}
                  maxValue={state.maxValue > 2 ? state.maxValue : 2}
                  xAxisIndicesColor={colors.Blue}
                  xAxisColor={colors.Blue}
                  yAxisIndicesColor={colors.Blue}
                  yAxisColor={colors.Blue}
                  key={"xyz"}
                />
                <View
                  style={{
                    width: deviceWidth - 34,
                    height: 50,
                    flexDirection: "row",
                    alignItems: "center",
                    marginStart: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.rubikSemiBold,
                      fontSize: 16,
                      color: colors.Blue,
                    }}
                  >
                    {"Percentile"}
                  </Text>

                  <View style={{ flexDirection: "row", marginStart: 21 }}>
                    <View
                      style={{
                        height: 33.33,
                        width: 33.33,
                        borderRadius: 33.33 / 2,
                        backgroundColor: colors.Darkpink,
                        marginEnd: 4,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.rubikRegular,
                          fontSize: 10,
                          color: colors.Blue,
                        }}
                      >
                        {"5th"}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", marginStart: 17 }}>
                    <View
                      style={{
                        height: 33.33,
                        width: 33.33,
                        borderRadius: 33.33 / 2,
                        backgroundColor: "#E9E9E9",
                        marginEnd: 4,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.rubikRegular,
                          fontSize: 10,
                          color: colors.Blue,
                        }}
                      >
                        {"95th"}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", marginStart: 17 }}>
                    <View
                      style={{
                        height: 33.33,
                        width: 33.33,
                        borderRadius: 33.33 / 2,
                        backgroundColor: colors.Blue,
                        marginEnd: 4,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.rubikRegular,
                          fontSize: 10,
                          color: colors.White,
                        }}
                      >
                        {"Baby"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              marginBottom: 90,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={stylesBackground.NodataStyle}>
              {state.isModalVisible ? "" : "No data found"}
            </Text>
          </View>
        )}
        <BottomButton
          text={"Add Growth Update"}
          onPress={() => Action_Addcontinue()}
          container={{
            position: "absolute",
            bottom: 50,
            backgroundColor: colors.textinputBackground,
            borderWidth: 1,
            borderColor: colors.Blue,
          }}
          textstyle={{ color: colors.Blue }}
        />

        <BottomButton
          text={"See recent growth entries"}
          onPress={() => Action_continue()}
          container={{ position: "absolute", bottom: -20 }}
        />
      </View>
      {state.isModalVisible && (
        <BallIndicator visible={state.isModalVisible}></BallIndicator>
      )}
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
    width: deviceWidth - 34,
    alignSelf: "center",
  },

  mainHeadertext: {
    color: colors.Blue,
    fontSize: 30,
    fontFamily: fonts.rubikBold,
    textTransform: "capitalize",
    width: deviceWidth - 34,
  },
  activeStyle: {
    fontSize: 16,
    color: colors.White,
    fontFamily: fonts.rubikMedium,
  },
  inactiveStyle: {
    fontSize: 16,
    color: colors.Blue,
    fontFamily: fonts.rubikMedium,
  },
  NodataStyle: {
    color: colors.Blue,
    fontSize: 20,
    fontFamily: fonts.rubikMedium,
  },
  activebtnStyle: {
    backgroundColor: colors.Blue,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
  },
  inactivebtnStyle: {
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.Blue,
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
  },
});

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
import { BarChart } from "react-native-gifted-charts";
import FastImage from "react-native-fast-image";
import SubscriptionModalView from "../../../components/SubscriptionModalView";
import apiConfigs from "../../../api/apiConfig";
import { trackEvent } from "../../../utils/tracking";
export default function TotalNursingScreen({ route, navigation }) {
  const [state, setState] = useState({
    isModalVisible: false,
    isShowDay: false,
    isShowDayText: true,
    istype: "1",
    dataGraph: [],
    maxValue: 0,
    minValue: 0,
    is_data_available: false,

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
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
      isShowDayText: state.isShowDayText,
      istype: state.istype,
    }));
    const param = {
      type: state.istype,
      sort_by: state.isShowDayText ? "1" : "2",
    };
    let response = await Request.post("nursing/graph", param);
    if (response.status === "SUCCESS") {
      state.dataGraph = [];
      if (response.data.length > 0) {
        const data = response.data[0].X;
        data.map((item) => {
          const obj =
            item.total_hours != 0
              ? {
                  value: item.total_hours,
                  label: item.title,
                  topLabelComponent: () => (
                    <Text
                      style={{
                        color: colors.Blue,
                        fontSize: 10,
                        fontFamily: fonts.rubikBold,
                        marginBottom: 10,
                        width: 32,
                        textAlign: "center",
                      }}
                    >
                      {item.total_hours}
                    </Text>
                  ),
                }
              : { value: item.total_hours, label: item.title };
          state.dataGraph.push(obj);
        });
      }
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
        dataGraph: state.dataGraph,
        minValue: response.data.length > 0 ? response.data[0].min : 0,
        maxValue: response.data.length > 0 ? response.data[0].max : 0,
        is_data_available: response.data[0].is_data_available,
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
        const trackEventparam = { action: "Paywall_TotalNursing_Screen" };
        trackEvent({ event: "Paywall_TotalNursing_Screen", trackEventparam });
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
  const action_event = (action) => {
    const trackEventparam = { action: action };
    trackEvent({ event: "Total_Nursed", trackEventparam });
  };
  const Action_continue = () => {
    action_event("See All Recent Nursing Sessions");
    navigation.navigate("RecentAllNursingScreen", { from: "recent" });
  };
  const click_total = () => {
    action_event("Total");
    state.istype = "1";
    graphDataApi();
  };
  const click_count = () => {
    action_event("Count");
    state.istype = "2";
    graphDataApi();
  };
  const click_avg = () => {
    action_event("Avg Time");
    state.istype = "3";
    graphDataApi();
  };
  const click_day = () => {
    action_event(state.isShowDayText ? "Day" : "Week");
    setState((oldState) => ({ ...oldState, isShowDay: !state.isShowDay }));
  };
  const click_weeek = () => {
    state.isShowDayText = !state.isShowDayText;
    setState((oldState) => ({
      ...oldState,
      isShowDayText: state.isShowDayText,
      isShowDay: !state.isShowDay,
    }));
    graphDataApi();
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
        <View
          style={{
            width: "100%",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View style={{ height: 45, justifyContent: "center" }}>
            <Text
              style={styles.mainHeadertext}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              {"Total Nursed"}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: colors.Darkpink,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10,
              width: state.isShowDay ? 105 : 95,
            }}
          >
            <TouchableWithoutFeedback onPress={() => click_day()}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 45,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.Blue,
                    fontFamily: fonts.rubikRegular,
                    marginStart: 10,
                  }}
                >
                  {state.isShowDayText ? "Day" : "Week"}
                </Text>
                <FastImage
                  source={importImages.downarrowIcon}
                  style={{
                    height: 25,
                    width: 25,
                    marginStart: 14,
                    marginEnd: 10,
                  }}
                ></FastImage>
              </View>
            </TouchableWithoutFeedback>

            {state.isShowDay ? (
              <TouchableWithoutFeedback onPress={() => click_weeek()}>
                <View
                  style={{
                    backgroundColor: colors.Darkpink,
                    borderBottomRightRadius: 10,
                    borderBottomLeftRadius: 10,
                    alignItems: "flex-start",
                    justifyContent: "center",
                    height: 45,
                    width: state.isShowDay ? 105 : 95,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.Blue,
                      borderTopWidth: state.isShowDay ? 0.5 : 0,
                      height: 0.5,
                      position: "absolute",
                      top: 0,
                      marginStart: 10,
                      marginEnd: 10,
                      width: 75,
                    }}
                  ></View>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.Blue,
                      fontFamily: fonts.rubikRegular,
                      marginStart: 10,
                    }}
                  >
                    {state.isShowDayText ? "Week" : "Day"}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.container}>
        {state.dataGraph.length > 0 ? (
          <View>
            <View
              style={{
                width: deviceWidth - 34,
                borderBottomWidth: 1,
                borderTopWidth: 1,
                borderColor: "rgba(34, 50, 99, 1)",
                height: 50,
                marginTop: state.isShowDay ? 3 : 48,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableWithoutFeedback onPress={() => click_total()}>
                <View>
                  <Text
                    style={
                      state.istype == "1"
                        ? styles.activeStyle
                        : styles.inactiveStyle
                    }
                  >
                    {"Total"}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => click_count()}>
                <View style={{ marginStart: 31 }}>
                  <Text
                    style={
                      state.istype == "2"
                        ? styles.activeStyle
                        : styles.inactiveStyle
                    }
                  >
                    {"Count"}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => click_avg()}>
                <View style={{ marginStart: 31 }}>
                  <Text
                    style={
                      state.istype == "3"
                        ? styles.activeStyle
                        : styles.inactiveStyle
                    }
                  >
                    {"Avg Time"}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={true}
              style={{}}
            >
              <View
                style={{
                  marginTop: 10,
                  alignItems: "center",
                  height: deviceHeight / 1.5,
                  marginBottom: 120,
                }}
              >
                <BarChart
                  width={deviceWidth - 70}
                  height={deviceHeight / 2.3}
                  isAnimated
                  initialSpacing={4}
                  barWidth={28}
                  dashWidth={0}
                  data={state.dataGraph.reverse()}
                  yAxisLabelWidth={state.istype == "3" ? 60 : 40}
                  yAxisTextStyle={{
                    color: colors.Blue,
                    fontSize: 10,
                    fontFamily: fonts.rubikBold,
                  }}
                  xAxisLabelTextStyle={{
                    color: colors.Blue,
                    fontSize: 9,
                    fontFamily: fonts.rubikMedium,
                    textAlign: "center",
                    marginStart: 2,
                    height: 25,
                    marginTop: 10,
                  }}
                  barBorderRadius={0}
                  xAxisTextNumberOfLines={2}
                  spacing={10}
                  minValue={state.minValue}
                  maxValue={state.maxValue > 2 ? state.maxValue : 2}
                  yAxisLabelSuffix={
                    state.istype == "1"
                      ? " hr"
                      : state.istype == "3"
                      ? " min"
                      : ""
                  }
                  frontColor={colors.Darkpink}
                  xAxisIndicesColor={colors.Blue}
                  xAxisColor={colors.Blue}
                  showYAxisIndices={true}
                  yAxisIndicesColor={colors.Blue}
                  yAxisColor={colors.Blue}
                  key={"xyz"}
                  disablePress={true}
                  scrollToEnd={true}
                />
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
              {state.isModalVisible
                ? ""
                : state.is_data_available
                ? "You don’t see anything here yet! Go to the homescreen and record your session!"
                : "You don’t see anything here yet! Go to the homescreen and record your first session!"}
            </Text>
          </View>
        )}
        <BottomButton
          text={"See all recent nursing sessions"}
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
    width: deviceWidth - 150,
  },
  activeStyle: {
    fontSize: 16,
    color: colors.Blue,
    fontFamily: fonts.rubikMedium,
  },
  inactiveStyle: {
    fontSize: 16,
    color: colors.Blue,
    fontFamily: fonts.rubikMedium,
    opacity: 0.5,
  },
  NodataStyle: {
    color: colors.Blue,
    fontSize: 20,
    fontFamily: fonts.rubikMedium,
  },
});

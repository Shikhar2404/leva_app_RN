import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, BackHandler } from "react-native";
import { colors } from "../../../utils/color";
import { fonts, stylesBackground } from "../../../utils/font";
import { deviceHeight, deviceWidth } from "../../../constants";
import Header from "../../../components/Header";
import BallIndicator from "../../../components/BallIndicator";
import Request from "../../../api/Request";
import showSimpleAlert from "../../../utils/showSimpleAlert";
import YouTubePlayer from "react-native-youtube-sdk";
import { Vimeo } from "react-native-vimeo-iframe";
import { trackEvent } from "../../../utils/tracking";
import SubscriptionModalView from "../../../components/SubscriptionModalView";
import apiConfigs from "../../../api/apiConfig";
import StorageService from "../../../utils/StorageService";
import AppPlayer from "../../../utils/AppPlayer";
export default function VideoDetailesScreen({ route, navigation }) {
  const [state, setState] = useState({
    isModalVisible: false,
    videoDetails: {},
    refSlider: useRef(),
    refVideo: useRef(),

    youTubePlayer: useRef(),
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
    videoDetailsList();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      goBackNav1
    );
    return () => {
      unsubscribe, backHandler.remove();
    };
  }, []);
  const videoDetailsList = async () => {
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
    }));
    let params = {
      video_id: route.params.id,
    };
    let response = await Request.post("video/detail", params);
    if (response.status === "SUCCESS") {
      setState((oldState) => ({
        ...oldState,
        videoDetails: response.data,
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
      }));

      if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
        const trackEventparam = { action: "Paywall_Video_Screen" };
        trackEvent({ event: "Paywall_Video_Screen", trackEventparam });
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

  const goBackNav1 = () => {
    setState((oldState) => ({
      ...oldState,
      isSubscribe: false,
    }));
  };
  const goBackNav = () => {
    setState((oldState) => ({
      ...oldState,
      isSubscribe: false,
    }));
    setTimeout(async () => {
      if (state.videoDetails.type == 1) {
        const currentTime = await state.youTubePlayer.current.getCurrentTime();
        const trackEventparam = {
          name: state.videoDetails.name,
          Time_in_Video: AppPlayer.secondsToHHMMSS(currentTime),
        };
        trackEvent({ event: "Video", trackEventparam });
        navigation.goBack();
      } else {
        navigation.goBack();
      }
    }, 10);
  };
  const videoCallbacks = {
    timeupdate: (data) => console.log("timeupdate: ", data),
    play: (data) => console.log("play: ", data),
    pause: (data) => console.log("pause: ", data),
    fullscreenchange: (data) => console.log("fullscreenchange: ", data),
    ended: (data) => console.log("ended: ", data),
    controlschange: (data) => console.log("controlschange: ", data),
    loadeddata: (data) => console.log("loadeddata: ", data),
  };
  return (
    <View
      style={[
        stylesBackground.container,
        { backgroundColor: state.videoDetails ? colors.Black : colors.pink },
      ]}
    >
      {state.videoDetails &&
      Object.keys(state.videoDetails).length === 0 &&
      Object.getPrototypeOf(state.videoDetails) === Object.prototype ? null : (
        <View style={{ width: "100%", height: "100%" }}>
          <Header
            leftBtnOnPress={() => {
              goBackNav();
            }}
            safeAreaView={{ backgroundColor: colors.Black }}
            tintColor={true}
          />
          {state.videoDetails.type == 2 ? (
            <Vimeo
              videoId={state.videoDetails.video}
              params={
                state.isSubscribe
                  ? "api=1&autoplay=1&transparent=0"
                  : "api=1&autoplay=0&transparent=0"
              }
              handlers={videoCallbacks}
            />
          ) : (
            <YouTubePlayer
              ref={state.youTubePlayer}
              videoId={state.videoDetails.video}
              autoPlay={state.isSubscribe ? false : true}
              fullscreen={false}
              showFullScreenButton={true}
              showSeekBar={true}
              showPlayPauseButton={true}
              style={{ width: "100%", height: deviceHeight - 80 }}
              onError={(e) => console.log(e)}
              onChangeState={(e) => console.log("onChangeState", e.state)}
              onChangeFullscreen={(e) => console.log(e)}
            />
          )}
        </View>
      )}
      {state.isModalVisible && (
        <BallIndicator visible={state.isModalVisible}></BallIndicator>
      )}
      {state.isSubscribe ? (
        <SubscriptionModalView
          style={{
            height: "100%",
            backgroundColor: colors.White,
            opacity: 0.7,
          }}
          BlurViewStyle={[{ width: deviceWidth, height: "100%" }]}
          containerstyle={[{ width: deviceWidth, height: "100%" }]}
          message={state.sub_message}
          title={state.sub_title}
          button_text={state.button_text}
          subScribeOnClick={() => {
            navigation.navigate("SubscriptionScreen");
          }}
          onClose={() => {
            goBackNav();
          }}
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },

  mainHeader: {
    color: colors.Blue,
    fontSize: 28,
    fontFamily: fonts.rubikBold,
    marginLeft: 25,
    textTransform: "capitalize",
  },

  imageStyle: {
    height: 260,
    borderRadius: 20,
    marginTop: 50,
    width: 260,
  },

  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  viewStyle: {
    marginTop: 16,
  },
  mediaPlayer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "black",
    justifyContent: "center",
  },
});

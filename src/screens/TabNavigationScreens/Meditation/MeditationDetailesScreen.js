import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  BackHandler,
} from "react-native";
import { colors } from "../../../utils/color";
import { fonts, stylesBackground } from "../../../utils/font";
import { deviceWidth } from "../../../constants";
import { importImages } from "../../../utils/importImages";
import Header from "../../../components/Header";
import BallIndicator from "../../../components/BallIndicator";
import Request from "../../../api/Request";
import TrackPlayer, {
  Event,
  RepeatMode,
  State,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { Slider } from "@sharcoux/slider";
import AppPlayer from "../../../utils/AppPlayer";
import showSimpleAlert from "../../../utils/showSimpleAlert";
import { trackEvent } from "../../../utils/tracking";
import FastImage from "react-native-fast-image";
import SubscriptionModalView from "../../../components/SubscriptionModalView";
import apiConfigs from "../../../api/apiConfig";
import StorageService from "../../../utils/StorageService";
export default function MeditationDetailesScreen({ route, navigation }) {
  const { position, buffered, duration } = useProgress();
  const [state, setState] = useState({
    isModalVisible: false,
    meditationDetails: {},
    isPlaying: false,
    refSlider: useRef(),
    getAllData: [...route.params.meditationsData],
    getAllMainData: [],
    mainIndex: route.params.index,
    isshuffled: false,
    isRepeat: false,
    shuffledindex: 0,

    isSubscribe: false,
    sub_message: "",
    sub_title: "",
    button_text: "",
    click_Like: false,
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
      if (route.params.isNotification) {
        await MeditationApi();
      }
    });
    if (state.getAllData.length > 0) {
      meditationList();
    }
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
  const MeditationApi = async () => {
    let params = {
      page_no: 1,
      limit: 0,
      type: "1",
      search: "",
    };
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
    }));
    let response = await Request.post("meditation/list", params);
    if (response.status === "SUCCESS") {
      state.getAllData = response.data.meditations;
      state.mainIndex = response.data.meditations.findIndex(
        (item, index) => item.meditation_id == route.params.isNotification
      );
      setState((oldState) => ({
        ...oldState,
        getAllData: state.getAllData,
        mainIndex: state.mainIndex,
      }));
      await meditationList();
    } else {
      if (response) {
        showSimpleAlert(response.message);
      }
    }
  };
  const meditationList = async () => {
    await AppPlayer.initializePlayer();
    let index = await TrackPlayer.getCurrentTrack();
    if (index == state.mainIndex) {
      var data = await TrackPlayer.getTrack(index);
      const status = await TrackPlayer.getState();
      setState((oldState) => ({
        ...oldState,
        meditationDetails: data,
        isPlaying: status === State.Playing,
        isModalVisible: false,
      }));
      await MeditationsDetailsApi(data);
    } else {
      await resetTrack();
      await setAudioInPlayer(state.getAllData);
      await TrackPlayer.skip(state.mainIndex);
      await TrackPlayer.play();
      var trackdata = await TrackPlayer.getTrack(state.mainIndex);
      setState((oldState) => ({
        ...oldState,
        meditationDetails: trackdata,
        isPlaying: true,
        isModalVisible: false,
      }));
      await MeditationsDetailsApi(trackdata);
    }
  };
  const setAudioInPlayer = async (data) => {
    for (let index = 0; index < data.length; index++) {
      const trackPlayerAsset = {
        id: data[index].meditation_id,
        url: data[index].audio,
        title: data[index].name,
        description: data[index].isLike.toString(),
        artist: "Leva",
        artwork: data[index].image,
      };
      await TrackPlayer.add(trackPlayerAsset);
    }
  };
  const meditationFavApi = async () => {
    var indexformeditation = await TrackPlayer.getCurrentTrack();
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
      click_Like: true,
    }));
    let params = {
      meditation_id: state.getAllData[indexformeditation].meditation_id,
    };
    let response = await Request.post("user/like-unlike-meditation", params);
    if (response.status === "SUCCESS") {
      if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
        TrackPlayer.pause();
        setState((oldState) => ({
          ...oldState,
          isModalVisible: false,
          sub_title: response.title,
          sub_message: response.message,
          button_text: response.button_text,
          isSubscribe: true,
          isPlaying: false,
        }));

        const trackEventparam = {
          action: "Paywall_Meditation_Screen_Favorite",
        };
        trackEvent({
          event: "Paywall_Meditation_Screen_Favorite",
          trackEventparam,
        });
      } else {
        const trackEventparam = {
          name: state.getAllData[indexformeditation].name,
          Like: response.data.isLike,
        };
        trackEvent({ event: "Favorite_Meditation", trackEventparam });
        const obj = {
          id: state.getAllData[indexformeditation].meditation_id,
          url: state.getAllData[indexformeditation].audio,
          title: state.getAllData[indexformeditation].name,
          artist: "Leva",
          description: response.data.isLike.toString(),
          artwork: state.getAllData[indexformeditation].image,
        };
        await TrackPlayer.updateMetadataForTrack(indexformeditation, obj);
        setState((oldState) => ({
          ...oldState,
          meditationDetails: obj,
          isModalVisible: false,
        }));
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
  const onPlayPausePress = async () => {
    if (state.isPlaying) {
      TrackPlayer.pause();
      setState((oldState) => ({
        ...oldState,
        isPlaying: false,
      }));
    } else {
      TrackPlayer.play();
      setState((oldState) => ({
        ...oldState,
        isPlaying: true,
      }));
    }
  };
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      if (state.isPlaying) {
        if (state.isshuffled) {
          await callisshuffled();
        } else {
          var index = await TrackPlayer.getCurrentTrack();
          const data = await TrackPlayer.getTrack(index);
          setState((oldState) => ({
            ...oldState,
            isPlaying: true,
            meditationDetails: data,
          }));
          await MeditationsDetailsApi(data);
        }
      }
    }
  });

  const callisshuffled = async () => {
    await TrackPlayer.pause();
    var inddata = state.getAllMainData[state.shuffledindex];
    var indmain = state.getAllData.findIndex(
      (data) => data.meditation_id === inddata.meditation_id
    );
    await TrackPlayer.skip(indmain);
    await TrackPlayer.seekTo(0);
    await TrackPlayer.play();
    var index = await TrackPlayer.getCurrentTrack();
    const data = await TrackPlayer.getTrack(index);
    setState((oldState) => ({
      ...oldState,
      isPlaying: true,
      meditationDetails: data,
      shuffledindex:
        state.getAllMainData.length - 1 == state.shuffledindex
          ? 0
          : state.shuffledindex + 1,
    }));
    await MeditationsDetailsApi(data);
  };
  useTrackPlayerEvents([Event.PlaybackQueueEnded], async (event) => {
    if (event.type === Event.PlaybackQueueEnded) {
      if (state.isPlaying) {
        if (!state.isRepeat) {
          var index = await TrackPlayer.getCurrentTrack();
          await TrackPlayer.skip(index);
          await TrackPlayer.pause();
          await TrackPlayer.seekTo(0);
          if (index == state.getAllData.length - 1) {
            setState((oldState) => ({
              ...oldState,
              isPlaying: false,
            }));
          }
        }
      }
    }
  });
  const NextPlay = async () => {
    TrackPlayer.skipToNext();
    TrackPlayer.play();
    var currentindex = await TrackPlayer.getCurrentTrack();
    var data = await TrackPlayer.getTrack(currentindex);
    setState((oldState) => ({
      ...oldState,
      meditationDetails: data,
      isPlaying: true,
    }));
    await MeditationsDetailsApi(data);
  };
  const MeditationsDetailsApi = async (data) => {
    const trackEventparam = { name: data.title, Time_in_Meditiation: "" };
    trackEvent({ event: "Meditation", trackEventparam });
    let params = {
      meditation_id: data.id,
    };
    let response = await Request.post("meditation/detail", params);
    if (response.status === "SUCCESS") {
      if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
        TrackPlayer.pause();
        setState((oldState) => ({
          ...oldState,
          isPlaying: false,
          sub_title: response.title,
          sub_message: response.message,
          button_text: response.button_text,
          isSubscribe: true,
        }));

        const trackEventparam = { action: "Paywall_Meditation_Screen" };
        trackEvent({ event: "Paywall_Meditation_Screen", trackEventparam });
      } else {
        setState((oldState) => ({
          ...oldState,
          isPlaying: true,
        }));
      }
    } else {
      if (response) {
        showSimpleAlert(response.message);
      }
    }
  };
  const PreviousPlay = async () => {
    TrackPlayer.skipToPrevious();
    TrackPlayer.play();
    var currentindex = await TrackPlayer.getCurrentTrack();
    var data = await TrackPlayer.getTrack(currentindex);
    setState((oldState) => ({
      ...oldState,
      meditationDetails: data,
      isPlaying: true,
    }));
    await MeditationsDetailsApi(data);
  };
  const RepeatPlay = async (isRepeat) => {
    if (isRepeat) {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
    } else {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
    }
    setState((oldState) => ({
      ...oldState,
      isRepeat: isRepeat,
    }));
  };
  const shuffleArray = async (array) => {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };

  const shufflePlay = async (isshuffle) => {
    var array = [];
    if (isshuffle) {
      const data = [...state.getAllData];
      array = await shuffleArray(data);
    }
    setState((oldState) => ({
      ...oldState,
      isshuffled: isshuffle,
      getAllMainData: array.length > 0 ? array : [...state.getAllData],
    }));
  };
  const resetTrack = async () => {
    try {
      await TrackPlayer.reset();
    } catch (error) {}
  };
  const goBackNav = async () => {
    setState((oldState) => ({
      ...oldState,
      isSubscribe: false,
    }));
    setTimeout(async () => {
      const trackEventparam = {
        name: state.meditationDetails.title,
        Time_in_Meditiation: AppPlayer.secondsToHHMMSS(position),
      };
      trackEvent({ event: "Meditation", trackEventparam });
      navigation.goBack();
    }, 10);
  };

  return (
    <View style={stylesBackground.container}>
      <FastImage
        source={importImages.BackgroundAll}
        style={stylesBackground.backgroundimgcontainer}
        resizeMode={"stretch"}
      ></FastImage>
      {state.meditationDetails &&
      Object.keys(state.meditationDetails).length === 0 &&
      Object.getPrototypeOf(state.meditationDetails) ===
        Object.prototype ? null : (
        <View style={{ width: "100%", height: "100%" }}>
          <Header
            leftBtnOnPress={() => goBackNav()}
            rightBtn={
              <FastImage
                source={
                  state.meditationDetails.description == "true"
                    ? importImages.heartIcon
                    : importImages.likeIcon
                }
                style={{ width: 40, height: 40 }}
              ></FastImage>
            }
            rightBtnOnPress={() => meditationFavApi()}
          />
          <Text style={styles.mainHeader}>{"Meditation"}</Text>

          <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <View style={{ alignItems: "center", width: deviceWidth - 50 }}>
                <FastImage
                  style={styles.imageStyle}
                  source={{ uri: state.meditationDetails.artwork }}
                ></FastImage>
                <View style={{ height: 102 }}>
                  <Text
                    style={{
                      fontFamily: fonts.rubikBold,
                      fontSize: 20,
                      color: colors.Blue,
                      textAlign: "center",
                      marginTop: 15,
                    }}
                  >
                    {state.meditationDetails.title}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: deviceWidth - 80,
                  }}
                >
                  <Slider
                    value={position} // set the current slider's value
                    minimumValue={0} // Minimum value
                    maximumValue={duration} // Maximum value
                    step={0} // The step for the slider (0 means that the slider will handle any decimal value within the range [min, max])
                    minimumTrackTintColor={colors.Blue} // The track color before the current value
                    maximumTrackTintColor={colors.backgray} // The track color after the current value
                    thumbTintColor={colors.Blue} // The color of the slider's thumb
                    thumbStyle={undefined} // Override the thumb's style
                    trackStyle={undefined} // Override the tracks' style
                    enabled={true} // If false, the slider won't respond to touches anymore
                    trackHeight={4} // The track's height in pixel
                    thumbSize={8} // The thumb's size in pixel
                    slideOnTap={true} // If true, touching the slider will update it's value. No need to slide the thumb.
                    onValueChange={(progress) => {
                      TrackPlayer.seekTo(progress);
                    }} // Called each time the value changed. The type is (value: number) => void
                    onSlidingStart={(progress) => {
                      TrackPlayer.seekTo(progress);
                    }} // Called when the slider is pressed. The type is (value: number) => void
                    onSlidingComplete={(progress) => {
                      TrackPlayer.seekTo(progress);
                    }} // Called when the press is released. The type is (value: number) => void
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: deviceWidth - 80,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: fonts.rubikRegular,
                      color: colors.Blue,
                    }}
                  >
                    {AppPlayer.secondsToHHMMSS(position)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: fonts.rubikRegular,
                      color: colors.Blue,
                    }}
                  >
                    {AppPlayer.secondsToHHMMSS(duration)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: deviceWidth - 80,
                    alignItems: "center",
                    marginTop: 25,
                    marginBottom: 40,
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() => shufflePlay(!state.isshuffled)}
                  >
                    <View style={{ alignItems: "center" }}>
                      <FastImage
                        source={importImages.mshuffleicon}
                        style={{ height: 24, width: 24 }}
                      ></FastImage>
                      {state.isshuffled ? (
                        <View
                          style={{
                            backgroundColor: colors.Blue,
                            height: 5,
                            width: 5,
                            borderRadius: 5 / 2,
                            marginTop: 1,
                          }}
                        ></View>
                      ) : null}
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={() => PreviousPlay()}>
                    <View>
                      <FastImage
                        source={importImages.mpreviousicon}
                        style={{ height: 24, width: 24 }}
                      ></FastImage>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={() => onPlayPausePress()}>
                    <View>
                      <FastImage
                        source={
                          state.isPlaying
                            ? importImages.mstopicon
                            : importImages.mplayicon
                        }
                        style={{ height: 50, width: 50 }}
                      ></FastImage>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={() => NextPlay()}>
                    <View>
                      <FastImage
                        source={importImages.mnexticon}
                        style={{ height: 24, width: 24 }}
                      ></FastImage>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback
                    onPress={() => RepeatPlay(!state.isRepeat)}
                  >
                    <View style={{ alignItems: "center" }}>
                      <FastImage
                        source={importImages.mrepeaticon}
                        style={{ height: 24, width: 24 }}
                      ></FastImage>
                      {state.isRepeat ? (
                        <View
                          style={{
                            backgroundColor: colors.Blue,
                            height: 5,
                            width: 5,
                            borderRadius: 5 / 2,
                            marginTop: 1,
                          }}
                        ></View>
                      ) : null}
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
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
            state.click_Like
              ? setState((oldState) => ({
                  ...oldState,
                  click_Like: false,
                  isSubscribe: false,
                }))
              : goBackNav();
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

  viewStyle: {
    marginTop: 16,
  },
});

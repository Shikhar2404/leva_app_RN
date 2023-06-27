import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../../utils/color";
import { fonts, stylesBackground } from "../../../utils/font";
import { importImages } from "../../../utils/importImages";
import Header from "../../../components/Header";
import Request from "../../../api/Request";
import BallIndicator from "../../../components/BallIndicator";
import { deviceWidth } from "../../../constants";
import JSFunctionUtils from "../../../utils/JSFunctionUtils";
import { useNavigation } from "@react-navigation/native";
import StorageService from "../../../utils/StorageService";
import showSimpleAlert from "../../../utils/showSimpleAlert";
import FastImage from "react-native-fast-image";
import TextField from "../../../components/TextField";
import axios from "axios";
import apiConfigs from "../../../api/apiConfig";
var searchFlag = false;
import * as RNLocalize from "react-native-localize";
import { Platform } from "react-native";
import { trackEvent } from "../../../utils/tracking";
let cancelToken;
export default function VideoScreen({ route, navigation }) {
  const navigations = useNavigation();
  const [state, setState] = useState({
    videoList: [],
    isModalVisible: false,
    isModalFooterVisible: false,
    pagenumber: 1,
    LastRecored: 0,
    isRefresh: false,
    refSearch: useRef(),
    searchTxt: "",
  });
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getData();
    });
    return unsubscribe;
  }, []);
  const getData = async () => {
    state.refSearch.current.clear();
    state.videoList = [];
    state.pagenumber = 1;
    state.LastRecored = 0;
    state.searchTxt = "";

    videoApi(true);
  };
  const click_video = (index, item) => {
    // const trackEventparam = { action: item.name };
    // trackEvent({ event: trackEventparam.action, trackEventparam });

    navigation.navigate("VideoDetailesScreen", { id: item.video_id });
  };
  /**Get the device token */
  const getDeviceToken = async () => {
    const deviceToken = await StorageService.getItem(
      StorageService.STORAGE_KEYS.DEVICE_TOKEN
    );
    return deviceToken;
  };
  const getToken = async () => {
    const authToken = await StorageService.getItem(
      StorageService.STORAGE_KEYS.AUTH_TOKEN
    );
    if (authToken) {
      return "Bearer " + authToken;
    } else {
      return "@#Slsjpoq$S1o08#MnbAiB%UVUV&Y*5EU@exS1o!08L9TSlsjpo#FKDFJSDLFJSDLFJSDLFJSDQY";
      // default_auth_token
    }
  };
  const renderItem = ({ item, index }) => {
    return (
      <View style={{ marginBottom: 7 }}>
        <TouchableWithoutFeedback onPress={() => click_video(index, item)}>
          <View style={styles.listViewStyle}>
            <View style={styles.listImageStyle}>
              <FastImage
                source={{ uri: item.image }}
                style={[styles.listImageStyle]}
              ></FastImage>
            </View>
            <View
              style={{
                position: "absolute",
                height: 105,
                width: 105,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FastImage
                source={importImages.mplayicon}
                style={{ height: 40, width: 40 }}
              />
            </View>
            <Text style={styles.listTextStyle}>{item.name}</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };
  const videoApi = async (values, param, checkfotter) => {
    const getallComplete =
      state.LastRecored == state.videoList.length ? false : true;
    setState((oldState) => ({
      ...oldState,
      isModalVisible: values,
      isModalFooterVisible: checkfotter ? checkfotter : getallComplete,
    }));
    let params = {
      page_no: param ? 1 : state.pagenumber,
      limit: 10,
      type: route.params.type,
      search: param ? param : "",
    };
    let response = await Request.post("video/list", params);
    if (response.status === "SUCCESS") {
      if (param) {
        setState((oldState) => ({
          ...oldState,
          videoList: response.data.videos,
          isModalVisible: false,
          isModalFooterVisible: false,
          LastRecored: response.data.total_records,
          isRefresh: false,
        }));
      } else {
        setState((oldState) => ({
          ...oldState,
          videoList: state.isRefresh
            ? response.data.videos
            : JSFunctionUtils.uniqueArray(
                state.videoList,
                response.data.videos,
                "video_id"
              ),
          isModalVisible: false,
          isModalFooterVisible: false,
          LastRecored: response.data.total_records,
          isRefresh: false,
          pagenumber:
            response.data.total_records === state.videoList.length
              ? state.pagenumber
              : state.pagenumber + 1,
        }));
      }
    } else {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
        isModalFooterVisible: false,
      }));
      if (response) {
        showSimpleAlert(response.message);
      }
    }
  };
  const videoApiSearch = async (values, param, checkfotter) => {
    const getallComplete =
      state.LastRecored == state.videoList.length ? false : true;
    setState((oldState) => ({
      ...oldState,
      isModalVisible: values,
      isModalFooterVisible: checkfotter ? checkfotter : getallComplete,
    }));
    let params = {
      page_no: param ? 1 : state.pagenumber,
      limit: 10,
      type: route.params.type,
      search: param ? param : "",
    };
    if (typeof cancelToken != typeof undefined) {
      cancelToken.cancel("Operation canceled due to new request.");
    }
    cancelToken = axios.CancelToken.source();
    axios
      .post(`${apiConfigs.SERVER_API_URL}${"video/list"}`, params, {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          language: "en",
          device_id: await getDeviceToken(),
          device_type: Platform.OS === "android" ? "1" : "2",
          os: Platform.OS === "android" ? "android" : "ios",
          app_version: "1",
          Authorization: await getToken(),
          timezone: RNLocalize.getTimeZone(),
        },
        cancelToken: cancelToken.token,
      })
      .then((responses) => {
        let response = responses.data;
        if (response.status === "SUCCESS") {
          if (param) {
            setState((oldState) => ({
              ...oldState,
              videoList: response.data.videos,
              isModalVisible: false,
              isModalFooterVisible: false,
              LastRecored: response.data.total_records,
              isRefresh: false,
            }));
          } else {
            setState((oldState) => ({
              ...oldState,
              videoList: state.isRefresh
                ? response.data.videos
                : JSFunctionUtils.uniqueArray(
                    state.videoList,
                    response.data.videos,
                    "video_id"
                  ),
              isModalVisible: false,
              isModalFooterVisible: false,
              LastRecored: response.data.total_records,
              isRefresh: false,
              pagenumber:
                response.data.total_records === state.videoList.length
                  ? state.pagenumber
                  : state.pagenumber + 1,
            }));
          }
        }
      })
      .catch((error) => {
        setState((oldState) => ({
          ...oldState,
          isModalVisible: false,
          isModalFooterVisible:
            error.message == "Operation canceled due to new request."
              ? true
              : false,
        }));
        // showSimpleAlert(error.message)
      });
  };
  const onRefresh = () => {
    if (state.searchTxt == "") {
      state.videoList = [];
      state.pagenumber = 1;
      state.LastRecored = 0;
      state.isRefresh = true;
      videoApi(false);
    }
  };
  const fetchMore = () => {
    const NotComplete =
      state.LastRecored != state.videoList.length ? true : false;

    if (NotComplete) {
      if (state.searchTxt == "") {
        videoApi(false);
      }
    }
  };
  const handleSearch = (text) => {
    var text = text.trim();
    state.searchTxt = text;
    state.videoList = text == "" ? [] : state.videoList;
    state.pagenumber = text == "" ? 1 : state.pagenumber;
    state.LastRecored = text == "" ? 0 : state.LastRecored;
    searchFlag = text.length > 0 ? true : searchFlag;
    if (searchFlag) {
      videoApiSearch(false, text, true);
      searchFlag = text.length == 0 ? false : searchFlag;
    }
  };
  const renderFooter = () => {
    return (
      <View style={styles.footer}>
        {state.isModalFooterVisible ? (
          <ActivityIndicator
            color={colors.Blue}
            style={{ marginLeft: 8 }}
            size={"large"}
            hidesWhenStopped={true}
          />
        ) : null}
      </View>
    );
  };
  return (
    <View style={stylesBackground.container}>
      <FastImage
        source={importImages.BackgroundAll}
        style={stylesBackground.backgroundimgcontainer}
        resizeMode={"stretch"}
      ></FastImage>
      <Header
        leftBtnOnPress={() => navigation.goBack()}
        leftBtnStyle={{
          shadowColor: colors.background,
          elevation: 5,
          shadowOffset: {
            width: 3,
            height: 2,
          },
          shadowOpacity: 0.2,
          shadowRadius: 6,
        }}
        headerTitle={"Videos"}
        titleStyle={styles.mainHeader}
      />

      {/* <Text style={styles.mainHeader}>{'Videos'}</Text> */}
      <View style={{ width: deviceWidth - 45, alignSelf: "center" }}>
        <TextField
          key={"Search"}
          placeholder={"Search"}
          ImageSrc={importImages.searchicons}
          isShowImg={true}
          inputRef={state.refSearch}
          onChangeText={(text) => handleSearch(text)}
          blurOnSubmit={true}
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.container}>
        <FlatList
          data={state.videoList}
          renderItem={renderItem}
          // bounces={false}
          onEndReachedThreshold={0.07}
          onEndReached={fetchMore}
          onRefresh={() => onRefresh()}
          refreshing={state.isRefresh}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={stylesBackground.NodataStyle}>
              {state.isRefresh
                ? ""
                : state.isModalVisible || state.isModalFooterVisible
                ? ""
                : "No data found"}
            </Text>
          )}
          contentContainerStyle={
            state.videoList.length > 0
              ? {}
              : { flexGrow: 1, justifyContent: "center", alignItems: "center" }
          }
          ListFooterComponent={renderFooter}
        />
      </View>
      {state.isModalVisible && (
        <BallIndicator visible={state.isModalVisible}></BallIndicator>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: deviceWidth - 50,
    alignSelf: "center",
  },

  listViewStyle: {
    flexDirection: "row",
    marginVertical: 13,
  },

  listImageStyle: {
    height: 105,
    width: 105,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.Lightgray,
  },

  listTextStyle: {
    fontFamily: fonts.rubikSemiBold,
    fontSize: 16,
    color: colors.Blue,
    marginLeft: 5,
    marginTop: 15,
    width: (deviceWidth + 50) / 2,
  },
  mainHeader: {
    color: colors.Blue,
    fontSize: 30,
    fontFamily: fonts.rubikBold,
    marginLeft: 25,
    textTransform: "capitalize",
  },
  footer: {},
});

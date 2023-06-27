import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { colors } from "../../../utils/color";
import { fonts, stylesBackground } from "../../../utils/font";
import { deviceWidth } from "../../../constants";
import { importImages } from "../../../utils/importImages";
import Header from "../../../components/Header";
import BottomButton from "../../../components/BottomButton";
import BallIndicator from "../../../components/BallIndicator";
import Request from "../../../api/Request";
import RenderHtml, { defaultSystemFonts } from "react-native-render-html";
import Share from "react-native-share";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import showSimpleAlert from "../../../utils/showSimpleAlert";
import {
  setEventProperty,
  setEventWithProperty,
  trackEvent,
} from "../../../utils/tracking";
import FastImage from "react-native-fast-image";
import SubscriptionModalView from "../../../components/SubscriptionModalView";
import apiConfigs from "../../../api/apiConfig";
import StorageService from "../../../utils/StorageService";
import NavigationService from "../../../utils/NavigationService";
export default function ArticlesDetailesScreen({ route, navigation }) {
  const [state, setState] = useState({
    isModalVisible: false,
    articleDetails: {},
    isLike: false,

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
    });
    articleDetailsApi();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      goBackNav1
    );
    return () => {
      unsubscribe, backHandler.remove();
    };
  }, []);

  const generateLink = async (param) => {
    var imgurl = state.articleDetails.image;
    var imgurlfinal = imgurl.replace(/ /g, "%20");
    const link = await dynamicLinks().buildShortLink({
      link: `https://levaapp.page.link/?article=${param}`,
      domainUriPrefix: "https://levaapp.page.link",
      analytics: {
        campaign: "deep-link",
      },
      social: {
        title: state.articleDetails.name,
        descriptionText: state.articleDetails.short_description,
        imageUrl: imgurlfinal,
      },
      ios: {
        bundleId: "com.leva",
        appStoreId: "1641438281",
      },
      android: {
        packageName: "com.leva",
      },
      navigation: {
        forcedRedirectEnabled: true,
      },
    });
    return link;
  };

  const onShare = async () => {
    setState((oldState) => ({ ...oldState, isModalVisible: true }));
    const trackEventparam = { action: state.articleDetails.name };
    trackEvent({ event: "Share_Article", trackEventparam });
    const link = await generateLink(state.articleDetails.article_id);
    const title = state.articleDetails.name;
    let options = Platform.select({
      default: {
        title: title,
        url: link,
      },
    });
    try {
      setState((oldState) => ({ ...oldState, isModalVisible: false }));
      await Share.open(options);
    } catch (err) {
      setState((oldState) => ({ ...oldState, isModalVisible: false }));
    }
  };
  const articleDetailsApi = async () => {
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
    }));
    let params = {
      article_id: route.params.id,
    };
    let response = await Request.post("article/detail", params);
    if (response.status === "SUCCESS") {
      setState((oldState) => ({
        ...oldState,
        articleDetails: response.data,
        isModalVisible: false,
        isLike: response.data.isLike,
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

      const trackEventparam = { name: response.data.name };
      setEventWithProperty("ArticlesDetailesScreen", trackEventparam.name);

      if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
        const trackEventparam = { action: state.articleDetails.name };
        trackEvent({
          event: "Paywall_In_ArticleDetailScreen",
          trackEventparam,
        });
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
  const articleFavApi = async () => {
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
      click_Like: true,
    }));
    let params = {
      article_id: route.params.id,
    };
    let response = await Request.post("user/like-unlike-article", params);
    if (response.status === "SUCCESS") {
      if (response.code == apiConfigs.USER_UNSUBSCRIBE) {
        setState((oldState) => ({
          ...oldState,
          isModalVisible: false,
          sub_title: response.title,
          sub_message: response.message,
          button_text: response.button_text,
          isSubscribe: true,
        }));

        const trackEventparam = { action: state.articleDetails.name };
        trackEvent({
          event: "Paywall_Article_Favorite",
          trackEventparam,
        });
      } else {
        const trackEventparam = {
          name: state.articleDetails.name,
          Like: response.data.isLike,
        };
        trackEvent({ event: "Favorite_Article", trackEventparam });
        setState((oldState) => ({
          ...oldState,
          isLike: response.data.isLike,
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

    // const trackEventparam = { action: state.articleDetails.name };
    // trackEvent({
    //   event: "Article->" + trackEventparam.action,
    //   trackEventparam,
    // });
    navigation.goBack();
  };
  const onPress = (_, href, htmlAttribs) => {
    var pattern = /^((http|https|ftp|news):\/\/)/;
    if (pattern.test(href)) {
      Linking.openURL(href);
    } else {
      NavigationService.replaceaction("ArticlesDetailesScreen", {
        id: href.replace("about:///", ""),
      });
    }
  };
  return (
    <View style={[stylesBackground.container, { justifyContent: "center" }]}>
      <FastImage
        source={importImages.BackgroundAll}
        style={stylesBackground.backgroundimgcontainer}
        resizeMode={"stretch"}
      ></FastImage>
      <Header
        leftBtnOnPress={() => goBackNav()}
        rightBtn={
          <FastImage
            source={
              state.isLike ? importImages.heartIcon : importImages.likeIcon
            }
            style={{ width: 40, height: 40 }}
          ></FastImage>
        }
        rightBtnOnPress={() => articleFavApi()}
      />
      <Text style={styles.mainHeader}>{"article"}</Text>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ alignItems: "center" }}
        >
          <FastImage
            style={styles.imageStyle}
            source={{ uri: state.articleDetails.image }}
          ></FastImage>
          <View style={styles.viewStyle}>
            <Text
              style={{
                fontSize: 20,
                color: colors.Blue,
                fontFamily: fonts.rubikBold,
              }}
            >
              {state.articleDetails.name}
            </Text>
            <RenderHtml
              baseStyle={{
                fontFamily: fonts.rubikRegular,
                color: colors.Black,
              }}
              contentWidth={deviceWidth}
              source={{ html: state.articleDetails.description }}
              renderersProps={{ a: { onPress } }}
              systemFonts={[
                ...defaultSystemFonts,
                "Rubik-Bold",
                "Rubik-Regular",
              ]}
              tagsStyles={{
                p: { marginTop: 0 },
              }}
            />
          </View>
          <View style={{ height: 90 }}></View>
        </ScrollView>
      </View>
      <BottomButton
        text={"share"}
        container={{
          width: deviceWidth - 22,
          alignSelf: "center",
          position: "absolute",
          bottom: -10,
        }}
        textstyle={{ fontFamily: fonts.rubikBold }}
        onPress={() => onShare()}
      />
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
    height: 208,
    borderRadius: 20,
    marginTop: 20,
    width: deviceWidth - 50,
  },

  viewStyle: {
    marginTop: 16,
    width: deviceWidth - 50,
    // flex:1
  },
});

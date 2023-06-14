import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { colors } from "../../utils/color";
import { fonts, stylesBackground } from "../../utils/font";
import { ConstantsText, deviceWidth } from "../../constants";
import { importImages } from "../../utils/importImages";
import Header from "../../components/Header";
import BottomButton from "../../components/BottomButton";
import BallIndicator from "../../components/BallIndicator";
import Request from "../../api/Request";
import showSimpleAlert from "../../utils/showSimpleAlert";
import StorageService from "../../utils/StorageService";
import { trackEvent } from "../../utils/tracking";
import FastImage from "react-native-fast-image";
import { hasNotch } from "react-native-device-info";
export default function PickYourInterestsScreen({ route, navigation }) {
  const [state, setState] = useState({
    isModalVisible: false,
    pickIntersetData: [],
  });
  useEffect(() => {
    getInterestList();
  }, []);

  //API Calling
  const getInterestList = async () => {
    setState((oldState) => ({
      ...oldState,
      isModalVisible: true,
    }));
    let response = await Request.post("intrest-list");
    if (response.status === "SUCCESS") {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
        pickIntersetData: response.data,
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
  const Action_continue = async () => {
    const interest_id = state.pickIntersetData
      .filter((item) => item.isSelected)
      .map((item) => item.interest_id);
    const interest_name = state.pickIntersetData
      .filter((item) => item.isSelected)
      .map((item) => item.name);

    const alldata = state.pickIntersetData.filter((item) => item.isSelected);
    alldata.push({ interest_id: "1", name: "Add More" });
    if (interest_id.length > 0) {
      interest_name.map((itm) => {
        const trackEventparam = { action: itm.toString() };
        trackEvent({ event: "Interest_Selected_" + itm, trackEventparam });
      });
      // const trackEventparam = { action: interest_name.toString() }
      // trackEvent({ event: 'Pick_Your_Interests', trackEventparam })

      if (route.params.from === "edit") {
        route.params.onGoBack(interest_id, alldata);
        navigation.goBack();
      } else {
        setState((oldState) => ({
          ...oldState,
          isModalVisible: true,
        }));
        let param = {
          interest_ids: interest_id,
        };
        let response = await Request.post("user/store-interest", param);
        setState((oldState) => ({
          ...oldState,
          isModalVisible: false,
        }));
        if (response.status === "SUCCESS") {
          const userData = await StorageService.getItem(
            StorageService.STORAGE_KEYS.USER_DETAILS
          );
          userData.is_interest_selected = true;
          await StorageService.saveItem(
            StorageService.STORAGE_KEYS.USER_DETAILS,
            userData
          );
          navigation.navigate("MotherInformationScreen", { from: "" });
        } else {
          if (response) {
            showSimpleAlert(response.message);
          }
        }
      }
    } else {
      alert(ConstantsText.Pleasepickyourinterests);
    }
  };
  const OnPressItem = (item, index) => {
    state.pickIntersetData[index].isSelected = !item.isSelected;
    setState((oldState) => ({
      ...oldState,
    }));
  };
  const renderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback onPress={() => OnPressItem(item, index)}>
        <View
          style={[
            item.isSelected
              ? styles.activeBackground
              : styles.inactiveBackground,
            {
              marginBottom:
                state.pickIntersetData.length - 1 == index
                  ? hasNotch()
                    ? 130
                    : 110
                  : 7,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginStart: 10,
              marginEnd: 15,
            }}
          >
            <FastImage
              source={{ uri: item.icon }}
              style={{ height: 35, width: 35 }}
            />
            <Text
              style={item.isSelected ? styles.activeText : styles.inactiveText}
            >
              {item.name}
            </Text>
            <FastImage
              source={
                item.isSelected
                  ? importImages.CheckIcon
                  : importImages.UnCheckIcon
              }
              style={{ height: 35, width: 35 }}
              resizeMode={"center"}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
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
        headerTitle={""}
        leftBtnOnPress={
          route.params.from != "" ? () => navigation.goBack() : null
        }
        titleStyle={{ color: colors.background }}
      />
      <View style={styles.container}>
        <View>
          <Text
            style={styles.titleStyle}
            adjustsFontSizeToFit={true}
            numberOfLines={1}
          >
            {"Pick Your Interests"}
          </Text>
          <Text style={styles.subtitleStyle}>
            {"This will help us create a personalized experience for you"}
          </Text>
        </View>
        <FlatList
          data={state.pickIntersetData}
          renderItem={renderItem}
          style={{ marginTop: 17 }}
          bounces={false}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={stylesBackground.NodataStyle}>
              {state.isModalVisible ? "" : "No data found"}
            </Text>
          )}
          contentContainerStyle={
            state.pickIntersetData.length > 0
              ? {}
              : { flexGrow: 1, justifyContent: "center", alignItems: "center" }
          }
        />
        <BottomButton
          text={route.params.from === "edit" ? "Save" : "Continue"}
          onPress={() => Action_continue()}
          container={{ position: "absolute", bottom: 0 }}
        />
      </View>
      {state.isModalVisible && (
        <BallIndicator visible={state.isModalVisible} valueschange={true} />
      )}
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
    textTransform: "capitalize",
  },
  subtitleStyle: {
    marginTop: 10,
    color: colors.Blue,
    fontSize: 16,
    fontFamily: fonts.rubikRegular,
    opacity: 0.7,
  },
  activeBackground: {
    backgroundColor: colors.Blue,
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
  },
  activeText: {
    fontSize: 16,
    fontFamily: fonts.rubikRegular,
    color: colors.White,
    width: 200,
    textAlign: "center",
  },
  inactiveBackground: {
    backgroundColor: colors.White,
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
  },
  inactiveText: {
    fontSize: 16,
    fontFamily: fonts.rubikRegular,
    color: colors.textLable,
    width: 200,
    textAlign: "center",
  },
});

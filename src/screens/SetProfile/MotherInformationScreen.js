import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { colors } from "../../utils/color";
import { fonts, stylesBackground } from "../../utils/font";
import { ConstantsText, deviceWidth } from "../../constants";
import { importImages } from "../../utils/importImages";
import Header from "../../components/Header";
import BottomButton from "../../components/BottomButton";
import TextField from "../../components/TextField";
import CalenderModal from "../../components/CalenderModal";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import BallIndicator from "../../components/BallIndicator";
import Request from "../../api/Request";
import showSimpleAlert from "../../utils/showSimpleAlert";
import moment from "moment";
import StorageService from "../../utils/StorageService";
import { trackEvent } from "../../utils/tracking";
import FastImage from "react-native-fast-image";
import { hasNotch } from "react-native-device-info";

export default function MotherInformationScreen({ route, navigation }) {
  const [state, setState] = useState({
    name: "",
    youare: "",
    bdate: "",
    feet: "",
    inches: "",
    weight: "",
    datepicker: false,
    youareData: [
      { label: "A new mom", value: "1" },
      { label: "An expectant mom", value: "2" },
    ],
    isModalVisible: false,
  });
  useEffect(() => {
    getname();
  }, []);

  const getname = async () => {
    const userData = await StorageService.getItem(
      StorageService.STORAGE_KEYS.USER_DETAILS
    );
    setState((oldState) => ({
      ...oldState,
      name: userData.name,
    }));
  };
  const Action_continue = async () => {
    if (state.name.trim() === "") {
      alert(ConstantsText.Pleaseentername);
    } else if (state.youare === "") {
      alert(ConstantsText.Pleaseselectmotherhoodstatus);
    } else if (state.bdate === "") {
      alert(ConstantsText.PleaseselectbirthDate);
    } else if (Number(state.feet) > 9) {
      alert(ConstantsText.Pleaseentervalidfeet);
    } else if (Number(state.inches) > 12) {
      alert(ConstantsText.Pleaseentervalidinches);
    } else {
      setState((oldState) => ({
        ...oldState,
        isModalVisible: true,
      }));
      let param = {
        name: state.name.trim(),
        motherhood_status: state.youare,
        dob: state.bdate,
        profession: "",
        weight: state.weight,
        feet: state.feet,
        inches: state.inches,
      };
      let response = await Request.post("user/store-info", param);
      setState((oldState) => ({
        ...oldState,
        isModalVisible: false,
      }));
      if (response.status === "SUCCESS") {
        let feetdata = state.feet ? state.feet + " ft | " : "";
        let inchesdata = state.inches ? state.inches + " in" : "";
        const trackEventparam = {
          name: state.name,
          status: state.youare == "1" ? "A new mom" : "An expectant mom",
          DOB: state.bdate,
          Height: feetdata + inchesdata,
          Weight: state.weight,
        };
        trackEvent({
          event:
            "Mother_Information " +
            (state.youare == "1" ? "A new mom" : "An expectant mom"),
          trackEventparam,
        });
        const userData = await StorageService.getItem(
          StorageService.STORAGE_KEYS.USER_DETAILS
        );
        userData.is_mother_detail_added = true;
        userData.motherhood_status = Number(state.youare);
        userData.name = state.name;
        await StorageService.saveItem(
          StorageService.STORAGE_KEYS.USER_DETAILS,
          userData
        );
        navigation.navigate("ChildInformationScreen", { from: "" });
      } else {
        if (response) {
          showSimpleAlert(response.message);
        }
      }
    }
  };
  const getDate = (date) => {
    setState((oldState) => ({
      ...oldState,
      bdate: date,
      datepicker: false,
    }));
  };
  const handleChangeOfText = (key, value) => {
    setState((oldState) => ({
      ...oldState,
      [key]: value,
    }));
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={{}}>
        <TextField
          key={"name"}
          ref={null}
          value={state.name}
          placeholder={"First name"}
          ImageSrc={importImages.userIcon}
          isShowImg={true}
          onChangeText={(text) => handleChangeOfText("name", text, 0)}
          blurOnSubmit={true}
          lable={"Name"}
          autoCapitalize={"words"}
          returnKeyType={"done"}
        />

        <Text
          style={{
            fontSize: 12,
            color: colors.textLable,
            fontFamily: fonts.rubikRegular,
            textTransform: "capitalize",
          }}
        >
          {"You Are..."}
        </Text>
        <View
          style={{
            flexDirection: "row",
            width: deviceWidth - 50,
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableWithoutFeedback
              onPress={() =>
                setState((oldState) => ({ ...oldState, youare: "1" }))
              }
            >
              <View
                style={{
                  backgroundColor: colors.Darkpink,
                  height: 26,
                  width: 26,
                  borderRadius: 26 / 2,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: state.youare === "1" ? 1 : 0,
                  borderColor: colors.Blue,
                }}
              >
                <View
                  style={{
                    backgroundColor:
                      state.youare === "1" ? colors.Blue : colors.White,
                    height: 11.66,
                    width: 11.66,
                    borderRadius: 11.66 / 2,
                  }}
                ></View>
              </View>
            </TouchableWithoutFeedback>
            <Text
              style={{
                color: colors.textLable,
                fontFamily: fonts.rubikRegular,
                fontSize: 16,
                marginStart: 15,
              }}
            >
              {"A new mom"}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginStart: 20,
            }}
          >
            <TouchableWithoutFeedback
              onPress={() =>
                setState((oldState) => ({ ...oldState, youare: "2" }))
              }
            >
              <View
                style={{
                  backgroundColor: colors.Darkpink,
                  height: 26,
                  width: 26,
                  borderRadius: 26 / 2,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: state.youare === "2" ? 1 : 0,
                  borderColor: colors.Blue,
                }}
              >
                <View
                  style={{
                    backgroundColor:
                      state.youare === "2" ? colors.Blue : colors.White,
                    height: 11.66,
                    width: 11.66,
                    borderRadius: 11.66 / 2,
                  }}
                ></View>
              </View>
            </TouchableWithoutFeedback>
            <Text
              style={{
                color: colors.textLable,
                fontFamily: fonts.rubikRegular,
                fontSize: 16,
                marginStart: 15,
              }}
            >
              {"An expectant\nmom"}
            </Text>
          </View>
        </View>

        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setState((oldState) => ({
              ...oldState,
              datepicker: true,
            }));
          }}
        >
          <View>
            <TextField
              key={"bdate"}
              ref={null}
              value={
                state.bdate != ""
                  ? moment(state.bdate).format("MM/DD/YYYY")
                  : ""
              }
              placeholder={"DOB"}
              ImageSrc={importImages.bdateIcon}
              isShowImg={true}
              onChangeText={(text) => handleChangeOfText("bdate", text)}
              blurOnSubmit={false}
              lable={"Birth Date"}
              editable={false}
              isClear={state.bdate === "" ? false : true}
              type={"bdate"}
              isONClear={() =>
                setState((oldState) => ({
                  ...oldState,
                  bdate: "",
                  datepicker: false,
                }))
              }
              autoCapitalize={"none"}
              returnKeyType={"next"}
            />
          </View>
        </TouchableWithoutFeedback>

        <View style={{ flexDirection: "row", width: deviceWidth - 50 }}>
          <View style={{ flexDirection: "row" }}>
            <TextField
              key={"feet"}
              textInputStyle={{ width: 70 }}
              ref={null}
              value={state.feet}
              placeholder={"Feet"}
              isShowImg={false}
              onChangeText={(text) => handleChangeOfText("feet", text)}
              blurOnSubmit={true}
              lable={"Height"}
              keyboardType={"decimal-pad"}
              autoCapitalize={"none"}
              returnKeyType={"done"}
            />
            <Text
              style={{
                color: colors.textLable,
                fontSize: 16,
                fontFamily: fonts.rubikRegular,
                position: "absolute",
                right: -20,
                bottom: 30,
              }}
            >
              {" ft"}
            </Text>
          </View>
          <View style={{ marginStart: 30, flexDirection: "row" }}>
            <TextField
              key={"Inches"}
              ref={null}
              textInputStyle={{ width: 70 }}
              value={state.inches}
              placeholder={"Inches"}
              isShowImg={false}
              onChangeText={(text) => handleChangeOfText("inches", text)}
              blurOnSubmit={true}
              lable={" "}
              keyboardType={"decimal-pad"}
              autoCapitalize={"none"}
              returnKeyType={"done"}
            />
            <Text
              style={{
                color: colors.textLable,
                fontSize: 16,
                fontFamily: fonts.rubikRegular,
                position: "absolute",
                right: -20,
                bottom: 30,
              }}
            >
              {" in"}
            </Text>
          </View>
        </View>
        <TextField
          key={"weight"}
          containerStyle={{ marginBottom: hasNotch() ? 130 : 110 }}
          ref={null}
          value={state.weight}
          placeholder={"How much do you weigh? (lbs)"}
          isShowImg={false}
          onChangeText={(text) => handleChangeOfText("weight", text)}
          // onSubmitEditing={() => handleSubmitEditing(state.motherInfoData[i + 1])}
          blurOnSubmit={true}
          lable={"Weight (lbs)"}
          keyboardType={"decimal-pad"}
          autoCapitalize={"none"}
          returnKeyType={"done"}
          lableStyle={{ textTransform: "none" }}
        />

        <CalenderModal
          visible={state.datepicker}
          transparent={true}
          type=""
          maxDate={new Date()}
          lable="DOB"
          valuesdate={
            state.bdate === ""
              ? moment(new Date()).format("YYYY-MM-DD")
              : state.bdate
          }
          getDate={getDate}
          CloseModal={() =>
            setState((oldState) => ({
              ...oldState,
              bdate: state.bdate,
              datepicker: false,
            }))
          }
        />
      </View>
    );
  };
  return (
    <View style={stylesBackground.container}>
      <FastImage
        source={importImages.BackgroundAll}
        style={[stylesBackground.backgroundimgcontainer, {}]}
        resizeMode={"stretch"}
      ></FastImage>
      <Header
        headerTitle={""}
        leftBtnOnPress={
          route.params.from === "" ? () => navigation.goBack() : null
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
            {"Mother Information"}
          </Text>
          <Text style={styles.subtitleStyle}>
            {
              "Learning about you allows us to provide tailored content and support"
            }
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <KeyboardAwareFlatList
            data={[1]}
            renderItem={renderItem}
            style={{ marginTop: 28 }}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraHeight={Platform.OS === "ios" ? -75 : 50}
            keyboardOpeningTime={0}
            keyboardShouldPersistTaps={"handled"}
            bounces={false}
          />
          <BottomButton
            text={"Continue"}
            onPress={() => Action_continue()}
            container={{ position: "absolute", bottom: 0 }}
          />
        </View>
      </View>
      {state.isModalVisible && <BallIndicator visible={state.isModalVisible} />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: deviceWidth - 34,
    alignSelf: "center",
    height: "100%",
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
});

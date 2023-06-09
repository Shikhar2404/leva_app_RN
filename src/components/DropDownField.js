import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Keyboard } from "react-native";
import { colors } from "../utils/color";
import { fonts } from "../utils/font";
import { Dropdown } from "react-native-element-dropdown";
import FastImage from "react-native-fast-image";
import { getDeviceName } from "react-native-device-info";
export default function DropDownField(props) {
  const [state, setState] = useState({
    fontSize: 12,
    isFocus: false,
    values: "",
    dname: "",
  });

  useEffect(() => {
    getDeviceName().then((deviceName) => {
      setState((oldState) => ({ ...oldState, dname: deviceName }));
    });
  }, []);

  const renderItem = (item) => {
    return (
      <View
        style={{
          height: 56,
          justifyContent: "center",
          borderBottomColor: "#CDCECF",
          marginStart: 20,
          marginEnd: 20,
          borderBottomWidth: 1,
        }}
      >
        <View style={{}}>
          <Text style={styles.textItem}>{item.label}</Text>
        </View>
      </View>
    );
  };
  return (
    <View>
      <Text
        style={[
          {
            fontSize: state.fontSize,
            color: colors.textLable,
            fontFamily: fonts.rubikRegular,
            textTransform: "capitalize",
          },
          props.lableStyle,
        ]}
        numberOfLines={1}
      >
        {props.lable}
      </Text>
      <View
        style={[
          [styles.textInputContainerShadow],
          props.containerStyle,
          {
            borderRadius: 10,
            borderBottomRightRadius: state.isFocus ? 0 : 10,
            borderBottomLeftRadius: state.isFocus ? 0 : 10,
            borderColor: state.isFocus ? colors.Blue : "rgba(34, 50, 99, 0.2)",
            borderBottomColor: state.isFocus
              ? colors.Blue
              : "rgba(34, 50, 99, 0.2)",
          },
        ]}
      >
        <View
          style={[
            styles.textInputInnerContainer,
            {
              borderColor: state.isFocus
                ? colors.Blue
                : "rgba(34, 50, 99, 0.2)",
              backgroundColor: state.isFocus
                ? colors.Blue
                : colors.textinputBackground,
              borderBottomColor: state.isFocus
                ? colors.Blue
                : "rgba(34, 50, 99, 0.2)",
              borderBottomRightRadius: state.isFocus ? 0 : 10,
              borderBottomLeftRadius: state.isFocus ? 0 : 10,
            },
            props.innerContainerStyle,
          ]}
        >
          <Dropdown
            style={[
              styles.textInput,
              props.textInputStyle,
              { height: state.dname === "Pixel 5" || state.dname === "Pixel 7 Pro" ? 52 : 60 },
            ]}
            iconStyle={styles.iconStyle}
            data={props.data}
            maxHeight={300}
            labelField="label"
            disable={props.disable}
            containerStyle={{
              width: "100%",
              marginLeft: -0.5,
              borderRadius: 10,
              borderColor: colors.Blue,
              borderTopRightRadius: state.isFocus ? 0 : 10,
              borderTopLeftRadius: state.isFocus ? 0 : 10,
              borderTopColor: state.isFocus ? colors.White : colors.Blue,
            }}
            valueField="value"
            showsVerticalScrollIndicator={false}
            activeColor="none"
            keyboardAvoiding={false}
            placeholder={props.placeholder}
            selectedTextStyle={[
              {
                marginStart: 20,
                color: state.isFocus ? colors.White : colors.Blue,
                fontFamily: fonts.rubikRegular,
                fontSize: 16,
              },
              props.selectedTextStyle,
            ]}
            placeholderStyle={[
              {
                marginStart: 20,
                color: state.isFocus ? colors.White : colors.grey,
                fontFamily: fonts.rubikRegular,
                fontSize: 16,
              },
              props.placeholderStyle,
            ]}
            value={state.values}
            dropdownPosition={
              props.dropdownPosition ? props.dropdownPosition : "bottom"
            }
            renderItem={renderItem}
            onFocus={() => {
              Keyboard.dismiss(),
                setState((oldState) => ({
                  ...oldState,
                  isFocus: true,
                }));
              props.onFocus?.(true);
            }}
            onBlur={() => {
              setState((oldState) => ({
                ...oldState,
                isFocus: false,
              })),
                props.onBlur?.(false);
            }}
            onChange={props.onChange}
            renderRightIcon={() => (
              <View style={[props.ImageSrc ? styles.iconContainer : {}, {}]}>
                {props.ImageSrc ? (
                  <FastImage
                    source={props.ImageSrc}
                    resizeMode={"contain"}
                    style={{
                      opacity: props.icontype ? 1 : 0.7,
                      tintColor: state.isFocus
                        ? colors.White
                        : props.icontype
                        ? colors.dropDwonIcon
                        : colors.Blue,
                      height: 24,
                      width: 24,
                    }}
                  />
                ) : null}
              </View>
            )}
            selectedStyle={styles.selectedStyle}
          />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  textInputContainerShadow: {
    marginBottom: 10,
    backgroundColor: "#FDFDFD",
    marginTop: 10,
    borderColor: "rgba(34, 50, 99, 0.2)",
    borderWidth: 1,
    overflow: "hidden",
    width: "100%",
    // borderRadius: 10,
  },

  iconContainer: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  textInputInnerContainer: {
    // alignItems: "flex-start",
    height: 60,
    justifyContent: "center",
    width: "100%",
  },

  textInput: {
    width: "100%",
    elevation: 0,
    fontSize: 16,
    fontFamily: fonts.rubikRegular,
    color: colors.textLable,
  },

  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    shadowColor: "#000",
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
  },
  textItem: {
    color: colors.Blue,
    fontSize: 12,
    fontFamily: fonts.rubikRegular,
  },
});

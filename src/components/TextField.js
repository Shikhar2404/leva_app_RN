import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet,  TouchableOpacity,  Text, Keyboard, TouchableWithoutFeedback } from "react-native";
import { colors } from '../utils/color';
import { fonts } from '../utils/font';
import { importImages } from '../utils/importImages';
import FastImage from 'react-native-fast-image';
export default function TextField(props) {
   const [state, setState] = useState({
      fontSize: 12,
      showPassword: false,
      isFocus: false,
      containerStyle: [styles.textInputContainerShadow]
   })
   const handleFocus = () => {

      setState(oldState => ({
         ...oldState,
         ['containerStyle']: [styles.textInputContainerShadow1],
         isFocus: true
      }));
      props.onFocus?.(true)

   }
   const handleBlur = () => {
      setState(oldState => ({
         ...oldState,
         ['containerStyle']: [styles.textInputContainerShadow],
         isFocus: false
      }));
      props.onBlur?.(false)


   }
   useEffect(() => { }, [state.containerStyle]);


   const togglePasswordEyeAndText = () => {
      setState(oldState => ({
         ...oldState,
         showPassword: !state.showPassword
      }));

   }
   const handleSubmitEditing = (nextTextField) => {
      if (nextTextField) {
         nextTextField.ref.current.focus();
      } else {
         Keyboard.dismiss();
      }
   }

   return (
      <View style={state.isFocus ? {

         shadowColor: 'rgba(255, 189, 174, 0.33)',
         shadowOffset: { width: 10, height: 0 },
         shadowOpacity: 10,
         shadowRadius: 10,
         // Android
         elevation: 10,
      } : { elevation: 0, }}>
        {props.lable? <Text style={[{ fontSize: state.fontSize, color: colors.textLable, fontFamily: fonts.rubikRegular, textTransform: 'capitalize' }, props.lableStyle]} numberOfLines={1}>{props.lable}</Text>:null}
         <View style={[state.containerStyle, props.containerStyle, {}]}>
            <View style={[props.isShowImg || props.isPasswordField ? styles.textInputInnerContainer1 : styles.textInputInnerContainer, { borderRadius: 10, backgroundColor: colors.textinputBackground, height: props.multiline ? 127 : 60 }, props.innerContainerStyle]}>
               {props.type === 'bdate' ?
                  <Text style={[styles.textInput1, props.textInputStyle, { justifyContent: 'center', alignItems: 'center' }]}>{props.value != '' ? props.value : props.placeholder}</Text>
                  :


                  <TextInput
                     ref={props.inputRef}
                     secureTextEntry={props.isPasswordField ? !state.showPassword : false}
                     style={[props.isShowImg || props.isPasswordField ? styles.textInput : styles.textInput2, props.textInputStyle,]}
                     onChangeText={props.onChangeText}
                     value={props.value}
                     onFocus={handleFocus}
                     onBlur={handleBlur}
                     placeholder={props.placeholder}
                     placeholderTextColor={colors.grey}
                     onSubmitEditing={props.onSubmitEditing}
                     blurOnSubmit={props.blurOnSubmit}
                     autoCapitalize={props.autoCapitalize}
                     multiline={props.multiline}
                     keyboardType={props.keyboardType || 'default'}
                     returnKeyType={props.returnKeyType}
                     editable={props.editable}
                     maxLength={props.maxLength}
                     autoFocus={props.autoFocus}

                  />
               }
               {props.isShowImg ?
                  <View style={[styles.iconContainer, {}]}>
                     {props.isClear ?
                        <TouchableWithoutFeedback onPress={null}>
                           <View>
                              <TouchableWithoutFeedback onPress={props.isONClear}>
                                 <View>
                                    <FastImage source={importImages.closeicon} resizeMode='cover' style={{ opacity: state.isFocus ? 1 : 0.7, width: 20, height: 20, }}></FastImage>
                                 </View>
                              </TouchableWithoutFeedback>
                           </View>
                        </TouchableWithoutFeedback>
                        :
                        <FastImage source={props.ImageSrc} resizeMode='center' style={{ tintColor: colors.Blue, opacity: state.isFocus ? 1 : 0.7 ,width: 25, height: 25,  }}></FastImage>
                     }
                  </View>

                  : null
               }
               {props.isPasswordField
                  ?
                  <TouchableOpacity onPress={togglePasswordEyeAndText}>
                     <View style={[styles.iconContainer, {}]}>
                        <FastImage source={state.showPassword ? importImages.eyesIcons : importImages.eyesIcons} resizeMode='center' style={{ opacity: state.isFocus ? 1 : 0.7,width: 25, height: 25, }} ></FastImage>
                     </View>
                  </TouchableOpacity>
                  : null
               }
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
      borderRadius: 10,
      overflow: 'hidden'

   },
   textInputContainerShadow1: {
      marginBottom: 10,
      backgroundColor: "#FDFDFD",
      marginTop: 10,
      borderColor: colors.Blue,
      borderWidth: 1,
      borderRadius: 10,
      overflow: 'hidden',
      // IOS
      shadowColor: 'rgba(255, 189, 174, 0.33)',
      shadowOffset: { width: 10, height: 10 },
      shadowOpacity: 10,
      shadowRadius: 10,
      // Android
      elevation: 10,
   },
   iconContainer: {
      width: 45,
      height: 45,
      alignItems: "center",
      justifyContent: "center",
   },
   textInputInnerContainer: {
      alignItems: "flex-start",
      height: 60,
      marginStart: 20,
      marginEnd:20,
      justifyContent: 'center'
   },
   textInputInnerContainer1: {
      alignItems: "center",
      flexDirection: "row",
      height: 60,
      justifyContent: 'space-around'
   },
   textInput: {
      padding: 0,
      height: 60,
      width: "75%",
      elevation: 0,
      fontSize: 16,
      marginStart:20,
      fontFamily: fonts.rubikRegular,
      color: colors.textLable,
   },
   textInput2: {
      padding: 0,
      height: 60,
      width: "100%",
      elevation: 0,
      fontSize: 16,
      fontFamily: fonts.rubikRegular,
      color: colors.textLable
   },
   textInput1: {
      padding: 0,
      width: "75%",
      elevation: 0,
      fontSize: 16,
      marginStart: 12,
      fontFamily: fonts.rubikRegular,
      color: colors.textLable
   },
});
import React, {  } from 'react';
import { StyleSheet, View,TouchableWithoutFeedback, Text, Platform, } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { deviceWidth,  } from '../constants'
import { colors } from '../utils/color';
import { BlurView } from "@react-native-community/blur";
import FastImage from 'react-native-fast-image';
import { importImages } from '../utils/importImages';
import { fonts } from '../utils/font';
import { hasNotch } from 'react-native-device-info';

export default function SubscriptionModalView(props) {

   return (
      <View style={[styles.styles, props.style]}>

         <BlurView
            style={[{ justifyContent: 'center', }, props.BlurViewStyle]}
            blurType="light"
            autoUpdate={true}
            blurAmount={8}

            reducedTransparencyFallbackColor="white"
         >

            <View style={[{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', }, props.containerstyle]}>
              

               <View style={{ backgroundColor: 'transparent', width: deviceWidth - 50, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', }}>
                  <View style={{ width: 116, }}>
                     <FastImage style={{ width: 27, height: 24, position: 'absolute', right: -13, top: -13 }} source={importImages.crownicon}></FastImage>
                     <FastImage style={{ width: 116, height: 39 }} source={importImages.logoicon}></FastImage>
                  </View>
                  {props.title ? <Text style={{ textAlign: 'center', marginTop: 22, color: colors.Black, fontFamily: fonts.rubikBold, fontSize: 15 }}>{props.title}</Text> : null}
                  {props.message ? <Text style={{ textAlign: 'center', marginTop: 10, color: colors.Black, fontFamily: fonts.rubikMedium, fontSize: 14 }}>{props.message}</Text> : null}
                  <LinearGradient colors={['#483D8B',
                     '#282156',]} style={{
                        width: deviceWidth - 120, justifyContent: 'center', alignItems: 'center',  borderRadius: 10, marginTop: 18,padding:15
                     }} >
                     <TouchableWithoutFeedback onPress={props.subScribeOnClick}>
                        <View>
                           <Text style={{ fontFamily: fonts.rubikBold, fontSize: 16, color: colors.White }}>{props.button_text ? props.button_text :'Upgrade plan - Pro'}</Text>
                        </View>
                     </TouchableWithoutFeedback>
                  </LinearGradient>
               </View>
              
                <TouchableWithoutFeedback onPress={props.onClose}>
                  <View style={{position: 'absolute', top: Platform.OS == 'android' ? 20 : hasNotch() ? 65 : 40, right: 25}}>
                     <FastImage source={importImages.crossIcon} style={{ width: 25, height: 25, opacity: 0.9,  }} />
                  </View>
               </TouchableWithoutFeedback>
            </View>

         </BlurView>
       
      </View>
   );
}
const styles = StyleSheet.create({
   styles: {
      justifyContent: 'center',
      alignItems: 'center',
      width: deviceWidth,
      position: 'absolute',
      overflow: 'hidden',
      alignSelf: 'center',
   },

});






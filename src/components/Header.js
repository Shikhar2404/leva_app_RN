import React from 'react';
import { colors } from '../utils/color';
import { importImages } from '../utils/importImages'
import { StyleSheet, View, Text, TouchableWithoutFeedback,  SafeAreaView } from 'react-native';
import { fonts } from '../utils/font';
import FastImage from 'react-native-fast-image';

export default function Header(props) {
   return (
      <SafeAreaView style={[{ backgroundColor: colors.pink }, props.safeAreaView]}>
         <View style={[styles.container, props.style]}>
            <TouchableWithoutFeedback onPress={props.leftBtnOnPress}>
               <View style={[styles.leftBtnStyle, 
                props.menu ?{
                  shadowColor: colors.background,
                  elevation: 5,
                  shadowOffset: {
                     width: 2,
                     height: 2
                  },
                  shadowOpacity: 0.20,
                  shadowRadius: 6,
               }:{}, props.leftBtnStyle]}>
                  {props.leftBtnOnPress != null ?
                     props.menu ?
                        <FastImage source={importImages.drawerMenu} style={{ width: 32, height: 31, }} />
                        : <FastImage source={importImages.backImg} style={[props.tintColor ? { tintColor: colors.White } : {}, { width: 29, height: 29 }]}></FastImage>
                     : null}
               </View>
            </TouchableWithoutFeedback>
            <View>
               <Text style={[styles.titleStyle, props.titleStyle]} adjustsFontSizeToFit={true} numberOfLines={1}>{props.headerTitle}</Text>
            </View>
            <TouchableWithoutFeedback onPress={props.rightBtnOnPress}>
               <View style={[styles.rightBtnStyle, props.rightBtnStyle]}>
                  {props.rightBtn != null ? props.rightBtn
                     : null}
               </View>
            </TouchableWithoutFeedback>
         </View>
      </SafeAreaView>
   );
}
const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      height: 70,
      alignItems: 'center',
      justifyContent: 'center',
   },
   titleStyle: {
      color: colors.Blue,
      fontSize: 20,
      fontFamily: fonts.rubikSemiBold,
      textTransform: 'capitalize',
   },
   leftBtnStyle: {
      left: 17, position: 'absolute',
   },
   rightBtnStyle: {
      right: 17, position: 'absolute',
      height: 30,
      width: 30,
      alignItems: 'center',
      justifyContent: 'center'
   }
});




import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, } from "react-native";
import { colors } from '../utils/color';
import { fonts } from '../utils/font';
import { hasNotch } from 'react-native-device-info';
export default function BottomButton(props) {
   return (
      <View style={[styles.container, props.container]}>
         <TouchableOpacity onPress={props.onPress} style={styles.maincontainer} disabled={props.disabled}>
            <Text style={[styles.textstyle, props.textstyle]}>{props.text}</Text>
         </TouchableOpacity>

      </View>
   );
}
const styles = StyleSheet.create({
   container: {
      backgroundColor: colors.Blue,
      borderRadius: 10,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Platform.OS === 'ios' ? hasNotch() ? 60 : 40 : 40,
      width: '100%'
   },
   textstyle: {
      color: colors.White,
      fontSize: 16,
      fontFamily: fonts.rubikSemiBold,
      textTransform: 'capitalize'
   },
   maincontainer:{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center',
}
});
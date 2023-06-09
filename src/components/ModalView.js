import React from 'react';
import { StyleSheet, View, Modal, TouchableWithoutFeedback } from 'react-native';
import { deviceWidth, } from '../constants'
import { colors } from '../utils/color';
import BallIndicator from './BallIndicator';

export default function ModalView(props) {
   return (
      <Modal
         animationType={props.animationType != null ? props.animationType : 'none'}
         animated={props.animated != null ? props.animated : false}
         visible={props.visible != null ? props.visible : false}
         transparent={props.transparent != null ? props.transparent : false}
         onRequestClose={() => props.CloseModal}>
         <TouchableWithoutFeedback onPress={props.close}>
            <View style={[styles.styles, props.style]}>
               <View style={[styles.containerstyle, props.containerstyle]}>
                  {
                     props.components
                  }
               </View>
            </View>
         </TouchableWithoutFeedback>
         {props.showloader &&

            <BallIndicator visible={props.showloader} />}

      </Modal>
   );
}
const styles = StyleSheet.create({
   styles: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.transparent,
   },
   containerstyle: {
      alignItems: 'center',
      justifyContent: 'center',
      width: deviceWidth,
      backgroundColor: colors.White,
      borderRadius: 15,
      paddingHorizontal: 20,
      paddingVertical: 20,
      width: deviceWidth

   }
});





import React, { useState } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import { ConstantsText, deviceHeight, deviceWidth } from '../constants'
import { colors } from '../utils/color';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Modal, Platform, } from 'react-native';
import { fonts } from '../utils/font';
export default function ImagePickerView(props) {
   const [Uri, setUri] = useState('');
   const chooseImage = () => {
      ImagePicker.openPicker({
         width: 300,
         height: 400,
         cropping: true,
         includeBase64: true
      })
         .then(image => {
            setUri(image);
            props.CloseModal
            props.onGetURI?.(image);
         })

   };
   const openCamera = () => {
      ImagePicker.openCamera({
         width: 300,
         height: 400,
         cropping: true,
         includeBase64: true

      })
         .then(image => {
            setUri(image);
            props.CloseModal
            props.onGetURI?.(image);
         })

   };
   return (
      <Modal
         animationType={'slide'}
         animated={true}
         visible={props.visible != null ? props.visible : false}
         transparent={props.transparent != null ? props.transparent : false}
         onRequestClose={() => props.CloseModal}
      >
         <TouchableWithoutFeedback onPress={props.CloseModal}>
            <View style={[Platform.OS == 'ios' ? styles.styles : { justifyContent: 'center', flex: 1, alignItems: 'center', backgroundColor: colors.transparent, }, props.style]}>
               <TouchableWithoutFeedback onPress={null}>
                  {Platform.OS == 'ios' ?
                     <View style={[styles.containerstyle, props.containerstyle]} >
                        <View style={[{ width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,239,239,1)', borderRadius: 10 }, props.galleryStyle]}>
                           <TouchableWithoutFeedback onPress={chooseImage} >
                              <View style={[{ width: '100%', marginTop: 10, alignItems: 'center', justifyContent: 'center', height: 48, }, props.galleryStyle]}>
                                 <Text style={[{ fontSize: 16, fontFamily: fonts.rubikRegular, color: colors.Blue }, props.galleryText]}>{ConstantsText.openGallery}</Text>
                              </View>
                           </TouchableWithoutFeedback>
                           <TouchableWithoutFeedback onPress={openCamera}>
                              <View style={[{ width: '100%', marginBottom: 10, alignItems: 'center', justifyContent: 'center', height: 48, borderTopWidth: 1, borderColor: 'lightgray' }, props.cameraStyle]}>
                                 <Text style={[{ fontSize: 16, fontFamily: fonts.rubikRegular, color: colors.Blue }, props.cameraText]}>{ConstantsText.openCamera}</Text>
                              </View>
                           </TouchableWithoutFeedback>
                        </View>
                        <TouchableWithoutFeedback onPress={props.CloseModal}>
                           <View style={[{
                              width: '100%', marginTop: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', height: 48, borderRadius: 10,
                           }, props.cameraStyle]}>
                              <Text style={[{ fontSize: 16, fontFamily: fonts.rubikMedium, color: colors.darkGrey }, props.cancelText]}>{ConstantsText.Cancel}</Text>
                           </View>
                        </TouchableWithoutFeedback>
                     </View>
                     :
                     <View style={[{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: deviceWidth,
                        backgroundColor: colors.White,
                        width: deviceWidth - 30
                     }, props.containerstyle]} >
                        <View style={[{ width: '100%', justifyContent: 'center', marginTop: 20, marginBottom: 50, marginStart: 40 }, props.galleryStyle]}>
                           <Text style={[{ fontSize: 16, fontFamily: fonts.rubikBold, color: colors.Blue }, props.galleryText]}>{ConstantsText.openGalleryTitle}</Text>

                           <TouchableWithoutFeedback onPress={chooseImage} >
                              <View style={[{ marginTop: 10, justifyContent: 'center', height: 40, }, props.galleryStyle]}>
                                 <Text style={[{ fontSize: 16, fontFamily: fonts.rubikRegular, color: colors.Blue }, props.galleryText]}>{ConstantsText.openGallery}</Text>
                              </View>
                           </TouchableWithoutFeedback>
                           <TouchableWithoutFeedback onPress={openCamera}>
                              <View style={[{ justifyContent: 'center', height: 40}, props.cameraStyle]}>
                                 <Text style={[{ fontSize: 16, fontFamily: fonts.rubikRegular, color: colors.Blue }, props.cameraText]}>{ConstantsText.openCamera}</Text>
                              </View>
                           </TouchableWithoutFeedback>
                           <TouchableWithoutFeedback onPress={props.CloseModal}>
                              <View style={[{
                                 position: 'absolute', right: 40,bottom:-30,
                              }, props.cameraStyle]}>
                                 <Text style={[{ fontSize: 16, fontFamily: fonts.rubikMedium, color: colors.darkGrey }, props.cancelText]}>{ConstantsText.Cancel}</Text>
                              </View>
                           </TouchableWithoutFeedback>
                        </View>

                     </View>
                  }
               </TouchableWithoutFeedback>
            </View>
         </TouchableWithoutFeedback>

      </Modal>

   );
}
const styles = StyleSheet.create({
   styles: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: colors.transparent,
   },
   containerstyle: {
      alignItems: 'center',
      justifyContent: 'center',
      width: deviceWidth,
      // backgroundColor:'rgba(239,239,239,0.9)',
      borderRadius: 15,
      height: deviceHeight / 3,
      width: deviceWidth - 30

   }
});




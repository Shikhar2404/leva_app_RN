import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { fonts } from '../utils/font';

export let ToastRef;
class ToastUtil extends Component {
   constructor(props) {
      super(props);
      ToastRef = this;
      this.state = {
         message: "Simple Toast Message",
         showMessageToast: false,
      };
   }

   showToastMessage = (message) => {
      this.setState({ message, showMessageToast: true })
   }

   hideToastMessage = () => {
      this.setState({ showMessageToast: false })
   }

   render() {
      if (this.state.showMessageToast) {
         return (
            <View style={{
               position: "absolute",
               bottom: 50,
               backgroundColor: "rgba(0,0,0,0.8)",
               paddingHorizontal: 20,
               paddingVertical: 15,
               borderRadius: 30,
               alignSelf: "center"
            }}>
               <Text style={{
                  fontSize: 14,
                  color: "white",
                  flex: 1,
                  textAlign: "center",
                  fontFamily: fonts.rubikMedium
               }}>{this.state.message}</Text>
            </View>
         );
      }
      else {
         return null;
      }
   }
}

export default ToastUtil;

export const showToastMessage = (message) => {
   let timeOut = setTimeout(() => {
      ToastRef.hideToastMessage();
      clearTimeout(timeOut)
   }, 3000);
}
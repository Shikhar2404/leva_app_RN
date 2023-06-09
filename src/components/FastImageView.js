import React, {  useState } from 'react';
import { View, StyleSheet,  } from "react-native";
import FastImage from 'react-native-fast-image';
import { importImages } from '../utils/importImages';
export default function FastImageView(props) {
   const [state, setState] = useState({
      loadComplete: true,
   })
   return (
      <View>
         {state.loadComplete && <FastImage source={props.defaultImg ? props.defaultImg : importImages.defaultImg} style={[{ position: 'absolute' }, props.style]} />}
         <FastImage style={props.style} source={props.source} resizeMode={props.resizeMode}
            onError={() => setState(oldState => ({
               ...oldState, loadComplete: false
            }))}
            onLoad={(event) => {
               setState(oldState => ({
                  ...oldState, loadComplete: false
               }))
            }}
         ></FastImage>

      </View>
   );
}
const styles = StyleSheet.create({

});
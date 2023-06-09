import React, { useState,  } from 'react';
import { View, StyleSheet, } from 'react-native';
import { colors } from '../../../utils/color'
import { stylesBackground } from '../../../utils/font'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";

import { WebView } from 'react-native-webview';
import FastImage from 'react-native-fast-image';


export default function WebViewScreen({ route, navigation }) {
  const [state, setState] = useState({
    title: route.params.title,
    url: route.params.url,
    type: route.params.type,

  })
 
  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      <Header
      headerTitle={state.title}
        leftBtnOnPress={() => navigation.goBack()}
        titleStyle={{ color: colors.background }}
      />
      <View style={styles.container}>
  

        <WebView source={state.type == 'url' ? {uri:state.url}: {  html: state.url }} 
          style={{
            backgroundColor: 'transperent'
          }}></WebView>

      </View>
      
    </View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',

  },



});

import React, { useEffect } from 'react';
import Route from './src/navigators/Route'
import SplashScreen from 'react-native-splash-screen'
import 'react-native-gesture-handler'
import { LogBox, Text, TextInput, View, StyleSheet, Platform } from 'react-native';
import StorageService from './src/utils/StorageService';
import AppPlayer from './src/utils/AppPlayer';
import PushNotifications from './src/utils/PushNotification';
import FlashMessage from 'react-native-flash-message';
import { importImages } from './src/utils/importImages';
import FastImage from 'react-native-fast-image';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions'

export default function App(props) {
  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.allowFontScaling = false;
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.allowFontScaling = false;
  useEffect(() => {
    // LogBox.ignoreAllLogs()
    if (Platform.OS == 'android') {
      requestNotificationPermission()
    }
    set_nitializePlayer()
    SplashScreen.hide()
    StorageService.clearArt()
  }, []);
  const set_nitializePlayer = async () => {
    await AppPlayer.initializePlayer();

  }
  const requestNotificationPermission = async () => {
    const res = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    if (res) {
      if (res === RESULTS.GRANTED) {
      } else if (res === RESULTS.DENIED) {
        await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      }
    }
  }
  const renderFlashMessageIcon = (icon = 'success', style = {}, customProps = {}) => {
    switch (icon) {
      case 'appIcon': // casting for your custom icons and render then
        return (
          <FastImage source={importImages.appicon} style={styles.iconStyle} />
        );
      default:
        return renderFlashMessageIcon(icon, style, customProps);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Route />
      <FlashMessage
        style={styles.flashmessage}
        floating={true}
        hideStatusBar={false}
        duration={5000}
        position="top"
        renderFlashMessageIcon={renderFlashMessageIcon}
      />
      <PushNotifications />
    </View>
  );
}
const styles = StyleSheet.create({
  flashmessage: {
    backgroundColor: 'white',
    borderRadius: 20
  },
  iconStyle: {
    height: 30,
    width: 30
  },

})
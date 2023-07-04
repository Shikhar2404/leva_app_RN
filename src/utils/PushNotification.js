import { useEffect } from "react";
import { Platform, AppState,  } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { showMessage } from "react-native-flash-message";

import NavigationService from "../utils/NavigationService";
import StorageService from "../utils/StorageService";
import { colors } from "./color";
import { fonts } from "./font";
import { trackEvent } from "./tracking";

export default function PushNotifications({ route, navigation }) {

  let appState = AppState.currentState;

  const checkPermission = async () => {
    try {
      const hasPermission = await messaging().hasPermission();
      const enabled =
        hasPermission === messaging.AuthorizationStatus.AUTHORIZED
      if (enabled) {
        await getFCMToken(
          enabled
        );
      } else if  (hasPermission === messaging.AuthorizationStatus.DENIED) {
        await getFCMToken(
          hasPermission
        );
        const isPermission = await messaging().requestPermission();
        if (!isPermission) {
          return false;
        } else {
          await getFCMToken(false);
        }
      } 
      else {
        const isPermission = await messaging().requestPermission();
        isPermission ? await getFCMToken(true) : getFCMToken(false)
      }
    } catch (error) {
      console.error("Error in checkPermission", error);
    }
  };

  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);
    /** token refresh in firebase notification */
    messaging().onTokenRefresh(async (fcmToken) => {
      const deviceToken = await Request.getDeviceToken();
      if (deviceToken !== fcmToken) {
        setFCMToken(fcmToken);
      }
    });

    // PushNotification.configure({
    //    // (optional) Called when Token is generated (iOS and Android)
    //    onRegister: function (token) {
    //    },

    //    // (required) Called when a remote is received or opened, or local notification is opened
    //    onNotification: function (notification) {

    //      // process the notification
    //      // (required) Called when a remote is received or opened, or local notification is opened
    //      notification.finish(PushNotificationIOS.FetchResult.NoData);
    //    },

    //    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    //    onAction: function (notification) {
    //      // process the action
    //    },

    //    onRegistrationError: function (err) {
    //      console.error(err.message, err);
    //    },

    //    // IOS ONLY (optional): default: all - Permissions to register.
    //    permissions: {
    //      alert: true,
    //      badge: true,
    //      sound: true,
    //    },

    //    // Should the initial notification be popped automatically
    //    // default: true

    //    popInitialNotification: true,

    //    /**
    //     * (optional) default: true
    //     * - Specified if permissions (ios) and token (android and ios) will requested or not,
    //     * - if not, you must call PushNotificationsHandler.requestPermissions() later
    //     * - if you are not using remote notification or do not have Firebase installed, use this:
    //     *     requestPermissions: Platform.OS === 'ios'
    //     */

    //    requestPermissions: true,
    //  });
    // forground ( when app open ) in firebase notification

    messaging().onMessage(async (remoteMessage) => {
      if (appState == "active") {
        showMessage(
          {
            type: "default",
            message: remoteMessage.notification.title,
            description: remoteMessage.notification.body,
            autoHide: true,
            titleStyle: {
              color: colors.Blue,
              fontSize: 16,
              marginHorizontal: 10,
              fontFamily: fonts.rubikBold,
            },
            textStyle: {
              color: colors.Blue,
              fontSize: 14,
              marginHorizontal: 10,
              fontFamily: fonts.rubikRegular,
            },
            onPress: () => handleNotificationRedirection(remoteMessage),
            type: "success",
            icon: "appIcon",
          },
          () => { }
        );
      }
      // if (Platform.OS === 'android') {
      //    showNotification(response.notification);
      // }
      // else {
      //    PushNotificationIOS.requestPermissions().then(() =>
      //       showNotification(response.notification)
      //    );
      // }
      // if (response) {
      //    handleNotificationRedirection(response)
      // }
    });

    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage) {
        handleNotificationRedirection(remoteMessage);
      }
    });

    // executes when application is in background state.
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      // if (remoteMessage) {
      // handleNotificationRedirection(remoteMessage)
      // }
    });

    //If your app is closed
    messaging()
      .getInitialNotification()
      .then((notificationOpen) => {
        if (notificationOpen) {
          handleNotificationRedirection(notificationOpen);
        }
      });
    checkForIOS();
    checkPermission();
    return () => {
      removeAllNotificationListners();
    };

  }, []);

  // const showNotification = (notification) => {
  //    PushNotification.localNotification({
  //       title: notification.title,
  //       message: notification.body,
  //       // autoCancel: false,
  //       // timeoutAfter:30000,
  //       channelId: 'fcm_fallback_notification_channel',
  //       invokeApp: true,
  //       onOpen: () => { },
  //    });
  // };
  /**
   *
   * @param {*} notification
   * @param {*} isFromKilledApp
   * Handling notification tap and redireaction
  */
  const handleNotificationRedirection = async (notification) => {
    if (notification.data.type == "1") {
      setTimeout(() => {
        NavigationService.replaceactionNotification("NotificationListScreen");
      }, 500);
    } else if (notification.data.type == "2") {
      setTimeout(() => {
        NavigationService.replaceactionNotification("ArticlesDetailesScreen", {
          id: notification.data.article_id,
        });
      }, 500);
    } else if (notification.data.type == "4") {
      await StorageService.saveItem("child_id", notification.data.fk_child_id);
      setTimeout(() => {
        NavigationService.navigatewithparamNotification("ChildProfileScreen");
      }, 500);
    } else if (notification.data.type == "5") {
      setTimeout(() => {
        NavigationService.replaceactionNotification(
          "MeditationDetailesScreen",
          {
            meditationsData: [],
            index: -1,
            isNotification: notification.data.meditation_id,
          }
        );
      }, 600);
    } else if (notification.data.type == "6") {
      setTimeout(() => {
        NavigationService.replaceactionNotification("VideoDetailesScreen", {
          id: notification.data.video_id,
        });
      }, 500);
    } else if (notification.data.type == "7") {
      setTimeout(() => {
        NavigationService.replaceactionModal("NursingScreen");
      }, 500);
    } else if (notification.data.type == "8") {
      setTimeout(() => {
        NavigationService.replaceactionModal("PumpingScreen");
      }, 500);
    } else if (notification.data.type == "9") {
      setTimeout(() => {
        NavigationService.replaceactionModal("DiaperScreen");
      }, 500);
    } else if (notification.data.type == "10") {
      setTimeout(() => {
        NavigationService.replaceactionModal("BottleScreen");
      }, 500);
    } else if (notification.data.type == "11") {
      setTimeout(() => {
        NavigationService.navigatewithparamNotification("ChildProfileScreen");
      }, 500);
    } else if (notification.data.type == "14") {
      setTimeout(() => {
        NavigationService.navigatewithparamNotification1("TotalGrowthScreen", {
          child_id: "",
        });
      }, 500);
    }
  };

  const getFCMToken = async (props) => {
    try {
      const token = await messaging().getToken();
      if (token) {
        setFCMToken(token);
      }
    } catch (error) {
      console.log(error, "errr")
    }
    finally {
      if (props || props === 1) {
        const trackEventparam = { action: "Notification_Permission_Granted" };
        trackEvent({
          event: "Notification_Permission_Granted",
          trackEventparam,
        });
      }
      else {
        const trackEventparamDenied = { action: "Notification_Permission_Denied" };
        trackEvent({
          event: "Notification_Permission_Denied",
          trackEventparamDenied,
        });
      };
    
    }

  }
  /**check config for iOS platform */
  const checkForIOS = async () => {
    if (Platform.OS == "ios") {
      await messaging().registerDeviceForRemoteMessages();
      await messaging().setAutoInitEnabled(true);
    }
  };

  /**handle app state change  */
  const _handleAppStateChange = (nextAppState) => {
    if (appState.match(/inactive|background/) && nextAppState === "active") {
    }
    appState = nextAppState;
  };

  /**gets the fcm token */

  /**check the notification permission */



  /**set the fcm token */
  const setFCMToken = async (fcmToken) => {
    await StorageService.saveItem(
      StorageService.STORAGE_KEYS.DEVICE_TOKEN,
      fcmToken
    );
  };

  /**request notification permission */
  const requestUserPermission = async () => {
    const settings = await messaging().requestPermission({
      provisional: false,
    });
    if (settings) {
      return settings;
    }
  };

  /**remove notification all listeners */
  const removeAllNotificationListners = () => {
    AppState.removeEventListener("change", _handleAppStateChange);
  };

  /**componet render method */
  return null;
}


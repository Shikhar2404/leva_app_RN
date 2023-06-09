import React, { useState } from "react";
import { Platform, StatusBar, View, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { importImages } from "../utils/importImages";
import { colors } from "../utils/color";
import NavigationService from "../utils/NavigationService";
import { hasNotch } from "react-native-device-info";

//auth
import WalkThroughScreen from "../screens/Auth/WalkThroughScreen";
import SignInScreen from "../screens/Auth/SignInScreen";
import SignUpScreen from "../screens/Auth/SignUpScreen";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import CheckyourEmailScreen from "../screens/Auth/CheckyourEmailScreen";
import CheckyourResetPassEmailScreen from "../screens/Auth/CheckyourResetPassEmailScreen";

// setup profile
import PickYourInterestsScreen from "../screens/SetProfile/PickYourInterestsScreen";
import MotherInformationScreen from "../screens/SetProfile/MotherInformationScreen";
import ChildInformationScreen from "../screens/SetProfile/ChildInformationScreen";
import MoreAboutYourChildScreen from "../screens/SetProfile/MoreAboutYourChildScreen";

//DrawerNavigationScreens
import FavoritesScreen from "../screens/DrawerNavigationScreens/Favorites/FavoritesScreen";
import MyAppoinmentsScreen from "../screens/DrawerNavigationScreens/MyAppoinments/MyAppoinmentsScreen";
import AppoinmentsListScreen from "../screens/DrawerNavigationScreens/MyAppoinments/AppoinmentsListScreen";
import AppoinmentsDetailsScreen from "../screens/DrawerNavigationScreens/MyAppoinments/AppoinmentsDetailsScreen";
import EditAppointmentScreen from "../screens/DrawerNavigationScreens/MyAppoinments/EditAppointmentScreen";

import AddBabyScreen from "../screens/DrawerNavigationScreens/AddBaby/AddBabyScreen";
import SettingHelpScreen from "../screens/DrawerNavigationScreens/SettingAndHelp/SettingHelpScreen";

//tabbarNavigationScreens
//Main screens
import HomeScreen from "../screens/TabNavigationScreens/HomeScreen/HomeScreen";
import MeditationScreen from "../screens/TabNavigationScreens/Meditation/MeditationScreen";
import StatsandchartsScreen from "../screens/TabNavigationScreens/Statsandcharts/StatsandchartsScreen";
import YourConsultantScreen from "../screens/TabNavigationScreens/YourConsultant/YourConsultantScreen";
import BookConsultantScreen from "../screens/TabNavigationScreens/YourConsultant/BookConsultantScreen";
import AboutConsultantScreen from "../screens/TabNavigationScreens/YourConsultant/AboutConsultantScreen";

import ArticlesScreen from "../screens/TabNavigationScreens/Articles/ArticlesScreen";
import DrawerDesign from "../screens/DrawerNavigationScreens/DrawerDesign";
import { trackEvent } from "../utils/tracking";

//StatsandchartsScreens
import TotalNursingScreen from "../screens/TabNavigationScreens/Statsandcharts/TotalNursingScreen";
import TotalPumpedScreen from "../screens/TabNavigationScreens/Statsandcharts/TotalPumpedScreen";
import RecentAllNursingScreen from "../screens/TabNavigationScreens/Statsandcharts/RecentAllNursingScreen";
import RecentAllPumpedScreen from "../screens/TabNavigationScreens/Statsandcharts/RecentAllPumpedScreen";
import EditNursingScreen from "../screens/TabNavigationScreens/Statsandcharts/EditNursingScreen";
import EditPumpingScreen from "../screens/TabNavigationScreens/Statsandcharts/EditPumpingScreen";
import TotalBottlesScreen from "../screens/TabNavigationScreens/Statsandcharts/TotalBottlesScreen";
import TotalDiaperScreen from "../screens/TabNavigationScreens/Statsandcharts/TotalDiaperScreen";
import RecentAllBottlesScreen from "../screens/TabNavigationScreens/Statsandcharts/RecentAllBottlesScreen";
import RecentAllDiaperScreen from "../screens/TabNavigationScreens/Statsandcharts/RecentAllDiaperScreen";
import EditDiaperScreen from "../screens/TabNavigationScreens/Statsandcharts/EditDiaperScreen";
import EditBottleScreen from "../screens/TabNavigationScreens/Statsandcharts/EditBottleScreen";
import TotalGrowthScreen from "../screens/TabNavigationScreens/Statsandcharts/TotalGrowthScreen";
import RecentAllGrowthScreen from "../screens/TabNavigationScreens/Statsandcharts/RecentAllGrowthScreen";
import ListGrowthSelectionScreen from "../screens/TabNavigationScreens/Statsandcharts/ListGrowthSelectionScreen";
import EditGrowthScreen from "../screens/TabNavigationScreens/Statsandcharts/EditGrowthScreen";
import AddGrowthScreen from "../screens/TabNavigationScreens/Statsandcharts/AddGrowthScreen";

//Sub screens
import ArticlesDetailesScreen from "../screens/TabNavigationScreens/Articles/ArticlesDetailesScreen";
import MeditationDetailesScreen from "../screens/TabNavigationScreens/Meditation/MeditationDetailesScreen";
import VideoScreen from "../screens/TabNavigationScreens/Meditation/VideoScreen";
import VideoDetailesScreen from "../screens/TabNavigationScreens/Meditation/VideoDetailesScreen";

import NursingScreen from "../screens/TabNavigationScreens/HomeScreen/NursingScreen";
import PumpingScreen from "../screens/TabNavigationScreens/HomeScreen/PumpingScreen";
import BottleScreen from "../screens/TabNavigationScreens/HomeScreen/BottleScreen";
import DiaperScreen from "../screens/TabNavigationScreens/HomeScreen/DiaperScreen";

//editePtofile for mother
import EditProfileScreen from "../screens/DrawerNavigationScreens/EditProfile/EditProfileScreen";
import MomDetailsScreen from "../screens/DrawerNavigationScreens/EditProfile/MomDetailsScreen";

//EditProfileScreens
import ChildProfileScreen from "../screens/DrawerNavigationScreens/BabyProfile/ChildProfileScreen";
import EditChildProfileScreen from "../screens/DrawerNavigationScreens/BabyProfile/EditChildProfileScreen";
import TheFirstYearScreen from "../screens/DrawerNavigationScreens/BabyProfile/TheFirstYearScreen";

//setting
import ChangePasswordScreen from "../screens/DrawerNavigationScreens/SettingAndHelp/ChangePasswordScreen";
import ContactUsScreen from "../screens/DrawerNavigationScreens/SettingAndHelp/ContactUsScreen";
import NotificationScreen from "../screens/DrawerNavigationScreens/SettingAndHelp/NotificationScreen";
import WebViewScreen from "../screens/DrawerNavigationScreens/SettingAndHelp/WebViewScreen";

import NotificationListScreen from "../screens/DrawerNavigationScreens/Notifications/NotificationListScreen";
import SubscriptionScreen from "../screens/DrawerNavigationScreens/Notifications/SubscriptionScreen";

import Heap from "@heap/react-native-heap";

import StorageService from "../utils/StorageService";
import FastImage from "react-native-fast-image";
import AppPlayer from "../utils/AppPlayer";
import TrackPlayer, { State } from "react-native-track-player";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

let rname = "";
const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={"WalkThrSignInScreenoughScreen"}
      screenOptions={{}}
    >
      <Stack.Screen
        name={"WalkThrSignInScreenoughScreen"}
        component={WalkThroughScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"SignInScreen"}
        component={SignInScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"SignUpScreen"}
        component={SignUpScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"ResetPasswordScreen"}
        component={ResetPasswordScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"CheckyourEmailScreen"}
        component={CheckyourEmailScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"CheckyourResetPassEmailScreen"}
        component={CheckyourResetPassEmailScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />

      <Stack.Screen
        name={"PickYourInterestsScreen"}
        component={PickYourInterestsScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"MotherInformationScreen"}
        component={MotherInformationScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"ChildInformationScreen"}
        component={ChildInformationScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"MoreAboutYourChildScreen"}
        component={MoreAboutYourChildScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"EditProfileScreen"}
        component={EditProfileScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />

      <Stack.Screen
        name={"EditChildProfileScreen"}
        component={EditChildProfileScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"TheFirstYearScreen"}
        component={TheFirstYearScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />

      <Stack.Screen
        name={"DrawerNavigation"}
        component={DrawerNavigation}
        options={{ headerShown: false, orientation: "portrait" }}
      />

      <Stack.Screen
        name={"ArticlesDetailesScreen"}
        component={ArticlesDetailesScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"MeditationDetailesScreen"}
        component={MeditationDetailesScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"VideoScreen"}
        component={VideoScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"VideoDetailesScreen"}
        component={VideoDetailesScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />

      <Stack.Screen
        name={"TotalNursingScreen"}
        component={TotalNursingScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"TotalPumpedScreen"}
        component={TotalPumpedScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"RecentAllNursingScreen"}
        component={RecentAllNursingScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"RecentAllPumpedScreen"}
        component={RecentAllPumpedScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"EditNursingScreen"}
        component={EditNursingScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"EditPumpingScreen"}
        component={EditPumpingScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"EditDiaperScreen"}
        component={EditDiaperScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"EditBottleScreen"}
        component={EditBottleScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />

      <Stack.Screen
        name={"TotalBottlesScreen"}
        component={TotalBottlesScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"TotalGrowthScreen"}
        component={TotalGrowthScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"TotalDiaperScreen"}
        component={TotalDiaperScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"RecentAllBottlesScreen"}
        component={RecentAllBottlesScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"RecentAllDiaperScreen"}
        component={RecentAllDiaperScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"RecentAllGrowthScreen"}
        component={RecentAllGrowthScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"ListGrowthSelectionScreen"}
        component={ListGrowthSelectionScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"EditGrowthScreen"}
        component={EditGrowthScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"AddGrowthScreen"}
        component={AddGrowthScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />

      <Stack.Screen
        name={"ChangePasswordScreen"}
        component={ChangePasswordScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"ContactUsScreen"}
        component={ContactUsScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"NotificationScreen"}
        component={NotificationScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"WebViewScreen"}
        component={WebViewScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"BookConsultantScreen"}
        component={BookConsultantScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"AboutConsultantScreen"}
        component={AboutConsultantScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />

      <Stack.Screen
        name={"AppoinmentsListScreen"}
        component={AppoinmentsListScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"AppoinmentsDetailsScreen"}
        component={AppoinmentsDetailsScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"EditAppointmentScreen"}
        component={EditAppointmentScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Stack.Screen
        name={"SubscriptionScreen"}
        component={SubscriptionScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "card",
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen
        name={"NursingScreen"}
        component={NursingScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"PumpingScreen"}
        component={PumpingScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"BottleScreen"}
        component={BottleScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"DiaperScreen"}
        component={DiaperScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"SubscriptionScreen1"}
        component={SubscriptionScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />

      <Stack.Screen
        name={"WebViewScreen1"}
        component={WebViewScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"EditNursingScreen1"}
        component={EditNursingScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"EditPumpingScreen1"}
        component={EditPumpingScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"EditDiaperScreen1"}
        component={EditDiaperScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"EditBottleScreen1"}
        component={EditBottleScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"RecentAllNursingScreen1"}
        component={RecentAllNursingScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"RecentAllPumpedScreen1"}
        component={RecentAllPumpedScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"RecentAllBottlesScreen1"}
        component={RecentAllBottlesScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name={"RecentAllDiaperScreen1"}
        component={RecentAllDiaperScreen}
        options={{
          headerShown: false,
          orientation: "portrait",
          presentation: "containedTransparentModal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
};
const TabNavigator = (props) => {
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      initialRouteParams={{ type: "1" }}
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "ArticlesScreen") {
            iconName = focused
              ? importImages.activeArticles
              : importImages.inActiveArticles;
          } else if (route.name === "MeditationScreen") {
            iconName = focused
              ? importImages.activeMeditation
              : importImages.inActiveMeditation;
          } else if (route.name === "HomeScreen") {
            iconName = focused
              ? importImages.activeHome
              : importImages.inActiveHome;
          } else if (route.name === "YourConsultantScreen") {
            iconName = focused
              ? importImages.activeFindConsultant
              : importImages.inActiveFindConsultant;
          } else if (route.name === "StatsandchartsScreen") {
            iconName = focused
              ? importImages.activeStatsAndCharts
              : importImages.inActiveStatsAndCharts;
          }
          return (
            <FastImage source={iconName} style={{ height: 43, width: 43 }} />
          );
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.Blue,
          borderRadius: 20,
          height: 81,
          bottom: Platform.OS === "ios" ? (hasNotch() ? 34 : 17) : 17,
          position: "absolute",
          left: 20,
          right: 20,
        },
      })}
    >
      <Tab.Screen
        name={"ArticlesScreen"}
        component={ArticlesScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Tab.Screen
        name={"MeditationScreen"}
        component={MeditationScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Tab.Screen
        name={"HomeScreen"}
        component={HomeScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Tab.Screen
        name={"YourConsultantScreen"}
        component={YourConsultantScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Tab.Screen
        name={"StatsandchartsScreen"}
        component={StatsandchartsScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
    </Tab.Navigator>
  );
};

const DrawerNavigation = (props) => {
  return (
    <Drawer.Navigator
      initialRouteName="HomeScreen"
      defaultStatus="closed"
      drawerContent={(props) => <DrawerDesign {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.lightPink,
        },
        drawerType: "front",
        swipeEnabled: true,
        gestureHandlerProps: true,
      }}
    >
      <Drawer.Screen
        name={"HomeScreen"}
        component={TabNavigator}
        options={{ headerShown: false, orientation: "portrait" }}
      ></Drawer.Screen>
      <Drawer.Screen
        name={"MomDetailsScreen"}
        component={MomDetailsScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      ></Drawer.Screen>
      <Drawer.Screen
        name={"FavoritesScreen"}
        component={FavoritesScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      ></Drawer.Screen>
      <Drawer.Screen
        name={"MyAppoinmentsScreen"}
        component={MyAppoinmentsScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      ></Drawer.Screen>
      <Drawer.Screen
        name={"ChildProfileScreen"}
        component={ChildProfileScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      ></Drawer.Screen>
      <Drawer.Screen
        name={"AddBabyScreen"}
        component={AddBabyScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      ></Drawer.Screen>
      <Drawer.Screen
        name={"NotificationListScreen"}
        component={NotificationListScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
      <Drawer.Screen
        name={"SettingHelpScreen"}
        component={SettingHelpScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      ></Drawer.Screen>
      <Stack.Screen
        name={"WebViewScreen"}
        component={WebViewScreen}
        options={{ headerShown: false, orientation: "portrait" }}
      />
    </Drawer.Navigator>
  );
};

export default function Route(props) {
  const [isShow, setisShow] = useState(false);
  const [isShowMeditation, setisShowMeditation] = useState(false);
  const [nameroute, setnameroute] = useState("");

  const HandlerFloatButtonView = async (routename) => {
    if (
      routename != "MeditationDetailesScreen" &&
      routename != "NursingScreen" &&
      routename != "PumpingScreen"
    ) {
      await AppPlayer.initializePlayer();
      let index = await TrackPlayer.getCurrentTrack();
      if (index != null) {
        const status = await TrackPlayer.getState();
        if (status === State.Playing) {
          rname = "MeditationDetailesScreen";
          setisShowMeditation(true);
        } else {
          setisShowMeditation(false);
        }
      } else {
        setisShowMeditation(false);
      }
    } else {
      setisShowMeditation(false);
    }
    if (routename != "NursingScreen" && routename != "PumpingScreen") {
      var left = await StorageService.getItem("nursinglefttime");
      var right = await StorageService.getItem("nursingrighttime");
      var ptime = await StorageService.getItem("pumpingtime");
      if (left != null || right != null || ptime != null) {
        left = left != null ? left : { status: false };
        right = right != null ? right : { status: false };
        ptime = ptime != null ? ptime : { status: false };
        if (left.status || right.status || ptime.status) {
          if (ptime.status) {
            rname = "PumpingScreen";
          } else {
            rname = "NursingScreen";
          }
          setisShow(true);
        } else {
          setisShow(false);
        }
      } else {
        setisShow(false);
      }
    } else {
      setisShow(false);
    }
  };
  const goClickNavigation = async () => {
    if (isShow) {
      NavigationService.navigatewithparam(rname, { child_id: "" });
    } else {
      let index = await TrackPlayer.getCurrentTrack();
      var data = await TrackPlayer.getTrack(index);
      NavigationService.navigatewithparamNotification(
        "MeditationDetailesScreen",
        { meditationsData: [], index: -1, isNotification: data.id }
      );
    }
  };
  const FloatButton = () => {
    let isBottomSpace =
      nameroute === "FavoritesScreen" ||
      nameroute === "SettingHelpScreen" ||
      nameroute === "NotificationScreen"
        ? true
        : false;
    return (
      <View
        style={{
          borderRadius: 100 / 2,
          height: 100,
          width: 100,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: isBottomSpace
            ? 20
            : Platform.OS === "ios"
            ? hasNotch()
              ? 60
              : 40
            : 40,
          position: "absolute",
          bottom: isBottomSpace ? 0 : 40,
          right: 0,
        }}
      >
        <TouchableOpacity
          style={{
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => goClickNavigation()}
        >
          <View
            style={{
              borderRadius: 50 / 2,
              height: 50,
              width: 50,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FastImage
              source={
                isShow
                  ? rname == "PumpingScreen"
                    ? importImages.TimerPumpingicon
                    : importImages.TimerNursingicon
                  : importImages.TimerMeditation
              }
              style={{
                height: 62,
                borderRadius: 62 / 2,
                width: 62,
              }}
              resizeMode={"cover"}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const HeapNavigationContainer =
    Heap.withReactNavigationAutotrack(NavigationContainer);
  let navigationContainerRef = null; // You can also use a regular ref with `React.useRef()`
  return (
    <NavigationContainer
      independent={true}
      onStateChange={() => {
        var trackEventparam = {
          action: navigationContainerRef.getCurrentRoute().name,
        };
        setnameroute(navigationContainerRef.getCurrentRoute().name);
        HandlerFloatButtonView(navigationContainerRef.getCurrentRoute().name);
        trackEvent({ event: "Screen_Name", trackEventparam });
      }}
      ref={(navigator) => {
        NavigationService.setTopLevelNavigator(navigator),
          (navigationContainerRef = navigator);
      }}
    >
      {Platform.OS === "ios" ? (
        <StatusBar translucent barStyle={"dark-content"}></StatusBar>
      ) : null}
      <StackNavigator />
      {isShow || isShowMeditation ? <FloatButton /> : null}
    </NavigationContainer>
  );
}

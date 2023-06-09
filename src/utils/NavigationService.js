import { CommonActions, StackActions } from '@react-navigation/native';
import StorageService from './StorageService';

let _navigator;

export let globalNavRef;
/**
 * 
 * @param {*} navigatorRef 
 * set the navigator ref to local ref from NavigationRoot file
 */
function setTopLevelNavigator(navigatorRef) {
   _navigator = navigatorRef;
   globalNavRef = navigatorRef;
};

/**
 * 
 * @returns the navigator 
 */
function getGlobalNavigator() {
   return globalNavRef;
}

/**
 * 
 * @param {*} routeName 
 * @param {*} params 
 * provide navigation to given routename
 */
function replaceaction(routeName, param) {
   const currentRoute = getCurrentRoute(getState());
   let name = currentRoute ? currentRoute.name : '';
   if (name === routeName) {
      _navigator.dispatch(
         StackActions.replace(routeName, param)
      );
   }
   else {
      _navigator.navigate(
         routeName, param
      )
   }

};
function replaceactionNotification(routeName, param) {
   const currentRoute = getCurrentRoute(getState());
   let name = currentRoute ? currentRoute.name : '';
   if (name == 'NursingScreen' || name == 'PumpingScreen' || name == 'DiaperScreen' || name == 'BottleScreen') {
      _navigator.navigate(
         'HomeScreen',
      )
   }
   if (name === routeName) {
      _navigator.dispatch(
         StackActions.replace(routeName, param)
      );
   }
   else {
      _navigator.navigate(
         routeName, param
      )
   }

};
function replaceactionModal(routeName, param) {
   const currentRoute = getCurrentRoute(getState());
   let name = currentRoute ? currentRoute.name : '';
   StorageService.getItem('childbate').then(bdate => {
      if (name != routeName) {
         _navigator.navigate(
            'HomeScreen',
         )
         if (bdate) {
            _navigator.navigate(
               routeName, param
            )
         }

      }
   }).catch(e => { })
};
function navigatewithparam(routeName, param) {
   _navigator.navigate(
      routeName, param
   )
};

function navigatewithparamNotification(routeName, param) {
   const currentRoute = getCurrentRoute(getState());
   let name = currentRoute ? currentRoute.name : '';
   if (name == 'NursingScreen' || name == 'PumpingScreen' || name == 'DiaperScreen' || name == 'BottleScreen') {
      _navigator.navigate(
         'HomeScreen',
      )
   }
   _navigator.navigate(
      routeName, param
   )
};
function navigatewithparamNotification1(routeName, param) {
   const currentRoute = getCurrentRoute(getState());
   let name = currentRoute ? currentRoute.name : '';
   if (name == 'NursingScreen' || name == 'PumpingScreen' || name == 'DiaperScreen' || name == 'BottleScreen') {
      _navigator.navigate(
         'HomeScreen',
      )
   }
   StorageService.getItem('childbate').then(bdate => {
      if (bdate) {
         _navigator.navigate(
            routeName, param
         )
      }
   }).catch(e => { })
};
/**
 * 
 * @returns navigation state
 */
function getState() {
   return _navigator.getState();
};

/**
 * 
 * @param {*} navigationState 
 * @returns get current route name
 */
function getCurrentRoute(navigationState) {
   const route = navigationState ? navigationState.routes[navigationState.index] : undefined;
   // dive into nested navigators
   if (route) {
      if (route.routes) {
         return getCurrentRoute(route);
      }
   }
   return route;
};

/**
 * 
 * @param {*} params 
 * sets the custom params to route navigation
 */
function setParams(params, name) {
   const currentRoute = getCurrentRoute(getState());
   let { key } = currentRoute;
   _navigator.dispatch(
      CommonActions.setParams({
         key,
         params,
      })
   );
};

/** goback method */
function goBack() {
   _navigator.dispatch(
      CommonActions.back({})
   );
};
// add other navigation functions that you need and export them

/**
 * navigation popToTop method
 */
function popToTop() {
   _navigator.dispatch(StackActions.popToTop());
}

/** stack reset action method */
function resetAction(routeName, params, index = 0) {
   _navigator.dispatch(
      CommonActions.reset({
         routes: [{ name: routeName, params }]
      })
   );
}

/**
 * 
 * @param {*} mainTabRouteName 
 * @param {*} nextScreenName 
 * @param {*} params 
 * stack reset handling
 */
function stackReset(mainTabRouteName, nextScreenName, params) {
   const resetAction = CommonActions.reset({
      key: '',
      index: 0,
      routeNames: [mainTabRouteName]
   })
   _navigator.dispatch(resetAction)
   const screenActions = CommonActions.navigate({
      routeName: nextScreenName,
      params: params
   })
   _navigator.dispatch(screenActions)
}


/**
 * Navigation Service Facility for provide different Kind of routing
 */
export default {
   goBack,
   getState,
   setParams,
   replaceaction,
   replaceactionModal,
   replaceactionNotification,
   navigatewithparamNotification,
   navigatewithparamNotification1,
   popToTop,
   resetAction,
   getCurrentRoute,
   setTopLevelNavigator,
   stackReset,
   getGlobalNavigator,
   navigatewithparam
};
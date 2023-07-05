import apiConfigs from "./apiConfig";
import StorageService from "../utils/StorageService";
import showSimpleAlert from "../utils/showSimpleAlert";
import { Alert, Linking, Platform } from "react-native";
import { ConstantsText } from "../constants";
import NetInfo from "@react-native-community/netinfo";
import NavigationService from "../utils/NavigationService";
import * as RNLocalize from "react-native-localize";
import { trackEvent } from "../utils/tracking";
import DeviceInfo from "react-native-device-info";

/**
 * Header for Api calls
 */

const getHeaders = async () => ({
  Accept: "*/*",
  "Content-Type": "application/json",
  language: "en",
  device_id: await getDeviceToken(),
  device_type: Platform.OS === "android" ? "1" : "2",
  os: Platform.OS === "android" ? "android" : "ios",
  app_version: DeviceInfo.getVersion(),
  Authorization: await getToken(),
  timezone: RNLocalize.getTimeZone(),
});
const getHeadersimg = async () =>
  new Headers({
    Accept: "*/*",
    "Content-Type": "multipart/form-data",
    language: "en",
    device_id: await getDeviceToken(),
    device_type: Platform.OS === "android" ? "1" : "2",
    os: Platform.OS === "android" ? "android" : "ios",
    app_version: DeviceInfo.getVersion(),
    Authorization: await getToken(),
    timezone: RNLocalize.getTimeZone(),
  });
/**Gets the User Auth token */
export const getToken = async () => {
  const authToken = await StorageService.getItem(
    StorageService.STORAGE_KEYS.AUTH_TOKEN
  );
  if (authToken) {
    return "Bearer " + authToken;
  } else {
    return "@#Slsjpoq$S1o08#MnbAiB%UVUV&Y*5EU@exS1o!08L9TSlsjpo#FKDFJSDLFJSDLFJSDLFJSDQY";
    // default_auth_token
  }
};

/**Sets the User Auth token */
const setToken = async (token) => {
  return await StorageService.saveItem(
    StorageService.STORAGE_KEYS.AUTH_TOKEN,
    token
  );
};

/**Get the device token */
const getDeviceToken = async () => {
  const deviceToken = await StorageService.getItem(
    StorageService.STORAGE_KEYS.DEVICE_TOKEN
  );
  return deviceToken;
};
/**
 * Check Internet Connectivity Status
 */
export const checkNetInfo = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

/**
 *
 * @param {*} promise
 * Time Out method
 */
const timeOut = (promise) => {
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(() => {
      reject({
        message: "timeoutMessage",
        status: apiConfigs.TIMEOUT,
        timerId,
      });
    }, 120 * 1000);
    promise.then(resolve, reject);
  });
};

/**action for update user auth token */
const updateAuthToken = async (endpoint, params) => {
  const result = await Request.post("user/refresh-token");
  await setToken(result.data.token);
  return await buildRequest(endpoint, params);
};
const updateAuthTokenImg = async (endpoint, params) => {
  const result = await Request.post("user/refresh-token");
  await setToken(result.data.token);
  return await buildRequestImg(endpoint, params);
};

/**
 *
 * @param {*} endpoint
 * @param {*} params
 * @param {*} options
 * Application related  Api request will be perform(Call) from here
 */
const buildRequest = async (endpoint, params = {}, options = undefined) => {
  if ((await checkNetInfo()) != false) {
    try {
      const headers = await getHeaders();
      console.log("%c REQUEST::", "background: #222; color: #bada55", {
        url: `${apiConfigs.SERVER_API_URL}${endpoint}`,
        headers,
        ...params,
      });
      const response = await timeOut(
        fetch(`${apiConfigs.SERVER_API_URL}${endpoint}`, {
          headers,
          ...params,
        })
      );
      const result = await response.json();
      await timeOut(
        fetch(`${apiConfigs.SERVER_API_URL}${"user/update-last-active"}`, {
          headers,
          method: "POST",
        })
      );
      console.log("%c RESPONSE22::", "background: gray; color: white", result);
      return checkValidatinoResponse(result, endpoint, params);
    } catch (error) {
      console.log("Error----->", error);
      if (error) {
        if (error.status == apiConfigs.TIMEOUT) {
          showSimpleAlert(ConstantsText.requestTimeoutMessage);
          clearTimeout(error.timerId);
          return false;
        } else {
          /**
           * Handle Unexpected errors
           */
          const trackEventparam = { action: ConstantsText.somethingWrongText };
          trackEvent({ event: "Errors", trackEventparam });
          showSimpleAlert(ConstantsText.somethingWrongText);
          return false;
        }
      }
    }
  } else {
    const trackEventparam = { action: ConstantsText.noNetworkAlert };
    trackEvent({ event: "Errors", trackEventparam });
    showSimpleAlert(ConstantsText.noNetworkAlert);
  }
};

const buildRequestImg = async (endpoint, params = {}, options = undefined) => {
  if ((await checkNetInfo()) != false) {
    try {
      const headers = await getHeadersimg();
      console.log("%c REQUEST::", "background: #222; color: #bada55", {
        url: `${apiConfigs.SERVER_API_URL}${endpoint}`,
        headers,
        ...params,
      });
      const response = await timeOut(
        fetch(`${apiConfigs.SERVER_API_URL}${endpoint}`, {
          headers,
          ...params,
        })
      );
      const result = await response.json();
      await timeOut(
        fetch(`${apiConfigs.SERVER_API_URL}${"user/update-last-active"}`, {
          headers,
          method: "POST",
        })
      );
      console.log("%c RESPONSE22::", "background: gray; color: white", result);
      return checkValidatinoResponseImg(result, endpoint, params);
    } catch (error) {
      console.log("Error----->", error.message);
      if (error) {
        if (error.status == apiConfigs.TIMEOUT) {
          showSimpleAlert(ConstantsText.requestTimeoutMessage);
          clearTimeout(error.timerId);
          return false;
        } else if (error.message === "Network request failed") {
          return await buildRequestImg(endpoint, params);
        } else {
          /**
           * Handle Unexpected errors
           */
          const trackEventparam = { action: ConstantsText.somethingWrongText };
          trackEvent({ event: "Errors", trackEventparam });
          showSimpleAlert(ConstantsText.somethingWrongText);
          return false;
        }
      }
    }
  } else {
    const trackEventparam = { action: ConstantsText.noNetworkAlert };
    trackEvent({ event: "Errors", trackEventparam });
    showSimpleAlert(ConstantsText.noNetworkAlert);
  }
};

/**
 * Fires only when an api caught the lower apllication version.
 * @returns {Promise<{status:string,message:null}>}
 */
const handleLowerAppVersion = async (message) => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      ConstantsText.appName,
      message,
      [
        {
          text: "Ok",
          onPress: async () => {
            const STORE_URL =
              Platform.OS === "android"
                ? apiConfigs.appVersionAndroid
                : apiConfigs.appVersionIOS;

            Linking.openURL(STORE_URL).catch((err) =>
              console.error("An error occurred", err)
            );
          },
        },
      ],
      { cancelable: false }
    );
    resolve(false);
  });
};

/**
 *
 * @param {*} response
 * check validation of response return values
 */
const checkValidatinoResponse = async (response, endpoint, params) => {
  const result = response;

  /**
   * 500 Server Error
   */
  if (result.code == 500 || result.code == 400) {
    const trackEventparam = { action: result.message };
    trackEvent({ event: "Errors", trackEventparam });
    showSimpleAlert(result.message);
    return false;
  }
  /**
   * 102 Token Expire Error
   */
  if (result.code == apiConfigs.TOKEN_EXPIRED) {
    return await updateAuthToken(endpoint, params);
  }

  if (
    result.code == apiConfigs.INVALID_TOKEN ||
    result.code == apiConfigs.USER_DELETED ||
    result.code == apiConfigs.USER_BLOCKED
  ) {
    if (
      result.code == apiConfigs.USER_DELETED ||
      result.code == apiConfigs.USER_BLOCKED
    ) {
      const trackEventparam = { action: result.message };
      trackEvent({ event: "Errors", trackEventparam });
      showSimpleAlert(result.message);
    }
    return await Logout();
  }
  /**
   * Handle lower app version for Update App.
   */
  if (result.code == apiConfigs.INVALID_APP_VERSION) {
    const trackEventparam = { action: result.message };
    trackEvent({ event: "Errors", trackEventparam });
    return await handleLowerAppVersion(result.message);
  }

  return result;
};

const checkValidatinoResponseImg = async (response, endpoint, params) => {
  const result = response;

  /**
   * 500 Server Error
   */
  if (result.code == 500 || result.code == 400) {
    const trackEventparam = { action: result.message };
    trackEvent({ event: "Errors", trackEventparam });
    showSimpleAlert(result.message);
    return false;
  }
  /**
   * 102 Token Expire Error
   */
  if (result.code == apiConfigs.TOKEN_EXPIRED) {
    return await updateAuthTokenImg(endpoint, params);
  }

  if (
    result.code == apiConfigs.INVALID_TOKEN ||
    result.code == apiConfigs.USER_DELETED ||
    result.code == apiConfigs.USER_BLOCKED
  ) {
    if (
      result.code == apiConfigs.USER_DELETED ||
      result.code == apiConfigs.USER_BLOCKED
    ) {
      const trackEventparam = { action: result.message };
      trackEvent({ event: "Errors", trackEventparam });
      showSimpleAlert(result.message);
    }
    return await Logout();
  }
  /**
   * Handle lower app version for Update App.
   */
  if (result.code == apiConfigs.INVALID_APP_VERSION) {
    return await handleLowerAppVersion(result.message);
  }

  return result;
};

/**
 *
 * @param {*} endpoint
 * @param {*} params
 * @param {*} options
 * GET method related api calls Start from here
 */
const get = async (endpoint, params) =>
  buildRequest(endpoint, {
    method: "GET",
  });

/**
 *
 * @param {*} endpoint
 * @param {*} params
 * @param {*} options
 * POST method related api calls Start from here
 */
const post = async (endpoint, params) =>
  buildRequest(endpoint, {
    method: "POST",
    body: params && JSON.stringify(params),
  });
const postImg = async (endpoint, params) =>
  buildRequestImg(endpoint, {
    method: "POST",
    body: params,
  });
/**
 *
 * @param {*} endpoint
 * @param {*} params
 * @param {*} options
 * PUT method related api calls Start from here
 */
const put = (endpoint, params, options = undefined) =>
  buildRequest(
    endpoint,
    {
      method: "PUT",
      body: params && JSON.stringify(params),
    },
    options
  );

/**
 *
 * @param {*} endpoint
 * @param {*} params
 * @param {*} options
 * DELETE method related api calls Start from here
 */
const deleteRequest = (endpoint, params = {}, options = undefined) =>
  buildRequest(
    endpoint,
    {
      method: "DELETE",
      body: params,
    },
    options
  );

const Logout = async () => {
  await StorageService.clear();
  NavigationService.resetAction("SignInScreen");
};
/**
 * api call module
 */
const Request = {
  get,
  post,
  postImg,
  put,
  delete: deleteRequest,
  getToken,
  setToken,
  getDeviceToken,
};

export { getHeaders };

export default Request;

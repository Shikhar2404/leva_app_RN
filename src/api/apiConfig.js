/**
 * Error code found in app
 */
const errorCodes = {
  TIMEOUT: 111,
  INVALID_APP_VERSION: 304,
  TOKEN_EXPIRED: 401,
  INVALID_TOKEN: 403,
  USER_DELETED: 405,
  USER_BLOCKED: 406,
  USER_UNSUBSCRIBE: 426,
};

/**
 * all url used in app
 */
const apiUrl = {
  SERVER_API_URL: "https://api.levaapp.com:8443/api/v2/",
};

/**
 * web pages urls in app
 */

const webPageUrls = {
  privacyPolicyUrl: "https://api.levaapp.com:8443/cms/privacy-policy",
  termsAndConditionUrl: "https://api.levaapp.com:8443/cms/terms-and-condition",
  cancelSubscriptionIOS: "https://api.levaapp.com:8443/cms/cancel-ios",
  cancelSubscriptionAndroid: "https://api.levaapp.com:8443/cms/cancel-android",
  appVersionAndroid: "https://play.google.com/store/apps/details?id=com.leva",
  appVersionIOS: "https://apps.apple.com/us/app/leva-app/id1641438281",
};

const apiConfigs = {
  ...errorCodes,
  ...apiUrl,
  ...webPageUrls,
};

export default apiConfigs;

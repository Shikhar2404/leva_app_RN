import analytics from "@react-native-firebase/analytics";
import Heap from "@heap/react-native-heap";
import StorageService from "./StorageService";

export async function trackEvent({ event, ...params }) {
  if (!event) {
    return;
  }
  const props = params ? params.trackEventparam : undefined;
  // analytics().logEvent(event, props);

  const authData = await StorageService.getItem(
    StorageService.STORAGE_KEYS.USER_DETAILS
  );

  if (authData) {
    Heap.identify(authData.email);
  }
  Heap.track(event, props);
}

export function setUserIdentity(email) {
  console.log("email=>", email);
  Heap.identify(email);
}

export default analytics;

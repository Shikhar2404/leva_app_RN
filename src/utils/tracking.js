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
  if (event === "Screen_Name") {
    event = props?.action;
  }
  Heap.track(event, props);
}

export async function setEventWithProperty(event, property) {
  const authData = await StorageService.getItem(
    StorageService.STORAGE_KEYS.USER_DETAILS
  );

  if (authData) {
    Heap.identify(authData.email);
  }

  if (event === "MeditationDetailesScreen") {
    Heap.track(event, { meditationName: property });
  } else if (event === "ArticlesDetailesScreen") {
    Heap.track(event, { articleName: property });
  } else if (event === "VideoDetailesScreen") {
    Heap.track(event, { videoName: property });
  } else {
    Heap.track(event);
  }
}

export function setUserIdentity(email) {
  console.log("email=>", email);
  Heap.identify(email);
}
export const trackMenuHamburger = (DrawerStatus) => {
    console.log("DrawerStatus", DrawerStatus)
    trackEvent({
        event:  DrawerStatus === 'open' ? "Hamburger_Menu_Opened" :"Hamburger_Menu_Closed",
    });
}

export default analytics;

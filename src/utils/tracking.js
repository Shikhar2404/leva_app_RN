import analytics from '@react-native-firebase/analytics';


export function trackEvent({ event, ...params }) {
  if (!event) {
    return;
  }
  const props = params ? params.trackEventparam : undefined;
  analytics().logEvent(event, props)
}


export default analytics;

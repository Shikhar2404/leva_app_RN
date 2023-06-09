import { Alert } from "react-native";
import { ConstantsText } from "../constants";
export default function showSimpleAlert(message) {
    Alert.alert(
        ConstantsText.appName,
        message,
        [
            { text: "OK", onPress: () => { } }
        ],
        { cancelable: false }
    );
}
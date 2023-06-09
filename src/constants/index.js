import { Platform, Dimensions,  } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export const deviceWidth = Dimensions.get('window').width;
export const deviceHeight = Dimensions.get('window').height;
export const statusbarHeight = Platform.OS === "ios" ? DeviceInfo.hasNotch() ? 44 : 20 : 0;
export const ConstantsText = {
   welcome: 'Pick Your Interests',
   appName:'Leva',
   openGallery: 'Choose from Gallery...',
   openGalleryTitle: 'Select Image',
   openCamera: 'Take Photo...',
   Cancel: 'Cancel',
   Congratulations: 'Congratulations!!!',
   netTitle:'Network',
   noNetworkAlert:'No internet connection',
   requestTimeoutMessage:'Request timeout',
   somethingWrongText:'Something went wrong..',
   logOutMessage:'Are you sure you want to logout?',

   Pleaseselectduration:'Please select duration',
   Pleaseenteremail:'Please enter email',
   Pleaseenteravalidemail:'Please enter a valid email',
   Pleaseenterpassword:'Please enter password',
   PasswordVaild:'Please enter alpha-numeric password with one capital, one small, one digit, and one special character. The password must be a min of 6 and a max of 18 characters.',
   PrivacyTerms:'Please select terms & conditions and privacy policy',
   Pleaseenteryourbabysname:"Please enter your baby's name",
   Pleaseselectbabyduedate:"Please select baby due date",
   Pleaseentername:"Please enter name",
   Pleaseselectmotherhoodstatus:"Please select motherhood status",
   PleaseselectbirthDate:"Please select birth Date",
   Pleasepickyourinterests:"Please pick your interests",
   Pleaseentervalidfeet:"Please enter valid feet",
   Pleaseentervalidinches:"Please enter valid inches",
   Areyousureyouwanttocancelyourappointment:"Are you sure you want to cancel your appointment?",
   Pleaseentercurrentpassword:"Please enter current password",
   Pleaseenternewpassword:"Please enter new password",
   Pleaseenterreenterpassword:"Please enter re-enter password",
   Newpasswordandreenterpassworddosenotmatch:"New password and re-enter password does not match",
   pleaseenterhowmaywehelpyou:"Please enter how may we help you?",
   Pleaseenteranyofoneleftrightamounts:"Please enter any of one (left/right) amounts",
   Pleaseentersessionsdataanyofoneleftright:"Please enter sessions data any of one (left/right)",
   Pleaseselectdate:"Please select date",
   Pleaseenterweightgrowth:"Please enter weight growth",
   Pleaseenterheightgrowth:"Please enter height growth",
   Pleaseenterheadsizegrowth:"Please enter head size growth",
   PleaseEnterquantity:"Please Enter quantity",
   PleaseSelectliquidtype:"Please Select liquid type",
   Pleasestarttrackinganyofoneleftright:"Please start tracking any of one (left/right)",
   applemsg:"Apple authentication is not supported on this device.",

   restorePurchaseNotFound:'Purchase data not found',
   restorePurchaseReceiptValidation:'Your purchase data is expired please renew your plan',
   restorePurchaseSucess:'Your purchase data successfully restore',
   PurchaseSucess:'Your subscription successfully',

   bdatevalidationGrowth:"Please enter the baby's birth date",

   doyouhaveaCouponCode:'Do you have a Coupon Code?',

}

export const ConstantsKey = {
   // ADD_TO_CART : 'ADD_TO_CART',
  
}
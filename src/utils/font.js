import {StyleSheet} from 'react-native'
import {colors } from './../utils/color';
export const fonts = {
   LargeSize: 21,
   MediumSize: 16,
   SmallSize: 14,

   //Font family
   rubikBold: 'Rubik-Bold',
   rubikExtraBold: 'Rubik-ExtraBold',
   rubikLight: 'Rubik-Light',
   rubikMedium: 'Rubik-Medium',
   rubikRegular: 'Rubik-Regular',
   rubikSemiBold: 'Rubik-SemiBold'
}
export const stylesBackground = StyleSheet.create({
   container: {
      backgroundColor: colors.pink,
      width:'100%',
      height:'100%',
    },
   backgroundimgcontainer: {
    position:'absolute',
    height:'100%',
    width:'100%'
   },
   NodataStyle: {
      color: colors.Blue,
      fontSize: 20,
      fontFamily: fonts.rubikMedium,
      textAlign:'center'
     
    },
});
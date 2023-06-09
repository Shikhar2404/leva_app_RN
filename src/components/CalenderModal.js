import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Text, Modal, ScrollView } from "react-native";
import { colors } from '../utils/color';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ConstantsText, deviceWidth } from '../constants';
import moment from 'moment-timezone';
import { importImages } from '../utils/importImages';
import DatePicker from 'react-native-date-picker'
import MonthPicker from 'react-native-month-year-picker';
import * as RNLocalize from "react-native-localize";
import { Picker } from 'react-native-wheel-pick';
import { fonts } from '../utils/font';
import FastImage from 'react-native-fast-image';

LocaleConfig.locales['en'] = {
   monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'],
   monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Nov', 'Dec'],
   dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
   dayNamesShort: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
}
LocaleConfig.defaultLocale = 'en'

export default function CalenderModal(props) {
   const [state, setState] = useState({
      calendarDate: moment(new Date()).locale(RNLocalize.getTimeZone()).format('YYYY-MM-DD'),
      markedDates: {
         [moment(new Date()).locale(RNLocalize.getTimeZone()).format('YYYY-MM-DD')]: {
            customStyles: {
               container: {
                  justifyContent: 'center',
                  backgroundColor: colors.Blue,
                  alignItems: 'center'
               },
               text: {
                  color: 'white',
               }
            }
         }
      },
      timepicker: false, timepicker1: false,
      date: new Date(),
      bdate: moment(new Date()).format('h : mm'),
      isSelectedAMPM: moment(new Date()).format('A'),
      showMonthpicker: false,
      hr: '00',
      min: '00',
      sec: '00',
      fromate: '00:00:00',
      fromate1: moment(new Date()).format('hh:mm A'),
      fromate2: moment(new Date()).format('HH:mm:ss'),

   })
   useEffect(() => {
      setState(oldState => ({
         ...oldState,
         bdate: props.bdate ? moment(props.bdate).format('h : mm') : state.bdate,
         isSelectedAMPM: props.bdate ? moment(props.bdate).format('A') : state.isSelectedAMPM,
         fromate1: props.bdate ? moment(props.bdate).format('hh:mm A') : state.fromate1,
         fromate2: props.bdate ? moment(props.bdate).format('HH:mm:ss') : state.fromate2,
         calendarDate: props.valuesdate,
         markedDates: {
            [props.valuesdate]: {
               customStyles: {
                  container: {
                     justifyContent: 'center',
                     backgroundColor: colors.Blue,
                     alignItems: 'center'
                  },
                  text: {
                     color: 'white',
                  }
               }
            }
         },
         hr: '00',
         min: '00',
         sec: '00',
         fromate: ''
      }));
   }, [props.visible]);

   const onPressChange = () => {
      setState(oldState => ({
         ...oldState,
         showMonthpicker: true,
      }));

   }
   const onValueChange = useCallback(

      (event, newDate) => {
         setState(oldState => ({

            ...oldState,
            showMonthpicker: false,
            calendarDate: moment(newDate).locale(RNLocalize.getTimeZone()).format('YYYY-MM-DD'),
         }));

      },
      [state.calendarDate, state.showMonthpicker],

   );


   const SetmarkedDates = (date) => {
      const obj = {
         [date]: {
            customStyles: {
               container: {
                  justifyContent: 'center',
                  backgroundColor: colors.Blue,
                  alignItems: 'center'
               },
               text: {
                  color: 'white',
               }
            }
         }
      }
      setState(oldState => ({
         ...oldState,
         markedDates: obj,
         calendarDate: date

      }));
      if (props.type1 != 'datetime') {
         props.getDate?.(date, state.fromate, '')
      }
   }
   const timeFromPicker = (time, type) => {
      var hrs = type == 'hr' ? time + ':' : state.hr + ':'
      var mins = type == 'min' ? time + ':' : state.min + ':'
      var secs = type == 'sec' ? time : state.sec
      setState(oldState => ({
         ...oldState,
         hr: type == 'hr' ? time : state.hr,
         min: type == 'min' ? time : state.min,
         sec: type == 'sec' ? time : state.sec,
         fromate: hrs + mins + secs

      }));
   }
   const setTime = () => {
      if (props.type1 === 'time') {
         props.getTime?.(state.fromate)

      }
      else {
         if (state.fromate1 != '') {
            props.getDate?.(state.calendarDate, state.fromate1, state.fromate2)

         }
         else {
            alert(ConstantsText.Pleaseselectduration)
         }

      }

   }

   return (
      <Modal
         animationType={props.animationType != null ? props.animationType : 'none'}
         animated={props.animated != null ? props.animated : false}
         visible={props.visible != null ? props.visible : false}
         transparent={props.transparent != null ? props.transparent : false}
         onRequestClose={() => props.CloseModal}>
         <TouchableWithoutFeedback onPress={props.CloseModal}>
            <View style={[styles.styles, props.style]}>
               <TouchableWithoutFeedback onPress={null}>
                  <View style={[styles.containerstyle, props.containerstyle]} >
                     <TouchableWithoutFeedback onPress={props.CloseModal}>
                        <View style={[props.containerStyle,styles.containerstyle1]}>
                           <View style={[styles.textInputInnerContainer,props.innerContainerStyle]}>
                              <Text style={styles.labletext}>{props.lable}</Text>
                              {props.type1 ?
                                 <TouchableWithoutFeedback onPress={() => setTime()}>
                                    <View>
                                       <Text style={styles.donetext}>{'Done'}</Text>
                                    </View>
                                 </TouchableWithoutFeedback>
                                 :
                                 <FastImage source={importImages.bdateIcon} style={styles.bdateicon} />
                              }
                           </View>
                        </View>
                     </TouchableWithoutFeedback>
                     <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                        {props.type1 === 'time' ? null :
                           <Calendar
                              style={{
                                 borderRadius: 10,
                                 marginBottom: 5,
                              }}
                              theme={{
                                 backgroundColor: '#ffffff',
                                 calendarBackground: '#ffffff',
                                 textSectionTitleColor: colors.Black,
                                 selectedDayTextColor: colors.Black,
                                 todayTextColor: colors.Black,
                                 dayTextColor: colors.Black,
                                 textDisabledColor: '#d9e1e8',
                                 textDayFontWeight: '400',
                                 textDayHeaderFontWeight: '600',
                                 textDayFontSize: 20,
                                 textDayHeaderFontSize: 13,

                              }}
                              initialDate={state.calendarDate}
                              maxDate={props.maxDate ? props.maxDate : undefined}
                              minDate={props.minDate ? props.minDate : undefined}
                              markingType={'custom'}
                              markedDates={state.markedDates}
                              onDayPress={day => {
                                 SetmarkedDates(day.dateString)
                              }}
                              onDayLongPress={day => {
                                 SetmarkedDates(day.dateString)
                              }}
                              current={state.calendarDate}
                              onMonthChange={month => {
                              }}
                              hideArrows={true}
                              hideExtraDays={true}
                              disableAllTouchEventsForDisabledDays={true}
                              renderHeader={date => {

                                 return (
                                    <View style={{ height: 40, flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginStart: -4, alignItems: 'center' }}>
                                       <TouchableWithoutFeedback onPress={() => onPressChange()}>
                                          <View style={{ flexDirection: 'row', }}>
                                             <Text style={{ fontSize: 20, color: colors.Black, fontFamily: fonts.rubikMedium, }}>{moment(date.toString()).utc().format('MMMM YYYY')}</Text>
                                             <FastImage source={importImages.downarrowIcon} style={{ marginStart: 5, height: 25, width: 25 }}></FastImage>

                                          </View>
                                       </TouchableWithoutFeedback>

                                    </View>
                                 )
                              }}
                           />
                        }
                        {props.type || props.type1 == 'datetime' ?
                           <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginEnd: 15, marginBottom: 16, marginTop: 10 }}>
                              <TouchableWithoutFeedback onPress={() => setState(oldState => ({
                                 ...oldState,
                                 timepicker: !state.timepicker,
                              }))}>
                                 <View style={{ backgroundColor: colors.Blue, borderRadius: 6, height: 36, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 22, color: colors.White, fontFamily: fonts.rubikRegular, marginStart: 10, marginEnd: 10 }}>{state.bdate}</Text>
                                 </View>
                              </TouchableWithoutFeedback>
                              <View style={{ marginStart: 6, backgroundColor: colors.Blue, borderRadius: 6, height: 36, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                 <View style={state.isSelectedAMPM === 'AM' ? styles.active : styles.inactive}>
                                    <Text style={{ fontSize: 13, color: state.isSelectedAMPM === 'AM' ? colors.Blue : colors.White, marginStart: 10, marginEnd: 10, fontFamily: state.isSelectedAMPM === 'AM' ? fonts.rubikRegular : fonts.rubikMedium, }}>{'AM'}</Text>
                                 </View>

                                 <View style={state.isSelectedAMPM === 'PM' ? styles.active : styles.inactive}>
                                    <Text style={{ fontSize: 13, color: state.isSelectedAMPM === 'PM' ? colors.Blue : colors.White, marginStart: 10, marginEnd: 10, fontFamily: state.isSelectedAMPM === 'PM' ? fonts.rubikRegular : fonts.rubikMedium, }}>{'PM'}</Text>
                                 </View>
                              </View>
                           </View>
                           : null}
                        {props.type1 && props.type1 != 'datetime' ?
                           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, }}>
                              <View style={{ flex: 1, }}>
                                 <Text style={styles.textStyle}>{'Hour'}</Text>
                                 <View style={{ flex: 1, flexDirection: 'row', }}>
                                    <Picker
                                       style={styles.comStyle}
                                       selectedValue={state.sec}
                                       pickerData={['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']}
                                       onValueChange={value => { timeFromPicker(value, 'hr') }}
                                       textColor={colors.Black}
                                    />
                                 </View>
                              </View>
                              <View style={{ flex: 1, }}>
                                 <Text style={styles.textStyle}>{'Minute'}</Text>
                                 <View style={{ flex: 1, flexDirection: 'row', }}>
                                    <Picker
                                       style={styles.comStyle}
                                       selectedValue={state.sec}
                                       pickerData={['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'
                                          , '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59']}
                                       onValueChange={value => { timeFromPicker(value, 'min') }}
                                       textColor={colors.Black}
                                    />
                                 </View>
                              </View>
                              <View style={{ flex: 1, }}>
                                 <Text style={styles.textStyle}>{'Second'}</Text>
                                 <View style={{ flex: 1, flexDirection: 'row', }}>
                                    <Picker
                                       style={styles.comStyle}
                                       selectedValue={state.sec}
                                       pickerData={['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'
                                          , '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59']}
                                       onValueChange={value => { timeFromPicker(value, 'sec') }}
                                       textColor={colors.Black}
                                    />
                                 </View>
                              </View>
                           </View>
                           : null}
                     </ScrollView>
                     <DatePicker
                        modal
                        mode='time'
                        is24Hour={true}
                        open={state.timepicker}
                        date={new Date()}
                        onConfirm={(date) => {
                           setState(oldState => ({
                              ...oldState,
                              date: date,
                              bdate: moment(date).format('h : mm'),
                              fromate1: moment(date).format('hh:mm A'),
                              fromate2: moment(date).format('HH:mm:ss'),
                              timepicker: false,
                              isSelectedAMPM: moment(date).format('A')
                           }))
                        }}
                        onCancel={() => {
                           setState(oldState => ({
                              ...oldState,
                              timepicker: false,
                           }))
                        }}
                     />


                  </View>
               </TouchableWithoutFeedback>
               <View style={{ position: 'absolute', bottom: 0 }} >

                  <TouchableWithoutFeedback onPress={null}>
                     <View style={[styles.styles,]}>

                        {state.showMonthpicker && (
                           <MonthPicker
                              onChange={onValueChange}
                              value={new Date(moment(state.calendarDate))}
                              locale="en"
                           />
                        )}
                     </View>

                  </TouchableWithoutFeedback>
               </View>
            </View>
         </TouchableWithoutFeedback>

      </Modal>
   );
}
const styles = StyleSheet.create({
   textInputInnerContainer: {
      height: 60,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 10, backgroundColor: colors.Blue, borderBottomRightRadius: 0, borderBottomLeftRadius: 0
   },
   containerstyle1: { borderRadius: 10, borderBottomRightRadius: 0, borderBottomLeftRadius: 0,},
   styles: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.transparent,
   },
   containerstyle: {
      backgroundColor: colors.White,
      borderRadius: 15,
      width: deviceWidth - 50,

   },
   active: {
      backgroundColor: colors.White, borderRadius: 6, height: 32, justifyContent: 'center', alignItems: 'center', marginStart: 1, marginEnd: 1
   },
   inactive: {
      borderRadius: 6, height: 32, justifyContent: 'center', alignItems: 'center'
   },
   donetext:{ fontSize: 16, color: colors.White, fontFamily: fonts.rubikRegular, marginEnd: 15,marginTop:10,marginBottom:10},
   labletext:{ fontSize: 16, color: colors.White, fontFamily: fonts.rubikRegular, marginStart: 15 },
   bdateicon:{ tintColor: colors.White, opacity: 0.7, marginEnd: 15 ,height:20,width:20},
   textStyle:{ fontSize: 16, alignSelf: "center", marginTop: 10, fontFamily: fonts.rubikRegular, color: colors.Blue },
   comStyle:{ backgroundColor: 'white', flex: 1, height: 215, alignSelf: 'center' }
});
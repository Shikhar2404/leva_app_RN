import React, { useState, } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts } from '../../../utils/font';
import { importImages } from '../../../utils/importImages'
import { deviceWidth } from '../../../constants';
import BottomButton from '../../../components/BottomButton';
import FastImage from 'react-native-fast-image';
import { trackEvent } from '../../../utils/tracking';
export default function AboutConsultantScreen({ route, navigation }) {
    const [state, setState] = useState({
        consiltantData: route.params.data,
    })


    const action_event = (action) => {
        const trackEventparam = { action: action }
        trackEvent({ event: 'About_Consultant', trackEventparam })
      }
    return (
        <View style={[styles.container, { backgroundColor: colors.pink }]}>
            <SafeAreaView style={{ backgroundColor: colors.Darkpink }}>
            </SafeAreaView>
            <View style={{ height: 110, backgroundColor: colors.Darkpink, alignItems: 'center' }}>
                <View style={{ marginTop: 20, alignItems: "center" }}>
                    <View>
                        <FastImage source={importImages.ProfileIcon} style={{ height: 158, width: 158, borderRadius: 158 / 2, }}></FastImage>
                        <View style={{ position: 'absolute', bottom: 0, top: 0, alignSelf: 'center', justifyContent: 'center' }}>
                            <FastImage style={{
                                height: 145, width: 145, borderRadius: 145 / 2, alignSelf: 'center',
                            }} source={{ uri: state.consiltantData.image }}></FastImage>
                        </View>
                    </View>
                    <View style={{ width: deviceWidth - 50, marginTop: 30, alignItems: "center", }}>
                        <Text style={styles.nameStyle}>{state.consiltantData.name}</Text>
                        <Text style={styles.textAdreesStyle} numberOfLines={3}>{state.consiltantData.address + ' Consultant'}</Text>
                    </View>

                </View>
                <TouchableOpacity onPress={() => {action_event('Back'),navigation.goBack()}} style={{ left: 17, position: 'absolute', top: 10 }}>
                    <FastImage source={importImages.backImg} style={{height:29,width:29}}></FastImage>
                </TouchableOpacity>
            </View>
            <View style={{ width: deviceWidth - 50, alignSelf: 'center', flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 200 }}>
                    <View style={{ marginBottom: 120 }}>
                        <Text style={styles.textAdreesStyle}>{state.consiltantData.description}</Text>
                    </View>
                </ScrollView>

                <BottomButton text={'Schedule'} onPress={() => {action_event('Schedule'),navigation.navigate('BookConsultantScreen', { data: state.consiltantData })}} container={{ position: 'absolute', bottom: -20, }} />


            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.pink,
    },

    textAdreesStyle: {
        color: colors.Blue,
        fontFamily: fonts.rubikRegular,
        fontSize: 16,
    },
    nameStyle: {
        color: colors.Blue,
        fontFamily: fonts.rubikBold,
        fontSize: 30
    },
});
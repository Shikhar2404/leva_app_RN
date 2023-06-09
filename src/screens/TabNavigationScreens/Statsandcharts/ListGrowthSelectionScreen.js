import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback,  FlatList } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BallIndicator from '../../../components/BallIndicator';
import FastImage from 'react-native-fast-image';
import { trackEvent } from '../../../utils/tracking';

export default function ListGrowthSelectionScreen({ route, navigation }) {
  const [state, setState] = useState({
    isModalVisible: false,
    growthData: [{ icon: importImages.weighticon, name: 'Weight', id: 1 },
    { icon: importImages.heighticon, name: 'Height', id: 2 },
    { icon: importImages.headicon, name: 'Head Size', id: 3 }],
    child_id: route.params.child_id,
    gender: route.params.gender,
    age: route.params.age,
    type: route.params.type,

  })
  useEffect(() => {
  }, [])

  const OnPressItem = (item) => {
    const trackEventparam = { action: item.name}
    trackEvent({ event: 'Select_Growth_Criteria', trackEventparam })
    if(state.type != '')
    {
      navigation.navigate('AddGrowthScreen', {
        type: item.id, child_id: state.child_id,
        gender: state.gender,
        age:state.age
      })
    }
    else{
      navigation.navigate('EditGrowthScreen', {
        type: item.id, child_id: state.child_id
      })
    }
   
  }

  const renderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback onPress={() => OnPressItem(item)}>

        <View style={[styles.inactiveBackground, { borderBottomWidth: state.growthData.length - 1 == index ? 0 : 1 }]}>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', }}>

              <FastImage source={item.icon} style={{ height: 35, width: 35, }} />
              <Text style={styles.inactiveText}>{item.name}</Text>
            </View>
            <FastImage source={importImages.Rarrowicon} style={{height:25,width:25, }} resizeMode={'center'} />
          </View>

        </View>
      </TouchableWithoutFeedback>

    );
  }
  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      <Header
        leftBtnOnPress={() => navigation.goBack()}
        titleStyle={{ color: colors.background }}
      />
      <View style={styles.container}>
        <View>
          <Text style={styles.titleStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{'Select Growth Criteria'}</Text>
        </View>

        <FlatList
          data={state.growthData}
          renderItem={renderItem}
          style={{ marginTop: 20 }}
          bounces={false}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
      {state.isModalVisible &&
        <BallIndicator visible={state.isModalVisible} />
      }
    </View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: deviceWidth - 34,
    alignSelf: 'center',

  },

  titleStyle: {
    color: colors.Blue,
    fontSize: 28,
    fontFamily: fonts.rubikBold,
  },

  inactiveBackground: { height: 65, justifyContent: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 1 },
  inactiveText: { fontSize: 16, fontFamily: fonts.rubikMedium, color: '#00172E', marginStart: 13 },
});

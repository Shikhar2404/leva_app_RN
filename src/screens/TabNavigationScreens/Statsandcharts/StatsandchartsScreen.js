import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback,  FlatList,  } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { ConstantsText, deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import { trackEvent, trackMenuHamburger } from '../../../utils/tracking';
import FastImage from 'react-native-fast-image';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import StorageService from '../../../utils/StorageService';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useIsFocused } from '@react-navigation/native';

export default function StatsandchartsScreen({ route, navigation }) {
  const [isOpen, setIsOpen] = useState(false)
const isFocused = useIsFocused()
  const [state, setState] = useState({
    StatsAndChartList: [{ image: importImages.pumpingimg, name: 'Pumping' }, { image: importImages.diapersimg, name: 'Diapers' }, { image: importImages.nursingimg, name: 'Nursing' },
    { image: importImages.growthimg, name: 'Growth' }, { image: importImages.bottlesimg, name: 'Bottles' }],
    isBdate: true
  })
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const bdate = await StorageService.getItem('childbate');

      setState(oldState => ({
        ...oldState,
        isBdate: bdate ? true : false
      }));

    });

    return () => unsubscribe;
  }, [])
  const action_event = (action) => {
    const trackEventparam = { action: action }
    trackEvent({ event: 'Stats_And_Charts', trackEventparam })
  }
  const goDetailsScreeen = (item) => {
    action_event(item.name)
    if (item.name === "Pumping") {
      navigation.navigate('TotalPumpedScreen')

    }
    else if (item.name === "Nursing") {
      navigation.navigate('TotalNursingScreen')
    }
    else if (item.name === "Diapers") {
      navigation.navigate('TotalDiaperScreen')
    }
    else if (item.name === "Bottles") {
      navigation.navigate('TotalBottlesScreen')
    }
    else if (item.name === "Growth") {
      if(state.isBdate)
      {
      navigation.navigate('TotalGrowthScreen', { child_id: '' })
      }
      else{
        showSimpleAlert(ConstantsText.bdatevalidationGrowth)

      }
    }

  }
  const renderFooter = () => {
    return (
      <View style={{ height: 120 }}>

      </View>
    );
  }
  const renderItem = ({ item, index }) => {
    const deviceWidthImg = (deviceWidth - 75) / 2
    const deviceHeightImg = (deviceWidth - 75) / 2

    return (
      <TouchableWithoutFeedback onPress={() => goDetailsScreeen(item)}>
        <View style={{ marginTop: 10, marginStart: 10, marginEnd: 10, flexDirection: 'column', alignItems: 'flex-start' }}>
          <View style={{ height: deviceHeightImg, width: deviceWidthImg, }}>
            <FastImage
              source={item.image}
              style={[{ borderRadius: 10, height: deviceHeightImg, width: deviceWidthImg }]}
            />
          </View>
          <Text style={[{ marginTop: 5, fontFamily: fonts.rubikBold, fontSize: 16, color: colors.Blue }, { width: deviceWidthImg }]}>{item.name}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }


  const DrawerStatus= useDrawerStatus()
  
  useEffect(() => {
    if(isFocused){
      DrawerStatus === 'open' &&
      trackMenuHamburger(DrawerStatus)
      && setIsOpen(true)
      DrawerStatus === 'closed' &&
      trackMenuHamburger(DrawerStatus)
    }
}, [DrawerStatus])

const openDrawer = () => {
       navigation?.openDrawer();
 }

  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      {/* <Header
        headerTitle={'Stats and charts'}
        leftBtnOnPress={null}
        titleStyle={route.params ? { colors: colors.Blue } : { color: colors.Blue, fontSize: 28, fontFamily: fonts.rubikBold, marginLeft: 25 }}
        style={route.params ? {} : { alignItems: 'center', justifyContent: 'flex-start' }}

      /> */}

      <Header
        leftBtnOnPress={openDrawer}
        menu={true}
        leftBtnStyle={{
          shadowColor: colors.background,
          elevation: 5,
          shadowOffset: {
            width: 3,
            height: 2
          },
          shadowOpacity: 0.20,
          shadowRadius: 6,
        }}
        titleStyle={{ color: colors.background }}
      />
      <Text style={styles.mainHeader} adjustsFontSizeToFit={true} numberOfLines={1}>{'Stats and charts'}</Text>

      <View style={styles.container}>
        <FlatList
          data={state.StatsAndChartList}
          renderItem={renderItem}
          bounces={true}
          numColumns={2}
          key={state.isGridNum}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (

            <Text style={stylesBackground.NodataStyle}>{state.isModalVisible ? '' : 'No data found'}</Text>
          )}
          contentContainerStyle={state.StatsAndChartList.length > 0 ? {} : { flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}
          ListFooterComponent={renderFooter}
        />

      </View>

    </View >

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center'
  },

  mainHeader: {
    color: colors.Blue,
    fontSize: 28,
    fontFamily: fonts.rubikBold,
    marginLeft: 25,
    textTransform: 'capitalize'
  },


});



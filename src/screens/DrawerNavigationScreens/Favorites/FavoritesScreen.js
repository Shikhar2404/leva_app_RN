import React, { useState, useEffect,  } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback,  FlatList,  } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { deviceWidth } from '../../../constants'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import BottomButton from "../../../components/BottomButton";
import showSimpleAlert from '../../../utils/showSimpleAlert';
import Request from '../../../api/Request';
import BallIndicator from '../../../components/BallIndicator';
import StorageService from '../../../utils/StorageService';
import FastImage from 'react-native-fast-image';
import { trackEvent } from '../../../utils/tracking';

export default function FavoritesScreen({ route, navigation }) {

  const [state, setState] = useState({
    FavoriteList: [],
    isModalVisible: false,
    isGridNum: 2,
  })
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      FavoriteApi()
    });
    return unsubscribe;
  }, [])
  const FavoriteApi = async () => {

    setState(oldState => ({
      ...oldState,
      isModalVisible: true,
      isGridNum: state.isGridNum
    }))
    let response = await Request.post('user/favorite')
    if (response.status === 'SUCCESS') {
      setState(oldState => ({
        ...oldState,
        isModalVisible: false,
        FavoriteList: response.data
      }))
    }
    else {
      setState(oldState => ({
        ...oldState,
        isModalVisible: false,

      }));
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const goDetailsScreeen = async (item) => {
    if (item.type === "article") {
      const trackEventparam = { action: "Articles (" + item.count + ")" }
      trackEvent({ event: 'Favorites', trackEventparam })
      await StorageService.saveItem('clickArticle', '3')
      navigation.navigate('ArticlesScreen')
    }
    else if (item.type === "meditation") {
      const trackEventparam = { action: "Meditations (" + item.count + ")" }
      trackEvent({ event: 'Favorites', trackEventparam })
      await StorageService.saveItem('clickMeditation', '3')
      navigation.navigate('MeditationScreen')
    }
    else if (item.type === "video") {
      const trackEventparam = { action: "Videos (" + item.count + ")" }
      trackEvent({ event: 'Favorites', trackEventparam })
      navigation.navigate('VideoScreen', { type: "3" })
    }
  }
  const renderItem = ({ item, index }) => {
    const deviceWidthN = state.isGridNum == 2 ? 75 : 90
    const deviceWidthImg = state.isGridNum != 1 ? (deviceWidth - deviceWidthN) / state.isGridNum : (deviceWidth - deviceWidthN) / 3
    const deviceHeightImg = state.isGridNum != 1 ? (deviceWidth - deviceWidthN) / state.isGridNum : (deviceWidth - deviceWidthN) / 3

    return (
      <TouchableWithoutFeedback onPress={() => goDetailsScreeen(item)}>
        <View style={{ marginTop: state.isGridNum != 1 ? 10 : 20, marginStart: state.isGridNum != 1 ? 10 : 10, marginEnd: 10, flexDirection: state.isGridNum != 1 ? 'column' : 'row', alignItems: 'flex-start' }}>
          <View style={{ height: deviceHeightImg, width: deviceWidthImg }}>
            <FastImage
              source={{ uri: item.image }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 10 }]}
            ></FastImage>
          </View>
          <Text style={[{ marginStart: state.isGridNum != 1 ? 0 : 10, marginTop: 5, fontFamily: fonts.rubikBold, fontSize: 16, color: colors.Blue }, state.isGridNum != 1 ? { width: deviceWidthImg } : {}]}>{item.type === "article" ? "Articles (" + item.count + ")" : item.type === 'meditation' ? "Meditations (" + item.count + ")" : "Videos (" + item.count + ")"}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }
  const checkcon3 = state.FavoriteList.length <= 2 ? { width: deviceWidth - 50, } : {}
  const checkcon2 = state.FavoriteList.length <= 1 ? { width: deviceWidth - 50, } : {}

  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      <Header
        leftBtnOnPress={() => {
          navigation.goBack()
        }}
        titleStyle={{ color: colors.Blue }}
      />
      <View style={{ width: deviceWidth - 50, alignItems: 'center', alignSelf: 'center' }}>
        <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.mainHeadertext}>{'Favorites'}</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableWithoutFeedback onPress={() => {
              const trackEventparam = { action: 'View Option' }
              trackEvent({ event: 'Favorites', trackEventparam })
              setState(oldState => ({ ...oldState, isGridNum: 2 }))
            }}>
              <View>
                <FastImage source={importImages.gridicon1} style={{ tintColor: colors.Blue, opacity: state.isGridNum == 2 ? 1 : 0.5, height: 40, width: 40 }}></FastImage>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => {
              const trackEventparam = { action: 'View Option' }
              trackEvent({ event: 'Favorites', trackEventparam })
              setState(oldState => ({ ...oldState, isGridNum: 3 }))
            }}>
              <View>
                <FastImage source={importImages.gridicon2} style={{ tintColor: colors.Blue, opacity: state.isGridNum == 3 ? 1 : 0.5, height: 40, width: 40 }} ></FastImage>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => {
              const trackEventparam = { action: 'View Option' }
              trackEvent({ event: 'Favorites', trackEventparam })
              setState(oldState => ({ ...oldState, isGridNum: 1 }))
            }}>
              <View>
                <FastImage source={importImages.listicon} style={{ tintColor: colors.Blue, opacity: state.isGridNum == 1 ? 1 : 0.5, height: 40, width: 40 }}></FastImage>
              </View>
            </TouchableWithoutFeedback>

          </View>
        </View>
      </View>

      <View style={styles.container}>
        <FlatList
          data={state.FavoriteList}
          renderItem={renderItem}
          bounces={false}
          style={state.isGridNum == 1 ? { width: deviceWidth - 50, } : state.isGridNum == 2 ? checkcon2 : checkcon3}
          numColumns={state.isGridNum}

          key={state.isGridNum}
          // columnWrapperStyle={{ justifyContent: "space-between",flex: 1 / state.isGridNum }}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View>
              {state.isModalVisible ?
                null :
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>

                  <Text style={[stylesBackground.NodataStyle, { textAlign: 'justify', fontSize: 14, }]}>{'You haven’t saved any articles, meditations or videos yet. When you tap the heart icon ♡ on any content, it will be saved here for easy access.'}</Text>
                  <BottomButton text={'Browse Articles'} onPress={() => {
                    const trackEventparam = { action: 'Browse Articles' }
                    trackEvent({ event: 'Favorites', trackEventparam })
                    navigation.navigate('ArticlesScreen')
                  }} container={{ marginTop: 20, width: deviceWidth / 2 }} />

                </View>
              }
            </View>
          )}
          contentContainerStyle={state.FavoriteList.length > 0 ? {} : { flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}
        />

      </View>
      {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}

    </View >

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 35,
    alignItems: 'center'
  },

  mainHeadertext: {
    color: colors.Blue,
    fontSize: 28,
    fontFamily: fonts.rubikBold,
    textTransform: 'capitalize'

  },


});


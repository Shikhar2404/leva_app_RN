import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, TextInput, FlatList, Image, ScrollView, } from 'react-native';
import { colors } from '../../../utils/color'
import { fonts, stylesBackground } from '../../../utils/font'
import { importImages } from '../../../utils/importImages'
import Header from "../../../components/Header";
import Request from '../../../api/Request';
import BallIndicator from '../../../components/BallIndicator';
import { ConstantsText, deviceWidth } from '../../../constants';
import StorageService from '../../../utils/StorageService';
import showSimpleAlert from '../../../utils/showSimpleAlert';
import FastImage from 'react-native-fast-image';
import { PurchaseError, requestSubscription, useIAP, withIAPContext, getAvailablePurchases, promotedProductListener, purchaseUpdatedListener, presentCodeRedemptionSheetIOS, purchaseErrorListener } from 'react-native-iap';
import { Platform } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import BottomButton from '../../../components/BottomButton';
import ModalView from '../../../components/ModalView';
import { trackEvent } from '../../../utils/tracking';
import apiConfigs from '../../../api/apiConfig';
const subscriptionPlan = ['com.leva.monthlysubscription', 'com.leva.yearlysubscription']
const SubscriptionScreen = ({ route, navigation }) => {
  const { connected, subscriptions, getSubscriptions, finishTransaction } = useIAP();
  const [state, setState] = useState({
    isModalVisible: false,
    selected: 0,
    ListItem: ['Unlimited Tracking', 'Save your Favorite Mediations/Articles/Videos', 'View Graphs for all of your Tracking', 'Add a Second Child', 'View all Articles', 'Listen to all Meditations', 'Watch all Videos'],
    isSuccessSub: false,
    isPromoCodeModal: false,
    strpromocode: '',
    strpromocodeFinal: '',
    strpromocodeFinalType: '',
    strpromocodeerror: '',
    strPrice: '',
    offerToken: ''

  })
  useEffect(() => {
    if (connected) {
      if (subscriptions.length == 0) {
        fetchProducts();
      }
    }
    const unsubscribe = navigation.addListener('focus', () => {
      getSubscribData()
    });
    return unsubscribe;
  }, [connected, subscriptions]);
  const getSubscribData = async () => {
    const purchaseData = await StorageService.getItem(StorageService.STORAGE_KEYS.PURCHASE_DATA);
    if (purchaseData) {

      setState(oldState => ({ ...oldState, selected: purchaseData.productId == "com.leva.yearlysubscription" ? 1 : 0 }))
    }
  }
  const productId = state.selected == 1 ? "com.leva.yearlysubscription" : "com.leva.monthlysubscription"
  const productdata = subscriptions.filter(item => item.productId == productId)
  // useEffect(() => {
  //   if (connected) {
  //     if (availablePurchases.length == 0) {
  //       fetchRestorePurchase()
  //     }
  //   }
  // }, [connected, availablePurchases]);

  const fetchProducts = async () => {
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        await getSubscriptions({ skus: subscriptionPlan });
      }
      else {
        showSimpleAlert(ConstantsText.noNetworkAlert)
      }
    })
  };
  useEffect(() => {
    var purchaseUpdate = purchaseUpdatedListener(
      async (purchase) => {
        const receipt = purchase.transactionReceipt ? purchase.transactionReceipt : purchase.originalJson;
        if (receipt) {
          try {
            await finishTransaction({ purchase, isConsumable: Platform.OS == 'ios' ? true : false });
            await validateReceiptApi(purchase)
          } catch (error) {
            console.log({ message: 'finishTransaction', error });
          }
        }
      },
    );
    var purchaseError = purchaseErrorListener((error) => {
      setState(oldState => ({ ...oldState, isModalVisible: false, }))

    });
    var promotedProduct = promotedProductListener((productId) =>
      alert('Product promoted', productId),
    );
    return () => {

      purchaseUpdate?.remove();
      purchaseError?.remove();
      promotedProduct?.remove();
    };
  }, []);
  // const fetchRestorePurchase = async () => {
  //   NetInfo.fetch().then(async (state) => {
  //     if (state.isConnected) {
  //       await getAvailablePurchases()
  //     }
  //     else {
  //       showSimpleAlert(ConstantsText.noNetworkAlert)
  //     }
  //   })
  // };
  const validateReceiptApi = async (data, isRestorePurchase) => {
    await StorageService.saveItem(StorageService.STORAGE_KEYS.PURCHASE_DATA, data);
    let params = { product_id: data.productId, token: Platform.OS == 'ios' ? data.transactionReceipt : data.purchaseToken }
    let response = await Request.post('subscription', params)
    if (response.status === 'SUCCESS') {
      if (!response.data.is_expired) {
        setState(oldState => ({ ...oldState, isSuccessSub: true }));
        await StorageService.saveItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED, '1');
        if (isRestorePurchase) {
          showSimpleAlert(ConstantsText.restorePurchaseSucess)
          navigation.goBack()
        }
        else {
          setTimeout(() => {
            setState(oldState => ({ ...oldState, isSuccessSub: false }));
            navigation.goBack()
          }, 5000);
        }
      }
      else {
        /** if subscription expired then remove purchase data */
        if (isRestorePurchase) {
          showSimpleAlert(ConstantsText.restorePurchaseReceiptValidation)
        }
        await StorageService.deleteItem(StorageService.STORAGE_KEYS.IS_SUBSCRIBED);
        await StorageService.deleteItem(StorageService.STORAGE_KEYS.PURCHASE_DATA);
      }
      setState(oldState => ({ ...oldState, isModalVisible: false }))
    }
    else {
      setState(oldState => ({ ...oldState, isModalVisible: false }))
      if (response) {
        showSimpleAlert(response.message)
      }
    }
  }
  const handleBuySubscription = async (productId, offerToken,) => {
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        try {
          requestSubscription({
            sku: productId,
            andDangerouslyFinishTransactionAutomaticallyIOS: false,
            ...(offerToken && { subscriptionOffers: [{ sku: productId, offerToken }], }),
          });
        } catch (error) {
          setState(oldState => ({ ...oldState, isModalVisible: false, }))
          if (error instanceof PurchaseError) {
            console.log({ message: `[${error.code}]: ${error.message}`, error });
          } else {
            console.log({ message: 'requestSubscription', error });
          }
        }
        // await requestSubscription({
        //   sku: productId,
        //   andDangerouslyFinishTransactionAutomaticallyIOS: false,
        //   ...(offerToken && { subscriptionOffers: [{ sku: productId, offerToken }], }),
        // })
        // .then(async res => {
        //   if (Platform.OS == 'ios') {
        //     await finishTransaction({ purchase: res, isConsumable: true, }).then(res => { },);

        //   }
        //   await validateReceiptApi(Platform.OS == 'ios' ? res : res[0])

        // }).catch(error => {
        //   setState(oldState => ({ ...oldState, isModalVisible: false }))
        //   if (error instanceof PurchaseError) {
        //     console.log(`[${error.code}]: ${error.message}`, error);

        //   } else {
        //     console.log('handleBuySubscription', error);
        //   }
        // })
      }
      else {
        showSimpleAlert(ConstantsText.noNetworkAlert)
      }
    })
  };
  const action_Subscribe = () => {
    const trackEventparam = { action: 'Subscribe' }
    trackEvent({ event: 'Subscription_Options', trackEventparam })
    if (subscriptions.length > 0) {
      let offerTokenpass = Platform.OS == 'android' ? state.strpromocodeFinalType == state.selected && state.strpromocodeFinal ? state.offerToken : productdata[0].subscriptionOfferDetails[productdata[0].subscriptionOfferDetails.length - 1].offerToken : ''
      setState(oldState => ({ ...oldState, isModalVisible: true, }))
      handleBuySubscription(productdata[0].productId, offerTokenpass)
    }
    else {
      if (subscriptions.length == 0) {
        fetchProducts();
      }
    }
  }

  const onRestorePurchaseAction = async () => {
    const trackEventparam = { action: 'Restore Purchase' }
    trackEvent({ event: 'Subscription_Options', trackEventparam })
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        setState(oldState => ({ ...oldState, isModalVisible: true }))
        //  await fetchRestorePurchase() 
        const Purchases = await getAvailablePurchases()
        if (Purchases && Purchases.length > 0) {
          const sortedAvailablePurchases = Purchases.sort(
            (a, b) => b.transactionDate - a.transactionDate
          );
          validateReceiptApi(Platform.OS == 'android' ? Purchases[0] : sortedAvailablePurchases[0], true)
        }
        else {
          setState(oldState => ({ ...oldState, isModalVisible: false }))
          showSimpleAlert(ConstantsText.restorePurchaseNotFound)
        }
      }
      else {
        showSimpleAlert(ConstantsText.noNetworkAlert)
      }
    })
  }

  const onCancelSubscriptionAction = async () => {

    // const purchaseData = await StorageService.getItem(StorageService.STORAGE_KEYS.PURCHASE_DATA);
    // let productId = state.selected == 1 ?  "com.leva.yearlysubscription" : "com.leva.monthlysubscription" 
    // if (purchaseData) {
    // productId = purchaseData.productId
    // }
    // Linking.openURL(Platform.OS == 'ios' ? 'https://apps.apple.com/account/subscriptions' : "https://play.google.com/store/account/subscriptions?package=com.leva&sku=" + productId);
    navigation.navigate('WebViewScreen1', { url: Platform.OS == 'ios' ? apiConfigs.cancelSubscriptionIOS : apiConfigs.cancelSubscriptionAndroid, title: 'Cancel Subscription', type: 'url' })
  }
  const action_redeemCode = async () => {

    if (Platform.OS == 'ios') {
      await presentCodeRedemptionSheetIOS()
    }
    else {
      setState(oldState => ({ ...oldState, isPromoCodeModal: true, strpromocodeerror: '', strpromocode: '' }))

    }
  }
  const select_Plan = (plan) => {
    const trackEventparam = { action: plan == 1 ? 'Annual' : 'Monthly' }
    trackEvent({ event: 'Subscription_Options', trackEventparam })
    setState(oldState => ({ ...oldState, selected: plan, }))
  }

  const applayPromocodeCheck = () => {
    const subscriptionOfferData = productdata && productdata.length > 0 ? productdata[0].subscriptionOfferDetails : ''
    let setofferToken = '', setstrPrice = ''
    const isDataFound = subscriptionOfferData.map(item => {
      if (item.offerTags.indexOf(state.strpromocode) >= 0) {
        setofferToken = item.offerToken
        setstrPrice = item.pricingPhases.pricingPhaseList[0].formattedPrice
      }
      return item.offerTags.indexOf(state.strpromocode) >= 0 ? true : false
    }).filter(item => item).toString()
    if (isDataFound) {
      setState(oldState => ({ ...oldState, isPromoCodeModal: false, strpromocodeFinalType: state.selected, offerToken: setofferToken, strPrice: setstrPrice, strpromocodeFinal: state.strpromocode }))
    }
    else {
      setState(oldState => ({ ...oldState, strpromocodeerror: 'Please enter valid promo code', strpromocodeFinal: '' }))

    }

  }
  const renderItemList = ({ item, index }) => {
    return (
      <View>
        <View style={{ flexDirection: 'row', marginTop: 10, width: deviceWidth - 90, justifyContent: 'flex-start', alignItems: 'center', alignSelf: 'center' }}>
          <FastImage source={importImages.checkicon} style={{ width: 11.99, height: 7.63, marginEnd: 13, marginStart: 0 }} />
          <Text style={{ fontFamily: fonts.rubikMedium, fontSize: 16, color: colors.White, width: '90%', }}>{item}</Text>
        </View>
      </View>
    )
  }

  const androidpricelist = productdata && productdata.length > 0 ? Platform.OS == 'android' ? productdata[0].subscriptionOfferDetails[0].pricingPhases.pricingPhaseList : '' : ''
  const androidprice = productdata && productdata.length > 0 && Platform.OS == 'android' ? state.strpromocodeFinalType == state.selected && state.strpromocodeFinal ? state.strPrice : productdata[0].subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[androidpricelist.length - 1].formattedPrice : ""
  let localizedPrice = productdata && productdata.length > 0 ? Platform.OS == 'ios' ? productdata[0].localizedPrice : androidprice : ''
  var unit = localizedPrice ? localizedPrice.substring(0, 1) : ''
  var amountcheck = localizedPrice ? localizedPrice.replace(unit, '').trim() : ''
  var amount = amountcheck ? amountcheck.replace('.00', '').trim() : ''

  return (
    <View style={stylesBackground.container}>
      <FastImage source={importImages.BackgroundAll} style={stylesBackground.backgroundimgcontainer} resizeMode={'stretch'}></FastImage>
      <Header
        leftBtnOnPress={() => navigation.goBack()}
        titleStyle={{ color: colors.background }}
      />

      <View style={styles.container}>
        <View>
          <Text style={styles.titleStyle}>{'Subscription Options'}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: deviceWidth / 2, borderColor: colors.Blue, borderWidth: 1, borderRadius: 10, height: 40 }}>
             
              <TouchableWithoutFeedback onPress={() => select_Plan(0)}>
                <View style={state.selected == 0 ? styles.selectedStyle : styles.unselectedStyle}>
                  <Text style={state.selected == 0 ? styles.selectedTextStyle : styles.unselectedTextStyle}>{'Monthly'}</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => select_Plan(1)}>
                <View style={state.selected == 1 ? styles.selectedStyle : styles.unselectedStyle}>
                  <Text style={state.selected == 1 ? styles.selectedTextStyle : styles.unselectedTextStyle}>{'Annual'}</Text>
                </View>
              </TouchableWithoutFeedback>

            </View>
          </View>
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            <View style={{ width: deviceWidth - 50, backgroundColor: colors.Purple, borderRadius: 16, justifyContent: 'center', alignItems: 'center', }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30 }}>
                <Text style={{ fontFamily: fonts.rubikMedium, color: colors.White, fontSize: 28, marginTop: 12 }}>{unit ? unit.trim() : ''} </Text>
                <Text style={{ fontFamily: fonts.rubikMedium, fontSize: 60, color: colors.White, }}>{amount ? amount : ''}</Text>
                <Text style={{ fontFamily: fonts.rubikRegular, color: colors.White, fontSize: 18, marginBottom: 12, alignSelf: 'flex-end' }}>{state.selected === 0 ? '/ Monthly' : '/ Annual'}</Text>
              </View>
              {state.selected == 1 ?
                <View style={{
                  position: 'absolute', top: 0, right: 0,
                }}>
                  <Image source={importImages.subscriptionoffer} style={{ height: 100, width: 100 }} resizeMode={'contain'} />
                </View>
                : null}
              {state.selected == 1 ?

                <View style={{ width: 50, position: 'absolute', top: 0, right: 0, height: 70, justifyContent: 'center', alignItems: 'center', }}>
                  <Text style={{ fontFamily: fonts.rubikMedium, fontSize: 18, color: colors.White, transform: [{ rotate: '45deg' }] }}>{'18%   \nOFF'}</Text>
                </View>
                : null}
              <View style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.4)', width: deviceWidth - 98, marginTop: 23 }} />
              <View style={{ flexDirection: 'row', width: deviceWidth - 70, }}>
                <FlatList
                  data={state.ListItem}
                  renderItem={renderItemList}
                  scrollEnabled={false}
                  contentContainerStyle={{ marginTop: 25, marginBottom: 28 }}
                  keyExtractor={(item, index) => index.toString()}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
          </View>
          <View>
            <BottomButton text={'Subscribe'} onPress={() => action_Subscribe()} container={{ marginTop: 28, marginBottom: 21 }} />
            <View style={{ alignSelf: 'center', marginBottom: 20, justifyContent: 'space-between' }}>
              <TouchableWithoutFeedback onPress={() => action_redeemCode()}>
                <View style={{}}>
                  <Text style={{ fontFamily: fonts.rubikBold, fontSize: 15, color: colors.Blue, marginBottom: 2, textDecorationLine: 'underline', }}>{"Redeem"}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <View style={{ alignSelf: 'center', flexDirection: 'row', width: deviceWidth - 90, marginBottom: 50, justifyContent: 'space-between' }}>
              <TouchableWithoutFeedback onPress={() => onRestorePurchaseAction()}>
                <View style={{ borderBottomColor: colors.Blue, borderBottomWidth: 1 }}>
                  <Text style={{ fontFamily: fonts.rubikBold, fontSize: 15, color: colors.Blue, marginBottom: 2 }}>{"Restore Purchase"}</Text>
                </View>
              </TouchableWithoutFeedback>
              <View>
                <Text style={{ fontFamily: fonts.rubikBold, fontSize: 15, color: colors.Blue, }}>{"·"}</Text>
              </View>
              <TouchableWithoutFeedback onPress={() => onCancelSubscriptionAction()}>

                <View style={{ borderBottomColor: colors.Blue, borderBottomWidth: 1 }}>
                  <Text style={{ fontFamily: fonts.rubikBold, fontSize: 15, color: colors.Blue, marginBottom: 2 }}>{"Cancel Anytime"}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>

            <View style={{ flexDirection: 'row', marginStart: 10, alignItems: "center", justifyContent: 'center', marginBottom: 20, }}>
              <TouchableWithoutFeedback onPress={() => {
                const trackEventparam = { action: 'Terms & Conditions' }
                trackEvent({ event: 'Subscription_Options', trackEventparam })
                navigation.navigate('WebViewScreen1', { url: apiConfigs.termsAndConditionUrl, title: 'Terms & Conditions', type: 'url' })
              }}>
                <View>
                  <Text style={{ fontFamily: fonts.rubikBold, textDecorationLine: 'underline', fontSize: 12, color: colors.Blue, }}>{"Terms & Conditions"}</Text>
                </View>
              </TouchableWithoutFeedback>
              <Text style={{ fontSize: 12, fontFamily: fonts.rubikRegular, color: colors.Blue, }}>{" and "}</Text>
              <TouchableWithoutFeedback onPress={() => {
                const trackEventparam = { action: 'Privacy policy' }
                trackEvent({ event: 'Subscription_Options', trackEventparam })
                navigation.navigate('WebViewScreen1', { url: apiConfigs.privacyPolicyUrl, title: 'Privacy policy', type: 'url' })
              }}>
                <View>
                  <Text style={{ fontFamily: fonts.rubikBold, textDecorationLine: 'underline', fontSize: 12, color: colors.Blue, }}>{"Privacy Policy"}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>

        </ScrollView>

      </View>
      {state.isModalVisible && <BallIndicator visible={state.isModalVisible}></BallIndicator>}
      {!amount ? <BallIndicator visible={true}></BallIndicator> : null}
      <ModalView
        visible={state.isPromoCodeModal}
        transparent={true}
        style={{ justifyContent: 'flex-end' }}
        animationType={'slide'}
        containerstyle={{ width: deviceWidth, backgroundColor: colors.lightPink, borderTopLeftRadius: 15, borderTopRightRadius: 15, borderRadius: 0 }}
        close={() => { setState(oldState => ({ ...oldState, isPromoCodeModal: false, strpromocodeerror: '' })) }}
        components={
          <View >
            <View style={{ width: deviceWidth - 50, }}>
              <Text style={{ fontFamily: fonts.rubikBold, fontSize: 15, color: '#323F4B', textAlign: 'center' }}>{''}</Text>
              <TouchableWithoutFeedback onPress={() => { setState(oldState => ({ ...oldState, isPromoCodeModal: false })) }}>
                <View style={{ width: 12, height: 12, position: 'absolute', right: 0 }}>
                  <FastImage source={importImages.crossIcon} style={{ height: 19, width: 19 }}></FastImage>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <Text style={{ fontFamily: fonts.rubikBold, fontSize: 15, color: '#323F4B', marginTop: 10, }}>{ConstantsText.doyouhaveaCouponCode}</Text>
            <View style={{ marginTop: 10, flexDirection: 'row', }}>
              <View style={{ flexDirection: 'row', borderBottomColor: colors.Lightgray, borderBottomWidth: 0.5, alignItems: 'center', justifyContent: 'space-between', flex: 1, marginEnd: 10 }}>
                <FastImage source={importImages.promocode} style={{ height: 19, width: 19 }}></FastImage>

                <TextInput
                  placeholder='Enter code'
                  placeholderTextColor={colors.textLable}
                  ref={state.refleft}
                  keyboardType={'default'}
                  autoCapitalize={'none'}
                  blurOnSubmit={true}
                  value={state.strpromocode}
                  onChangeText={(text) => setState(oldState => ({ ...oldState, strpromocode: text, strpromocodeerror: '' }))}
                  style={{ color: colors.Black, fontFamily: fonts.rubikRegular, fontSize: 18, height: 45, flex: 1, marginStart: 5, }}
                />

              </View>
              <TouchableWithoutFeedback onPress={() => applayPromocodeCheck()}>
                <View style={{ borderColor: colors.Blue, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, height: 45, width: 100 }}>
                  <Text style={{ fontFamily: fonts.rubikBold, fontSize: 15, color: colors.Blue, }}>{'Apply'}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <Text style={{ fontFamily: fonts.rubikRegular, fontSize: 12, color: colors.red, marginTop: 5 }}>{state.strpromocodeerror}</Text>

          </View>
        }
      />
      <ModalView
        visible={state.isSuccessSub}
        transparent={true}
        containerstyle={{ width: deviceWidth - 50, backgroundColor: colors.lightPink }}
        showloader={state.isModalVisible}
        components={
          <View>
            <Image source={importImages.bdategif} style={{ width: deviceWidth - 50, height: 150, position: 'absolute', }} />
            <View style={{ width: deviceWidth - 50, }}>
              <View style={{ height: 150, justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.rubikBold, fontSize: 18, color: '#323F4B', textAlign: 'center', alignSelf: 'center' }}>{'Welcome to the Leva Community!'}</Text>
                <Text style={{ fontFamily: fonts.rubikBold, fontSize: 18, color: '#323F4B', textAlign: 'center', alignSelf: 'center', marginTop: 5 }}>{'Thank you for subscribing. 💜'}</Text>
              </View>
            </View>
            <TouchableWithoutFeedback onPress={() => {
              const trackEventparam = { action: 'Close' }
              trackEvent({ event: 'Subscription_Options', trackEventparam })
              setState(oldState => ({ ...oldState, isSuccessSub: false })), navigation.goBack()
            }}>
              <View style={{ width: 12, height: 12, position: 'absolute', right: 20 }}>
                <FastImage source={importImages.crossIcon} style={{ height: 19, width: 19 }}></FastImage>
              </View>
            </TouchableWithoutFeedback>
          </View>
        }
      />
    </View>

  );
}
export default withIAPContext(SubscriptionScreen);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: deviceWidth - 50,
    alignSelf: 'center'
  },
  titleStyle: {
    color: colors.Blue,
    fontSize: 28,
    fontFamily: fonts.rubikBold,
  },
  unselectedStyle: {
    width: '50%', height: 40, justifyContent: 'center', alignItems: 'center'
  },
  selectedStyle: {
    width: '50%', height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.Blue,
    borderRadius: 10
  },
  unselectedTextStyle: {
    fontFamily: fonts.rubikRegular, color: colors.Blue, fontSize: 16
  },
  selectedTextStyle: {
    fontFamily: fonts.rubikRegular, color: colors.White, fontSize: 16
  },
});


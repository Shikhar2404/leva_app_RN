import AsyncStorage from '@react-native-async-storage/async-storage';
/**
 * Storage Service class for storing values in local device storage
 */

   /**Different Storage keys */
   const STORAGE_KEYS = {
      TOKENS: 'TOKENS',
      USER_DETAILS: 'USER_DETAILS',
      AUTH_TOKEN: "AUTH_TOKEN",
      DEVICE_TOKEN : 'DEVICE_TOKEN',
      PURCHASE_DATA:'PURCHASE_DATA',
      IS_SUBSCRIBED:'IS_SUBSCRIBED'
   };

   /**
    * 
    * @param {*} key 
    * @returns get value from local storage
    */
   async function getItem(key) {
      try {
         const i = await AsyncStorage.getItem(key);
         return JSON.parse(i);
      } catch (e) {
         return console.log(e.message, e);
      }
   }

   /**
    * 
    * @returns get multiple value from local storage
    */
   async function getItems() {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      var r = stores.map((result, i, store) => {
         return JSON.parse(store[i][1]);
      });
   }

   /**
    * 
    * @returns clear all values from local storage
    */
   function clear() {
      const keys = [STORAGE_KEYS.AUTH_TOKEN,  STORAGE_KEYS.USER_DETAILS,'nursinglefttime','nursingrighttime','pumpingtime','clickArticle','clickMeditation','clickArticleMiId','child_id','charthome','is_water_allow','childbate'];
      return AsyncStorage.multiRemove(keys);
   }
   function clearArt() {
      const keys = ['clickArticle','clickMeditation','clickArticleMiId','charthome'];
      return AsyncStorage.multiRemove(keys);
   }
   function clearHome() {
      const keys = ['charthome'];
      return AsyncStorage.multiRemove(keys);
   }
   function clearTimenur() {
      const keys = ['nursinglefttime','nursingrighttime','clickArticle','clickMeditation','clickArticleMiId'];
      return AsyncStorage.multiRemove(keys);
   }
   function clearTimenurright() {
      const keys = ['nursingrighttime',];
      return AsyncStorage.multiRemove(keys);
   }
   function clearTimenurboth() {
      const keys = ['nursingrighttime','nursinglefttime',];
      return AsyncStorage.multiRemove(keys);
   }
   function clearTimenurleft() {
      const keys = ['nursinglefttime',];
      return AsyncStorage.multiRemove(keys);
   }
   function clearTime() {
      const keys = ['pumpingtime','clickArticle','clickMeditation','clickArticleMiId'];
      return AsyncStorage.multiRemove(keys);
   }
   /**
    * 
    * @param {*} key 
    * @returns delete values from local storage
    */
   function deleteItem(key) {
      return AsyncStorage.removeItem(key);
   }

   /**
    * 
    * @param {*} key 
    * @param {*} item 
    * @returns save values to local storage
    */
   async function saveItem(key, item) {
      const value_1 = await AsyncStorage
         .setItem(key, JSON.stringify(item));
      return value_1;
   }

   export default {
      STORAGE_KEYS,
      getItem,
      getItems,
      clear,
      clearTime,
      clearTimenur,
      deleteItem,
      saveItem,
      clearArt,
      clearHome,
      clearTimenurright,
      clearTimenurleft,
      clearTimenurboth
   };
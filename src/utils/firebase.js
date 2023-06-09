import * as firebase from 'firebase';
import '@firebase/auth';
const firebaseConfig = {
    // databaseURL: "https://leva-efd4e.firebaseio.com",
    apiKey: "AIzaSyDMdnn2vhVEou-lRIlt4nTZyUfi1PgC9qA",
    authDomain: "leva-efd4e.firebaseapp.com",
    projectId: "leva-efd4e",
    storageBucket: "leva-efd4e.appspot.com",
    messagingSenderId: "924524413163",
    appId: "1:924524413163:web:a61d5d0244ec96d3d1beae",
    measurementId: "G-HTPS3SM585"
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


export default firebase;

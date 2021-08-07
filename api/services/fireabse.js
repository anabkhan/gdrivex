// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebase = require('firebase');
const { Messages } = require('../constants/Messages');
const firebaseConfig = {
    apiKey: "AIzaSyAv-an02bKJiAYmclEBnnYrksgvAZnyHrA",
    authDomain: "gdrivex-f98fc.firebaseapp.com",
    projectId: "gdrivex-f98fc",
    storageBucket: "gdrivex-f98fc.appspot.com",
    messagingSenderId: "972070014032",
    appId: "1:972070014032:web:f5f4b698f57154e0a49555",
    measurementId: "G-5Y7C9TME5P"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig)
const storage = firebase.storage()
const db = firebase.database()

module.exports.updateDB = (path, id, data) => {
    //db.ref('users' + '/akanabkhan' + '/drives').child(data.data.user.emailAddress.split('@')[0]).set(data.data)
    db.ref(path).child(id).set(data)
}
  
module.exports.getData = (path, onData, onError) => {
    db.ref(path).get().then((snapshot) => {
        if (snapshot.exists()) {
            onData(snapshot.val());
        } else {
            onError({code: Messages.DATA_DOESNT_EXISTS, message: 'Data doesnt exists'})
        }
    }).catch((error) => {
        onData(error)
    });
}
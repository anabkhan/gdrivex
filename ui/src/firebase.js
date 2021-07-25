// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import firebase from 'firebase'
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

const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()
const storage = firebase.storage()
const db = firebase.firestore()

export {auth, provider, db, storage}
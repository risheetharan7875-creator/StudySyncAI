import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
}from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

//FIREBASE CONFIG

const firebaseConfig = {
  apiKey: "AIzaSyDCvbbFLhS3J2NZl5DVhZDBFxjiPdMwZZs",
  authDomain: "studysyncai-821eb.firebaseapp.com",
  projectId: "studysyncai-821eb",
  storageBucket: "studysyncai-821eb.firebasestorage.app",
  messagingSenderId: "331589547935",
  appId: "1:331589547935:web:73ae448b993bf742cc2faa"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const provider =
    new GoogleAuthProvider();

export {
    db,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    auth,
    provider,
    signInWithPopup,
    signOut
};
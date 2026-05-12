import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

export {
    db,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
};
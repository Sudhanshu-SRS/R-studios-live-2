// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, sendEmailVerification, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAbGOTDXOR6bk-fspKd19J4mFDvEgbHZiw",
    authDomain: "rashi-a0bbc.firebaseapp.com",
    projectId: "rashi-a0bbc",
    storageBucket: "rashi-a0bbc.firebasestorage.app",
    messagingSenderId: "106141286437",
    appId: "1:106141286437:web:46182b60b3bbde6ee5ffcc",
    measurementId: "G-K854G0CDMY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, signInWithPopup, sendEmailVerification, createUserWithEmailAndPassword, sendPasswordResetEmail, db };
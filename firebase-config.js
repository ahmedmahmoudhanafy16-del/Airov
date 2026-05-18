// AIROV — Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpkHi59k32LGgLcd7GIcvNrXfaAfhwrFI",
  authDomain: "airov-store.firebaseapp.com",
  projectId: "airov-store",
  storageBucket: "airov-store.firebasestorage.app",
  messagingSenderId: "370223578516",
  appId: "1:370223578516:web:3e7be3652544941df52381"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, signInWithEmailAndPassword, signOut, onAuthStateChanged };

// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCHjmGvanKYGO3BjaGR8DNSTNM3bqD9D8o',
  authDomain: 'mydiecastlife-fc4f9.firebaseapp.com',
  projectId: 'mydiecastlife-fc4f9',
  storageBucket: 'mydiecastlife-fc4f9.firebasestorage.app',
  messagingSenderId: '1004819146950',
  appId: '1:1004819146950:web:77372e3444c5bbf1a08fc7',
  measurementId: 'G-4H0ELJBV93',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

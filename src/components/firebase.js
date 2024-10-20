// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; 
import { getFirestore } from 'firebase/firestore'; 

const firebaseConfig = {
    apiKey: "AIzaSyAsUO_Xl9hGLtTx3zU_lOswPlenaNGLzlU",
    authDomain: "book-reading-ba948.firebaseapp.com",
    projectId: "book-reading-ba948",
    storageBucket: "book-reading-ba948.appspot.com",
    messagingSenderId: "809631112964",
    appId: "1:809631112964:web:47d109301e8982707afa51",
    measurementId: "G-X6Y3LGYYJ9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const realtimeDb = getDatabase(app); 
const firestoreDb = getFirestore(app); 
export const googleProvider = new GoogleAuthProvider();

export { auth, realtimeDb, firestoreDb };

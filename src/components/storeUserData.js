// For Firestore (replace in firebase.js and Login.js)
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore(app); // Initialize Firestore

const storeUserData = (user) => {
  const userRef = doc(db, 'users', user.uid);
  setDoc(userRef, {
    email: user.email,
    lastLogin: new Date().toISOString(),
  });
};

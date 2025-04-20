// Uj Firebase syntax Ver9+
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, serverTimestamp, collection, doc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDN-1WYifUaDdINe_yugdM83QK5ncD1HrU",
    authDomain: "hangter-web.firebaseapp.com",
    projectId: "hangter-web",
    storageBucket: "hangter-web.firebasestorage.app",
    messagingSenderId: "175798634270",
    appId: "1:175798634270:web:09492ebe16b6346f056b0f",
    measurementId: "G-ZVD0FLN4DY"
};


const app = initializeApp(firebaseConfig);

// TELJESEN MÁS SYNTAX
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export { serverTimestamp };
//végleges
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
    getFirestore,
    collection,
    query,
    where,
    limit,
    getDocs
} from 'firebase/firestore';
//import { getStorage } from 'firebase/storage';
export { serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDN-1WYifUaDdINe_yugdM83QK5ncD1HrU",
    authDomain: "hangter-web.firebaseapp.com",
    projectId: "hangter-web",
    storageBucket: "hangter-web.firebasestorage.app",
    messagingSenderId: "175798634270",
    appId: "1:175798634270:web:09492ebe16b6346f056b0f",
    measurementId: "G-ZVD0FLN4DY"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
//export const storage = getStorage(app);

export async function getUserWithUsername(username) {
    const q = query(collection(firestore, 'users'), where('username', '==', username), limit(1));
    const snap = await getDocs(q);
    return snap.docs[0] || null;
}

export function jsonConvert(snap) {
    const data = typeof snap?.data === 'function' ? snap.data() : null;
    if (!data) return null;
    return {
        ...data,
        createdAt: data?.createdAt?.toMillis ? data.createdAt.toMillis() : null,
        updatedAt: data?.updatedAt?.toMillis ? data.updatedAt.toMillis() : null,
        id: snap.id
    };
}

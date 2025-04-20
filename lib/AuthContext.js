'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './firebase';


export const UserContext = createContext({
    user: null,
    username: null,
    isAdmin: false
});


export function UserContextProvider({ children, value }) {
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}


export function AuthProvider({ children }) {
    const [user, loading] = useAuthState(auth);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        let unsubscribe;
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            unsubscribe = onSnapshot(userRef, (doc) => {
                setUsername(doc.data()?.username);
            });
        } else {
            setUsername(null);
        }
        return () => unsubscribe?.();
    }, [user]);

    if (loading) return <div>Loading authentication...</div>;

    return (
        <UserContextProvider value={{ user, username }}>
            {children}
        </UserContextProvider>
    );
}


export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext et UserContextProvider en belul hasznald');
    }
    return context;
}




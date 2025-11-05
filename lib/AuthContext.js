//végleges
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './firebase';

export const UserContext = createContext({ user: null, username: null, isAdmin: false });
//export const UserContextProvider = UserContext.Provider;

export function AuthProvider({ children }) {
    const [user, loading] = useAuthState(auth);
    const [username, setUsername] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let unsub;
        if (user) {
            const ref = doc(firestore, 'users', user.uid);
            unsub = onSnapshot(ref, (snap) => {
                const data = snap.data() || {};
                setUsername(data.username || null);
                setIsAdmin(Boolean(data.isAdmin || false));
            });
        } else {
            setUsername(null);
            setIsAdmin(false);
        }
        return () => unsub?.();
    }, [user]);

    if (loading) return null;

    return (
        <UserContext.Provider value={{ user, username, isAdmin }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    return useContext(UserContext);
}

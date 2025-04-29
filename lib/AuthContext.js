'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import {doc, onSnapshot} from 'firebase/firestore';
import {useAuthState} from 'react-firebase-hooks/auth';
import {auth, firestore} from './firebase';

{/* defult adatok */}
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

{/* Firestorbol lekerdezi az adatokat */}
export function AuthProvider({ children }) {
    const [user, loading] = useAuthState(auth);
    const [username, setUsername] = useState(null);

    {/* user letrehozas es torles, ha mar nincs user */}
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



    {/* Ehelyett kéne majd egy spinner */}
   if (loading) return <div>Adatok betöltése</div>;


    {/* megkapja es továbbitja az előbb betöltött adatokat */}
    return (
        <UserContextProvider value={{ user, username }}>
            {children}
        </UserContextProvider>
    );
}

{/* useUserContext et UserContextProvider en belul hasznald */}
export function useUserContext() {
    return useContext(UserContext);
}




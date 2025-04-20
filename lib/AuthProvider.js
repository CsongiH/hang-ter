
/*


'use client';

import { UserContextProvider } from 'lib/AuthContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { auth, firestore } from 'lib/firebase';

export default function AuthProvider({ children }) {
    const [user] = useAuthState(auth);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        let unsubscribe;
        if (user) {
            const ref = firestore.collection('users').doc(user.uid);
            unsubscribe = ref.onSnapshot((doc) => {
                setUsername(doc.data()?.username);
            });
        }
        return () => unsubscribe?.();
    }, [user]);

    return (
        <UserContextProvider value={{ user, username }}>
            {children}
        </UserContextProvider>
    );
}



 */
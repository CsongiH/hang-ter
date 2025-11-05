'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../lib/firebase';
import { useUserContext } from '../lib/AuthContext';

const EditProfileForm = dynamic(() => import('./editProfileForm'), { ssr: false });

export default function LogInButtons() {
    const router = useRouter();
    const { user } = useUserContext();
    const [signInWithGoogle, , loading, error] = useSignInWithGoogle(auth);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            if (!user) {
                if (isMounted) setProfile(null);
                return;
            }

            if (isMounted) setLoadingProfile(true);

            try {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};
                if (isMounted) setProfile(userData);
            } catch (error) {
                if (isMounted) setProfile({});
            } finally {
                if (isMounted) setLoadingProfile(false);
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [user]);

    useEffect(() => {
        if (user && profile?.username) {
            const normalizedUsername = String(profile.username).toLowerCase();
            router.replace(`/${encodeURIComponent(normalizedUsername)}`);
        }
    }, [user, profile?.username, router]);

    const handleGoogleSignIn = async () => {
        await signInWithGoogle();
    };

    if (!user) {
        if (loading) return <button className="button" disabled>Bejelentkezés folyamatban…</button>;
        if (error) return <p className="small muted">Hiba: {error.message}</p>;

        return (
            <div className="stack items-center text-center">
                <h1 className="h1">Bejelentkezés</h1>
                <button className="button" onClick={handleGoogleSignIn}>
                    <Image src="/google-logo.svg" width={20} height={20} alt="Google logo" />
                    Bejelentkezés Google fiókkal
                </button>
            </div>
        );
    }

    if (loadingProfile) return <div className="small muted">Betöltés…</div>;

    if (!profile?.username) {
        return (
            <div className="stack">
                <h1 className="h1">Profil beállítása</h1>
                <EditProfileForm initialProfile={profile} embedded />
                <div className="row justify-end">
                    <LogOutButton />
                </div>
            </div>
        );
    }

    return (
        <div className="row justify-center gap-3">
            <span className="small">Be vagy jelentkezve.</span>
            <LogOutButton />
        </div>
    );
}

export function LogOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } finally {
            router.replace('/logmein');
        }
    };

    return (
        <button className="button" onClick={handleSignOut}>
            Kijelentkezés
        </button>
    );
}
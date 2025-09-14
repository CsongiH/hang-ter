'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, firestore } from '../lib/firebase';
import { UserContext } from '../lib/AuthContext';

const EditProfileForm = dynamic(() => import('./editProfileForm'), { ssr: false });

export default function LogInButtons() {
    const { user } = useContext(UserContext);
    const [signInWithGoogle, , loading, error] = useSignInWithGoogle(auth);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    const goToSlug = useCallback((u) => {
        const slug = String(u || '').trim().toLowerCase();
        window.location.assign(slug ? `/${encodeURIComponent(slug)}` : '/logmein');
    }, []);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!user) {
                setProfile(null);
                return;
            }
            setLoadingProfile(true);
            const snap = await getDoc(doc(firestore, 'users', user.uid));
            const data = snap.exists() ? snap.data() : {};
            if (mounted) setProfile(data);
            setLoadingProfile(false);
        };
        load();
        return () => { mounted = false; };
    }, [user]);

    useEffect(() => {
        if (user && profile?.username) goToSlug(profile.username);
    }, [user, profile?.username, goToSlug]);

    const handleGoogle = async () => {
        await signInWithGoogle();
        const u = auth.currentUser;
        if (!u) return;
        const snap = await getDoc(doc(firestore, 'users', u.uid));
        const data = snap.exists() ? snap.data() : {};
        goToSlug(data.username);
    };

    if (!user) {
        if (loading) return <button disabled>Bejelentkezés folyamatban…</button>;
        if (error) return <p>Hiba: {error.message}</p>;
        return (
            <button className="btn" onClick={handleGoogle}>
                <Image src="/google-logo.svg" width={30} height={30} alt="Google logo" />
                Bejelentkezés Google fiókkal
            </button>
        );
    }

    if (loadingProfile) return <div>Betöltés…</div>;

    if (!profile?.username) {
        return (
            <div className="space-y-4">
                <EditProfileForm initialProfile={profile} />
                <LogOutButton />
            </div>
        );
    }

    return (
        <div className="space-x-2">
            <span>Be vagy jelentkezve.</span>
            <LogOutButton />
        </div>
    );
}

export function LogOutButton() {
    return (
        <button
            onClick={async () => {
                try { await signOut(auth); } finally { window.location.assign('/logmein'); }
            }}
            className="rounded-2xl px-3 py-2 border"
        >
            Kijelentkezés
        </button>
    );
}

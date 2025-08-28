'use client';

import { auth, firestore } from '../lib/firebase';
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";

import { UserContext } from "../lib/AuthContext";
import { useCallback, useContext, useEffect, useState } from "react";

import { debounce } from "next/dist/server/utils";
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';


{/* bejelentkezés után dolbjon át a /user oldalra <- EZ MÉG NINCS MEG*/ }
export function LogInButton() {
    const [signInWithGoogle, _, loading, error] = useSignInWithGoogle(auth);

    if (loading) return <button disabled>Bejelentkezés folyamatban</button>;
    if (error) return <p>Hiba: {error.message}</p>;

    else return (
        <button className="btn" onClick={() => signInWithGoogle()}>
            <img src={'/google-logo.svg'} width="30px" alt="Google logo" />
            Bejelentkezés Google fiókkal
        </button>
    );
}

export function LogOutButton() {
    return <button onClick={() => signOut(auth)}>Kijelentkezés</button>
}

export function UsernameForm() {
    const [formValue, setFormValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useContext(UserContext);

    const onSubmit = async (e) => {
        e.preventDefault();

        const userDoc = doc(firestore, 'users', user.uid);
        const usernameDoc = doc(firestore, 'usernames', formValue);
        const batch = writeBatch(firestore);
        batch.set(userDoc, {
            username: formValue,
            photoURL: user.photoURL,
            displayName: user.displayName,
            createdAt: serverTimestamp(),
            isAdmin: false
        });
        batch.set(usernameDoc, { uid: user.uid });

        await batch.commit();
    };

    const onChange = (e) => {
        {/* 3-15 karakter között betűk számok . _ (nem lehet dupla .. és __ ,  szöveg közben kell lennie) nem is enged invalid inputot*/ }
        const val = e.target.value.toLowerCase();
        const validateFormat = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;


        if (val.length < 3) {
            setFormValue(val);
            setIsLoading(false);
            setIsValid(false);
        }

        if (validateFormat.test(val)) {
            setFormValue(val);
            setIsLoading(true);
            setIsValid(false);
        }
    };

    useEffect(() => {
        checkUsername(formValue);
    }, [formValue]);

    const checkUsername = useCallback(
        debounce(async (username) => {
            if (username.length >= 3) {
                const ref = doc(firestore, 'usernames', username);
                const docSnap = await getDoc(ref);
                console.log('Firestore olvasás futtatva!');
                setIsValid(!docSnap.exists());
                setIsLoading(false);
            }
        }, 500),
        []
    );

    return (
        <section>
            <h3>Válassz felhasználónevet</h3>
            <form onSubmit={onSubmit}>
                <input name="username" placeholder="felhasználónév" value={formValue} onChange={onChange} />
                <FelhasznaloNevUzenet username={formValue} isValid={isValid} isLoading={isLoading} />
                <button type="submit" className="btn-green" disabled={!isValid}>
                    Kiválaszt
                </button>
                <div align="right">
                    <h3>Debug infók </h3>

                    Felhasználónév: {formValue}
                    <br />
                    Töltés: {isLoading.toString()}
                    <br />
                    Felhasználónév érvényes: {isValid.toString()}
                </div>
            </form>
        </section>
    )
}

export function FelhasznaloNevUzenet({ username, isValid, loading }) {
    if (loading) {
        return <p>Ellenőrzés...</p>;
    } else if (isValid) {
        return <p className="text-success">{username} elérhető!</p>;
    } else if (username && !isValid) {
        return <p className="text-danger">Ez a felhasználónév már használt</p>;
    } else {
        return <p className="text-danger">A felhasználónév hossza nem megengedett: 3-15 karakter</p>;
    }
}
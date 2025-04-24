'use client';
//firebase importok
import { auth, googleAuthProvider, firestore } from '../lib/firebase';
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";
// user context importok
import {UserContext} from "../lib/AuthContext";
import {useCallback, useContext, useEffect, useState} from "react";
//lodash helyett NEXTJS saját debouncer
import { debounce } from "next/dist/server/utils";
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';


// Bejelentkezés Google gomb
export function LogInButton() {
    const [signInWithGoogle, _, loading, error] = useSignInWithGoogle(auth);

    if (loading) return <button disabled>Bejelentkezés folyamatban</button>;
    if (error) return <p>Hiba: {error.message}</p>;

    return (
        <button className="btn-google" onClick={() => signInWithGoogle()}>
            <img src={'/google-logo.svg'} width="30px" alt="Google logo"/>
            Bejelentkezés Google fiókkal
        </button>
    );
}

// Kijelentkezés gomb
export function LogOutButton() {
    return <button onClick={() => signOut(auth)}>Kijelentkezés</button>
}

// Felhasználónév űrlap
export function UsernameForm() {
    const [formValue, setFormValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useContext(UserContext);

    const onSubmit = async (e) => {
        e.preventDefault();

        // Create refs for both documents
        const userDoc = doc(firestore, 'users', user.uid);
        const usernameDoc = doc(firestore, 'usernames', formValue);

        // Commit both docs together as a batch write.
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
        // nézz utána a validateFormat hogy működik
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


    // useCallback kell a debouncehoz
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
                    <h3>Debug infók</h3>

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
        return <p className="text-danger">Ez a felhasználónév már foglalt!</p>;
    } else {
        return <p></p>;
    }
}
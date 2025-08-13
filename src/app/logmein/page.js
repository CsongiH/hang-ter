'use client';
//fireBs verzió 9


{/* ********************************

 IMPORTOKAT FEL KELL TAKARÍTANI

 ****************************-*/}



//firebase importok
import { auth, googleAuthProvider, firestore } from '../../../lib/firebase';
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";
// user context importok
import { UserContext } from "../../../lib/AuthContext";
import { useCallback, useContext, useEffect, useState } from "react";
//lodash helyett NEXTJS saját debouncer
import { debounce } from "next/dist/server/utils";
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { LogInButton, LogOutButton, UsernameForm, FelhasznaloNevUzenet } from "../../../components/LogInButtons.js";

export default function LogMeIn() {

    const { user, username } = useContext(UserContext);

    console.log('Current user:', user);
    console.log('Current username:', username);

    /*
        const user = null;
        const username = null;
    */
    return (
        <main>
            <h1>LoginPage</h1>
            {user ?
                !username ?
                    <UsernameForm />
                    : <LogOutButton />
                : <LogInButton />
            }
        </main>
    )
}


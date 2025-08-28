"use client";

import Link from 'next/link';
import { useUserContext } from "../lib/AuthContext";


export default function CheckAuthentication(props) {
    const { username } = useUserContext();
    return username
        ?
        props.children
        :
        <Link href="/logmein">
            <button>Bejelentkezés</button>
        </Link>;
}
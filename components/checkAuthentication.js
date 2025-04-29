"use client";

import Link from 'next/link';
import {useUserContext} from "../lib/AuthContext";


export default function CheckAuthentication(props) {
    const { username } = useUserContext();
    // ha nincs username login gombot dob <-ehelyett dojon egyől a /logmein re
    return username
        ?
        props.children
        :
        <Link href="/logmein">
        <button>Bejelentkezés</button>
        </Link>;
}
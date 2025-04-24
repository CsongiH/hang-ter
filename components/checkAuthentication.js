"use client";

import Link from 'next/link';
import {useUserContext} from "../lib/AuthContext";


export default function CheckAuthentication(props) {
    const { username } = useUserContext();
    // ha nincs username, fallback vagy login link
    return username
        ? props.children
        : props.fallback
        || <Link href="/logmein">Login</Link>;
}
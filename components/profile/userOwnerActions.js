'use client';

import Link from "next/link";
import { useUserContext } from "../../lib/AuthContext";
import { LogOutButton } from "../auth/logInButtons";

export default function UserOwnerActions({ profileUsername }) {
    const { username } = useUserContext();
    const isOwner = !!username && username === profileUsername;

    return (
        <div style={{ padding: '12px 0 16px 0' }}>
            {isOwner ? (
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                    <Link href="/editprofile">
                        <button className="button">Profil szerkesztése</button>
                    </Link>
                    <LogOutButton />
                </div>
            ) : null}
        </div>
    );
}

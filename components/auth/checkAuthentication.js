"use client";

import Link from "next/link";
import { useUserContext } from "../../lib/AuthContext";

export default function CheckAuthentication({ children }) {
    const { user, username } = useUserContext();

    if (username) return children;

    if (user) {
        return (
            <div className="card max-w-[480px] mx-auto text-center">
                <p className="h2 m-0">Fejezd be a profilod beállítását!</p>
                <div className="row justify-center mt-3">
                    <Link href="/logmein" className="button button--accent">
                        Felhasználónév beállítása
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="card max-w-[480px] mx-auto text-center">
            <p className="h2 m-0">Ehhez a funkcióhoz be kell jelentkezned!</p>
            <div className="row justify-center mt-3">
                <Link href="/logmein" className="button button--accent">
                    Bejelentkezés
                </Link>
            </div>
        </div>
    );
}

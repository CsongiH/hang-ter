'use client';

import Link from "next/link";
import {UserContext} from "../lib/AuthContext";
import {useContext} from "react";

export default function Navbar() {

    const {user, username} = useContext(UserContext);

    /*
        const user = null;
    const username = null;
     */



    return (

        <nav className="navbar">
            <ul>
                <li>
                    <Link href="/">
                        <button>HangTér</button>
                    </Link>
                </li>
                <li>
                    <Link href="/">
                        <button>Zenekarok</button>
                    </Link>
                </li>
                <li>
                    <Link href="/">
                        <button>Zenészek</button>
                    </Link>
                </li>
                <li>
                    <Link href="/post">
                        <button>Poszt</button>
                    </Link>
                </li>




                {
                    //bejelentezés check
                    username && (
                        <>
                            <li>
                                    <Link href="/admin">
                                        <button>Admin</button>
                                    </Link>
                            </li>

                            <li>
                                <Link href={`/${username}`}>
                                    <img src={user?.photoURL} />
                                </Link>
                            </li>
                        </>
                    )
                }
                {
                    !username && (
                        <li>
                            <Link href="/logmein">
                                <button>Bejelentkezés</button>
                            </Link>
                        </li>
                    )
                }

            </ul>
        </nav>
    )

}

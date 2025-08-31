'use client';

import Link from "next/link";
import { UserContext } from "../lib/AuthContext";
import { useContext } from "react";

export default function Navbar() {

    const { user, username, isAdmin } = useContext(UserContext);

    /*
        const user = null;
    const username = null;
     */

    return (

        <nav className="navbar sticky">
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
                    <Link href="/posteditor">
                        <button>Poszt</button>
                    </Link>
                </li>


                {/* ******************************************************************
                bejelentezés check
                ha létzik username -> Admin(isAdmin) alapján <- nincs még kész
                nem létezik username -> logmein (kezeli, ha user van de username nincs)
                ******************************************************************* */}

                {
                    username && (
                        <>
                            <li>
                                {/*FIREBASE isAdmin ALAPJÁN ADMIN CHECK <- nincs még kész*/}
                                {isAdmin && (
                                    <Link href="/admin">
                                        <button>Admin</button>
                                    </Link>
                                )}
                            </li>

                            <li>
                                <Link href={`/${username}`}>
                                    <img src={user?.photoURL || "/user-icon-placeholder.png"} alt={"User profile picture"} />
                                    {/* alt tagek magyarul vagy angolul?? */}
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

'use client';

import { UserContext } from "../../../lib/AuthContext";
import { useContext } from "react";
import { LogInButton, LogOutButton, UsernameForm } from "../../../components/LogInButtons.js";

export default function LogMeIn() {

    const { user, username } = useContext(UserContext);

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


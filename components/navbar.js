'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUserContext } from '../lib/AuthContext';

export default function Navbar() {
    const { user, username, isAdmin } = useUserContext();

    return (
        <nav
            className="card"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                padding: 12,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: 'var(--r-lg)',
                borderBottomRightRadius: 'var(--r-lg)',
                marginLeft: '0',
                marginRight: '0',
            }}
        >
            <div className="row justify-between items-center">
                <div className="row items-center">
                    <Link href="/">
                        <span className="logo">HangTér</span>
                    </Link>
                </div>

                <div className="row items-center">
                    {username ? (
                        <>
                            <Link href="/posteditor" className="button button--accent">
                                Poszt létrehozása
                            </Link>

                            {isAdmin && (
                                <Link href="/admin" className="button button--accent">
                                    Admin
                                </Link>
                            )}

                            <Link href={`/${encodeURIComponent(username)}`}>
                                <Image
                                    src={user?.photoURL || '/user-icon-placeholder.png'}
                                    alt={`${username} profilja`}
                                    width={42}
                                    height={42}
                                    className="block w-[42px] h-[42px] rounded-full object-cover bg-[var(--bg-2)] border border-[var(--bg-2)] box-border"
                                />
                            </Link>
                        </>
                    ) : (
                        <Link href="/logmein" className="button button--accent">
                            Bejelentkezés
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

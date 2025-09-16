'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '../../../lib/AuthContext';
import {
    collection,
    collectionGroup,
    onSnapshot,
    query,
    limit,
    updateDoc,
    doc,
} from 'firebase/firestore';
import { firestore } from '../../../lib/firebase';

export default function AdminPage() {
    const router = useRouter();
    const { user, isAdmin } = useContext(UserContext);

    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);

    const [userSearch, setUserSearch] = useState('');
    const [postSearch, setPostSearch] = useState('');
    const [onlyBanned, setOnlyBanned] = useState(false);
    const [onlyRemoved, setOnlyRemoved] = useState(false);

    useEffect(() => {
        if (user === undefined) return;
        if (!user || !isAdmin) router.replace('/404');
    }, [user, isAdmin, router]);

    useEffect(() => {
        if (!user || !isAdmin) return;
        const unsubUsers = onSnapshot(
            query(collection(firestore, 'users'), limit(500)),
            snap =>
                setUsers(
                    snap.docs.map(d => ({
                        id: d.id,
                        ref: d.ref,
                        ...d.data(),
                    })),
                ),
        );
        const unsubPosts = onSnapshot(
            query(collectionGroup(firestore, 'posts'), limit(500)),
            snap =>
                setPosts(
                    snap.docs.map(d => ({
                        id: d.id,
                        ref: d.ref,
                        ...d.data(),
                    })),
                ),
        );
        return () => {
            unsubUsers?.();
            unsubPosts?.();
        };
    }, [user, isAdmin]);

    const filteredUsers = useMemo(() => {
        const q = userSearch.trim().toLowerCase();
        return users.filter(u => {
            if (onlyBanned && !u.isBanned) return false;
            if (!q) return true;
            const a = [
                u.username?.toLowerCase(),
                u.displayName?.toLowerCase(),
                u.email?.toLowerCase(),
                u.id?.toLowerCase(),
            ].filter(Boolean);
            return a.some(x => x.includes(q));
        });
    }, [users, userSearch, onlyBanned]);

    const filteredPosts = useMemo(() => {
        const q = postSearch.trim().toLowerCase();
        return posts.filter(p => {
            if (onlyRemoved && !p.isRemoved) return false;
            if (!q) return true;
            const a = [
                p.title?.toLowerCase(),
                p.slug?.toLowerCase(),
                p.username?.toLowerCase(),
                Array.isArray(p.instrumentTags) ? p.instrumentTags.join(',').toLowerCase() : '',
                Array.isArray(p.cityTags) ? p.cityTags.join(',').toLowerCase() : '',
            ];
            return a.some(x => x && x.includes(q));
        });
    }, [posts, postSearch, onlyRemoved]);

    const toggleUserBan = async u => {
        try {
            await updateDoc(doc(firestore, 'users', u.id), { isBanned: !u.isBanned });
        } catch { }
    };

    const togglePostRemoved = async p => {
        try {
            await updateDoc(p.ref, { isRemoved: !p.isRemoved });
        } catch { }
    };

    const openUser = u => router.push(`/admin/users/${u.id}`);
    const openPost = (p) => router.push(`/admin/posts/${p.ref.path}`);


    if (!user || !isAdmin) return null;

    return (
        <main className="p-4">
            <h1 className="text-xl font-semibold mb-4">Admin</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <input
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            placeholder="Keresés felhasználók között…"
                            className="input input-bordered w-full"
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={onlyBanned}
                                onChange={e => setOnlyBanned(e.target.checked)}
                            />
                            Csak tiltottak
                        </label>
                    </div>

                    <div className="max-h-[70vh] overflow-auto divide-y">
                        {filteredUsers.map(u => (
                            <div
                                key={u.id}
                                className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50"
                            >
                                <div onClick={() => openUser(u)} className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{u.username || '(nincs username)'}</div>
                                    <div className="text-xs text-gray-500 truncate">{u.email || u.id}</div>
                                </div>
                                <label className="inline-flex items-center gap-2 pl-3">
                                    <span className="text-sm">{u.isBanned ? 'Tiltva' : 'Aktív'}</span>
                                    <input
                                        type="checkbox"
                                        checked={!!u.isBanned}
                                        onChange={() => toggleUserBan(u)}
                                        onClick={e => e.stopPropagation()}
                                    />
                                </label>
                            </div>
                        ))}
                        {!filteredUsers.length && (
                            <div className="text-sm text-gray-500 py-6 text-center">Nincs találat</div>
                        )}
                    </div>
                </section>

                <section className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <input
                            value={postSearch}
                            onChange={e => setPostSearch(e.target.value)}
                            placeholder="Keresés posztok között…"
                            className="input input-bordered w-full"
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={onlyRemoved}
                                onChange={e => setOnlyRemoved(e.target.checked)}
                            />
                            Csak eltávolítottak
                        </label>
                    </div>

                    <div className="max-h-[70vh] overflow-auto divide-y">
                        {filteredPosts.map(p => (
                            <div
                                key={p.ref.path}
                                className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50"
                                onClick={() => openPost(p)}
                            >
                                <div className="min-w-0">
                                    <div className="font-medium truncate">{p.title || p.slug || '(cím nélkül)'}</div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {(Array.isArray(p.cityTags) ? p.cityTags.join(', ') : '')}
                                        {Array.isArray(p.instrumentTags) && p.instrumentTags.length
                                            ? ` • ${p.instrumentTags.join(', ')}`
                                            : ''}
                                    </div>
                                </div>
                                <label className="inline-flex items-center gap-2">
                                    <span className="text-sm">{p.isRemoved ? 'Eltávolítva' : 'Látható'}</span>
                                    <input
                                        type="checkbox"
                                        checked={!!p.isRemoved}
                                        onChange={e => {
                                            e.stopPropagation();
                                            togglePostRemoved(p);
                                        }}
                                    />
                                </label>
                            </div>
                        ))}
                        {!filteredPosts.length && (
                            <div className="text-sm text-gray-500 py-6 text-center">Nincs találat</div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

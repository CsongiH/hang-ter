'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '../../../lib/AuthContext';
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


const mapDocs = (snap) => snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() }));
const lc = (s) => String(s || '').toLowerCase();
const matches = (q, arr) => arr.some((x) => x && x.includes(q));

export default function AdminPage() {
    const router = useRouter();
    const { user, isAdmin } = useUserContext();

    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);

    const [userSearch, setUserSearch] = useState('');
    const [postSearch, setPostSearch] = useState('');
    const [onlyBanned, setOnlyBanned] = useState(false);
    const [onlyRemoved, setOnlyRemoved] = useState(false);

    useEffect(() => {
        if (!user || !isAdmin) router.replace('/404');
    }, [user, isAdmin, router]);

    useEffect(() => {
        if (!user || !isAdmin) return;
        const unsubUsers = onSnapshot(query(collection(firestore, 'users'), limit(500)), (snap) => setUsers(mapDocs(snap)));
        const unsubPosts = onSnapshot(query(collectionGroup(firestore, 'posts'), limit(500)), (snap) => setPosts(mapDocs(snap)));
        return () => {
            unsubUsers?.();
            unsubPosts?.();
        };
    }, [user, isAdmin]);

    const filteredUsers = useMemo(() => {
        const q = lc(userSearch.trim());
        return users.filter((u) => {
            if (onlyBanned && !u.isBanned) return false;
            if (!q) return true;
            return matches(q, [lc(u.username), lc(u.displayName), lc(u.email), lc(u.id)]);
        });
    }, [users, userSearch, onlyBanned]);

    const filteredPosts = useMemo(() => {
        const q = lc(postSearch.trim());
        return posts.filter((p) => {
            if (onlyRemoved && !p.isRemoved) return false;
            if (!q) return true;
            const cities = Array.isArray(p.cityTags) ? p.cityTags.join(',').toLowerCase() : '';
            const instruments = Array.isArray(p.instrumentTags) ? p.instrumentTags.join(',').toLowerCase() : '';
            return matches(q, [lc(p.title), lc(p.slug), lc(p.username), cities, instruments]);
        });
    }, [posts, postSearch, onlyRemoved]);

    const toggleUserBan = async (u) => {
        try {
            await updateDoc(doc(firestore, 'users', u.id), { isBanned: !u.isBanned });
        } catch { }
    };

    const togglePostRemoved = async (p) => {
        try {
            await updateDoc(p.ref, { isRemoved: !p.isRemoved });
        } catch { }
    };

    if (!user || !isAdmin) return null;

    const panelHeight = 'calc(100vh - 140px)';

    return (
        <main className="layout">
            <h1 className="h1">Admin</h1>

            <div
                className="grid"
                style={{
                    gap: 24,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                    alignItems: 'stretch',
                }}
            >
                <section className="card" style={{ height: panelHeight, display: 'flex', flexDirection: 'column' }}>
                    <div className="row" style={{ alignItems: 'center', marginBottom: 8 }}>
                        <input
                            className="input"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Keresés felhasználók között…"
                        />
                        <label className="row" style={{ gap: 8 }}>
                            <input
                                type="checkbox"
                                checked={onlyBanned}
                                onChange={(e) => setOnlyBanned(e.target.checked)}
                            />
                            <span className="small">Csak tiltottak</span>
                        </label>
                    </div>

                    <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                        {filteredUsers.map((u) => (
                            <div
                                key={u.id}
                                className="row"
                                style={{
                                    justifyContent: 'space-between',
                                    padding: '10px 4px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid var(--bg-2)',
                                }}
                            >
                                <div
                                    className="stack"
                                    style={{ minWidth: 0 }}
                                    onClick={() => {
                                        const seg = u.username ? encodeURIComponent(String(u.username).toLowerCase()) : encodeURIComponent(u.id);
                                        router.push(`/admin/${seg}`);
                                    }}
                                >
                                    <div
                                        className="small"
                                        style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    >
                                        {u.username || '(nincs username)'}
                                    </div>
                                    <div
                                        className="small muted"
                                        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    >
                                        {u.email || u.id}
                                    </div>
                                </div>
                                <label className="row" style={{ gap: 8 }} onClick={(e) => e.stopPropagation()}>
                                    <span className="small">{u.isBanned ? 'Tiltva' : 'Aktív'}</span>
                                    <input
                                        type="checkbox"
                                        checked={!!u.isBanned}
                                        onChange={() => toggleUserBan(u)}
                                    />
                                </label>
                            </div>
                        ))}
                        {!filteredUsers.length && (
                            <div className="small muted" style={{ textAlign: 'center', padding: '16px 0' }}>
                                Nincs találat
                            </div>
                        )}
                    </div>
                </section>

                <section className="card" style={{ height: panelHeight, display: 'flex', flexDirection: 'column' }}>
                    <div className="row" style={{ alignItems: 'center', marginBottom: 8 }}>
                        <input
                            className="input"
                            value={postSearch}
                            onChange={(e) => setPostSearch(e.target.value)}
                            placeholder="Keresés posztok között…"
                        />
                        <label className="row" style={{ gap: 8 }}>
                            <input
                                type="checkbox"
                                checked={onlyRemoved}
                                onChange={(e) => setOnlyRemoved(e.target.checked)}
                            />
                            <span className="small">Csak eltávolítottak</span>
                        </label>
                    </div>

                    <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                        {filteredPosts.map((p) => (
                            <div
                                key={p.ref.path}
                                className="row"
                                style={{
                                    justifyContent: 'space-between',
                                    padding: '10px 4px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid var(--bg-2)',
                                }}
                                onClick={() => {
                                    const userSeg =
                                        p.username
                                            ? encodeURIComponent(String(p.username).toLowerCase())
                                            : encodeURIComponent(String(p.uid ?? p.ref.path.split('/')[1]));
                                    const postSeg = encodeURIComponent(String(p.slug ?? p.id));
                                    router.push(`/admin/${userSeg}/${postSeg}`);
                                }}
                            >
                                <div className="stack" style={{ minWidth: 0 }}>
                                    <div
                                        className="small"
                                        style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    >
                                        {p.title || p.slug || '(cím nélkül)'}
                                    </div>
                                    <div
                                        className="small muted"
                                        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    >
                                        {Array.isArray(p.cityTags) ? p.cityTags.join(', ') : ''}
                                        {Array.isArray(p.instrumentTags) && p.instrumentTags.length ? ` • ${p.instrumentTags.join(', ')}` : ''}
                                    </div>
                                </div>
                                <label className="row" style={{ gap: 8 }} onClick={(e) => e.stopPropagation()}>
                                    <span className="small">{p.isRemoved ? 'Eltávolítva' : 'Látható'}</span>
                                    <input
                                        type="checkbox"
                                        checked={!!p.isRemoved}
                                        onChange={() => togglePostRemoved(p)}
                                    />
                                </label>
                            </div>
                        ))}
                        {!filteredPosts.length && (
                            <div className="small muted" style={{ textAlign: 'center', padding: '16px 0' }}>
                                Nincs találat
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

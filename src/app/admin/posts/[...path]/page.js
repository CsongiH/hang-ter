'use client';

import { useContext, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../../../../lib/firebase';
import { UserContext } from '../../../../../lib/AuthContext';

export default function AdminPostDetailPage() {
    const { user, isAdmin } = useContext(UserContext);
    const router = useRouter();
    const { path } = useParams(); // catch-all segments: ["users","<uid>","posts","<postId>"]

    const [data, setData] = useState(undefined); // undefined = loading, null = not found, object = data

    // Auth gate without causing hook order issues
    useEffect(() => {
        if (user === undefined || typeof isAdmin === 'undefined') return;
        if (!user || !isAdmin) router.replace('/404');
    }, [user, isAdmin, router]);

    // Live load the document (same style as user list)
    useEffect(() => {
        if (!Array.isArray(path) || path.length === 0) return;
        const ref = doc(firestore, ...path);
        const unsub = onSnapshot(
            ref,
            (snap) => setData(snap.exists() ? snap.data() : null),
            () => setData(null)
        );
        return () => unsub();
    }, [path]);

    if (user === undefined || typeof isAdmin === 'undefined') return <div>Betöltés…</div>;
    if (!user || !isAdmin) return null;
    if (data === undefined) return <div>Betöltés…</div>;

    const entries = data ? Object.entries(data) : [];
    const docPath = Array.isArray(path) ? path.join('/') : '';

    return (
        <main className="p-4 max-w-5xl">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Poszt</h1>
                <button onClick={() => router.back()} className="px-3 py-1.5 border rounded-xl">Vissza</button>
            </div>

            <div className="text-sm mb-4 break-all">{docPath}</div>

            {data === null ? (
                <div>Nincs adat – a dokumentum nem létezik.</div>
            ) : (
                <div className="overflow-auto border rounded">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left p-2 border-r">Mező</th>
                                <th className="text-left p-2">Érték</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(([k, v]) => (
                                <tr key={k} className="align-top border-t">
                                    <td className="p-2 whitespace-nowrap border-r">{k}</td>
                                    <td className="p-2">
                                        {typeof v === 'object'
                                            ? <pre className="whitespace-pre-wrap break-words text-xs">{jsonForFs(v)}</pre>
                                            : String(v)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}

function jsonForFs(val) {
    return JSON.stringify(val, (key, value) => {
        if (value && typeof value.toDate === 'function') return value.toDate().toISOString();
        return value;
    }, 2);
}

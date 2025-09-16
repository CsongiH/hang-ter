'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../../../lib/firebase';
import { UserContext } from '../../../../../lib/AuthContext';

function flatten(obj, prefix = '') {
    if (!obj || typeof obj !== 'object') return { [prefix || 'value']: obj };
    return Object.entries(obj).reduce((acc, [k, v]) => {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            Object.assign(acc, flatten(v, key));
        } else {
            acc[key] = Array.isArray(v) ? v.join(', ') : v;
        }
        return acc;
    }, {});
}

export default function AdminUserDetailPage() {
    const { user, isAdmin } = useContext(UserContext);
    const router = useRouter();
    const params = useParams(); // { uid }
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!user || !isAdmin) router.replace('/404');
    }, [user, isAdmin, router]);

    useEffect(() => {
        const load = async () => {
            if (!params?.uid) return;
            const snap = await getDoc(doc(firestore, 'users', String(params.uid)));
            setData(snap.exists() ? { id: snap.id, ...snap.data() } : { id: String(params.uid), _missing: true });
        };
        load();
    }, [params?.uid]);

    if (!user || !isAdmin) return null;
    if (!data) return <main className="p-4">Betöltés…</main>;

    const rows = flatten(data);

    return (
        <main className="p-4">
            <h1 className="text-xl font-semibold mb-4">Felhasználó adatai</h1>
            <div className="overflow-auto border rounded-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-2 w-56">Mező</th>
                            <th className="text-left p-2">Érték</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(rows).map(([k, v]) => (
                            <tr key={k} className="border-t">
                                <td className="p-2 font-medium">{k}</td>
                                <td className="p-2 whitespace-pre-wrap break-all">{String(v)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

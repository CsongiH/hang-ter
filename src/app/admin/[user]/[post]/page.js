export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { firestore, jsonConvert, getUserWithUsername } from "../../../../../lib/firebase";
import AdminDataTable from "../../../../../components/admin/adminDataTable";

export default async function AdminPostDetail(props) {
    const { params } = props;
    const p = await params;
    const userParam = p?.user;
    const post = p?.post;
    if (!userParam || !post) return notFound();

    let userDocSnap = await getDoc(doc(firestore, "users", userParam));
    if (!userDocSnap.exists()) {
        const byUsername = await getUserWithUsername(String(userParam).toLowerCase());
        if (!byUsername) return notFound();
        userDocSnap = byUsername;
    }

    const uid = userDocSnap.id;
    const postRef = doc(firestore, "users", uid, "posts", post);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return notFound();

    const path = `users/${uid}/posts/${post}`;

    return (
        <main className="layout">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                <h1 className="h1">Poszt részletek</h1>
                <Link href="/admin">
                    <button className="button button--ghost">Vissza</button>
                </Link>
            </div>

            <div className="grid" style={{ gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
                <AdminDataTable title="Poszt" data={{ path, ...jsonConvert(snap) }} />
                <AdminDataTable title="Szerző" data={{ uid, ...jsonConvert(userDocSnap) }} />
            </div>
        </main>
    );
}

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { firestore, jsonConvert, getUserWithUsername } from "../../../../lib/firebase";
import AdminDataTable from "../../../../components/adminDataTable";

export default async function AdminUserDetail(props) {
    const { params } = props;
    const userParam = params?.user;
    if (!userParam) return notFound();

    let userSnap = await getDoc(doc(firestore, "users", userParam));
    if (!userSnap.exists()) {
        const byUsername = await getUserWithUsername(String(userParam).toLowerCase());
        if (!byUsername) return notFound();
        userSnap = byUsername;
    }

    const uid = userSnap.id;

    return (
        <main className="layout">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                <h1 className="h1">Felhasználó</h1>
                <Link href="/admin">
                    <button className="button button--ghost">Vissza</button>
                </Link>
            </div>

            <AdminDataTable title="Felhasználó adatok" data={{ uid, ...jsonConvert(userSnap) }} />
        </main>
    );
}

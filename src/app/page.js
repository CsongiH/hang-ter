//végleges
import { collectionGroup, query, orderBy, limit, getDocs } from "firebase/firestore";
import { jsonConvert, firestore } from "../../lib/firebase";
import TagFilter from "../../components/ui/tagFilter";
import CardLoader from "../../components/ui/cardLoader";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const snap = await getDocs(
        query(collectionGroup(firestore, "posts"), orderBy("createdAt", "desc"), limit(50))
    );
    const docs = snap.docs.map(jsonConvert).filter(Boolean);

    return (
        <main className="layout">
            <TagFilter />
            <h2 className="h1">Posztok</h2>
            <CardLoader initialPosts={docs} />
        </main>
    );
}

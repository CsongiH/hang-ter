import { firestore } from "../../../lib/firebase";
import {
    collectionGroup,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "firebase/firestore";
import { jsonConvert } from "../../../lib/firebase";
import TagFilter from "../../../components/tagFilter";
import CardLoader from "../../../components/cardLoader";

export const dynamic = "force-dynamic";

export default async function SearchPage(props) {
    const { searchParams } = await props;
    const { instrument, city, type } = (await searchParams) ?? {};

    const parseList = val =>
        typeof val === "string" && val.length
            ? val.split(",").map(s => s.trim())
            : [];

    const instruments = parseList(instrument);
    const cities = parseList(city);

    const base = collectionGroup(firestore, "posts");
    const orderClause = orderBy("createdAt", "desc");
    const typeClause = type ? [where("postType", "!=", type), orderBy("postType")] : [];

    let docs = [];

    if (instruments.length && cities.length) {
        const instSnap = await getDocs(
            query(
                base,
                ...typeClause,
                where("instrumentTags", "array-contains-any", instruments),
                orderClause,
                limit(50)
            )
        );
        const citySnap = await getDocs(
            query(
                base,
                ...typeClause,
                where("cityTags", "array-contains-any", cities),
                orderClause,
                limit(50)
            )
        );
        const instIds = new Set(instSnap.docs.map(d => d.id));
        docs = citySnap.docs.filter(d => instIds.has(d.id));

    } else if (instruments.length) {
        const snap = await getDocs(
            query(
                base,
                ...typeClause,
                where("instrumentTags", "array-contains-any", instruments),
                orderClause,
                limit(50)
            )
        );
        docs = snap.docs;

    } else if (cities.length) {
        const snap = await getDocs(
            query(
                base,
                ...typeClause,
                where("cityTags", "array-contains-any", cities),
                orderClause,
                limit(50)
            )
        );
        docs = snap.docs;

    } else {
        const snap = await getDocs(
            query(
                base,
                ...typeClause,
                orderClause,
                limit(50)
            )
        );
        docs = snap.docs;
    }

    const posts = docs.map(jsonConvert);
    const key = `${instrument || "_"}-${city || "_"}-${type || "_"}`;

    return (
        <main className="p-4">
            <TagFilter />
            <h1>Results</h1>
            <CardLoader key={key} initialPosts={posts} />
        </main>
    );
}

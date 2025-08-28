/*
 * app/search/page
 * multi‐tag search workaround
 * */
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
import ClientPostLoader from "../../../components/postLoaderClientSide";


export default async function SearchPage(props) {
    const { searchParams } = await props;
    const { instrument, city, type } = (await searchParams) ?? {};

    // parse CSV → array
    const parseList = val =>
        typeof val === "string" && val.length
            ? val.split(",").map(s => s.trim())
            : [];

    const instruments = parseList(instrument);
    const cities = parseList(city);

    // build common clauses
    const base = collectionGroup(firestore, "posts");
    const orderClause = orderBy("createdAt", "desc");
    const typeClause = type ? [where("postType", "!=", type), orderBy("postType")] : [];

    let docs = [];

    if (instruments.length && cities.length) {
        // 1) query by instruments
        const instSnap = await getDocs(
            query(
                base,
                ...typeClause,
                where("instrumentTags", "array-contains-any", instruments),
                orderClause,
                limit(50)
            )
        );
        // 2) query by cities
        const citySnap = await getDocs(
            query(
                base,
                ...typeClause,
                where("cityTags", "array-contains-any", cities),
                orderClause,
                limit(50)
            )
        );
        // 3) intersection by doc.id
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
        // no multi‐tag filters: fallback to type only or latest
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

    // convert and render
    const posts = docs.map(jsonConvert);

    return (
        <main className="p-4">
            <TagFilter />
            <h1>Results</h1>
            <ClientPostLoader initialPosts={posts} />
        </main>
    );
}

import { firestore, jsonConvert } from "../../../lib/firebase";
import {
    collectionGroup,
    query,
    where,
    orderBy,
    limit,
    getDocs,
} from "firebase/firestore";
import TagFilter from "../../../components/tagFilter";
import CardLoader from "../../../components/cardLoader";

export const dynamic = "force-dynamic";

const invertType = (t) =>
    t === "looking-for-band"
        ? "looking-for-musician"
        : t === "looking-for-musician"
            ? "looking-for-band"
            : t === "concert-opportunity"
                ? "concert-opportunity"
                : "";

const parseList = (val) =>
    typeof val === "string" && val.length
        ? val.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

export default async function SearchPage(props) {
    const { searchParams } = await props;
    const { instrument, city, type } = (await searchParams) ?? {};

    const instruments = parseList(instrument);
    const cities = parseList(city);
    const mappedType = invertType(type); // apply the new logic here (NOT in TagFilter)

    const base = collectionGroup(firestore, "posts");

    const commonClauses = [where("published", "==", true)];
    if (mappedType) commonClauses.push(where("postType", "==", mappedType));

    const orderClause = orderBy("createdAt", "desc");
    const lim = limit(50);

    let docs = [];

    // NOTE: Firestore doesn't allow two array-contains-any in one query.
    // When both filters are present, run two queries and intersect by full path.
    if (instruments.length && cities.length) {
        const instSnap = await getDocs(
            query(
                base,
                ...commonClauses,
                where("instrumentTags", "array-contains-any", instruments),
                orderClause,
                lim
            )
        );

        const citySnap = await getDocs(
            query(
                base,
                ...commonClauses,
                where("cityTags", "array-contains-any", cities),
                orderClause,
                lim
            )
        );

        const instPaths = new Set(instSnap.docs.map((d) => d.ref.path));
        docs = citySnap.docs.filter((d) => instPaths.has(d.ref.path));
    } else if (instruments.length) {
        const snap = await getDocs(
            query(
                base,
                ...commonClauses,
                where("instrumentTags", "array-contains-any", instruments),
                orderClause,
                lim
            )
        );
        docs = snap.docs;
    } else if (cities.length) {
        const snap = await getDocs(
            query(
                base,
                ...commonClauses,
                where("cityTags", "array-contains-any", cities),
                orderClause,
                lim
            )
        );
        docs = snap.docs;
    } else {
        const snap = await getDocs(query(base, ...commonClauses, orderClause, lim));
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

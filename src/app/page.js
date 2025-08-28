/*
* app/page
* feed
* postLoader
* postContents
* postClientside
* nagy káosz, egyszerűsíteni kell
* */
import { collectionGroup, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { jsonConvert, firestore } from "../../lib/firebase";
import TagFilter from "../../components/tagFilter";
import ClientPostLoader from "../../components/postLoaderClientSide";

export default async function HomePage(props) {
    const { searchParams } = await props;
    const sp = await searchParams;
    const { instrument, city, type } = sp ?? {};

    const parseList = val =>
        typeof val === "string" && val.length
            ? val.split(",").map(s => s.trim())
            : [];

    const instruments = parseList(instrument);
    const cities = parseList(city);

    const filters = [];
    if (instruments.length) {
        filters.push(where("instrumentTags", "array-contains-any", instruments));
    }
    if (cities.length) {
        filters.push(where("cityTags", "array-contains-any", cities));
    }
    if (type) {
        filters.push(where("postType", "!=", type));
    }

    const baseQuery = collectionGroup(firestore, "posts");
    const postsQuery = query(
        baseQuery,
        ...filters,
        orderBy("postType"),
        orderBy("createdAt", "desc"),
        limit(20)
    );

    const snap = await getDocs(postsQuery);
    const posts = snap.docs.map(jsonConvert);

    return (
        <main className="p-4">
            <TagFilter />
            <h1>Results</h1>
            <ClientPostLoader initialPosts={posts} />
        </main>
    );
}

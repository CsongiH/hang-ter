import { firestore } from "../../lib/firebase";
import {
    collectionGroup,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "firebase/firestore";
import { jsonConvert } from "../../lib/firebase";
import TagFilter from "../../components/tagFilter";
import ClientPostLoader from "../../components/postLoaderClientSide";

export default async function SearchPage({ searchParams }) {
    // URL?instrument=guitar,drum&city=Budapest,Győr&type=looking-for-band
    const { instrument, city, type } = searchParams;

    // helper: parse comma‐separated into array
    const parseList = val =>
        typeof val === 'string' && val.length
            ? val.split(',').map(s => s.trim())
            : [];

    const instruments = parseList(instrument);
    const cities = parseList(city);

    // build dynamic filters
    const filters = [];
    if (instruments.length) {
        // OR logic across multiple instruments
        filters.push(where('instrumentTags', 'array-contains-any', instruments));
    }
    if (cities.length) {
        // OR logic across multiple cities
        filters.push(where('cityTags', 'array-contains-any', cities));
    }
    if (type) {
        // single-select filter
        filters.push(where('postType', '==', type));
    }

    // if no filters, you might want to show all or prompt user
    const baseQuery = collectionGroup(firestore, 'posts');
    const postsQuery = query(
        baseQuery,
        ...filters,
        orderBy('createdAt', 'desc'),
        limit(20)
    );

    const snap = await getDocs(postsQuery);
    const posts = snap.docs.map(jsonConvert);

    return (
        <main className="p-4">
            <TagFilter />           {/* kliens oldali szűrő UI */}
            <h1>Results</h1>
            <ClientPostLoader initialPosts={posts} />
        </main>
    );
}

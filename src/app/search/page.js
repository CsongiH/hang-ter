import { firestore, jsonConvert } from "../../../lib/firebase";
import { collectionGroup, query, where, limit, getDocs } from "firebase/firestore";
import TagFilter from "../../../components/tagFilter";
import CardLoader from "../../../components/cardLoader";
import { typeInvert } from "../../../components/tags/types";

export const dynamic = "force-dynamic";

const invertType = (ui) => typeInvert[ui] || "";

const parseList = (v) =>
    typeof v === "string" && v
        ? v.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

export default async function SearchPage({ searchParams }) {
    const sp = await searchParams;

    const instrument = sp?.instrument || "";
    const city = sp?.city || "";
    const type = sp?.type || "";

    const instruments = parseList(instrument);
    const cities = parseList(city);
    const qType = invertType(type);

    const base = collectionGroup(firestore, "posts");
    const typeWhere = qType ? [where("postType", "==", qType)] : [];

    const fetchDocs = async (wheres) => {
        const snap = await getDocs(query(base, ...wheres, limit(200)));
        return snap.docs.map(jsonConvert);
    };

    let docs = [];
    let byInst = [];
    let byCity = [];

    if (instruments.length && cities.length) {
        [byInst, byCity] = await Promise.all([
            fetchDocs([...typeWhere, where("instrumentTags", "array-contains-any", instruments)]),
            fetchDocs([...typeWhere, where("cityTags", "array-contains-any", cities)]),
        ]);
        const instSet = new Set(byInst.map((d) => `${d.uid}/${d.slug}`));
        docs = byCity.filter((d) => instSet.has(`${d.uid}/${d.slug}`));
    } else if (cities.length) {
        byCity = await fetchDocs([...typeWhere, where("cityTags", "array-contains-any", cities)]);
        docs = byCity;
    } else if (instruments.length) {
        byInst = await fetchDocs([...typeWhere, where("instrumentTags", "array-contains-any", instruments)]);
        docs = byInst;
    } else {
        docs = await fetchDocs([...typeWhere]);
    }

    docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    const key = `${instrument || "_"}-${city || "_"}-${type || "_"}`;

    return (
        <main className="layout">
            <TagFilter />
            <h2>Keresési eredmények</h2>
            <CardLoader
                key={key}
                initialPosts={docs}
                filters={{ cities, instruments, type: qType }}
            />
        </main>
    );
}

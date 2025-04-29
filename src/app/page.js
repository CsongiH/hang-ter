/*
* app/page
* feed
* postLoader
* postContents
* postClientside
* postLoaderClientSide
* nagy káosz, egyszerűsíteni kell
* */
import { firestore } from "../../lib/firebase";
import { collectionGroup, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { jsonConvert } from "../../lib/firebase";
// új kliens wrapper
import ClientPostLoader from "../../components/postLoaderClientSide";


const nrOfPosts = 10;

//ezt illene valahova átvinni ha újragondolom a posztos fájlokat

export default async function HomePage() {
    const postsQuery = query(
        collectionGroup(firestore, "posts"),
        where("published", "==", true),
        orderBy("createdAt", "desc"),
        limit(nrOfPosts)
    );

    const querySnapshot = await getDocs(postsQuery);
    const posts = querySnapshot.docs.map(jsonConvert);

    return (
        <main>
            <ClientPostLoader initialPosts={posts} />
        </main>
    );
}

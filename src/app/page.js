
/*
* app/page
* feed
* postLoader
* postContents
* postClientside
* nagy káosz, egyszerűsíteni kell
* */
import { firestore } from "../../lib/firebase";
import { collectionGroup, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { jsonConvert } from "../../lib/firebase";
import PostLoader from "../../components/postLoader"; // renamed import

const nrOfPosts = 10;

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
            <PostLoader initialPosts={posts} />
        </main>
    );
}
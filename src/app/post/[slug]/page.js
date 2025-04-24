// src/app/[user]/[post]/page.js

import { getUserWithUsername, jsonConvert, firestore } from "../../../../lib/firebase";
import { doc, getDoc, collectionGroup, getDocs } from "firebase/firestore";

export async function generateStaticParams() {
    const snapshot = await getDocs(collectionGroup(firestore, "posts"));

    return snapshot.docs.map((doc) => {
        const { slug, username } = doc.data();
        return { username, slug };
    });
}

export default async function ViewPostPage({ params }) {
    const { username, slug } = params;

    const userDoc = await getUserWithUsername(username);

    if (!userDoc) {
        return <main>Bejegyzés nem található.</main>;
    }

    const postRef = doc(firestore, `users/${userDoc.id}/posts/${slug}`);
    const postSnap = await getDoc(postRef);
    const post = jsonConvert(postSnap);
    const postPath = postRef.path;

    return (
        <main>
            {/* Render your post component here */}
            <pre>{JSON.stringify(post, null, 2)}</pre>
            <p>Post path: {postPath}</p>
        </main>
    );
}

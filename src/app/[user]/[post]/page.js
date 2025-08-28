import { getUserWithUsername, jsonConvert, firestore } from "../../../../lib/firebase";
import { doc, getDoc, collectionGroup, getDocs } from "firebase/firestore";
import PostClientSide from "../../../../components/postClientSide"; // kliens rész
import { notFound } from "next/navigation";

//legenralja a pathet
export async function generateStaticParams() {
    const snapshot = await getDocs(collectionGroup(firestore, "posts"));

    return snapshot.docs.map((doc) => {
        const { slug, username } = doc.data();
        return { user: username, post: slug };
    });
}

export default async function ViewPost(props) {
    const { params } = await props;
    const { user, post } = await params;

    const userData = await getUserWithUsername(user);
    if (!userData) return notFound();

    const postRef = doc(firestore, `users/${userData.id}/posts/${post}`);
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) return notFound();

    const postData = jsonConvert(postDoc);
    const postPath = postRef.path;

    return (
        <main className="p-4">
            <PostClientSide path={postPath} post={postData} />
            <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-500">Raw data</summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap break-words">
                    {JSON.stringify(postData, null, 2)}
                </pre>
                <div className="mt-2 text-xs break-words">Path: {postPath}</div>
            </details>
        </main>
    );
}

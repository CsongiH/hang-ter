import { getUserWithUsername, jsonConvert, firestore } from "../../../../lib/firebase";
import { doc, getDoc, collectionGroup, getDocs } from "firebase/firestore";
import PostClientSide from "../../../../components/postClientSide"; // kliens rész

//legenralja a pathet
export async function generateStaticParams() {
    const snapshot = await getDocs(collectionGroup(firestore, "posts"));

    return snapshot.docs.map((doc) => {
        const { slug, username } = doc.data();
        return { user: username, post: slug };
    });
}


export default async function ViewPost(props) {
    const { user, post } = await props.params;

    const userData = await getUserWithUsername(user);
    if (!userData) return <main>Felhasználó nem található.</main>;


    const postRef = doc(firestore, `users/${userData.id}/posts/${post}`);
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) return <main>Poszt nem található.</main>;

    const postData = jsonConvert(postDoc);
    const postPath = postRef.path;

    return (
        <main className="p-4">
            <PostClientSide path={postPath} post={postData} />
        </main>
    );
}

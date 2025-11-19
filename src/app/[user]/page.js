import { notFound } from 'next/navigation';
import { getUserWithUsername, jsonConvert } from "../../../lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { firestore } from "../../../lib/firebase";
import Profile from "../../../components/profile/profile";
import CardLoader from '../../../components/ui/cardLoader';
import UserOwnerActions from '../../../components/profile/userOwnerActions';

export const revalidate = 60; //percenként ISR

export default async function UserPage(props) {
    const { user: username } = await props.params;

    const userData = await getUserWithUsername(username);
    if (!userData) notFound();

    const postsRef = collection(firestore, "users", userData.id, "posts");
    const postsQuery = query(postsRef, orderBy("createdAt", "desc"), limit(5));
    const postsSnap = await getDocs(postsQuery);
    const posts = postsSnap.docs.map(jsonConvert);
    const user = userData.data();

    return (
        <main className="layout">
            <Profile user={user} />
            <UserOwnerActions profileUsername={username} />
            <CardLoader initialPosts={posts} scopeUid={userData.id} showEdit={true} />
        </main>
    );
}

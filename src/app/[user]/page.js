
import { notFound } from 'next/navigation';
import { getUserWithUsername, jsonConvert } from "../../../lib/firebase";
import Profile from "../../../components/profile";
import Feed from "../../../components/feed";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { firestore } from "../../../lib/firebase";
import { LogOutButton } from "../../../components/logInButtons";
import Link from "next/link";

export default async function UserPage(props) {
    const { user: username } = await props.params;

    const userData = await getUserWithUsername(username);
    if (!userData) {
        notFound();
    }

    const postsRef = collection(firestore, "users", userData.id, "posts");
    const postsQuery = query(
        postsRef,
        where("published", "==", true),
        orderBy("createdAt", "desc"),
        limit(5)
    );
    const postsSnap = await getDocs(postsQuery);
    const posts = postsSnap.docs.map(jsonConvert);
    const user = userData.data();

    return (
        <main>
            <Profile user={user} />
            <Link href="/editprofile">
                <button>Profil szerkesztése</button>
            </Link>
            <LogOutButton />
            <Feed posts={posts} />
        </main>
    );
}

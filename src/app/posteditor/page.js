'use client';

import CheckAuthentication from '../../../components/checkAuthentication';
import feed from '../../../components/feed';
import { UserContext } from '../../../lib/AuthContext';
import { firestore, auth, serverTimestamp } from '../../../lib/firebase';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostLoader from '../../../components/postLoader';

import { collection, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

export default function EditorPostsPage() {
    return (
        <main >
            <CheckAuthentication>
                <MyPosts/>
                <NewPost />
            </CheckAuthentication>
        </main>
    );
}

function MyPosts() {
    const { username } = useContext(UserContext);
    const uid = auth.currentUser?.uid;
    // postsRef: a saját posztjaim
    const postsReference = collection(firestore, 'users', uid, 'posts');
    const queryPosts = query(postsReference, orderBy('createdAt'));
    const [snapshot] = useCollection(queryPosts);

    const posts = snapshot?.docs.map(doc => doc.data()) || [];

    return (
        <>
            <h1>Saját posztjaim</h1>
            <PostLoader posts={posts} modifyPost={true} />
        </>
    );
}

function NewPost() {
    const router = useRouter();
    const { username } = useContext(UserContext);
    const [title, setTitle] = useState('');

    const kebabSlug = encodeURI(kebabCase(title));
    const isValid = title.length > 3 && title.length < 100;

    const createPost = async e => {
        e.preventDefault();
        const uid = auth.currentUser.uid;
        const ref = doc(firestore, 'users', uid, 'posts', kebabSlug);

        const data = {
            title,
            kebabSlug,
            uid,
            username,
            published: false,
            content: '# hello world!',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(ref, data);
        // toast.success('Poszt létrehozva!');

        router.push(`/posteditor/${slug}`);
    };

    return (
        <form onSubmit={createPost} >
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Hirdetés neve"
            />
            <p>
                <strong>Slug: </strong> {kebabSlug}
            </p>
            <button type="submit" disabled={!isValid} className="btn-green">
                Poszt publikálása
            </button>
        </form>
    );
}

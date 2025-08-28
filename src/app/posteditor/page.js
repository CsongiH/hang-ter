'use client';

import CheckAuthentication from '../../../components/checkAuthentication';
import PostLoader from '../../../components/postLoader';
import { firestore, auth, serverTimestamp, jsonConvert } from '../../../lib/firebase';
import {
    collectionGroup,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    setDoc
} from 'firebase/firestore';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '../../../lib/AuthContext';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

export default function EditorPostsPage() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function getPosts() {
            const postsQuery = query(
                collectionGroup(firestore, 'posts'),
                where('published', '==', true),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            const snap = await getDocs(postsQuery);
            setPosts(snap.docs.map(jsonConvert));
            setIsLoading(false);
        }
        getPosts();
    }, []);

    return (
        <main>
            <CheckAuthentication>
                <NewPost />
                <PostLoader initialPosts={posts} />
            </CheckAuthentication>
        </main>
    );
}

function NewPost() {
    const router = useRouter();
    const { username } = useContext(UserContext);
    const [title, setTitle] = useState('');

    const slug = encodeURI(kebabCase(title));
    const isValid = title.length > 3 && title.length < 100;

    const createPost = async e => {
        e.preventDefault();
        const uid = auth.currentUser.uid;
        const ref = doc(firestore, 'users', uid, 'posts', slug);

        const data = {
            title,
            slug,
            uid,
            username,
            published: false,
            content: 'Add meg a posztod leírását',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(ref, data);
        toast.success('Poszt létrehozva!');
        router.push(`/posteditor/${slug}`);
    };

    return (
        <form onSubmit={createPost}>
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Hirdetés neve"
            />
            <button type="submit" disabled={!isValid} className="btn-green">
                Poszt létrehozása
            </button>
        </form>
    );
}

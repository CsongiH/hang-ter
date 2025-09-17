'use client';

import { useContext, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

import CheckAuthentication from '../../../../components/checkAuthentication';
import PostForm from '../../../../components/postForm';
import { UserContext } from '../../../../lib/AuthContext';
import { firestore, auth } from '../../../../lib/firebase';

export default function PostEditPage() {
    return (
        <CheckAuthentication>
            <PostManager />
            <Toaster />
        </CheckAuthentication>
    );
}

function PostManager() {
    const router = useRouter();
    const { slug } = useParams();
    const { username } = useContext(UserContext);

    const postRef = doc(firestore, 'users', auth.currentUser.uid, 'posts', slug);
    const [post, loading] = useDocumentData(postRef);

    useEffect(() => {
        if (!loading && post === undefined) router.replace('/404');
    }, [loading, post, router]);

    if (loading) return <div>Betöltés…</div>;
    if (!post) return null;

    return (
        <main className="p-4 space-y-4">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <PostForm
                mode="edit"
                postRef={postRef}
                defaultValues={{
                    title: post.title,
                    content: post.content,
                    instrumentTags: post.instrumentTags || [],
                    cityTags: post.cityTags || [],
                    postType: post.postType || '',
                }}
            />
        </main>
    );
}

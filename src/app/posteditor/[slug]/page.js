'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { useUserContext } from '../../../../lib/AuthContext';
import CheckAuthentication from '../../../../components/auth/checkAuthentication';
import PostForm from '../../../../components/forms/postForm';
import { firestore } from '../../../../lib/firebase';

export default function PostEditPage() {
    return (
        <CheckAuthentication>
            <PostManager />
        </CheckAuthentication>
    );
}

function PostManager() {
    const router = useRouter();
    const { slug } = useParams();
    const { user } = useUserContext();

    const postRef = user ? doc(firestore, 'users', user.uid, 'posts', slug) : undefined;
    const [post, loading] = useDocumentData(postRef);

    useEffect(() => {
        if (!slug) {
            router.replace('/404');
            return;
        }
        if (!loading && post === undefined) {
            router.replace('/404');
        }
    }, [loading, post, router, slug]);

    if (!slug || loading) {
        return (
            <main className="layout">
                <section className="card max-w-[720px] mx-auto text-center">
                    <span className="small muted">Betöltés…</span>
                </section>
            </main>
        );
    }

    if (!post) return null;

    return (
        <main className="layout">
            <section className="card max-w-[720px] mx-auto">
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
            </section>
        </main>
    );
}
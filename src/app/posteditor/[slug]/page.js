'use client';

import { useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';

import CheckAuthentication from '../../../../components/checkAuthentication';
import { UserContext } from '../../../../lib/AuthContext';
import { firestore, auth, serverTimestamp } from '../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';


export default function PostEdit() {
    return (
        <CheckAuthentication>
            <ManagePost />
        </CheckAuthentication>
    );
}

function ManagePost() {
    const router = useRouter();
    const { slug } = useParams();
    const { username } = useContext(UserContext);
    const postRef = doc(firestore, 'users', auth.currentUser.uid, 'posts', slug);
    const [post] = useDocumentData(postRef);


    return (
        <main className="p-4">
            {post && (
                <>
                    <section>
                        <h1 className="text-3xl font-bold">{post.title}</h1>

                        <PostForm
                            postRef={postRef}
                            defaultValues={post}
                        />
                    </section>

                    <aside>
                        <Link href={`/${username}/${slug}`}>
                            <button className="btn-blue">Ugrás a posztra</button>
                        </Link>
                    </aside>
                </>
            )}
        </main>
    );
}

function PostForm({ defaultValues, postRef, preview }) {
    const { register, handleSubmit, reset, watch, formState: { isValid } } = useForm({
        defaultValues,
        mode: 'onChange'
    });

    const updatePost = async ({ content, published }) => {
        // Frissítés Firestore-ban
        await updateDoc(postRef, {
            content,
            published,
            updatedAt: serverTimestamp()
        });

        reset({ content, published });
    };

    return (
        <form onSubmit={handleSubmit(updatePost)}>
            {preview && (
                <div className="card">
                    <ReactMarkdown>{watch('content')}</ReactMarkdown>
                </div>
            )}

            <div>
        <textarea style={{color: 'black', background: 'white'}}
            {...register('content')}
            className="textarea"
        />



                <button
                    type="submit"
                    disabled={!isValid}
                    className="btn-green mt-4"
                >
                    Mentés
                </button>
            </div>
        </form>
    );
}

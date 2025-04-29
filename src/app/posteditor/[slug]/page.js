'use client';

{/* ezekbol zserintem egy csomo felesleges */}
import CheckAuthentication from '../../../../components/checkAuthentication';
import { useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import {toast, Toaster} from 'react-hot-toast';

import { UserContext } from '../../../../lib/AuthContext';
import { firestore, auth, serverTimestamp } from '../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';


{/* ha nincs user, login gombot dob a <CA> miatt <- ehelyett dobhatna a /logmeinre egyből */}
export default function AdminPostEdit() {
    return (
        <CheckAuthentication>
            <PostManager />
        </CheckAuthentication>
    );
}


function PostManager() {

    {/* Beolvassa a firestore adatokat */}
    const router = useRouter();
    const { slug } = useParams(); // dinamikus slug
    const { username } = useContext(UserContext);
    const postRef = doc(firestore, 'users', auth.currentUser.uid, 'posts', slug);
    const [post] = useDocumentData(postRef);

    {/* Poszt editor form <- HIÁNYOS MÉG*/}
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

{/*  markdow previevből maradtak bent cuccok, majd vedd ki ha biztos nem kell */}

function PostForm({ defaultValues, postRef, preview }) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid, isDirty }
    } = useForm({
        defaultValues,
        mode: 'onChange'
    });

    {/* Ez küldi fel firestoreba <- publikálás megoldása lehetne jobb is?? */}
    const updatePost = async ({ content, published }) => {
        await updateDoc(postRef, {
            content,
            published: true,
            updatedAt: serverTimestamp()
        });
        reset({ content, published });
        toast.success('Poszt mentve!');
    };
    {/* ha nem akarok previewet, minden maradékát ki kéne törölni */}
    return (

        <form onSubmit={handleSubmit(updatePost)}>
            {/*
            {preview && (
                <div className="card">
                    <ReactMarkdown>{watch('content')}</ReactMarkdown>
                </div>
            )}
            */}
            <div>
                {/* szöveg formai feltételei */}
                <textarea style={{background: 'black', color: 'white'}}
                    {...register('content', {
                        required: { value: true, message: 'Tartalom megadása kötelező! Min:10' },
                        minLength: { value: 10, message: 'Tartalom túl rövid! Min:10' },
                        maxLength: { value: 20000, message: 'Tartalom túl hosszú! Max:20000' }
                    })}

                />
                {errors.content && (
                    <p className="text-danger">{errors.content.message}</p>
                )}

                <button
                    type="submit"
                    disabled={!isDirty || !isValid}
                    className="btn-green mt-4"
                >
                    Mentés
                </button>
            </div>
        </form>
    );
}

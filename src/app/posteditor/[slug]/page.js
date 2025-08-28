'use client';

import { useContext, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useForm, Controller } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

import CheckAuthentication from '../../../../components/checkAuthentication';
import Spinner from '../../../../components/spinner';
import Select from 'react-select';
import { UserContext } from '../../../../lib/AuthContext';
import { firestore, auth, serverTimestamp } from '../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { instrumentOptions } from '../../../../components/tags/instruments';
import { settlements as cityOptions } from '../../../../components/tags/settlements';

const typeOptions = [
    { value: 'looking-for-band', label: 'Looking for a band' },
    { value: 'looking-for-musician', label: 'Looking for a musician' },
];

export default function AdminPostEdit() {
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
        if (!loading && post === undefined) {
            router.replace('/404');
        }
    }, [loading, post, router]);

    if (loading) {
        return <Spinner show />;
    }
    if (!post) {
        return null;
    }

    return (
        <main className="p-4">
            <section>
                <h1 className="text-3xl font-bold">{post.title}</h1>
                <PostForm
                    postRef={postRef}
                    defaultValues={{
                        content: post.content,
                        instrumentTags: post.instrumentTags || [],
                        cityTags: post.cityTags || [],
                        postType: post.postType || ''
                    }}
                />
            </section>
            <aside>
                <Link href={`/${username}/${slug}`}>
                    <button className="btn-blue">Ugrás a posztra</button>
                </Link>
            </aside>
        </main>
    );
}

function PostForm({ defaultValues, postRef }) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isValid, isDirty }
    } = useForm({ defaultValues, mode: 'onChange' });

    const updatePost = async data => {
        await updateDoc(postRef, {
            content: data.content,
            published: true,
            instrumentTags: data.instrumentTags,
            cityTags: data.cityTags,
            postType: data.postType,
            updatedAt: serverTimestamp()
        });
        reset(data);
        toast.success('Poszt mentve!');
    };

    return (
        <form onSubmit={handleSubmit(updatePost)}>
            <textarea
                style={{ background: 'black', color: 'white' }}
                {...register('content', {
                    required: { value: true, message: 'Tartalom megadása kötelező! Min:10' },
                    minLength: { value: 10, message: 'Tartalom túl rövid! Min:10' },
                    maxLength: { value: 20000, message: 'Tartalom túl hosszú! Max:20000' }
                })}
            />
            {errors.content && (
                <p className="text-danger">{errors.content.message}</p>
            )}

            <div className="mt-4">
                <label>Hangszerek</label>
                <Controller
                    name="instrumentTags"
                    control={control}
                    render={({ field }) => (
                        <Select
                            isMulti
                            options={instrumentOptions}
                            value={instrumentOptions.filter(o => field.value.includes(o.value))}
                            onChange={opts => field.onChange(opts.map(o => o.value))}
                        />
                    )}
                />
            </div>

            <div className="mt-4">
                <label>Város</label>
                <Controller
                    name="cityTags"
                    control={control}
                    render={({ field }) => (
                        <Select
                            isMulti
                            options={cityOptions}
                            value={cityOptions.filter(o => field.value.includes(o.value))}
                            onChange={opts => field.onChange(opts.map(o => o.value))}
                        />
                    )}
                />
            </div>

            <div className="mt-4">
                <label>Típus</label>
                <Controller
                    name="postType"
                    control={control}
                    render={({ field }) => (
                        <Select
                            options={typeOptions}
                            value={typeOptions.find(o => o.value === field.value)}
                            onChange={opt => field.onChange(opt?.value)}
                        />
                    )}
                />
            </div>

            <button
                type="submit"
                disabled={!isDirty || !isValid}
                className="btn-green mt-4"
            >
                Mentés
            </button>
        </form>
    );
}

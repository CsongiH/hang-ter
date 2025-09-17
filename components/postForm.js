'use client';

import { useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import kebabCase from 'lodash.kebabcase';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

import { firestore, auth, serverTimestamp } from '../lib/firebase';
import { UserContext } from '../lib/AuthContext';
import { instrumentOptions } from './tags/instruments';
import { settlements as cityOptions } from './tags/settlements';
import { typeOptions } from './tags/types';

function randomId(len = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
    } else {
        for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
}

export default function PostForm({ mode, postRef, defaultValues }) {
    const router = useRouter();
    const { username } = useContext(UserContext);

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isValid, isDirty },
        reset,
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            title: defaultValues?.title ?? '',
            content: defaultValues?.content ?? '',
            instrumentTags: defaultValues?.instrumentTags ?? [],
            cityTags: defaultValues?.cityTags ?? [],
            postType: defaultValues?.postType ?? '',
        },
    });

    const postType = watch('postType');

    const onSubmit = async (data) => {
        if (mode === 'edit') {
            await updateDoc(postRef, {
                title: data.title,
                content: data.content,
                instrumentTags: data.postType === 'concert-opportunity' ? [] : data.instrumentTags,
                cityTags: data.cityTags,
                postType: data.postType,
                updatedAt: serverTimestamp(),
            });
            reset(data);
            toast.success('Poszt frissítve');
            return;
        }

        const uid = auth.currentUser.uid;
        const base = encodeURI(kebabCase(data.title)).replace(/^-+|-+$/g, '');
        let slug = '';
        let ref = null;

        for (let i = 0; i < 5; i++) {
            const candidate = `${base}-${randomId(6)}`;
            const tryRef = doc(firestore, 'users', uid, 'posts', candidate);
            const exists = await getDoc(tryRef);
            if (!exists.exists()) {
                slug = candidate;
                ref = tryRef;
                break;
            }
        }
        if (!slug) {
            slug = `${base}-${randomId(8)}`;
            ref = doc(firestore, 'users', uid, 'posts', slug);
        }

        await setDoc(ref, {
            title: data.title,
            slug,
            uid,
            username,
            content: data.content,
            instrumentTags: data.postType === 'concert-opportunity' ? [] : data.instrumentTags,
            cityTags: data.cityTags,
            postType: data.postType,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        toast.success('Poszt létrehozva');
        router.push(`/${username}/${slug}`);
    };

    const showCommon = !!postType;
    const showInstrumentTags = postType === 'looking-for-musician' || postType === 'looking-for-band';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block mb-1">Poszt neve</label>
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Hirdetés neve"
                    {...register('title', {
                        required: { value: true, message: 'Kötelező' },
                        minLength: { value: 4, message: 'Min. 4' },
                        maxLength: { value: 100, message: 'Max. 100' },
                    })}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            <div>
                <label className="block mb-1">Típus</label>
                <Controller
                    name="postType"
                    control={control}
                    rules={{ required: 'Válassz típust' }}
                    render={({ field }) => (
                        <Select
                            options={typeOptions}
                            value={typeOptions.find(o => o.value === field.value) || null}
                            onChange={(opt) => field.onChange(opt?.value || '')}
                        />
                    )}
                />
                {errors.postType && <p className="text-red-500 text-sm">{errors.postType.message}</p>}
            </div>

            {showCommon && (
                <>
                    <div>
                        <label className="block mb-1">Tartalom</label>
                        <textarea
                            className="w-full min-h-[140px] p-2 border rounded"
                            placeholder="Írd le a részleteket…"
                            {...register('content', {
                                required: { value: true, message: 'Kötelező' },
                                minLength: { value: 10, message: 'Min. 10' },
                                maxLength: { value: 20000, message: 'Max. 20000' },
                            })}
                        />
                        {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                    </div>

                    {showInstrumentTags && (
                        <div>
                            <label className="block mb-1">Hangszerek</label>
                            <Controller
                                name="instrumentTags"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        isMulti
                                        options={instrumentOptions}
                                        value={instrumentOptions.filter(o => field.value.includes(o.value))}
                                        onChange={(opts) => field.onChange((opts || []).map(o => o.value))}
                                    />
                                )}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block mb-1">Város</label>
                        <Controller
                            name="cityTags"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    isMulti
                                    options={cityOptions}
                                    value={cityOptions.filter(o => field.value.includes(o.value))}
                                    onChange={(opts) => field.onChange((opts || []).map(o => o.value))}
                                />
                            )}
                        />
                    </div>
                </>
            )}

            <button type="submit" disabled={!isValid || !isDirty} className="btn-green mt-2">
                Mentés
            </button>
        </form>
    );
}

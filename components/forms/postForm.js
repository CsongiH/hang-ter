'use client';

import { useMemo, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import kebabCase from 'lodash.kebabcase';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { firestore } from '../../lib/firebase';
import { useUserContext } from '../../lib/AuthContext';
import { instrumentOptions } from '../../lib/data/instruments';
import { settlements as cityOptions } from '../../lib/data/settlements';
import { typeTags } from '../../lib/data/types';

const randomIdLength = 6;
const randomIdCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
const collisionRetry = 5;
const fallbackLength = 10;
const lengthLimit = 120;
const menuHeightMax = 240;

const validationRules = {
    title: {
        required: { value: true, message: 'Kötelező mező' },
        minLength: { value: 4, message: 'Min. 4 karakter' },
        maxLength: { value: 100, message: 'Max. 100 karakter' },
    },
    content: {
        required: { value: true, message: 'Kötelező mező' },
        minLength: { value: 10, message: 'Min. 10 karakter' },
        maxLength: { value: 20000, message: 'Max. 20000 karakter' },
    },
    postType: {
        required: 'Válassz típust',
    },
};

const generateRandomId = (length = randomIdLength) => {
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues, val => randomIdCharacters[val % randomIdCharacters.length]).join('');
};

const normalizeText = (text) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const sanitizeSlugBase = (title) => {
    const kebabbed = kebabCase(title);
    const sanitized = kebabbed.replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
    return sanitized || 'post';
};

export default function PostForm({ mode, postRef, defaultValues }) {
    const router = useRouter();
    const { user, username } = useUserContext();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    const selectCommon = useMemo(
        () => ({
            menuPortalTarget: isMounted ? document.body : null,
            menuPosition: 'fixed',
            menuPlacement: 'auto',
            menuShouldBlockScroll: true,
            closeMenuOnScroll: false,
            maxMenuHeight: menuHeightMax,
            styles: {
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
                input: (base) => ({ ...base, color: 'var(--text)' }),
            },
        }),
        [isMounted]
    );

    const { instrumentMap, cityMap } = useMemo(() => ({
        instrumentMap: new Map(instrumentOptions.map(opt => [opt.value, opt])),
        cityMap: new Map(cityOptions.map(opt => [opt.value, opt])),
    }), []);

    const postType = watch('postType');
    const showCommon = !!postType;
    const showInstrumentTags = postType === 'looking-for-musician' || postType === 'looking-for-band';

    const loadCityOptions = (inputValue, callback) => {
        const query = normalizeText(inputValue || '');
        if (!query) {
            callback([]);
            return;
        }

        const results = cityOptions
            .filter(city => city.value.includes(query))
            .slice(0, lengthLimit);

        callback(results);
    };

    const generateUniqueSlug = async (baseSlug, userId) => {
        for (let attempt = 0; attempt < collisionRetry; attempt++) {
            const candidateSlug = `${baseSlug}-${generateRandomId()}`;
            const candidateRef = doc(firestore, 'users', userId, 'posts', candidateSlug);
            const snapshot = await getDoc(candidateRef);

            if (!snapshot.exists()) {
                return { slug: candidateSlug, ref: candidateRef };
            }
        }

        const fallbackSlug = `${baseSlug}-${generateRandomId(fallbackLength)}`;
        return {
            slug: fallbackSlug,
            ref: doc(firestore, 'users', userId, 'posts', fallbackSlug),
        };
    };

    const handleEdit = async (data) => {
        await updateDoc(postRef, {
            title: data.title.trim(),
            content: data.content.trim(),
            instrumentTags: showInstrumentTags ? data.instrumentTags : [],
            cityTags: data.cityTags,
            postType: data.postType,
            updatedAt: serverTimestamp(),
        });

        reset(data);
        toast.success('Poszt frissítve');

        const slug = defaultValues?.slug || postRef?.id;
        if (slug && username) {
            router.push(`/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`);
        }
    };

    const handleCreate = async (data) => {
        const baseSlug = sanitizeSlugBase(data.title);
        const { slug, ref } = await generateUniqueSlug(baseSlug, user.uid);

        await setDoc(ref, {
            title: data.title.trim(),
            slug,
            uid: user.uid,
            username,
            content: data.content.trim(),
            instrumentTags: showInstrumentTags ? data.instrumentTags : [],
            cityTags: data.cityTags,
            postType: data.postType,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        toast.success('Poszt létrehozva');
        router.push(`/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`);
    };

    const onSubmit = async (data) => {
        if (!user) return;

        try {
            if (mode === 'edit') {
                await handleEdit(data);
            } else {
                await handleCreate(data);
            }
        } catch (error) {
            toast.error('Hiba történt. Próbáld újra.');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Biztosan törölni szeretnéd?')) return;

        try {
            if (mode === 'edit') {
                await updateDoc(postRef, { isRemoved: true });
            }
            toast.success('Poszt törölve');
            router.push(`/${encodeURIComponent(username)}`);
        } catch (error) {
            toast.error('Hiba történt. Próbáld újra.');
        }
    };

    return (
        <article className="card post-card">
            <form onSubmit={handleSubmit(onSubmit)} className="stack">
                <div className="field">
                    <label className="label">Poszt neve</label>
                    <input
                        className="input"
                        placeholder="Hirdetés neve"
                        {...register('title', validationRules.title)}
                    />
                    {errors.title && <span className="small error-message">{errors.title.message}</span>}
                </div>

                <div className="field">
                    <label className="label">Típus</label>
                    <Controller
                        name="postType"
                        control={control}
                        rules={validationRules.postType}
                        render={({ field }) => (
                            <Select
                                options={typeTags}
                                value={typeTags.find(opt => opt.value === field.value) || null}
                                onChange={(opt) => field.onChange(opt?.value || '')}
                                classNamePrefix="react-select"
                                placeholder="Válassz..."
                                {...selectCommon}
                            />
                        )}
                    />
                    {errors.postType && <span className="small error-message">{errors.postType.message}</span>}
                </div>

                {showCommon && (
                    <>
                        <div className="field">
                            <label className="label">Tartalom</label>
                            <textarea
                                className="textarea"
                                placeholder="Írd le a részleteket…"
                                {...register('content', validationRules.content)}
                            />
                            {errors.content && <span className="small error-message">{errors.content.message}</span>}
                        </div>

                        {showInstrumentTags && (
                            <div className="field">
                                <label className="label">Hangszerek</label>
                                <Controller
                                    name="instrumentTags"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            isMulti
                                            options={instrumentOptions}
                                            value={field.value.map(val => instrumentMap.get(val)).filter(Boolean)}
                                            onChange={(opts) => field.onChange(opts.map(opt => opt.value))}
                                            classNamePrefix="react-select"
                                            {...selectCommon}
                                        />
                                    )}
                                />
                            </div>
                        )}

                        <div className="field">
                            <label className="label">Város</label>
                            <Controller
                                name="cityTags"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        isMulti
                                        cacheOptions
                                        defaultOptions={false}
                                        loadOptions={loadCityOptions}
                                        value={field.value.map(val => cityMap.get(val)).filter(Boolean)}
                                        onChange={(opts) => field.onChange(opts.map(opt => opt.value))}
                                        classNamePrefix="react-select"
                                        placeholder="Válassz..."
                                        noOptionsMessage={({ inputValue }) =>
                                            inputValue ? 'Nincs találat' : 'Írj be legalább 1 karaktert'}
                                        {...selectCommon}
                                    />
                                )}
                            />
                        </div>
                    </>
                )}

                <div className="row justify-end">
                    <button type="button" onClick={handleDelete} className="button button--danger">
                        <img src="/trash.svg" alt="" className="icon icon--white" />
                    </button>
                    <button type="submit" disabled={!isValid || !isDirty} className="button button--accent">
                        Mentés
                    </button>
                </div>
            </form>
        </article>
    );
}
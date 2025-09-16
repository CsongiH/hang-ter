'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import debounce from 'lodash.debounce';
import { toast } from 'react-hot-toast';
import { UserContext } from '../lib/AuthContext';
import { firestore } from '../lib/firebase';
import { doc, getDoc, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';

export default function EditProfileForm({ hideUsernameSetting = false, initialProfile = null, onSaved }) {
    const { user } = useContext(UserContext);
    const [profile, setProfile] = useState(initialProfile);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { isDirty, isValid, errors }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            about: '',
            age: '',
            role: '',
            username: '',
            instagram: '',
            facebook: '',
            email: '',
            phone: ''
        }
    });

    const username = watch('username')?.toLowerCase() ?? '';
    const needsUsername = useMemo(() => !hideUsernameSetting && !profile?.username, [hideUsernameSetting, profile]);

    const usernameFormatOk = useMemo(() => {
        if (!needsUsername) return true;
        return /^(?=[a-z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test(username);
    }, [needsUsername, username]);

    const [unameLoading, setUnameLoading] = useState(false);
    const [unameAvailable, setUnameAvailable] = useState(false);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const data =
                initialProfile ??
                (await (async () => {
                    const ref = doc(firestore, 'users', user.uid);
                    const snap = await getDoc(ref);
                    return snap.exists() ? snap.data() : {};
                })());
            setProfile(data);
            const bio = data?.bio || {};
            reset({
                about: bio.about || '',
                age: bio.age ?? '',
                role: bio.role || '',
                username: '',
                instagram: bio.instagram || '',
                facebook: bio.facebook || '',
                email: bio.email || '',
                phone: bio.phone || ''
            });
        };
        load();
    }, [user, reset, initialProfile]);

    const debouncedCheck = useMemo(
        () =>
            debounce(async (u) => {
                if (!needsUsername) return;
                if (!u || u.length < 3 || !usernameFormatOk) {
                    setUnameLoading(false);
                    setUnameAvailable(false);
                    return;
                }
                const ref = doc(firestore, 'usernames', u);
                const snap = await getDoc(ref);
                setUnameAvailable(!snap.exists());
                setUnameLoading(false);
            }, 500),
        [needsUsername, usernameFormatOk]
    );

    useEffect(() => {
        if (!needsUsername) return;
        if (!username) {
            setUnameLoading(false);
            setUnameAvailable(false);
            return;
        }
        setUnameLoading(true);
        setUnameAvailable(false);
        debouncedCheck(username);
        return () => debouncedCheck.cancel();
    }, [username, needsUsername, debouncedCheck]);

    const onSubmit = async ({ about, age, role, username, instagram, facebook, email, phone }) => {
        if (!user) return;

        const ref = doc(firestore, 'users', user.uid);
        const normalizedAge =
            age === '' || age === null || typeof age === 'undefined' ? null : Number(age);

        const bio = {
            about: (about || '').trim(),
            age: Number.isFinite(normalizedAge) ? normalizedAge : null,
            role: role || '',
            instagram: (instagram || '').trim(),
            facebook: (facebook || '').trim(),
            email: (email || '').trim(),
            phone: (phone || '').trim()
        };

        try {
            if (needsUsername) {
                const uname = (username || '').trim().toLowerCase();
                if (!/^(?=[a-z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test(uname)) {
                    throw new Error('Érvénytelen felhasználónév.');
                }
                const unameRef = doc(firestore, 'usernames', uname);
                await runTransaction(firestore, async (tx) => {
                    const unameSnap = await tx.get(unameRef);
                    if (unameSnap.exists()) throw new Error('A felhasználónév foglalt.');
                    tx.set(unameRef, { uid: user.uid, createdAt: serverTimestamp() });
                    tx.set(
                        ref,
                        {
                            bio,
                            username: uname,
                            updatedAt: serverTimestamp(),
                            createdAt: serverTimestamp(),
                            photoURL: user.photoURL,
                            displayName: user.displayName,
                            isAdmin: false
                        },
                        { merge: true }
                    );
                });
            } else {
                await setDoc(ref, { bio, updatedAt: serverTimestamp() }, { merge: true });
            }

            toast.success('Profil frissítve');
            if (onSaved) onSaved();

            const fresh = await getDoc(ref);
            setProfile(fresh.exists() ? fresh.data() : {});
        } catch (err) {
            toast.error(err?.message || 'Mentési hiba');
        }
    };

    if (!user) return null;

    const submitDisabled =
        (!isDirty && !isValid) ||
        (needsUsername && (!usernameFormatOk || !unameAvailable || unameLoading));

    return (
        <main className="p-4 max-w-xl">
            <h1 className="text-2xl font-bold mb-4">Profil szerkesztése</h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
            >
                {needsUsername && (
                    <div>
                        <label className="block mb-1">Felhasználónév</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="pl. csongi_hu"
                            {...register('username', {
                                setValueAs: (v) => (v ?? '').toLowerCase(),
                                validate: (v) =>
                                    /^(?=[a-z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test((v ?? '').toLowerCase()) ||
                                    '3–15, a–z, 0–9, . _; nincs dupla . vagy _; nem kezdődik/végződik . vagy _'
                            })}
                        />
                        <div className="text-sm mt-1">
                            {!username && <p className="opacity-70">3–15 karakter, a–z, 0–9, . _</p>}
                            {errors.username && <p className="text-red-500">{errors.username.message}</p>}
                            {!errors.username && username && unameLoading && <p>Ellenőrzés…</p>}
                            {!errors.username && username && !unameLoading && unameAvailable && (
                                <p className="text-green-600">{username} elérhető!</p>
                            )}
                            {!errors.username && username && !unameLoading && !unameAvailable && (
                                <p className="text-red-600">Ez a felhasználónév már használt</p>
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block mb-1">Bemutatkozás</label>
                    <textarea
                        className="w-full min-h-[140px] p-2 border rounded"
                        placeholder="Rövid leírás magamról..."
                        {...register('about', {
                            maxLength: { value: 5000, message: 'Túl hosszú szöveg (max 5000).' }
                        })}
                    />
                    {errors.about && <p className="text-red-500 text-sm">{errors.about.message}</p>}
                </div>

                <div>
                    <label className="block mb-1">Életkor (opcionális)</label>
                    <input
                        type="number"
                        inputMode="numeric"
                        className="w-full p-2 border rounded"
                        placeholder="pl. 27"
                        {...register('age', {
                            validate: (v) => {
                                if (v === '' || v === null || typeof v === 'undefined') return true;
                                const n = Number(v);
                                if (!Number.isFinite(n)) return 'Számot adj meg.';
                                if (!Number.isInteger(n)) return 'Egész számot adj meg.';
                                if (n < 0 || n > 120) return '0–120 között add meg.';
                                return true;
                            }
                        })}
                    />
                    {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
                </div>

                <div>
                    <label className="block mb-1">Szerep</label>
                    <select className="w-full p-2 border rounded bg-white" {...register('role')}>
                        <option value="">— Válassz —</option>
                        <option value="musician">Zenész</option>
                        <option value="band">Zenekar</option>
                        <option value="venue">Rendezvényhelyszín</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1">Instagram</label>
                    <input
                        type="url"
                        className="w-full p-2 border rounded"
                        placeholder="https://www.instagram.com/felhasznalo"
                        {...register('instagram', {
                            validate: (v) => {
                                if (!v) return true;
                                try {
                                    const u = new URL(v);
                                    const h = u.hostname.toLowerCase();
                                    const ok =
                                        h === 'instagram.com' ||
                                        h.endsWith('.instagram.com') ||
                                        h === 'instagr.am' ||
                                        h.endsWith('.instagr.am');
                                    return ok || 'Adj meg érvényes Instagram linket.';
                                } catch {
                                    return 'Adj meg érvényes Instagram linket.';
                                }
                            }
                        })}
                    />
                    {errors.instagram && <p className="text-red-500 text-sm">{errors.instagram.message}</p>}
                </div>

                <div>
                    <label className="block mb-1">Facebook</label>
                    <input
                        type="url"
                        className="w-full p-2 border rounded"
                        placeholder="https://www.facebook.com/felhasznalo"
                        {...register('facebook', {
                            validate: (v) => {
                                if (!v) return true;
                                try {
                                    const u = new URL(v);
                                    const h = u.hostname.toLowerCase();
                                    const ok = h.endsWith('facebook.com') || h.endsWith('fb.com');
                                    return ok || 'Adj meg érvényes Facebook linket.';
                                } catch {
                                    return 'Adj meg érvényes Facebook linket.';
                                }
                            }
                        })}
                    />
                    {errors.facebook && <p className="text-red-500 text-sm">{errors.facebook.message}</p>}
                </div>

                <div>
                    <label className="block mb-1">E-mail</label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded"
                        placeholder="nev@example.com"
                        {...register('email', {
                            validate: (v) => {
                                if (!v) return true;
                                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v) || 'Adj meg érvényes e-mail címet.';
                            }
                        })}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block mb-1">Telefon</label>
                    <input
                        type="tel"
                        className="w-full p-2 border rounded"
                        placeholder="+36 30 123 4567"
                        {...register('phone', {
                            validate: (v) => {
                                if (!v) return true;
                                const digits = v.replace(/\D/g, '');
                                if (digits.length < 7 || digits.length > 15) return 'Adj meg érvényes telefonszámot.';
                                return /^[0-9+\s().-]+$/.test(v) || 'Adj meg érvényes telefonszámot.';
                            }
                        })}
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={submitDisabled}
                    className="btn-green mt-2"
                >
                    Mentés
                </button>
            </form>
        </main>
    );
}

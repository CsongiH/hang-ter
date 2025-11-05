'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import debounce from 'lodash.debounce';
import { toast } from 'react-hot-toast';
import { useUserContext } from '../lib/AuthContext';
import { firestore } from '../lib/firebase';
import { doc, getDoc, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function EditProfileForm({ embedded = false, hideUsernameSetting = false, initialProfile = null, onSaved }) {
    const { user } = useUserContext();
    const [profile, setProfile] = useState(initialProfile);
    const router = useRouter();
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { isValid, errors },
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
            phone: '',
        },
    });

    const username = (watch('username') || '').toLowerCase();
    const needsUsername = !hideUsernameSetting && !profile?.username;

    const isValidUsername = (v) => {
        const s = (v || '').toLowerCase();
        if (s.length < 3 || s.length > 15) return false;
        return /^[a-z0-9_]+$/.test(s);
    };

    const usernameFormatOk = !needsUsername || isValidUsername(username);

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
                phone: bio.phone || '',
            });
        };
        load();
    }, [user, reset, initialProfile]);

    const debouncedCheck = useMemo(
        () =>
            debounce(async (u) => {
                if (!needsUsername) return;
                if (!isValidUsername(u)) {
                    setUnameLoading(false);
                    setUnameAvailable(false);
                    return;
                }
                const ref = doc(firestore, 'usernames', u);
                const snap = await getDoc(ref);
                setUnameAvailable(!snap.exists());
                setUnameLoading(false);
            }, 500),
        [needsUsername]
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

    const normalizeSocial = (v, type) => {
        if (!v) return '';

        const isIg = type === 'ig';
        const domains = isIg ? ['instagram.com', 'instagr.am'] : ['facebook.com', 'fb.com'];
        const baseUrl = isIg ? 'https://instagram.com/' : 'https://facebook.com/';

        let s = String(v).trim();

        if (s.startsWith('@')) {
            const handle = s.slice(1);
            if (!handle) return '';
            s = baseUrl + handle;
        } else if (!/^https?:\/\//i.test(s)) {
            s = 'https://' + s;
        }

        try {
            const url = new URL(s);
            return domains.some(d => url.hostname.toLowerCase().endsWith(d)) ? url.toString() : '';
        } catch {
            return '';
        }
    };

    const onSubmit = async ({ about, age, role, username, instagram, facebook, email, phone }) => {
        if (!user) return;
        const ref = doc(firestore, 'users', user.uid);

        const nAge = age === '' || age == null ? null : Number(age);
        const bio = {
            about: (about || '').trim(),
            age: Number.isFinite(nAge) ? nAge : null,
            role: role || '',
            instagram: normalizeSocial(instagram, 'ig'),
            facebook: normalizeSocial(facebook, 'fb'),
            email: (email || '').trim(),
            phone: (phone || '').trim(),
        };

        try {
            if (needsUsername) {
                const uname = (username || '').trim().toLowerCase();
                if (!isValidUsername(uname)) throw new Error('Érvénytelen felhasználónév.');
                const unameRef = doc(firestore, 'usernames', uname);
                await runTransaction(firestore, async (tx) => {
                    const unameSnap = await tx.get(unameRef);
                    if (unameSnap.exists()) throw new Error('A felhasználónév foglalt.');
                    const userSnap = await tx.get(ref);
                    const existing = userSnap.exists() ? userSnap.data() : {};
                    const payload = {
                        bio,
                        username: uname,
                        updatedAt: serverTimestamp(),
                        ...(userSnap.exists() ? {} : { createdAt: serverTimestamp() }),
                        ...(existing?.photoURL == null ? { photoURL: user.photoURL ?? null } : {}),
                        ...(existing?.displayName == null ? { displayName: user.displayName ?? null } : {}),
                        isAdmin: false,
                    };
                    tx.set(unameRef, { uid: user.uid, createdAt: serverTimestamp() });
                    tx.set(ref, payload, { merge: true });
                });
            } else {
                await setDoc(ref, { bio, updatedAt: serverTimestamp() }, { merge: true });
            }

            toast.success('Profil frissítve');
            onSaved?.();
            const fresh = await getDoc(ref);
            setProfile(fresh.exists() ? fresh.data() : {});
        } catch (err) {
            toast.error(err?.message || 'Mentési hiba');
        }
        router.push('/');
    };

    if (!user) return null;

    const submitDisabled =
        !isValid || (needsUsername && (!usernameFormatOk || !unameAvailable || unameLoading));

    const FormBlock = (
        <form onSubmit={handleSubmit(onSubmit)} className="stack">
            {needsUsername && (
                <div className="field">
                    <label className="label">Felhasználónév</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="pl. nagy_fero"
                        {...register('username', {
                            setValueAs: (v) => (v ?? '').toLowerCase(),
                            validate: (v) => isValidUsername(v),
                        })}
                    />
                    <div className="small">
                        {!username && !unameLoading &&
                            <span className="muted italic">3-15 karakter, a-z, 0-9 vagy _</span>
                        }
                        {username && !usernameFormatOk && !unameLoading &&
                            <span className="error-message">3-15 karakter, a-z, 0-9 vagy _</span>
                        }
                        {username && unameLoading &&
                            <span className="muted italic" >Ellenőrzés…</span>
                        }
                        {username && !unameLoading && unameAvailable &&
                            <span className="ok-message">{username} elérhető!</span>
                        }
                        {username && !unameLoading && !unameAvailable && usernameFormatOk &&
                            <span className="error-message">{username} már használt</span>
                        }
                    </div>
                </div>
            )}

            <div className="field">
                <label className="label">Bemutatkozás</label>
                <textarea
                    className="textarea"
                    placeholder="Rövid leírás magamról..."
                    {...register('about', { maxLength: { value: 5000, message: 'Túl hosszú szöveg (max 5000).' } })}
                />
                {errors.about && <p className="error-message">{errors.about.message}</p>}
            </div>

            <div className="field">
                <label className="label">Életkor (opcionális)</label>
                <input
                    type="number"
                    inputMode="numeric"
                    className="input"
                    placeholder="pl. 27"
                    {...register('age', {
                        validate: (v) => {
                            if (v === '' || v == null) return true;
                            const n = Number(v);
                            if (!Number.isFinite(n)) return 'Számot adj meg.';
                            if (!Number.isInteger(n)) return 'Egész számot adj meg.';
                            if (n < 0 || n > 120) return '0-120 között add meg.';
                            return true;
                        },
                    })}
                />
                {errors.age && <p className="error-message">{errors.age.message}</p>}
            </div>

            <div className="field">
                <label className="label">Szerep</label>
                <select className="select" {...register('role')}>
                    <option value="">— Válassz —</option>
                    <option value="musician">Zenész</option>
                    <option value="band">Zenekar</option>
                    <option value="venue">Rendezvényhelyszín</option>
                </select>
            </div>

            <div className="field">
                <label className="label">Instagram</label>
                <input
                    type="url"
                    className="input"
                    placeholder="https://www.instagram.com/felhasznalo vagy @felhasznalo"
                    {...register('instagram', {
                        validate: (v) => {
                            if (!v) return true;
                            if (String(v).trim().startsWith('@')) return true;
                            try {
                                const s = /^https?:\/\//i.test(v) ? v : `https://${v}`;
                                const h = new URL(s).hostname.toLowerCase();
                                return h.endsWith('instagram.com') || h.endsWith('instagr.am') || 'Adj meg érvényes Instagram linket.';
                            } catch {
                                return 'Adj meg érvényes Instagram linket.';
                            }
                        },
                    })}
                />
                {errors.instagram && <p className="error-message">{errors.instagram.message}</p>}
            </div>

            <div className="field">
                <label className="label">Facebook</label>
                <input
                    type="url"
                    className="input"
                    placeholder="https://www.facebook.com/felhasznalo vagy @felhasznalo"
                    {...register('facebook', {
                        validate: (v) => {
                            if (!v) return true;
                            if (String(v).trim().startsWith('@')) return true;
                            try {
                                const s = /^https?:\/\//i.test(v) ? v : `https://${v}`;
                                const h = new URL(s).hostname.toLowerCase();
                                return h.endsWith('facebook.com') || h.endsWith('fb.com') || 'Adj meg érvényes Facebook linket.';
                            } catch {
                                return 'Adj meg érvényes Facebook linket.';
                            }
                        },
                    })}
                />
                {errors.facebook && <p className="error-message">{errors.facebook.message}</p>}
            </div>

            <div className="field">
                <label className="label">E-mail</label>
                <input
                    type="email"
                    className="input"
                    placeholder="nev@example.com"
                    {...register('email', {
                        validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v) || 'Adj meg érvényes e-mail címet.',
                    })}
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <div className="field">
                <label className="label">Telefon</label>
                <input
                    type="tel"
                    className="input"
                    placeholder="+36 30 123 4567"
                    {...register('phone', {
                        validate: (v) => {
                            if (!v) return true;
                            const digits = v.replace(/\D/g, '');
                            if (digits.length < 7 || digits.length > 15) return 'Adj meg érvényes telefonszámot.';
                            return /^[0-9+\s().-]+$/.test(v) || 'Adj meg érvényes telefonszámot.';
                        },
                    })}
                />
                {errors.phone && <p className="error-message">{errors.phone.message}</p>}
            </div>

            <div className="row justify-end">
                <button type="submit" disabled={submitDisabled} className="button button--accent">
                    Mentés
                </button>
            </div>
        </form>
    );

    if (embedded) return FormBlock;

    return (
        <main className="layout">
            <section className="card max-w-[720px] mx-auto">
                <h1 className="h1 mb-3">Profil szerkesztése</h1>
                {FormBlock}
            </section>
        </main>
    );
}

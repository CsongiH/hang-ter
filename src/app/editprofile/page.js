'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import CheckAuthentication from '../../../components/checkAuthentication';
import { UserContext } from '../../../lib/AuthContext';
import { useContext } from 'react';
import { firestore, serverTimestamp } from '../../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function EditProfilePage() {
    // csak a saját profil – bejelentkezés kötelező
    return (
        <CheckAuthentication>
            <EditProfileForm />
        </CheckAuthentication>
    );
}

function EditProfileForm() {
    const { user } = useContext(UserContext); // uid innen
    const {
        register,
        handleSubmit,
        reset,
        formState: { isDirty, isValid, errors }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            about: '',
            age: '',
            role: '' // 'musician' | 'band'
        }
    });

    // meglévő bio betöltése
    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const ref = doc(firestore, 'users', user.uid);
            const snap = await getDoc(ref);
            const bio = snap.data()?.bio || {};
            reset({
                about: bio.about || '',
                age: bio.age ?? '',
                role: bio.role || ''
            });
        };
        load();
    }, [user, reset]);

    // mentés: bio map frissítése
    const onSubmit = async ({ about, age, role }) => {
        if (!user) return;
        const ref = doc(firestore, 'users', user.uid);

        const normalizedAge =
            age === '' || age === null || typeof age === 'undefined'
                ? null
                : Number(age);

        const bio = {
            about: (about || '').trim(),
            age: Number.isFinite(normalizedAge) ? normalizedAge : null,
            role: role || ''
        };

        await setDoc(
            ref,
            { bio, updatedAt: serverTimestamp() },
            { merge: true } // ne töröljön más mezőket
        );
        toast.success('Profil frissítve');
    };

    return (
        <main className="p-4 max-w-xl">
            <h1 className="text-2xl font-bold mb-4">Profil szerkesztése</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* about me */}
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

                {/* életkor – szám vagy üres */}
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

                {/* szerep – egyválasztós */}
                <div>
                    <label className="block mb-1">Szerep</label>
                    <select
                        className="w-full p-2 border rounded bg-white"
                        {...register('role')}
                    >
                        <option value="">— Válassz —</option>
                        <option value="musician">Zenész</option>
                        <option value="band">Zenekar</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={!isDirty && !isValid}
                    className="btn-green mt-2"
                >
                    Mentés
                </button>
            </form>
        </main>
    );
}

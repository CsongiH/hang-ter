'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import EditProfileForm from '../../../components/editProfileForm';

export default function Page() {
    const [user, loading] = useAuthState(auth);

    if (loading) return <div>Betöltés…</div>;
    if (!user) return <div>Jelentkezz be a profilod szerkesztéséhez.</div>;

    return (
        <div className="p-6">
            <EditProfileForm hideUsernameSetting />
        </div>
    );
}

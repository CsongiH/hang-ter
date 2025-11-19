'use client';

import { useUserContext } from '../../../lib/AuthContext';
import CheckAuthentication from '../../../components/auth/checkAuthentication';
import EditProfileForm from '../../../components/forms/editProfileForm';

export default function Page() {
    const { user } = useUserContext();

    if (!user) return <CheckAuthentication><EditProfileForm hideUsernameSetting embedded /></CheckAuthentication>;

    return <EditProfileForm hideUsernameSetting />;
}

'use client';

import { useUserContext } from '../../../lib/AuthContext';
import CheckAuthentication from '../../../components/checkAuthentication';
import EditProfileForm from '../../../components/editProfileForm';

export default function Page() {
    const { user } = useUserContext();

    if (!user) return <CheckAuthentication><EditProfileForm hideUsernameSetting embedded /></CheckAuthentication>;

    return <EditProfileForm hideUsernameSetting />;
}

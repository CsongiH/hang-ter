'use client';

import CheckAuthentication from '../../../components/checkAuthentication';
import PostForm from '../../../components/postForm';

export default function EditorPostsPage() {
    return (
        <main className="p-4">
            <CheckAuthentication>
                <PostForm mode="create" />
            </CheckAuthentication>
        </main>
    );
}

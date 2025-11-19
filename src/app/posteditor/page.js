'use client';

import CheckAuthentication from '../../../components/auth/checkAuthentication';
import PostForm from '../../../components/forms/postForm';

export default function EditorPostsPage() {
    return (
        <main className="layout">
            <CheckAuthentication>
                <section className="card max-w-[720px] mx-auto">
                    <PostForm mode="create" />
                </section>
            </CheckAuthentication>
        </main>

    );
}

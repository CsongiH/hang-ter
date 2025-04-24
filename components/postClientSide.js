/*
* app/page
* feed
* postLoader
* postContents
* postClientside
* nagy káosz, egyszerűsíteni kell
* */

'use client';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

export default function PostClientSide(props) {
    // path alapú doc ref
    const postRef = doc(firestore, props.path);

    // realtime frissítés, fallback
    const [realtimePost] = useDocumentData(postRef);
    const post = realtimePost || props.post;

    return (
        <>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-gray-600">By @{post.username}</p>
            <div className="mt-4">{post.content}</div>
        </>
    );
}

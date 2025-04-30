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
    const postRef = doc(firestore, props.path);

    // data hydration: először betölti régi adatot, aztán frissít ha megvan az új
    const [realtimePost] = useDocumentData(postRef);
    const post = realtimePost || props.post;

    return (
        <>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-gray-600">{post.username}</p>
            <div className="mt-4">{post.content}</div>
        </>
    );
}

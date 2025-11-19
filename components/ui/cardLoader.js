'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import Feed from "./cardLayout";
import { firestore, jsonConvert } from "../../lib/firebase";
import {
    collectionGroup,
    collection,
    query,
    where,
    orderBy,
    startAfter,
    limit,
    getDocs,
    getDoc,
    doc,
    documentId,
} from "firebase/firestore";

const postsPerPge = 5;


export default function CardLoader({
    initialPosts = [],
    filters = null,
    scopeUid = null,
    scopeUsername = null,
    showEdit = false,
}) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnd, setIsEnd] = useState(false);

    const banCache = useRef(new Map());
    const photoCache = useRef(new Map());
    const lastCursorRef = useRef(null);

    const filtersActive = useMemo(() =>
        !!filters && (
            (filters.cities?.length > 0) ||
            (filters.instruments?.length > 0) ||
            (filters.type?.length > 0)
        ),
        [filters]
    );

    const toMillis = (timestamp) => {
        if (!timestamp) return 0;
        if (timestamp instanceof Date) return timestamp.getTime();
        if (typeof timestamp?.toDate === "function") return timestamp.toDate().getTime();
        if (typeof timestamp?.seconds === "number") {
            return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1e6;
        }
        return 0;
    };

    const sortByCreatedDesc = (a, b) => toMillis(b?.createdAt) - toMillis(a?.createdAt);

    const fetchUsersMeta = async (userIds) => {
        const usersBatchSize = 10; // Firastore "where" queryn max 10es limit van
        if (!Array.isArray(userIds) || !userIds.length) return;

        const uncachedIds = userIds.filter(
            uid => !banCache.current.has(uid) || !photoCache.current.has(uid)
        );

        for (let i = 0; i < uncachedIds.length; i += usersBatchSize) {
            const batch = uncachedIds.slice(i, i + usersBatchSize);

            try {
                const snapshot = await getDocs(
                    query(collection(firestore, "users"), where(documentId(), "in", batch))
                );

                snapshot.forEach((userDoc) => {
                    const userData = userDoc.data() || {};
                    banCache.current.set(userDoc.id, userData.isBanned === true);
                    photoCache.current.set(userDoc.id, userData.photoURL || null);
                });

                batch.forEach((id) => {
                    if (!banCache.current.has(id)) banCache.current.set(id, false);
                    if (!photoCache.current.has(id)) photoCache.current.set(id, null);
                });
            } catch (error) {
                toast.error('Hiba történt a felhasználói adatok betöltésekor');
                console.error('User fetch error:', error);
            }
        }
    };

    const filterList = async (postList) => {
        const validPosts = postList.filter(post => post?.isRemoved !== true);
        const uniqueUserIds = [...new Set(validPosts.map(post => post?.uid).filter(Boolean))];

        await fetchUsersMeta(uniqueUserIds);

        const bannedUserIds = new Set(
            uniqueUserIds.filter(uid => banCache.current.get(uid) === true)
        );

        return validPosts
            .filter(post => !bannedUserIds.has(post?.uid))
            .map(post => ({
                ...post,
                authorPhotoURL: post.authorPhotoURL ?? photoCache.current.get(post?.uid) ?? null
            }))
            .sort(sortByCreatedDesc);
    };

    const normalizeDocs = (docs) =>
        docs.map(docSnapshot => ({
            ...jsonConvert(docSnapshot),
            _path: docSnapshot.ref.path
        }));

    const resolveScopeUid = async () => {
        if (scopeUid) return scopeUid;
        if (!scopeUsername) return null;

        try {
            const usernameDoc = await getDoc(doc(firestore, "usernames", scopeUsername));
            return usernameDoc.exists() ? usernameDoc.data()?.uid || null : null;
        } catch {
            return null;
        }
    };

    const buildPostsQuery = async (cursor = null) => {
        const resolvedUid = await resolveScopeUid();

        const baseQuery = resolvedUid
            ? collection(firestore, "users", resolvedUid, "posts")
            : collectionGroup(firestore, "posts");

        const constraints = [
            orderBy("createdAt", "desc"),
            ...(cursor ? [startAfter(cursor)] : []),
            limit(postsPerPge)
        ];

        return query(baseQuery, ...constraints);
    };

    useEffect(() => {
        lastCursorRef.current = null;
        setPosts([]);
        setIsEnd(false);
        setIsLoading(false);

        let isMounted = true;

        (async () => {
            try {
                const filtered = await filterList(initialPosts);
                if (!isMounted) return;

                if (filtersActive) {
                    setPosts(filtered);
                    setIsEnd(true);
                    return;
                }

                const displayed = filtered.slice(0, postsPerPge);
                setPosts(displayed);

                const lastPost = displayed[displayed.length - 1];
                if (lastPost?.uid && lastPost?.slug) {
                    const postDoc = await getDoc(
                        doc(firestore, "users", lastPost.uid, "posts", lastPost.slug)
                    );
                    if (isMounted && postDoc.exists()) {
                        lastCursorRef.current = postDoc;
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setPosts([]);
                    setIsEnd(true);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [initialPosts, filters, scopeUid, scopeUsername, filtersActive]);

    const loadNextPosts = async () => {
        if (isLoading || isEnd || filtersActive) return;

        setIsLoading(true);
        try {
            const postsQuery = await buildPostsQuery(lastCursorRef.current);
            const snapshot = await getDocs(postsQuery);

            const normalized = normalizeDocs(snapshot.docs);
            const filtered = await filterList(normalized);

            setPosts(prev => [...prev, ...filtered].sort(sortByCreatedDesc));

            const lastDoc = snapshot.docs[snapshot.docs.length - 1];
            if (lastDoc) lastCursorRef.current = lastDoc;
            if (snapshot.docs.length < postsPerPge) setIsEnd(true);
        } catch (error) {
            setIsEnd(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Feed posts={posts} showEdit={showEdit} />
            <div className="row load-button">
                {!isLoading && !filtersActive && !isEnd && posts.length > 0 && (
                    <button className="button" onClick={loadNextPosts}>Több</button>
                )}
                {isLoading && <span className="small muted">Töltés…</span>}
                {!isLoading && posts.length === 0 && (
                    <span className="small muted">Nincs megjeleníthető poszt</span>
                )}
                {!isLoading && isEnd && !filtersActive && posts.length > 0 && (
                    <span className="small muted">Nincs több poszt</span>
                )}
            </div>
        </>
    );
}
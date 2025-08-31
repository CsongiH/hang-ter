'use client';

import { useEffect, useRef, useState } from "react";
import Feed from "./feed";
import { firestore } from "../lib/firebase";
import {
    collectionGroup,
    query,
    where,
    orderBy,
    startAfter,
    limit,
    getDocs,
    collection,
    documentId
} from "firebase/firestore";
import { jsonConvert } from "../lib/firebase";

const nrOfPosts = 10;

export default function PostLoader({ initialPosts }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const banCache = useRef(new Map());

    const getAuthorId = (p) => p?.uid || p?.userId || p?.authorId || p?.ownerId || null;

    const fetchBannedSet = async (uids) => {
        const need = uids.filter(u => !banCache.current.has(u));
        const banned = new Set();
        for (let i = 0; i < need.length; i += 10) {
            const batch = need.slice(i, i + 10);
            const snap = await getDocs(
                query(collection(firestore, "users"), where(documentId(), "in", batch))
            );
            snap.forEach(d => {
                const val = d.data()?.isBanned === true;
                banCache.current.set(d.id, val);
            });
        }
        uids.forEach(u => {
            if (banCache.current.get(u) === true) banned.add(u);
        });
        return banned;
    };

    const filterList = async (list) => {
        const notRemoved = list.filter(p => p?.isRemoved !== true);
        const uids = Array.from(new Set(notRemoved.map(getAuthorId).filter(Boolean)));
        const banned = await fetchBannedSet(uids);
        return notRemoved.filter(p => !banned.has(getAuthorId(p)));
    };

    useEffect(() => {
        (async () => {
            const filtered = await filterList(initialPosts || []);
            setPosts(filtered);
            setIsEnd(filtered.length < nrOfPosts);
        })();
    }, [initialPosts]);

    const loadNextPosts = async () => {
        setIsLoading(true);

        const lastPost = posts[posts.length - 1];
        const lastTimestamp =
            typeof lastPost.createdAt === "number"
                ? new Date(lastPost.createdAt)
                : lastPost.createdAt;

        const postsQuery = query(
            collectionGroup(firestore, "posts"),
            where("published", "==", true),
            where("isRemoved", "==", false),
            orderBy("createdAt", "desc"),
            startAfter(lastTimestamp),
            limit(nrOfPosts)
        );

        const querySnapshot = await getDocs(postsQuery);
        const newRaw = querySnapshot.docs.map(jsonConvert);
        const newFiltered = await filterList(newRaw);

        const merged = posts.concat(newFiltered);
        setPosts(merged);
        setIsLoading(false);

        if (newFiltered.length < nrOfPosts) {
            setIsEnd(true);
        }
    };

    return (
        <>
            <Feed posts={posts} />
            {!isLoading && !isEnd && <button onClick={loadNextPosts}>Több</button>}
            {isEnd && "Nincs több megjeleníthető poszt"}
        </>
    );
}

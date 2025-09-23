'use client';

import { useContext, useEffect, useRef, useState } from "react";
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
import { UserContext } from "../lib/AuthContext";

const PAGE = 5;

export default function CardLoader({ initialPosts, onlyMine = false }) {
    const { user } = useContext(UserContext);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const banCache = useRef(new Map());

    const getAuthorId = (p) => p?.uid || p?.userId || p?.authorId || p?.ownerId || null;

    const fetchBannedSet = async (uids) => {
        const need = uids.filter(u => !banCache.current.has(u));
        for (let i = 0; i < need.length; i += 10) {
            const batch = need.slice(i, i + 10);
            if (!batch.length) continue;
            const snap = await getDocs(
                query(collection(firestore, "users"), where(documentId(), "in", batch))
            );
            snap.forEach(d => {
                banCache.current.set(d.id, d.data()?.isBanned === true);
            });
            batch.forEach(id => { if (!banCache.current.has(id)) banCache.current.set(id, false); });
        }
        const banned = new Set();
        uids.forEach(u => { if (banCache.current.get(u) === true) banned.add(u); });
        return banned;
    };

    const filterList = async (list) => {
        const scoped = onlyMine && user?.uid ? list.filter(p => getAuthorId(p) === user.uid) : list;
        const visible = scoped.filter(p => p?.isRemoved !== true);
        const uids = Array.from(new Set(visible.map(getAuthorId).filter(Boolean)));
        const banned = await fetchBannedSet(uids);
        return visible.filter(p => !banned.has(getAuthorId(p)));
    };

    useEffect(() => {
        (async () => {
            const primed = await filterList(initialPosts || []);
            setPosts(primed);
            setIsEnd(primed.length < PAGE);
        })();
    }, [initialPosts]);

    useEffect(() => {
        let active = true;
        (async () => {
            if (onlyMine && !user?.uid) return;
            setIsLoading(true);
            const q = onlyMine && user?.uid
                ? query(
                    collectionGroup(firestore, "posts"),
                    where("uid", "==", user.uid),
                    orderBy("createdAt", "desc"),
                    limit(PAGE)
                )
                : query(
                    collectionGroup(firestore, "posts"),
                    orderBy("createdAt", "desc"),
                    limit(PAGE)
                );
            const snap = await getDocs(q);
            const freshRaw = snap.docs.map(jsonConvert);
            const fresh = await filterList(freshRaw);
            if (!active) return;
            setPosts(fresh);
            setIsEnd(fresh.length < PAGE);
            setIsLoading(false);
        })();
        return () => { active = false; };
    }, [onlyMine, user?.uid]);

    const loadNext = async () => {
        if (onlyMine && !user?.uid) return;
        if (!posts.length) return;

        setIsLoading(true);

        const last = posts[posts.length - 1];
        const lastTs = typeof last?.createdAt === "number"
            ? new Date(last.createdAt)
            : last?.createdAt;

        const base = onlyMine && user?.uid
            ? [
                collectionGroup(firestore, "posts"),
                where("uid", "==", user.uid),
                orderBy("createdAt", "desc"),
            ]
            : [
                collectionGroup(firestore, "posts"),
                orderBy("createdAt", "desc"),
            ];

        const q = lastTs
            ? query(...base, startAfter(lastTs), limit(PAGE))
            : query(...base, limit(PAGE));

        const snap = await getDocs(q);
        const raw = snap.docs.map(jsonConvert);
        const more = await filterList(raw);

        setPosts(prev => prev.concat(more));
        setIsLoading(false);
        if (more.length < PAGE) setIsEnd(true);
    };

    return (
        <>
            <Feed posts={posts} onlyMine={onlyMine} />
            {!isLoading && !isEnd && <button onClick={loadNext}>Több</button>}
            {isEnd && "Nincs több megjeleníthető poszt"}
        </>
    );
}

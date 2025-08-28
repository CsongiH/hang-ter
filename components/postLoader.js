'use client';

import { useState } from "react";
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
} from "firebase/firestore";
import { jsonConvert } from "../lib/firebase";

const nrOfPosts = 10;

export default function PostLoader({ initialPosts }) {
    const [posts, setPosts] = useState(initialPosts);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnd, setIsEnd] = useState(false);

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
            orderBy("createdAt", "desc"),
            startAfter(lastTimestamp),
            limit(nrOfPosts)
        );

        const querySnapshot = await getDocs(postsQuery);
        const newPosts = querySnapshot.docs.map(jsonConvert);

        setPosts(posts.concat(newPosts));
        setIsLoading(false);

        if (newPosts.length < nrOfPosts) {
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
/*
* app/page
* feed
* postLoader
* postContents
* postClientside
* nagy káosz, egyszerűsíteni kell
* */

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function PostContents({ post }) {
    const convertedCreatedAt = typeof post?.createdAt === "number" ? new Date(post.createdAt) : post.createdAt.toDate();
    return (

        <div className={"card"}>
            <h1>{post?.title}</h1>
            <span className={"text-sm"}>
                Posztolta:{" "}
                <Link href={`/${post?.username}`}>
                    <a className={"text-info"}>@{post.username}</a>
                    </Link>{" "}
                ekkor: {convertedCreatedAt.toISOString()}
            </span>

            <ReactMarkdown>{post?.content}</ReactMarkdown>
        </div>

    )
}
'use client';

import dynamic from 'next/dynamic';

// kliens-only PostLoader, SSR ki van kapcsolva
// ezzel működik a data hydration
const PostLoader = dynamic(
  () => import('./postLoader'),
  { ssr: false }
);

export default function ClientPostLoader({ initialPosts }) {
  return <PostLoader initialPosts={initialPosts} />;
}

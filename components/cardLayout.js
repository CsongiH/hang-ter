import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useUserContext } from '../lib/AuthContext';
import { instrumentOptions } from './tags/instruments';
import { settlements as cityOptions } from './tags/settlements';

export default function Feed({ posts, showEdit = false }) {
    if (!posts?.length) return null;
    return (
        <div className="stack">
            {posts.map((post) => (
                <CardContent key={`${post.username}/${post.slug}`} post={post} showEdit={showEdit} />
            ))}
        </div>
    );
}

function CardContent({ post, showEdit = false }) {
    const { user } = useUserContext();
    const isOwner = showEdit && user?.uid && post?.uid && user.uid === post.uid;

    const cover = post.authorPhotoURL || post.photoURL || '/user-icon-placeholder.png';
    const instMap = useMemo(() => new Map(instrumentOptions.map((o) => [o.value, o.label])), []);
    const cityMap = useMemo(() => new Map(cityOptions.map((o) => [o.value, o.label])), []);
    const instLabels = Array.isArray(post.instrumentTags) ? post.instrumentTags.map((v) => instMap.get(v) || v) : [];
    const cityLabels = Array.isArray(post.cityTags) ? post.cityTags.map((v) => cityMap.get(v) || v) : [];
    const tags = [...instLabels, ...cityLabels].slice(0, 12);

    const content = post.content || '';
    const preview = content.length > 45 ? content.slice(0, 45) + '...' : content;

    return (
        <article className="card" style={{ position: 'relative' }}>
            <div className="card-row">
                <Link href={`/${post.username}`} aria-label="Felhasználó profil" className="media-link">
                    <div className="media-vert">
                        <Image src={cover} alt="" width={64} height={64} />
                    </div>
                </Link>

                <div className="stack" style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/${post.username}/${post.slug}`}>
                        <h2 className="h2 card-title">{post.title}</h2>
                    </Link>

                    {!!tags.length && (
                        <div className="chips">
                            {tags.map((t) => (
                                <span className="pill pill--xs" key={t}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}

                    <div style={{ whiteSpace: 'pre-wrap', color: 'var(--muted)' }}>{preview}</div>

                    {isOwner && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Link href={`/posteditor/${post.slug}`}>
                                <span className="corner-button corner-button--tr" style={{ background: 'var(--bg-2)' }}>
                                    Szerkesztés
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Link href={`/${post.username}/${post.slug}`} className="corner-button corner-button--br" aria-label="Megnézem">
                <span>Megnézem</span>
                <img src="/arrowright.svg" alt="" className="icon icon--white" />
            </Link>
        </article>
    );
}

import Link from 'next/link';

export default function Feed({ posts, onlyMine = false }) {
    return posts ? posts.map((post) => (
        <CardContent post={post} key={post.slug} onlyMine={onlyMine} />
    )) : null;
}

function CardContent({ post, onlyMine = false }) {
    return (
        <div className="card">
            <Link href={`/${post.username}`}>
                <p><strong>{post.username}</strong></p>
            </Link>
            <Link href={`/${post.username}/${post.slug}`}>
                <h2 style={{ fontWeight: 'bold' }}>{post.title}</h2>
            </Link>
            {onlyMine && (
                <Link href={`/posteditor/${post.slug}`}>
                    <h3><button className="btn-blue">Szerkesztés</button></h3>
                </Link>
            )}
        </div>
    );
}

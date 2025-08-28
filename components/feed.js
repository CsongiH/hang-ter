{/*

 HA NEM A MAIN OLDALON VAN EZ A KOMPONENS AKKOR NEM KELLENE MÁS EMBEREK POSZTJAIT MUTATNIA

 */}
import Link from 'next/link';

export default function feed({ posts, modifyPost }) {
    return posts ? posts.map((post) => <PostContent post={post} key={post.slug} modifyPost={modifyPost} />) : null;

}

function PostContent({ post, modifyPost = true }) {
    return (
        <div className={"card"}>
            <Link href={`/${post.username}`}>
                <p>
                    <strong>{post.username}</strong>
                </p>
            </Link>
            <Link href={`/${post.username}/${post.slug}`}>
                <h2 style={{ fontWeight: "bold" }}>{post.title}</h2>
            </Link>
            {modifyPost && (
                <>
                    <Link href={`/posteditor/${post.slug}`}>
                        <h3>
                            <button className="btn-blue">Szerkesztés</button>
                        </h3>
                    </Link>
                    {post.published ? <p>Aktív</p> : <p>Nem publikált</p>}
                </>
            )

            }

        </div>
    )
}

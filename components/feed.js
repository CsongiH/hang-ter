/*
* app/page
* feed
* postLoader
* postContents
* postClientside
* nagy káosz, egyszerűsíteni kell
* */
import Link from 'next/link';

export default function feed({ posts, modifyPost }) {
return posts ? posts.map((post) => <PostContent post={post} key={post.slug} modifyPost={modifyPost}/>) : null;

}

function PostContent({post, modifyPost = false}) {
 return (
     <div className={"card"}>
         <Link href={`/${post.username}`}>
             <p>
                 <strong>Feltöltötte: {post.username}</strong>
             </p>
         </Link>
         <Link href={`/${post.username}/${post.slug}`}>
             <h2>
                 <p>{post.title}</p>
             </h2>
         </Link>

         {modifyPost && (
             <>
             <Link href={`/src/app/posteditor/${post.slug}`}>
                   <h3>
                       <button className="btn-blue">Edit</button>
                   </h3>
             </Link>
                 {post.published ? <p>Aktív</p> : <p>Nem publikált</p>}
             </>
         )
         
         }

     </div>
 )
}

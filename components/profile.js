export default function profile({user}) {
    return (
        <div>
            <img src={user.photoURL || "/user-icon-placeholder.png"} alt="user profile picture" className="card-img-center" align={"left"}/>
            <p>
                <i>@{user.username}</i>
            </p>
            <h1>{user.displayName}</h1>
        </div>
    )
}
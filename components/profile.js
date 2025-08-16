export default function Profile({ user }) {
    const bio = user.bio || {};

    return (
        <div>
            <img
                src={user.photoURL || "/user-icon-placeholder.png"}
                alt="user profile picture"
                className="card-img-center"
                align="left"
            />
            <p>
                <i>@{user.username}</i>
            </p>
            <h1>{user.displayName}</h1>

            {/* Bio mezők mindig megjelennek */}
            <div className="mt-4 space-y-2">
                <p>
                    <strong>Bemutatkozás:</strong>{" "}
                    {bio.about ? (
                        <span className="whitespace-pre-line">{bio.about}</span>
                    ) : (
                        <span className="text-gray-500">Nincs megadva</span>
                    )}
                </p>
                <p>
                    <strong>Életkor:</strong>{" "}
                    {bio.age !== null && bio.age !== undefined && bio.age !== ""
                        ? bio.age
                        : <span className="text-gray-500">Nincs megadva</span>}
                </p>
                <p>
                    <strong>Szerep:</strong>{" "}
                    {bio.role
                        ? bio.role === "musician"
                            ? "Zenész"
                            : "Zenekar"
                        : <span className="text-gray-500">Nincs megadva</span>}
                </p>
            </div>
        </div>
    );
}

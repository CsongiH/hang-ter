import Image from "next/image";

const ROLE_LABELS = {
    musician: "Zenész",
    band: "Zenekar",
    venue: "Helyszín",
};

export default function Profile({ user }) {
    const bio = user?.bio || {};
    const cover = user?.photoURL || "/user-icon-placeholder.png";
    const roleLabel = ROLE_LABELS[bio.role] || "";

    const hasAbout = typeof bio.about === "string" && bio.about.trim().length > 0;
    const ageText =
        bio.age !== null && bio.age !== undefined && bio.age !== "" ? bio.age : "Nincs megadva";

    const contacts = [
        bio.instagram && { key: "instagram", label: "Instagram", href: bio.instagram, icon: "/Instagram.svg", external: true },
        bio.facebook && { key: "facebook", label: "Facebook", href: bio.facebook, icon: "/Facebook.svg", external: true },
        bio.email && { key: "email", label: "E-mail", href: `mailto:${bio.email}`, icon: "/Email.svg" },
        bio.phone && { key: "phone", label: "Telefon", href: `tel:${String(bio.phone || "").replace(/\s+/g, "")}`, icon: "/Phone.svg" },
    ].filter(Boolean);

    return (
        <article className="card">
            <div className="stack stack--sm">
                <header className="row post-header">
                    <Image
                        src={cover}
                        alt=""
                        width={96}
                        height={96}
                        className="avatar-sq avatar-sq--lg"
                    />
                    <div className="stack stack--sm stack-left">
                        <h1 className="h1 reset">{user?.displayName || user?.username}</h1>
                        <div className="row items-center gap-2">
                            <span className="small muted">@{user?.username}</span>
                            {roleLabel ? <span className="pill pill--xs">{roleLabel}</span> : null}
                        </div>
                    </div>
                </header>

                <section className="stack stack--sm">
                    <div className="stack stack--sm">
                        <span className="small muted">Bemutatkozás</span>
                        <div className={hasAbout ? "post-body" : "small muted"}>
                            {hasAbout ? bio.about : "Nincs megadva"}
                        </div>
                    </div>

                    <div className="row row--wrap gap-8">
                        <span className="small muted">Életkor:</span>
                        <span>{ageText}</span>
                    </div>
                </section>

                <hr className="divider" />

                <section className="stack stack--sm">
                    <h2 className="h2 reset">Elérhetőségek</h2>
                    {contacts.length ? (
                        <div className="row row--wrap gap-8">
                            {contacts.map((c) => (
                                <a
                                    key={c.key}
                                    href={c.href}
                                    target={c.external ? "_blank" : undefined}
                                    rel={c.external ? "noopener noreferrer" : undefined}
                                    className="button button--ghost button--sm"
                                >
                                    <img src={c.icon} alt="" className="icon icon--adaptive" />
                                    {c.label}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <span className="small muted">Nincs megadva</span>
                    )}
                </section>
            </div>
        </article>
    );
}

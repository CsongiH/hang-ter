import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserWithUsername, jsonConvert, firestore } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { instrumentOptions } from "../../../../components/tags/instruments";
import { settlements as cityOptions } from "../../../../components/tags/settlements";
import { typeTags } from "../../../../components/tags/types";

export const revalidate = 60; //percenként ISR

const INST_MAP = new Map(instrumentOptions.map(({ value, label }) => [value, label]));
const CITY_MAP = new Map(cityOptions.map(({ value, label }) => [value, label]));
const TYPE_MAP = new Map(typeTags.map(({ value, label }) => [value, label]));

const labels = (values, map) => (Array.isArray(values) ? values.map((v) => map.get(v) || v) : []);

export default async function ViewPost({ params }) {
    const { user, post } = await params;

    const userDoc = await getUserWithUsername(user);
    if (!userDoc) return notFound();

    const postRef = doc(firestore, `users/${userDoc.id}/posts/${post}`);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return notFound();

    const postData = jsonConvert(postSnap);
    const author = userDoc.data() || {};
    const cover = author.photoURL || "/user-icon-placeholder.png";
    const bio = author.bio || {};

    const instrumentLabels = labels(postData.instrumentTags, INST_MAP);
    const cityLabels = labels(postData.cityTags, CITY_MAP);
    const prettyType = TYPE_MAP.get(postData.postType) || null;

    const contacts = [
        bio.instagram && { key: "instagram", label: "Instagram", href: bio.instagram, icon: "/Instagram.svg", external: true },
        bio.facebook && { key: "facebook", label: "Facebook", href: bio.facebook, icon: "/Facebook.svg", external: true },
        bio.email && { key: "email", label: "E-mail", href: `mailto:${bio.email}`, icon: "/Email.svg" },
        bio.phone && { key: "phone", label: "Telefon", href: `tel:${String(bio.phone || "").replace(/\s+/g, "")}`, icon: "/Phone.svg" },
    ].filter(Boolean);

    return (
        <main className="layout">
            <article className="card post-card">
                <div className="stack stack--sm">
                    <header className="row post-header">
                        <Link href={`/${encodeURIComponent(user)}`} aria-label="Felhasználói profil">
                            <img src={cover} alt="" className="avatar-sq avatar-sq--md" />
                        </Link>
                        <div className="stack stack--sm stack-left">
                            <h1 className="h1 reset">{postData.title}</h1>
                            {prettyType && <span className="pill pill--xs pill--accent fit">{prettyType}</span>}
                        </div>
                    </header>

                    {(instrumentLabels.length > 0 || cityLabels.length > 0) && (
                        <section className="stack stack--sm">
                            {instrumentLabels.length > 0 && (
                                <div className="row row--wrap gap-8">
                                    <span className="small muted">Hangszerek:</span>
                                    <div className="chips chips--tight">
                                        {instrumentLabels.map((t) => (
                                            <span className="pill pill--xs" key={`inst-${t}`}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {cityLabels.length > 0 && (
                                <div className="row row--wrap gap-8">
                                    <span className="small muted">Városok:</span>
                                    <div className="chips chips--tight">
                                        {cityLabels.map((t) => (
                                            <span className="pill pill--xs" key={`city-${t}`}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    <hr className="divider" />

                    <section className="post-body">
                        {postData.content || ""}
                    </section>

                    <hr className="divider" />

                    <section className="stack stack--sm">
                        <h2 className="h2 reset">Kapcsolatfelvétel</h2>
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
                                        <img src={c.icon} alt="" className="icon icon--white" />
                                        {c.label}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <span className="small muted">A felhasználó nem adott meg elérhetőséget.</span>
                        )}
                    </section>
                </div>
            </article>
        </main>
    );
}

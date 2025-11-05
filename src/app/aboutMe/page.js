import Link from "next/link";

export default function AboutMePage() {
    return (
        <main className="layout">
            <article className="card" style={{ maxWidth: 720, marginInline: "auto" }}>
                <div className="row" style={{ alignItems: "center" }}>
                    <img
                        src="/aboutme.jpg"
                        alt="Horváth Csongor profilképe"
                        className="avatar-sq avatar-sq--lg"
                    />
                    <div className="stack">
                        <h1 className="h1 reset">Horváth Csongor</h1>
                        <span className="small muted">Gazdaságinformatikus BSc. hallgató</span>
                        <span className="small muted">Széchenyi István Egyetem</span>
                        <Link href={"/hcsongi"} className="font-bold">Profilom</Link>
                    </div>
                </div>

                <hr className="divider" />

                <div className="stack">
                    <p>
                        A Széchenyi István Egyetem Gazdaságinformatikus BSc szak hallgatója vagyok. Ez a weboldal a szakdolgozatom témája.
                    </p>
                    <p>
                        A platform segítségével szeretném a megfelelő tagok, zenekarok és fellépési lehetőségek megtalálását elősegíteni.
                    </p>
                </div>
            </article>
        </main >
    );
}

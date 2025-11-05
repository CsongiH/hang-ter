import Link from "next/link";

export default function Footer() {
    return (
        <footer
            className="card-footer"
        >
            <div className="row justify-center items-center">
                <span className="small muted">Horváth Csongor // 2025</span>
                <Link href="/aboutMe">Rólam</Link>
            </div>
        </footer>
    );
}
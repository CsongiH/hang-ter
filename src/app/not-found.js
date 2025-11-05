'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="layout min-h-[70vh] grid place-items-center">
      <section className="card max-w-[720px] w-full text-center">
        <h1 className="h1">404</h1>
        <p className="small muted">Az oldal nem található</p>

        <div className="row justify-center mt-3">
          <button type="button" className="button button--ghost" onClick={() => router.back()}>
            Vissza
          </button>
          <button className="button" onClick={() => router.push('/')}>Főoldal</button>
        </div>

        <div className="mt-4">
          <img src="/404.jpg" alt="404" className="w-full h-auto rounded-[var(--r-md)]" />
        </div>
      </section>
    </main>
  );
}

'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <main>
      <h1>404</h1>
      <h2>az oldal nem található</h2>

      <button type="button" onClick={() => router.back()}>
        Vissza
      </button>

      <img src="/404.jpg" alt="404" style={{ width: '400px', height: 'auto' }} />
    </main>
  );
}

import Image from "next/image";


export default function NotFound() {
  return (
      <main>
          <h1>404</h1>
      <h2>az oldal nem található</h2>
          <img src="/404.jpg" alt="404"  style={{ width: '400px', height: 'auto' }}/>
  </main>
  )
}
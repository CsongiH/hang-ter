'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const instrumentOptions = ['guitar', 'drum', 'bass', 'vocal'];
const cityOptions = ['Budapest', 'Székesfehérvár', 'Győr'];
const typeOptions = ['looking-for-band', 'looking-for-musician'];

export default function TagFilter() {
  const router = useRouter();
  const [instruments, setInstruments] = useState([]); // tömb a multi‐selecthez
  const [cities, setCities] = useState([]); // tömb a multi‐selecthez
  const [type, setType] = useState(''); // string, egy választás

  const toggleInstrument = i => {
    setInstruments(prev =>
      prev.includes(i)
        ? prev.filter(x => x !== i)
        : [...prev, i]
    );
  };

  const toggleCity = c => {
    setCities(prev =>
      prev.includes(c)
        ? prev.filter(x => x !== c)
        : [...prev, c]
    );
  };

  const onSubmit = e => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (instruments.length) params.set('instrument', instruments.join(','));
    if (cities.length) params.set('city', cities.join(','));
    if (type) params.set('type', type);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="mb-4">
      {/* instrument multi‐select */}
      <div>
        <label>Instrumentum</label>
        {instrumentOptions.map(i => (
          <label key={i} className="mr-2">
            <input
              type="checkbox"
              checked={instruments.includes(i)}
              onChange={() => toggleInstrument(i)}
            />
            {i}
          </label>
        ))}
      </div>

      {/* city multi‐select */}
      <div>
        <label>Város</label>
        {cityOptions.map(c => (
          <label key={c} className="mr-2">
            <input
              type="checkbox"
              checked={cities.includes(c)}
              onChange={() => toggleCity(c)}
            />
            {c}
          </label>
        ))}
      </div>

      {/* type single‐select */}
      <div>
        <label>Típus</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="">Minden</option>
          {typeOptions.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn mt-2">🔍</button>
    </form>
  );
}

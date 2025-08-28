'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { instrumentOptions } from './tags/instruments';
import { settlements } from './tags/settlements';

const cityOptions = settlements;

const typeOptions = [
  { value: 'looking-for-band', label: 'Looking for a band' },
  { value: 'looking-for-musician', label: 'Looking for a musician' },
];

export default function TagFilter() {
  const router = useRouter();

  const [instruments, setInstruments] = useState([]);
  const [cities, setCities] = useState([]);

  const [type, setType] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (instruments.length) {
      params.set(
        'instrument',
        instruments.map(i => i.value).join(',')
      );
    }

    if (cities.length) {
      params.set(
        'city',
        cities.map(c => c.value).join(',')
      );
    }

    if (type) {
      params.set('type', type);
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="mb-4 space-y-4">

      <div>
        <label>Hangszerek</label>
        <Select
          isMulti
          isSearchable
          options={instrumentOptions}
          value={instruments}
          onChange={setInstruments}
          className="mt-1"
          classNamePrefix="react-select"
        />
      </div>

      <div>
        <label>Város</label>
        <Select
          isMulti
          isSearchable
          options={cityOptions}
          value={cities}
          onChange={setCities}
          className="mt-1"
          classNamePrefix="react-select"
        />
      </div>

      <div>
        <label>Típus</label>
        <Select
          options={typeOptions}
          value={typeOptions.find(t => t.value === type)}
          onChange={opt => setType(opt?.value || '')}
          className="mt-1"
          classNamePrefix="react-select"
        />
      </div>

      <button type="submit" className="btn mt-2">
        Keresés
      </button>
    </form>
  );
}

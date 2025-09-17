'use client';

import { useState, useEffect, useMemo, useTransition, useRef, Children } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Select, { components } from 'react-select';
import { useVirtualizer } from '@tanstack/react-virtual';
import { instrumentOptions } from './tags/instruments';
import { settlements } from './tags/settlements';
import { typeOptions } from './tags/types';

//már nem itt van a logika, ezért V=V

const mapUIToQueryType = (v) => v;

const mapQueryToUIType = (v) => v;

function VirtualMenuList(props) {
  const items = Children.toArray(props.children);
  const parentRef = useRef(null);
  const v = useVirtualizer({ count: items.length, getScrollElement: () => parentRef.current, estimateSize: () => 36, overscan: 6 });

  return (
    <components.MenuList {...props} innerRef={parentRef} style={{ maxHeight: 300, overflow: 'auto' }}>
      <div style={{ height: v.getTotalSize(), position: 'relative' }}>
        {v.getVirtualItems().map(row => (
          <div key={row.key} style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(${row.start}px)` }}>
            {items[row.index]}
          </div>
        ))}
      </div>
    </components.MenuList>
  );
}

export default function TagFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [instruments, setInstruments] = useState([]);
  const [cities, setCities] = useState([]);
  const [type, setType] = useState('');

  const cityOptions = useMemo(() => settlements.map(o => ({ ...o, lc: o.label.toLowerCase() })), []);
  const filterCity = (option, raw) => !raw || option.data.lc.includes(raw.toLowerCase());

  useEffect(() => {
    const parseCsv = (s) => (s ? s.split(',').map(v => v.trim()).filter(Boolean) : []);
    const instVals = parseCsv(sp.get('instrument') || '');
    const cityVals = parseCsv(sp.get('city') || '');
    const typeVal = sp.get('type') || '';

    setInstruments(instrumentOptions.filter(o => instVals.includes(o.value)));
    setCities(cityOptions.filter(o => cityVals.includes(o.value)));
    setType(mapQueryToUIType(typeVal));
  }, [sp, cityOptions]);

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (instruments.length) params.set('instrument', instruments.map(i => i.value).join(','));
    if (cities.length) params.set('city', cities.map(c => c.value).join(','));
    const qType = mapUIToQueryType(type);
    if (qType) params.set('type', qType);

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/search?${qs}` : '/search');
      router.refresh();
    });
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
          isDisabled={isPending}
        />
      </div>

      <div>
        <label>Város</label>
        <Select
          isMulti
          isSearchable
          options={cityOptions}
          filterOption={filterCity}
          value={cities}
          onChange={setCities}
          className="mt-1"
          classNamePrefix="react-select"
          isDisabled={isPending}
          components={{ MenuList: VirtualMenuList }}
        />
      </div>

      <div>
        <label>Típus</label>
        <Select
          options={typeOptions}
          value={typeOptions.find(t => t.value === type) || null}
          onChange={opt => setType(opt?.value || '')}
          className="mt-1"
          classNamePrefix="react-select"
          isDisabled={isPending}
        />
      </div>

      <button type="submit" className="btn mt-2" disabled={isPending}>
        Keresés
      </button>
    </form>
  );
}

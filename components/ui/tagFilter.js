'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { instrumentOptions } from '../../lib/data/instruments';
import { settlements as cityOptions } from '../../lib/data/settlements';
import { typeTags } from '../../lib/data/types';

const normalizeText = (text) =>
  String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const parseCsv = (value) =>
  (value || '').split(',').map(item => item.trim()).filter(Boolean);

export default function TagFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [instruments, setInstruments] = useState([]);
  const [cities, setCities] = useState([]);
  const [type, setType] = useState('');

  const selectCommon = useMemo(
    () => ({
      menuPortalTarget: document.body,
      menuPosition: 'fixed',
      menuPlacement: 'auto',
      maxMenuHeight: 240,
      styles: {
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (base) => ({ ...base, zIndex: 9999 }),
      },
    }),
    []
  );

  const { instrumentMap, cityMap } = useMemo(() => ({
    instrumentMap: new Map(instrumentOptions.map(opt => [opt.value, opt])),
    cityMap: new Map(cityOptions.map(opt => [opt.value, opt])),
  }), []);

  const loadCityOptions = (inputValue, callback) => {
    const query = normalizeText(inputValue);
    if (!query) {
      callback([]);
      return;
    }

    const results = cityOptions
      .filter(city => city.value.includes(query))
      .slice(0, 120);

    callback(results);
  };

  useEffect(() => {
    const instrumentValues = parseCsv(searchParams.get('instrument'));
    const cityValues = parseCsv(searchParams.get('city'));
    const typeValue = searchParams.get('type') || '';

    setInstruments(instrumentValues.map(val => instrumentMap.get(val)).filter(Boolean));
    setCities(cityValues.map(val => cityMap.get(val)).filter(Boolean));
    setType(typeValue);
  }, [searchParams, instrumentMap, cityMap]);

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (instruments.length) {
      params.set('instrument', instruments.map(inst => inst.value).join(','));
    }

    if (cities.length) {
      params.set('city', cities.map(city => city.value).join(','));
    }

    if (type) {
      params.set('type', type);
    }

    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `/search?${queryString}` : '/search');
      router.refresh();
    });
  };

  const onClear = () => {
    setInstruments([]);
    setCities([]);
    setType('');
    startTransition(() => {
      router.replace('/search');
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="stack gap-3">
      <div className="field">
        <label className="label">Hangszerek</label>
        <Select
          isMulti
          isSearchable
          options={instrumentOptions}
          value={instruments}
          onChange={setInstruments}
          classNamePrefix="react-select"
          isDisabled={isPending}
          {...selectCommon}
        />
      </div>

      <div className="field">
        <label className="label">Város</label>
        <AsyncSelect
          isMulti
          cacheOptions
          defaultOptions={false}
          loadOptions={loadCityOptions}
          value={cities}
          onChange={setCities}
          classNamePrefix="react-select"
          isDisabled={isPending}
          placeholder="Válassz..."
          noOptionsMessage={({ inputValue }) =>
            inputValue ? 'Nincs találat' : 'Írj be legalább 1 karaktert'}
          {...selectCommon}
        />
      </div>

      <div className="field">
        <label className="label">Típus</label>
        <Select
          options={typeTags}
          value={typeTags.find(tag => tag.value === type) || null}
          onChange={(opt) => setType(opt?.value || '')}
          isClearable
          classNamePrefix="react-select"
          isDisabled={isPending}
          {...selectCommon}
        />
      </div>

      <div className="row justify-end pt-5 gap-2">
        <button type="button" className="button" onClick={onClear} disabled={isPending}>
          Szűrők törlése
        </button>
        <button type="submit" className="button button--accent" disabled={isPending}>
          Keresés
        </button>
      </div>
    </form>
  );
}
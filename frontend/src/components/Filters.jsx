import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useMeta() {
  const [meta, setMeta] = useState({ bases: [], equipmentTypes: [] });
  useEffect(() => { api.get('/assets/meta').then((r) => setMeta(r.data)); }, []);
  return meta;
}

// Date / Base / Equipment filter bar. Commanders see their base locked (server enforces it too).
export default function Filters({ value, onChange, showDates = true }) {
  const { user } = useAuth();
  const meta = useMeta();
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const locked = user.role === 'BASE_COMMANDER';
  return (
    <div className="card mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {showDates && <>
        <label className="text-xs font-semibold">From<input type="date" className="input mt-1" value={value.startDate || ''} onChange={set('startDate')} /></label>
        <label className="text-xs font-semibold">To<input type="date" className="input mt-1" value={value.endDate || ''} onChange={set('endDate')} /></label>
      </>}
      <label className="text-xs font-semibold">Base
        <select className="input mt-1" disabled={locked} value={locked ? user.baseId : value.baseId || ''} onChange={set('baseId')}>
          <option value="">All bases</option>{meta.bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select></label>
      <label className="text-xs font-semibold">Equipment type
        <select className="input mt-1" value={value.equipmentTypeId || ''} onChange={set('equipmentTypeId')}>
          <option value="">All equipment</option>{meta.equipmentTypes.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.category})</option>)}
        </select></label>
    </div>
  );
}
export const clean = (f) => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '' && v != null));

import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
import { useMeta } from '../components/Filters';
import Table, { fmtDate } from '../components/Table';
import { useAuth } from '../context/AuthContext';

export default function Assignments() {
  const { user } = useAuth(); const meta = useMeta();
  const [assign, setAssign] = useState([]); const [exp, setExp] = useState([]);
  const blank = { baseId: user.baseId || '', equipmentTypeId: '', quantity: '', personnelName: '', reason: '' };
  const [a, setA] = useState(blank); const [x, setX] = useState(blank); const [msg, setMsg] = useState(null);
  const load = () => { api.get('/assignments').then((r) => setAssign(r.data)); api.get('/expenditures').then((r) => setExp(r.data)); };
  useEffect(load, []);
  const send = (path, form, reset) => async (e) => {
    e.preventDefault(); setMsg(null);
    try { await api.post(path, { ...form, baseId: Number(form.baseId), equipmentTypeId: Number(form.equipmentTypeId), quantity: Number(form.quantity) });
      setMsg({ ok: true, text: 'Recorded.' }); reset(); load(); } catch (err) { setMsg({ ok: false, text: errMsg(err) }); }
  };
  const base = (form, set) => <>
    <select className="input" required disabled={user.role === 'BASE_COMMANDER'} value={form.baseId} onChange={(e) => set({ ...form, baseId: e.target.value })}><option value="">Base…</option>{meta.bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
    <select className="input" required value={form.equipmentTypeId} onChange={(e) => set({ ...form, equipmentTypeId: e.target.value })}><option value="">Equipment…</option>{meta.equipmentTypes.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}</select>
    <input className="input" type="number" min="1" step="1" required placeholder="Quantity" value={form.quantity} onChange={(e) => set({ ...form, quantity: e.target.value })} /></>;
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Assignments &amp; Expenditures</h1>
      {msg && <p className={`mb-3 text-sm ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{msg.text}</p>}
      <h2 className="mb-2 font-semibold">Assign to personnel</h2>
      <form onSubmit={send('/assignments', a, () => setA({ ...a, quantity: '', personnelName: '' }))} className="card mb-3 grid gap-3 md:grid-cols-5">
        {base(a, setA)}<input className="input" required placeholder="Personnel name" value={a.personnelName} onChange={(e) => setA({ ...a, personnelName: e.target.value })} /><button className="btn">Assign</button></form>
      <Table rows={assign} columns={[{ key: 'created_at', label: 'Date', render: (r) => fmtDate(r.created_at) }, { key: 'base', label: 'Base' }, { key: 'equipment', label: 'Equipment' }, { key: 'personnel_name', label: 'Personnel' }, { key: 'quantity', label: 'Qty' }]} />
      <h2 className="mb-2 mt-6 font-semibold">Mark as expended</h2>
      <form onSubmit={send('/expenditures', x, () => setX({ ...x, quantity: '', reason: '' }))} className="card mb-3 grid gap-3 md:grid-cols-5">
        {base(x, setX)}<input className="input" placeholder="Reason (optional)" value={x.reason} onChange={(e) => setX({ ...x, reason: e.target.value })} /><button className="btn">Record expenditure</button></form>
      <Table rows={exp} columns={[{ key: 'created_at', label: 'Date', render: (r) => fmtDate(r.created_at) }, { key: 'base', label: 'Base' }, { key: 'equipment', label: 'Equipment' }, { key: 'reason', label: 'Reason' }, { key: 'quantity', label: 'Qty' }]} />
    </div>
  );
}

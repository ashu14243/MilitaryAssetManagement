import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
import Filters, { clean, useMeta } from '../components/Filters';
import Table, { fmtDate } from '../components/Table';
import { useAuth } from '../context/AuthContext';

export default function Purchases() {
  const { user } = useAuth(); const meta = useMeta();
  const [f, setF] = useState({}); const [rows, setRows] = useState([]); const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ baseId: user.baseId || '', equipmentTypeId: '', quantity: '' });
  const load = () => api.get('/purchases', { params: clean(f) }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [f]);
  const submit = async (e) => {
    e.preventDefault(); setMsg(null);
    try { await api.post('/purchases', { ...form, baseId: Number(form.baseId), equipmentTypeId: Number(form.equipmentTypeId), quantity: Number(form.quantity) });
      setMsg({ ok: true, text: 'Purchase recorded.' }); setForm({ ...form, quantity: '' }); load();
    } catch (x) { setMsg({ ok: false, text: errMsg(x) }); }
  };
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Purchases</h1>
      <form onSubmit={submit} className="card mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <select className="input" required disabled={user.role === 'BASE_COMMANDER'} value={form.baseId} onChange={(e) => setForm({ ...form, baseId: e.target.value })}>
          <option value="">Base…</option>{meta.bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select className="input" required value={form.equipmentTypeId} onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}>
          <option value="">Equipment…</option>{meta.equipmentTypes.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <input className="input" type="number" min="1" step="1" required placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        <button className="btn">Record purchase</button>
        {msg && <p className={`md:col-span-4 text-sm ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{msg.text}</p>}
      </form>
      <Filters value={f} onChange={setF} />
      <Table rows={rows} columns={[{ key: 'created_at', label: 'Date', render: (r) => fmtDate(r.created_at) }, { key: 'base', label: 'Base' }, { key: 'equipment', label: 'Equipment' }, { key: 'category', label: 'Category' }, { key: 'quantity', label: 'Qty' }, { key: 'recorded_by', label: 'By' }]} />
    </div>
  );
}

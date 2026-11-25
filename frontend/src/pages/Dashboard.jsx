import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api, { errMsg } from '../services/api';
import Filters, { clean } from '../components/Filters';
import StatCard from '../components/StatCard';
import NetMoveModal from '../components/NetMoveModal';
import Table from '../components/Table';

export default function Dashboard() {
  const [f, setF] = useState({}); const [m, setM] = useState(null); const [bal, setBal] = useState([]); const [err, setErr] = useState(''); const [modal, setModal] = useState(false);
  useEffect(() => {
    setErr('');
    api.get('/assets/dashboard', { params: clean(f) }).then((r) => setM(r.data)).catch((e) => setErr(errMsg(e)));
    api.get('/assets/balances', { params: clean({ baseId: f.baseId }) }).then((r) => setBal(r.data));
  }, [f]);
  const chart = m ? [
    { name: 'Opening', value: m.openingBalance }, { name: 'Purchases', value: m.purchases }, { name: 'In', value: m.transfersIn },
    { name: 'Out', value: -m.transfersOut }, { name: 'Assigned', value: -m.assigned }, { name: 'Expended', value: -m.expended }, { name: 'Closing', value: m.closingBalance },
  ] : [];
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <Filters value={f} onChange={setF} />
      {err && <p className="mb-3 text-red-600">{err}</p>}
      {m && <>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <StatCard title="Opening Balance" value={m.openingBalance} />
          <StatCard title="Net Movement" hint="click for detail" value={m.netMovement} accent="border-emerald-600" onClick={() => setModal(true)} />
          <StatCard title="Assigned" value={m.assigned} accent="border-amber-500" />
          <StatCard title="Expended" value={m.expended} accent="border-red-500" />
          <StatCard title="Closing Balance" value={m.closingBalance} accent="border-slate-800" />
        </div>
        <div className="card mt-4 h-64">
          <ResponsiveContainer><BarChart data={chart}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#059669" /></BarChart></ResponsiveContainer>
        </div>
        {modal && <NetMoveModal metrics={m} onClose={() => setModal(false)} />}
      </>}
      <h2 className="mb-2 mt-6 text-lg font-semibold">Current stock</h2>
      <Table rows={bal.map((b) => ({ ...b, id: `${b.base_id}-${b.equipment_type_id}` }))} columns={[
        { key: 'base_name', label: 'Base' }, { key: 'equipment_name', label: 'Equipment' }, { key: 'category', label: 'Category' }, { key: 'balance', label: 'Balance' }]} />
    </div>
  );
}

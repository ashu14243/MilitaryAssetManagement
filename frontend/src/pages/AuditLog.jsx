import { useEffect, useState } from 'react';
import api from '../services/api';
import Table, { fmtDate } from '../components/Table';
export default function AuditLog() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get('/assets/audit').then((r) => setRows(r.data)); }, []);
  return (<div><h1 className="mb-4 text-2xl font-bold">Audit Log</h1>
    <Table rows={rows} columns={[{ key: 'created_at', label: 'When', render: (r) => fmtDate(r.created_at) }, { key: 'username', label: 'User' }, { key: 'action', label: 'Action' }, { key: 'details', label: 'Details' }]} /></div>);
}

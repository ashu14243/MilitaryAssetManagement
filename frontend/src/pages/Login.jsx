import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function Login() {
  const { user, login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ username: '', password: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await login(f.username, f.password); nav('/'); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow-xl">
        <div className="flex items-center gap-2 text-xl font-bold"><Shield /> Asset Management</div>
        <input className="input" placeholder="Username" autoComplete="username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required />
        <input className="input" type="password" placeholder="Password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

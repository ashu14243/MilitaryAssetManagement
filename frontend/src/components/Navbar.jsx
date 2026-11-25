import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="flex items-center justify-between bg-slate-800 px-6 py-3 text-white">
      <div className="flex items-center gap-2 font-bold"><Shield size={20} /> Military Asset Management</div>
      <div className="flex items-center gap-4 text-sm">
        <span>{user.username} <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs">{user.role.replace('_', ' ')}</span></span>
        <button onClick={logout} className="flex items-center gap-1 hover:text-emerald-300"><LogOut size={16} /> Logout</button>
      </div>
    </header>
  );
}

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, ArrowLeftRight, UserCheck, ScrollText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Menu items are filtered by role, mirroring the backend RBAC rules.
const ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
  { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
  { to: '/assignments', label: 'Assignments & Expenditures', icon: UserCheck, roles: ['ADMIN', 'BASE_COMMANDER'] },
  { to: '/audit', label: 'Audit Log', icon: ScrollText, roles: ['ADMIN'] },
];
export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="w-60 shrink-0 bg-slate-900 p-4 text-slate-200">
      <nav className="space-y-1">
        {ITEMS.filter((i) => i.roles.includes(user.role)).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

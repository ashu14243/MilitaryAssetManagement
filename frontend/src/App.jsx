import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import AuditLog from './pages/AuditLog';

// Private route wrapper; `roles` mirrors the backend RBAC so users never land on a page the API would 403.
function Private({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return (
    <div className="flex min-h-screen flex-col"><Navbar />
      <div className="flex flex-1"><Sidebar /><main className="flex-1 p-6"><Outlet /></main></div></div>
  );
}
export default function App() {
  return (
    <AuthProvider><BrowserRouter><Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Private />}>
        <Route path="/" element={<Dashboard />} /><Route path="/purchases" element={<Purchases />} /><Route path="/transfers" element={<Transfers />} />
      </Route>
      <Route element={<Private roles={['ADMIN', 'BASE_COMMANDER']} />}><Route path="/assignments" element={<Assignments />} /></Route>
      <Route element={<Private roles={['ADMIN']} />}><Route path="/audit" element={<AuditLog />} /></Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></BrowserRouter></AuthProvider>
  );
}

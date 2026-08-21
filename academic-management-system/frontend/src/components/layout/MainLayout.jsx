import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const MainLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] font-mono">Loading BcaFly...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[var(--bg)] font-sans text-[var(--text)]">
      {/* Sidebar will go here */}
      <aside className="w-64 bg-[var(--surface-soft)] border-r border-[var(--border)] flex flex-col hidden md:flex">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 flex items-center justify-center text-[var(--gold)] bg-[var(--gold-soft)] border border-[#ead6ab] rounded-xl shadow-sm">
                B
             </div>
             <div>
                <div className="font-display font-bold text-lg text-[var(--text)] leading-none">BcaFly</div>
             </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
           {/* Sidebar Links */}
           <div className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">Main Menu</div>
           <button className="w-full text-left px-3 py-2 text-sm rounded bg-[var(--gold-soft)] text-[var(--text)] border-l-2 border-[var(--gold)] font-medium">Dashboard</button>
        </nav>
        <div className="p-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
           {user.name} ({user.role})
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar will go here */}
        <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-6">
           <h1 className="text-xl font-display font-medium">Dashboard</h1>
           <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Welcome, {user.name}</span>
           </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

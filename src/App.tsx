import { BarChart3, ClipboardList, Home, LogOut, Menu, ShieldAlert, Wrench, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { clearStoredPassword, getStoredPassword, setStoredPassword } from './services/api';
import { CenterReports } from './pages/CenterReports';
import { Dashboard } from './pages/Dashboard';
import { EquipmentDetail } from './pages/EquipmentDetail';
import { EquipmentSearch } from './pages/EquipmentSearch';
import { Incidents } from './pages/Incidents';
import { NewReview } from './pages/NewReview';

const navigation = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/equipos', label: 'Buscar máquina', icon: Wrench },
  { to: '/centros', label: 'Revisiones por centro', icon: BarChart3 },
  { to: '/incidencias', label: 'Incidencias', icon: ShieldAlert }
];

function AuthGate({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    setStoredPassword(password);
    onLogin();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form className="panel w-full max-w-md p-6" onSubmit={submit}>
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand text-white">
          <ClipboardList className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-ink">Mantenimiento de equipos</h1>
        <label className="mt-5 block">
          <span className="form-label">Clave de acceso</span>
          <input
            type="password"
            className="form-input mt-1"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button className="btn-primary mt-5 w-full" type="submit">
          Entrar
        </button>
      </form>
    </main>
  );
}

function Layout({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="btn-secondary px-3 md:hidden" type="button" onClick={() => setOpen((value) => !value)} title="Abrir menú">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">Revisiones</p>
              <p className="font-bold text-ink">Mantenimiento</p>
            </div>
          </div>
          <button className="btn-secondary px-3" type="button" onClick={onLogout} title="Cerrar sesión">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 md:grid-cols-[240px_1fr]">
        <aside className={`${open ? 'block' : 'hidden'} md:block`}>
          <nav className="panel p-2">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipos" element={<EquipmentSearch />} />
            <Route path="/equipos/:codigo" element={<EquipmentDetail />} />
            <Route path="/equipos/:codigo/revision" element={<NewReview />} />
            <Route path="/centros" element={<CenterReports />} />
            <Route path="/incidencias" element={<Incidents />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(getStoredPassword()));

  if (!authenticated) {
    return <AuthGate onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <Layout
      onLogout={() => {
        clearStoredPassword();
        setAuthenticated(false);
      }}
    />
  );
}

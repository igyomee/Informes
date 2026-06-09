import { ClipboardList, Home, LogOut, Menu, Wrench, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { APP_MODULES, type ModuleKey } from './config/modules';
import { CenterMaintenance } from './pages/CenterMaintenance';
import { Dashboard } from './pages/Dashboard';
import { clearStoredPassword, getStoredModule, getStoredPassword, setStoredModule, setStoredPassword } from './services/api';

const navigation = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/revision-centro', label: 'Revision por centro', icon: Wrench }
];

function AuthGate({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    setStoredPassword(password);
    onLogin();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-yellow-50 p-4">
      <form className="panel w-full max-w-md p-6" onSubmit={submit}>
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-black bg-brand text-black">
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
  const [moduleKey, setModuleKey] = useState<ModuleKey>(() => getStoredModule());
  const navigate = useNavigate();

  function changeModule(nextModule: ModuleKey) {
    setStoredModule(nextModule);
    setModuleKey(nextModule);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <header className="sticky top-0 z-20 border-b border-black bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="btn-secondary px-3 md:hidden" type="button" onClick={() => setOpen((value) => !value)} title="Abrir menu">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-black bg-brand text-black">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase text-black">Revisiones</p>
              <p className="font-bold text-ink">Mantenimiento</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="hidden text-sm font-semibold text-ink sm:block" htmlFor="module-select">
              Modulo
            </label>
            <select
              id="module-select"
              className="form-input h-10 w-36 border-black bg-white py-1 font-semibold"
              value={moduleKey}
              onChange={(event) => changeModule(event.target.value as ModuleKey)}
            >
              {APP_MODULES.map((module) => (
                <option key={module.key} value={module.key}>
                  {module.label}
                </option>
              ))}
            </select>
            <button className="btn-secondary px-3" type="button" onClick={onLogout} title="Cerrar sesion">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
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
                    isActive ? 'bg-brand text-black' : 'text-black hover:bg-yellow-100'
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

        <main className="min-w-0" key={moduleKey}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/revision-centro" element={<CenterMaintenance />} />
            <Route path="*" element={<Dashboard />} />
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

import { ClipboardList, Home, Menu, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { APP_MODULES, type ModuleKey } from './config/modules';
import { CenterMaintenance } from './pages/CenterMaintenance';
import { Dashboard } from './pages/Dashboard';
import { getStoredModule, setStoredModule } from './services/api';

const navigation = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/revision-centro', label: 'Revision por centro', icon: Wrench }
];

function Layout() {
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
  return <Layout />;
}

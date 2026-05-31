import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const baseLink =
  'inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition hover:bg-prime-gray hover:text-prime-black';
const linkClass = ({ isActive }) => `${baseLink} ${isActive ? 'bg-prime-black text-white' : 'text-prime-black/70'}`;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    pushToast('Logout berhasil.');
    navigate('/agent/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-prime-gray text-prime-black">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 max-w-[1900px] items-center gap-4 px-4 sm:px-6">
          <img src="/logo/prime-mark.png" alt="Prime Property" className="h-10 w-10 object-contain" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Prime Property</p>
            <p className="truncate text-xs text-prime-black/55">Portal Agent Internal</p>
          </div>
          <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
            <NavLink to="/agent/properties" className={linkClass}>
              <i className="fa-solid fa-table-list w-4" />
              Listing
            </NavLink>
            {user?.role === 'superadmin' && (
              <>
                <NavLink to="/agent/admins" className={linkClass}>
                  <i className="fa-solid fa-user-shield w-4" />
                  Admin
                </NavLink>
                <NavLink to="/agent/audit" className={linkClass}>
                  <i className="fa-solid fa-clock-rotate-left w-4" />
                  Audit
                </NavLink>
                <NavLink to="/agent/archive" className={linkClass}>
                  <i className="fa-solid fa-box-archive w-4" />
                  Arsip
                </NavLink>
              </>
            )}
          </nav>
          <details className="ml-auto">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md border border-black/10 px-3 py-2 text-sm font-semibold">
              <span className="hidden sm:block">{user?.name}</span>
              <span className="rounded bg-prime-gold/20 px-2 py-1 text-xs text-prime-black">{user?.role}</span>
              <i className="fa-solid fa-chevron-down text-xs" />
            </summary>
            <div className="absolute right-4 mt-2 w-56 rounded-md border border-black/10 bg-white p-2 shadow-soft">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-prime-red hover:bg-prime-gray"
              >
                <i className="fa-solid fa-arrow-right-from-bracket" />
                Logout
              </button>
            </div>
          </details>
        </div>
        <nav className="mx-auto flex max-w-[1900px] gap-1 overflow-x-auto border-t border-black/5 px-4 py-2 sm:px-6 md:hidden">
          <NavLink to="/agent/properties" className={linkClass}>
            <i className="fa-solid fa-table-list w-4" />
            Listing
          </NavLink>
          {user?.role === 'superadmin' && (
            <>
              <NavLink to="/agent/admins" className={linkClass}>
                <i className="fa-solid fa-user-shield w-4" />
                Admin
              </NavLink>
              <NavLink to="/agent/audit" className={linkClass}>
                <i className="fa-solid fa-clock-rotate-left w-4" />
                Audit
              </NavLink>
              <NavLink to="/agent/archive" className={linkClass}>
                <i className="fa-solid fa-box-archive w-4" />
                Arsip
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-[1900px] px-4 py-4 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

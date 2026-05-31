import { NavLink, Outlet } from 'react-router-dom';

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold transition hover:text-prime-gold ${isActive ? 'text-prime-gold' : 'text-prime-black/70'}`;

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-prime-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-24 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex shrink-0 items-center gap-3">
            <img src="/logo/prime-horizontal.png" alt="Prime Property" className="h-16 w-auto max-w-[250px] object-contain" />
          </NavLink>
          <nav className="ml-auto hidden items-center gap-7 md:flex">
            <NavLink to="/" className={navLinkClass}>
              Beranda
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              Tentang Kami
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Kontak
            </NavLink>
          </nav>
          <details className="ml-auto md:hidden">
            <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-md border border-black/10 text-prime-black">
              <i className="fa-solid fa-bars" />
            </summary>
            <div className="absolute left-4 right-4 top-[88px] rounded-md border border-black/10 bg-white p-4 shadow-soft">
              <div className="grid gap-3">
                <NavLink to="/" className={navLinkClass}>
                  Beranda
                </NavLink>
                <NavLink to="/about" className={navLinkClass}>
                  Tentang Kami
                </NavLink>
                <NavLink to="/contact" className={navLinkClass}>
                  Kontak
                </NavLink>
              </div>
            </div>
          </details>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

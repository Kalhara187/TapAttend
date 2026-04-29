import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HiBars3, HiMiniMoon, HiMiniSun, HiOutlineArrowRightOnRectangle, HiXMark } from 'react-icons/hi2';
import { ADMIN_MENU, EMPLOYEE_MENU } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';

function getPageTitle(pathname, navItems) {
  const match = navItems.find((item) => pathname.startsWith(item.path));
  return match?.label || 'SmartAttend';
}

export default function AppShell() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = useMemo(
    () => (user?.role === 'admin' ? ADMIN_MENU : EMPLOYEE_MENU),
    [user?.role]
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const pageTitle = getPageTitle(location.pathname, navItems);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-surface min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200/70 bg-white/85 p-5 shadow-2xl shadow-slate-900/5 backdrop-blur-xl lg:flex">
        <button
          type="button"
          className="mb-8 flex items-center gap-3 text-left"
          onClick={() => navigate('/home')}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-lg font-bold text-white shadow-lg shadow-teal-600/20">
            SA
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-slate-900">SmartAttend</p>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Workforce OS</p>
          </div>
        </button>

        <div className="mb-5 rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
          <p className="mt-2 text-sm font-bold text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <div className="mt-4 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {user?.role === 'admin' ? 'Administrator' : 'Employee'}
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-lg shadow-slate-900/20">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Today</p>
          <p className="mt-2 text-sm text-slate-100">{new Date().toLocaleDateString()}</p>
          <p className="mt-1 text-xs text-slate-400">Attendance operations are live.</p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
          >
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition hover:bg-red-100"
            aria-label="Logout"
          >
            <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-4 md:px-6 lg:px-8">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <HiBars3 className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">SmartAttend</p>
              <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
                {pageTitle}
              </h1>
            </div>

            <div className="hidden items-center gap-4 md:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.department || 'SmartAttend team'}</p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-teal-200"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <HiMiniMoon className="h-5 w-5" /> : <HiMiniSun className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:shadow-xl hover:shadow-teal-600/25"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-5 md:px-6 lg:px-8 lg:py-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[86vw] max-w-sm border-r border-slate-200 bg-white p-5 shadow-2xl lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white">
                    SA
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">SmartAttend</p>
                    <p className="text-xs text-slate-500">Workforce OS</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-5 rounded-3xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? 'bg-teal-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
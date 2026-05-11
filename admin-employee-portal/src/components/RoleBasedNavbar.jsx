import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HiBars3,
  HiBellAlert,
  HiChevronDown,
  HiMiniMoon,
  HiMiniSun,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUser,
  HiXMark,
} from "react-icons/hi2";
import { ADMIN_MENU, EMPLOYEE_MENU } from "../config/navigation";
import { useAuth } from "../context/AuthContext";

export default function RoleBasedNavbar() {
  const { user, logout, toggleTheme, theme } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const navItems = useMemo(
    () => (user?.role === "admin" ? ADMIN_MENU : EMPLOYEE_MENU),
    [user?.role]
  );

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    setIsMobileOpen(false);
    navigate("/");
  };

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 p-3">
      <nav className="relative mx-auto grid min-h-[74px] max-w-7xl grid-cols-[auto_auto_1fr] items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 shadow-xl shadow-slate-900/5 backdrop-blur lg:grid-cols-[auto_1fr_auto]">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => navigate("/home")}
        >
          <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-teal-700 to-emerald-500 after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-3 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white" />
          <div>
            <p className="leading-none font-bold text-slate-900">SmartAttend</p>
            <span className="mt-1 block text-xs text-slate-500">QR Attendance System</span>
          </div>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
          onClick={() => setIsMobileOpen((state) => !state)}
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <HiXMark /> : <HiBars3 />}
        </button>

        <ul
          className={`absolute left-3 right-3 top-[86px] z-30 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 lg:static lg:flex lg:flex-row lg:justify-center lg:gap-1 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
            isMobileOpen ? "flex" : "hidden lg:flex"
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition lg:w-auto ${
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                    }`
                  }
                >
                  <Icon />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
            aria-label="Late alerts and notifications"
          >
            <HiBellAlert />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
          </button>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <HiMiniMoon /> : <HiMiniSun />}
          </button>

          <div className="relative">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-700"
              onClick={() => setShowProfileMenu((state) => !state)}
            >
              <span className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white uppercase">
                {user.role === "admin" ? "Admin" : "Employee"}
              </span>
              <span className="hidden max-w-[120px] truncate text-sm md:inline">{user.name}</span>
              <HiChevronDown />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
                  onClick={() =>
                    navigate(user.role === "admin" ? "/admin/dashboard" : "/employee/profile")
                  }
                >
                  <HiOutlineUser />
                  <span>{user.role === "admin" ? "View Profile" : "My Profile"}</span>
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
                  onClick={handleLogout}
                >
                  <HiOutlineArrowRightOnRectangle />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

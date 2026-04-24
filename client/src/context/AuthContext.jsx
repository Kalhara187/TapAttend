import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const USERS_BY_ROLE = {
  admin: {
    id: 1,
    role: "admin",
    name: "Admin Panel",
    email: "admin@smartattend.local",
  },
  employee: {
    id: 11,
    role: "employee",
    name: "Employee User",
    email: "employee@smartattend.local",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");

  const loginAsRole = (role) => {
    setUser(USERS_BY_ROLE[role] ?? null);
  };

  const logout = () => {
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const value = useMemo(
    () => ({
      user,
      theme,
      isAuthenticated: Boolean(user),
      loginAsRole,
      logout,
      toggleTheme,
    }),
    [theme, user]
  );

  return (
    <AuthContext.Provider value={value}>
      <div className={`theme-root ${theme}`}>{children}</div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}

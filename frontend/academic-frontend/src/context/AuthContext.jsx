// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");
    const isSuperUser = localStorage.getItem("is_superuser") === "true";

    if (token && userType) {
      return { token, userType, isSuperUser };
    }
    return null;
  });

  // 🔁 Sincronizar cambios de storage (por si otro tab hace logout/login)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("user_type");
      const isSuperUser = localStorage.getItem("is_superuser") === "true";
      console.log("🔁 Rehidratando contexto con:", { token, userType, isSuperUser });
      if (token && userType) {
        setUser({ token, userType, isSuperUser });
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData) => {
    console.log("🔐 Login: datos recibidos del backend:", userData);

    localStorage.setItem("token", userData.token);
    localStorage.setItem("refresh", userData.refresh);
    localStorage.setItem("user_type", userData.user_type);
    localStorage.setItem("is_superuser", userData.is_superuser ? "true" : "false");

    setUser({
      token: userData.token,
      userType: userData.user_type,
      isSuperUser: userData.is_superuser,
    });
  };

  const logout = () => {
    console.log("🚪 Logout: limpiando localStorage");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_type");
    localStorage.removeItem("is_superuser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

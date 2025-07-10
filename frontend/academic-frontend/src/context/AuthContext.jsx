// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");
    const isSuperUser = localStorage.getItem("is_superuser") === "true";
    const first_name = localStorage.getItem("first_name");
    const last_name = localStorage.getItem("last_name");
    const email = localStorage.getItem("email");

    if (token && userType) {
      return {
        token,
        user_type: userType,
        isSuperUser,
        first_name,
        last_name,
        email
      };
    }
    return null;
  });

  // 🔁 Sincronizar cambios de storage (por si otro tab hace logout/login)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("user_type");
      const isSuperUser = localStorage.getItem("is_superuser") === "true";
      const first_name = localStorage.getItem("first_name");
      const last_name = localStorage.getItem("last_name");
      const email = localStorage.getItem("email");

      console.log("🔁 Rehidratando contexto con:", {
        token,
        userType,
        isSuperUser,
        first_name,
        last_name,
        email
      });

      if (token && userType) {
        setUser({
          token,
          userType,
          isSuperUser,
          first_name,
          last_name,
          email
        });
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData) => {
    console.log("🔐 Login: datos recibidos del backend:", userData);

    // Almacenar datos básicos
    localStorage.setItem("token", userData.token);
    localStorage.setItem("refresh", userData.refresh);
    localStorage.setItem("user_type", userData.user_type);
    localStorage.setItem("is_superuser", userData.is_superuser ? "true" : "false");

    // Almacenar datos adicionales del usuario si existen
    if (userData.first_name) localStorage.setItem("first_name", userData.first_name);
    if (userData.last_name) localStorage.setItem("last_name", userData.last_name);
    if (userData.email) localStorage.setItem("email", userData.email);

    // Actualizar el estado con todos los datos
    setUser({
      token: userData.token,
      user_type: userData.user_type,
      isSuperUser: userData.is_superuser,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
    });
  };

  const logout = () => {
    console.log("🚪 Logout: limpiando localStorage");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_type");
    localStorage.removeItem("is_superuser");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("email");
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
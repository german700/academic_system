// academic_system/frontend/academic-frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(() => {
   const token = localStorage.getItem("token");
   const userType = localStorage.getItem("user_type");
   const isSuperUser = localStorage.getItem("is_superuser") === "true"; // Conversión a tipo booleano
 
   if (token && userType) {
     return { token, userType, isSuperUser };
   }
   return null;
 });

 useEffect(() => {
   const token = localStorage.getItem('token');
   const userType = localStorage.getItem('user_type');
   const isSuperUser = localStorage.getItem('is_superuser') === 'true';

   if (token && userType) {
     setUser({ token, userType, isSuperUser });
   }
 }, []);

 const login = (userData) => {
   console.log("Datos recibidos del backend en login:", userData); // Registro para depuración
 
   localStorage.setItem("token", userData.token);
   localStorage.setItem("refresh", userData.refresh);
   localStorage.setItem("user_type", userData.user_type);
   
   // Almacenamiento adecuado del valor is_superuser
   localStorage.setItem("is_superuser", userData.is_superuser ? "true" : "false");
 
   setUser({
     token: userData.token,
     userType: userData.user_type,
     isSuperUser: userData.is_superuser, // Guardado en el estado de la aplicación
   });
 };

 const logout = () => {
   localStorage.removeItem('token');
   localStorage.removeItem('refresh');
   localStorage.removeItem('user_type');
   localStorage.removeItem('is_superuser');
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
   throw new Error('useAuth debe ser usado dentro de un AuthProvider');
 }
 return context;
};
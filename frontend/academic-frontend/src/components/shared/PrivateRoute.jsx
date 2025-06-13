// src/components/shared/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useEffect } from 'react';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  useEffect(() => {
    console.log("🔒 Evaluando acceso. Usuario:", user);
  }, [user]);

  if (!user) {
    console.warn("⛔ Usuario no autenticado. Redirigiendo al login.");
    return <Navigate to="/login" replace />;
  }

  if (user.isSuperUser || allowedRoles.includes(user.userType)) {
    return children;
  }

  console.warn("🚫 Usuario autenticado pero sin permisos:", user);
  return <div className="text-red-500 text-center p-6">Acceso restringido.</div>;
};

export default PrivateRoute;

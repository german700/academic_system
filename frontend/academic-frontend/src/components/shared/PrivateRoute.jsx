// src/components/shared/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  console.log("Usuario autenticado:", user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Permitir acceso si el usuario es superusuario o tiene un rol permitido
  if (user.isSuperUser || allowedRoles.includes(user.userType)) {
    return children;
  }

  return <div className="text-red-500 text-center p-6">Acceso restringido.</div>;
};

export default PrivateRoute;

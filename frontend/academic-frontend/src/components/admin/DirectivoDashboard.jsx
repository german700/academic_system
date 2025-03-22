import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log(user.userType);

  // Verificar si el usuario es un director
  console.log(!user || user.userType !== "director");
  if (!user || user.userType !== "director") {
    return <Navigate to="/login" />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Panel Administrativo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <button
          className="p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          onClick={() => navigate("/admin/estudiantes")}
        >
          Gestionar Estudiantes
        </button>
        <button
          className="p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
          onClick={() => navigate("/admin/docentes")}
        >
          Gestionar Docentes
        </button>
        <button
          className="p-4 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600"
          onClick={() => navigate("/admin/administrativos")}
        >
          Gestionar Administrativos
        </button>
        <button
          className="p-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600"
          onClick={() => navigate("/admin/materias")}
        >
          Gestionar Materias
        </button>
        <button
          className="p-4 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600"
          onClick={() => navigate("/admin/cursos")}
        >
          Gestionar Cursos
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
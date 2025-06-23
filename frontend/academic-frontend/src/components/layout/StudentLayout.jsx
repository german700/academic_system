//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\layout\StudentLayout.jsx
import React from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentLayout = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user || user.userType !== "student") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-100 p-4 shadow-lg space-y-4">
        <h2 className="text-xl font-bold mb-4">Estudiante</h2>
        <nav className="flex flex-col space-y-2">
          <Link
            to="/student"
            className={location.pathname === "/student" ? "font-semibold text-blue-600" : ""}
          >
            Mi perfil
          </Link>
          <Link
            to="/student/estudiante-materias"
            className={location.pathname.includes("estudiante-materias") ? "font-semibold text-blue-600" : ""}
          >
            Mis materias
          </Link>

          <Link
            to="/student/analisis"
            className={location.pathname.includes("analisis") ? "font-semibold text-blue-600" : ""}
          >
            Análisis
          </Link>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;

//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\layout\StudentLayout.jsx
import React from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, BookOpen, User, BarChart2 } from "lucide-react";
import "./layout_styles/StudentLayout.css";

const StudentLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user || user.user_type !== "student") {
    return <Navigate to="/login" replace />;
  }

  const menu = [
    { name: "Mi Perfil", path: "/student", icon: <User className="w-5 h-5" /> },
    { name: "Mis Materias", path: "/student/estudiante-materias", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Análisis", path: "/student/analisis", icon: <BarChart2 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-800">
      {/* Barra Superior */}
      <header className="header">
        <div className="header-left">
          <img
            src="/logo.png"
            alt="Logo Institucional"
            className="logo"
          />
          <div>
            <h1 className="panel-header">Panel Estudiante</h1>
            <h2 className="panel-subtitle">
              Bienvenido, {user?.first_name} {user?.last_name}
            </h2>
          </div>
        </div>
        <div className="header-right">
          <div className="user-avatar">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <button onClick={logout} className="logout-button">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Cuerpo con Sidebar + contenido */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="sidebar">
          <nav className="space-y-3">
            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${location.pathname === item.path
                  ? "active"
                  : ""
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="main-content-student">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

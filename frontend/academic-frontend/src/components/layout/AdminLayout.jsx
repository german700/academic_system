// src/components/layout/LayoutAdmin.jsx
import React from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Users, BookOpen, CalendarDays, UserCheck, UserCog, LayoutDashboard } from "lucide-react";
import "./layout_styles/AdminLayout.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || user.user_type !== "director") {
    return <Navigate to="/login" replace />;
  }

  const menu = [
    { name: "Dashboard", path: "/directivo-dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Estudiantes", path: "/admin/estudiantes", icon: <Users className="w-5 h-5" /> },
    { name: "Docentes", path: "/admin/docentes", icon: <UserCheck className="w-5 h-5" /> },
    { name: "Administrativos", path: "/admin/administrativos", icon: <UserCog className="w-5 h-5" /> },
    { name: "Materias", path: "/admin/materias", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Cursos", path: "/admin/cursos", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Períodos", path: "/admin/periodos", icon: <CalendarDays className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-800">
      {/* Encabezado */}
      <header className="header">
        <div className="header-left">
          <img src="/logo.png" alt="Logo Institucional" className="logo" />
          <div>
            <h1 className="panel-header">Panel Administrativo</h1>
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

      {/* Sidebar + contenido */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="sidebar">
          <nav className="space-y-3">
            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
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

export default AdminLayout;

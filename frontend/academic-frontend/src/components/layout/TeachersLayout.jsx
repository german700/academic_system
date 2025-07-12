// src/components/layout/TeachersLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, LayoutDashboard, BookOpen } from "lucide-react";
import { fetchTeacherDashboard } from "../services/docentesService";
import "./layout_styles/AdminLayout.css"; // Reutilizando estilos existentes

const TeachersLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchTeacherDashboard()
      .then((data) => setCourses(data?.courses || []))
      .catch(() => setCourses([]));
  }, []);

  if (!user || user.user_type !== "teacher") {
    return <Navigate to="/login" replace />;
  }

  const menu = [
    { name: "Dashboard", path: "/teachers/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-800">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src="/logo.png" alt="Logo Institucional" className="logo" />
          <div>
            <h1 className="panel-header">Panel Docente</h1>
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

            {/* Cursos asignados */}
            {courses.length > 0 && (
              <div className="mt-6">
                <p className="text-xs text-gray-500 mb-2">Mis cursos</p>
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/teachers/courses/${course.id}`}
                    className={`menu-item ${location.pathname === `/teachers/courses/${course.id}` ? "active" : ""}`}
                  >
                    <BookOpen className="w-4 h-4" />
                    {course.name}
                  </Link>
                ))}
              </div>
            )}
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

export default TeachersLayout;

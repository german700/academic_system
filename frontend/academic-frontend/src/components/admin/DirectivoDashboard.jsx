import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./admin_css/DirectivoDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user || user.user_type !== "director") {
    return <Navigate to="/login" />;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Panel Administrativo</h1>
      <div className="dashboard-grid">
        <button
          className="dashboard-button btn-estudiantes"
          onClick={() => navigate("/admin/estudiantes")}
        >
          Gestionar Estudiantes
        </button>
        <button
          className="dashboard-button btn-docentes"
          onClick={() => navigate("/admin/docentes")}
        >
          Gestionar Docentes
        </button>
        <button
          className="dashboard-button btn-administrativos"
          onClick={() => navigate("/admin/administrativos")}
        >
          Gestionar Administrativos
        </button>
        <button
          className="dashboard-button btn-materias"
          onClick={() => navigate("/admin/materias")}
        >
          Gestionar Materias
        </button>
        <button
          className="dashboard-button btn-cursos"
          onClick={() => navigate("/admin/cursos")}
        >
          Gestionar Cursos
        </button>
        <button
          className="dashboard-button btn-periodos"
          onClick={() => navigate("/admin/periodos")}
        >
          📅 Gestionar Períodos Académicos
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

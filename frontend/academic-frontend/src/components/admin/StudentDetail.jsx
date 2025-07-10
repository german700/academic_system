//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerIAAnalisisCompletoEstudiante } from "../services/estudiantesService";

// Subcomponentes
import StudentProfile from "./StudentDetail/StudentProfile";
import StudentGradesTable from "./StudentDetail/StudentGradesTable";
import StudentAttendance from "./StudentDetail/StudentAttendance";
import SubjectComparisonChart from "./StudentDetail/SubjectComparisonChart";
import IAAnalysisSection from "./StudentDetail/IAAnalysisSection";

import "./admin_css/StudentDetail.css";

const StudentDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const result = await obtenerIAAnalisisCompletoEstudiante(id);
        setData(result);
      } catch (err) {
        setError("No se pudo cargar el análisis del estudiante.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  if (loading) return <p className="student-detail-container">Cargando datos...</p>;
  if (error) return <p className="student-detail-container">{error}</p>;

  if (!data || !data.student || Object.keys(data.student).length === 0) {
    return <p className="student-detail-container">Perfil del estudiante no disponible.</p>;
  }

  return (
    <div className="student-detail-container">
      <h1 className="student-detail-title">Análisis detallado del estudiante</h1>

      <div className="student-section">
        <StudentProfile student={data.student} />
      </div>

      <div className="student-section">
        {data.grades_summary ? (
          <StudentGradesTable gradesData={data.grades_summary} />
        ) : (
          <p>Calificaciones no disponibles.</p>
        )}
      </div>

      <div className="student-section">
        {data.attendance ? (
          <StudentAttendance attendance={data.attendance} />
        ) : (
          <p>Datos de asistencia no disponibles.</p>
        )}
      </div>

      <div className="student-section">
        {data.subject_comparison ? (
          <SubjectComparisonChart comparisonData={data.subject_comparison} />
        ) : (
          <p>Comparación de materias no disponible.</p>
        )}
      </div>

      <div className="student-section">
        {data.ia_analysis ? (
          <IAAnalysisSection ia={data.ia_analysis} />
        ) : (
          <p>Análisis de IA no disponible.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;

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

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  if (!data || !data.student || Object.keys(data.student).length === 0) {
    return <p>Perfil del estudiante no disponible.</p>;
  }

  return (
    <div>
      <h1>Análisis detallado del estudiante</h1>

      {/* CAMBIO AQUÍ: Cambié profile={data.student} por student={data.student} */}
      <StudentProfile student={data.student} />

      {data.grades_summary ? (
        <StudentGradesTable gradesData={data.grades_summary} />
      ) : (
        <p>Calificaciones no disponibles.</p>
      )}

      {data.attendance ? (
        <StudentAttendance attendance={data.attendance} />
      ) : (
        <p>Datos de asistencia no disponibles.</p>
      )}

      {data.subject_comparison ? (
        <SubjectComparisonChart comparisonData={data.subject_comparison} />
      ) : (
        <p>Comparación de materias no disponible.</p>
      )}

      {data.ia_analysis ? (
        <IAAnalysisSection ia={data.ia_analysis} />
      ) : (
        <p>Análisis de IA no disponible.</p>
      )}
    </div>
  );
};

export default StudentDetail;
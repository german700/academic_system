import React, { useEffect, useState } from "react";
import { obtenerIAAnalisisCompletoEstudiante } from "../../services/estudiantesService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StudentGlobalIAAnalysis = ({ studentId }) => {
  const [analisis, setAnalisis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalisis = async () => {
      try {
        const data = await obtenerIAAnalisisCompletoEstudiante(studentId);
        console.log("🔍 Análisis IA Global recibido:", data);
        setAnalisis(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAnalisis();
  }, [studentId]);

  if (error) return <p>Error: {error}</p>;
  if (!analisis) return <p>Cargando análisis IA del estudiante...</p>;

  const { student, ia_analysis, subject_comparison, grades_summary } = analisis;

  const comparativaMaterias = Object.entries(subject_comparison || {})
    .map(([materia, valores]) => {
      const estudiante = parseFloat(valores.student_avg);
      const curso = parseFloat(valores.course_avg);
      const grado = parseFloat(valores.grade_avg);
      if (isNaN(estudiante) || isNaN(curso) || isNaN(grado)) return null;
      return {
        materia,
        estudiante,
        curso,
        grado,
      };
    })
    .filter(Boolean);

  const nombresPeriodos = {
    1: "Primer periodo",
    2: "Segundo periodo",
    3: "Tercer periodo",
    4: "Cuarto periodo",
  };

  const resumenPeriodos = Object.entries(ia_analysis.trend_over_periods || {}).map(
    ([periodo, nota]) => ({
      periodo: nombresPeriodos[periodo] || `Periodo ${periodo}`,
      nota,
    })
  );

  return (
    <div>
      <h2>
        Análisis IA global de {student?.first_name} {student?.last_name}
      </h2>

      <p>
        <strong>Edad:</strong> {student?.edad ?? "Desconocida"} años
      </p>
      <p>
        <strong>Estrato:</strong> {student?.estrato ?? "Desconocido"}
      </p>
      <p>
        <strong>Promedio general:</strong>{" "}
        {grades_summary?.average_overall ?? "No disponible"}
      </p>
      <p>
        <strong>Materias en riesgo:</strong>{" "}
        {(ia_analysis?.subjects_at_risk || []).length > 0
          ? ia_analysis.subjects_at_risk.join(", ")
          : "Ninguna"}
      </p>

      <h3>Comparativa de promedio por materia</h3>
      {comparativaMaterias.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparativaMaterias}>
            <XAxis dataKey="materia" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="estudiante" fill="#8884d8" name="Estudiante" />
            <Bar dataKey="curso" fill="#82ca9d" name="Prom. Curso" />
            <Bar dataKey="grado" fill="#ffc658" name="Prom. Grado" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>No hay datos disponibles para mostrar la comparativa por materia.</p>
      )}

      <h3>Evolución de notas por periodo</h3>
      {resumenPeriodos.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resumenPeriodos}>
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="nota" fill="#8884d8" name="Nota" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>No hay datos disponibles de evolución por periodo.</p>
      )}
    </div>
  );
};

export default StudentGlobalIAAnalysis;

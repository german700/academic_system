// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\StudentMateria.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerMateriaEstudiante } from "../services/estudiantesService";
import "./students_css/StudentMateria.css"; // <-- Importación del CSS modular

const StudentMateria = () => {
  const { studentId, materiaId } = useParams();
  const navigate = useNavigate();
  const [materia, setMateria] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarMateria();
  }, []);

  const cargarMateria = async () => {
    try {
      const data = await obtenerMateriaEstudiante(studentId, materiaId);
      console.log("📌 Materia cargada:", data);
      setMateria(data);
    } catch (error) {
      console.error("❌ Error al cargar materia:", error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div className="materia-container text-center">Cargando...</div>;
  if (!materia) return <div className="materia-container text-center text-red-500">Materia no encontrada</div>;

  return (
    <div className="materia-container">
      <h1 className="materia-title">
        {materia.student.first_name} {materia.student.last_name} - {materia.subject.name}
      </h1>

      <button onClick={() => navigate(-1)} className="materia-button">Volver</button>

      <div className="materia-card">
        <h2 className="text-xl font-bold">Materia: {materia.subject.name}</h2>
        <p><strong>Código:</strong> {materia.subject.code}</p>
        <p><strong>Docente:</strong> {materia.teacher ? `${materia.teacher.first_name} ${materia.teacher.last_name}` : "Sin asignar"}</p>
      </div>

      <h2 className="notas-title">Notas</h2>
      <table className="notas-table">
        <thead>
          <tr>
            <th>Período</th>
            <th>Nota</th>
            <th>Año</th>
          </tr>
        </thead>
        <tbody>
          {materia.grades.length > 0 ? (
            materia.grades.map((nota) => (
              <tr key={nota.id}>
                <td>{nota.period}</td>
                <td>{nota.value}</td>
                <td>{nota.year}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="notas-empty">No hay notas registradas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentMateria;

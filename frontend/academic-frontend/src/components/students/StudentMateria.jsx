import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerMateriaEstudiante } from "../services/estudiantesService"; // ✅ Importamos el servicio

const StudentMateria = () => {
  const { studentId, materiaId } = useParams(); // ✅ Obtener parámetros de la URL
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

  if (cargando) return <div className="p-6 text-center">Cargando...</div>;
  if (!materia) return <div className="p-6 text-center text-red-500">Materia no encontrada</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {materia.student.first_name} {materia.student.last_name} - {materia.subject.name}
      </h1>
      <button onClick={() => navigate(-1)} className="p-2 bg-gray-500 text-white mb-4">Volver</button>

      {/* 🔹 Datos de la materia */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold">Materia: {materia.subject.name}</h2>
        <p><strong>Código:</strong> {materia.subject.code}</p>
        <p><strong>Docente:</strong> {materia.teacher ? `${materia.teacher.first_name} ${materia.teacher.last_name}` : "Sin asignar"}</p>
      </div>

      {/* 🔹 Tabla de notas */}
      <h2 className="text-xl font-bold mt-6">Notas</h2>
      <table className="min-w-full bg-white border mt-2">
        <thead>
          <tr>
            <th className="border px-4 py-2">Período</th>
            <th className="border px-4 py-2">Nota</th>
            <th className="border px-4 py-2">Año</th>
          </tr>
        </thead>
        <tbody>
          {materia.grades.length > 0 ? (
            materia.grades.map((nota) => (
              <tr key={nota.id}>
                <td className="border px-4 py-2">{nota.period}</td>
                <td className="border px-4 py-2">{nota.value}</td>
                <td className="border px-4 py-2">{nota.year}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center p-4">No hay notas registradas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentMateria;

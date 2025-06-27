import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentIAAnalysis from "./StudentDetail/StudentIAAnalysis";
import StudentInfo from "./StudentDetail/StudentInfo";
import {
  obtenerPerfilDetalladoEstudiante,
  obtenerPeriodoActual,
  obtenerIAAnalisisCompletoEstudiante
} from "../services/estudiantesService";

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [iaData, setIaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const profile = await obtenerPerfilDetalladoEstudiante(id);
        const periodo = await obtenerPeriodoActual();
        setStudent(profile);

        // ahora solo necesitas el studentId
        const fullIa = await obtenerIAAnalisisCompletoEstudiante(id);
        setIaData(fullIa);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p>Cargando información del estudiante...</p>;
  if (error)   return <p className="text-red-600">Error: {error}</p>;
  if (!student) return <p>No se encontró el estudiante.</p>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-4 px-3 py-1 bg-gray-300 rounded">
        ← Volver
      </button>
      <h1 className="text-2xl font-bold mb-4">
        Detalle de {student.first_name} {student.last_name}
      </h1>

      <StudentInfo student={student} />

      {student.materias?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Materias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {student.materias.map(m => (
              <div key={m.id} className="bg-blue-100 p-2 rounded">
                <p className="font-medium">{m.nombre}</p>
                <p className="text-sm text-gray-600">ID: {m.id}</p>
                <p className="text-sm text-gray-700">Docente: {m.docente}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">Análisis de IA</h2>
        <StudentIAAnalysis data={iaData} />
      </section>
    </div>
  );
};

export default StudentDetail;

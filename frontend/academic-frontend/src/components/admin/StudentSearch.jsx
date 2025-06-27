//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentSearch.jsx
import React, { useEffect, useState } from "react";
import { obtenerCursos, buscarEstudiantes } from "../services/estudiantesService";

const StudentSearch = () => {
  const [query, setQuery] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    const fetchCursos = async () => {
      const data = await obtenerCursos();
      setCursos(data);
    };
    fetchCursos();
  }, []);

  const manejarBusqueda = async () => {
    try {
      const data = await buscarEstudiantes(query); // usa /teacher/search-students/?q=
      const filtrados = cursoSeleccionado
        ? data.filter((est) => est.course?.id?.toString() === cursoSeleccionado)
        : data;
      setResultados(filtrados);
    } catch (error) {
      console.error("Error al buscar estudiantes:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Buscar Estudiantes</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, apellido o ID"
          className="border p-2 flex-1"
        />
        <select
          value={cursoSeleccionado}
          onChange={(e) => setCursoSeleccionado(e.target.value)}
          className="border p-2"
        >
          <option value="">Todos los cursos</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.name} - {curso.code}
            </option>
          ))}
        </select>
        <button
          onClick={manejarBusqueda}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Curso</th>
            <th className="border px-4 py-2">Género</th>
            <th className="border px-4 py-2">Barrio</th>
            <th className="border px-4 py-2">Nivel Socioeconómico</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((est) => (
            <tr key={est.id}>
              <td className="border px-4 py-2">{est.student_id}</td>
              <td className="border px-4 py-2">{`${est.first_name} ${est.last_name}`}</td>
              <td className="border px-4 py-2">{est.email}</td>
              <td className="border px-4 py-2">
                {est.course
                  ? `${est.course.name} - ${est.course.code}`
                  : "Sin curso"}
              </td>
              <td className="border px-4 py-2">{est.gender}</td>
              <td className="border px-4 py-2">{est.neighborhood}</td>
              <td className="border px-4 py-2">{est.socioeconomic_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentSearch;

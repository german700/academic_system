// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\TeacherSearch.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buscarDocentes, obtenerGrados } from "../services/docentesService";

const TeacherSearch = () => {
  const [query, setQuery] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [resultados, setResultados] = useState([]);
  const [grados, setGrados] = useState([]);

  useEffect(() => {
    const fetchGrados = async () => {
      try {
        const data = await obtenerGrados();
        setGrados(data);
      } catch (error) {
        console.error("Error al cargar grados:", error);
      }
    };
    fetchGrados();
  }, []);

  const manejarBusqueda = async () => {
    try {
      const data = await buscarDocentes(query); // Usa endpoint tipo: /admin/search-teachers/?q=
      const filtrados = gradoSeleccionado
        ? data.filter((docente) =>
            docente.grados?.some(
              (g) => g.id?.toString() === gradoSeleccionado
            )
          )
        : data;
      setResultados(filtrados);
    } catch (error) {
      console.error("Error al buscar docentes:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Buscar Docentes</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, apellido o correo"
          className="border p-2 flex-1"
        />
        <select
          value={gradoSeleccionado}
          onChange={(e) => setGradoSeleccionado(e.target.value)}
          className="border p-2"
        >
          <option value="">Todos los grados</option>
          {grados.map((grado) => (
            <option key={grado.id} value={grado.id}>
              Grado {grado.numero} ({grado.categoria})
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
        {resultados.length > 0 && (
          <thead>
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Nombre</th>
              <th className="border px-4 py-2">Especialización</th>
            </tr>
          </thead>
        )}
        <tbody>
          {resultados.map((docente) => (
            <tr key={docente.id}>
              <td className="border px-4 py-2">{docente.teacher_id}</td>
              <td className="border px-4 py-2">
                <Link
                  to={`/teacher/${docente.id}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {`${docente.first_name} ${docente.middle_name || ""} ${docente.last_name} ${docente.second_last_name || ""}`.trim()}
                </Link>
              </td>
              <td className="border px-4 py-2">{docente.specialization}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {resultados.length === 0 && query && (
        <p className="mt-4 text-gray-500">No se encontraron docentes.</p>
      )}
    </div>
  );
};

export default TeacherSearch;
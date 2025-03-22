import React, { useEffect, useState } from "react";
import { obtenerGrados } from "../services/gradosService";
import { obtenerCursos } from "../services/cursosService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CursosPorGrado = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    cargarGrados();
  }, []);

  // Cargar la lista de grados desde el servicio
  const cargarGrados = async () => {
    try {
      const data = await obtenerGrados();
      setGrados(data);
    } catch (error) {
      console.error("Error al cargar grados:", error);
    }
  };

  // Filtrar cursos por grado seleccionado
  const cargarCursosPorGrado = async (gradoId) => {
    try {
      const data = await obtenerCursos(); // Obtener todos los cursos
      const filtrados = data.filter((curso) => curso.grado && curso.grado.id === gradoId);
      setCursos(filtrados);
    } catch (error) {
      console.error("Error al cargar cursos por grado:", error);
    }
  };

  // Manejar cambios en la selección del grado
  const manejarCambioGrado = (e) => {
    const gradoId = parseInt(e.target.value);
    setGradoSeleccionado(gradoId);
    cargarCursosPorGrado(gradoId);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cursos por Grado</h1>

      <div className="mb-4">
        <select onChange={manejarCambioGrado} className="border p-2">
          <option value="">Seleccione un Grado</option>
          {grados.map((grado) => (
            <option key={grado.id} value={grado.id}>
              {grado.numero} - {grado.categoria}
            </option>
          ))}
        </select>
      </div>

      {gradoSeleccionado && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Cursos del Grado seleccionado</h2>
          {cursos.length > 0 ? (
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Nombre</th>
                  <th className="border px-4 py-2">Descripción</th>
                  <th className="border px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((curso) => (
                  <tr key={curso.id}>
                    <td className="border px-4 py-2">{curso.name || "Sin nombre"}</td>
                    <td className="border px-4 py-2">{curso.description || "Sin descripción"}</td>
                    <td className="border px-4 py-2">
                      <button onClick={() => navigate(`/admin/cursos/${curso.id}`)} className="p-2 bg-yellow-500 text-white mr-2">
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay cursos para el grado seleccionado.</p>
          )}
        </div>
      )}

      <button onClick={() => navigate("/Directivo-dashboard")} className="mt-4 p-2 bg-gray-500 text-white">
        Volver
      </button>
    </div>
  );
};

export default CursosPorGrado;
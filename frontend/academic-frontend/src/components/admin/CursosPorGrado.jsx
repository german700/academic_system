//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\CursosPorGrado.jsx
import React, { useEffect, useState } from "react";
import { obtenerGrados } from "../services/gradosService";
import { obtenerCursos } from "../services/cursosService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./admin_css/CursosPorGrado.css";

const CursosPorGrado = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    cargarGrados();
  }, []);

  const cargarGrados = async () => {
    try {
      const data = await obtenerGrados();
      setGrados(data);
    } catch (error) {
      console.error("Error al cargar grados:", error);
    }
  };

  const cargarCursosPorGrado = async (gradoId) => {
    try {
      const data = await obtenerCursos();
      const filtrados = data.filter((curso) => curso.grado && curso.grado.id === gradoId);
      setCursos(filtrados);
    } catch (error) {
      console.error("Error al cargar cursos por grado:", error);
    }
  };

  const manejarCambioGrado = (e) => {
    const gradoId = parseInt(e.target.value);
    setGradoSeleccionado(gradoId);
    cargarCursosPorGrado(gradoId);
  };

  return (
    <div className="cursosgrado-container">
      <h1 className="cursosgrado-title">Cursos por Grado</h1>

      <div className="mb-4">
        <select onChange={manejarCambioGrado} className="cursosgrado-select">
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
          <h2 className="cursosgrado-subtitle">Cursos del Grado seleccionado</h2>
          {cursos.length > 0 ? (
            <table className="cursosgrado-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((curso) => (
                  <tr key={curso.id}>
                    <td>{curso.name || "Sin nombre"}</td>
                    <td>{curso.description || "Sin descripción"}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/admin/cursos/${curso.id}`)}
                        className="cursosgrado-btn"
                      >
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

      <button
        onClick={() => navigate("/Directivo-dashboard")}
        className="cursosgrado-btn cursosgrado-btn-volver"
      >
        Volver
      </button>
    </div>
  );
};

export default CursosPorGrado;

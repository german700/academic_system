//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentSearch.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  obtenerCursos,
  buscarEstudiantes,
} from "../services/estudiantesService";
import "./admin_css/StudentSearch.css";

const StudentSearch = () => {
  const [query, setQuery] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchCursos = async () => {
      const data = await obtenerCursos();
      setCursos(data);
    };
    fetchCursos();
  }, []);

  const manejarBusqueda = async () => {
    if (!query.trim()) {
      setResultados([]);
      setBusquedaRealizada(false);
      return;
    }

    setCargando(true);
    setBusquedaRealizada(false);

    try {
      const data = await buscarEstudiantes(query);
      const filtrados = cursoSeleccionado
        ? data.filter(
            (est) => est.course?.id?.toString() === cursoSeleccionado
          )
        : data;
      setResultados(filtrados);
    } catch (error) {
      console.error("Error al buscar estudiantes:", error);
      setResultados([]);
    } finally {
      setCargando(false);
      setBusquedaRealizada(true);
    }
  };

  const manejarEnterKey = (e) => {
    if (e.key === 'Enter') {
      manejarBusqueda();
    }
  };

  const limpiarBusqueda = () => {
    setQuery("");
    setCursoSeleccionado("");
    setResultados([]);
    setBusquedaRealizada(false);
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Buscar Estudiantes</h1>
      
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={manejarEnterKey}
          placeholder="Buscar por nombre, apellido o ID"
          className="search-input"
        />
        
        <select
          value={cursoSeleccionado}
          onChange={(e) => setCursoSeleccionado(e.target.value)}
          className="search-select"
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
          className="search-button"
          disabled={cargando}
        >
          {cargando ? "Buscando..." : "Buscar"}
        </button>
        
        <button 
          onClick={limpiarBusqueda} 
          className="clear-button"
          disabled={cargando}
        >
          Limpiar
        </button>
      </div>

      {cargando && (
        <div className="loading-message">
          Buscando estudiantes...
        </div>
      )}

      {resultados.length > 0 && (
        <table className="search-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Curso</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((est) => (
              <tr key={est.id}>
                <td>{est.student_id}</td>
                <td>
                  <Link to={`/students/${est.id}`} className="search-link">
                    {`${est.first_name} ${est.middle_name || ""} ${est.last_name} ${
                      est.second_last_name || ""
                    }`.trim()}
                  </Link>
                </td>
                <td>
                  {est.course
                    ? `${est.course.name} - ${est.course.code}`
                    : "Sin curso"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {busquedaRealizada && resultados.length === 0 && (
        <div className="no-results">
          <p>No se encontraron estudiantes que coincidan con tu búsqueda.</p>
          <p>Intenta con otros términos de búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
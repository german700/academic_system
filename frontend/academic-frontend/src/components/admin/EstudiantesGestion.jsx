//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\EstudiantesGestion.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  obtenerEstudiantes,
  crearEstudiante,
  eliminarEstudiante,
  obtenerCursos,
} from "../services/estudiantesService";
import { obtenerGrados } from "../services/gradosService";
import StudentSearch from "./StudentSearch";
import "../admin/admin_css/EstudiantesGestion.css";

const EstudiantesGestion = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    second_last_name: "",
    date_of_birth: "",
    email: "",
    grado_id: "",
    course_id: "",
    gender: "",
    neighborhood: "",
    socioeconomic_status: "",
  });

  useEffect(() => {
    cargarEstudiantes();
    cargarCursos();
    cargarGrados();
  }, []);

  const cargarEstudiantes = async () => {
    try {
      const data = await obtenerEstudiantes();
      setEstudiantes(data);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
    }
  };

  const cargarCursos = async () => {
    try {
      const data = await obtenerCursos();
      setCursos(data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    }
  };

  const cargarGrados = async () => {
    try {
      const data = await obtenerGrados();
      setGrados(data);
    } catch (error) {
      console.error("Error al cargar grados:", error);
    }
  };

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarCambioGrado = (e) => {
    const gradoId = e.target.value;
    setGradoSeleccionado(gradoId);
    setFormData({ ...formData, grado_id: gradoId });
  };

  const cursosFiltrados = gradoSeleccionado
    ? cursos.filter((curso) => curso.grado && curso.grado.id.toString() === gradoSeleccionado)
    : cursos;

  const manejarEnvio = async (e) => {
    e.preventDefault();
    try {
      await crearEstudiante(formData);
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        second_last_name: "",
        date_of_birth: "",
        email: "",
        grado_id: "",
        course_id: "",
        gender: "",
        neighborhood: "",
        socioeconomic_status: "",
      });
      setGradoSeleccionado("");
      setMostrarFormulario(false);
      cargarEstudiantes();
    } catch (error) {
      console.error("Error al guardar estudiante:", error);
    }
  };

  const manejarEliminacion = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este estudiante?")) {
      try {
        await eliminarEstudiante(id);
        cargarEstudiantes();
      } catch (error) {
        console.error("Error al eliminar estudiante:", error);
      }
    }
  };

  return (
    <div className="estudiantes-container">
      <h1 className="titulo-principal">Gestión de Estudiantes</h1>

      <div className="busqueda-avanzada">
        <h2>🔍 Búsqueda Avanzada de Estudiantes</h2>
        <StudentSearch />
      </div>

      <div className="mb-4">
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="btn-primario"
        >
          {mostrarFormulario ? "Cancelar" : "➕ Agregar Nuevo Estudiante"}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="formulario-box">
          <h3>➕ Agregar Nuevo Estudiante</h3>
          <form onSubmit={manejarEnvio} className="formulario-estudiante">
            <input type="text" name="first_name" placeholder="Nombre" value={formData.first_name} onChange={manejarCambio} className="input-form" required />
            <input type="text" name="middle_name" placeholder="Segundo Nombre" value={formData.middle_name} onChange={manejarCambio} className="input-form" />
            <input type="text" name="last_name" placeholder="Apellido Paterno" value={formData.last_name} onChange={manejarCambio} className="input-form" required />
            <input type="text" name="second_last_name" placeholder="Apellido Materno" value={formData.second_last_name} onChange={manejarCambio} className="input-form" />
            <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={manejarCambio} className="input-form" required />
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={manejarCambio} className="input-form" required />

            <select name="grado_id" value={gradoSeleccionado} onChange={manejarCambioGrado} className="input-form" required>
              <option value="">Selecciona un Grado</option>
              {grados.map((grado) => (
                <option key={grado.id} value={grado.id}>
                  {grado.numero} - {grado.categoria}
                </option>
              ))}
            </select>

            <select name="course_id" value={formData.course_id} onChange={manejarCambio} className="input-form">
              <option value="">Selecciona un Curso</option>
              {cursosFiltrados.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.name} - {curso.code}
                </option>
              ))}
            </select>

            <select name="gender" value={formData.gender} onChange={manejarCambio} className="input-form" required>
              <option value="">Selecciona Género</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>

            <input type="text" name="neighborhood" placeholder="Barrio o Zona" value={formData.neighborhood} onChange={manejarCambio} className="input-form" />

            <select name="socioeconomic_status" value={formData.socioeconomic_status} onChange={manejarCambio} className="input-form">
              <option value="">Nivel Socioeconómico</option>
              <option value="BAJO">Bajo</option>
              <option value="MEDIO_BAJO">Medio Bajo</option>
              <option value="MEDIO">Medio</option>
              <option value="MEDIO_ALTO">Medio Alto</option>
              <option value="ALTO">Alto</option>
            </select>

            <div className="md:col-span-2">
              <button type="submit" className="btn-primario">
                ➕ Agregar Estudiante
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de estudiantes */}
      <div className="tabla-wrapper">
        <h3>📋 Lista de Estudiantes ({estudiantes.length})</h3>
        <div className="overflow-x-auto">
          <table className="tabla-estudiantes">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Correo</th>
                <th>Grado</th>
                <th>Curso</th>
                <th>Género</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No hay estudiantes registrados
                  </td>
                </tr>
              ) : (
                estudiantes.map((estudiante) => (
                  <tr key={estudiante.id}>
                    <td>
                      <Link to={`/students/${estudiante.id}`} className="link-detalle">
                        {`${estudiante.first_name} ${estudiante.middle_name || ''} ${estudiante.last_name} ${estudiante.second_last_name || ''}`.trim()}
                      </Link>
                    </td>
                    <td>{estudiante.email}</td>
                    <td>{estudiante.grado ? `${estudiante.grado.numero} - ${estudiante.grado.categoria}` : "Sin grado"}</td>
                    <td>{estudiante.course ? `${estudiante.course.name} - ${estudiante.course.code}` : "Sin curso"}</td>
                    <td>
                      {estudiante.gender === "M" ? "Masculino" : estudiante.gender === "F" ? "Femenino" : estudiante.gender === "O" ? "Otro" : "-"}
                    </td>
                    <td className="text-center">
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                        <Link to={`/students/${estudiante.id}/edit`} className="btn-editar">
                          ✏️ Editar
                        </Link>
                        <button onClick={() => manejarEliminacion(estudiante.id)} className="btn-eliminar">
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EstudiantesGestion;
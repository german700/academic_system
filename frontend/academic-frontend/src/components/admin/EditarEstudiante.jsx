// src/components/admin/EditarEstudiante.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  obtenerEstudiantePorId,
  actualizarEstudiante,
  obtenerCursos,
  obtenerPerfilDetalladoEstudiante,
} from "../services/estudiantesService";
import { obtenerGrados } from "../services/gradosService";
import "./admin_css/EditarEstudiante.css"; // ✅ Importa el CSS modular

const EditarEstudiante = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const [grados, setGrados] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const estudiante = await obtenerPerfilDetalladoEstudiante(id);
        setFormData({
          first_name: estudiante.first_name || "",
          middle_name: estudiante.middle_name || "",
          last_name: estudiante.last_name || "",
          second_last_name: estudiante.second_last_name || "",
          date_of_birth: estudiante.date_of_birth || "",
          email: estudiante.email || "",
          grado_id: estudiante.grado?.id || "",
          course_id: estudiante.course?.id || "",
          gender: estudiante.gender || "",
          neighborhood: estudiante.neighborhood || "",
          socioeconomic_status: estudiante.socioeconomic_status || "",
        });
        setGradoSeleccionado(estudiante.grado?.id?.toString() || "");

        const [gradosData, cursosData] = await Promise.all([
          obtenerGrados(),
          obtenerCursos(),
        ]);
        setGrados(gradosData);
        setCursos(cursosData);
      } catch (error) {
        console.error("Error al cargar datos del estudiante:", error);
        alert("Error al cargar los datos. ¿Estás autenticado?");
      }
    };

    cargarDatos();
  }, [id]);

  const cursosFiltrados = gradoSeleccionado
    ? cursos.filter((c) => c.grado && c.grado.id.toString() === gradoSeleccionado)
    : cursos;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGradoChange = (e) => {
    const gradoId = e.target.value;
    setGradoSeleccionado(gradoId);
    setFormData({ ...formData, grado_id: gradoId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarEstudiante(id, formData);
      navigate(-1);
    } catch (error) {
      console.error("Error al actualizar estudiante:", error.message);
      alert("No se pudo actualizar el estudiante.");
    }
  };

  return (
    <div className="editar-estudiante-container">
      <h2 className="editar-estudiante-titulo">✏️ Editar Estudiante</h2>

      <form onSubmit={handleSubmit} className="editar-estudiante-form">
        <label className="form-label">
          Nombre
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="input-form"
            required
          />
        </label>

        <label className="form-label">
          Segundo Nombre
          <input
            type="text"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            className="input-form"
          />
        </label>

        <label className="form-label">
          Apellido Paterno
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="input-form"
            required
          />
        </label>

        <label className="form-label">
          Apellido Materno
          <input
            type="text"
            name="second_last_name"
            value={formData.second_last_name}
            onChange={handleChange}
            className="input-form"
          />
        </label>

        <label className="form-label">
          Correo Electrónico
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-form"
            required
          />
        </label>

        <label className="form-label">
          Fecha de Nacimiento
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="input-form"
            required
          />
        </label>

        <label className="form-label">
          Grado
          <select
            name="grado_id"
            value={gradoSeleccionado}
            onChange={handleGradoChange}
            className="input-form"
            required
          >
            <option value="">Selecciona un Grado</option>
            {grados.map((grado) => (
              <option key={grado.id} value={grado.id}>
                {grado.numero} - {grado.categoria}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Curso
          <select
            name="course_id"
            value={formData.course_id}
            onChange={handleChange}
            className="input-form"
          >
            <option value="">Selecciona un Curso</option>
            {cursosFiltrados.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.name} - {curso.code}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Género
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-form"
            required
          >
            <option value="">Selecciona Género</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </label>

        <label className="form-label">
          Barrio o Zona
          <input
            type="text"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            className="input-form"
          />
        </label>

        <label className="form-label">
          Nivel Socioeconómico
          <select
            name="socioeconomic_status"
            value={formData.socioeconomic_status}
            onChange={handleChange}
            className="input-form"
          >
            <option value="">Selecciona Nivel</option>
            <option value="BAJO">Bajo</option>
            <option value="MEDIO_BAJO">Medio Bajo</option>
            <option value="MEDIO">Medio</option>
            <option value="MEDIO_ALTO">Medio Alto</option>
            <option value="ALTO">Alto</option>
          </select>
        </label>

        <div className="botones-acciones">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-cancelar"
          >
            ← Volver
          </button>
          <button type="submit" className="btn-guardar">
            ✅ Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarEstudiante;
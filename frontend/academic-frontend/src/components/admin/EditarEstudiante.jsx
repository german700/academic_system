//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\EditarEstudiante.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  obtenerEstudiantePorId, 
  actualizarEstudiante,
  obtenerCursos,
  obtenerPerfilDetalladoEstudiante 
} from "../services/estudiantesService";
import { obtenerGrados } from "../services/gradosService";

const EditarEstudiante = () => {
  const { id } = useParams(); // ID del estudiante desde la URL
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
    ? cursos.filter(c => c.grado && c.grado.id.toString() === gradoSeleccionado)
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
      navigate(-1); // 👈 Regresa a la vista anterior
    } catch (error) {
      console.error("Error al actualizar estudiante:", error.message);
      alert("No se pudo actualizar el estudiante.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">✏️ Editar Estudiante</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow">
        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Nombre" className="border p-2 rounded" required />
        <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} placeholder="Segundo Nombre" className="border p-2 rounded" />
        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Apellido Paterno" className="border p-2 rounded" required />
        <input type="text" name="second_last_name" value={formData.second_last_name} onChange={handleChange} placeholder="Apellido Materno" className="border p-2 rounded" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Correo Electrónico" className="border p-2 rounded" required />
        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="border p-2 rounded" required />

        <select name="grado_id" value={gradoSeleccionado} onChange={handleGradoChange} className="border p-2 rounded" required>
          <option value="">Selecciona un Grado</option>
          {grados.map((grado) => (
            <option key={grado.id} value={grado.id}>
              {grado.numero} - {grado.categoria}
            </option>
          ))}
        </select>

        <select name="course_id" value={formData.course_id} onChange={handleChange} className="border p-2 rounded">
          <option value="">Selecciona un Curso</option>
          {cursosFiltrados.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.name} - {curso.code}
            </option>
          ))}
        </select>

        <select name="gender" value={formData.gender} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Selecciona Género</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
          <option value="O">Otro</option>
        </select>

        <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder="Barrio o Zona" className="border p-2 rounded" />

        <select name="socioeconomic_status" value={formData.socioeconomic_status} onChange={handleChange} className="border p-2 rounded">
          <option value="">Nivel Socioeconómico</option>
          <option value="BAJO">Bajo</option>
          <option value="MEDIO_BAJO">Medio Bajo</option>
          <option value="MEDIO">Medio</option>
          <option value="MEDIO_ALTO">Medio Alto</option>
          <option value="ALTO">Alto</option>
        </select>

        <div className="md:col-span-2 flex justify-between mt-4">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            ← Volver
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            ✅ Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarEstudiante;
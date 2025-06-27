//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\EstudiantesGestion.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // 👈 Importar Link de React Router
import { 
  obtenerEstudiantes, 
  crearEstudiante, 
  actualizarEstudiante, 
  eliminarEstudiante 
} from "../services/estudiantesService";
import { obtenerCursos } from "../services/estudiantesService";
import { obtenerGrados } from "../services/gradosService";
import StudentSearch from "./StudentSearch"; // 👈 Importa el componente

const EstudiantesGestion = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
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
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // 👈 Estado para mostrar/ocultar formulario

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
      if (editando) {
        await actualizarEstudiante(editando, formData);
      } else {
        await crearEstudiante(formData);
      }

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
      setEditando(null);
      setMostrarFormulario(false); // 👈 Ocultar formulario después de enviar
      cargarEstudiantes();
    } catch (error) {
      console.error("Error al guardar estudiante:", error);
    }
  };

  const manejarEdicion = (estudiante) => {
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
    setEditando(estudiante.id);
    setMostrarFormulario(true); // 👈 Mostrar formulario al editar
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

  const cancelarEdicion = () => {
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
    setEditando(null);
    setMostrarFormulario(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Estudiantes</h1>
      
      {/* 👈 Sección de búsqueda avanzada */}
      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">🔍 Búsqueda Avanzada de Estudiantes</h2>
        <StudentSearch />
      </div>

      {/* 👈 Botón para mostrar/ocultar formulario de nuevo estudiante */}
      <div className="mb-4">
        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          {mostrarFormulario ? "Cancelar" : "➕ Agregar Nuevo Estudiante"}
        </button>
      </div>

      {/* 👈 Formulario de creación/edición (condicional) */}
      {mostrarFormulario && (
        <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {editando ? "✏️ Editar Estudiante" : "➕ Agregar Nuevo Estudiante"}
          </h3>
          
          <form onSubmit={manejarEnvio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              name="first_name" 
              placeholder="Nombre" 
              value={formData.first_name} 
              onChange={manejarCambio} 
              className="border p-2 rounded"
              required
            />
            <input 
              type="text" 
              name="middle_name" 
              placeholder="Segundo Nombre" 
              value={formData.middle_name} 
              onChange={manejarCambio} 
              className="border p-2 rounded"
            />
            <input 
              type="text" 
              name="last_name" 
              placeholder="Apellido Paterno" 
              value={formData.last_name} 
              onChange={manejarCambio} 
              className="border p-2 rounded"
              required
            />
            <input 
              type="text" 
              name="second_last_name" 
              placeholder="Apellido Materno" 
              value={formData.second_last_name} 
              onChange={manejarCambio} 
              className="border p-2 rounded"
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Correo Electrónico" 
              value={formData.email} 
              onChange={manejarCambio} 
              className="border p-2 rounded"
              required
            />
            <input 
              type="date" 
              name="date_of_birth" 
              value={formData.date_of_birth} 
              onChange={manejarCambio} 
              className="border p-2 rounded"
              required
            />
            
            <select 
              name="grado_id" 
              value={gradoSeleccionado} 
              onChange={manejarCambioGrado} 
              className="border p-2 rounded"
              required
            >
              <option value="">Selecciona un Grado</option>
              {grados.map((grado) => (
                <option key={grado.id} value={grado.id}>
                  {grado.numero} - {grado.categoria}
                </option>
              ))}
            </select>
            
            <select 
              name="course_id" 
              value={formData.course_id} 
              onChange={manejarCambio} 
              className="border p-2 rounded"
            >
              <option value="">Selecciona un Curso</option>
              {cursosFiltrados.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.name} - {curso.code}
                </option>
              ))}
            </select>

            <select 
              name="gender" 
              value={formData.gender} 
              onChange={manejarCambio} 
              className="border p-2 rounded"
              required
            >
              <option value="">Selecciona Género</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>

            <input 
              type="text" 
              name="neighborhood" 
              placeholder="Barrio o Zona" 
              value={formData.neighborhood} 
              onChange={manejarCambio} 
              className="border p-2 rounded"
            />

            <select 
              name="socioeconomic_status" 
              value={formData.socioeconomic_status} 
              onChange={manejarCambio} 
              className="border p-2 rounded"
            >
              <option value="">Nivel Socioeconómico</option>
              <option value="BAJO">Bajo</option>
              <option value="MEDIO_BAJO">Medio Bajo</option>
              <option value="MEDIO">Medio</option>
              <option value="MEDIO_ALTO">Medio Alto</option>
              <option value="ALTO">Alto</option>
            </select>

            <div className="md:col-span-2 flex gap-2">
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {editando ? "✅ Actualizar" : "➕ Agregar"}
              </button>
              
              {editando && (
                <button 
                  type="button"
                  onClick={cancelarEdicion}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  ❌ Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* 👈 Tabla de estudiantes */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <h3 className="text-lg font-semibold p-4 bg-gray-100 border-b">
          📋 Lista de Estudiantes ({estudiantes.length})
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-3 text-left font-medium text-gray-700">Nombre Completo</th>
                <th className="border px-4 py-3 text-left font-medium text-gray-700">Correo</th>
                <th className="border px-4 py-3 text-left font-medium text-gray-700">Grado</th>
                <th className="border px-4 py-3 text-left font-medium text-gray-700">Curso</th>
                <th className="border px-4 py-3 text-left font-medium text-gray-700">Género</th>
                <th className="border px-4 py-3 text-center font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border px-4 py-8 text-center text-gray-500">
                    No hay estudiantes registrados
                  </td>
                </tr>
              ) : (
                estudiantes.map((estudiante) => (
                  <tr key={estudiante.id} className="hover:bg-gray-50">
                    {/* 👈 Celda del nombre convertida en link */}
                    <td className="border px-4 py-3">
                      <Link 
                        to={`/students/${estudiante.id}`} 
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {`${estudiante.first_name} ${estudiante.middle_name || ''} ${estudiante.last_name} ${estudiante.second_last_name || ''}`.trim()}
                      </Link>
                    </td>
                    <td className="border px-4 py-3">{estudiante.email}</td>
                    <td className="border px-4 py-3">
                      {estudiante.grado ? `${estudiante.grado.numero} - ${estudiante.grado.categoria}` : "Sin grado"}
                    </td>
                    <td className="border px-4 py-3">
                      {estudiante.course ? `${estudiante.course.name} - ${estudiante.course.code}` : "Sin curso"}
                    </td>
                    <td className="border px-4 py-3">
                      {estudiante.gender === 'M' ? 'Masculino' : estudiante.gender === 'F' ? 'Femenino' : estudiante.gender === 'O' ? 'Otro' : '-'}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => manejarEdicion(estudiante)} 
                          className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
                          title="Editar estudiante"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => manejarEliminacion(estudiante.id)} 
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          title="Eliminar estudiante"
                        >
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
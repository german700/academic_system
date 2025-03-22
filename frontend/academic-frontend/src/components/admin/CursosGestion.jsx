import React, { useEffect, useState } from "react";
import { obtenerCursos, crearCurso, eliminarCurso } from "../services/cursosService";
import { obtenerGrados } from "../services/gradosService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CursosGestion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    grado_id: "",
  });

  useEffect(() => {
    cargarGrados();
    cargarCursos();
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

  // Cargar la lista de cursos desde el servicio
  const cargarCursos = async () => {
    try {
      const data = await obtenerCursos();
      setCursos(data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    }
  };

  // Manejar cambios en los campos del formulario
  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar cambios en la selección del grado
  const manejarCambioGrado = (e) => {
    setGradoSeleccionado(e.target.value);
    setFormData({ ...formData, grado_id: e.target.value });
  };

  // Manejar el envío del formulario para crear un nuevo curso
  const manejarEnvio = async (e) => {
    e.preventDefault();
    try {
      if (!formData.grado_id) {
        alert("Debes seleccionar un grado.");
        return;
      }

      await crearCurso(formData);
      setFormData({ name: "", description: "", grado_id: "" });
      setMostrarFormulario(false);
      cargarCursos();
    } catch (error) {
      console.error("Error al crear curso:", error);
    }
  };

  // Manejar la eliminación de un curso
  const manejarEliminacion = async (id) => {
    try {
      await eliminarCurso(id);
      cargarCursos();
    } catch (error) {
      console.error("Error al eliminar curso:", error);
    }
  };

  // Restringir acceso si el usuario no es superusuario
  if (!user?.isSuperUser) {
    return <div className="p-6 text-red-500">Acceso restringido. Solo los administradores pueden gestionar cursos.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Cursos</h1>
      <button onClick={() => navigate(-1)} className="p-2 bg-gray-500 text-white mb-4">Volver</button>

      {/* Botón para mostrar el formulario de agregar curso */}
      <button 
        onClick={() => setMostrarFormulario(true)} 
        className="p-2 bg-blue-500 text-white mb-4">
        + Agregar Curso
      </button>

      {/* Modal para agregar un nuevo curso */}
      {mostrarFormulario && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Agregar Nuevo Curso</h2>
            <form onSubmit={manejarEnvio}>
              <select 
                name="grado_id" 
                onChange={manejarCambio} 
                className="border p-2 w-full mb-2"
              >
                <option value="">Selecciona un grado</option>
                {grados.map(grado => (
                  <option key={grado.id} value={grado.id}>
                    {grado.numero} - {grado.categoria}
                  </option>
                ))}
              </select>

              <input 
                type="text" 
                name="name" 
                placeholder="Nombre del curso" 
                value={formData.name} 
                onChange={manejarCambio} 
                className="border p-2 w-full mb-2"
              />

              <input 
                type="text" 
                name="description" 
                placeholder="Descripción" 
                value={formData.description} 
                onChange={manejarCambio} 
                className="border p-2 w-full mb-2"
              />

              <div className="flex justify-between">
                <button type="submit" className="p-2 bg-green-500 text-white">Guardar</button>
                <button 
                  type="button" 
                  className="p-2 bg-red-500 text-white" 
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selector para filtrar cursos por grado */}
      <select onChange={manejarCambioGrado} className="border p-2 mb-4">
        <option value="">Selecciona un grado</option>
        {grados.map((grado) => (
          <option key={grado.id} value={grado.id}>{grado.numero} - {grado.categoria}</option>
        ))}
      </select>

      {/* Tabla de cursos filtrados por grado */}
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Descripción</th>
            <th className="border px-4 py-2">Materias</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursos.filter(curso => !gradoSeleccionado || curso.grado?.id == gradoSeleccionado).map((curso) => (
            <tr key={curso.id}>
              <td className="border px-4 py-2">{curso.name || "Sin nombre"}</td>
              <td className="border px-4 py-2">{curso.description || "Sin descripción"}</td>
              <td className="border px-4 py-2">
                {curso.course_subjects?.length
                  ? curso.course_subjects.map(m => m.subject.name).join(", ")
                  : "Sin materias"}
              </td>
              <td className="border px-4 py-2">
                <button onClick={() => navigate(`/admin/cursos/${curso.id}`)} className="p-2 bg-green-500 text-white mr-2">Ver Detalles</button>
                <button onClick={() => manejarEliminacion(curso.id)} className="p-2 bg-red-500 text-white">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CursosGestion;
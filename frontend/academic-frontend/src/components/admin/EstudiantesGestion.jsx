import React, { useEffect, useState } from "react";
import { 
  obtenerEstudiantes, 
  crearEstudiante, 
  actualizarEstudiante, 
  eliminarEstudiante 
} from "../services/estudiantesService";
import { obtenerCursos } from "../services/estudiantesService";
import { obtenerGrados } from "../services/gradosService";

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
  });
  const [editando, setEditando] = useState(null);

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
      });
      setGradoSeleccionado("");
      setEditando(null);
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
    });
    setGradoSeleccionado(estudiante.grado?.id?.toString() || "");
    setEditando(estudiante.id);
  };

  const manejarEliminacion = async (id) => {
    try {
      await eliminarEstudiante(id);
      cargarEstudiantes();
    } catch (error) {
      console.error("Error al eliminar estudiante:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Estudiantes</h1>
      
      <form onSubmit={manejarEnvio} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="first_name" placeholder="Nombre" value={formData.first_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="middle_name" placeholder="Segundo Nombre" value={formData.middle_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="last_name" placeholder="Apellido Paterno" value={formData.last_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="second_last_name" placeholder="Apellido Materno" value={formData.second_last_name} onChange={manejarCambio} className="border p-2"/>
        <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={manejarCambio} className="border p-2"/>
        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={manejarCambio} className="border p-2"/>
        
        <select name="grado_id" value={gradoSeleccionado} onChange={manejarCambioGrado} className="border p-2">
          <option value="">Selecciona un Grado</option>
          {grados.map((grado) => (
            <option key={grado.id} value={grado.id}>
              {grado.numero} - {grado.categoria}
            </option>
          ))}
        </select>
        
        <select name="course_id" value={formData.course_id} onChange={manejarCambio} className="border p-2">
          <option value="">Selecciona un Curso</option>
          {cursosFiltrados.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.name} - {curso.code}
            </option>
          ))}
        </select>

        <button type="submit" className="p-2 bg-blue-500 text-white">
          {editando ? "Actualizar" : "Agregar"}
        </button>
      </form>

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Correo</th>
            <th className="border px-4 py-2">Grado</th>
            <th className="border px-4 py-2">Curso</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((estudiante) => (
            <tr key={estudiante.id}>
              <td className="border px-4 py-2">{`${estudiante.first_name} ${estudiante.last_name}`}</td>
              <td className="border px-4 py-2">{estudiante.email}</td>
              <td className="border px-4 py-2">{estudiante.grado ? `${estudiante.grado.numero} - ${estudiante.grado.categoria}` : "Sin grado"}</td>
              <td className="border px-4 py-2">
                {estudiante.course ? `${estudiante.course.name} - ${estudiante.course.code}` : "Sin curso"}
              </td>
              <td className="border px-4 py-2">
                <button onClick={() => manejarEdicion(estudiante)} className="p-2 bg-yellow-500 text-white mr-2">Editar</button>
                <button onClick={() => manejarEliminacion(estudiante.id)} className="p-2 bg-red-500 text-white">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EstudiantesGestion;

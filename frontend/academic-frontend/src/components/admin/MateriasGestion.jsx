import React, { useEffect, useState } from "react";
import { obtenerGrados } from "../services/gradosService";
import {
  obtenerMateriasPorGrado,
  crearMateriaEnGrado,
  eliminarMateriaDeGrado
} from "../services/materiasService";
import { useNavigate } from "react-router-dom";

const MateriasGestion = () => {
  const navigate = useNavigate();
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [materias, setMaterias] = useState([]);
  const [nuevaMateria, setNuevaMateria] = useState({ name: "" });

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

  // Cargar las materias correspondientes al grado seleccionado
  const cargarMaterias = async (gradoId) => {
    try {
      const data = await obtenerMateriasPorGrado(gradoId);
      setMaterias(data);
    } catch (error) {
      console.error("Error al cargar materias del grado:", error);
    }
  };

  // Manejar el cambio en la selección del grado
  const manejarCambioGrado = (e) => {
    const gradoId = e.target.value;
    setGradoSeleccionado(gradoId);
    if (gradoId) cargarMaterias(gradoId);
  };

  // Manejar cambios en el campo de entrada para nueva materia
  const manejarCambioMateria = (e) => {
    setNuevaMateria({ ...nuevaMateria, [e.target.name]: e.target.value });
  };

  // Crear una nueva materia y asignarla al grado seleccionado
  const manejarEnvio = async (e) => {
    e.preventDefault();

    console.log("Datos enviados al backend:", formData); // Para depuración

    try {
      const estudianteData = {
        ...formData,
        grado_id: formData.grado_id || null, // Asegurar que el grado_id se envíe correctamente
        course_id: formData.course_id || null, // Asegurar que course_id no sea undefined
      };

      if (editando) {
        await actualizarEstudiante(editando, estudianteData);
      } else {
        await crearEstudiante(estudianteData);
      }

      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        second_last_name: "",
        date_of_birth: "",
        email: "",
        grade_level: "",
        grado_id: "", // Limpiar después de enviar
        course_id: "",
      });
      setGradoSeleccionado("");
      setEditando(null);
      cargarEstudiantes();
    } catch (error) {
      console.error("Error al guardar estudiante:", error);
    }
  };

  // Eliminar una materia del grado seleccionado
  const manejarEliminacionMateria = async (materiaId) => {
    try {
      await eliminarMateriaDeGrado(gradoSeleccionado, materiaId);
      cargarMaterias(gradoSeleccionado);
    } catch (error) {
      console.error("Error al eliminar materia:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Materias</h1>
      <button onClick={() => navigate(-1)} className="p-2 bg-gray-500 text-white mb-4">
        Volver
      </button>

      {/* Selección de grado */}
      <select onChange={manejarCambioGrado} className="border p-2 mb-4 w-full">
        <option value="">Selecciona un grado</option>
        {grados.map((grado) => (
          <option key={grado.id} value={grado.id}>
            {grado.numero} - {grado.categoria}
          </option>
        ))}
      </select>

      {/* Formulario para agregar nuevas materias */}
      <form onSubmit={manejarEnvioMateria} className="mb-4 flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="Nombre de la materia"
          value={nuevaMateria.name}
          onChange={manejarCambioMateria}
          className="border p-2 flex-grow"
          required
        />
        <button type="submit" className="p-2 bg-blue-500 text-white">
          + Agregar Materia
        </button>
      </form>

      {/* Tabla que muestra las materias del grado seleccionado */}
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {materias.length > 0 ? (
            materias.map((materia) => (
              <tr key={materia.id}>
                <td className="border px-4 py-2">{materia.name}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => manejarEliminacionMateria(materia.id)}
                    className="p-2 bg-red-500 text-white"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center p-4">
                No hay materias registradas para este grado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MateriasGestion;
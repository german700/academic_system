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

  // Inicializa y recupera la lista de grados disponibles
  const cargarGrados = async () => {
    try {
      const data = await obtenerGrados();
      setGrados(data);
    } catch (error) {
      console.error("Error al cargar grados:", error);
    }
  };

  // Obtiene las materias asociadas al grado seleccionado
  const cargarMaterias = async (gradoId) => {
    try {
      if (!gradoId) {
        setMaterias([]);
        return;
      }
      const data = await obtenerMateriasPorGrado(gradoId);
      setMaterias(data);
    } catch (error) {
      console.error("Error al cargar materias:", error);
    }
  };

  // Actualiza el grado seleccionado y obtiene sus materias
  const manejarCambioGrado = (e) => {
    const gradoId = e.target.value;
    setGradoSeleccionado(gradoId);
    cargarMaterias(gradoId);
  };

  // Actualiza el estado del formulario para nueva materia
  const manejarCambioMateria = (e) => {
    setNuevaMateria({ ...nuevaMateria, [e.target.name]: e.target.value });
  };

  // Procesa el envío del formulario para crear materia
  const manejarEnvioMateria = async (e) => {
    e.preventDefault();
    
    if (!gradoSeleccionado) {
      alert("Por favor, selecciona un grado antes de agregar una materia.");
      return;
    }

    try {
      await crearMateriaEnGrado(gradoSeleccionado, nuevaMateria);
      setNuevaMateria({ name: "" }); // Reinicia el formulario
      cargarMaterias(gradoSeleccionado); // Actualiza la lista de materias
    } catch (error) {
      console.error("Error al agregar materia:", error);
    }
  };

  // Elimina una materia y actualiza la lista
  const manejarEliminacionMateria = async (materiaId) => {
    try {
      await eliminarMateriaDeGrado(gradoSeleccionado, materiaId);
      cargarMaterias(gradoSeleccionado); // Actualiza la lista después de eliminar
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

      {/* Selector de grado académico */}
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

      {/* Tabla de materias existentes */}
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
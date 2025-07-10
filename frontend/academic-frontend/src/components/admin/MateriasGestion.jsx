//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\MateriasGestion.jsx
import React, { useEffect, useState } from "react";
import { obtenerGrados } from "../services/gradosService";
import {
  obtenerMateriasPorGrado,
  crearMateriaEnGrado,
  eliminarMateriaDeGrado
} from "../services/materiasService";
import { useNavigate } from "react-router-dom";
import "./admin_css/MateriasGestion.css";

const MateriasGestion = () => {
  const navigate = useNavigate();
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [materias, setMaterias] = useState([]);
  const [nuevaMateria, setNuevaMateria] = useState({ name: "" });

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

  const manejarCambioGrado = (e) => {
    const gradoId = e.target.value;
    setGradoSeleccionado(gradoId);
    cargarMaterias(gradoId);
  };

  const manejarCambioMateria = (e) => {
    setNuevaMateria({ ...nuevaMateria, [e.target.name]: e.target.value });
  };

  const manejarEnvioMateria = async (e) => {
    e.preventDefault();

    if (!gradoSeleccionado) {
      alert("Por favor, selecciona un grado antes de agregar una materia.");
      return;
    }

    try {
      await crearMateriaEnGrado(gradoSeleccionado, nuevaMateria);
      setNuevaMateria({ name: "" });
      cargarMaterias(gradoSeleccionado);
    } catch (error) {
      console.error("Error al agregar materia:", error);
    }
  };

  const manejarEliminacionMateria = async (materiaId) => {
    try {
      await eliminarMateriaDeGrado(gradoSeleccionado, materiaId);
      cargarMaterias(gradoSeleccionado);
    } catch (error) {
      console.error("Error al eliminar materia:", error);
    }
  };

  return (
    <div className="materias-container">
      <h1 className="titulo-principal">Gestión de Materias</h1>

      <button onClick={() => navigate(-1)} className="boton-volver">
        Volver
      </button>

      <select onChange={manejarCambioGrado} className="select-grado">
        <option value="">Selecciona un grado</option>
        {grados.map((grado) => (
          <option key={grado.id} value={grado.id}>
            {grado.numero} - {grado.categoria}
          </option>
        ))}
      </select>

      <form onSubmit={manejarEnvioMateria} className="formulario-materia">
        <input
          type="text"
          name="name"
          placeholder="Nombre de la materia"
          value={nuevaMateria.name}
          onChange={manejarCambioMateria}
          className="input-materia"
          required
        />
        <button type="submit" className="boton-agregar">
          + Agregar Materia
        </button>
      </form>

      <table className="tabla-materias">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {materias.length > 0 ? (
            materias.map((materia) => (
              <tr key={materia.id}>
                <td>{materia.name}</td>
                <td>
                  <button
                    onClick={() => manejarEliminacionMateria(materia.id)}
                    className="boton-eliminar"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="sin-materias">
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

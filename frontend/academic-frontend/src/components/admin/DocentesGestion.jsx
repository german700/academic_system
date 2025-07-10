import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  obtenerDocentes,
  crearDocente,
  actualizarDocente,
  eliminarDocente,
  buscarDocentes,
  obtenerGrados
} from "../services/docentesService";
import "./admin_css/DocentesGestion.css";

const DocentesGestion = () => {
  const [docentes, setDocentes] = useState([]);
  const [docentesFiltrados, setDocentesFiltrados] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    second_last_name: "",
    title: "",
    date_of_birth: "",
    email: "",
    specialization: "",
  });
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Estados para búsqueda
  const [query, setQuery] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [grados, setGrados] = useState([]);

  useEffect(() => {
    cargarDocentes();
    cargarGrados();
  }, []);

  // Cargar la lista de docentes desde el servicio
  const cargarDocentes = async () => {
    try {
      const data = await obtenerDocentes();
      setDocentes(data);
      setDocentesFiltrados(data); // Inicialmente mostrar todos
    } catch (error) {
      console.error(error);
    }
  };

  // Cargar grados para el filtro
  const cargarGrados = async () => {
    try {
      const data = await obtenerGrados();
      setGrados(data);
    } catch (error) {
      console.error("Error al cargar grados:", error);
    }
  };

  // Manejar búsqueda
  const manejarBusqueda = async () => {
    try {
      if (!query && !gradoSeleccionado) {
        // Si no hay filtros, mostrar todos los docentes
        setDocentesFiltrados(docentes);
        return;
      }

      let resultados = docentes;

      // Filtrar por búsqueda de texto
      if (query) {
        const dataFromSearch = await buscarDocentes(query);
        resultados = dataFromSearch;
      }

      // Filtrar por grado
      if (gradoSeleccionado) {
        resultados = resultados.filter((docente) =>
          docente.grados?.some(
            (g) => g.id?.toString() === gradoSeleccionado
          )
        );
      }

      setDocentesFiltrados(resultados);
    } catch (error) {
      console.error("Error al buscar docentes:", error);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setQuery("");
    setGradoSeleccionado("");
    setDocentesFiltrados(docentes);
  };

  // Manejar cambios en los campos del formulario
  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario para crear o actualizar un docente
  const manejarEnvio = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await actualizarDocente(editando, formData);
      } else {
        await crearDocente(formData);
      }
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        second_last_name: "",
        title: "",
        date_of_birth: "",
        email: "",
        specialization: "",
      });
      setEditando(null);
      setMostrarFormulario(false);
      cargarDocentes();
    } catch (error) {
      console.error(error);
    }
  };

  // Manejar la edición de un docente
  const manejarEdicion = (docente) => {
    setFormData(docente);
    setEditando(docente.id);
    setMostrarFormulario(true);
  };

  // Manejar la eliminación de un docente
  const manejarEliminacion = async (id) => {
    try {
      await eliminarDocente(id);
      cargarDocentes();
    } catch (error) {
      console.error(error);
    }
  };

  // Cancelar edición/creación
  const cancelarFormulario = () => {
    setEditando(null);
    setMostrarFormulario(false);
    setFormData({
      first_name: "",
      middle_name: "",
      last_name: "",
      second_last_name: "",
      title: "",
      date_of_birth: "",
      email: "",
      specialization: "",
    });
  };

  return (
    <div className="docentes-container">
      <h1 className="titulo-principal">Gestión de Docentes</h1>

      {/* Botón para mostrar formulario */}
      {!mostrarFormulario && (
        <div className="section-card">
          <button
            onClick={() => setMostrarFormulario(true)}
            className="btn-primario"
          >
            + Agregar Nuevo Docente
          </button>
        </div>
      )}

      {/* Formulario para agregar/editar docentes */}
      {mostrarFormulario && (
        <div className="formulario-box">
          <h2 className="section-heading">
            {editando ? "Editar Docente" : "Agregar Nuevo Docente"}
          </h2>
          <form onSubmit={manejarEnvio} className="formulario-docente">
            <input 
              type="text" 
              name="first_name" 
              placeholder="Nombre" 
              value={formData.first_name} 
              onChange={manejarCambio} 
              className="input-form" 
              required
            />
            <input 
              type="text" 
              name="middle_name" 
              placeholder="Segundo Nombre" 
              value={formData.middle_name} 
              onChange={manejarCambio} 
              className="input-form" 
            />
            <input 
              type="text" 
              name="last_name" 
              placeholder="Apellido Paterno" 
              value={formData.last_name} 
              onChange={manejarCambio} 
              className="input-form" 
              required
            />
            <input 
              type="text" 
              name="second_last_name" 
              placeholder="Apellido Materno" 
              value={formData.second_last_name} 
              onChange={manejarCambio} 
              className="input-form" 
            />
            <input 
              type="text" 
              name="title" 
              placeholder="Título (Lic., Dr., etc.)" 
              value={formData.title} 
              onChange={manejarCambio} 
              className="input-form" 
            />
            <input 
              type="date" 
              name="date_of_birth" 
              value={formData.date_of_birth} 
              onChange={manejarCambio} 
              className="input-form" 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Correo Electrónico" 
              value={formData.email} 
              onChange={manejarCambio} 
              className="input-form" 
              required
            />
            <input 
              type="text" 
              name="specialization" 
              placeholder="Especialización" 
              value={formData.specialization} 
              onChange={manejarCambio} 
              className="input-form" 
            />

            <div className="docente-buttons">
              <button type="submit" className="btn-primario">
                {editando ? "Actualizar" : "Agregar"}
              </button>
              <button
                type="button"
                onClick={cancelarFormulario}
                className="btn-secundario"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sección de búsqueda */}
      <div className="section-card">
        <h2 className="section-heading">Buscar Docentes</h2>
        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, apellido o correo"
            className="search-input"
          />
          <select
            value={gradoSeleccionado}
            onChange={(e) => setGradoSeleccionado(e.target.value)}
            className="search-select"
          >
            <option value="">Todos los grados</option>
            {grados.map((grado) => (
              <option key={grado.id} value={grado.id}>
                Grado {grado.numero} ({grado.categoria})
              </option>
            ))}
          </select>
          <button
            onClick={manejarBusqueda}
            className="search-button"
          >
            Buscar
          </button>
          <button
            onClick={limpiarFiltros}
            className="clear-button"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Lista de docentes */}
      <div className="section-card">
        <div className="table-header">
          <h2 className="table-heading">
            Lista de Docentes ({docentesFiltrados.length})
          </h2>
        </div>
        <div className="table-container">
          <table className="docentes-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Nombre</th>
                <th className="table-th">Correo</th>
                <th className="table-th">Especialización</th>
                <th className="table-th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentesFiltrados.map((docente) => (
                <tr key={docente.id} className="table-row">
                  <td className="table-td">
                    <Link
                      to={`/teacher/${docente.id}`}
                      className="link-docente"
                    >
                      {`${docente.first_name} ${docente.middle_name || ""} ${docente.last_name} ${docente.second_last_name || ""}`.trim()}
                    </Link>
                  </td>
                  <td className="table-td">{docente.email}</td>
                  <td className="table-td">{docente.specialization}</td>
                  <td className="table-td">
                    <button
                      onClick={() => manejarEdicion(docente)}
                      className="edit-button"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => manejarEliminacion(docente.id)}
                      className="delete-button"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {docentesFiltrados.length === 0 && (
            <div className="empty-message">
              {query || gradoSeleccionado ? "No se encontraron docentes con los filtros aplicados." : "No hay docentes registrados."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocentesGestion;
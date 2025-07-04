// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\DocentesGestion.jsx
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
      cargarDocentes();
    } catch (error) {
      console.error(error);
    }
  };

  // Manejar la edición de un docente
  const manejarEdicion = (docente) => {
    setFormData(docente);
    setEditando(docente.id);
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Docentes</h1>

      {/* Formulario para agregar/editar docentes */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editando ? "Editar Docente" : "Agregar Nuevo Docente"}
        </h2>
        <form onSubmit={manejarEnvio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="first_name" placeholder="Nombre" value={formData.first_name} onChange={manejarCambio} className="border p-2 rounded" />
          <input type="text" name="middle_name" placeholder="Segundo Nombre" value={formData.middle_name} onChange={manejarCambio} className="border p-2 rounded" />
          <input type="text" name="last_name" placeholder="Apellido Paterno" value={formData.last_name} onChange={manejarCambio} className="border p-2 rounded" />
          <input type="text" name="second_last_name" placeholder="Apellido Materno" value={formData.second_last_name} onChange={manejarCambio} className="border p-2 rounded" />
          <input type="text" name="title" placeholder="Título (Lic., Dr., etc.)" value={formData.title} onChange={manejarCambio} className="border p-2 rounded" />
          <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={manejarCambio} className="border p-2 rounded" />
          <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={manejarCambio} className="border p-2 rounded" />
          <input type="text" name="specialization" placeholder="Especialización" value={formData.specialization} onChange={manejarCambio} className="border p-2 rounded" />

          <div className="md:col-span-2">
            <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">
              {editando ? "Actualizar" : "Agregar"}
            </button>
            {editando && (
              <button
                type="button"
                onClick={() => {
                  setEditando(null);
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
                }}
                className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sección de búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Buscar Docentes</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, apellido o correo"
            className="border p-2 flex-1 rounded"
          />
          <select
            value={gradoSeleccionado}
            onChange={(e) => setGradoSeleccionado(e.target.value)}
            className="border p-2 rounded"
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Buscar
          </button>
          <button
            onClick={limpiarFiltros}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Lista de docentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            Lista de Docentes ({docentesFiltrados.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-2 text-left">Nombre</th>
                <th className="border px-4 py-2 text-left">Correo</th>
                <th className="border px-4 py-2 text-left">Especialización</th>
                <th className="border px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentesFiltrados.map((docente) => (
                <tr key={docente.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">
                    <Link
                      to={`/teacher/${docente.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {`${docente.first_name} ${docente.middle_name || ""} ${docente.last_name} ${docente.second_last_name || ""}`.trim()}
                    </Link>

                  </td>
                  <td className="border px-4 py-2">{docente.email}</td>
                  <td className="border px-4 py-2">{docente.specialization}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => manejarEdicion(docente)}
                      className="p-2 bg-yellow-500 text-white mr-2 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => manejarEliminacion(docente.id)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {docentesFiltrados.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {query || gradoSeleccionado ? "No se encontraron docentes con los filtros aplicados." : "No hay docentes registrados."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocentesGestion;
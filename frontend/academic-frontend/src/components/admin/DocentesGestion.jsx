import React, { useEffect, useState } from "react";
import { 
  obtenerDocentes, 
  crearDocente, 
  actualizarDocente, 
  eliminarDocente 
} from "../services/docentesService";

const DocentesGestion = () => {
  const [docentes, setDocentes] = useState([]);
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

  useEffect(() => {
    cargarDocentes();
  }, []);

  // Cargar la lista de docentes desde el servicio
  const cargarDocentes = async () => {
    try {
      const data = await obtenerDocentes();
      setDocentes(data);
    } catch (error) {
      console.error(error);
    }
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
      <h1 className="text-2xl font-bold mb-4">Gestión de Docentes</h1>
      
      <form onSubmit={manejarEnvio} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="first_name" placeholder="Nombre" value={formData.first_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="middle_name" placeholder="Segundo Nombre" value={formData.middle_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="last_name" placeholder="Apellido Paterno" value={formData.last_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="second_last_name" placeholder="Apellido Materno" value={formData.second_last_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="title" placeholder="Título (Lic., Dr., etc.)" value={formData.title} onChange={manejarCambio} className="border p-2"/>
        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={manejarCambio} className="border p-2"/>
        <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="specialization" placeholder="Especialización" value={formData.specialization} onChange={manejarCambio} className="border p-2"/>

        <button type="submit" className="p-2 bg-blue-500 text-white">
          {editando ? "Actualizar" : "Agregar"}
        </button>
      </form>

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Correo</th>
            <th className="border px-4 py-2">Especialización</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((docente) => (
            <tr key={docente.id}>
              <td className="border px-4 py-2">{`${docente.first_name} ${docente.last_name}`}</td>
              <td className="border px-4 py-2">{docente.email}</td>
              <td className="border px-4 py-2">{docente.specialization}</td>
              <td className="border px-4 py-2">
                <button onClick={() => manejarEdicion(docente)} className="p-2 bg-yellow-500 text-white mr-2">Editar</button>
                <button onClick={() => manejarEliminacion(docente.id)} className="p-2 bg-red-500 text-white">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocentesGestion;
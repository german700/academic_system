import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerAdministrativos,
  crearAdministrativo,
  actualizarAdministrativo,
  eliminarAdministrativo
} from "../services/administrativosService";
import "./admin_css/AdministrativosGestion.css";

const AdministrativosGestion = () => {
  const { user } = useAuth();
  const [administrativos, setAdministrativos] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    second_last_name: "",
    title: "",
    date_of_birth: "",
    email: "",
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    if (user && user.isSuperUser) {
      cargarAdministrativos();
    }
  }, [user]);

  const cargarAdministrativos = async () => {
    try {
      const data = await obtenerAdministrativos();
      setAdministrativos(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user || !user.isSuperUser) {
    return (
      <div className="p-6 text-red-600">
        Acceso denegado. Solo el superusuario puede gestionar administrativos.
      </div>
    );
  }

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await actualizarAdministrativo(editando, formData);
      } else {
        await crearAdministrativo(formData);
      }
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        second_last_name: "",
        title: "",
        date_of_birth: "",
        email: "",
      });
      setEditando(null);
      cargarAdministrativos();
    } catch (error) {
      console.error(error);
    }
  };

  const manejarEdicion = (administrativo) => {
    setFormData(administrativo);
    setEditando(administrativo.id);
  };

  const manejarEliminacion = async (id) => {
    try {
      await eliminarAdministrativo(id);
      cargarAdministrativos();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Administrativos</h1>

      <form onSubmit={manejarEnvio} className="admin-form">
        <input type="text" name="first_name" placeholder="Nombre" value={formData.first_name} onChange={manejarCambio} className="admin-input" />
        <input type="text" name="middle_name" placeholder="Segundo Nombre" value={formData.middle_name} onChange={manejarCambio} className="admin-input" />
        <input type="text" name="last_name" placeholder="Apellido Paterno" value={formData.last_name} onChange={manejarCambio} className="admin-input" />
        <input type="text" name="second_last_name" placeholder="Apellido Materno" value={formData.second_last_name} onChange={manejarCambio} className="admin-input" />
        <input type="text" name="title" placeholder="Título (Lic., Dr., etc.)" value={formData.title} onChange={manejarCambio} className="admin-input" />
        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={manejarCambio} className="admin-input" />
        <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={manejarCambio} className="admin-input" />

        <button type="submit" className="admin-submit">
          {editando ? "Actualizar" : "Agregar"}
        </button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th className="admin-th">Nombre</th>
            <th className="admin-th">Correo</th>
            <th className="admin-th">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {administrativos.map((administrativo) => (
            <tr key={administrativo.id}>
              <td className="admin-td">{`${administrativo.first_name} ${administrativo.last_name}`}</td>
              <td className="admin-td">{administrativo.email}</td>
              <td className="admin-td">
                <button onClick={() => manejarEdicion(administrativo)} className="admin-action-btn edit-btn">Editar</button>
                <button onClick={() => manejarEliminacion(administrativo.id)} className="admin-action-btn delete-btn">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdministrativosGestion;

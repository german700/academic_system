//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\AdministrativosGestion.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";  // Importar el contexto de autenticación
import { 
  obtenerAdministrativos, 
  crearAdministrativo, 
  actualizarAdministrativo, 
  eliminarAdministrativo 
} from "../services/administrativosService";

const AdministrativosGestion = () => {
  const { user } = useAuth(); // Obtener información del usuario
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
    if (user && user.is_superuser) {
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

  if (!user || !user.is_superuser) {
    return <div className="p-6 text-red-600">Acceso denegado. Solo el superusuario puede gestionar administrativos.</div>;
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
      
      <form onSubmit={manejarEnvio} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="first_name" placeholder="Nombre" value={formData.first_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="middle_name" placeholder="Segundo Nombre" value={formData.middle_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="last_name" placeholder="Apellido Paterno" value={formData.last_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="second_last_name" placeholder="Apellido Materno" value={formData.second_last_name} onChange={manejarCambio} className="border p-2"/>
        <input type="text" name="title" placeholder="Título (Lic., Dr., etc.)" value={formData.title} onChange={manejarCambio} className="border p-2"/>
        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={manejarCambio} className="border p-2"/>
        <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={manejarCambio} className="border p-2"/>

        <button type="submit" className="p-2 bg-blue-500 text-white">
          {editando ? "Actualizar" : "Agregar"}
        </button>
      </form>

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Correo</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {administrativos.map((administrativo) => (
            <tr key={administrativo.id}>
              <td className="border px-4 py-2">{`${administrativo.first_name} ${administrativo.last_name}`}</td>
              <td className="border px-4 py-2">{administrativo.email}</td>
              <td className="border px-4 py-2">
                <button onClick={() => manejarEdicion(administrativo)} className="p-2 bg-yellow-500 text-white mr-2">Editar</button>
                <button onClick={() => manejarEliminacion(administrativo.id)} className="p-2 bg-red-500 text-white">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdministrativosGestion;

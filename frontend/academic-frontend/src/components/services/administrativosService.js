//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\services\administrativosService.js
const API_URL = "http://localhost:8000/api/academic/administrators/";

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Obtener lista de administrativos
export const obtenerAdministrativos = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Error al obtener administrativos");
  return await response.json();
};

// Crear un nuevo administrativo
export const crearAdministrativo = async (administrativoData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(administrativoData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al crear administrativo: ${errorData.detail || "Error desconocido"}`);
  }
  return await response.json();
};

// Actualizar un administrativo existente
export const actualizarAdministrativo = async (id, administrativoData) => {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(administrativoData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al actualizar administrativo: ${errorData.detail || "Error desconocido"}`);
  }
  return await response.json();
};

// Eliminar un administrativo
export const eliminarAdministrativo = async (id) => {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al eliminar administrativo: ${errorData.detail || "Error desconocido"}`);
  }
};

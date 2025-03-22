//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\services\gradosService.js
const API_URL = "http://localhost:8000/api/academic/grados/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Función para obtener la lista de grados disponibles
export const obtenerGrados = async () => {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Error al obtener Grados");
  return await response.json();
};
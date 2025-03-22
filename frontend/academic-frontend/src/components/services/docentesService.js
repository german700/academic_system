//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\services\docentesService.js
const API_URL = "http://localhost:8000/api/academic/teachers/";

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
 const token = localStorage.getItem("token");
 return {
   "Content-Type": "application/json",
   Authorization: `Bearer ${token}`,
 };
};

// Obtener lista de docentes
export const obtenerDocentes = async () => {
 const response = await fetch(API_URL, {
   method: "GET",
   headers: getAuthHeaders(),
 });

 if (!response.ok) throw new Error("Error al obtener docentes");
 return await response.json();
};

// Crear un nuevo docente
export const crearDocente = async (docenteData) => {
 const response = await fetch(API_URL, {
   method: "POST",
   headers: getAuthHeaders(),
   body: JSON.stringify(docenteData),
 });

 if (!response.ok) {
   const errorData = await response.json();
   throw new Error(`Error al crear docente: ${errorData.detail || "Error desconocido"}`);
 }
 return await response.json();
};

// Actualizar un docente existente
export const actualizarDocente = async (id, docenteData) => {
 const response = await fetch(`${API_URL}${id}/`, {
   method: "PUT",
   headers: getAuthHeaders(),
   body: JSON.stringify(docenteData),
 });

 if (!response.ok) {
   const errorData = await response.json();
   throw new Error(`Error al actualizar docente: ${errorData.detail || "Error desconocido"}`);
 }
 return await response.json();
};

// Eliminar un docente
export const eliminarDocente = async (id) => {
 const response = await fetch(`${API_URL}${id}/`, {
   method: "DELETE",
   headers: getAuthHeaders(),
 });

 if (!response.ok) {
   const errorData = await response.json();
   throw new Error(`Error al eliminar docente: ${errorData.detail || "Error desconocido"}`);
 }
};
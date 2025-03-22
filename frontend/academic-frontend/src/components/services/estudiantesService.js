// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\services\estudiantesService.js

const API_URL = "http://localhost:8000/api/academic/students/";
const API_COURSES_URL = "http://localhost:8000/api/academic/courses/";

// Función para obtener los encabezados de autenticación
const getAuthHeaders = () => {
 const token = localStorage.getItem("token");
 return {
   "Content-Type": "application/json",
   Authorization: `Bearer ${token}`,
 };
};

// Obtener la lista de estudiantes
export const obtenerEstudiantes = async () => {
 const response = await fetch(API_URL, {
   method: "GET",
   headers: getAuthHeaders(),
 });
 if (!response.ok) throw new Error("Error al obtener estudiantes");
 return await response.json();
};

// Obtener la lista de cursos para asignación de estudiantes
export const obtenerCursos = async () => {
 const response = await fetch(API_COURSES_URL, {
   method: "GET",
   headers: getAuthHeaders(),
 });
 if (!response.ok) throw new Error("Error al obtener cursos");
 return await response.json();
};

// Crear un nuevo estudiante
export const crearEstudiante = async (estudianteData) => {
 const response = await fetch(API_URL, {
   method: "POST",
   headers: getAuthHeaders(),
   body: JSON.stringify(estudianteData),
 });
 if (!response.ok) throw new Error("Error al crear estudiante");
 return await response.json();
};

// Actualizar un estudiante existente
export const actualizarEstudiante = async (id, estudianteData) => {
 const response = await fetch(`${API_URL}${id}/`, {
   method: "PUT",
   headers: getAuthHeaders(),
   body: JSON.stringify(estudianteData),
 });
 if (!response.ok) {
   const errorData = await response.json();
   throw new Error(`Error al actualizar estudiante: ${errorData.detail || "Error desconocido"}`);
 }
 return await response.json();
};

// Eliminar un estudiante
export const eliminarEstudiante = async (id) => {
 const response = await fetch(`${API_URL}${id}/`, {
   method: "DELETE",
   headers: getAuthHeaders(),
 });
 if (!response.ok) {
   const errorData = await response.json();
   throw new Error(`Error al eliminar estudiante: ${errorData.detail || "Error desconocido"}`);
 }
};

// Recuperar información de perfil del estudiante por ID
export const obtenerPerfilEstudiante = async (id) => {
 const response = await fetch(`${API_URL}${id}/profile/`, {
   method: "GET",
   headers: getAuthHeaders(),
 });
 if (!response.ok) throw new Error("Error al obtener el perfil del estudiante");
 return await response.json();
};

// Obtener información de una materia específica del estudiante
export const obtenerMateriaEstudiante = async (studentId, materiaId) => {
 const response = await fetch(`http://localhost:8000/api/academic/students/${studentId}/materia/${materiaId}/`, {
   method: "GET",
   headers: getAuthHeaders(),
 });
 if (!response.ok) throw new Error("Error al obtener la materia del estudiante");
 return await response.json();
};
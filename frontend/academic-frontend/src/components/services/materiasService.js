const API_URL = `http://localhost:8000/api/academic/subjects/`;
const GRADE_API_URL = `http://localhost:8000/api/academic/grados/`;

// Función para obtener token de autorización
const getAuthHeaders = () => {
 const token = localStorage.getItem("token");
 return {
   "Content-Type": "application/json",
   Authorization: `Bearer ${token}`,
 };
};

// Recuperar todas las materias asociadas a un curso específico
export const obtenerMateriasPorCurso = async (cursoId) => {
 const response = await fetch(`${API_URL}?course=${cursoId}`, {
   headers: getAuthHeaders(),
 });
 if (!response.ok) throw new Error("Error al obtener materias del curso");
 return await response.json();
};

// Recuperar todas las materias pertenecientes a un grado específico
export const obtenerMateriasPorGrado = async (gradoId) => {
 const response = await fetch(`${GRADE_API_URL}${gradoId}/materias/`, {
   headers: getAuthHeaders(),
 });
 if (!response.ok) throw new Error("Error al obtener materias del grado");
 return await response.json();
};

// Vincular un docente con una materia en un curso determinado
export const asignarDocenteAMateria = async (courseSubjectId, docenteId) => {
 const response = await fetch(`http://localhost:8000/api/academic/course-subjects/${courseSubjectId}/`, {
   method: "PUT",
   headers: getAuthHeaders(),
   body: JSON.stringify({ teacher_id: docenteId }),
 });
 if (!response.ok) throw new Error("Error al asignar docente a la materia");
 return await response.json();
};


// Crear una materia dentro de un grado y asignarla a todos los cursos del grado
export const crearMateriaEnGrado = async (gradoId, materiaData) => {
 const response = await fetch(`${GRADE_API_URL}${gradoId}/materias/`, {
   method: "POST",
   headers: getAuthHeaders(),
   body: JSON.stringify(materiaData),
 });
 if (!response.ok) throw new Error("Error al crear la materia en el grado");
 return await response.json();
};

// Eliminar una materia de un grado y de todos sus cursos asociados
export const eliminarMateriaDeGrado = async (gradoId, materiaId) => {
 const response = await fetch(`${GRADE_API_URL}${gradoId}/materias/${materiaId}/`, {
   method: "DELETE",
   headers: getAuthHeaders(),
 });
 if (!response.ok) throw new Error("Error al eliminar la materia del grado");
};
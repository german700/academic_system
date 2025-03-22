const API_URL = `http://localhost:8000/api/academic/courses/`;
const COURSE_SUBJECT_API_URL = `http://localhost:8000/api/academic/course-subjects/`;

// Función para obtener token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Obtener todos los cursos
export const obtenerCursos = async () => {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  const data = await response.json();
  console.log("Datos recibidos en el frontend:", data);  // Debug
  return data;
};

// 🔹 Obtener un curso por ID (nuevo)
export const obtenerCurso = async (id) => {
  const response = await fetch(`${API_URL}${id}/`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`Error al obtener el curso con ID ${id}`);
  return await response.json();
};

export const obtenerEstudiantesPorCurso = async (cursoId) => {
  const response = await fetch(`${API_URL}${cursoId}/students/`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Error al obtener estudiantes del curso");
  return await response.json();
};

// Crear un nuevo curso
export const crearCurso = async (cursoData) => {
  console.log("Datos enviados al backend:", cursoData);
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(cursoData),
  });
  if (!response.ok) throw new Error("Error al crear Curso");
  return await response.json();
};

// Actualizar un curso existente
export const actualizarCurso = async (id, cursoData) => {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(cursoData),
  });
  if (!response.ok) throw new Error("Error al actualizar Curso");
  return await response.json();
};

// Eliminar un curso
export const eliminarCurso = async (id) => {
  const response = await fetch(`${API_URL}${id}/`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Error al eliminar Curso");
};

// Obtener las materias de un curso específico
export const obtenerMateriasPorCurso = async (cursoId) => {
  const response = await fetch(`${COURSE_SUBJECT_API_URL}?course=${cursoId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener materias del curso");
  return await response.json();
};

export const obtenerCursosPorGrado = async (gradoId) => {
  const response = await fetch(`${API_URL}?grado=${gradoId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener cursos del grado");
  return await response.json();
};

// Asignar una materia a un curso con un docente específico
export const asignarMateriaACurso = async (cursoId, subjectId, teacherId) => {
  const response = await fetch(COURSE_SUBJECT_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ course: cursoId, subject: subjectId, teacher: teacherId }),
  });
  if (!response.ok) throw new Error("Error al asignar materia al curso");
  return await response.json();
};

// Eliminar una materia de un curso
export const eliminarMateriaDeCurso = async (courseSubjectId) => {
  const response = await fetch(`${COURSE_SUBJECT_API_URL}${courseSubjectId}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al eliminar materia del curso");
};

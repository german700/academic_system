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

// ================================
// FUNCIONES ESPECÍFICAS PARA EL DOCENTE AUTENTICADO
// ================================

const TEACHER_API = "http://localhost:8000/api/academic/teacher";

// DASHBOARD del docente (periodo actual + cursos)
export const fetchTeacherDashboard = async () => {
  const res = await fetch(`${TEACHER_API}/dashboard/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar dashboard del docente");
  return res.json();
};

// Cursos del docente
export const fetchTeacherCourses = async () => {
  const res = await fetch(`${TEACHER_API}/courses/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar cursos del docente");
  return res.json();
};

// Estudiantes de un curso
export async function fetchCourseStudents(courseId) {
  const res = await fetch(
    `${TEACHER_API}/course/${courseId}/students/`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Error al cargar estudiantes del curso");
  return res.json();  // será {id, name, grado, students, subjects}
}

// Notas de curso-materia en un periodo
export const fetchCourseSubjectGrades = async (courseId, subjectId, period) => {
  const res = await fetch(
    `${TEACHER_API}/course/${courseId}/subject/${subjectId}/grades/?period=${period}`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("Error al cargar notas del curso");
  return res.json();
};
// Edición de asignaciones
export const fetchCourseSubjectAssignments = async (courseId, subjectId) => {
  const res = await fetch(
    `${TEACHER_API}/course/${courseId}/subject/${subjectId}/assignments/`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Error al cargar actividades de la materia");
  return res.json(); // espera un array de { id, name, weight, ... }
};

// Eliminación de entrys de calificaciones
export const fetchDeleteGradeEntry = async (id) => {
  const res = await fetch(`${TEACHER_API}/grade-entries/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Error al eliminar calificación");
  return res;
};

// Análisis IA por estudiante y materia (solo periodo actual)
export const fetchStudentSubjectAnalysis = async (studentId, subjectId) => {
  const res = await fetch(
    `${TEACHER_API}/student/${studentId}/analysis/?subject_id=${subjectId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("Error al cargar análisis IA");
  return res.json();
};

// Buscar estudiantes por nombre, apellido, ID o email (solo cursos del docente)
export const searchStudents = async (query) => {
  const res = await fetch(`${TEACHER_API}/search-students/?q=${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al buscar estudiantes");
  return res.json();
};

export const fetchCourseComparison = async (courseId, subjectId) => {
  const res = await fetch(
    `${TEACHER_API}/course/${courseId}/subject/${subjectId}/comparison/`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Error al cargar comparativo IA");
  return res.json(); // ahora incluye ia_course_analysis + ia_course_chart
};

// ================================
// FUNCIONES PARA GRADE ENTRIES
// ================================

// POST a grade-entries
export const fetchCreateGradeEntry = async (data) => {
  const res = await fetch("http://localhost:8000/api/academic/grade-entries/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error creando entry");
  return res.json();
};

// PATCH a grade-entries/{id}/
export const fetchUpdateGradeEntry = async (id, data) => {
  const res = await fetch(`http://localhost:8000/api/academic/grade-entries/${id}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error actualizando entry");
  return res.json();
};

export async function fetchStudentAnalysis(studentId, subjectId) {
  const res = await fetch(
    `${BASE_URL}/api/academic/teachers/me/students/${studentId}/analysis/?subject=${subjectId}`,
    { credentials: "include", headers: authHeaders() }
  );
  if (!res.ok) throw new Error();
  return res.json(); // { analysis, chart_data }
}
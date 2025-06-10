// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\services\docentesService.js

// Configuración base centralizada
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const TEACHERS_API = `${BASE_URL}/api/academic/teachers`;

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ================================
// FUNCIONES CRUD BÁSICAS DE DOCENTES (ADMIN)
// ================================

export const obtenerDocentes = async () => {
  const response = await fetch(`${TEACHERS_API}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener docentes");
  return response.json();
};

export const crearDocente = async (docenteData) => {
  const response = await fetch(`${TEACHERS_API}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(docenteData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al crear docente: ${errorData.detail || "Error desconocido"}`);
  }
  return response.json();
};

export const actualizarDocente = async (id, docenteData) => {
  const response = await fetch(`${TEACHERS_API}/${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(docenteData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al actualizar docente: ${errorData.detail || "Error desconocido"}`);
  }
  return response.json();
};

export const eliminarDocente = async (id) => {
  const response = await fetch(`${TEACHERS_API}/${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al eliminar docente: ${errorData.detail || "Error desconocido"}`);
  }
};

// ================================
// FUNCIONES "ME/" PARA EL DOCENTE AUTENTICADO
// ================================

export const fetchTeacherDashboard = async () => {
  const res = await fetch(`${TEACHERS_API}/me/dashboard/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar dashboard del docente");
  return res.json();
};

export const fetchCourseStudents = async (courseId) => {
  const res = await fetch(`${TEACHERS_API}/me/course/${courseId}/students/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar estudiantes del curso");
  return res.json();
};

export const fetchCourseSubjectGrades = async (courseId, subjectId, period) => {
  const res = await fetch(
    `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/grades/?period=${period}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Error al cargar calificaciones");
  return res.json();
};

export const fetchCourseSubjectAssignments = async (courseId, subjectId) => {
  const res = await fetch(
    `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/assignments/`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Error al cargar actividades de la materia");
  return res.json();
};

export const fetchAttendanceByDate = async (courseId, subjectId, date) => {
  const dateStr = date instanceof Date ? date.toISOString().slice(0, 10) : date;
  const res = await fetch(
    `${TEACHERS_API}/me/attendance/by_date/?course_id=${courseId}&subject_id=${subjectId}&date=${dateStr}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Error cargando asistencia");
  return res.json();
};

// ================================
// FUNCIONES PARA GRADE ENTRIES
// ================================

export const fetchCreateGradeEntry = async (data) => {
  const res = await fetch(`${BASE_URL}/api/academic/grade-entries/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creando entry");
  return res.json();
};

export const fetchUpdateGradeEntry = async (id, data) => {
  const res = await fetch(`${BASE_URL}/api/academic/grade-entries/${id}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando entry");
  return res.json();
};

export const fetchDeleteGradeEntry = async (id) => {
  const res = await fetch(`${BASE_URL}/api/academic/grade-entries/${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar calificación");
  return res;
};

// ================================
// FUNCIONES PARA ATTENDANCE
// ================================

export const fetchCreateAttendance = async (data) => {
  const res = await fetch(`${BASE_URL}/api/academic/attendance/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creando asistencia");
  return res.json();
};

export const fetchUpdateAttendance = async (id, data) => {
  const res = await fetch(`${BASE_URL}/api/academic/attendance/${id}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando asistencia");
  return res.json();
};

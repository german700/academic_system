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

export const fetchCourseSubjectGrades = async (courseId, subjectId, period = null) => {
  const url = period
    ? `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/grades/?period=${period}`
    : `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/grades/`;
  const res = await fetch(url, { headers: getAuthHeaders() });
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

export const updateGrades = async (courseId, subjectId, grades, period) => {
  const res = await fetch(
    `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/grades/?period=${period}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(grades),
    }
  );

  if (res.status === 401) {
    console.warn("⚠️ Token inválido o expirado al guardar notas.");
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error actualizando notas");
  }

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
export const fetchAttendanceByDate = async (courseId, subjectId, date) => {
  const dateStr = date instanceof Date
    ? date.toISOString().slice(0,10)  // 'YYYY-MM-DD'
    : date;
  const res = await fetch(
    `${BASE_URL}/api/academic/attendances/by_course_subject_date/?course_id=${courseId}&subject_id=${subjectId}&date=${dateStr}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Error cargando asistencia");
  return res.json();
};

export const fetchBulkSaveAttendance = async (records) => {
  const res = await fetch(`${BASE_URL}/api/academic/attendances/bulk_save/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(records),
  });
  if (!res.ok) throw new Error("Error guardando asistencia en lote");
  return res.json();
};



export const fetchCourseSubjectAssignmentsByPeriod = async (courseId, subjectId, period) => {
  const res = await fetch(
    `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/assignments/?period=${period}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Error al cargar actividades de la materia");
  const json = await res.json();
  // Asegúrate de que el backend filtre por period
  return json.assignments || json;
};

export const createAssignment = async (courseId, subjectId, period, payload) => {
  const url = `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/assignments/?period=${period}`;
  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error creando actividad");
  }
  return res.json();  // ya viene la nueva actividad
};

export const deleteAssignment = async (assignmentId) => {
  const res = await fetch(`${BASE_URL}/api/academic/assignments/${assignmentId}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error eliminando actividad");
  }
};

// ================================
// OPERACIONES BATCH PARA ASSIGNMENTS
// ================================

/**
 * Actualiza en lote los pesos de varias actividades para un curso/materia/período específico.
 * @param {number} courseId - ID del curso
 * @param {number} subjectId - ID de la materia
 * @param {string} period - Período académico
 * @param {Array<{ assignment_id: number, weight: number }>} weights - Array de pesos a actualizar
 * @returns {Promise<Object>} Respuesta JSON del servidor
 */
export const updateAssignmentWeights = async (courseId, subjectId, period, weights) => {
  const res = await fetch(
    `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/assignments/?period=${period}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ weights, period })
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Error ${res.status}: ${errorData.detail || errorData.error || "Error actualizando pesos"}`);
  }

  return res.json();
};



export const fetchCourseAnalysis = async (courseId, subjectId, period) => {
  const res = await fetch(
    `${TEACHERS_API}/ia/course-analysis/?course_id=${courseId}&subject_id=${subjectId}&period=${period}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Error al cargar análisis de curso");
  
  const data = await res.json();

  return {
    ...data,
    metadata: {
      courseName: data.course_name || `Curso ${courseId}`,   
      subjectName: data.subject_name || `Materia ${subjectId}`, 
      teacherName: data.teacher_name || "Desconocido",
      period: period
    }
  };
};


export const fetchStudentAnalysis = async (courseId, subjectId, studentId, period) => {
  const res = await fetch(
    `${TEACHERS_API}/ia/student-analysis/?course_id=${courseId}&subject_id=${subjectId}&student_id=${studentId}&period=${period}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Error al cargar análisis de estudiante");
  return res.json();
};

export const fetchCourseMetadata = async (courseId, subjectId, period) => {
  try {
    const res = await fetch(
      `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/basic-info/`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error("Error al obtener información básica");
    
    const data = await res.json();
    
    // Paso 3: transformar a camelCase para el frontend
    return {
      courseName: data.course_name,
      subjectName: data.subject_name,
      teacherName: data.teacher_name
    };
    
  } catch (error) {
    console.warn("Fallo en fetchCourseMetadata:", error);
    return {}; // fallback seguro
  }
};

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

// Helper común para manejar errores de fetch
const handleFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Error desconocido");
  }
  
  return res.json();
};

// Helper para fetch que solo requiere verificación de status (sin JSON)
const handleFetchNoJson = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Error desconocido");
  }
  
  return res;
};

// ================================
// FUNCIONES CRUD BÁSICAS DE DOCENTES (ADMIN)
// ================================

export const obtenerDocentes = async () => {
  return handleFetch(`${TEACHERS_API}/`);
};

export const crearDocente = async (docenteData) => {
  return handleFetch(`${TEACHERS_API}/`, {
    method: "POST",
    body: JSON.stringify(docenteData),
  });
};

export const actualizarDocente = async (id, docenteData) => {
  return handleFetch(`${TEACHERS_API}/${id}/`, {
    method: "PUT",
    body: JSON.stringify(docenteData),
  });
};

export const eliminarDocente = async (id) => {
  return handleFetchNoJson(`${TEACHERS_API}/${id}/`, {
    method: "DELETE",
  });
};

// ================================
// FUNCIONES "ME/" PARA EL DOCENTE AUTENTICADO
// ================================

export const fetchTeacherDashboard = async () => {
  return handleFetch(`${TEACHERS_API}/me/dashboard/`);
};

export const fetchCourseStudents = async (courseId) => {
  return handleFetch(`${TEACHERS_API}/me/course/${courseId}/students/`);
};

export const fetchCourseSubjectGrades = async (courseId, subjectId, period = null) => {
  const url = period
    ? `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/grades/?period=${period}`
    : `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/grades/`;
  return handleFetch(url);
};

export const fetchCourseSubjectAssignments = async (courseId, subjectId) => {
  return handleFetch(`${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/assignments/`);
};

// ================================
// FUNCIONES PARA GRADE ENTRIES
// ================================

export const fetchCreateGradeEntry = async (data) => {
  return handleFetch(`${BASE_URL}/api/academic/grade-entries/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
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
  return handleFetchNoJson(`${BASE_URL}/api/academic/grade-entries/${id}/`, {
    method: "DELETE",
  });
};

// ================================
// FUNCIONES PARA ATTENDANCE
// ================================
export const fetchAttendanceByDate = async (courseId, subjectId, date) => {
  const dateStr = date instanceof Date
    ? date.toISOString().slice(0,10)  // 'YYYY-MM-DD'
    : date;
  return handleFetch(
    `${BASE_URL}/api/academic/attendances/by_course_subject_date/?course_id=${courseId}&subject_id=${subjectId}&date=${dateStr}`
  );
};

export const fetchBulkSaveAttendance = async (records) => {
  return handleFetch(`${BASE_URL}/api/academic/attendances/bulk_save/`, {
    method: "POST",
    body: JSON.stringify(records),
  });
};

export const fetchCourseSubjectAssignmentsByPeriod = async (courseId, subjectId, period) => {
  const res = await handleFetch(
    `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/assignments/?period=${period}`
  );
  // Asegúrate de que el backend filtre por period
  return res.assignments || res;
};

export const createAssignment = async (courseId, subjectId, period, payload) => {
  const url = `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/assignments/?period=${period}`;
  return handleFetch(url, {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const deleteAssignment = async (assignmentId) => {
  return handleFetchNoJson(`${BASE_URL}/api/academic/assignments/${assignmentId}/`, {
    method: "DELETE",
  });
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
  return handleFetch(
    `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/assignments/?period=${period}`,
    {
      method: "PATCH",
      body: JSON.stringify({ weights, period })
    }
  );
};

// ================================
// FUNCIONES DE ANÁLISIS CON IA
// ================================

export const fetchCourseAnalysis = async (courseId, subjectId, period) => {
  const data = await handleFetch(
    `${TEACHERS_API}/ia/course-analysis/?course_id=${courseId}&subject_id=${subjectId}&period=${period}`
  );

  const metadata = data.metadata || {};

  return {
    ...data,
    metadata: {
      courseId: metadata.courseId || parseInt(courseId),
      courseName: metadata.courseName || `Curso ${courseId}`,
      subjectName: metadata.subjectName || `Materia ${subjectId}`,
      teacherName: metadata.teacherName || "Desconocido",
      period
    }
  };
};

export const fetchStudentAnalysis = async (courseId, subjectId, studentId, period, academicYear = "2024-2025") => {
  const data = await handleFetch(
    `${TEACHERS_API}/ia/student-analysis/?course_id=${courseId}&subject_id=${subjectId}&student_id=${studentId}&period=${period}&academic_year=${academicYear}`
  );


  // Agregar metadata para consistencia con fetchCourseAnalysis
  const { student_name, course_name, subject_name, teacher_name, ...rest } = data;
  console.log(" El profesor se llama ", teacher_name)
  return {
    ...rest,
    metadata: {
      studentName: student_name || "Estudiante",
      courseName: course_name || `Curso ${courseId}`,
      subjectName: subject_name || `Materia ${subjectId}`,
      teacherName: teacher_name || "Desconocido",
      period
    }
  };
};

export const fetchCourseMetadata = async (courseId, subjectId, period) => {
  try {
    const data = await handleFetch(
      `${TEACHERS_API}/me/course/${courseId}/subject/${subjectId}/basic-info/`
    );
    
    // Transformar a camelCase para el frontend
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
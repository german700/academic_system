// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\services\analyticsService.js
const API_URL = "http://localhost:8000/api/analytics/students-per-grade/";
const ANALYSIS_URL = "http://localhost:8000/api/analytics/student-analysis/";
const RISK_URL = "http://localhost:8000/api/analytics/riesgo-academico/";
const FULL_ANALYSIS_URL = "http://localhost:8000/api/analytics/student/full-analysis/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getStudentsPerGrade = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al obtener datos de estudiantes por grado");
  }

  return await response.json();
};

export const getStudentAnalysis = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(ANALYSIS_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el análisis del estudiante");
  }

  return await response.json();
};

export const getStudentRisk = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(RISK_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el riesgo académico");
  }

  return await response.json();
};

// Nueva función para el análisis completo con IA
export const getStudentFullAnalysis = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(FULL_ANALYSIS_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || "Error al obtener el análisis completo del estudiante");
  }

  return await response.json();
};

// Función auxiliar para manejar errores de autenticación
export const handleAuthError = (error) => {
  if (error.message.includes('401') || error.message.includes('403')) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  throw error;
};
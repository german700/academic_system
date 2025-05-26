// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\services\analyticsService.js

const API_URL = "http://localhost:8000/api/analytics/students-per-grade/";

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

const ANALYSIS_URL = "http://localhost:8000/api/analytics/student-analysis/";

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


const API_URL = "http://localhost:8000/api/estudiantes/";

export const studentService = {
  getStudent: async (id) => {
    const response = await fetch(`${API_URL}${id}/`);
    if (!response.ok) throw new Error("Error al obtener el estudiante");
    return await response.json();
  },

  getStudentAnalysis: async (id) => {
    const response = await fetch(`${API_URL}${id}/analysis/`);
    if (!response.ok) throw new Error("Error al obtener análisis del estudiante");
    return await response.json();
  },
};
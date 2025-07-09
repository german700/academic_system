//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\services\periodosService.js
const BASE_URL = "http://localhost:8000/api/academic";

// Función para obtener headers con token JWT
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ==============================
// 📅 PERIODOS ACADÉMICOS CRUD
// ==============================

// Obtener todos los períodos
export const obtenerPeriodos = async () => {
  const response = await fetch(`${BASE_URL}/admin/periods/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Error al obtener los períodos");
  return await response.json();
};

// Crear un nuevo período
export const crearPeriodo = async (periodoData) => {
  const response = await fetch(`${BASE_URL}/admin/periods/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(periodoData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Error al crear el período"
    );
  }

  return data;
};

// Obtener un período por ID (UUID)
export const obtenerPeriodoPorId = async (id) => {
  const response = await fetch(`${BASE_URL}/admin/periods/${id}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Error al obtener el período");
  return await response.json();
};

// Actualizar un período por ID
export const actualizarPeriodo = async (id, periodoData) => {
  const response = await fetch(`${BASE_URL}/admin/periods/${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(periodoData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Error al actualizar el período"
    );
  }

  return data;
};

// Eliminar un período por ID
export const eliminarPeriodo = async (id) => {
  const response = await fetch(`${BASE_URL}/admin/periods/${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(
      data.message || data.error || "Error al eliminar el período"
    );
  }

  return { message: "Período eliminado correctamente" };
};

// ==========================================
// 🤖 REENTRENAMIENTO MANUAL DEL MODELO IA
// ==========================================

export const reentrenarModeloIA = async (year) => {
  const response = await fetch(`${BASE_URL}/admin/retrain-ia/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ year }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Error al reentrenar el modelo IA"
    );
  }

  return data;
};

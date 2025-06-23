//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\services\auth.service.js
const API_URL = "http://localhost:8000/api";

export const authService = {
  login: async ({ email, password }) => {
    const response = await fetch(`${API_URL}/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Error en la autenticación");
    }

    return await response.json(); // Contiene access, refresh, user_type, email, etc.
  },
};

export const cambiarPassword = async ({ uid, token, password }) => {
  const response = await fetch(`${API_URL}/auth/set-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, token, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al cambiar la contraseña");
  }

  return await response.json();
};
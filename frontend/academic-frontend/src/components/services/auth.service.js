const API_URL = "http://localhost:8000/api";

export const authService = {
  login: async ({ username, password }) => {
    const response = await fetch(`${API_URL}/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error("Error en la autenticación");
    }
    
    return await response.json();
  },

  getUserProfile: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/auth/profile/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Error al obtener perfil de usuario");
    }
    
    return await response.json();
  },
};
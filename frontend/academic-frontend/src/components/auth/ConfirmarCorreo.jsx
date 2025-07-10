// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\auth\ConfirmarCorreo.jsx

import React, { useState } from "react";
import './auth_css/AuthForm.css';
import { useParams, useNavigate } from "react-router-dom";

const ConfirmarCorreo = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cambiarPassword = async ({ uid, token, password }) => {
    const API_URL = "http://localhost:8000/api";
    const response = await fetch(`${API_URL}/auth/set-new-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, token, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        response: {
          data: { error: data.error || "Error desconocido" }
        }
      };
    }

    return data;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const response = await cambiarPassword({ uid, token, password });
      setMensaje("✅ Contraseña cambiada correctamente. Serás redirigido al inicio de sesión...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al establecer la nueva contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div>
          <h2 className="auth-heading">Establecer nueva contraseña</h2>
          <p className="auth-subtext">
            Ingresa tu nueva contraseña para activar tu cuenta
          </p>
        </div>

        {mensaje && <div className="auth-alert-success">{mensaje}</div>}
        {error && <div className="auth-alert-error">{error}</div>}

        <form className="space-y-6" onSubmit={manejarEnvio}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="auth-input"
                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="auth-input"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="auth-loader" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Estableciendo contraseña...
                </span>
              ) : (
                "Establecer contraseña"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Al establecer tu contraseña, tu cuenta será activada automáticamente
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmarCorreo;

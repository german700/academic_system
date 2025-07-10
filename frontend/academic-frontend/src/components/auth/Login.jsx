// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\auth\Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './auth_css/AuthForm.css';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authData = await authService.login({ email, password });

      localStorage.setItem('token', authData.access);
      localStorage.setItem('refresh', authData.refresh);
      localStorage.setItem('user_type', authData.user_type);

      login({
        token: authData.access,
        refresh: authData.refresh,
        user_type: authData.user_type,
        is_superuser: authData.is_superuser,
        first_name: authData.first_name,
        last_name: authData.last_name,
        email: authData.email,
      });

      if (authData.user_type === 'student') {
        navigate('/student/estudiante-materias');
      } else if (authData.user_type === 'teacher') {
        navigate('/teachers/dashboard');
      } else if (authData.user_type === 'director') {
        navigate('/directivo-dashboard');
      } else {
        console.error('Tipo de usuario no reconocido:', authData.user_type);
        navigate('/login');
      }
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error de autenticación. Por favor, verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="text-center">
          <img src="/logo.png" alt="Logo institucional" className="auth-logo" />
          <h2 className="auth-heading">Iniciar Sesión</h2>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <div className="auth-alert-error">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="auth-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="auth-input"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="auth-loader" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

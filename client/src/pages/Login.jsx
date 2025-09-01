import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import DoctrackIcon from '../assets/doctrackIcon.png';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
  const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

  // Cargar el script de Google One Tap
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID no configurado');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [GOOGLE_CLIENT_ID]);

  // Manejar respuesta de Google OAuth
  const handleGoogleResponse = async (response) => {
    try {
      setIsGoogleLoading(true);
      setLoginError('');

      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ credential: response.credential }),
      });

      if (res.ok) {
        const data = await res.json();

        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('authToken', 'authenticated');
        }

        window.dispatchEvent(new Event('authChange'));
        navigate('/dashboard');

      } else {
        const errorData = await res.json().catch(() => ({ message: 'Error en el servidor' }));
        setLoginError(errorData.message || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('Error en login con Google:', error);
      setLoginError('Error de conexión con Google. Por favor, intenta de nuevo.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Manejar click en botón de Google
  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setLoginError('Google Sign-In no está disponible. Por favor, recarga la página.');
    }
  };

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    if (loginError) {
      setLoginError('');
    }
  }, [formData.email, formData.password]);

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('authToken', 'authenticated');
        }

        window.dispatchEvent(new Event('authChange'));
        navigate('/dashboard');

      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error en el servidor' }));
        setLoginError(errorData.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setLoginError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para ir a register
  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #8B5A96 0%, #9B59B6 35%, #BE90D4 70%, #E8D5F0 100%)' 
    }}>
      {/* Figuras circulares de fondo - exactas a la imagen */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Círculo grande superior - púrpura oscuro */}
        <div className="absolute -left-48 top-12 w-80 h-80 rounded-full opacity-60 animate-float-slow"
             style={{ 
               background: 'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 50%, #A855F7 100%)',
               filter: 'blur(1px)'
             }}></div>
        
        {/* Círculo mediano centro - púrpura medio */}
        <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 w-64 h-64 rounded-full opacity-70 animate-float-medium"
             style={{ 
               background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)',
               filter: 'blur(0.5px)'
             }}></div>
        
        {/* Círculo pequeño inferior - púrpura claro */}
        <div className="absolute -left-20 bottom-16 w-48 h-48 rounded-full opacity-80 animate-float-fast"
             style={{ 
               background: 'linear-gradient(135deg, #A855F7 0%, #C084FC 50%, #DDD6FE 100%)',
               filter: 'blur(0.3px)'
             }}></div>
      </div>

      {/* Logo en esquina superior derecha */}
      <div className="absolute top-6 right-6 z-20 bg-purple-600 p-3 rounded-lg shadow-lg animate-fade-in-up">
        <img src={DoctrackIcon} className="w-8 h-8" alt="Doctrack Icon" />
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in-scale">
          {/* Card principal */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl px-8 py-10 border border-white/20">
            
            {/* Encabezado */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Doctrack</h1>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Campo Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80"
                  placeholder="Ingresa tu correo electrónico"
                  autoComplete="email"
                />
                {errors.email && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <ExclamationCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80"
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <ExclamationCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Error de login */}
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center text-sm text-red-700">
                    <ExclamationCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    {loginError}
                  </div>
                </div>
              )}

              {/* Botón de acceder */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Accediendo...
                  </div>
                ) : (
                  'Acceder'
                )}
              </button>

              {/* Divisor */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              {/* Botón de Google Sign-In */}
              {GOOGLE_CLIENT_ID && (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-gray-300 disabled:cursor-not-allowed flex items-center justify-center shadow-sm transform hover:scale-105 active:scale-95"
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                      Conectando con Google...
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Iniciar sesión con Google
                    </>
                  )}
                </button>
              )}

            </form>

            {/* Link olvidaste contraseña */}
            <div className="mt-6 text-center">
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Enlace para crear cuenta */}
            <div className="mt-6 text-center">
              <span className="text-gray-500 text-sm">¿Eres nuevo? </span>
              <button
                onClick={handleSwitchToRegister}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Crea tu cuenta aquí
              </button>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          50% {
            transform: translateY(-15px) translateX(8px) scale(1.02);
          }
        }

        @keyframes float-medium {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          50% {
            transform: translateY(-20px) translateX(-10px) scale(1.03);
          }
        }

        @keyframes float-fast {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          50% {
            transform: translateY(-25px) translateX(12px) scale(1.04);
          }
        }

        .animate-fade-in-scale {
          animation: fade-in-scale 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out 0.2s both;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite 1s;
        }

        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite 0.5s;
        }
      `}</style>
    </div>
  );
};

export default Login;
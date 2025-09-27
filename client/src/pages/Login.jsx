import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import DoctrackIcon from '../assets/doctrackIcon.png';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Usar el backend correcto según entorno
  const API_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:3001'
    : import.meta.env?.VITE_API_URL || '';

  const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

  // Función para actualizar el estado de autenticación
  const updateAuthState = (user) => {
    // Solo almacenamos la información no sensible del usuario
    sessionStorage.setItem('user', JSON.stringify(user));
    
    // Usar navigate para redirección sin recargar la página
    navigate('/dashboard', { replace: true });
  };

  // Manejar el código de autorización de Google cuando regrese
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    console.log('[DEBUG] URL params:', { code: !!code, state, error });
    console.log('[DEBUG] Current URL:', window.location.href);
    
    if (error) {
      setLoginError(`Error de Google OAuth: ${error}`);
      return;
    }
    
    if (code && state === 'google_login') {
      handleGoogleCallback(code);
    }
  }, [searchParams]);

  // Procesar el callback de Google
  const handleGoogleCallback = async (code) => {
    try {
      setIsGoogleLoading(true);
      setLoginError('');

      console.log('[DEBUG] Handling Google callback with code:', code.substring(0, 20) + '...');
      console.log('[DEBUG] API URL:', API_URL);

      const response = await fetch(`${API_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      console.log('[DEBUG] Response status:', response.status);
      console.log('[DEBUG] Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('[DEBUG] Response data:', { user: !!data.user, message: data.message });
        
        if (data.user) {
          updateAuthState(data.user);
        } else {
          setLoginError('Error: No se recibieron datos del usuario');
        }
        
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error en el servidor' }));
        console.error('[DEBUG] Error response:', errorData);
        setLoginError(errorData.message || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('Error en callback de Google:', error);
      setLoginError('Error de conexión con Google. Por favor, intenta de nuevo.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Manejar click en botón de Google - Redireccionar a Google OAuth
  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setLoginError('Google Sign-In no está configurado.');
      return;
    }

    // Use explicit production URL or current origin  
    const redirectUri = import.meta.env.PROD 
      ? `${window.location.origin}/login`  // Use frontend URL, not backend
      : window.location.origin + '/login';
    
    console.log('[DEBUG] Redirect URI:', redirectUri);
    
    // Scopes solo para login básico
    const scopes = [
      'openid',
      'profile', 
      'email'
    ].join(' ');

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=google_login&` +
      `access_type=offline&` +
      `prompt=consent`;

    console.log('[DEBUG] Google Auth URL:', googleAuthUrl);
    window.location.href = googleAuthUrl;
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
        console.log('Login response:', data);

        if (data.user) {
          // Si el usuario no tiene contraseña, mostrar mensaje especial
          if (!data.user.password && (data.user.google_id || data.user.profile_picture)) {
            setLoginError('Esta cuenta solo puede iniciar sesión con Google. Usa el botón de Google para acceder.');
            return;
          }
          try {
            // Guardar info del usuario en sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data.user));

            // Esperar un momento para asegurarse de que las cookies se establezcan
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verificar que las cookies se establecieron correctamente
            console.log('Verificando sesión...');
            const verifyResponse = await fetch(`${API_URL}/api/auth/profile`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });

            if (verifyResponse.ok) {
              console.log('Sesión verificada correctamente');
              window.dispatchEvent(new Event('authChange'));
              navigate('/dashboard', { replace: true });
            } else {
              const errorData = await verifyResponse.json();
              console.error('Error en verificación:', errorData);
              throw new Error('Falló la verificación de la sesión');
            }
          } catch (error) {
            console.error('Error en el proceso de login:', error);
            setLoginError('Error al establecer la sesión. Por favor, intenta de nuevo.');
          }
        } else {
          setLoginError('Error: No se recibieron datos del usuario');
        }

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Contenedor principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-12 py-16">
          
          {/* Logo y encabezado */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
                <img src={DoctrackIcon} className="w-8 h-8 mr-3 rounded" />
              <div className="flex items-center justify-center">
                <span className="text-white text-sm font-bold">D</span>
              </div>
              <h1 className="text-3xl font-normal text-gray-900">Doctrack</h1>
            </div>
            <p className="text-gray-500 text-lg font-light">Inicia sesión</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-3">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                placeholder="Ingresa tu correo electrónico"
                autoComplete="email"
              />
              {errors.email && (
                <div className="mt-3 flex items-center text-base text-red-600">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-3">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 pr-12 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-6 w-6" />
                  ) : (
                    <EyeIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="mt-3 flex items-center text-base text-red-600">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Error de login */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center text-base text-red-700">
                  <ExclamationCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {loginError}
                </div>
              </div>
            )}

            {/* Botón de acceder */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-4 px-6 rounded-md transition-all duration-200 text-lg disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
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
                className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium py-4 px-6 rounded-lg transition-all duration-200 text-lg border border-gray-300 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
              >
                {isGoogleLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mr-3"></div>
                    Conectando con Google...
                  </div>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
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

          {/* Enlace para crear cuenta */}
          <div className="mt-8 text-center">
            <span className="text-gray-500 text-base">¿Eres nuevo? </span>
            <button 
              onClick={handleSwitchToRegister}
              className="text-purple-600 hover:text-purple-700 font-medium text-base"
            >
              Crea tu cuenta aquí
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
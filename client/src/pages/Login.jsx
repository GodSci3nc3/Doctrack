import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // CAMBIO 1: Agregar variable de entorno con fallback
  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    if (loginError) {
      setLoginError('');
    }
  }, [formData.email, formData.password]); // CAMBIO 2: Ser más específico con las dependencias

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
        
        // CAMBIO 3: Almacenar token y datos de usuario si están disponibles
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Disparar evento de cambio de autenticación
        window.dispatchEvent(new Event('authChange'));
        
        // Redirigir al dashboard
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Contenedor principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-12 py-16">
          
          {/* Logo y encabezado */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              {/* CAMBIO 4: Reemplazar imagen con ícono simple */}
              <div className="w-8 h-8 mr-3 bg-blue-600 rounded flex items-center justify-center">
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
                autoComplete="email" // CAMBIO 5: Agregar autoComplete para mejor UX
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
                  autoComplete="current-password" // CAMBIO 6: Agregar autoComplete
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
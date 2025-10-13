import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import DoctrackIcon from '../assets/doctrackIcon.png';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // URL del API corregida
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://doctrack-0jp0.onrender.com';

  // Debug: verificar variables de entorno
  useEffect(() => {
    console.log('🔧 DEBUGGING INFO:');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Register URL sería:', `${API_BASE_URL}/auth/register`);
  }, []);

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    if (registerError) {
      setRegisterError('');
    }
  }, [formData]);

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

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

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido';
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
    setRegisterError('');

    // URL CORREGIDA - sin /api
    const fullUrl = `${API_BASE_URL}/auth/register`;

    console.log('🚀 Intentando registro...');
    console.log('📍 URL:', fullUrl);
    console.log('📦 Datos a enviar:', {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      rol: formData.rol,
      password: '[HIDDEN]'
    });

    try {
      // Headers mejorados para CORS
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Importante para cookies
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          rol: formData.rol
        }),
      };

      console.log('📤 Request options:', requestOptions);

      const response = await fetch(fullUrl, requestOptions);

      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);
      console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Registro exitoso:', data);

        // Disparar evento de cambio de autenticación
        window.dispatchEvent(new Event('authChange'));

        // Mostrar mensaje de éxito
        alert('¡Registro exitoso! Bienvenido al sistema.');

        // Redirigir al dashboard
        navigate('/dashboard');

      } else {
        // Intentar leer el error del servidor
        let errorMessage = 'Error al crear la cuenta';
        try {
          const errorData = await response.json();
          console.error('❌ Error del servidor:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('❌ No se pudo parsear el error:', parseError);
          errorMessage = `Error del servidor (${response.status})`;
        }
        setRegisterError(errorMessage);
      }
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);

      // Error más específico para debugging
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setRegisterError(`Error de conexión. Verifica que el servidor esté corriendo en ${API_BASE_URL}`);
      } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        setRegisterError('Error de red. Verifica tu conexión a internet.');
      } else if (error.message.includes('CORS')) {
        setRegisterError('Error de CORS. El servidor no permite conexiones desde este dominio.');
      } else {
        setRegisterError(`Error de conexión: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para ir a login
  const handleSwitchToLogin = () => {
    navigate('/login');
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
              
              {/* Mostrar información de debugging en desarrollo */}
              {import.meta.env.DEV && (
                <div className="mt-4 text-xs text-gray-400">
                  API: {API_BASE_URL}
                </div>
              )}
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Campo Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80"
                  placeholder="Ingresa tu nombre"
                />
                {errors.nombre && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                    {errors.nombre}
                  </div>
                )}
              </div>

              {/* Campo Apellido */}
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80"
                  placeholder="Ingresa tu apellido"
                />
                {errors.apellido && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                    {errors.apellido}
                  </div>
                )}
              </div>

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
                />
                {errors.email && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Campo Rol */}
              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80"
                >
                  <option value="">Selecciona tu rol</option>
                  <option value="preparador">Preparador</option>
                  <option value="soporte">Soporte</option>
                </select>
                {errors.rol && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                    {errors.rol}
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
                    placeholder="Crea una contraseña"
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
                    <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Campo Confirmar Contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80"
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Error de registro */}
              {registerError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center text-sm text-red-700">
                    <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                    {registerError}
                  </div>
                </div>
              )}

              {/* Botón de crear cuenta */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </div>
                ) : (
                  'Crear cuenta'
                )}
              </button>

            </form>

            {/* Enlace para iniciar sesión */}
            <div className="mt-6 text-center">
              <span className="text-gray-500 text-sm">¿Ya tienes cuenta? </span>
              <button
                onClick={handleSwitchToLogin}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Inicia sesión aquí
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

export default Register;
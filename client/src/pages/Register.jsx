import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

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

  // Debug: verificar variables de entorno
  useEffect(() => {
    console.log('🔧 DEBUGGING INFO:');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('VITE_MODE:', import.meta.env.MODE);
    console.log('VITE_DEV:', import.meta.env.DEV);
    console.log('VITE_PROD:', import.meta.env.PROD);
    console.log('API URL completa sería:', `${import.meta.env.VITE_API_URL}/api/auth/register`);
    console.log('All env vars:', import.meta.env);
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

    // Debug logs
    const apiUrl = import.meta.env.VITE_API_URL || 'https://doctrack-0jp0.onrender.com';
    const fullUrl = `${import.meta.env.VITE_API_URL}/auth/register`;
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
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          rol: formData.rol
        }),
      });

      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Registro exitoso:', data);
        
        // Disparar evento de cambio de autenticación
        window.dispatchEvent(new Event('authChange'));
        
        // Mostrar mensaje de éxito
        alert('Registro exitoso! Bienvenido al sistema.');
        
        // El usuario ya está autenticado automáticamente, redirigir al dashboard
        // navigate('/dashboard');
        
      } else {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        setRegisterError(errorData.message || 'Error al crear la cuenta');
      }
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // Error más específico para debugging
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setRegisterError(`Error de conexión. ¿Está el servidor corriendo en ${apiUrl}?`);
      } else {
        setRegisterError('Error de conexión. Por favor, intenta de nuevo.');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Contenedor principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-12 py-16">
          
          {/* Logo y encabezado */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/src/assets/doctrackIcon.png" 
                alt="Doctrack Logo" 
                className="w-8 h-8 mr-3"
              />
              <h1 className="text-3xl font-normal text-gray-900">Doctrack</h1>
            </div>
            <p className="text-gray-500 text-lg font-light">Crear cuenta</p>
            
            
          </div>

          {/* Formulario */}
          <div className="space-y-6">
            
            {/* Campo Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-lg font-medium text-gray-700 mb-3">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                placeholder="Ingresa tu nombre"
              />
              {errors.nombre && (
                <div className="mt-3 flex items-center text-base text-red-600">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  {errors.nombre}
                </div>
              )}
            </div>

            {/* Campo Apellido */}
            <div>
              <label htmlFor="apellido" className="block text-lg font-medium text-gray-700 mb-3">
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={formData.apellido}
                onChange={handleInputChange}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                placeholder="Ingresa tu apellido"
              />
              {errors.apellido && (
                <div className="mt-3 flex items-center text-base text-red-600">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  {errors.apellido}
                </div>
              )}
            </div>

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
              />
              {errors.email && (
                <div className="mt-3 flex items-center text-base text-red-600">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Campo Rol */}
            <div>
              <label htmlFor="rol" className="block text-lg font-medium text-gray-700 mb-3">
                Rol
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleInputChange}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="">Selecciona tu rol</option>
                <option value="preparador">Preparador</option>
                <option value="soporte">Soporte</option>
              </select>
              {errors.rol && (
                <div className="mt-3 flex items-center text-base text-red-600">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  {errors.rol}
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
                  placeholder="Crea una contraseña"
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
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Campo Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700 mb-3">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 pr-12 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  placeholder="Confirma tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-6 w-6" />
                  ) : (
                    <EyeIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-3 flex items-center text-base text-red-600">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Error de registro */}
            {registerError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center text-base text-red-700">
                  <ExclamationCircleIcon className="w-5 h-5 mr-3" />
                  {registerError}
                </div>
              </div>
            )}

            {/* Botón de crear cuenta */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-4 px-6 rounded-md transition-all duration-200 text-lg disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Creando cuenta...
                </div>
              ) : (
                'Crear cuenta'
              )}
            </button>

          </div>

          {/* Enlace para iniciar sesión */}
          <div className="mt-8 text-center">
            <span className="text-gray-500 text-base">¿Ya tienes cuenta? </span>
            <button 
              onClick={handleSwitchToLogin}
              className="text-purple-600 hover:text-purple-700 font-medium text-base"
            >
              Inicia sesión aquí
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
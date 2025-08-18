import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    rol: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    if (registerError) {
      setRegisterError('');
    }
    if (registerSuccess) {
      setRegisterSuccess('');
    }
  }, [formData]);

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
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

    if (!formData.rol) {
      newErrors.rol = 'Debes seleccionar un rol';
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
    setRegisterSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          password: formData.password,
          rol: formData.rol
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (formData.rol === 'preparador') {
          // Para preparadores, se registran directamente
          window.dispatchEvent(new Event('authChange'));
          setRegisterSuccess('¡Registro exitoso! Bienvenido al sistema.');
          setTimeout(() => {
            alert('Redirigiendo al dashboard...');
            // Aquí puedes redirigir si tienes react-router
            // navigate('/dashboard');
          }, 1500);
        } else if (formData.rol === 'soporte') {
          // Para soporte técnico, queda pendiente
          setRegisterSuccess('Registro enviado correctamente. Tu cuenta está pendiente de aprobación por el equipo de soporte técnico.');
        }
        
      } else {
        const errorData = await response.json();
        setRegisterError(errorData.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setRegisterError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
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
          <div className="space-y-8">
            
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

            {/* Campo Apellidos */}
            <div>
              <label htmlFor="apellidos" className="block text-lg font-medium text-gray-700 mb-3">
                Apellidos
              </label>
              <input
                id="apellidos"
                name="apellidos"
                type="text"
                value={formData.apellidos}
                onChange={handleInputChange}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                placeholder="Ingresa tus apellidos"
              />
              {errors.apellidos && (
                <div className="mt-3 flex items-center text-base text-red-600">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  {errors.apellidos}
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
                <option value="soporte">Soporte Técnico</option>
              </select>
              {errors.rol && (
                <div className="mt-3 flex items-center text-base text-red-600">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  {errors.rol}
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

            {/* Éxito de registro */}
            {registerSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center text-base text-green-700">
                  <CheckCircleIcon className="w-5 h-5 mr-3" />
                  {registerSuccess}
                </div>
              </div>
            )}

            {/* Botón de registro */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-4 px-6 rounded-md transition-all duration-200 text-lg disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Registrando...
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
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-700 font-medium text-base"
            >
              Iniciar sesión
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
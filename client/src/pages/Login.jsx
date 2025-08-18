import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Login = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    if (loginError) {
      setLoginError('');
    }
  }, [formData]);

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        window.dispatchEvent(new Event('authChange'));
        
        alert('Login exitoso! Redirigiendo al dashboard...');
        
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      // Simulación para demo
      if (formData.email === 'admin@empresa.com' && formData.password === 'password123') {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo';
        const mockUser = { id: 1, name: 'Administrador', email: formData.email };
        
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        window.dispatchEvent(new Event('authChange'));
        
        alert('Login exitoso! Redirigiendo al dashboard...');
        return;
      } else {
        setLoginError('Usuario o contraseña incorrectos');
      }
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
            <p className="text-gray-500 text-lg font-light">Inicia sesión</p>
          </div>

          {/* Formulario */}
          <div className="space-y-8">
            
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

            {/* Error de login */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center text-base text-red-700">
                  <ExclamationCircleIcon className="w-5 h-5 mr-3" />
                  {loginError}
                </div>
              </div>
            )}

            {/* Botón de acceder */}
            <button
              onClick={handleSubmit}
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

          </div>

          {/* Enlace de olvido de contraseña */}
          <div className="mt-8 text-center">
            <button className="text-gray-500 hover:text-gray-700 font-normal text-base">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
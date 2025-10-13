import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            La página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Volver atrás</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Ir al Dashboard</span>
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>¿Necesitas ayuda? <a href="/soporte" className="text-blue-600 hover:text-blue-700">Contacta soporte</a></p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy loading de páginas
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ClientsPage = React.lazy(() => import('./pages/Clients'));
const CasesPage = React.lazy(() => import('./pages/Cases'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Componente de Loading para Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center p-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando página...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas con layout */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Ruta principal */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Dashboard */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Clientes */}
                    <Route path="/clients" element={<ClientsPage />} />
                    
                    {/* Casos */}
                    <Route path="/cases" element={<CasesPage />} />
                    
                    {/* Documentos */}
                    {/*<Route path="/documentos" element={<DocumentsPage />} />*/}
                    
                    {/* Páginas futuras - placeholder routes */}
                    <Route path="/agenda" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Agenda - En desarrollo</h2></div>} />
                    <Route path="/casos/tracking" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Case Tracking - En desarrollo</h2></div>} />
                    <Route path="/casos/ia" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Revisión IA - En desarrollo</h2></div>} />
                    <Route path="/contratos" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Contratos - En desarrollo</h2></div>} />
                    <Route path="/plantillas" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Plantillas - En desarrollo</h2></div>} />
                    <Route path="/pagos" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Pagos - En desarrollo</h2></div>} />
                    <Route path="/reportes" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Reportes - En desarrollo</h2></div>} />
                    <Route path="/usuarios" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Usuarios - En desarrollo</h2></div>} />
                    <Route path="/usuarios/nuevo" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Nuevo Usuario - En desarrollo</h2></div>} />
                    <Route path="/servicios" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Servicios - En desarrollo</h2></div>} />
                    <Route path="/config/*" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Configuración - En desarrollo</h2></div>} />
                    <Route path="/cuenta/*" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Mi Cuenta - En desarrollo</h2></div>} />
                    <Route path="/academia" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Academia - Próximamente</h2></div>} />
                    <Route path="/comunidad" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Comunidad - Próximamente</h2></div>} />
                    <Route path="/marketplace" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Marketplace - Próximamente</h2></div>} />
                    <Route path="/soporte" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Soporte</h2></div>} />
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
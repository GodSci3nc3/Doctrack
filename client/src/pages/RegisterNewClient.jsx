import React, { useState } from 'react';
import ClientForm from '../components/ClientForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const RegisterNewClient = ({ onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (onSave) onSave();
    } catch (err) {
      setError('Error al crear el cliente: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <ClientForm onSubmit={handleSubmit} loading={loading} error={error} mode="create" />
    </div>
  );
};

export default RegisterNewClient;
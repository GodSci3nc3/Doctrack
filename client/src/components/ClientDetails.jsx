import React from 'react';

const formatDate = (date) => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('es-ES');
  } catch {
    return date;
  }
};

const ClientDetails = ({ client, onClose }) => {
  if (!client) return null;
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Detalles del Cliente</h2>
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cerrar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-lg text-gray-700 mb-2">Datos Personales</h3>
          <p><span className="font-medium">Encargado:</span> {client.encargado || '-'}</p>
          <p><span className="font-medium">Tipo de proceso:</span> {client.tipo_proceso || '-'}</p>
          <p><span className="font-medium">Nombre:</span> {client.nombre || '-'}</p>
          <p><span className="font-medium">Apellido:</span> {client.apellido || '-'}</p>
          <p><span className="font-medium">Correo electrónico:</span> {client.email || '-'}</p>
          <p><span className="font-medium">Teléfono:</span> {client.telefono || '-'}</p>
          <p><span className="font-medium">Tipo documento:</span> {client.tipo_documento || '-'}</p>
          <p><span className="font-medium">N° documento:</span> {client.numero_documento || '-'}</p>
          <p><span className="font-medium">País origen:</span> {client.pais_origen || '-'}</p>
          <p><span className="font-medium">País nacimiento:</span> {client.pais_nacimiento || '-'}</p>
          <p><span className="font-medium">Fecha nacimiento:</span> {formatDate(client.fecha_nacimiento) || '-'}</p>
          <p><span className="font-medium">Estado civil:</span> {client.estado_civil || '-'}</p>
          <p><span className="font-medium">Dirección actual:</span> {client.direccion_actual || '-'}</p>
          <p><span className="font-medium">Estado:</span> {client.estado || '-'}</p>
          <p><span className="font-medium">Zipcode:</span> {client.zipcode || '-'}</p>
          <p><span className="font-medium">Ciudad:</span> {client.ciudad || '-'}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-700 mb-2">Datos Migratorios</h3>
          <p><span className="font-medium">Tipo proceso migratorio:</span> {client.migratorio_tipo_proceso || '-'}</p>
          <p><span className="font-medium">Ubicación actual:</span> {client.migratorio_ubicacion_actual || '-'}</p>
          <p><span className="font-medium">Estatus actual:</span> {client.migratorio_estatus_actual || '-'}</p>
          <p><span className="font-medium">N° caso actual:</span> {client.migratorio_numero_caso || '-'}</p>
          <p><span className="font-medium">Fecha entrada EEUU:</span> {formatDate(client.migratorio_fecha_entrada_eeuu) || '-'}</p>
          <p><span className="font-medium">Vía entrada EEUU:</span> {client.migratorio_via_entrada_eeuu || '-'}</p>
          <p><span className="font-medium">Fecha vencimiento estadía:</span> {formatDate(client.migratorio_fecha_vencimiento_estadia) || '-'}</p>
          <p><span className="font-medium">Dependientes:</span> {client.migratorio_dependientes || '-'}</p>
        </div>
        <div className="md:col-span-2">
          <h3 className="font-semibold text-lg text-gray-700 mb-2">Estudios y Datos Adicionales</h3>
          <p><span className="font-medium">Ocupación actual:</span> {client.ocupacion_actual || '-'}</p>
          <p><span className="font-medium">Nivel estudios:</span> {client.nivel_estudios || '-'}</p>
          <p><span className="font-medium">Forma contacto:</span> {client.forma_contacto || '-'}</p>
          <p><span className="font-medium">Notas:</span> {client.notas_cliente || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;

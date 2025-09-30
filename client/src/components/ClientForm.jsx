import React, { useState, useEffect } from 'react';

const initialState = {
  encargado: '',
  tipo_proceso: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  tipo_documento: '',
  numero_documento: '',
  pais_origen: '',
  pais_nacimiento: '',
  fecha_nacimiento: '',
  estado_civil: '',
  direccion_actual: '',
  estado: '',
  zipcode: '',
  ciudad: '',
  migratorio_tipo_proceso: '',
  migratorio_ubicacion_actual: '',
  migratorio_estatus_actual: '',
  migratorio_numero_caso: '',
  migratorio_fecha_entrada_eeuu: '',
  migratorio_via_entrada_eeuu: '',
  migratorio_fecha_vencimiento_estadia: '',
  migratorio_dependientes: '',
  ocupacion_actual: '',
  nivel_estudios: '',
  forma_contacto: '',
  notas_cliente: '',
};

const ClientForm = ({ onSubmit, initialData = {}, loading = false, error = null, mode = 'create' }) => {
  const [form, setForm] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Formatear fechas para inputs de tipo date
      const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return '';
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      };

      const formattedData = {
        ...initialState,
        ...initialData,
        // Formatear fechas específicamente
        fecha_nacimiento: formatDateForInput(initialData.fecha_nacimiento),
        migratorio_fecha_entrada_eeuu: formatDateForInput(initialData.migratorio_fecha_entrada_eeuu),
        migratorio_fecha_vencimiento_estadia: formatDateForInput(initialData.migratorio_fecha_vencimiento_estadia),
        // Asegurar que los campos de texto no sean null
        telefono: initialData.telefono || '',
        encargado: initialData.encargado || '',
        tipo_proceso: initialData.tipo_proceso || '',
        tipo_documento: initialData.tipo_documento || '',
        numero_documento: initialData.numero_documento || '',
        pais_origen: initialData.pais_origen || '',
        pais_nacimiento: initialData.pais_nacimiento || '',
        estado_civil: initialData.estado_civil || '',
        direccion_actual: initialData.direccion_actual || '',
        estado: initialData.estado || '',
        zipcode: initialData.zipcode || '',
        ciudad: initialData.ciudad || '',
        migratorio_tipo_proceso: initialData.migratorio_tipo_proceso || '',
        migratorio_ubicacion_actual: initialData.migratorio_ubicacion_actual || '',
        migratorio_estatus_actual: initialData.migratorio_estatus_actual || '',
        migratorio_numero_caso: initialData.migratorio_numero_caso || '',
        migratorio_via_entrada_eeuu: initialData.migratorio_via_entrada_eeuu || '',
        migratorio_dependientes: initialData.migratorio_dependientes || '',
        ocupacion_actual: initialData.ocupacion_actual || '',
        nivel_estudios: initialData.nivel_estudios || '',
        forma_contacto: initialData.forma_contacto || '',
        notas_cliente: initialData.notas_cliente || ''
      };

      console.log('Setting form data with initial data:', formattedData);
      setForm(formattedData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!form.apellido.trim()) errors.apellido = 'El apellido es requerido';
    if (!form.email.trim()) errors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Correo inválido';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      onSubmit(form);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-0 rounded-lg shadow-md" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
      <form className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        <h2 className="col-span-2 text-3xl font-bold mb-4 text-blue-700">{mode === 'edit' ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
        <div className="col-span-2 text-lg font-semibold text-blue-600 mb-2 border-b pb-2">Datos Personales</div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Encargado</label>
        <input name="encargado" value={form.encargado} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de proceso</label>
        <input name="tipo_proceso" value={form.tipo_proceso} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre *</label>
        <input name="nombre" value={form.nombre} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${formErrors.nombre ? 'border-red-400' : ''}`} />
        {formErrors.nombre && <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Apellido *</label>
        <input name="apellido" value={form.apellido} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${formErrors.apellido ? 'border-red-400' : ''}`} />
        {formErrors.apellido && <p className="text-red-500 text-xs mt-1">{formErrors.apellido}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Correo electrónico *</label>
        <input name="email" value={form.email} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${formErrors.email ? 'border-red-400' : ''}`} />
        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
        <input name="telefono" value={form.telefono} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de documento</label>
        <input name="tipo_documento" value={form.tipo_documento} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">N° de documento</label>
        <input name="numero_documento" value={form.numero_documento} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">País origen</label>
        <input name="pais_origen" value={form.pais_origen} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">País nacimiento</label>
        <input name="pais_nacimiento" value={form.pais_nacimiento} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha nacimiento</label>
        <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Estado civil</label>
        <input name="estado_civil" value={form.estado_civil} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Dirección actual</label>
        <input name="direccion_actual" value={form.direccion_actual} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Estado</label>
        <input name="estado" value={form.estado} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Zipcode</label>
        <input name="zipcode" value={form.zipcode} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Ciudad</label>
        <input name="ciudad" value={form.ciudad} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
  <div className="col-span-2 text-lg font-semibold text-blue-600 mt-4 mb-2 border-b pb-2">Datos Migratorios</div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de proceso migratorio</label>
        <input name="migratorio_tipo_proceso" value={form.migratorio_tipo_proceso} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Ubicación actual</label>
        <input name="migratorio_ubicacion_actual" value={form.migratorio_ubicacion_actual} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Estatus actual</label>
        <input name="migratorio_estatus_actual" value={form.migratorio_estatus_actual} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">N° caso actual</label>
        <input name="migratorio_numero_caso" value={form.migratorio_numero_caso} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha entrada EEUU</label>
        <input name="migratorio_fecha_entrada_eeuu" type="date" value={form.migratorio_fecha_entrada_eeuu} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Vía entrada EEUU</label>
        <input name="migratorio_via_entrada_eeuu" value={form.migratorio_via_entrada_eeuu} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha vencimiento estadía</label>
        <input name="migratorio_fecha_vencimiento_estadia" type="date" value={form.migratorio_fecha_vencimiento_estadia} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Dependientes</label>
        <input name="migratorio_dependientes" value={form.migratorio_dependientes} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
  <div className="col-span-2 text-lg font-semibold text-blue-600 mt-4 mb-2 border-b pb-2">Estudios y Datos Adicionales</div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Ocupación actual</label>
        <input name="ocupacion_actual" value={form.ocupacion_actual} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nivel de estudios</label>
        <input name="nivel_estudios" value={form.nivel_estudios} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Forma de contacto</label>
        <input name="forma_contacto" value={form.forma_contacto} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Notas de cliente</label>
        <textarea name="notas_cliente" value={form.notas_cliente} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" rows={2} />
      </div>
      <div className="col-span-2 flex justify-end gap-2 mt-4">
        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-colors" disabled={loading}>
          {loading ? 'Guardando...' : mode === 'edit' ? 'Actualizar' : 'Guardar'}
        </button>
        <button type="button" className="px-6 py-2 bg-gradient-to-r from-gray-200 to-gray-400 text-gray-700 rounded-md font-semibold shadow hover:from-gray-300 hover:to-gray-500 transition-colors" onClick={() => window.history.back()}>
          Cancelar
        </button>
      </div>
      {error && <div className="col-span-2 text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default ClientForm;

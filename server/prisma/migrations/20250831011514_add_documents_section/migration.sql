-- Migration script to update processes and populate documents

BEGIN;
    -- First, let's create a temporary table with the correct processes
    CREATE TEMP TABLE procesos_correctos AS
    SELECT unnest(ARRAY[
    'Asilo Afirmativo',
    'Asilo Defensivo', 
    'Cambio de Estatus (COS)',
    'E-1 Comerciante',
    'E-2 Inversionista',
    'EB-2 NIW',
    'H1B1 Consular',
    'H1B1 Extensión',
    'L-1 Transferencia',
    'Peticiones Familiares'
    ]) AS proceso_nombre;

    -- Update existing cases to use correct process names (if any exist with old names)
    UPDATE caso 
    SET tipo_tramite = 'Asilo Afirmativo'
    WHERE tipo_tramite LIKE '%Asilo%' AND tipo_tramite NOT IN (
    'Asilo Afirmativo', 'Asilo Defensivo'
    );

    UPDATE caso 
    SET tipo_tramite = 'Peticiones Familiares'
    WHERE tipo_tramite LIKE '%Residencia%' OR tipo_tramite LIKE '%Familiar%';

    -- Delete any cases that don't match our approved processes
    DELETE FROM caso 
    WHERE tipo_tramite NOT IN (
    'Asilo Afirmativo',
    'Asilo Defensivo', 
    'Cambio de Estatus (COS)',
    'E-1 Comerciante',
    'E-2 Inversionista',
    'EB-2 NIW',
    'H1B1 Consular',
    'H1B1 Extensión',
    'L-1 Transferencia',
    'Peticiones Familiares'
    );

    -- Now let's create sample cases for each process type (assuming we have at least one client)
    -- First, get the first available client ID
    DO $$
    DECLARE
        primer_cliente_id INT;
        nuevo_caso_id INT;
    BEGIN
        -- Get first client ID
        SELECT cliente_id INTO primer_cliente_id FROM cliente ORDER BY cliente_id LIMIT 1;
        
        -- If no clients exist, create a sample one
        IF primer_cliente_id IS NULL THEN
            INSERT INTO cliente (nombre, apellido, email, telefono, canal_ingreso, created_by)
            VALUES ('Sample', 'Client', 'sample@example.com', '555-0123', 'Web', 1)
            RETURNING cliente_id INTO primer_cliente_id;
        END IF;
        
        -- Create sample cases for each process type if they don't exist
        INSERT INTO caso (cliente_id, tipo_tramite, estado, fecha_creacion)
        SELECT 
            primer_cliente_id,
            proceso_nombre,
            'PENDIENTE',
            CURRENT_DATE
        FROM procesos_correctos
        WHERE proceso_nombre NOT IN (
            SELECT DISTINCT tipo_tramite FROM caso WHERE cliente_id = primer_cliente_id
        );
        
    END $$;

    -- Now populate documents for each case based on process type
    -- This will create the required documents for each case

    -- Asilo Afirmativo documents
    INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
    SELECT 
        c.caso_id,
        unnest(ARRAY[
            'I-589',
            'Declaración personal',
            'Pasaporte',
            'Evidencia persecución',
            'Documentos entrada a EE.UU.',
            'Cartas de apoyo',
            'Informes de país'
        ]),
        NULL, -- fecha_enviado (not sent yet)
        NULL, -- fecha_recibido (not received yet)
        false
    FROM caso c 
    WHERE c.tipo_tramite = 'Asilo Afirmativo'
    ON CONFLICT DO NOTHING;

    -- Asilo Defensivo documents
    INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
    SELECT 
        c.caso_id,
        unnest(ARRAY[
            'I-589',
            'Declaración personal',
            'Pasaporte',
            'Evidencia persecución',
            'I-94',
            'Informes de país',
            'Cartas de testigos'
        ]),
        NULL,
        NULL,
        false
    FROM caso c 
    WHERE c.tipo_tramite = 'Asilo Defensivo'
    ON CONFLICT DO NOTHING;

    -- Cambio de Estatus (COS) documents
    INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
    SELECT 
        c.caso_id,
        unnest(ARRAY[
            'I-539',
            'Pasaporte',
            'Visa actual',
            'I-94',
            'Carta de motivos personales',
            'Prueba de fondos',
            'Prueba de estatus legal',
            'Carta aceptación escuela'
        ]),
        NULL,
        NULL,
        false
    FROM caso c 
    WHERE c.tipo_tramite = 'Cambio de Estatus (COS)'
    ON CONFLICT DO NOTHING;

    -- E-1 Comerciante documents
    INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
    SELECT 
        c.caso_id,
        unnest(ARRAY[
            'DS-160',
            'I-129 (suplemento E)',
            'Pasaporte',
            'Nacionalidad tratado',
            'Documentación comercio',
            'Contratos/facturas/shipping docs',
            'Evidencia operaciones regulares'
        ]),
        NULL,
        NULL,
        false
    FROM caso c 
    WHERE c.tipo_tramite = 'E-1 Comerciante'
    ON CONFLICT DO NOTHING;

    -- E-2 Inversionista documents
    INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
    SELECT 
        c.caso_id,
        unnest(ARRAY[
            'DS-160',
            'I-129 (suplemento E)',
            'Pasaporte',
            'Nacionalidad tratado',
            'Evidencia inversión',
            'Plan de negocios',
            'Prueba negocio activo'
        ]),
        NULL,
        NULL,
        false
    FROM caso c 
    WHERE c.tipo_tramite = 'E-2 Inversionista'
    ON CONFLICT DO NOTHING;

    -- EB-2 NIW documents
    INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
    SELECT 
        c.caso_id,
        unnest(ARRAY[
            'I-140',
            'Declaración Personal',
            'Títulos académicos',
            'Equivalencia Títulos',
            'Experiencia laboral',
            'Cartas recomendación',
            'Cartas de interés',
            'Plan impacto nacional',
            'Pasaporte',
            'Pruebas estatus legal'
        ]),
        NULL,
        NULL,
        false
    FROM caso c 
    WHERE c.tipo_tramite = 'EB-2 NIW'
    ON CONFLICT DO NOTHING;

    -- H1B1 Consular documents
    INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
    SELECT 
        c.caso_id,
        unnest(ARRAY[
            'DS-160',
            'Oferta laboral',
            'Título universitario/equivalencia',
            'Pasaporte',
            'LCA aprobado',
            'Arraigo',
            'Carta empleador'
        ]),
        NULL,
        NULL,
        false
    FROM caso c 
    WHERE c.tipo_tramite = 'H1B1 Consular'
    ON CONFLICT DO NOTHING;

    -- H1B1 Extensión documents
    INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
    SELECT 
        c.caso_id,
        unnest(ARRAY[
            'I-129',
            'I-539',
            'Carta de empleo vigente',
            'Contratos/nóminas',
            'Título universitario',
            'Pasaporte',
            'Prueba de estatus legal',
            'LCA vigente',
            'LCA aprobado'
        ]),
        NULL,
        NULL,
        false
    FROM caso c 
    WHERE c.tipo_tramite = 'H1B1 Extensión'
    ON CONFLICT DO NOTHING;

    -- L-1 Transferencia documents
    INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
    SELECT 
        c.caso_id,
        unnest(ARRAY[
            'I-129 (suplemento L)',
            'DS-160',
            'Plan de negocios',
            'Carta transferencia',
            'Organigrama',
            'Evidencia relación empresas',
            'Comprobante empleo extranjero',
            'Pasaporte'
        ]),
        NULL,
        NULL,
        false
    FROM caso c 
    WHERE c.tipo_tramite = 'L-1 Transferencia'
    ON CONFLICT DO NOTHING;

    -- Peticiones Familiares documents
    INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
    SELECT 
        c.caso_id,
        unnest(ARRAY[
            'I-130',
            'I-485',
            'I-864',
            'I-765',
            'I-693',
            'Certificado matrimonio',
            'Certificado nacimiento',
            'Pasaporte beneficiario',
            'Pasaporte solicitante',
            'Visa',
            'I-94',
            'Evidencia relación genuina',
            'Declaraciones de impuestos',
            'Prueba de ingresos patrocinador'
        ]),
        NULL,
        NULL,
        false
    FROM caso c 
    WHERE c.tipo_tramite = 'Peticiones Familiares'
    ON CONFLICT DO NOTHING;

    -- Add some sample documents with different statuses for demonstration
    -- Mark some documents as sent (fecha_enviado)
    UPDATE documento 
    SET fecha_enviado = CURRENT_DATE - INTERVAL '5 days'
    WHERE documento_id IN (
        SELECT documento_id 
        FROM documento 
        ORDER BY RANDOM() 
        LIMIT (SELECT COUNT(*) * 0.6 FROM documento)::INT
    );

    -- Mark some documents as received (fecha_recibido) - only those that were sent
    UPDATE documento 
    SET fecha_recibido = fecha_enviado + INTERVAL '2 days'
    WHERE fecha_enviado IS NOT NULL 
    AND documento_id IN (
        SELECT documento_id 
        FROM documento 
        WHERE fecha_enviado IS NOT NULL
        ORDER BY RANDOM() 
        LIMIT (SELECT COUNT(*) * 0.4 FROM documento WHERE fecha_enviado IS NOT NULL)::INT
    );

    -- Show summary of what was created
    SELECT 
        'Summary of populated data:' as info,
        (SELECT COUNT(*) FROM caso) as total_cases,
        (SELECT COUNT(*) FROM documento) as total_documents,
        (SELECT COUNT(*) FROM documento WHERE fecha_recibido IS NOT NULL) as completed_documents,
        (SELECT COUNT(*) FROM documento WHERE fecha_enviado IS NOT NULL AND fecha_recibido IS NULL) as in_review_documents,
        (SELECT COUNT(*) FROM documento WHERE fecha_enviado IS NULL) as pending_documents;

COMMIT;

BEGIN;
-- Script to populate sample data with correct processes and documents

-- Step 1: Clean up existing data to ensure consistency
DELETE FROM documento WHERE caso_id IN (
  SELECT caso_id FROM caso WHERE tipo_tramite NOT IN (
    'Asilo Afirmativo',
    'Asilo Defensivo', 
    'Cambio de Estatus (COS)',
    'E-1 Comerciante',
    'E-2 Inversionista',
    'EB-2 NIW',
    'H1B1 Consular',
    'H1B1 Extensión',
    'L-1 Transferencia',
    'Peticiones Familiares'
  )
);

DELETE FROM caso WHERE tipo_tramite NOT IN (
  'Asilo Afirmativo',
  'Asilo Defensivo', 
  'Cambio de Estatus (COS)',
  'E-1 Comerciante',
  'E-2 Inversionista',
  'EB-2 NIW',
  'H1B1 Consular',
  'H1B1 Extensión',
  'L-1 Transferencia',
  'Peticiones Familiares'
);

-- Step 2: Create sample clients if none exist
INSERT INTO cliente (nombre, apellido, email, telefono, canal_ingreso, created_by)
SELECT 
    nombres.nombre,
    apellidos.apellido,
    LOWER(nombres.nombre) || '.' || LOWER(apellidos.apellido) || '@example.com',
    '555-0' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    canales.canal,
    1 -- Assuming user ID 1 exists
FROM 
    (VALUES 
        ('María'), ('José'), ('Ana'), ('Carlos'), ('Elena'), 
        ('Miguel'), ('Carmen'), ('Antonio'), ('Isabel'), ('Francisco')
    ) AS nombres(nombre)
CROSS JOIN 
    (VALUES 
        ('García'), ('Rodríguez'), ('López'), ('Martínez'), ('González')
    ) AS apellidos(apellido)
CROSS JOIN
    (VALUES 
        ('Web'), ('Referral'), ('Social Media'), ('Phone')
    ) AS canales(canal)
LIMIT 20
ON CONFLICT (email) DO NOTHING;

-- Step 3: Create sample cases for each process type
DO $$
DECLARE
    cliente_record RECORD;
    proceso TEXT;
    procesos TEXT[] := ARRAY[
        'Asilo Afirmativo',
        'Asilo Defensivo', 
        'Cambio de Estatus (COS)',
        'E-1 Comerciante',
        'E-2 Inversionista',
        'EB-2 NIW',
        'H1B1 Consular',
        'H1B1 Extensión',
        'L-1 Transferencia',
        'Peticiones Familiares'
    ];
    estados TEXT[] := ARRAY['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'];
    nuevo_caso_id INT;
BEGIN
    -- Create cases for first 10 clients, one process per client
    FOR cliente_record IN 
        SELECT cliente_id, nombre, apellido 
        FROM cliente 
        ORDER BY cliente_id 
        LIMIT 10
    LOOP
        -- Get a process for this client (cycling through processes)
        proceso := procesos[((cliente_record.cliente_id - 1) % array_length(procesos, 1)) + 1];
        
        -- Create case if it doesn't exist
        INSERT INTO caso (cliente_id, tipo_tramite, estado, fecha_creacion)
        VALUES (
            cliente_record.cliente_id,
            proceso,
            estados[((cliente_record.cliente_id - 1) % array_length(estados, 1)) + 1],
            CURRENT_DATE - INTERVAL '30 days' * RANDOM()
        )
        ON CONFLICT DO NOTHING
        RETURNING caso_id INTO nuevo_caso_id;
        
        RAISE NOTICE 'Created case % for client % % with process %', 
                     nuevo_caso_id, cliente_record.nombre, cliente_record.apellido, proceso;
    END LOOP;
END $$;

-- Step 4: Now populate documents for each case based on their process type
-- This uses the same document lists as in your text file

-- Asilo Afirmativo documents
INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
SELECT 
    c.caso_id,
    documentos.doc_name,
    CASE 
        WHEN RANDOM() > 0.7 THEN NULL -- 30% not sent yet
        ELSE CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 30)::INT
    END,
    NULL, -- Will be set later for some documents
    false
FROM caso c 
CROSS JOIN (
    VALUES 
        ('I-589'),
        ('Declaración personal'),
        ('Pasaporte'),
        ('Evidencia persecución'),
        ('Documentos entrada a EE.UU.'),
        ('Cartas de apoyo'),
        ('Informes de país')
) AS documentos(doc_name)
WHERE c.tipo_tramite = 'Asilo Afirmativo'
ON CONFLICT DO NOTHING;

-- Asilo Defensivo documents
INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
SELECT 
    c.caso_id,
    documentos.doc_name,
    CASE 
        WHEN RANDOM() > 0.7 THEN NULL
        ELSE CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 30)::INT
    END,
    NULL,
    false
FROM caso c 
CROSS JOIN (
    VALUES 
        ('I-589'),
        ('Declaración personal'),
        ('Pasaporte'),
        ('Evidencia persecución'),
        ('I-94'),
        ('Informes de país'),
        ('Cartas de testigos')
) AS documentos(doc_name)
WHERE c.tipo_tramite = 'Asilo Defensivo'
ON CONFLICT DO NOTHING;

-- Cambio de Estatus (COS) documents
INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
SELECT 
    c.caso_id,
    documentos.doc_name,
    CASE 
        WHEN RANDOM() > 0.7 THEN NULL
        ELSE CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 30)::INT
    END,
    NULL,
    false
FROM caso c 
CROSS JOIN (
    VALUES 
        ('I-539'),
        ('Pasaporte'),
        ('Visa actual'),
        ('I-94'),
        ('Carta de motivos personales'),
        ('Prueba de fondos'),
        ('Prueba de estatus legal'),
        ('Carta aceptación escuela')
) AS documentos(doc_name)
WHERE c.tipo_tramite = 'Cambio de Estatus (COS)'
ON CONFLICT DO NOTHING;

-- E-1 Comerciante documents
INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
SELECT 
    c.caso_id,
    documentos.doc_name,
    CASE 
        WHEN RANDOM() > 0.7 THEN NULL
        ELSE CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 30)::INT
    END,
    NULL,
    false
FROM caso c 
CROSS JOIN (
    VALUES 
        ('DS-160'),
        ('I-129 (suplemento E)'),
        ('Pasaporte'),
        ('Nacionalidad tratado'),
        ('Documentación comercio'),
        ('Contratos/facturas/shipping docs'),
        ('Evidencia operaciones regulares')
) AS documentos(doc_name)
WHERE c.tipo_tramite = 'E-1 Comerciante'
ON CONFLICT DO NOTHING;

-- E-2 Inversionista documents
INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
SELECT 
    c.caso_id,
    documentos.doc_name,
    CASE 
        WHEN RANDOM() > 0.7 THEN NULL
        ELSE CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 30)::INT
    END,
    NULL,
    false
FROM caso c 
CROSS JOIN (
    VALUES 
        ('DS-160'),
        ('I-129 (suplemento E)'),
        ('Pasaporte'),
        ('Nacionalidad tratado'),
        ('Evidencia inversión'),
        ('Plan de negocios'),
        ('Prueba negocio activo')
) AS documentos(doc_name)
WHERE c.tipo_tramite = 'E-2 Inversionista'
ON CONFLICT DO NOTHING;

-- EB-2 NIW documents  
INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
SELECT 
    c.caso_id,
    documentos.doc_name,
    CASE 
        WHEN RANDOM() > 0.7 THEN NULL
        ELSE CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 30)::INT
    END,
    NULL,
    false
FROM caso c 
CROSS JOIN (
    VALUES 
        ('I-140'),
        ('Declaración Personal'),
        ('Títulos académicos'),
        ('Equivalencia Títulos'),
        ('Experiencia laboral'),
        ('Cartas recomendación'),
        ('Cartas de interés'),
        ('Plan impacto nacional'),
        ('Pasaporte'),
        ('Pruebas estatus legal')
) AS documentos(doc_name)
WHERE c.tipo_tramite = 'EB-2 NIW'
ON CONFLICT DO NOTHING;

-- H1B1 Consular documents
INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
SELECT 
    c.caso_id,
    documentos.doc_name,
    CASE 
        WHEN RANDOM() > 0.7 THEN NULL
        ELSE CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 30)::INT
    END,
    NULL,
    false
FROM caso c 
CROSS JOIN (
    VALUES 
        ('DS-160'),
        ('Oferta laboral'),
        ('Título universitario/equivalencia'),
        ('Pasaporte'),
        ('LCA aprobado'),
        ('Arraigo'),
        ('Carta empleador')
) AS documentos(doc_name)
WHERE c.tipo_tramite = 'H1B1 Consular'
ON CONFLICT DO NOTHING;

-- H1B1 Extensión documents
INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
SELECT 
    c.caso_id,
    documentos.doc_name,
    CASE 
        WHEN RANDOM() > 0.7 THEN NULL
        ELSE CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 30)::INT
    END,
    NULL,
    false
FROM caso c 
CROSS JOIN (
    VALUES 
        ('I-129'),
        ('I-539'),
        ('Carta de empleo vigente'),
        ('Contratos/nóminas'),
        ('Título universitario'),
        ('Pasaporte'),
        ('Prueba de estatus legal'),
        ('LCA vigente'),
        ('LCA aprobado')
) AS documentos(doc_name)
WHERE c.tipo_tramite = 'H1B1 Extensión'
ON CONFLICT DO NOTHING;

-- L-1 Transferencia documents
INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
SELECT 
    c.caso_id,
    documentos.doc_name,
    CASE 
        WHEN RANDOM() > 0.7 THEN NULL
        ELSE CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 30)::INT
    END,
    NULL,
    false
FROM caso c 
CROSS JOIN (
    VALUES 
        ('I-129 (suplemento L)'),
        ('DS-160'),
        ('Plan de negocios'),
        ('Carta transferencia'),
        ('Organigrama'),
        ('Evidencia relación empresas'),
        ('Comprobante empleo extranjero'),
        ('Pasaporte')
) AS documentos(doc_name)
WHERE c.tipo_tramite = 'L-1 Transferencia'
ON CONFLICT DO NOTHING;

-- Peticiones Familiares documents
INSERT INTO documento (caso_id, tipo, fecha_enviado, fecha_recibido, firma_digital)
SELECT 
    c.caso_id,
    documentos.doc_name,
    CASE 
        WHEN RANDOM() > 0.7 THEN NULL
        ELSE CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 30)::INT
    END,
    NULL,
    false
FROM caso c 
CROSS JOIN (
    VALUES 
        ('I-130'),
        ('I-485'),
        ('I-864'),
        ('I-765'),
        ('I-693'),
        ('Certificado matrimonio'),
        ('Certificado nacimiento'),
        ('Pasaporte beneficiario'),
        ('Pasaporte solicitante'),
        ('Visa'),
        ('I-94'),
        ('Evidencia relación genuina'),
        ('Declaraciones de impuestos'),
        ('Prueba de ingresos patrocinador')
) AS documentos(doc_name)
WHERE c.tipo_tramite = 'Peticiones Familiares'
ON CONFLICT DO NOTHING;

-- Step 5: Mark some documents as received (only those that were sent)
UPDATE documento 
SET fecha_recibido = fecha_enviado + INTERVAL '1 day' * (1 + RANDOM() * 5)::INT
WHERE fecha_enviado IS NOT NULL 
AND documento_id IN (
    SELECT documento_id 
    FROM documento 
    WHERE fecha_enviado IS NOT NULL
    ORDER BY RANDOM() 
    LIMIT (SELECT COUNT(*) * 0.5 FROM documento WHERE fecha_enviado IS NOT NULL)::INT
);

-- Step 6: Create some additional older documents for demonstration
UPDATE documento 
SET fecha_enviado = CURRENT_DATE - INTERVAL '1 day' * (30 + RANDOM() * 30)::INT
WHERE fecha_enviado IS NULL 
AND documento_id IN (
    SELECT documento_id 
    FROM documento 
    WHERE fecha_enviado IS NULL
    ORDER BY RANDOM() 
    LIMIT (SELECT COUNT(*) * 0.4 FROM documento WHERE fecha_enviado IS NULL)::INT
);

-- Step 7: Show final summary
SELECT 
    'DATABASE POPULATION COMPLETE' as status,
    (SELECT COUNT(*) FROM cliente WHERE created_by = 1) as total_clients,
    (SELECT COUNT(*) FROM caso) as total_cases,
    (SELECT COUNT(*) FROM documento) as total_documents,
    (SELECT COUNT(DISTINCT tipo_tramite) FROM caso) as unique_processes,
    (SELECT COUNT(*) FROM documento WHERE fecha_recibido IS NOT NULL) as completed_docs,
    (SELECT COUNT(*) FROM documento WHERE fecha_enviado IS NOT NULL AND fecha_recibido IS NULL) as in_review_docs,
    (SELECT COUNT(*) FROM documento WHERE fecha_enviado IS NULL) as pending_docs;

-- Step 8: Show breakdown by process
SELECT 
    c.tipo_tramite,
    COUNT(c.caso_id) as casos,
    COUNT(d.documento_id) as documentos_totales,
    COUNT(CASE WHEN d.fecha_recibido IS NOT NULL THEN 1 END) as documentos_completados,
    COUNT(CASE WHEN d.fecha_enviado IS NOT NULL AND d.fecha_recibido IS NULL THEN 1 END) as documentos_en_revision,
    COUNT(CASE WHEN d.fecha_enviado IS NULL THEN 1 END) as documentos_pendientes
FROM caso c
LEFT JOIN documento d ON c.caso_id = d.caso_id
GROUP BY c.tipo_tramite
ORDER BY c.tipo_tramite;

-- Step 9: Verify data integrity
SELECT 
    'Data Integrity Check' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM caso 
            WHERE tipo_tramite NOT IN (
                'Asilo Afirmativo','Asilo Defensivo','Cambio de Estatus (COS)',
                'E-1 Comerciante','E-2 Inversionista','EB-2 NIW',
                'H1B1 Consular','H1B1 Extensión','L-1 Transferencia','Peticiones Familiares'
            )
        ) 
        THEN 'FAILED - Invalid processes found'
        ELSE 'PASSED - All processes are valid'
    END as result;
COMMIT;
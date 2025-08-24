-- CreateTable
CREATE TABLE "public"."caso" (
    "caso_id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "tipo_tramite" VARCHAR(100) NOT NULL,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    "fecha_creacion" DATE NOT NULL DEFAULT CURRENT_DATE,
    "fecha_aprobacion" DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caso_pkey" PRIMARY KEY ("caso_id")
);

-- CreateTable
CREATE TABLE "public"."cliente" (
    "cliente_id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),
    "canal_ingreso" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("cliente_id")
);

-- CreateTable
CREATE TABLE "public"."contrato" (
    "contrato_id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "detalles" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contrato_pkey" PRIMARY KEY ("contrato_id")
);

-- CreateTable
CREATE TABLE "public"."documento" (
    "documento_id" SERIAL NOT NULL,
    "caso_id" INTEGER NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "fecha_recibido" DATE,
    "fecha_enviado" DATE,
    "firma_digital" BOOLEAN DEFAULT false,
    "url_documento" VARCHAR(500),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_pkey" PRIMARY KEY ("documento_id")
);

-- CreateTable
CREATE TABLE "public"."historialaccion" (
    "accion_id" SERIAL NOT NULL,
    "caso_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo_comunicacion" VARCHAR(100) NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_DATE,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historialaccion_pkey" PRIMARY KEY ("accion_id")
);

-- CreateTable
CREATE TABLE "public"."pago" (
    "pago_id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha_pago" DATE NOT NULL,
    "metodo" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("pago_id")
);

-- CreateTable
CREATE TABLE "public"."usuariointerno" (
    "usuario_id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "rol" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "contraseña" VARCHAR(255) NOT NULL,

    CONSTRAINT "usuariointerno_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateIndex
CREATE INDEX "idx_caso_cliente" ON "public"."caso"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_caso_estado" ON "public"."caso"("estado");

-- CreateIndex
CREATE INDEX "idx_caso_tipo" ON "public"."caso"("tipo_tramite");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "public"."cliente"("email");

-- CreateIndex
CREATE INDEX "idx_cliente_email" ON "public"."cliente"("email");

-- CreateIndex
CREATE INDEX "idx_cliente_nombre_apellido" ON "public"."cliente"("nombre", "apellido");

-- CreateIndex
CREATE INDEX "idx_contrato_cliente" ON "public"."contrato"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_contrato_fechas" ON "public"."contrato"("fecha_inicio", "fecha_fin");

-- CreateIndex
CREATE INDEX "idx_documento_caso" ON "public"."documento"("caso_id");

-- CreateIndex
CREATE INDEX "idx_documento_tipo" ON "public"."documento"("tipo");

-- CreateIndex
CREATE INDEX "idx_historial_caso" ON "public"."historialaccion"("caso_id");

-- CreateIndex
CREATE INDEX "idx_historial_fecha" ON "public"."historialaccion"("fecha");

-- CreateIndex
CREATE INDEX "idx_historial_usuario" ON "public"."historialaccion"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_pago_cliente" ON "public"."pago"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_pago_fecha" ON "public"."pago"("fecha_pago");

-- CreateIndex
CREATE UNIQUE INDEX "usuariointerno_email_key" ON "public"."usuariointerno"("email");

-- AddForeignKey
ALTER TABLE "public"."caso" ADD CONSTRAINT "fk_caso_cliente" FOREIGN KEY ("cliente_id") REFERENCES "public"."cliente"("cliente_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contrato" ADD CONSTRAINT "fk_contrato_cliente" FOREIGN KEY ("cliente_id") REFERENCES "public"."cliente"("cliente_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documento" ADD CONSTRAINT "fk_documento_caso" FOREIGN KEY ("caso_id") REFERENCES "public"."caso"("caso_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historialaccion" ADD CONSTRAINT "fk_historial_caso" FOREIGN KEY ("caso_id") REFERENCES "public"."caso"("caso_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historialaccion" ADD CONSTRAINT "fk_historial_usuario" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuariointerno"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pago" ADD CONSTRAINT "fk_pago_cliente" FOREIGN KEY ("cliente_id") REFERENCES "public"."cliente"("cliente_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- ESQUEMA SQL PARA SUPABASE (POSTGRESQL) - SISTEMA AGEMED (EsSalud Digital)
-- ============================================================================

-- Habilitar extensión para generación de UUIDs (incorporado en Supabase por defecto)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ELIMINACIÓN DE OBJETOS PREEXISTENTES (Idempotencia)
-- ============================================================================
DROP TABLE IF EXISTS ChatMessage CASCADE;
DROP TABLE IF EXISTS ParkingValidation CASCADE;
DROP TABLE IF EXISTS PatientSettings CASCADE;
DROP TABLE IF EXISTS PushNotification CASCADE;
DROP TABLE IF EXISTS Invoice CASCADE;
DROP TABLE IF EXISTS ResultMetric CASCADE;
DROP TABLE IF EXISTS DiagnosticResult CASCADE;
DROP TABLE IF EXISTS PrescriptionMedicine CASCADE;
DROP TABLE IF EXISTS Prescription CASCADE;
DROP TABLE IF EXISTS PreparationItem CASCADE;
DROP TABLE IF EXISTS Appointment CASCADE;
DROP TABLE IF EXISTS Doctor CASCADE;
DROP TABLE IF EXISTS Patient CASCADE;
DROP TABLE IF EXISTS Specialty CASCADE;

DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS message_sender CASCADE;

-- ============================================================================
-- 2. DEFINICIÓN DE TIPOS ENUM PERSONALIZADOS
-- ============================================================================
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('medicamento', 'cita', 'seguimiento');
CREATE TYPE message_sender AS ENUM ('assistant', 'user');

-- ============================================================================
-- 3. FUNCIÓN AUXILIAR PARA AUDITORÍA (updated_at)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. CREACIÓN DE TABLAS (Ordenado por dependencias)
-- ============================================================================

-- 4.1 Specialty (Especialidad Médica)
CREATE TABLE Specialty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_key VARCHAR(50),
    color_class VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE Specialty IS 'Catálogo de especialidades médicas disponibles en la plataforma AGEMED.';
COMMENT ON COLUMN Specialty.id IS 'Identificador único de la especialidad (UUID).';
COMMENT ON COLUMN Specialty.slug IS 'Slug único legible para la especialidad (ej. cardiologia, pediatria).';
COMMENT ON COLUMN Specialty.name IS 'Nombre legible de la especialidad.';
COMMENT ON COLUMN Specialty.description IS 'Descripción detallada de la especialidad.';
COMMENT ON COLUMN Specialty.icon_key IS 'Identificador del icono a renderizar en el frontend.';
COMMENT ON COLUMN Specialty.color_class IS 'Clase de estilo CSS o Tailwind asignada al elemento de UI.';
COMMENT ON COLUMN Specialty.is_active IS 'Indica si la especialidad está activa para reservas.';
COMMENT ON COLUMN Specialty.created_at IS 'Fecha y hora de creación del registro (Auditoría).';
COMMENT ON COLUMN Specialty.updated_at IS 'Fecha y hora de la última actualización del registro (Auditoría).';


-- 4.2 Patient (Paciente / Asegurado)
CREATE TABLE Patient (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dni_encrypted TEXT NOT NULL,
    dni_iv VARCHAR(24) NOT NULL,
    dni_salt VARCHAR(32) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    blood_type_encrypted TEXT,
    blood_type_iv VARCHAR(24),
    blood_type_salt VARCHAR(32),
    emergency_contact_name VARCHAR(150),
    emergency_phone_encrypted TEXT,
    emergency_phone_iv VARCHAR(24),
    emergency_phone_salt VARCHAR(32),
    registered_center VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE Patient IS 'Datos de los pacientes/asegurados de EsSalud registrados en AGEMED.';
COMMENT ON COLUMN Patient.id IS 'Identificador único del paciente (UUID).';
COMMENT ON COLUMN Patient.dni_encrypted IS 'DNI del paciente cifrado en el lado del cliente (AES-GCM).';
COMMENT ON COLUMN Patient.dni_iv IS 'Vector de Inicialización (IV) para el DNI cifrado.';
COMMENT ON COLUMN Patient.dni_salt IS 'Salt de derivación PBKDF2 para el DNI.';
COMMENT ON COLUMN Patient.email IS 'Correo electrónico único utilizado para login y envío de alertas.';
COMMENT ON COLUMN Patient.password_hash IS 'Hash Bcrypt/Argon2 seguro de la contraseña para validación backend.';
COMMENT ON COLUMN Patient.full_name IS 'Nombre completo no sensible para visualización rápida en UI.';
COMMENT ON COLUMN Patient.blood_type_encrypted IS 'Tipo de sangre cifrado del paciente.';
COMMENT ON COLUMN Patient.emergency_contact_name IS 'Nombre completo del contacto de emergencia designado.';
COMMENT ON COLUMN Patient.emergency_phone_encrypted IS 'Teléfono del contacto de emergencia cifrado.';
COMMENT ON COLUMN Patient.registered_center IS 'Centro asistencial de EsSalud asignado por defecto (ej. Sede Centro).';


-- 4.3 Doctor (Médico Especialista)
CREATE TABLE Doctor (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    specialty_id UUID REFERENCES Specialty(id) ON DELETE SET NULL,
    rating DECIMAL(3,2) CHECK (rating >= 0.00 AND rating <= 5.00),
    image_url VARCHAR(2048),
    description TEXT,
    location_office VARCHAR(150),
    sede VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE Doctor IS 'Médicos especialistas disponibles para agendamiento de citas.';
COMMENT ON COLUMN Doctor.id IS 'Identificador único del médico (UUID).';
COMMENT ON COLUMN Doctor.name IS 'Nombre completo del médico especialista.';
COMMENT ON COLUMN Doctor.specialty_id IS 'Relación con la especialidad médica del doctor.';
COMMENT ON COLUMN Doctor.rating IS 'Calificación promedio otorgada por pacientes (0.00 - 5.00).';
COMMENT ON COLUMN Doctor.image_url IS 'Ruta de la foto de perfil del médico.';
COMMENT ON COLUMN Doctor.description IS 'Descripción profesional o currículum breve del médico.';
COMMENT ON COLUMN Doctor.location_office IS 'Identificación del consultorio físico (ej. Consultorio 402).';
COMMENT ON COLUMN Doctor.sede IS 'Nombre de la sede física de atención (ej. Sede Centro, Clínica San Lucas).';
COMMENT ON COLUMN Doctor.is_active IS 'Estado del médico dentro de la aplicación.';


-- 4.4 Appointment (Cita Médica)
CREATE TABLE Appointment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES Patient(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES Doctor(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(10) NOT NULL,
    status appointment_status DEFAULT 'scheduled' NOT NULL,
    consultation_reason TEXT,
    symptoms TEXT,
    symptoms_duration VARCHAR(50),
    destination_location VARCHAR(255),
    location_details VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE Appointment IS 'Citas médicas reservadas por los pacientes.';
COMMENT ON COLUMN Appointment.id IS 'Identificador único de la cita (UUID).';
COMMENT ON COLUMN Appointment.patient_id IS 'Relación con el paciente solicitante.';
COMMENT ON COLUMN Appointment.doctor_id IS 'Relación con el médico asignado.';
COMMENT ON COLUMN Appointment.date IS 'Fecha programada de la consulta.';
COMMENT ON COLUMN Appointment.time_slot IS 'Bloque de horario seleccionado (ej. 10:30 AM).';
COMMENT ON COLUMN Appointment.status IS 'Estado de la cita: scheduled, completed, cancelled.';
COMMENT ON COLUMN Appointment.consultation_reason IS 'Motivo de consulta redactado por el paciente.';
COMMENT ON COLUMN Appointment.symptoms IS 'Síntomas actuales reportados por el paciente.';
COMMENT ON COLUMN Appointment.symptoms_duration IS 'Duración aproximada de los síntomas (ej. Hoy, 2-3 días, Una semana).';
COMMENT ON COLUMN Appointment.destination_location IS 'Sede física principal para la atención (ej. Hospital San Rafael).';
COMMENT ON COLUMN Appointment.location_details IS 'Detalles específicos de la ubicación física (ej. Torre A, Piso 3).';


-- 4.5 PreparationItem (Chequeo de Preparación de Cita)
CREATE TABLE PreparationItem (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES Appointment(id) ON DELETE CASCADE NOT NULL,
    label VARCHAR(255) NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE PreparationItem IS 'Checklist de preparación obligatoria para el paciente previo a una cita.';
COMMENT ON COLUMN PreparationItem.id IS 'Identificador único del ítem de preparación (UUID).';
COMMENT ON COLUMN PreparationItem.appointment_id IS 'Relación con la cita médica asociada.';
COMMENT ON COLUMN PreparationItem.label IS 'Descripción de la indicación (ej. Ayuno de 8 horas).';
COMMENT ON COLUMN PreparationItem.is_checked IS 'Estado de marcado/desmarcado completado por el paciente en la UI.';


-- 4.6 Prescription (Receta Médica Digital)
CREATE TABLE Prescription (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES Patient(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES Doctor(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255),
    notes_encrypted TEXT,
    notes_iv VARCHAR(24),
    notes_salt VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE Prescription IS 'Recetas médicas digitales emitidas tras una cita completada.';
COMMENT ON COLUMN Prescription.id IS 'Identificador único de la receta (UUID).';
COMMENT ON COLUMN Prescription.patient_id IS 'Relación con el paciente.';
COMMENT ON COLUMN Prescription.doctor_id IS 'Relación con el médico emisor.';
COMMENT ON COLUMN Prescription.date IS 'Fecha de emisión de la receta.';
COMMENT ON COLUMN Prescription.location IS 'Centro asistencial donde se emitió la receta.';
COMMENT ON COLUMN Prescription.notes_encrypted IS 'Instrucciones generales del facultativo encriptadas.';


-- 4.7 PrescriptionMedicine (Medicamento de la Receta)
CREATE TABLE PrescriptionMedicine (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID REFERENCES Prescription(id) ON DELETE CASCADE NOT NULL,
    medicine_details_encrypted TEXT NOT NULL,
    medicine_details_iv VARCHAR(24) NOT NULL,
    medicine_details_salt VARCHAR(32) NOT NULL,
    frequency VARCHAR(150),
    duration VARCHAR(50),
    is_checked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE PrescriptionMedicine IS 'Detalle de los medicamentos prescritos en una receta digital.';
COMMENT ON COLUMN PrescriptionMedicine.id IS 'Identificador del medicamento prescrito (UUID).';
COMMENT ON COLUMN PrescriptionMedicine.prescription_id IS 'Relación con la receta digital contenedora.';
COMMENT ON COLUMN PrescriptionMedicine.medicine_details_encrypted IS 'Nombre y dosificación del medicamento encriptados (ej: Atorvastatina 20mg).';
COMMENT ON COLUMN PrescriptionMedicine.frequency IS 'Frecuencia de toma del medicamento (texto plano, ej. Cada 12 horas).';
COMMENT ON COLUMN PrescriptionMedicine.duration IS 'Duración del tratamiento prescrito (ej. 7 días).';
COMMENT ON COLUMN PrescriptionMedicine.is_checked IS 'Estado de toma marcado por el paciente en la UI para monitoreo diario.';


-- 4.8 DiagnosticResult (Examen / Informe de Laboratorio)
CREATE TABLE DiagnosticResult (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES Patient(id) ON DELETE CASCADE NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    specialty_id UUID REFERENCES Specialty(id) ON DELETE SET NULL,
    doctor_name VARCHAR(150),
    status VARCHAR(50),
    notes_encrypted TEXT,
    notes_iv VARCHAR(24),
    notes_salt VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE DiagnosticResult IS 'Informes y exámenes de laboratorio firmados digitalmente.';
COMMENT ON COLUMN DiagnosticResult.id IS 'Identificador único del resultado del examen (UUID).';
COMMENT ON COLUMN DiagnosticResult.patient_id IS 'Relación con el paciente.';
COMMENT ON COLUMN DiagnosticResult.test_name IS 'Nombre descriptivo del examen (ej. Perfil Lipídico Completo).';
COMMENT ON COLUMN DiagnosticResult.date IS 'Fecha de la realización del examen de laboratorio.';
COMMENT ON COLUMN DiagnosticResult.specialty_id IS 'Relación con la especialidad médica que solicitó el examen.';
COMMENT ON COLUMN DiagnosticResult.doctor_name IS 'Médico firmante responsable del laboratorio.';
COMMENT ON COLUMN DiagnosticResult.status IS 'Estado del informe (ej. Verificado, Normal, Alerta).';
COMMENT ON COLUMN DiagnosticResult.notes_encrypted IS 'Comentarios y diagnóstico general del laboratorio encriptados.';


-- 4.9 ResultMetric (Métrica Analizada del Examen)
CREATE TABLE ResultMetric (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    result_id UUID REFERENCES DiagnosticResult(id) ON DELETE CASCADE NOT NULL,
    metric_name VARCHAR(150) NOT NULL,
    value_encrypted VARCHAR NOT NULL,
    value_iv VARCHAR(24) NOT NULL,
    value_salt VARCHAR(32) NOT NULL,
    normal_range VARCHAR(100),
    has_alert BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE ResultMetric IS 'Métricas e indicadores individuales pertenecientes a un resultado de laboratorio.';
COMMENT ON COLUMN ResultMetric.id IS 'Identificador único de la métrica (UUID).';
COMMENT ON COLUMN ResultMetric.result_id IS 'Relación con el examen de diagnóstico general.';
COMMENT ON COLUMN ResultMetric.metric_name IS 'Nombre de la métrica o analito (ej. Colesterol Total).';
COMMENT ON COLUMN ResultMetric.value_encrypted IS 'Valor cuantitativo reportado encriptado en el cliente.';
COMMENT ON COLUMN ResultMetric.normal_range IS 'Valores o rangos estándar de referencia en texto plano (ej. Deseable < 200).';
COMMENT ON COLUMN ResultMetric.has_alert IS 'Flag que define si el valor está fuera del rango normal (Alto/Bajo).';


-- 4.10 Invoice (Factura Médica)
CREATE TABLE Invoice (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES Patient(id) ON DELETE CASCADE NOT NULL,
    bill_no VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    concept VARCHAR(255) NOT NULL,
    clinical_center VARCHAR(255),
    specialty VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pagada' NOT NULL,
    payer_encrypted TEXT,
    payer_iv VARCHAR(24),
    payer_salt VARCHAR(32),
    total_encrypted VARCHAR NOT NULL,
    total_iv VARCHAR(24) NOT NULL,
    total_salt VARCHAR(32) NOT NULL,
    payment_method_encrypted VARCHAR,
    payment_method_iv VARCHAR(24),
    payment_method_salt VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE Invoice IS 'Historial de comprobantes de pago de servicios y pólizas de asegurado.';
COMMENT ON COLUMN Invoice.id IS 'Identificador único de la factura (UUID).';
COMMENT ON COLUMN Invoice.patient_id IS 'Relación con el paciente.';
COMMENT ON COLUMN Invoice.bill_no IS 'Número de comprobante único serializado (ej: FAC-2026-90234).';
COMMENT ON COLUMN Invoice.date IS 'Fecha de facturación.';
COMMENT ON COLUMN Invoice.concept IS 'Concepto o servicio médico cancelado.';
COMMENT ON COLUMN Invoice.clinical_center IS 'Centro asistencial emisor.';
COMMENT ON COLUMN Invoice.specialty IS 'Especialidad vinculada al cobro.';
COMMENT ON COLUMN Invoice.status IS 'Estado del comprobante de pago (ej. Pagada).';
COMMENT ON COLUMN Invoice.payer_encrypted IS 'Nombre y DNI del contribuyente pagador encriptados.';
COMMENT ON COLUMN Invoice.total_encrypted IS 'Importe monetario total del pago encriptado (ej. S/. 250.00 PEN).';
COMMENT ON COLUMN Invoice.payment_method_encrypted IS 'Detalles cifrados de la tarjeta o medio de pago.';


-- 4.11 PushNotification (Notificación de Alerta)
CREATE TABLE PushNotification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES Patient(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    received_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    action_payload VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE PushNotification IS 'Alertas push enviadas al paciente para citas, tratamientos o seguimiento.';
COMMENT ON COLUMN PushNotification.id IS 'Identificador único de la notificación (UUID).';
COMMENT ON COLUMN PushNotification.patient_id IS 'Relación con el paciente receptor.';
COMMENT ON COLUMN PushNotification.type IS 'Tipo de notificación: medicamento, cita, seguimiento.';
COMMENT ON COLUMN PushNotification.title IS 'Título corto de la notificación.';
COMMENT ON COLUMN PushNotification.body IS 'Contenido descriptivo de la notificación.';
COMMENT ON COLUMN PushNotification.received_at IS 'Fecha y hora de envío al dispositivo.';
COMMENT ON COLUMN PushNotification.is_read IS 'Estado de lectura del mensaje por el paciente.';
COMMENT ON COLUMN PushNotification.action_payload IS 'Ruta de redirección del frontend (deep link) al pulsar la notificación.';


-- 4.12 PatientSettings (Configuración de Preferencias)
CREATE TABLE PatientSettings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES Patient(id) ON DELETE CASCADE UNIQUE NOT NULL,
    is_sound_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    notifications_appointments BOOLEAN DEFAULT TRUE NOT NULL,
    notifications_medicines BOOLEAN DEFAULT TRUE NOT NULL,
    notifications_daily_tips BOOLEAN DEFAULT FALSE NOT NULL,
    notifications_email_digest BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE PatientSettings IS 'Configuración global y preferencias de notificaciones/sonido del paciente.';
COMMENT ON COLUMN PatientSettings.id IS 'Identificador de la configuración (UUID).';
COMMENT ON COLUMN PatientSettings.patient_id IS 'Relación uno a uno con el paciente propietario.';
COMMENT ON COLUMN PatientSettings.is_sound_enabled IS 'Habilitación de sonidos del sistema y chimes de UI.';
COMMENT ON COLUMN PatientSettings.notifications_appointments IS 'Desea notificaciones push para recordatorios de citas.';
COMMENT ON COLUMN PatientSettings.notifications_medicines IS 'Desea notificaciones push para recordatorios de medicamentos.';
COMMENT ON COLUMN PatientSettings.notifications_daily_tips IS 'Desea consejos diarios de salud cardiovascular en la UI.';
COMMENT ON COLUMN PatientSettings.notifications_email_digest IS 'Desea recibir resúmenes informativos por correo electrónico.';


-- 4.13 ParkingValidation (Registro de Estacionamientos)
CREATE TABLE ParkingValidation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES Patient(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES Appointment(id) ON DELETE CASCADE NOT NULL,
    sede VARCHAR(100) NOT NULL,
    validated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    is_applied BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE ParkingValidation IS 'Registros de validación de estacionamiento digital subvencionado por EsSalud.';
COMMENT ON COLUMN ParkingValidation.id IS 'Identificador del ticket de estacionamiento (UUID).';
COMMENT ON COLUMN ParkingValidation.patient_id IS 'Relación con el paciente asegurado.';
COMMENT ON COLUMN ParkingValidation.appointment_id IS 'Relación con la cita activa asociada para validar la presencia hoy.';
COMMENT ON COLUMN ParkingValidation.sede IS 'Sede del estacionamiento digital validado.';
COMMENT ON COLUMN ParkingValidation.validated_at IS 'Fecha y hora del visado.';
COMMENT ON COLUMN ParkingValidation.is_applied IS 'Indica si se descontó exitosamente de la póliza.';


-- 4.14 ChatMessage (Mensajes de Conversación con IA)
CREATE TABLE ChatMessage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES Patient(id) ON DELETE CASCADE NOT NULL,
    sender message_sender NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE ChatMessage IS 'Bitácora del historial de chat interactivo con el asistente médico inteligente.';
COMMENT ON COLUMN ChatMessage.id IS 'Identificador único del mensaje (UUID).';
COMMENT ON COLUMN ChatMessage.patient_id IS 'Relación con la sesión de chat del paciente.';
COMMENT ON COLUMN ChatMessage.sender IS 'Emisor del mensaje: assistant (AGEMED Gemini IA) o user (Paciente).';
COMMENT ON COLUMN ChatMessage.text IS 'Contenido textual de la consulta o respuesta.';
COMMENT ON COLUMN ChatMessage.timestamp IS 'Marca temporal del envío.';

-- ============================================================================
-- 5. CREACIÓN DE TRIGGERS (Auditoría automática de updated_at)
-- ============================================================================
CREATE TRIGGER update_specialty_updated_at BEFORE UPDATE ON Specialty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_updated_at BEFORE UPDATE ON Patient FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_updated_at BEFORE UPDATE ON Doctor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_updated_at BEFORE UPDATE ON Appointment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_preparation_item_updated_at BEFORE UPDATE ON PreparationItem FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescription_updated_at BEFORE UPDATE ON Prescription FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescription_medicine_updated_at BEFORE UPDATE ON PrescriptionMedicine FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnostic_result_updated_at BEFORE UPDATE ON DiagnosticResult FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_result_metric_updated_at BEFORE UPDATE ON ResultMetric FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_updated_at BEFORE UPDATE ON Invoice FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_notification_updated_at BEFORE UPDATE ON PushNotification FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_settings_updated_at BEFORE UPDATE ON PatientSettings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parking_validation_updated_at BEFORE UPDATE ON ParkingValidation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_message_updated_at BEFORE UPDATE ON ChatMessage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. CREACIÓN DE ÍNDICES OPTIMIZADOS Y REGLAS DE NEGOCIO (Collisions)
-- ============================================================================

-- REGLAS DE NEGOCIO (Índices parciales únicos para control de citas)
-- Regla 2: Un paciente no puede tener dos citas en el mismo día y bloque horario (excepto canceladas).
CREATE UNIQUE INDEX unique_patient_appointment_slot 
ON Appointment (patient_id, date, time_slot) 
WHERE status != 'cancelled';

-- Regla 2: Un médico no puede tener dos citas agendadas/activas en el mismo día y bloque horario.
CREATE UNIQUE INDEX unique_doctor_appointment_slot 
ON Appointment (doctor_id, date, time_slot) 
WHERE status = 'scheduled';

-- ÍNDICES DE BÚSQUEDA Y FILTRADO
-- Patient (Búsqueda en login y recuperación)
CREATE INDEX idx_patient_email ON Patient(email);
CREATE INDEX idx_patient_dni ON Patient(dni_encrypted);

-- Specialty (Filtro de activas e identificación por slug)
CREATE INDEX idx_specialty_slug ON Specialty(slug);
CREATE INDEX idx_specialty_active ON Specialty(is_active) WHERE is_active = TRUE;

-- Doctor (Filtros en catálogo y listado de médicos)
CREATE INDEX idx_doctor_specialty ON Doctor(specialty_id);
CREATE INDEX idx_doctor_sede ON Doctor(sede);
CREATE INDEX idx_doctor_rating ON Doctor(rating DESC);
CREATE INDEX idx_doctor_active ON Doctor(is_active) WHERE is_active = TRUE;

-- Appointment (Uniones frecuentes para Dashboard e Historial)
CREATE INDEX idx_appointment_patient ON Appointment(patient_id);
CREATE INDEX idx_appointment_doctor ON Appointment(doctor_id);
CREATE INDEX idx_appointment_date ON Appointment(date DESC);
CREATE INDEX idx_appointment_status ON Appointment(status);

-- PreparationItem (Carga del checklist pre-cita)
CREATE INDEX idx_preparation_item_appointment ON PreparationItem(appointment_id);

-- Prescription (Uniones e historial del paciente)
CREATE INDEX idx_prescription_patient ON Prescription(patient_id);
CREATE INDEX idx_prescription_doctor ON Prescription(doctor_id);
CREATE INDEX idx_prescription_date ON Prescription(date DESC);

-- PrescriptionMedicine (Carga de tomas diarias de medicamentos)
CREATE INDEX idx_prescription_medicine_prescription ON PrescriptionMedicine(prescription_id);

-- DiagnosticResult (Historial de informes médicos)
CREATE INDEX idx_diagnostic_result_patient ON DiagnosticResult(patient_id);
CREATE INDEX idx_diagnostic_result_specialty ON DiagnosticResult(specialty_id);
CREATE INDEX idx_diagnostic_result_date ON DiagnosticResult(date DESC);

-- ResultMetric (Lecturas de laboratorio asociadas a un informe)
CREATE INDEX idx_result_metric_result ON ResultMetric(result_id);

-- Invoice (Historial y descargas de facturación)
CREATE INDEX idx_invoice_patient ON Invoice(patient_id);
CREATE INDEX idx_invoice_bill_no ON Invoice(bill_no);
CREATE INDEX idx_invoice_date ON Invoice(date DESC);

-- PushNotification (Bandeja de entrada no leída en tiempo real)
CREATE INDEX idx_push_notification_patient ON PushNotification(patient_id);
CREATE INDEX idx_push_notification_unread ON PushNotification(patient_id) WHERE is_read = FALSE;

-- PatientSettings (Búsqueda de preferencias del usuario en sesión)
CREATE INDEX idx_patient_settings_patient ON PatientSettings(patient_id);

-- ParkingValidation (Validaciones de estacionamiento por día/cita)
CREATE INDEX idx_parking_validation_patient ON ParkingValidation(patient_id);
CREATE INDEX idx_parking_validation_appointment ON ParkingValidation(appointment_id);

-- ChatMessage (Recuperación de hilos del chat con orden secuencial)
CREATE INDEX idx_chat_message_patient ON ChatMessage(patient_id);
CREATE INDEX idx_chat_message_timestamp ON ChatMessage(timestamp ASC);

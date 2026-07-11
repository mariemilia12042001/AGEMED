-- ============================================================================
-- DATOS DE PRUEBA (SEED) - SISTEMA AGEMED (EsSalud Digital)
-- ============================================================================
-- Este script inserta datos de prueba realistas y estructurados en todas las
-- tablas del sistema AGEMED, respetando el orden de integridad referencial.
--
-- NOTA IMPORTANTE:
-- Los UUIDs son fijos y consistentes para asegurar que la base de datos sea
-- predecible y repetible.
--
-- CONTRASENAS DE PRUEBA:
-- Todos los usuarios registrados con correo electrónico tienen el mismo hash Bcrypt
-- para la contraseña 'password123' (Hash: $2a$10$2S7z.4w7kS3vL0bW.4wKNeF.J.C0wD2Zg4K.hGjD6TjXh8KjG4JmW)

BEGIN;

-- ============================================================================
-- 1. Specialty (Especialidades Médicas)
-- ============================================================================
INSERT INTO Specialty (id, slug, name, description, icon_key, color_class, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'medicina-general', 'Medicina General', 'Atención médica primaria y preventiva para toda la familia.', 'home-heart', 'bg-blue-100 text-blue-800', true, now(), now()),
('22222222-2222-2222-2222-222222222222', 'cardiologia', 'Cardiología', 'Diagnóstico, tratamiento y prevención de enfermedades cardiovasculares.', 'heart-pulse', 'bg-red-100 text-red-800', true, now(), now()),
('33333333-3333-3333-3333-333333333333', 'oftalmologia', 'Oftalmología', 'Cuidado integral de la salud visual, refracción y cirugías oculares.', 'eye', 'bg-green-100 text-green-800', true, now(), now()),
('44444444-4444-4444-4444-444444444444', 'pediatria', 'Pediatría', 'Atención integral de la salud infantil desde el nacimiento hasta la adolescencia.', 'baby', 'bg-amber-100 text-amber-800', true, now(), now()),
('55555555-5555-5555-5555-555555555555', 'traumatologia', 'Traumatología y Ortopedia', 'Tratamiento de lesiones del aparato locomotor, huesos, articulaciones y tendones.', 'bone', 'bg-purple-100 text-purple-800', true, now(), now()),
-- Edge case: Especialidad inactiva para probar filtros clínicos en el frontend
('66666666-6666-6666-6666-666666666666', 'dermatologia', 'Dermatología', 'Diagnóstico y tratamiento de afecciones de la piel, cabello y uñas.', 'sparkles', 'bg-pink-100 text-pink-800', false, now(), now());


-- ============================================================================
-- 2. Patient (Pacientes / Asegurados)
-- ============================================================================
-- Los datos sensibles están guardados con strings simulando el cifrado AES-GCM del lado del cliente
-- IVs de longitud fija (24 chars) y Salts de longitud fija (32 chars)
INSERT INTO Patient (
    id, dni_encrypted, dni_iv, dni_salt, email, password_hash, full_name,
    blood_type_encrypted, blood_type_iv, blood_type_salt,
    emergency_contact_name, emergency_phone_encrypted, emergency_phone_iv, emergency_phone_salt,
    registered_center, created_at, updated_at
) VALUES
-- Paciente 1: Sra. María Martínez (Usuario del Dashboard de las pantallas)
(
    'a001a001-a001-a001-a001-a001a001a001',
    'U2FsdGVkX1+lG3FqXWq7qD9mMTIzNDU2Nzg=', -- Cifrado de '12345678'
    'iv_dni_maria_0000000001',
    'salt_dni_maria_000000000000001',
    'maria.martinez@essalud.gob.pe',
    '$2a$10$2S7z.4w7kS3vL0bW.4wKNeF.J.C0wD2Zg4K.hGjD6TjXh8KjG4JmW', -- 'password123'
    'María Martínez',
    'U2FsdGVkX19OIFBvc2l0aXZl', -- Cifrado de 'O+'
    'iv_blood_maria_000000002',
    'salt_blood_maria_000000000002',
    'José Martínez',
    'U2FsdGVkX19waG9uZV85ODc2NTQzMjE=', -- Cifrado de '987654321'
    'iv_phone_maria_000000003',
    'salt_phone_maria_000000000003',
    'Sede Centro', now(), now()
),
-- Paciente 2: Carlos Quispe (Usuario con arritmia bajo control)
(
    'a002a002-a002-a002-a002-a002a002a002',
    'U2FsdGVkX19kbmNfY2FybG9zODc2NTQzMjE=', -- Cifrado de '87654321'
    'iv_dni_carlos_0000000001',
    'salt_dni_carlos_00000000000001',
    'carlos.quispe@essalud.gob.pe',
    '$2a$10$2S7z.4w7kS3vL0bW.4wKNeF.J.C0wD2Zg4K.hGjD6TjXh8KjG4JmW', -- 'password123'
    'Carlos Quispe',
    'U2FsdGVkX19BIG5lZ2F0aXZl', -- Cifrado de 'A-'
    'iv_blood_carlos_000000002',
    'salt_blood_carlos_000000000002',
    'Ana Quispe',
    'U2FsdGVkX19waG9uZV85MTIzNDU2Nzg=', -- Cifrado de '912345678'
    'iv_phone_carlos_000000003',
    'salt_phone_carlos_000000000003',
    'Sede Norte', now(), now()
),
-- Paciente 3: Ana Flores (Paciente de chequeo rutinario)
(
    'a003a003-a003-a003-a003-a003a003a003',
    'U2FsdGVkX19kbmNfYW5hXzIzNDU2Nzg5', -- Cifrado de '23456789'
    'iv_dni_ana_0000000000001',
    'salt_dni_ana_0000000000000001',
    'ana.flores@essalud.gob.pe',
    '$2a$10$2S7z.4w7kS3vL0bW.4wKNeF.J.C0wD2Zg4K.hGjD6TjXh8KjG4JmW', -- 'password123'
    'Ana Flores',
    'U2FsdGVkX19CIFBvc2l0aXZl', -- Cifrado de 'B+'
    'iv_blood_ana_0000000000002',
    'salt_blood_ana_00000000000002',
    'Luis Flores',
    'U2FsdGVkX19waG9uZV85NTU1NTU1NTU=', -- Cifrado de '955555555'
    'iv_phone_ana_0000000000003',
    'salt_phone_ana_00000000000003',
    'Clínica Central', now(), now()
),
-- Paciente 4: Jorge Ramírez (Edge case: valores opcionales de seguridad en NULL)
(
    'a004a004-a004-a004-a004-a004a004a004',
    'U2FsdGVkX19kbmNfam9yZ2VfMzQ1Njc4OTA=',
    'iv_dni_jorge_0000000001',
    'salt_dni_jorge_00000000000001',
    'jorge.ramirez@gmail.com',
    '$2a$10$2S7z.4w7kS3vL0bW.4wKNeF.J.C0wD2Zg4K.hGjD6TjXh8KjG4JmW', -- 'password123'
    'Jorge Ramírez',
    NULL, NULL, NULL, -- Sin tipo de sangre en base
    NULL, NULL, NULL, NULL, -- Sin contacto de emergencia en base
    'Sede Sur', now(), now()
),
-- Paciente 5: Elena Beltrán (Usuario con tratamiento oftalmológico)
(
    'a005a005-a005-a005-a005-a005a005a005',
    'U2FsdGVkX19kbmNfZWxlbmFfNDU2Nzg5MDE=',
    'iv_dni_elena_0000000001',
    'salt_dni_elena_00000000000001',
    'elena.beltran@yahoo.com',
    '$2a$10$2S7z.4w7kS3vL0bW.4wKNeF.J.C0wD2Zg4K.hGjD6TjXh8KjG4JmW', -- 'password123'
    'Elena Beltrán',
    'U2FsdGVkX19BQiBQb3NpdGl2ZQ==', -- Cifrado de 'AB+'
    'iv_blood_elena_000000002',
    'salt_blood_elena_000000000002',
    'Sofía Beltrán',
    'U2FsdGVkX19waG9uZV85MzMzMzMzMzM=',
    'iv_phone_elena_000000003',
    'salt_phone_elena_000000000003',
    'Sede Este', now(), now()
);


-- ============================================================================
-- 3. Doctor (Médicos Especialistas)
-- ============================================================================
INSERT INTO Doctor (id, name, specialty_id, rating, image_url, description, location_office, sede, is_active, created_at, updated_at) VALUES
-- Dr. Pedro Ruiz: Cardiólogo de cabecera en Clínica San Lucas
('d001d001-d001-d001-d001-d001d001d001', 'Dr. Pedro Ruiz', '22222222-2222-2222-2222-222222222222', 4.95, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', 'Médico cardiólogo especialista en insuficiencia cardíaca y cardiología intervencionista.', 'Consultorio 402', 'Clínica San Lucas', true, now(), now()),
-- Dra. Laura Montes: Cardióloga en Hospital San Rafael
('d002d002-d002-d002-d002-d002d002d002', 'Dra. Laura Montes', '22222222-2222-2222-2222-222222222222', 4.80, 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300', 'Especialista en arritmias y cardiología preventiva con 10 años de experiencia.', 'Consultorio 405', 'Hospital San Rafael', true, now(), now()),
-- Dr. Manuel Soto: Medicina General en Sede Centro
('d003d003-d003-d003-d003-d003d003d003', 'Dr. Manuel Soto', '11111111-1111-1111-1111-111111111111', 4.75, 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', 'Atención primaria de salud integral, control de enfermedades crónicas.', 'Consultorio 101', 'Sede Centro', true, now(), now()),
-- Dra. Elena Vargas: Oftalmóloga en Clínica San Lucas
('d004d004-d004-d004-d004-d004d004d004', 'Dra. Elena Vargas', '33333333-3333-3333-3333-333333333333', 4.90, 'https://images.unsplash.com/photo-1651008011206-4364c748da11?auto=format&fit=crop&q=80&w=300', 'Especialista en cirugía refractiva, córnea y tratamiento de glaucoma.', 'Consultorio 303', 'Clínica San Lucas', true, now(), now()),
-- Dr. Ricardo Rojas: Pediatra con calificación límite de 5.00
('d005d005-d005-d005-d005-d005d005d005', 'Dr. Ricardo Rojas', '44444444-4444-4444-4444-444444444444', 5.00, 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', 'Pediatra neonatólogo con gran carisma y dedicación para los niños.', 'Consultorio 204', 'Sede Centro', true, now(), now()),
-- Edge case: Médico inactivo en una especialidad inactiva
('d006d006-d006-d006-d006-d006d006d006', 'Dr. Alberto Guerra', '66666666-6666-6666-6666-666666666666', 3.50, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', 'Especialista en dermatopatología y cáncer de piel.', 'Consultorio 501', 'Sede Norte', false, now(), now());


-- ============================================================================
-- 4. Appointment (Citas Médicas)
-- ============================================================================
INSERT INTO Appointment (id, patient_id, doctor_id, date, time_slot, status, consultation_reason, symptoms, symptoms_duration, destination_location, location_details, created_at, updated_at) VALUES
-- Cita 1: Próxima Cita Activa de María Martínez (Programada para mañana)
(
    'c001c001-c001-c001-c001-c001c001c001',
    'a001a001-a001-a001-a001-a001a001a001', -- María
    'd001d001-d001-d001-d001-d001d001d001', -- Dr. Pedro Ruiz
    '2026-06-28', '10:30 AM', 'scheduled',
    'Control preventivo de hipertensión arterial.',
    'Leve dolor de cabeza intermitente por las mañanas.',
    '2-3 días',
    'Clínica San Lucas',
    'Torre A, Piso 4, Consultorio 402',
    now(), now()
),
-- Cita 2: Cita Completada en el pasado de Carlos Quispe
(
    'c002c002-c002-c002-c002-c002c002c002',
    'a002a002-a002-a002-a002-a002a002a002', -- Carlos
    'd002d002-d002-d002-d002-d002d002d002', -- Dra. Laura Montes
    '2026-06-20', '09:00 AM', 'completed',
    'Seguimiento de arritmia cardíaca detectada en chequeo anterior.',
    'Palpitaciones ocasionales al subir escaleras.',
    'Una semana',
    'Hospital San Rafael',
    'Torre Médica B, Consultorio 405',
    now() - INTERVAL '7 days', now() - INTERVAL '7 days'
),
-- Cita 3: Cita Activa Programada de Ana Flores para la próxima semana
(
    'c003c003-c003-c003-c003-c003c003c003',
    'a003a003-a003-a003-a003-a003a003a003', -- Ana
    'd003d003-d003-d003-d003-d003d003d003', -- Dr. Manuel Soto
    '2026-07-02', '12:00 PM', 'scheduled',
    'Chequeo general anual.',
    'Sin síntomas particulares, solo control rutinario.',
    'Hoy',
    'Sede Centro',
    'Pabellón Principal, Consultorio 101',
    now(), now()
),
-- Cita 4: Cita Cancelada en el pasado de Jorge Ramírez (Caso Edge de Estado)
(
    'c004c004-c004-c004-c004-c004c004c004',
    'a004a004-a004-a004-a004-a004a004a004', -- Jorge
    'd003d003-d003-d003-d003-d003d003d003', -- Dr. Manuel Soto
    '2026-06-25', '02:30 PM', 'cancelled',
    'Consulta urgente por resfriado común.',
    'Congestión nasal y dolor de garganta.',
    '2-3 días',
    'Sede Centro',
    'Pabellón Principal, Consultorio 101',
    now() - INTERVAL '4 days', now() - INTERVAL '2 days'
),
-- Cita 5: Cita Programada a futuro lejano para Elena Beltrán
(
    'c005c005-c005-c005-c005-c005c005c005',
    'a005a005-a005-a005-a005-a005a005a005', -- Elena
    'd004d004-d004-d004-d004-d004d004d004', -- Dra. Elena Vargas
    '2026-07-15', '04:00 PM', 'scheduled',
    'Medida de vista por dolores de cabeza recurrentes.',
    'Visión borrosa ocasional al leer pantallas de cerca.',
    'Más tiempo',
    'Clínica San Lucas',
    'Torre B, Consultorio 303',
    now(), now()
),
-- Cita 6: Cita Completada en el pasado de María Martínez (para historial)
-- Edge case: síntomas y duración vacíos en NULL
(
    'c006c006-c006-c006-c006-c006c006c006',
    'a001a001-a001-a001-a001-a001a001a001', -- María
    'd002d002-d002-d002-d002-d002d002d002', -- Dra. Laura Montes
    '2026-05-15', '10:30 AM', 'completed',
    'Control pos-operatorio menor.',
    NULL,
    NULL,
    'Hospital San Rafael',
    'Torre Médica B, Consultorio 405',
    now() - INTERVAL '45 days', now() - INTERVAL '45 days'
);


-- ============================================================================
-- 5. PreparationItem (Items de Preparación pre-cita)
-- ============================================================================
INSERT INTO PreparationItem (id, appointment_id, label, is_checked, created_at, updated_at) VALUES
-- Items para la Cita 1 de María (1 marcada, 1 sin marcar, 1 marcada)
('e001e001-e001-e001-e001-e001e001e001', 'c001c001-c001-c001-c001-c001c001c001', 'Ayuno absoluto de 8 horas (solo agua permitida).', true, now(), now()),
('e002e002-e002-e002-e002-e002e002e002', 'c001c001-c001-c001-c001-c001c001c001', 'Traer electrocardiograma e informes cardiológicos previos.', false, now(), now()),
('e003e003-e003-e003-e003-e003e003e003', 'c001c001-c001-c001-c001-c001c001c001', 'Llegar con 15 minutos de anticipación para el pre-triaje.', true, now(), now()),
-- Items para la Cita 3 de Ana
('e004e004-e004-e004-e004-e004e004e004', 'c003c003-c003-c003-c003-c003c003c003', 'Presentar DNI físico o carnet de asegurado en recepción.', false, now(), now()),
-- Items para la Cita 5 de Elena
('e005e005-e005-e005-e005-e005e005e005', 'c005c005-c005-c005-c005-c005c005c005', 'Evitar el uso de lentes de contacto 24 horas antes de la cita.', false, now(), now());


-- ============================================================================
-- 6. Prescription (Recetas Médicas)
-- ============================================================================
INSERT INTO Prescription (id, patient_id, doctor_id, date, location, notes_encrypted, notes_iv, notes_salt, created_at, updated_at) VALUES
-- Receta 1: Emitida a Carlos Quispe tras Cita 2
(
    'f001f001-f001-f001-f001-f001f001f001',
    'a002a002-a002-a002-a002-a002a002a002', -- Carlos
    'd002d002-d002-d002-d002-d002d002d002', -- Dra. Laura Montes
    '2026-06-20',
    'Hospital San Rafael - Consultorio 405',
    'U2FsdGVkX18vVmVyaWZpY2FyIHByZXNpw7NuIGRpYXJpYSBlbiBheXVuYXMgYW50ZXMgZGUgdG9tYXIgbW1lZGljYW1lbnRvcy4=',
    'iv_notes_carlos_00000001',
    'salt_notes_carlos_000000000001',
    now() - INTERVAL '7 days', now() - INTERVAL '7 days'
),
-- Receta 2: Emitida a María Martínez tras Cita 6
(
    'f002f002-f002-f002-f002-f002f002f002',
    'a001a001-a001-a001-a001-a001a001a001', -- María
    'd002d002-d002-d002-d002-d002d002d002', -- Dra. Laura Montes
    '2026-05-15',
    'Hospital San Rafael - Consultorio 405',
    'U2FsdGVkX19yZWNldGFfbWFyaWFfZW5jcnlwdGVkX25vdGVzX3NlbXBsZQ==',
    'iv_notes_maria_0000000001',
    'salt_notes_maria_0000000000001',
    now() - INTERVAL '45 days', now() - INTERVAL '45 days'
),
-- Receta 3: Receta histórica de Ana Flores
(
    'f003f003-f003-f003-f003-f003f003f003',
    'a003a003-a003-a003-a003-a003a003a003', -- Ana
    'd003d003-d003-d003-d003-d003d003d003', -- Dr. Manuel Soto
    '2026-04-10',
    'Sede Centro',
    'U2FsdGVkX19hbmFfcmVjZXRhX25vdGVzX2VuYw==',
    'iv_notes_ana_0000000000001',
    'salt_notes_ana_000000000000001',
    now() - INTERVAL '78 days', now() - INTERVAL '78 days'
),
-- Receta 4: Receta histórica de Elena Beltrán
(
    'f004f004-f004-f004-f004-f004f004f004',
    'a005a005-a005-a005-a005-a005a005a005', -- Elena
    'd004d004-d004-d004-d004-d004d004d004', -- Dra. Elena Vargas
    '2026-03-22',
    'Clínica San Lucas',
    'U2FsdGVkX19lbGVuYV9yZWNldGFfbm90ZXNfZW5j',
    'iv_notes_elena_0000000001',
    'salt_notes_elena_0000000000001',
    now() - INTERVAL '97 days', now() - INTERVAL '97 days'
),
-- Receta 5: Receta histórica de Jorge Ramírez (Caso Edge de Notas vacías en NULL)
(
    'f005f005-f005-f005-f005-f005f005f005',
    'a004a004-a004-a004-a004-a004a004a004', -- Jorge
    'd003d003-d003-d003-d003-d003d003d003', -- Dr. Manuel Soto
    '2026-02-18',
    'Sede Centro',
    NULL, NULL, NULL, -- Sin notas escritas
    now() - INTERVAL '129 days', now() - INTERVAL '129 days'
);


-- ============================================================================
-- 7. PrescriptionMedicine (Medicamentos prescritos)
-- ============================================================================
INSERT INTO PrescriptionMedicine (id, prescription_id, medicine_details_encrypted, medicine_details_iv, medicine_details_salt, frequency, duration, is_checked, created_at, updated_at) VALUES
-- Medicamentos para la Receta 1 de Carlos (Atorvastatina y Aspirina)
(
    'g001g001-g001-g001-g001-g001g001g001',
    'f001f001-f001-f001-f001-f001f001f001',
    'U2FsdGVkX185QXRvcnZhc3RhdGluYSAyMG1n', -- Atorvastatina 20mg
    'iv_med_carlos_00000000001',
    'salt_med_carlos_0000000000001',
    'Cada 24 horas, en la noche',
    '30 días',
    true, now(), now()
),
(
    'g002g002-g002-g002-g002-g002g002g002',
    'f001f001-f001-f001-f001-f001f001f001',
    'U2FsdGVkX19Bc3BpcmluYSAxMDBtZw==', -- Aspirina 100mg
    'iv_med_carlos_00000000002',
    'salt_med_carlos_0000000000002',
    'Cada 24 horas, con el almuerzo',
    '90 días',
    false, now(), now()
),
-- Medicamentos para la Receta 2 de María (Losartán)
(
    'g003g003-g003-g003-g003-g003g003g003',
    'f002f002-f002-f002-f002-f002f002f002',
    'U2FsdGVkX19Mb3NhcnRhbiA1MG1n', -- Losartán 50mg
    'iv_med_maria_000000000001',
    'salt_med_maria_00000000000001',
    'Cada 12 horas (8:00 AM y 8:00 PM)',
    '60 días',
    true, now(), now()
),
-- Medicamento para la Receta 3 de Ana (Paracetamol)
(
    'g004g004-g004-g004-g004-g004g004g004',
    'f003f003-f003-f003-f003-f003f003f003',
    'U2FsdGVkX19QYXJhY2V0YW1vbCA1MDBtZw==', -- Paracetamol 500mg
    'iv_med_ana_000000000000001',
    'salt_med_ana_0000000000000001',
    'Cada 8 horas en caso de dolor o fiebre',
    '5 días',
    false, now(), now()
),
-- Medicamento para la Receta 4 de Elena (Gotas oftálmicas)
(
    'g005g005-g005-g005-g005-g005g005g005',
    'f004f004-f004-f004-f004-f004f004f004',
    'U2FsdGVkX19Hb3RhcyBUaW1vbG9sIDAuNSU=', -- Gotas Timolol 0.5%
    'iv_med_elena_000000000001',
    'salt_med_elena_0000000000001',
    '1 gota en cada ojo cada 12 horas',
    '90 días',
    true, now(), now()
);


-- ============================================================================
-- 8. DiagnosticResult (Exámenes / Informes de Laboratorio)
-- ============================================================================
INSERT INTO DiagnosticResult (id, patient_id, test_name, date, specialty_id, doctor_name, status, notes_encrypted, notes_iv, notes_salt, created_at, updated_at) VALUES
-- Examen 1: María Martínez - Lipídico Completo (Estado Alerta)
(
    'h001h001-h001-h001-h001-h001h001h001',
    'a001a001-a001-a001-a001-a001a001a001',
    'Perfil Lipídico Completo',
    '2026-06-10',
    '22222222-2222-2222-2222-222222222222', -- Cardiología
    'Dr. Pedro Ruiz',
    'Alerta',
    'U2FsdGVkX182Q29sZXN0ZXJvbCB5IHRyaWdsaWPDqXJpZG9zIGFsdG9zLiBSZWNvbWllbmRhIHNlIGRpZXRhIGJhamEgZW4gZ3Jhc2FzLg==',
    'iv_diag_maria_0000000001',
    'salt_diag_maria_000000000001',
    now() - INTERVAL '17 days', now() - INTERVAL '17 days'
),
-- Examen 2: Carlos Quispe - HbA1c (Estado Normal)
(
    'h002h002-h002-h002-h002-h002h002h002',
    'a002a002-a002-a002-a002-a002a002a002',
    'Hemoglobina Glicosilada (HbA1c)',
    '2026-06-15',
    '11111111-1111-1111-1111-111111111111', -- Medicina General
    'Dr. Manuel Soto',
    'Normal',
    'U2FsdGVkX19Ob3RhcyBkZSBIYkExYyBub3JtYWwu',
    'iv_diag_carlos_000000001',
    'salt_diag_carlos_00000000001',
    now() - INTERVAL '12 days', now() - INTERVAL '12 days'
),
-- Examen 3: Ana Flores - Hemograma (Estado Verificado)
(
    'h003h003-h003-h003-h003-h003h003h003',
    'a003a003-a003-a003-a003-a003a003a003',
    'Hemograma Completo',
    '2026-05-20',
    '11111111-1111-1111-1111-111111111111',
    'Dr. Manuel Soto',
    'Verificado',
    'U2FsdGVkX19IZW1vZ3JhbWEgY29tcGxldG8gY29uIHZhbG9yZXMgbm9ybWFsZXMu',
    'iv_diag_ana_0000000000001',
    'salt_diag_ana_000000000000001',
    now() - INTERVAL '38 days', now() - INTERVAL '38 days'
),
-- Examen 4: Elena Beltrán - Presión Intraocular (Estado Normal)
(
    'h004h004-h004-h004-h004-h004h004h004',
    'a005a005-a005-a005-a005-a005a005a005',
    'Tonometría y Presión Intraocular',
    '2026-03-22',
    '33333333-3333-3333-3333-333333333333', -- Oftalmología
    'Dra. Elena Vargas',
    'Normal',
    'U2FsdGVkX19Ob3RhcyBvZmN0YWxtb2xvZ2lhIG5vcm1hbC4=',
    'iv_diag_elena_0000000001',
    'salt_diag_elena_0000000000001',
    now() - INTERVAL '97 days', now() - INTERVAL '97 days'
),
-- Examen 5: Jorge Ramírez - Perfil Hepático
-- Edge case: specialty_id, doctor_name y notas en NULL
(
    'h005h005-h005-h005-h005-h005h005h005',
    'a004a004-a004-a004-a004-a004a004a004',
    'Perfil Hepático',
    '2026-02-18',
    NULL,
    NULL,
    'Verificado',
    NULL, NULL, NULL,
    now() - INTERVAL '129 days', now() - INTERVAL '129 days'
);


-- ============================================================================
-- 9. ResultMetric (Métricas del Examen)
-- ============================================================================
INSERT INTO ResultMetric (id, result_id, metric_name, value_encrypted, value_iv, value_salt, normal_range, has_alert, created_at, updated_at) VALUES
-- Métricas del perfil lipídico de María (h001h001)
-- Colesterol Alto (Alerta)
('i001i001-i001-i001-i001-i001i001i001', 'h001h001-h001-h001-h001-h001h001h001', 'Colesterol Total', 'U2FsdGVkX18yNDUgbWcvZEw=', 'iv_val_maria_000000000001', 'salt_val_maria_0000000000001', 'Deseable < 200 mg/dL', true, now(), now()),
-- Triglicéridos normales
('i002i002-i002-i002-i002-i002i002i002', 'h001h001-h001-h001-h001-h001h001h001', 'Triglicéridos', 'U2FsdGVkX18xNDIgbWcvZEw=', 'iv_val_maria_000000000002', 'salt_val_maria_0000000000002', 'Normal < 150 mg/dL', false, now(), now()),
-- Métricas de la HbA1c de Carlos (h002h002) - Normal
('i003i003-i003-i003-i003-i003i003i003', 'h002h002-h002-h002-h002-h002h002h002', 'Hemoglobina Glicosilada A1c', 'U2FsdGVkX181LjYl', 'iv_val_carlos_00000000001', 'salt_val_carlos_000000000001', 'Normal < 5.7%, Prediabetes 5.7%-6.4%', false, now(), now()),
-- Métricas del Hemograma de Ana (h003h003) - Normal
('i004i004-i004-i004-i004-i004i004i004', 'h003h003-h003-h003-h003-h003h003h003', 'Hemoglobina', 'U2FsdGVkX18xMy4yIGcvZEw=', 'iv_val_ana_000000000000001', 'salt_val_ana_0000000000000001', '12.0 - 15.5 g/dL', false, now(), now()),
-- Métricas de la Presión Intraocular de Elena (h004h004) - Derecho Alto (Alerta)
('i005i005-i005-i005-i005-i005i005i005', 'h004h004-h004-h004-h004-h004h004h004', 'Presión Ojo Derecho', 'U2FsdGVkX18yMiBtbUhn', 'iv_val_elena_000000000001', 'salt_val_elena_0000000000001', '10 - 21 mmHg', true, now(), now());


-- ============================================================================
-- 10. Invoice (Facturas Médicas)
-- ============================================================================
INSERT INTO Invoice (id, patient_id, bill_no, date, concept, clinical_center, specialty, status, payer_encrypted, payer_iv, payer_salt, total_encrypted, total_iv, total_salt, payment_method_encrypted, payment_method_iv, payment_method_salt, created_at, updated_at) VALUES
-- Factura 1: María Martínez
(
    'j001j001-j001-j001-j001-j001j001j001',
    'a001a001-a001-a001-a001-a001a001a001',
    'FAC-2026-10023',
    '2026-06-27',
    'Consulta Ambulatoria Especializada - Cardiología',
    'Clínica San Lucas',
    'Cardiología',
    'Pagada',
    'U2FsdGVkX18yTWFyw61hIE1hcnTDrW5leiAoMTIzNDU2Nzgp',
    'iv_payer_maria_000000001',
    'salt_payer_maria_000000000001',
    'U2FsdGVkX19TLy4gMTIwLjAwIFBFTg==', -- S/. 120.00 PEN
    'iv_total_maria_000000001',
    'salt_total_maria_00000000001',
    'U2FsdGVkX19WaXNhICoqKiogNDI0Mg==', -- Visa **** 4242
    'iv_paymet_maria_000000001',
    'salt_paymet_maria_00000000001',
    now(), now()
),
-- Factura 2: Carlos Quispe (Costo S/. 0.00 por EPS - Edge case de valor límite)
(
    'j002j002-j002-j002-j002-j002j002j002',
    'a002a002-a002-a002-a002-a002a002a002',
    'FAC-2026-10024',
    '2026-06-20',
    'Consulta de Seguimiento - Cardiología',
    'Hospital San Rafael',
    'Cardiología',
    'Pagada',
    'U2FsdGVkX19DYXJsb3MgUXVpc3Bl',
    'iv_payer_carlos_000000001',
    'salt_payer_carlos_00000000001',
    'U2FsdGVkX19TLy4gMC4wMCBQRU4=', -- S/. 0.00 PEN (EPS)
    'iv_total_carlos_000000001',
    'salt_total_carlos_00000000001',
    'U2FsdGVkX19Db2JlcnR1cmEgRVBTIDEwMCU=', -- Cobertura EPS 100%
    'iv_paymet_carlos_000000001',
    'salt_paymet_carlos_00000000001',
    now() - INTERVAL '7 days', now() - INTERVAL '7 days'
),
-- Factura 3: Ana Flores
(
    'j003j003-j003-j003-j003-j003j003j003',
    'a003a003-a003-a003-a003-a003a003a003',
    'FAC-2026-10025',
    '2026-04-10',
    'Consulta General de Triaje',
    'Sede Centro',
    'Medicina General',
    'Pagada',
    'U2FsdGVkX19BbmEgRmxvcmVz',
    'iv_payer_ana_000000000001',
    'salt_payer_ana_00000000000001',
    'U2FsdGVkX19TLy4gNDAuMDAgUEVO', -- S/. 40.00 PEN
    'iv_total_ana_00000000000001',
    'salt_total_ana_000000000000001',
    'U2FsdGVkX19NYXN0ZXJjYXJkICoqKiogNTU1NQ==',
    'iv_paymet_ana_00000000000001',
    'salt_paymet_ana_000000000000001',
    now() - INTERVAL '78 days', now() - INTERVAL '78 days'
),
-- Factura 4: Elena Beltrán
(
    'j004j004-j004-j004-j004-j004j004j004',
    'a005a005-a005-a005-a005-a005a005a005',
    'FAC-2026-10026',
    '2026-03-22',
    'Examen Clínico de Refracción',
    'Clínica San Lucas',
    'Oftalmología',
    'Pagada',
    'U2FsdGVkX19FbGVuYSBCZWx0csOhbg==',
    'iv_payer_elena_0000000001',
    'salt_payer_elena_0000000000001',
    'U2FsdGVkX19TLy4gODAuMDAgUEVO', -- S/. 80.00 PEN
    'iv_total_elena_0000000001',
    'salt_total_elena_0000000000001',
    'U2FsdGVkX19WaXNhICoqKiogOTk5OQ==',
    'iv_paymet_elena_0000000001',
    'salt_paymet_elena_0000000000001',
    now() - INTERVAL '97 days', now() - INTERVAL '97 days'
),
-- Factura 5: Jorge Ramírez
-- Edge case: Estado 'Pendiente' y payment_method en NULL
(
    'j005j005-j005-j005-j005-j005j005j005',
    'a004a004-a004-a004-a004-a004a004a004',
    'FAC-2026-10027',
    '2026-02-18',
    'Consulta Médica de Urgencias',
    'Sede Centro',
    'Medicina General',
    'Pendiente', -- Factura pendiente de pago
    'U2FsdGVkX19Kb3JnZSBSYW3DrXJleg==',
    'iv_payer_jorge_0000000001',
    'salt_payer_jorge_0000000000001',
    'U2FsdGVkX19TLy4gMTUwLjAwIFBFTg==', -- S/. 150.00 PEN
    'iv_total_jorge_0000000001',
    'salt_total_jorge_0000000000001',
    NULL, NULL, NULL, -- Sin método de pago por estar pendiente
    now() - INTERVAL '129 days', now() - INTERVAL '129 days'
);


-- ============================================================================
-- 11. PushNotification (Notificaciones de Alerta)
-- ============================================================================
INSERT INTO PushNotification (id, patient_id, type, title, body, received_at, is_read, action_payload, created_at, updated_at) VALUES
-- Notificación 1: María Martínez - Alerta de toma de medicamento (No Leída)
('k001k001-k001-k001-k001-k001k001k001', 'a001a001-a001-a001-a001-a001a001a001', 'medicamento', 'Recordatorio de Losartán', 'Es hora de tomar su pastilla de Losartán 50mg (Dosis de la mañana).', now() - INTERVAL '7 hours', false, '/dashboard/recetas', now() - INTERVAL '7 hours', now() - INTERVAL '7 hours'),
-- Notificación 2: María Martínez - Confirmación de cita activa (Leída)
('k002k002-k002-k002-k002-k002k002k002', 'a001a001-a001-a001-a001-a001a001a001', 'cita', 'Cita Programada Exitosamente', 'Su cita con el Dr. Pedro Ruiz en Clínica San Lucas está confirmada para mañana a las 10:30 AM.', now() - INTERVAL '3 hours', true, '/dashboard/citas', now() - INTERVAL '3 hours', now() - INTERVAL '3 hours'),
-- Notificación 3: Carlos Quispe - Seguimiento médico clínico (No Leída)
('k003k003-k003-k003-k003-k003k003k003', 'a002a002-a002-a002-a002-a002a002a002', 'seguimiento', 'Seguimiento de Arritmia', 'Dra. Laura Montes ha enviado notas adicionales de seguimiento a su historial clínico.', now() - INTERVAL '2 days', false, '/dashboard/historial', now() - INTERVAL '2 days', now() - INTERVAL '2 days'),
-- Notificación 4: Ana Flores - Resultados listos (Leída)
('k004k004-k004-k004-k004-k004k004k004', 'a003a003-a003-a003-a003-a003a003a003', 'seguimiento', 'Informe de Laboratorio Listo', 'Su examen Hemograma Completo del 20 de mayo ya ha sido verificado.', now() - INTERVAL '36 days', true, '/dashboard/resultados', now() - INTERVAL '36 days', now() - INTERVAL '36 days'),
-- Notificación 5: Elena Beltrán - Receta por expirar (No Leída)
('k005k005-k005-k005-k005-k005k005k005', 'a005a005-a005-a005-a005-a005a005a005', 'medicamento', 'Receta por Finalizar', 'Su tratamiento con Gotas Timolol está por finalizar en 5 días. Renueve su receta.', now() - INTERVAL '1 day', false, '/dashboard/recetas', now() - INTERVAL '1 day', now() - INTERVAL '1 day');


-- ============================================================================
-- 12. PatientSettings (Configuración de Preferencias)
-- ============================================================================
-- Se asocian 1:1 con cada uno de los 5 pacientes creados
INSERT INTO PatientSettings (id, patient_id, is_sound_enabled, notifications_appointments, notifications_medicines, notifications_daily_tips, notifications_email_digest, created_at, updated_at) VALUES
('l001l001-l001-l001-l001-l001l001l001', 'a001a001-a001-a001-a001-a001a001a001', true, true, true, true, true, now(), now()),
('l002l002-l002-l002-l002-l002l002l002', 'a002a002-a002-a002-a002-a002a002a002', false, true, true, false, true, now(), now()), -- Sin sonidos
('l003l003-l003-l003-l003-l003l003l003', 'a003a003-a003-a003-a003-a003a003a003', true, true, false, false, false, now(), now()),
('l004l004-l004-l004-l004-l004l004l004', 'a004a004-a004-a004-a004-a004a004a004', false, false, false, false, false, now(), now()), -- Todo apagado
('l005l005-l005-l005-l005-l005l005l005', 'a005a005-a005-a005-a005-a005a005a005', true, true, true, true, false, now(), now());


-- ============================================================================
-- 13. ParkingValidation (Registro de Estacionamientos)
-- ============================================================================
INSERT INTO ParkingValidation (id, patient_id, appointment_id, sede, validated_at, is_applied, created_at, updated_at) VALUES
-- Parking 1: María Martínez - Para su cita de mañana (Aún no aplicada)
('m001m001-m001-m001-m001-m001m001m001', 'a001a001-a001-a001-a001-a001a001a001', 'c001c001-c001-c001-c001-c001c001c001', 'Clínica San Lucas', now(), false, now(), now()),
-- Parking 2: Carlos Quispe - Aplicado en el pasado
('m002m002-m002-m002-m002-m002m002m002', 'a002a002-a002-a002-a002-a002a002a002', 'c002c002-c002-c002-c002-c002c002c002', 'Hospital San Rafael', now() - INTERVAL '7 days', true, now() - INTERVAL '7 days', now() - INTERVAL '7 days'),
-- Parking 3: María Martínez - Aplicado en el pasado
('m003m003-m003-m003-m003-m003m003m003', 'a001a001-a001-a001-a001-a001a001a001', 'c006c006-c006-c006-c006-c006c006c006', 'Hospital San Rafael', now() - INTERVAL '45 days', true, now() - INTERVAL '45 days', now() - INTERVAL '45 days'),
-- Parking 4: Ana Flores - Para cita programada (Aún no aplicada)
('m004m004-m004-m004-m004-m004m004m004', 'a003a003-a003-a003-a003-a003a003a003', 'c003c003-c003-c003-c003-c003c003c003', 'Sede Centro', now(), false, now(), now()),
-- Parking 5: Elena Beltrán - Para cita programada (Aún no aplicada)
('m005m005-m005-m005-m005-m005m005m005', 'a005a005-a005-a005-a005-a005a005a005', 'c005c005-c005-c005-c005-c005c005c005', 'Clínica San Lucas', now(), false, now(), now());


-- ============================================================================
-- 14. ChatMessage (Historial de Mensajes IA)
-- ============================================================================
INSERT INTO ChatMessage (id, patient_id, sender, text, timestamp, created_at, updated_at) VALUES
-- Hilo de conversación de María Martínez
(
    'n001n001-n001-n001-n001-n001n001n001',
    'a001a001-a001-a001-a001-a001a001a001',
    'user',
    'Hola, ¿cuánto tiempo debo estar en ayuno para mi cita de cardiología de mañana?',
    now() - INTERVAL '20 minutes', now() - INTERVAL '20 minutes', now() - INTERVAL '20 minutes'
),
(
    'n002n002-n002-n002-n002-n002n002n002',
    'a001a001-a001-a001-a001-a001a001a001',
    'assistant',
    'Hola María. Para su consulta en cardiología, se recomienda un ayuno de 8 horas. Esto incluye no ingerir alimentos ni bebidas azucaradas, solo agua pura en cantidades moderadas.',
    now() - INTERVAL '19 minutes 50 seconds', now() - INTERVAL '19 minutes 50 seconds', now() - INTERVAL '19 minutes 50 seconds'
),
(
    'n003n003-n003-n003-n003-n003n003n003',
    'a001a001-a001-a001-a001-a001a001a001',
    'user',
    '¿Puedo validar mi ticket de estacionamiento digital en la aplicación?',
    now() - INTERVAL '15 minutes', now() - INTERVAL '15 minutes', now() - INTERVAL '15 minutes'
),
(
    'n004n004-n004-n004-n004-n004n004n004',
    'a001a001-a001-a001-a001-a001a001a001',
    'assistant',
    'Sí, por supuesto. Puede validar su ticket de estacionamiento directamente desde la sección "Indicaciones de Llegada" en los detalles de su cita. Al hacerlo, el costo será cubierto por su cobertura digital de EsSalud.',
    now() - INTERVAL '14 minutes 45 seconds', now() - INTERVAL '14 minutes 45 seconds', now() - INTERVAL '14 minutes 45 seconds'
),
-- Consulta crítica de Carlos Quispe (Activa protocolo de seguridad IA)
(
    'n005n005-n005-n005-n005-n005n005n005',
    'a002a002-a002-a002-a002-a002a002a002',
    'user',
    'Tengo un dolor muy fuerte en el pecho y me falta el aire. ¿Qué hago?',
    now() - INTERVAL '5 minutes', now() - INTERVAL '5 minutes', now() - INTERVAL '5 minutes'
),
(
    'n006n006-n006-n006-n006-n006n006n006',
    'a002a002-a002-a002-a002-a002a002a002',
    'assistant',
    'ATENCIÓN: Si presenta dolor opresivo en el pecho que se irradia al brazo o mandíbula y dificultad para respirar, podría tratarse de una emergencia cardíaca. Por favor, marque inmediatamente a la línea de emergencias médicas "Aló EsSalud" (+34 900 102 100) o acuda a la sala de urgencias más cercana de inmediato.',
    now() - INTERVAL '4 minutes 55 seconds', now() - INTERVAL '4 minutes 55 seconds', now() - INTERVAL '4 minutes 55 seconds'
);

COMMIT;

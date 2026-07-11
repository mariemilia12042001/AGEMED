# Especificación Completa del Sistema Backend - AGEMED (EsSalud Digital)

Este documento detalla la especificación del sistema backend necesario para dar soporte a la aplicación móvil/web de salud digital **AGEMED**. La especificación ha sido elaborada tras analizar las 23 pantallas desarrolladas en React.

---

## 1. Análisis de Pantallas e Interfaz de Usuario

A continuación se detalla la funcionalidad, flujos y estados identificados en cada una de las pantallas del frontend:

### A. Autenticación y Recuperación
1. **Login (`Login.tsx`)**: Permite el ingreso del paciente mediante su número de DNI y contraseña. Transiciona al Dashboard al iniciar sesión con éxito.
2. **Restablecer Contraseña (`ForgotPassword.tsx`)**: Solicita DNI y correo electrónico institucional (ej: `@essalud.gob.pe`). Valida la existencia del usuario y simula el envío de un enlace de recuperación seguro.

### B. Panel Principal y Reservas
3. **Dashboard (`Dashboard.tsx`)**: Pantalla de inicio. Muestra un saludo personalizado ("Sra. Martínez"), acceso directo a búsqueda de citas, un resumen de la **Próxima Cita** programada (médico, especialidad, fecha, hora, sede y botón para ver detalles de preparación), accesos rápidos a especialidades destacadas y un consejo diario de salud cardiovascular.
4. **Reservar Cita (`ReservarCita.tsx`)**: Paso 1 del flujo de reserva. Lista las especialidades principales (Medicina General, Cardiología, Oftalmología, Pediatría) con descripciones.
5. **Especialidades (`Specialties.tsx`)**: Buscador y listado extendido de todas las especialidades disponibles (incluyendo Traumatología, Dermatología, Ginecología, Neurología) indicando la cantidad de médicos en cada una.
6. **Médicos (`Doctors.tsx`)**: Lista a los especialistas que coinciden con la especialidad seleccionada y los filtros de búsqueda. Permite ver su calificación (rating ★), foto, descripción profesional, ubicación de consultorio e iniciar el proceso de reserva.
7. **Filtros Clínicos (`DoctorsFilter.tsx`)**: Permite refinar la lista de médicos por Sede (Sede Centro, Norte, Sur, Este, Clínica Central), Calificación mínima (★ 4.7, 4.8, 4.9, 5.0) y Turno (Mañana o Tarde).
8. **Formulario de Consulta (`ConsultationForm.tsx`)**: Solicita los detalles clínicos del motivo de consulta: motivo de visita (área de texto), síntomas presentes (input de texto) y duración de los mismos (Hoy, 2-3 días, Una semana, Más tiempo). Muestra un banner informativo de privacidad (encriptación de extremo a extremo).
9. **Selección de Horario (`DateSelection.tsx`)**: Calendario interactivo para elegir el día de la consulta y selector de bloques de horas disponibles (09:00 AM, 10:30 AM, 12:00 PM, 02:30 PM, 04:00 PM). Al confirmar, inserta la cita y crea una notificación automática.
10. **Confirmación (`Confirmed.tsx`)**: Muestra el ticket final de la cita exitosa con detalles del médico, especialidad, fecha, hora y ubicación exacta. Permite agregar el evento al calendario local del dispositivo o ver indicaciones de ruta.

### C. Gestión de Citas y Preparación
11. **Mis Citas Activas (`MisCitas.tsx`)**: Lista las consultas programadas vigentes. Permite acceder a los preparativos pre-consulta o **cancelar la cita** con una alerta de confirmación ("Esta acción notificará inmediatamente al triaje de EsSalud").
12. **Detalle Pre-Cita (`PreAppointment.tsx`)**: Muestra un recordatorio de 24h antes del evento, información clave de ubicación/torre, y una **lista de chequeo (checklist) de preparación obligatoria** (ej: Ayuno de 8 horas, traer historial previo, llegar 15 min antes) cuyos ítems pueden marcarse/desmarcarse.
13. **Indicaciones de Llegada (`Directions.tsx`)**: Mapeo y ruteo interactivo hacia la Clínica San Lucas o el Hospital San Rafael. Ofrece instrucciones detalladas según el medio de transporte (Auto, Autobús, Peatonal) y permite **Validar el Estacionamiento Digital** (descontando el costo directamente de la póliza de EsSalud).

### D. Historial Clínico y Seguridad Criptográfica
14. **Historial Médico (`History.tsx`)**: Vista consolidada de citas pasadas completadas. Permite filtrar por pestañas (Todos, Recientes, Especialistas) y descargar la receta digital.
15. **Recetas Médicas (`Recetas.tsx`)**: Lista las recetas emitidas por los facultativos. Muestra un banner sobre encriptación AES-GCM y expone campos sensibles protegidos (Sustancia Activa, Dosificación, Notas Post-Consulta) que requieren el PIN del usuario para visualizarse. Permite descargar la receta en PDF.
16. **Laboratorio e Informes (`Resultados.tsx`)**: Lista los exámenes de laboratorio firmados digitalmente (Perfil Lipídico, Hemoglobina Glicosilada, etc.). Muestra métricas detalladas con rangos de referencia e indicadores de alerta ("Alto"). Los valores de las métricas y las notas diagnósticas están protegidos por PIN mediante cifrado local.
17. **Cuentas y Facturación (`Facturas.tsx`)**: Historial de comprobantes de pago de servicios médicos (con conceptos y sedes). Protege criptográficamente el nombre del contribuyente, el método de pago (tarjeta de crédito autorizada) y el monto total cancelado. Permite descargar facturas electrónicas en PDF.

### E. Soporte, Asistente IA y Configuración
18. **Chat / Mensajes (`Chat.tsx`)**: Interfaz de chat interactivo con el Asistente AGEMED. Admite envío de texto libre, preguntas rápidas predefinidas (Ubicación, Indicaciones, Ayuno, Recetas) y muestra estados de escritura interactiva mientras procesa respuestas con soporte de IA (Gemini 3.5 Flash).
19. **Configuración General (`Configuracion.tsx`)**: Panel para activar/desactivar efectos de sonido (chimes del sistema) y accesos directos a sub-ajustes de notificaciones, privacidad y ayuda.
20. **Ajustes de Notificaciones (`NotificationSettings.tsx`)**: Permite prender o apagar notificaciones push para: Recordatorios de Citas, Medicamentos, Consejos de Salud diarios, Resumen por Correo Electrónico y Sonidos en la app.
21. **Ajustes de Privacidad (`PrivacySettings.tsx`)**: Explica detalladamente los protocolos de cifrado del sistema (AES-GCM + PBKDF2). Ofrece la opción de **Exportar Historial Clínico Seguro** que simula un proceso de encriptado y envío directo al correo registrado.
22. **Centro de Ayuda (`HelpSettings.tsx`)**: Acordeón interactivo de Preguntas Frecuentes (FAQs), enlace al chat de soporte con IA y botón para llamar a la línea directa de emergencias médicas de EsSalud ("Aló EsSalud").
23. **Perfil del Asegurado (`Profile.tsx`)**: Muestra la foto y nombre del paciente. Contiene campos encriptados de alta seguridad: DNI y Tipo de Sangre. Adicionalmente, cuenta con una sección de **Contacto de Emergencia** (nombre de contacto y teléfono encriptado) con un botón para realizar una **Llamada de Emergencia** inmediata.

---

## 2. Definición del Backend (Especificación del Sistema)

### ENTITIES: Lista de Entidades, Campos y Tipos

A continuación se estructuran las tablas/colecciones de base de datos relacionales necesarias. 

#### 1. `Patient` (Paciente / Asegurado)
Representa al usuario de la aplicación. Para cumplir con el cifrado de datos del lado del cliente visible en la UI (`SensitiveDataField`), ciertos campos se deben almacenar en el servidor en formato estructurado de datos cifrados (Ciphertext, IV, Salt).
* `id`: `UUID` (Clave Primaria)
* `dni_encrypted`: `VARCHAR` (Representa el ciphertext de DNI)
* `dni_iv`: `VARCHAR(24)` (Vector de inicialización)
* `dni_salt`: `VARCHAR(32)` (Salt de derivación PBKDF2)
* `email`: `VARCHAR(255)` (Único, usado para login y notificaciones)
* `password_hash`: `VARCHAR(255)` (Hash seguro de contraseña en backend para autenticación)
* `full_name`: `VARCHAR(150)` (Nombre no encriptado para interfaz amigable)
* `blood_type_encrypted`: `VARCHAR` (Tipo de sangre cifrado)
* `blood_type_iv`: `VARCHAR(24)`
* `blood_type_salt`: `VARCHAR(32)`
* `emergency_contact_name`: `VARCHAR(150)`
* `emergency_phone_encrypted`: `VARCHAR` (Teléfono de contacto cifrado)
* `emergency_phone_iv`: `VARCHAR(24)`
* `emergency_phone_salt`: `VARCHAR(32)`
* `registered_center`: `VARCHAR(100)` (Centro de EsSalud asignado por defecto)
* `created_at`: `TIMESTAMP`
* `updated_at`: `TIMESTAMP`

#### 2. `Specialty` (Especialidad Médica)
* `id`: `VARCHAR(50)` (Clave Primaria, ej: `cardiologia`)
* `name`: `VARCHAR(100)` (Nombre legible, ej: `Cardiología Preventiva`)
* `description`: `TEXT`
* `icon_key`: `VARCHAR(50)` (Clave para icono frontend)
* `color_class`: `VARCHAR(100)` (Estilos de UI asignados)
* `is_active`: `BOOLEAN`

#### 3. `Doctor` (Médico Especialista)
* `id`: `UUID` / `VARCHAR(50)` (Clave Primaria)
* `name`: `VARCHAR(150)`
* `specialty_id`: `VARCHAR(50)` (Clave Foránea a `Specialty`)
* `rating`: `DECIMAL(3,2)` (Rango de 0.0 a 5.0)
* `image_url`: `VARCHAR(2048)`
* `description`: `TEXT`
* `location_office`: `VARCHAR(150)` (Ej: "Consultorio 402")
* `sede`: `VARCHAR(100)` (Ej: "Clínica San Lucas", "Sede Norte")
* `is_active`: `BOOLEAN`

#### 4. `Appointment` (Cita Médica)
* `id`: `UUID` (Clave Primaria)
* `patient_id`: `UUID` (Clave Foránea a `Patient`)
* `doctor_id`: `VARCHAR(50)` (Clave Foránea a `Doctor`)
* `date`: `DATE` (Fecha de la cita)
* `time_slot`: `VARCHAR(10)` (Ej: "10:30 AM")
* `status`: `ENUM('scheduled', 'completed', 'cancelled')`
* `consultation_reason`: `TEXT` (Motivo de consulta redactado por paciente)
* `symptoms`: `TEXT`
* `symptoms_duration`: `VARCHAR(50)`
* `destination_location`: `VARCHAR(255)` (Sede física de la cita)
* `location_details`: `VARCHAR(255)` (Torre, consultorio, calle)
* `created_at`: `TIMESTAMP`

#### 5. `PreparationItem` (Chequeo de Preparación de Cita)
* `id`: `UUID` (Clave Primaria)
* `appointment_id`: `UUID` (Clave Foránea a `Appointment`)
* `label`: `VARCHAR(255)` (Ej: "Ayuno de 8 horas")
* `is_checked`: `BOOLEAN` (Estado marcado por el paciente)

#### 6. `Prescription` (Receta Médica Digital)
* `id`: `UUID` (Clave Primaria)
* `patient_id`: `UUID` (Clave Foránea a `Patient`)
* `doctor_id`: `VARCHAR(50)` (Clave Foránea a `Doctor`)
* `date`: `DATE`
* `location`: `VARCHAR(255)`
* `notes_encrypted`: `TEXT` (Instrucciones generales cifradas)
* `notes_iv`: `VARCHAR(24)`
* `notes_salt`: `VARCHAR(32)`

#### 7. `PrescriptionMedicine` (Medicamento de la Receta)
* `id`: `UUID` (Clave Primaria)
* `prescription_id`: `UUID` (Clave Foránea a `Prescription`)
* `medicine_details_encrypted`: `TEXT` (Nombre y dosis del medicamento cifrado, ej: "Atorvastatina 20mg - 1 tableta")
* `medicine_details_iv`: `VARCHAR(24)`
* `medicine_details_salt`: `VARCHAR(32)`
* `frequency`: `VARCHAR(150)` (Frecuencia en texto plano, ej: "Cada 24 horas")
* `duration`: `VARCHAR(50)` (Duración, ej: "30 días")
* `is_checked`: `BOOLEAN` (Monitoreo de toma del paciente)

#### 8. `DiagnosticResult` (Examen / Informe de Laboratorio)
* `id`: `UUID` (Clave Primaria)
* `patient_id`: `UUID` (Clave Foránea a `Patient`)
* `test_name`: `VARCHAR(255)` (Ej: "Perfil Lipídico Completo")
* `date`: `DATE`
* `specialty_id`: `VARCHAR(50)` (Clave Foránea a `Specialty`)
* `doctor_name`: `VARCHAR(150)` (Médico que firma)
* `status`: `VARCHAR(50)` (Ej: "Verificado", "Normal")
* `notes_encrypted`: `TEXT` (Notas diagnósticas del laboratorio cifradas)
* `notes_iv`: `VARCHAR(24)`
* `notes_salt`: `VARCHAR(32)`

#### 9. `ResultMetric` (Métrica Analizada del Examen)
* `id`: `UUID` (Clave Primaria)
* `result_id`: `UUID` (Clave Foránea a `DiagnosticResult`)
* `metric_name`: `VARCHAR(150)` (Ej: "Colesterol Total")
* `value_encrypted`: `VARCHAR` (Resultado de laboratorio encriptado, ej: "210 mg/dL")
* `value_iv`: `VARCHAR(24)`
* `value_salt`: `VARCHAR(32)`
* `normal_range`: `VARCHAR(100)` (Rango estándar, ej: "Deseable < 200")
* `has_alert`: `BOOLEAN` (Bandera si está fuera de rango)

#### 10. `Invoice` (Factura Médica)
* `id`: `UUID` (Clave Primaria)
* `patient_id`: `UUID` (Clave Foránea a `Patient`)
* `bill_no`: `VARCHAR(100)` (Número de factura, ej: "FAC-2026-90234")
* `date`: `DATE`
* `concept`: `VARCHAR(255)`
* `clinical_center`: `VARCHAR(255)`
* `specialty`: `VARCHAR(100)`
* `status`: `VARCHAR(50)` (Ej: "Pagada")
* `payer_encrypted`: `VARCHAR` (Nombre y DNI del pagador cifrados)
* `payer_iv`: `VARCHAR(24)`
* `payer_salt`: `VARCHAR(32)`
* `total_encrypted`: `VARCHAR` (Monto total cifrado, ej: "S/. 250.00 PEN")
* `total_iv`: `VARCHAR(24)`
* `total_salt`: `VARCHAR(32)`
* `payment_method_encrypted`: `VARCHAR` (Tarjeta u otro método cifrado)
* `payment_method_iv`: `VARCHAR(24)`
* `payment_method_salt`: `VARCHAR(32)`

#### 11. `PushNotification` (Notificación de Alerta)
* `id`: `UUID` (Clave Primaria)
* `patient_id`: `UUID` (Clave Foránea a `Patient`)
* `type`: `ENUM('medicamento', 'cita', 'seguimiento')`
* `title`: `VARCHAR(255)`
* `body`: `TEXT`
* `received_at`: `TIMESTAMP`
* `is_read`: `BOOLEAN`
* `action_payload`: `VARCHAR(255)` (Ruta de redirección en frontend)

#### 12. `PatientSettings` (Configuración de Preferencias)
* `patient_id`: `UUID` (Clave Primaria, Clave Foránea a `Patient`)
* `is_sound_enabled`: `BOOLEAN` (Por defecto true)
* `notifications_appointments`: `BOOLEAN` (Por defecto true)
* `notifications_medicines`: `BOOLEAN` (Por defecto true)
* `notifications_daily_tips`: `BOOLEAN` (Por defecto false)
* `notifications_email_digest`: `BOOLEAN` (Por defecto true)

#### 13. `ParkingValidation` (Registro de Estacionamientos)
* `id`: `UUID` (Clave Primaria)
* `patient_id`: `UUID` (Clave Foránea a `Patient`)
* `appointment_id`: `UUID` (Clave Foránea a `Appointment`)
* `sede`: `VARCHAR(100)`
* `validated_at`: `TIMESTAMP`
* `is_applied`: `BOOLEAN`

#### 14. `ChatMessage` (Mensajes de Conversación con IA)
* `id`: `UUID` (Clave Primaria)
* `patient_id`: `UUID` (Clave Foránea a `Patient`)
* `sender`: `ENUM('assistant', 'user')`
* `text`: `TEXT`
* `timestamp`: `TIMESTAMP`

---

### ACTIONS: Lista de Operaciones por Entidad (Endpoints de la API)

#### 1. Módulo de Autenticación y Cuenta (`/api/auth`)
* `POST /api/auth/login`: Autentica al paciente con DNI y contraseña. Devuelve un Token JWT y la sesión del usuario (excluyendo datos sensibles).
* `POST /api/auth/forgot-password`: Solicita el restablecimiento de contraseña enviando un token al correo electrónico institucional del DNI asociado.
* `POST /api/auth/reset-password`: Completa el cambio de contraseña usando el token seguro del e-mail.

#### 2. Módulo de Especialidades y Médicos (`/api/clinical`)
* `GET /api/clinical/specialties`: Obtiene el listado de especialidades médicas habilitadas, descripciones, contadores de médicos activos y metadatos visuales.
* `GET /api/clinical/doctors`: Obtiene la lista de médicos disponibles. Admite parámetros de búsqueda y filtrado query: `specialty`, `search`, `sede`, `min_rating`, y `turno`.

#### 3. Módulo de Citas (`/api/appointments`)
* `GET /api/appointments`: Obtiene las citas activas e inactivas del paciente autenticado (basado en el JWT).
* `POST /api/appointments`: Reserva una nueva cita con todos los datos clínicos (motivo, síntomas, duración, doctor, fecha, hora). Crea en cascada las notificaciones e ítems de preparación obligatorios.
* `PUT /api/appointments/:id/cancel`: Cancela una cita activa programada cambiando su estado a `cancelled`. Libera el bloque de horario para otros pacientes y envía alerta de cancelación a triaje.
* `PUT /api/appointments/preparation/:item_id`: Cambia el estado marcado/desmarcado (`is_checked`) de una indicación de preparación de cita.
* `POST /api/appointments/parking/validate`: Registra y valida un ticket de estacionamiento amarrado a una cita médica vigente.

#### 4. Módulo de Historial Clínico (`/api/records`)
* `GET /api/records/history`: Obtiene el resumen histórico de citas anteriores completadas.
* `GET /api/records/prescriptions`: Obtiene las recetas del paciente, incluyendo los datos criptográficos (`notes_encrypted`, `iv`, `salt` y los medicamentos encriptados).
* `GET /api/records/prescriptions/:id/pdf`: Genera y sirve el documento de receta en formato PDF oficial y firmado digitalmente.
* `GET /api/records/diagnostics`: Obtiene los exámenes y reportes de laboratorio con sus métricas encriptadas.
* `GET /api/records/invoices`: Obtiene el listado de facturas pagadas con los datos de transacciones financieras encriptados.
* `POST /api/records/export`: Empaqueta todo el historial clínico, recetas, diagnósticos y facturas en un archivo PDF encriptado de forma segura y lo envía al correo registrado del paciente.

#### 5. Módulo de Notificaciones (`/api/notifications`)
* `GET /api/notifications`: Lista las alertas push recibidas por el paciente.
* `PUT /api/notifications/:id/read`: Marca una notificación específica como leída.
* `PUT /api/notifications/read-all`: Marca todas las notificaciones pendientes como leídas.

#### 6. Módulo de Preferencias (`/api/settings`)
* `GET /api/settings`: Recupera las preferencias de notificaciones, sonidos y privacidad del paciente.
* `PUT /api/settings`: Actualiza las configuraciones de alerta (emails, recordatorio de medicamentos, chimes, etc.).

#### 7. Módulo de Asistencia IA (`/api/chat`)
* `POST /api/chat`: Endpoint de mensajería con el Asistente AGEMED. Recibe el historial de mensajes de la sesión del paciente. Interconecta con el SDK de Gemini 3.5 Flash utilizando directrices/instrucciones de sistema específicas de EsSalud y devuelve la respuesta en texto. Almacena el historial en la base de datos.

---

### BUSINESS_RULES: Restricciones y Validaciones

1. **Gestión del Cifrado del Lado del Cliente (Zero-Knowledge)**: 
   * El backend actúa como almacén ciego de campos médicos sensibles de identidad, salud y cobros. 
   * **Restricción**: El backend no debe descifrar ni conocer la clave/PIN privada de derivación del usuario (ej: el PIN `1234`). El servidor almacena los objetos encriptados con estructura JSON `{ ciphertext, iv, salt }`. Al consultar, estos objetos se entregan tal cual al frontend para su desencriptado con PIN local.
2. **Validación de Unicidad de Citas (Solapamiento)**:
   * No se permite agendar dos citas para el mismo paciente en el mismo día y bloque de hora.
   * No se permite agendar una cita con un médico si este ya cuenta con una reserva activa (`status = 'scheduled'`) en el mismo día y bloque de hora (`date` y `time_slot`).
3. **Plazo de Cancelación y Triaje**:
   * Las citas activas pueden cancelarse hasta 2 horas antes de la hora fijada. La cancelación fuera de este plazo requerirá validación manual o penalidad en triaje digital.
4. **Validación de Estacionamiento**:
   * Para visar y validar digitalmente el ticket de estacionamiento de una sede, el paciente debe contar con una cita activa programada para el día de hoy en esa sede específica.
5. **Autobloqueo de Seguridad en UI (Regla visible en UI)**:
   * Toda visualización de datos sensibles desencriptados en el cliente dura un máximo de 45 segundos. Cumplido el temporizador, los campos se bloquean automáticamente borrando la memoria temporal del PIN.
6. **Políticas de Asistente IA (Gemini)**:
   * El asistente de IA debe estar parametrizado con instrucciones de sistema estrictas. Ante consultas críticas que involucren síntomas de alarma vital (ej: dolor fuerte de pecho, infartos), debe emitir un protocolo de respuesta prioritario instando al paciente a marcar la línea de emergencias médicas de EsSalud (`+34 900 102 100`) o acudir de inmediato a urgencias.

---

### AUTH: Requerimientos de Autenticación y Autorización

#### 1. Rutas Públicas (No requieren Token)
* `POST /api/auth/login`: Entrada inicial. Requiere DNI y contraseña.
* `POST /api/auth/forgot-password`: Flujo de recuperación de credenciales mediante DNI y correo registrado.
* `POST /api/auth/reset-password`: Restablece contraseña ingresando el token temporal provisto por correo.

#### 2. Rutas Protegidas (Requieren Token de Autorización JWT)
Todas las demás operaciones del sistema requieren que se envíe un token JWT válido en las cabeceras HTTP (`Authorization: Bearer <JWT_TOKEN>`). Esto incluye:
* Gestión y visualización de citas (`/api/appointments/**`)
* Lectura e inserción del chat interactivo (`/api/chat`)
* Descarga de recetas en PDF (`/api/records/prescriptions/:id/pdf`)
* Consulta de facturas y resultados médicos (`/api/records/**`)
* Modificación de configuraciones de privacidad y canales (`/api/settings`)
* Recepción de alertas en tiempo real (`/api/notifications/**`)

---

## 3. Estados de la Aplicación en la UI (Mapeo Frontend-Backend)

Para cada flujo principal, el frontend interactúa con los siguientes estados que el backend debe soportar a través de códigos de estado HTTP y cargas útiles:

| Módulo / Flujo | Estado en Frontend | Comportamiento Backend / Código HTTP |
| :--- | :--- | :--- |
| **Autenticación** | `Loading` (Verificando...) | `200 OK` tras verificación exitosa o latencia de red. |
| | `Error` (Credenciales inválidas) | `401 Unauthorized` con mensaje específico. |
| **Buscadores** | `Con Datos` (Listas cargadas) | `200 OK` con array de objetos. |
| | `Vacío` (Sin coincidencias / Especialidades) | `200 OK` con array vacío `[]`. UI renderiza ilustración y aviso. |
| **Reservas** | `Confirmando...` | `201 Created` al persistir cita en DB. Genera y retorna el nuevo UUID de cita. |
| **Historial / Recetas** | `Loading Secure` (Cifrando base...) | El frontend solicita datos encriptados. Latencia de cifrado inicial en UI. |
| | `Protegido` (Bloqueado con PIN) | Muestra inputs de clave. El backend retorna `{ ciphertext, iv, salt }`. |
| | `Error PIN` (Clave incorrecta) | El frontend intenta descifrar y lanza error local si falla la integridad criptográfica. |
| **Notificaciones** | `Badge Activo` | El backend retorna `has_unread: true` en consultas del dashboard. |
| **Asistente IA** | `AiLoading` (AGEMED escribe...) | `200 OK` con retardo mientras procesa en API de Gemini. |

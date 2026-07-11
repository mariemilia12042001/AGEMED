import { getSupabaseClient } from './client';
import type { Database } from './types';

type PatientRow = Database['public']['Tables']['patient']['Row'];
type PatientInsert = Database['public']['Tables']['patient']['Insert'];
type PatientUpdate = Database['public']['Tables']['patient']['Update'];
type SettingsRow = Database['public']['Tables']['patientsettings']['Row'];
type SettingsUpdate = Database['public']['Tables']['patientsettings']['Update'];

// Regex para validación básica
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Interfaz para campos cifrados del lado del cliente
export interface EncryptedField {
  ciphertext: string;
  iv: string;
  salt: string;
}

function isValidEncryptedField(field: any): field is EncryptedField {
  return (
    field &&
    typeof field.ciphertext === 'string' &&
    typeof field.iv === 'string' &&
    field.iv.length === 24 &&
    typeof field.salt === 'string' &&
    field.salt.length === 32
  );
}

/**
 * 1. POST /api/auth/login
 * Autentica al paciente.
 * 
 * - Edge Function necesaria: SÍ. 
 *   Razón: La contraseña se almacena como hash (password_hash) y no debe verificarse en el cliente.
 *   Adicionalmente, el DNI está cifrado; la búsqueda y comparación del hash debe realizarse en un
 *   entorno de backend seguro que firme el token JWT.
 */
export async function login(
  email: string,
  passwordPlain: string
): Promise<{ data: { token: string; user: Omit<PatientRow, 'password_hash'> } | null; error: string | null }> {
  // 3. Validación de inputs
  if (!email || !EMAIL_REGEX.test(email)) {
    return { data: null, error: 'Formato de correo electrónico inválido.' };
  }
  if (!passwordPlain || passwordPlain.length < 6) {
    return { data: null, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase.functions.invoke<{
      token: string;
      user: Omit<PatientRow, 'password_hash'>;
    }>('auth-login', {
      body: { email, password: passwordPlain }
    });

    // 2. Manejo de errores esperados
    if (error) {
      return { data: null, error: error.message || 'Error de autenticación.' };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión con el servidor de autenticación.' };
  }
}

/**
 * 2. POST /api/auth/forgot-password
 * Solicita el restablecimiento de contraseña.
 * 
 * - Edge Function necesaria: SÍ.
 *   Razón: Debe validar la existencia del usuario de manera segura y generar/enviar un token temporal
 *   a través de correo electrónico (interconexión con servicio SMTP/envío de correos).
 */
export async function forgotPassword(
  email: string,
  dniPlain: string
): Promise<{ success: boolean; error: string | null }> {
  if (!email || !EMAIL_REGEX.test(email)) {
    return { success: false, error: 'Formato de correo electrónico inválido.' };
  }
  if (!dniPlain || dniPlain.trim().length === 0) {
    return { success: false, error: 'El DNI es requerido.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase.functions.invoke<{ success: boolean }>('auth-forgot-password', {
      body: { email, dni: dniPlain }
    });

    if (error) {
      return { success: false, error: error.message || 'Error al procesar la solicitud de recuperación.' };
    }

    return { success: data?.success || true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de comunicación con el servidor.' };
  }
}

/**
 * 3. POST /api/auth/reset-password
 * Completa el cambio de contraseña usando el token del correo.
 * 
 * - Edge Function necesaria: SÍ.
 *   Razón: Valida el token seguro en el lado del servidor, calcula el nuevo hash de contraseña 
 *   y actualiza el registro en la base de datos de manera atómica.
 */
export async function resetPassword(
  token: string,
  newPasswordPlain: string
): Promise<{ success: boolean; error: string | null }> {
  if (!token || token.trim().length === 0) {
    return { success: false, error: 'El token de seguridad es requerido.' };
  }
  if (!newPasswordPlain || newPasswordPlain.length < 8) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase.functions.invoke<{ success: boolean }>('auth-reset-password', {
      body: { token, password: newPasswordPlain }
    });

    if (error) {
      return { success: false, error: error.message || 'Error al restablecer la contraseña.' };
    }

    return { success: data?.success || true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de comunicación con el servidor.' };
  }
}

/**
 * 4. GET /api/patient/profile
 * Obtiene los datos del perfil del asegurado.
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Al tener habilitado RLS en PostgreSQL, la consulta por el ID del usuario autenticado
 *   es segura y directa.
 */
export async function getProfile(
  patientId: string
): Promise<{ data: PatientRow | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };

  const { data, error } = await supabase
    .from('patient')
    .select('*')
    .eq('id', patientId)
    .single();

  if (error) {
    return { data: null, error: error.message || 'Error al obtener el perfil del paciente.' };
  }

  return { data, error: null };
}

/**
 * 5. PUT /api/patient/profile
 * Actualiza los datos del perfil del asegurado (incluyendo campos encriptados).
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: El cliente cifra localmente los datos y realiza la actualización en el servidor,
 *   protegido por políticas RLS.
 */
export async function updateProfile(
  patientId: string,
  updates: {
    fullName?: string;
    bloodType?: EncryptedField;
    emergencyContactName?: string;
    emergencyPhone?: EncryptedField;
    registeredCenter?: string;
  }
): Promise<{ data: PatientRow | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  // Objeto de actualización mapeado a las columnas de la DB
  const dbUpdates: PatientUpdate = {};

  if (updates.fullName !== undefined) {
    if (updates.fullName.trim().length === 0) return { data: null, error: 'El nombre completo no puede estar vacío.' };
    dbUpdates.full_name = updates.fullName;
  }

  if (updates.bloodType !== undefined) {
    if (!isValidEncryptedField(updates.bloodType)) {
      return { data: null, error: 'Formato de tipo de sangre encriptado inválido.' };
    }
    dbUpdates.blood_type_encrypted = updates.bloodType.ciphertext;
    dbUpdates.blood_type_iv = updates.bloodType.iv;
    dbUpdates.blood_type_salt = updates.bloodType.salt;
  }

  if (updates.emergencyContactName !== undefined) {
    dbUpdates.emergency_contact_name = updates.emergencyContactName;
  }

  if (updates.emergencyPhone !== undefined) {
    if (!isValidEncryptedField(updates.emergencyPhone)) {
      return { data: null, error: 'Formato de teléfono de emergencia encriptado inválido.' };
    }
    dbUpdates.emergency_phone_encrypted = updates.emergencyPhone.ciphertext;
    dbUpdates.emergency_phone_iv = updates.emergencyPhone.iv;
    dbUpdates.emergency_phone_salt = updates.emergencyPhone.salt;
  }

  if (updates.registeredCenter !== undefined) {
    dbUpdates.registered_center = updates.registeredCenter;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };

  const { data, error } = await supabase
    .from('patient')
    .update(dbUpdates)
    .eq('id', patientId)
    .select()
    .single();

  if (error) {
    // 2. Manejo de errores específicos (ej. Violación de checks)
    return { data: null, error: error.message || 'Error al actualizar el perfil del paciente.' };
  }

  return { data, error: null };
}

/**
 * 6. GET /api/settings
 * Recupera las preferencias de notificaciones, sonidos y privacidad del paciente.
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Operación de lectura de un único registro protegida por RLS.
 */
export async function getSettings(
  patientId: string
): Promise<{ data: SettingsRow | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };

  const { data, error } = await supabase
    .from('patientsettings')
    .select('*')
    .eq('patient_id', patientId)
    .single();

  if (error) {
    // Si no existe configuración (ej. primer login), se podría crear una por defecto
    if (error.code === 'PGRST116') { // Cero filas retornadas
      return createDefaultSettings(patientId);
    }
    return { data: null, error: error.message || 'Error al obtener la configuración.' };
  }

  return { data, error: null };
}

/**
 * 7. PUT /api/settings
 * Actualiza las configuraciones de alerta y sonidos.
 * 
 * - Basta con el cliente: SÍ.
 */
export async function updateSettings(
  patientId: string,
  settings: {
    isSoundEnabled?: boolean;
    notificationsAppointments?: boolean;
    notificationsMedicines?: boolean;
    notificationsDailyTips?: boolean;
    notificationsEmailDigest?: boolean;
  }
): Promise<{ data: SettingsRow | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  const dbUpdates: SettingsUpdate = {};
  if (settings.isSoundEnabled !== undefined) dbUpdates.is_sound_enabled = settings.isSoundEnabled;
  if (settings.notificationsAppointments !== undefined) dbUpdates.notifications_appointments = settings.notificationsAppointments;
  if (settings.notificationsMedicines !== undefined) dbUpdates.notifications_medicines = settings.notificationsMedicines;
  if (settings.notificationsDailyTips !== undefined) dbUpdates.notifications_daily_tips = settings.notificationsDailyTips;
  if (settings.notificationsEmailDigest !== undefined) dbUpdates.notifications_email_digest = settings.notificationsEmailDigest;

  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };

  const { data, error } = await supabase
    .from('patientsettings')
    .update(dbUpdates)
    .eq('patient_id', patientId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message || 'Error al actualizar la configuración.' };
  }

  return { data, error: null };
}

// Crea las configuraciones iniciales por defecto para un paciente nuevo
async function createDefaultSettings(
  patientId: string
): Promise<{ data: SettingsRow | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };

  const { data, error } = await supabase
    .from('patientsettings')
    .insert({
      patient_id: patientId,
      is_sound_enabled: true,
      notifications_appointments: true,
      notifications_medicines: true,
      notifications_daily_tips: false,
      notifications_email_digest: true
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message || 'Error al crear la configuración por defecto.' };
  }

  return { data, error: null };
}

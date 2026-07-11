import { getSupabaseClient } from './client';
import type { Database } from './types';

type NotificationRow = Database['public']['Tables']['pushnotification']['Row'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 1. GET /api/notifications
 * Lista las alertas push recibidas por el paciente.
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Lectura de notificaciones personales del usuario mediante filtros e índices optimizados,
 *   asegurado por RLS.
 */
export async function getNotifications(
  patientId: string
): Promise<{ data: NotificationRow[] | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase
      .from('pushnotification')
      .select('*')
      .eq('patient_id', patientId)
      .order('received_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message || 'Error al obtener las notificaciones.' };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión al obtener notificaciones.' };
  }
}

/**
 * 2. PUT /api/notifications/:id/read
 * Marca una notificación específica como leída.
 * 
 * - Basta con el cliente: SÍ.
 */
export async function markAsRead(
  notificationId: string
): Promise<{ data: NotificationRow | null; error: string | null }> {
  if (!notificationId || !UUID_REGEX.test(notificationId)) {
    return { data: null, error: 'Identificador de notificación inválido.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase
      .from('pushnotification')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message || 'Error al actualizar la notificación.' };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión.' };
  }
}

/**
 * 3. PUT /api/notifications/read-all
 * Marca todas las notificaciones pendientes de un paciente como leídas.
 * 
 * - Basta con el cliente: SÍ.
 */
export async function markAllAsRead(
  patientId: string
): Promise<{ data: NotificationRow[] | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase
      .from('pushnotification')
      .update({ is_read: true })
      .eq('patient_id', patientId)
      .eq('is_read', false)
      .select();

    if (error) {
      return { data: null, error: error.message || 'Error al actualizar todas las notificaciones.' };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión.' };
  }
}

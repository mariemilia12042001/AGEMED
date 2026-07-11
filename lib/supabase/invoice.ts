import { supabase } from './client';
import type { Database } from './types';

type InvoiceRow = Database['public']['Tables']['invoice']['Row'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 1. GET /api/records/invoices
 * Obtiene el listado de facturas pagadas del paciente con datos financieros encriptados.
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Lectura directa de la tabla `Invoice` protegida por políticas de RLS.
 */
export async function getInvoices(
  patientId: string
): Promise<{ data: InvoiceRow[] | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  try {
    const { data, error } = await supabase
      .from('invoice')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) {
      return { data: null, error: error.message || 'Error al obtener las facturas.' };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión al obtener facturas.' };
  }
}

/**
 * 2. POST /api/records/export
 * Genera un PDF encriptado con todo el historial clínico y lo envía al correo.
 * 
 * - Edge Function necesaria: SÍ.
 *   Razón: Requiere compilar información de múltiples tablas (citas, diagnósticos, recetas y facturas),
 *   formatearla, generar un archivo PDF consolidado, aplicar cifrado con contraseña (protección de archivo PDF)
 *   y coordinar el envío de correo electrónico institucional de EsSalud utilizando credenciales de SMTP protegidas.
 */
export async function exportClinicalHistory(
  patientId: string,
  email: string
): Promise<{ success: boolean; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { success: false, error: 'Identificador del paciente inválido.' };
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return { success: false, error: 'Formato de correo electrónico inválido.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke<{ success: boolean }>('export-clinical-history', {
      body: { patientId, email }
    });

    if (error) {
      return { success: false, error: error.message || 'Error al solicitar la exportación del historial clínico.' };
    }

    return { success: data?.success || true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de conexión con el servicio de exportación.' };
  }
}

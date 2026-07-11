import { supabase } from './client';
import type { Database } from './types';

type DiagnosticRow = Database['public']['Tables']['diagnosticresult']['Row'];
type MetricRow = Database['public']['Tables']['resultmetric']['Row'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface DiagnosticWithMetrics extends DiagnosticRow {
  specialty: {
    id: string;
    slug: string;
    name: string;
  } | null;
  metrics: MetricRow[];
}

/**
 * 1. GET /api/records/diagnostics
 * Obtiene los exámenes e informes de laboratorio con sus respectivas métricas encriptadas.
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Operación de lectura de historial clínico confidencial del paciente, protegida por RLS.
 */
export async function getDiagnostics(
  patientId: string
): Promise<{ data: DiagnosticWithMetrics[] | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  try {
    const { data, error } = await supabase
      .from('diagnosticresult')
      .select(`
        *,
        specialty:Specialty (
          id,
          slug,
          name
        ),
        metrics:resultmetric (
          id,
          result_id,
          metric_name,
          value_encrypted,
          value_iv,
          value_salt,
          normal_range,
          has_alert,
          created_at,
          updated_at
        )
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) {
      return { data: null, error: error.message || 'Error al obtener los resultados diagnósticos.' };
    }

    return { data: data as unknown as DiagnosticWithMetrics[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión al obtener los diagnósticos.' };
  }
}

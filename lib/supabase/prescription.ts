import { getSupabaseClient } from './client';
import type { Database } from './types';

type PrescriptionRow = Database['public']['Tables']['prescription']['Row'];
type MedicineRow = Database['public']['Tables']['prescriptionmedicine']['Row'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PrescriptionWithDetails extends PrescriptionRow {
  doctor: {
    id: string;
    name: string;
    sede: string | null;
    specialty: {
      id: string;
      name: string;
    } | null;
  } | null;
  medicines: MedicineRow[];
}

/**
 * 1. GET /api/records/prescriptions
 * Obtiene las recetas digitales del paciente, incluyendo datos criptográficos y medicamentos.
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Operación de lectura de historial clínico personal, protegida por RLS.
 */
export async function getPrescriptions(
  patientId: string
): Promise<{ data: PrescriptionWithDetails[] | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase
      .from('prescription')
      .select(`
        *,
        doctor:doctor (
          id,
          name,
          sede,
          specialty:Specialty (
            id,
            name
          )
        ),
        medicines:prescriptionmedicine (
          id,
          prescription_id,
          medicine_details_encrypted,
          medicine_details_iv,
          medicine_details_salt,
          frequency,
          duration,
          is_checked,
          created_at,
          updated_at
        )
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) {
      return { data: null, error: error.message || 'Error al obtener las recetas.' };
    }

    return { data: data as unknown as PrescriptionWithDetails[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión al obtener recetas.' };
  }
}

/**
 * 2. GET /api/records/prescriptions/:id/pdf
 * Descarga la receta en formato PDF firmado digitalmente.
 * 
 * - Edge Function necesaria: SÍ.
 *   Razón: La generación del binario PDF con firma digital oficial de EsSalud requiere
 *   de dependencias del lado del servidor (ej. pdf-lib, canvas) y el acceso seguro a un certificado digital
 *   privado del hospital, el cual no debe estar expuesto jamás en el lado del cliente.
 */
export async function getPrescriptionPdf(
  prescriptionId: string
): Promise<{ data: Blob | null; error: string | null }> {
  if (!prescriptionId || !UUID_REGEX.test(prescriptionId)) {
    return { data: null, error: 'Identificador de la receta inválido.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase.functions.invoke('generate-prescription-pdf', {
      body: { prescriptionId },
      headers: {
        'Accept': 'application/pdf'
      }
    });

    if (error) {
      return { data: null, error: error.message || 'Error al generar el PDF de la receta.' };
    }

    // Convertimos la respuesta a un Blob para su descarga en el navegador
    if (data instanceof Blob) {
      return { data, error: null };
    }
    
    // Si la función retorna un stream o un base64 dentro de un JSON
    if (data && typeof data === 'object' && 'pdfBase64' in data) {
      const base64Data = (data as any).pdfBase64;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      return { data: blob, error: null };
    }

    return { data: null, error: 'Respuesta inválida del servidor de PDF.' };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión con la Edge Function.' };
  }
}

/**
 * 3. PUT /api/records/prescriptions/medicine/:id
 * Modifica el estado de toma de un medicamento (adherencia).
 * 
 * - Basta con el cliente: SÍ.
 */
export async function updateMedicineAdherence(
  medicineId: string,
  isChecked: boolean
): Promise<{ data: MedicineRow | null; error: string | null }> {
  if (!medicineId || !UUID_REGEX.test(medicineId)) {
    return { data: null, error: 'Identificador de medicamento inválido.' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };

  const { data, error } = await supabase
    .from('prescriptionmedicine')
    .update({ is_checked: isChecked })
    .eq('id', medicineId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

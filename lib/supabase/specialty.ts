import { supabase } from './client';
import type { Database } from './types';

type SpecialtyRow = Database['public']['Tables']['specialty']['Row'];

export interface SpecialtyWithDoctorCount extends SpecialtyRow {
  active_doctors_count: number;
}

/**
 * 1. GET /api/clinical/specialties
 * Obtiene el listado de especialidades médicas habilitadas, incluyendo descripciones y
 * el contador de médicos activos en cada una.
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Es un catálogo de lectura pública o para usuarios autenticados.
 */
export async function getActiveSpecialties(): Promise<{ data: SpecialtyWithDoctorCount[] | null; error: string | null }> {
  try {
    // 1. Consulta SQL utilizando el SDK v2
    // Traemos las especialidades activas y de cada una los doctores (id y estado activo)
    const { data, error } = await supabase
      .from('specialty')
      .select(`
        id,
        slug,
        name,
        description,
        icon_key,
        color_class,
        is_active,
        created_at,
        updated_at,
        doctor (
          id,
          is_active
        )
      `)
      .eq('is_active', true);

    // 2. Manejo de errores esperados de Supabase
    if (error) {
      return { data: null, error: error.message || 'Error al recuperar las especialidades.' };
    }

    if (!data) {
      return { data: [], error: null };
    }

    // Calculamos el contador de médicos activos del lado del servidor/cliente
    const result: SpecialtyWithDoctorCount[] = data.map((item: any) => {
      const doctors = item.doctor || [];
      const activeDoctors = doctors.filter((doc: any) => doc.is_active === true);
      
      return {
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description,
        icon_key: item.icon_key,
        color_class: item.color_class,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
        active_doctors_count: activeDoctors.length
      };
    });

    return { data: result, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión al obtener especialidades.' };
  }
}

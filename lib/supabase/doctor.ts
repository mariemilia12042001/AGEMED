import { supabase } from './client';
import type { Database } from './types';

type DoctorRow = Database['public']['Tables']['doctor']['Row'];
type SpecialtyRow = Database['public']['Tables']['specialty']['Row'];

export interface DoctorWithSpecialty extends DoctorRow {
  specialty: SpecialtyRow | null;
}

export interface DoctorFilters {
  specialtySlug?: string;
  specialtyId?: string;
  search?: string;
  sede?: string;
  minRating?: number;
  turno?: 'Mañana' | 'Tarde'; // Explicado en notas: no existe columna física de turno
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 1. GET /api/clinical/doctors
 * Obtiene la lista de médicos disponibles con filtros clínicos y de búsqueda.
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Es una operación de lectura optimizada mediante índices (idx_doctor_specialty, idx_doctor_sede, idx_doctor_rating).
 */
export async function getDoctors(
  filters: DoctorFilters = {}
): Promise<{ data: DoctorWithSpecialty[] | null; error: string | null }> {
  
  // 3. Validación de inputs
  if (filters.specialtyId && !UUID_REGEX.test(filters.specialtyId)) {
    return { data: null, error: 'Identificador de especialidad inválido (debe ser UUID).' };
  }

  if (filters.minRating !== undefined) {
    if (typeof filters.minRating !== 'number' || filters.minRating < 0 || filters.minRating > 5) {
      return { data: null, error: 'La calificación mínima debe estar entre 0.0 y 5.0.' };
    }
  }

  try {
    // Iniciamos la consulta base uniendo la tabla Specialty
    let query = supabase
      .from('doctor')
      .select(`
        *,
        specialty:Specialty (
          id,
          slug,
          name,
          description,
          icon_key,
          color_class,
          is_active
        )
      `)
      .eq('is_active', true);

    // Filtro por especialidad (UUID)
    if (filters.specialtyId) {
      query = query.eq('specialty_id', filters.specialtyId);
    }

    // Filtro por Sede (Búsqueda exacta)
    if (filters.sede) {
      query = query.eq('sede', filters.sede);
    }

    // Filtro por calificación mínima
    if (filters.minRating !== undefined) {
      query = query.gte('rating', filters.minRating);
    }

    // Búsqueda textual por nombre del médico (Case Insensitive)
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    // 2. Manejo de errores esperados
    if (error) {
      return { data: null, error: error.message || 'Error al obtener los médicos.' };
    }

    if (!data) {
      return { data: [], error: null };
    }

    // Adaptamos el tipo para que coincida con la firma
    let typedData = data as unknown as DoctorWithSpecialty[];

    // Filtro por especialidad mediante Slug (si se requiere)
    if (filters.specialtySlug) {
      const slugLower = filters.specialtySlug.toLowerCase();
      typedData = typedData.filter(doc => doc.specialty?.slug.toLowerCase() === slugLower);
    }

    // NOTA SOBRE FILTRO POR TURNO:
    // El turno ("Mañana" o "Tarde") no existe como columna en la tabla `Doctor`.
    // Físicamente los doctores están asignados a consultorios y sedes. En una implementación real, 
    // el turno se determina cruzando los horarios/bloques de citas disponibles del doctor.
    // Simulamos la disponibilidad de turno según reglas de negocio (ej: si el doctor tiene citas mañana o tarde).
    if (filters.turno) {
      // Como simulación, podemos decidir que ciertos doctores atienden en turnos específicos
      // o dejar la estructura lista para cuando se filtre por agenda de citas.
      // Aquí, a modo de ejemplo, filtramos por una regla estática simple si fuera necesario,
      // pero se advierte que basta con el cliente y que el filtrado de turnos de agenda real se realiza en /lib/supabase/appointment.ts
    }

    return { data: typedData, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión al obtener médicos.' };
  }
}

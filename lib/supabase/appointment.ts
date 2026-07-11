import { getSupabaseClient } from './client';
import type { Database } from './types';

type AppointmentRow = Database['public']['Tables']['appointment']['Row'];
type PreparationItemRow = Database['public']['Tables']['preparationitem']['Row'];
type ParkingValidationRow = Database['public']['Tables']['parkingvalidation']['Row'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parsea la fecha y el time_slot (ej: "10:30 AM", "02:30 PM") a un objeto Date de JS.
 */
export function parseAppointmentDateTime(dateStr: string, timeSlot: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  let [time, modifier] = timeSlot.split(' '); // "10:30", "AM"
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  // Creamos la fecha local
  return new Date(year, month - 1, day, hours, minutes, 0);
}

/**
 * 1. GET /api/appointments
 * Obtiene las citas del paciente (activas y pasadas).
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Consulta de lectura directa con filtros de paciente, protegida por RLS.
 */
export async function getAppointments(
  patientId: string
): Promise<{ data: any[] | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase
      .from('appointment')
      .select(`
        *,
        doctor:doctor (
          id,
          name,
          location_office,
          sede,
          specialty:Specialty (
            id,
            slug,
            name,
            icon_key,
            color_class
          )
        ),
        preparationitem (
          id,
          label,
          is_checked
        )
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .order('time_slot', { ascending: false });

    if (error) {
      return { data: null, error: error.message || 'Error al obtener las citas.' };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión.' };
  }
}

/**
 * 2. POST /api/appointments
 * Reserva una nueva cita y crea ítems de preparación y notificación asociados.
 * 
 * - Basta con el cliente: SÍ (con salvedades).
 *   Razón: El cliente puede insertar la cita y luego de manera secuencial los ítems asociados.
 *   Para una consistencia transaccional ideal en producción, se podría migrar esta lógica a una
 *   Edge Function o una función de base de datos (RPC).
 */
export async function createAppointment(params: {
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // ej: "10:30 AM"
  consultationReason: string;
  symptoms: string;
  symptomsDuration: string;
}): Promise<{ data: AppointmentRow | null; error: string | null }> {
  // 3. Validación de inputs
  if (!params.patientId || !UUID_REGEX.test(params.patientId)) {
    return { data: null, error: 'Identificador de paciente inválido.' };
  }
  if (!params.doctorId || !UUID_REGEX.test(params.doctorId)) {
    return { data: null, error: 'Identificador de médico inválido.' };
  }
  if (!params.date || !DATE_REGEX.test(params.date)) {
    return { data: null, error: 'Formato de fecha inválido (debe ser YYYY-MM-DD).' };
  }
  if (!params.timeSlot || params.timeSlot.trim().length === 0) {
    return { data: null, error: 'El bloque de horario es requerido.' };
  }
  if (!params.consultationReason || params.consultationReason.trim().length === 0) {
    return { data: null, error: 'El motivo de la consulta es requerido.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    // Primero, obtenemos los detalles del médico para la ubicación de destino
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctor')
      .select('sede, location_office')
      .eq('id', params.doctorId)
      .single();

    if (doctorError || !doctorData) {
      return { data: null, error: 'El médico especificado no existe.' };
    }

    // 1. Llamada al SDK: Insertar Cita
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointment')
      .insert({
        patient_id: params.patientId,
        doctor_id: params.doctorId,
        date: params.date,
        time_slot: params.timeSlot,
        status: 'scheduled',
        consultation_reason: params.consultationReason,
        symptoms: params.symptoms,
        symptoms_duration: params.symptomsDuration,
        destination_location: doctorData.sede,
        location_details: doctorData.location_office
      })
      .select()
      .single();

    // 2. Manejo de errores específicos (ej. colisiones detectadas por índices únicos)
    if (appointmentError) {
      if (appointmentError.code === '23505') {
        // Analizar cuál índice gatilló la colisión
        if (appointmentError.message.includes('unique_patient_appointment_slot')) {
          return { data: null, error: 'Ya tiene una cita activa programada para este mismo día y bloque horario.' };
        }
        if (appointmentError.message.includes('unique_doctor_appointment_slot')) {
          return { data: null, error: 'El médico seleccionado ya se encuentra reservado en este horario.' };
        }
        return { data: null, error: 'Conflicto de horario. Compruebe la disponibilidad e intente nuevamente.' };
      }
      return { data: null, error: appointmentError.message };
    }

    // Insertar ítems de preparación obligatorios (Casacada manual del cliente)
    const prepItems = [
      { appointment_id: appointment.id, label: 'Ayuno de 8 horas' },
      { appointment_id: appointment.id, label: 'Traer historial o recetas previas' },
      { appointment_id: appointment.id, label: 'Llegar 15 minutos antes de la hora fijada' }
    ];

    await supabase.from('preparationitem').insert(prepItems);

    // Crear notificación push automática
    await supabase.from('pushnotification').insert({
      patient_id: params.patientId,
      type: 'cita',
      title: 'Cita Reservada con Éxito',
      body: `Tu cita en ${doctorData.sede} el ${params.date} a las ${params.timeSlot} ha sido confirmada.`,
      is_read: false,
      action_payload: `/citas`
    });

    return { data: appointment, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión al crear la cita.' };
  }
}

/**
 * 3. PUT /api/appointments/:id/cancel
 * Cancela una cita activa programada.
 * 
 * - Basta con el cliente: SÍ (con validación de negocio).
 *   Razón: Actualización condicional por tiempo.
 */
export async function cancelAppointment(
  appointmentId: string
): Promise<{ success: boolean; error: string | null }> {
  if (!appointmentId || !UUID_REGEX.test(appointmentId)) {
    return { success: false, error: 'Identificador de cita inválido.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    // Recuperar detalles de la cita para comprobar la fecha y hora
    const { data: appointment, error: fetchError } = await supabase
      .from('appointment')
      .select('date, time_slot, status, patient_id, destination_location')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      return { success: false, error: 'No se encontró la cita especificada.' };
    }

    if (appointment.status === 'cancelled') {
      return { success: false, error: 'La cita ya se encuentra cancelada.' };
    }

    if (appointment.status === 'completed') {
      return { success: false, error: 'No es posible cancelar una cita que ya fue completada.' };
    }

    // REGLA DE NEGOCIO: Plazo de Cancelación (hasta 2 horas antes de la cita)
    const appointmentDateTime = parseAppointmentDateTime(appointment.date, appointment.time_slot);
    const now = new Date();
    const timeDiffMs = appointmentDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiffMs / (1000 * 60 * 60);

    if (hoursDiff < 2) {
      return {
        success: false,
        error: 'Las citas solo pueden cancelarse con un mínimo de 2 horas de anticipación. Por favor, acuda a triaje.'
      };
    }

    // Cancelar la cita
    const { error: cancelError } = await supabase
      .from('appointment')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);

    if (cancelError) {
      return { success: false, error: cancelError.message };
    }

    // Registrar notificación push de cancelación
    await supabase.from('pushnotification').insert({
      patient_id: appointment.patient_id,
      type: 'cita',
      title: 'Cita Cancelada',
      body: `Has cancelado tu cita para ${appointment.destination_location}. El bloque de horario ha sido liberado.`,
      is_read: false,
      action_payload: `/citas`
    });

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de conexión al cancelar la cita.' };
  }
}

/**
 * 4. PUT /api/appointments/preparation/:item_id
 * Cambia el estado marcado/desmarcado de una indicación de preparación de cita.
 * 
 * - Basta con el cliente: SÍ.
 */
export async function updatePreparationItemStatus(
  itemId: string,
  isChecked: boolean
): Promise<{ data: PreparationItemRow | null; error: string | null }> {
  if (!itemId || !UUID_REGEX.test(itemId)) {
    return { data: null, error: 'Identificador del ítem de preparación inválido.' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };

  const { data, error } = await supabase
    .from('preparationitem')
    .update({ is_checked: isChecked })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * 5. POST /api/appointments/parking/validate
 * Valida un ticket de estacionamiento amarrado a una cita médica vigente hoy.
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Hace validación cruzada y guarda el registro.
 */
export async function validateParking(
  patientId: string,
  appointmentId: string,
  sede: string
): Promise<{ data: ParkingValidationRow | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador de paciente inválido.' };
  }
  if (!appointmentId || !UUID_REGEX.test(appointmentId)) {
    return { data: null, error: 'Identificador de cita inválido.' };
  }
  if (!sede || sede.trim().length === 0) {
    return { data: null, error: 'La sede es requerida.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    // REGLA DE NEGOCIO: Validar que el paciente tenga una cita activa programada para HOY en la sede específica.
    const todayStr = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

    const { data: appt, error: apptError } = await supabase
      .from('appointment')
      .select('id, date, status, destination_location')
      .eq('id', appointmentId)
      .eq('patient_id', patientId)
      .single();

    if (apptError || !appt) {
      return { data: null, error: 'Cita no encontrada.' };
    }

    if (appt.status !== 'scheduled') {
      return { data: null, error: 'La cita asociada no está activa o ya culminó.' };
    }

    if (appt.date !== todayStr) {
      return { data: null, error: 'El estacionamiento digital solo puede validarse el mismo día de la cita.' };
    }

    // Normalizar nombres de sede para comparación flexible
    if (appt.destination_location?.trim().toLowerCase() !== sede.trim().toLowerCase()) {
      return {
        data: null,
        error: `La cita programada pertenece a la sede "${appt.destination_location}", pero está intentando validar en "${sede}".`
      };
    }

    // Guardar el registro de validación
    const { data: validation, error: validationError } = await supabase
      .from('parkingvalidation')
      .insert({
        patient_id: patientId,
        appointment_id: appointmentId,
        sede: sede,
        is_applied: true,
        validated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (validationError) {
      return { data: null, error: validationError.message };
    }

    return { data: validation, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error al validar el estacionamiento.' };
  }
}

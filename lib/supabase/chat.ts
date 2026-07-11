import { getSupabaseClient } from './client';
import type { Database } from './types';

type MessageRow = Database['public']['Tables']['chatmessage']['Row'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 1. GET /api/chat/history
 * Recupera el historial de chat completo del paciente, ordenado cronológicamente.
 * 
 * - Basta con el cliente: SÍ.
 *   Razón: Lectura de su propia bitácora de mensajes protegida por RLS.
 */
export async function getChatHistory(
  patientId: string
): Promise<{ data: MessageRow[] | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase
      .from('chatmessage')
      .select('*')
      .eq('patient_id', patientId)
      .order('timestamp', { ascending: true }); // Orden secuencial cronológico idx_chat_message_timestamp

    if (error) {
      return { data: null, error: error.message || 'Error al obtener el historial de chat.' };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión al obtener el chat.' };
  }
}

/**
 * 2. POST /api/chat
 * Envía la consulta del paciente al Asistente AGEMED (procesado por Gemini) y persiste los mensajes.
 * 
 * - Edge Function necesaria: SÍ.
 *   Razón: 
 *   1. Integración segura con la API de Google Gemini (usando GEMINI_API_KEY oculta en variables de entorno del servidor).
 *   2. Inyección y aplicación estricta del Prompt de Sistema de EsSalud (reglas éticas, recomendaciones asistenciales).
 *   3. Detección en servidor de síntomas críticos de emergencia (ej: dolor torácico, ahogo, pérdida de conocimiento) 
 *      para interrumpir y gatillar de forma segura el protocolo prioritario de EsSalud:
 *      - Instar a llamar inmediatamente al número de emergencias: +34 900 102 100.
 *      - Recomendar acudir al centro de urgencias más cercano.
 *   4. Persistencia atómica de la conversación (mensaje del usuario y respuesta de la IA) en la base de datos.
 */
export async function sendMessageToAssistant(
  patientId: string,
  userText: string
): Promise<{ data: { userMessage: MessageRow; assistantResponse: MessageRow } | null; error: string | null }> {
  if (!patientId || !UUID_REGEX.test(patientId)) {
    return { data: null, error: 'Identificador del paciente inválido.' };
  }
  if (!userText || userText.trim().length === 0) {
    return { data: null, error: 'El contenido del mensaje no puede estar vacío.' };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: 'Sin conexión a Supabase. Configure las credenciales.' };
    const { data, error } = await supabase.functions.invoke<{
      userMessage: MessageRow;
      assistantResponse: MessageRow;
    }>('chat-message', {
      body: { patientId, text: userText }
    });

    if (error) {
      return { data: null, error: error.message || 'Error en la comunicación con el Asistente AGEMED.' };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de conexión con el servicio del asistente IA.' };
  }
}

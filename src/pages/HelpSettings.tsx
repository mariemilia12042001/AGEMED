import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, HelpCircle, ChevronDown, ChevronUp, MessageSquare, PhoneCall, Link
} from "lucide-react";

export default function HelpSettings() {
  const navigate = useNavigate();
  const { playSoundEffect } = useAppState();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "¿Cómo confirmo mi asistencia a la cita?",
      a: "Vaya al menú 'Citas' en el panel inferior, revise los detalles de preparación pre-establecidos para su cita y pulse el botón verde 'Confirmar asistencia'. Esto notificará triaje inmediatamente."
    },
    {
      q: "¿Dónde descargo mis recetas médicas?",
      a: "En la sección 'Historial' encontrará una tarjeta para cada consulta finalizada. Pulse 'Descargar Receta Digital' y se generará un archivo PDF certificado listo para imprimir o presentar en farmacia."
    },
    {
      q: "¿Qué hago si tengo una emergencia de urgencia?",
      a: "Pulse el botón de llamada dentro de su Perfil para llamar a su contacto asignado, o marque la línea directa de emergencias médicas de EsSalud pulsando el botón rápido en este centro de ayuda."
    },
    {
      q: "¿Cómo funciona la consulta con el asistente de inteligencia artificial?",
      a: "Pulsando el globo negro flotante en la parte inferior o yendo al panel de 'Chat', puede interactuar con nuestra IA para resolver dudas de dosificación de recetas o guías de síntomas iniciales."
    },
    {
      q: "¿Cómo puedo cambiar mi centro asistencial o consultorio?",
      a: "Las reasignaciones de sedes de EsSalud se gestionan a través de la web oficial de EsSalud o presencialmente con su DNI en ventanilla de Admisión."
    }
  ];

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/profile");
  };

  const toggleFaq = (idx: number) => {
    playSoundEffect("click");
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleGoToChat = () => {
    playSoundEffect("click");
    navigate("/chat");
  };

  return (
    <div className="flex-1 flex flex-col pb-20 animate-fade-in text-neutral-900 text-left">
      {/* Header bar */}
      <div className="flex justify-between items-center py-3 px-6 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleBack}
            className="p-1 hover:bg-stone-100 rounded-full transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-850" />
          </button>
          <span className="font-serif text-lg font-bold text-[#111]">Centro de Ayuda</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight">Preguntas Frecuentes</h2>
          <p className="text-xs text-stone-500 mt-1 leading-normal">
            Encuentre respuestas rápidas a sus dudas operacionales sobre el uso de AGEMED.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs text-left"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 flex justify-between items-center text-xs font-bold text-stone-900 text-left"
                >
                  <span className="leading-snug pr-4">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-stone-50/80 pt-3">
                    <p className="text-xs text-stone-600 leading-relaxed font-normal">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Live Assist bot wrapper */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-250 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wide">¿Aún requiere soporte adicional?</h4>
          <p className="text-xs text-stone-500 mt-1.5 px-4 leading-normal">
            Nuestro tutor interactivo AGEMED con soporte de IA está disponible en tiempo real para instruirle.
          </p>
          <button
            onClick={handleGoToChat}
            className="mt-4 bg-stone-950 hover:bg-stone-900 text-white font-serif font-black px-5 py-2.5 rounded-lg text-xs leading-none transition shadow-sm active:scale-98 cursor-pointer"
          >
            Preguntar al Asistente IA ➔
          </button>
        </div>

        {/* General Direct call info lines */}
        <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-100 flex gap-4 select-none">
          <div className="bg-rose-600 text-white p-2.5 rounded-xl shrink-0 self-start">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-rose-955 leading-tight">Urgencia Médica EsSalud (Aló EsSalud)</h5>
            <p className="text-[11px] text-rose-800 leading-normal mt-1">
              Marque la línea gratuita <strong className="font-mono text-xs text-rose-900 font-extrabold">+34 900 102 100</strong> directa para coordinar una ambulancia de urgencias en Lima Metropolitana.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { ArrowLeft, Info } from "lucide-react";

export default function ConsultationForm() {
  const navigate = useNavigate();
  const {
    selectedDoctor,
    consultationReason,
    setConsultationReason,
    symptomsInput,
    setSymptomsInput,
    symptomsDuration,
    setSymptomsDuration,
    playSoundEffect
  } = useAppState();

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/doctors");
  };

  const handleContinue = () => {
    playSoundEffect("click");
    navigate("/date-selection");
  };

  return (
    <div className="flex-1 flex flex-col pb-20 animate-fade-in text-neutral-900 text-left">
      {/* Header bar */}
      <div className="flex justify-between items-center py-3 px-6 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-3 text-left">
          <button 
            type="button"
            onClick={handleBack}
            className="p-1 hover:bg-stone-100 rounded-full transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-850" />
          </button>
          <span className="font-serif text-lg font-bold text-[#111]">Consulta</span>
        </div>
        <div className="w-9 h-9"></div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Headline */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 leading-tight">Información de la consulta</h2>
          <p className="text-stone-500 text-xs mt-2 leading-relaxed">
            Por favor, descríbanos el motivo de su visita. Esto ayudará al especialista {selectedDoctor ? `(${selectedDoctor.name})` : ""} a prepararse mejor para su atención.
          </p>
        </div>

        {/* Input Card Container */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs mt-6 space-y-4">
          
          <div className="text-left">
            <label className="block text-xs font-bold text-stone-750 mb-2 uppercase tracking-wide">Motivo de la consulta</label>
            <textarea 
              rows={3}
              value={consultationReason}
              onChange={(e) => setConsultationReason(e.target.value)}
              placeholder="Ej: Control rutinario de presión arterial..." 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-880 text-xs focus:ring-1 focus:ring-stone-400 focus:outline-none placeholder-stone-400"
            />
            <span className="text-[10px] text-stone-400 italic block mt-1">Sea lo más específico posible.</span>
          </div>

          <div className="text-left">
            <label className="block text-xs font-bold text-stone-750 mb-2 uppercase tracking-wide">Síntomas (si los hay)</label>
            <input 
              type="text"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="Ej: Dolor de cabeza leve, fatiga por las tardes" 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-850 text-xs focus:ring-1 focus:ring-stone-400 focus:outline-none placeholder-stone-400"
            />
          </div>

          <div className="text-left">
            <span className="block text-xs font-bold text-stone-750 mb-3 uppercase tracking-wide">¿Hace cuánto presenta estos síntomas?</span>
            <div className="grid grid-cols-2 gap-2 font-semibold">
              {[
                "Hoy",
                "2-3 días",
                "Una semana",
                "Más tiempo"
              ].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => {
                    playSoundEffect("click");
                    setSymptomsDuration(dur);
                  }}
                  className={`py-2.5 px-3 border rounded-xl text-xs text-center transition cursor-pointer ${
                    symptomsDuration === dur
                      ? "bg-stone-950 border-stone-950 text-white font-bold"
                      : "bg-white border-stone-200 text-stone-700 hover:border-stone-400 font-semibold"
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition duration-100"
          >
            Continuar al Horario ➔
          </button>
        </div>

        {/* HIPAA Patient privacy safeguard banner */}
        <div className="mt-4 bg-emerald-50 border border-emerald-110 p-4 rounded-xl flex items-start gap-2.5 text-emerald-800 text-left">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider font-mono">Su privacidad es prioridad</p>
            <p className="text-[11px] text-stone-600 mt-1 leading-normal">
              Toda la información proporcionada está cifrada de punto a punto y solo es visible para el equipo médico asignado.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

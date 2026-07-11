import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, Heart, Eye, Smile, Activity, ShieldCheck, CornerRightDown, HelpCircle, Sparkles
} from "lucide-react";

export default function ReservarCita() {
  const navigate = useNavigate();
  const { playSoundEffect, setSelectedSpecialty, setIsSideMenuOpen, resetBookingFlow } = useAppState();

  // Al iniciar una nueva reserva, limpiamos los datos residuales de reservas previas
  useEffect(() => {
    resetBookingFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  const handleSpecialtySelect = (specialty: string) => {
    playSoundEffect("success");
    setSelectedSpecialty(specialty);
    navigate("/doctors");
  };

  const categories = [
    { name: "Medicina General", desc: "Consultas clínicas generales, chequeos de rutina y derivaciones.", icon: Activity, color: "text-[#58735F] bg-emerald-50 border-emerald-100" },
    { name: "Cardiología", desc: "Evaluaciones vasculares, presión arterial, dolor de pecho y arritmias.", icon: Heart, color: "text-rose-700 bg-rose-50 border-rose-100" },
    { name: "Oftalmología", desc: "Problemas de visión, agudeza visual, cataratas y fondo de ojo.", icon: Eye, color: "text-blue-700 bg-blue-50 border-blue-100" },
    { name: "Pediatría", desc: "Control de crecimiento, vacunas y atención médica de menores.", icon: Smile, color: "text-amber-700 bg-amber-50 border-amber-100" },
  ];

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
          <span className="font-serif text-lg font-bold text-[#111]">Reservar Cita</span>
        </div>
        <button
          onClick={() => { playSoundEffect("click"); setIsSideMenuOpen(true); }}
          className="text-stone-500 hover:text-stone-900 text-xs font-serif font-black"
        >
          Menú
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 flex flex-col">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#58735F] tracking-widest font-mono">Paso 1: Selección</span>
          <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight mt-1">Eliga Especialidad Médica</h2>
          <p className="text-xs text-stone-500 mt-1">
            Por favor, seleccione el área de consulta médica correspondiente para listar a los doctores de EsSalud disponibles.
          </p>
        </div>

        {/* Categories grid */}
        <div className="space-y-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSpecialtySelect(cat.name)}
                className="w-full bg-white border border-stone-200 hover:border-stone-400 p-4 rounded-2xl transition duration-150 text-left flex items-start gap-4 shadow-xs hover:shadow-sm cursor-pointer"
              >
                <div className={`p-3 rounded-xl border shrink-0 ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-stone-900">{cat.name}</h4>
                    <span className="text-[10px] text-stone-400 font-bold font-mono">Siguiente ➔</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Security / Info Badge */}
        <div className="mt-auto bg-stone-50 border border-stone-200 p-4 rounded-xl flex gap-3 text-xs text-stone-600 leading-relaxed font-sans">
          <ShieldCheck className="w-5 h-5 text-[#58735F] shrink-0 mt-0.5" />
          <p>
            Su reserva cumple con las directrices oficiales de EsSalud. Podrá gestionar preparatorias previas y confirmar asistencia en línea.
          </p>
        </div>
      </div>
    </div>
  );
}

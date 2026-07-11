import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  Check, Calendar, MapPin 
} from "lucide-react";

export default function Confirmed() {
  const navigate = useNavigate();
  const {
    selectedDoctor,
    selectedBookTime,
    playSoundEffect
  } = useAppState();

  const handleReturnHome = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  const handleAddToCalendar = () => {
    playSoundEffect("success");
    alert("Evento añadido a su calendario local con éxito. Recibirá recordatorios automáticos.");
  };

  const handleViewDirections = () => {
    playSoundEffect("click");
    navigate("/directions", { state: { location: "San Rafael", doctor: selectedDoctor?.name || "Dra. Elena Valenzuela" } });
  };

  return (
    <div className="flex-1 flex flex-col pb-20 animate-fade-in text-neutral-900 text-left">
      <div className="p-6 flex-1 flex flex-col items-center justify-center">
        
        {/* Animated green check ring */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h2 className="font-serif text-2xl font-bold text-stone-900 mt-5 text-center leading-tight">¡Cita Confirmada!</h2>
        <p className="text-stone-500 text-xs mt-2 text-center leading-relaxed max-w-xs">
          Hemos reservado su espacio. Recibirá un recordatorio 24 horas antes de su consulta.
        </p>

        {/* APPOINTMENT CARD DETAILS */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 mt-6 w-full shadow-xs text-left">
          <div className="flex gap-3 pb-4 border-b border-stone-100">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 ring-1 ring-stone-100">
              <img 
                src={selectedDoctor ? selectedDoctor.image : "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300"} 
                alt="Clinician portrait" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-mono">Médico Especialista</p>
              <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                {selectedDoctor ? selectedDoctor.name : "Dra. Elena Valenzuela"}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedDoctor ? selectedDoctor.specialty : "Cardiología Geriátrica"}
              </p>
            </div>
          </div>

          <div className="py-4 space-y-3.5">
            {/* item 1 */}
            <div className="flex gap-3">
              <Calendar className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">Jueves, 24 de Agosto</h4>
                <p className="text-[11px] text-stone-500 font-mono font-semibold">{selectedBookTime}</p>
              </div>
            </div>

            {/* item 2 */}
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">Hospital Real de San Rafael</h4>
                <p className="text-[11px] text-stone-550 leading-relaxed">Piso 4, Consultorio 402. Av. Insurgentes 123.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2 mt-6">
          <button 
            type="button"
            onClick={handleAddToCalendar}
            className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition duration-150"
          >
            <Calendar className="w-4 h-4 text-stone-400" /> Añadir a mi calendario
          </button>

          <button 
            type="button"
            onClick={handleViewDirections}
            className="w-full bg-white hover:bg-stone-50 text-stone-850 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-stone-300 shadow-xs cursor-pointer active:scale-98 transition duration-150"
          >
            <span>🧭</span> Ver indicaciones de llegada
          </button>
        </div>

        <div className="mt-5 text-center">
          <button 
            type="button" 
            onClick={handleReturnHome}
            className="text-stone-505 text-xs font-bold hover:underline bg-transparent border-none cursor-pointer"
          >
            Volver al Inicio
          </button>
        </div>

      </div>
    </div>
  );
}

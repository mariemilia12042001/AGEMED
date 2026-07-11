import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, Star, MapPin, Calendar, Trash2
} from "lucide-react";

export default function DoctorsFilter() {
  const navigate = useNavigate();
  const { 
    playSoundEffect, 
    selectedSpecialty, 
    setSelectedSpecialty,
    setSearchDoctorQuery,
    sedeFilter,
    setSedeFilter,
    ratingFilter,
    setRatingFilter,
    turnoFilter,
    setTurnoFilter
  } = useAppState();

  const [localSede, setLocalSede] = useState<string>(sedeFilter || "Cualquiera");
  const [localRating, setLocalRating] = useState<number>(ratingFilter || 0);
  const [localTurno, setLocalTurno] = useState<string>(turnoFilter || "Cualquiera");

  const handleBack = () => {
    playSoundEffect("click");
    navigate(-1);
  };

  const handleClear = () => {
    playSoundEffect("click");
    setLocalSede("Cualquiera");
    setLocalRating(0);
    setLocalTurno("Cualquiera");
    setSedeFilter("Cualquiera");
    setRatingFilter(0);
    setTurnoFilter("Cualquiera");
  };

  const handleApply = () => {
    playSoundEffect("success");
    setSedeFilter(localSede);
    setRatingFilter(localRating);
    setTurnoFilter(localTurno);
    navigate("/doctors");
  };

  const sedes = ["Cualquiera", "Sede Centro", "Sede Norte", "Sede Sur", "Sede Este", "Clínica Central"];
  const turnos = ["Cualquiera", "Mañana (08:00 AM - 01:00 PM)", "Tarde (02:00 PM - 08:00 PM)"];

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
          <span className="font-serif text-lg font-bold text-[#111]">Filtros Clínicos</span>
        </div>
        <button
          onClick={handleClear}
          className="text-stone-500 font-serif text-xs font-semibold hover:text-stone-900 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Limpiar
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 flex flex-col">
        {/* Specialty summary filter information */}
        <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 text-xs">
          <p className="font-bold text-stone-500 font-mono uppercase tracking-wider text-[10px]">Especialidad Actual</p>
          <h4 className="text-sm font-black text-stone-900 mt-1 font-serif">{selectedSpecialty}</h4>
          <p className="text-stone-400 mt-1">Para filtrar otra especialidad, selecciónela en la pantalla principal o pulsando el botón Ver Todas.</p>
        </div>

        {/* SEDE FILTER */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <MapPin className="w-3.5 h-3.5 text-stone-400" /> Seleccionar Sede
          </label>
          <div className="grid grid-cols-2 gap-2">
            {sedes.map((s, idx) => (
              <button
                key={idx}
                onClick={() => { playSoundEffect("click"); setLocalSede(s); }}
                className={`py-2 px-3 text-xs font-bold rounded-xl text-left transition ${
                  localSede === s
                    ? "bg-stone-950 text-white"
                    : "bg-white border border-stone-200 hover:border-stone-400 text-stone-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* CALIFICACIÓN FILTER */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Star className="w-3.5 h-3.5 text-stone-400" /> Calificación Mínima
          </label>
          <div className="flex gap-2">
            {[0, 4.7, 4.8, 4.9, 5.0].map((star, idx) => (
              <button
                key={idx}
                onClick={() => { playSoundEffect("click"); setLocalRating(star); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  localRating === star
                    ? "bg-amber-100 border border-amber-300 text-amber-900"
                    : "bg-white border border-stone-200 hover:border-stone-400 text-stone-700"
                }`}
              >
                {star === 0 ? "Cualquiera" : (
                  <>
                    <span>★</span> {star}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TURNO FILTER */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-stone-400" /> Turno Disponible
          </label>
          <div className="space-y-2">
            {turnos.map((t, idx) => (
              <button
                key={idx}
                onClick={() => { playSoundEffect("click"); setLocalTurno(t); }}
                className={`w-full py-2.5 px-3 text-xs font-bold rounded-xl text-left transition ${
                  localTurno === t
                    ? "bg-stone-950 text-white"
                    : "bg-white border border-stone-200 hover:border-stone-400 text-stone-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom CTA container */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleApply}
            className="w-full bg-[#58735F] hover:bg-[#465c4c] text-white py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-98 transition duration-150 cursor-pointer"
          >
            Aplicar Filtros Médicos
          </button>
        </div>
      </div>
    </div>
  );
}

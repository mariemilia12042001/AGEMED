import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, ChevronRight, Clock, Check, AlertCircle 
} from "lucide-react";
import { Appointment } from "../types";

export default function DateSelection() {
  const navigate = useNavigate();
  const {
    selectedDoctor,
    selectedBookDate,
    setSelectedBookDate,
    selectedBookTime,
    setSelectedBookTime,
    consultationReason,
    symptomsInput,
    symptomsDuration,
    setAppointments,
    playSoundEffect,
  } = useAppState();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/consultation-form");
  };

  const handleConfirmReservation = () => {
    if (!selectedDoctor) {
      setError("Por favor, seleccione un especialista primero.");
      return;
    }

    playSoundEffect("click");
    setLoading(true);
    setError(null);

    const now = new Date();
    const isoDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(selectedBookDate).padStart(2, "0")}`;

    const locationParts = (selectedDoctor.location || "").split(",");
    const newAppointment: Appointment = {
      id: `appt-${Date.now()}`,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      doctorPhoto: selectedDoctor.image,
      date: isoDate,
      time: selectedBookTime,
      locationName: (locationParts[0] || "Hospital de EsSalud").trim(),
      locationDetails: (locationParts.slice(1).join(",") || "Piso 4, Consultorio 402").trim(),
      status: "scheduled",
      consultationReason: consultationReason || "Control de salud integral y consulta médica.",
      symptoms: symptomsInput || "Ninguno",
      symptomsDuration: symptomsDuration,
    };

    setAppointments((prev: Appointment[]) => [newAppointment, ...prev]);
    playSoundEffect("success");
    setLoading(false);
    navigate("/confirmed");
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
          <span className="font-serif text-lg font-bold text-[#111]">Cita</span>
        </div>
        <div className="w-9 h-9"></div>
      </div>

      <div className="p-6">
        {/* Headline */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 leading-tight">Seleccione una fecha</h2>
          <p className="text-stone-500 text-xs mt-2 leading-relaxed">
            Elija el día y la hora que mejor se adapten a su agenda de salud.
          </p>
        </div>

        {/* Calendar Widget Container */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mt-6 text-left">
          <div className="flex justify-between items-center mb-4">
            <span className="font-serif text-sm font-extrabold text-stone-850">Octubre 2023</span>
            <div className="flex gap-1">
              <button type="button" className="p-1 border border-stone-200 rounded-lg hover:border-stone-400">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button type="button" className="p-1 border border-stone-250 rounded-lg hover:border-stone-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-wider">
            <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span className="text-stone-400">Sáb</span><span className="text-stone-400">Dom</span>
          </div>

          {/* Day numbers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
            {/* Previous month greyed out filler days */}
            <span className="text-stone-300 py-1.5 font-mono">25</span>
            <span className="text-stone-300 py-1.5 font-mono">26</span>
            <span className="text-stone-300 py-1.5 font-mono">27</span>
            <span className="text-stone-300 py-1.5 font-mono">28</span>
            <span className="text-stone-300 py-1.5 font-mono">29</span>
            <span className="text-stone-800 py-1.5 font-mono">1</span>
            <span className="text-stone-800 py-1.5 font-mono">2</span>
            
            {/* Interactive October October numbers */}
            <button 
              type="button"
              onClick={() => { playSoundEffect("click"); setSelectedBookDate(3); }}
              className={`py-1.5 text-center font-bold font-mono rounded-full cursor-pointer ${
                selectedBookDate === 3 
                  ? "bg-stone-950 text-white" 
                  : "hover:bg-stone-100 text-stone-900"
              }`}
            >
              3
            </button>
            
            {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => { playSoundEffect("click"); setSelectedBookDate(day); }}
                className={`py-1.5 text-center font-mono rounded-full hover:bg-stone-100 cursor-pointer ${
                  selectedBookDate === day
                    ? "bg-stone-950 text-white font-bold"
                    : "text-stone-800"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* TIME SLOTS CONTAINER BLOCK */}
        <div className="mt-6 text-left">
          <h3 className="font-serif text-sm font-bold text-stone-850 mb-3 uppercase tracking-wider">Horarios disponibles</h3>
          
          <div className="space-y-2">
            {[
              "09:00 AM",
              "10:30 AM",
              "12:00 PM",
              "02:30 PM",
              "04:00 PM"
            ].map((tm) => {
              const isSelected = selectedBookTime === tm;
              return (
                <div 
                  key={tm}
                  onClick={() => {
                    playSoundEffect("click");
                    setSelectedBookTime(tm);
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isSelected 
                      ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs" 
                      : "bg-white border-stone-200 text-stone-800 hover:border-stone-400"
                  }`}
                >
                  <span className="text-xs font-bold font-mono flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-500" /> {tm}
                  </span>
                  {isSelected ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3 stroke-[3]" /> Seleccionado
                    </span>
                  ) : (
                    <span className="bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono">
                      Disponible
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Book trigger action */}
        {error && (
          <div className="mt-4 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-605 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Book trigger action */}
        <button
          type="button"
          onClick={handleConfirmReservation}
          disabled={loading}
          className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl text-xs mt-6 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition duration-200 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></span> Reservando...
            </span>
          ) : (
            <>Confirmar Reservación de Cita ➔</>
          )}
        </button>

      </div>
    </div>
  );
}

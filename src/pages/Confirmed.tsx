import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  Check, Calendar, MapPin 
} from "lucide-react";

function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = dateStr.split("-").map(Number);
    const apptDate = new Date(year, month - 1, day);
    const diffDays = Math.round((apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";
    const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };
    const formatted = apptDate.toLocaleDateString("es-ES", options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
}

export default function Confirmed() {
  const navigate = useNavigate();
  const {
    appointments,
    selectedDoctor,
    selectedBookTime,
    playSoundEffect
  } = useAppState();

  // La cita recién reservada es la primera del arreglo (la insertamos al inicio)
  const bookedAppointment = useMemo(() => {
    return appointments.find(a => a.status === "scheduled") || appointments[0] || null;
  }, [appointments]);

  const displayDoctor = bookedAppointment?.doctorName || selectedDoctor?.name || "Dra. Elena Valenzuela";
  const displaySpecialty = bookedAppointment?.specialty || selectedDoctor?.specialty || "Cardiología Geriátrica";
  const displayImage = bookedAppointment?.doctorPhoto || selectedDoctor?.image || "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300";
  const displayDate = bookedAppointment?.date ? formatFriendlyDate(bookedAppointment.date) : "Fecha próxima";
  const displayTime = bookedAppointment?.time || selectedBookTime;
  const displayLocationName = bookedAppointment?.locationName || "Clínica San Lucas";
  const displayLocationDetails = bookedAppointment?.locationDetails || "Piso 4, Consultorio 402";

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
    navigate("/directions", { state: { location: displayLocationName, doctor: displayDoctor } });
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
                src={displayImage} 
                alt="Clinician portrait" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-mono">Médico Especialista</p>
              <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                {displayDoctor}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                {displaySpecialty}
              </p>
            </div>
          </div>

          <div className="py-4 space-y-3.5">
            {/* item 1 */}
            <div className="flex gap-3">
              <Calendar className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">{displayDate}</h4>
                <p className="text-[11px] text-stone-500 font-mono font-semibold">{displayTime}</p>
              </div>
            </div>

            {/* item 2 */}
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">{displayLocationName}</h4>
                <p className="text-[11px] text-stone-550 leading-relaxed">{displayLocationDetails}</p>
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

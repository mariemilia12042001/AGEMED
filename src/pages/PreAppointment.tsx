import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, Calendar, Briefcase, MapPin, CheckCircle, Check 
} from "lucide-react";
import { updatePreparationItemStatus } from "../../lib/supabase/appointment";

export default function PreAppointment() {
  const navigate = useNavigate();
  const {
    appointments,
    setAppointments,
    playSoundEffect
  } = useAppState();

  const [confirming, setConfirming] = useState(false);

  // Buscar la cita agendada más próxima
  const activeAppt = appointments
    .filter((appt) => appt.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const preparationList = activeAppt?.preparationItems || [
    { id: "pre-1", label: "Ayuno de 8 horas", checked: true },
    { id: "pre-2", label: "Traer historial previo", checked: true },
    { id: "pre-3", label: "Llegar 15 min antes", checked: true }
  ];

  const formatFriendlyDate = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = dateStr.split('-').map(Number);
      const apptDate = new Date(year, month - 1, day);
      const diffTime = apptDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Hoy";
      if (diffDays === 1) return "Mañana";
      if (diffDays === -1) return "Ayer";
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
      const formatted = apptDate.toLocaleDateString('es-ES', options);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch (e) {
      return dateStr;
    }
  };

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  const handleConfirmAttendance = () => {
    playSoundEffect("success");
    const name = activeAppt ? activeAppt.doctorName : "Dr. Alejandro Valdivia";
    alert(`¡Asistencia confirmada para su consulta! El equipo le espera con el especialista ${name}.`);
  };

  const handleDirections = () => {
    playSoundEffect("click");
    navigate("/directions", { 
      state: { 
        location: activeAppt?.locationName || "San Lucas", 
        doctor: activeAppt?.doctorName || "Dr. Alejandro Valdivia" 
      } 
    });
  };

  const togglePreparationItem = async (itemId: string) => {
    playSoundEffect("click");
    if (!activeAppt) return;

    const item = preparationList.find(p => p.id === itemId);
    if (!item) return;

    const newChecked = !item.checked;

    // Actualización optimista de UI
    setAppointments(prev => prev.map(appt => {
      if (appt.id !== activeAppt.id) return appt;
      return {
        ...appt,
        preparationItems: (appt.preparationItems || []).map(p => 
          p.id === itemId ? { ...p, checked: newChecked } : p
        )
      };
    }));

    try {
      const res = await updatePreparationItemStatus(itemId, newChecked);
      if (res.error) {
        console.warn("Error al actualizar estado del ítem en Supabase, revirtiendo:", res.error);
        // Revertir
        setAppointments(prev => prev.map(appt => {
          if (appt.id !== activeAppt.id) return appt;
          return {
            ...appt,
            preparationItems: (appt.preparationItems || []).map(p => 
              p.id === itemId ? { ...p, checked: !newChecked } : p
            )
          };
        }));
      }
    } catch (err) {
      console.error("Excepción al alternar ítem de preparación:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-20 animate-fade-in text-neutral-900 text-left">
      {/* Header bar */}
      <div className="flex justify-between items-center py-3 px-6 border-b border-stone-200 bg-[#FAF8F5]">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleBack}
            className="p-1 hover:bg-stone-100 rounded-full transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-850" />
          </button>
          <span className="font-serif text-lg font-bold text-[#111]">Mi Cita</span>
        </div>
        <div 
          onClick={() => { playSoundEffect("click"); navigate("/profile"); }}
          className="w-9 h-9 rounded-full ring-2 ring-stone-200 overflow-hidden cursor-pointer"
        >
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" 
            alt="User profile menu avatar" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="p-6">
        {!activeAppt ? (
          // EMPTY STATE: sin cita programada
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-stone-300 rounded-2xl bg-[#FBF9F6]">
            <span className="text-4xl mb-3">📅</span>
            <h4 className="font-serif text-base font-bold text-stone-900">Sin citas próximas</h4>
            <p className="text-xs text-stone-500 mt-2 max-w-xs leading-relaxed">
              No tiene ninguna consulta agendada. Reserve una nueva y aquí verá los preparativos y la información de su próxima cita.
            </p>
            <button
              onClick={() => { playSoundEffect("click"); navigate("/reservar-cita"); }}
              className="mt-5 bg-[#58735F] hover:bg-[#465c4c] text-white font-bold py-2.5 px-5 rounded-xl text-xs cursor-pointer active:scale-98 transition"
            >
              Reservar una consulta
            </button>
          </div>
        ) : (
          <>
        {/* Badge & title */}
        <div className="text-center mb-6">
          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-100 font-mono flex items-center gap-1.5 w-fit mx-auto">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
            🔔 Recordatorio de asistencia
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mt-3 leading-tight text-center">Su próxima consulta</h2>
          <p className="text-stone-500 text-xs mt-2 leading-relaxed text-center">
            Hemos preparado todo para su visita. Por favor, revise los detalles a continuación y confirme su asistencia.
          </p>
        </div>

        {/* DETAILS CARD */}
        <div className="bg-white p-4 rounded-2xl border border-stone-205 shadow-xs space-y-4 text-left">
          {/* Item 1 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">Fecha y Hora</p>
              <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                {formatFriendlyDate(activeAppt.date)}
              </h4>
              <p className="text-xs text-stone-650 font-semibold font-mono">{activeAppt.time}</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">Especialidad</p>
              <h4 className="text-sm font-bold text-stone-900 mt-0.5">{activeAppt.specialty}</h4>
              <p className="text-xs text-stone-600">{activeAppt.doctorName}</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">Ubicación</p>
              <h4 className="text-sm font-bold text-stone-900 mt-0.5">{activeAppt.locationName}</h4>
              <p className="text-xs text-stone-500">{activeAppt.locationDetails}</p>
            </div>
          </div>

          {/* Office room preview */}
          <div className="h-36 rounded-xl overflow-hidden relative border border-stone-100">
            <img 
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=850" 
              alt="High end clinical suite" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-stone-950/85 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur">
              Ingreso Torre B
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 gap-2 pt-2 text-center text-xs font-bold leading-none">
            <button 
              type="button"
              onClick={handleConfirmAttendance}
              className="w-full bg-[#58735F] hover:bg-[#465c4c] text-white py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-[#4d6653] shadow-xs active:scale-98 transition duration-155 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Confirmar asistencia
            </button>

            <button 
              type="button"
              onClick={handleDirections}
              className="w-full bg-white hover:bg-stone-50 text-stone-850 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-stone-300 shadow-xs active:scale-98 transition duration-155 cursor-pointer"
            >
              <span>➔</span> Ver indicaciones de llegada
            </button>
          </div>
        </div>

        {/* LINK a la lista completa de citas para no sesgar al usuario */}
        {appointments.filter(a => a.status === "scheduled").length > 1 && (
          <button
            type="button"
            onClick={() => { playSoundEffect("click"); navigate("/mis-citas"); }}
            className="w-full text-center text-[11px] font-bold text-stone-500 hover:text-stone-900 underline mt-4 cursor-pointer"
          >
            Ver todas mis citas ({appointments.filter(a => a.status === "scheduled").length})
          </button>
        )}

        {/* APPOINTMENT PREPARATION CHECKLISTS */}
        <div className="mt-6 bg-[#FAF8F5] p-5 rounded-2xl border border-stone-200">
          <h3 className="font-serif text-sm font-bold text-stone-800 mb-3 flex items-center gap-2 uppercase tracking-wider text-left">
            <span className="p-1 rounded bg-stone-950 text-white"><Check className="w-3.5 h-3.5" /></span>
            Preparación para su cita
          </h3>
          
          <div className="space-y-3.5 mt-4 text-left">
            {preparationList.map((item) => (
              <div 
                key={item.id} 
                onClick={() => togglePreparationItem(item.id)}
                className="bg-white p-3 rounded-xl border border-stone-200/80 hover:border-stone-400 cursor-pointer flex items-center justify-between transition"
              >
                <span className="text-xs font-bold text-stone-800">{item.label}</span>
                <div className={`w-5.5 h-5.5 rounded border flex items-center justify-center transition ${
                  item.checked ? "bg-stone-950 border-stone-950 text-white" : "bg-stone-50 border-stone-300 text-transparent"
                }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

      </div>
    </div>
  );
}

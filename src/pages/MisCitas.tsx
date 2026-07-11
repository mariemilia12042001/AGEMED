import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, Calendar, MapPin, Trash2, ShieldAlert
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
    if (diffDays === -1) return "Ayer";
    const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };
    const formatted = apptDate.toLocaleDateString("es-ES", options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
}

export default function MisCitas() {
  const navigate = useNavigate();
  const { appointments, setAppointments, playSoundEffect, setIsSideMenuOpen, resetBookingFlow } = useAppState();
  
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  const handleCancelAppointment = (id: string, docName: string) => {
    playSoundEffect("hangup");
    const confirmCancel = window.confirm(`¿Estás seguro de que deseas cancelar la cita con el/la especialista ${docName}? Esta acción notificará inmediatamente al triaje de EsSalud.`);
    if (!confirmCancel) return;

    setLoadingId(id);
    setAppointments(prev => prev.filter(app => app.id !== id));
    playSoundEffect("success");
    alert("Su cita ha sido cancelada exitosamente.");
    setLoadingId(null);
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
          <span className="font-serif text-lg font-bold text-[#111]">Mis Citas Activas</span>
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
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest font-mono">Panel Clínico</span>
          <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight mt-1">Consultas Programadas</h2>
          <p className="text-xs text-stone-500 mt-1">
            Revise, cancile o verifique sus citas médicas vigentes y la sede de atención asignada.
          </p>
        </div>

        {/* Appointment list container */}
        {appointments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-stone-300 rounded-2xl bg-[#FBF9F6]">
            <span className="text-3xl mb-3">📅</span>
            <h4 className="text-xs font-bold text-stone-800">No tiene citas programadas</h4>
            <p className="text-[10px] text-stone-500 mt-1.5 max-w-xs leading-normal">
              No se han detectado reservas pendientes para tu documento de identidad en este dispositivo.
            </p>
            <button
              onClick={() => { playSoundEffect("click"); resetBookingFlow(); navigate("/reservar-cita"); }}
              className="mt-4 bg-[#58735F] text-white font-bold py-2 px-4 rounded-xl text-[11px] hover:bg-[#465c4c] transition"
            >
              Reservar Nueva Consulta
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => (
              <div 
                key={app.id} 
                className="bg-white border border-stone-250 p-5 rounded-2xl shadow-xs relative overflow-hidden"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center shrink-0 border border-stone-200 text-lg font-bold text-stone-800">
                    🧑‍⚕️
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-mono text-[9px] uppercase font-bold py-0.5 px-2 rounded-full inline-block">
                      {app.specialty}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 mt-1 truncate">{app.doctorName}</h4>
                    
                    <div className="flex flex-col gap-1.5 mt-3 text-xs text-stone-600 font-medium">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {formatFriendlyDate(app.date)}, {app.time}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {app.locationName} - {app.locationDetails}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-4 pt-3.5 border-t border-stone-100">
                  <button
                    onClick={() => {
                      playSoundEffect("click");
                      navigate("/pre-appointment");
                    }}
                    className="flex-1 bg-stone-950 hover:bg-stone-900 text-white font-bold py-2 rounded-lg text-[10px] text-center transition"
                  >
                    Ver Preparativos
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(app.id, app.doctorName)}
                    disabled={loadingId === app.id}
                    className="p-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg transition text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                    title="Cancelar Cita"
                  >
                    {loadingId === app.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin"></span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {appointments.length > 0 && (
          <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl flex gap-3 text-xs leading-normal text-stone-700 font-medium">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-stone-900">Recordatorio de Asistencia</h5>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Debe confirmar su asistencia en triaje digital 2 horas antes de su consulta para evitar la liberación de su turno. En caso de no poder asistir, use el botón de cancelar con anticipación de gracia.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

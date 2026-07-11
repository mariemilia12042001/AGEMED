import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  Menu, Search, Heart, Clock, MapPin, Briefcase, Eye, Smile, CalendarDays
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    playSoundEffect,
    setSelectedSpecialty,
    setIsSideMenuOpen,
    patientProfile,
    appointments,
    isDataLoading,
    resetBookingFlow
  } = useAppState();

  const handleSpecialtyClick = (specialty: string) => {
    playSoundEffect("click");
    // Nueva reserva: reseteamos datos residuales
    resetBookingFlow();
    setSelectedSpecialty(specialty);
    navigate("/doctors");
  };

  // Formateador de fecha amigable (Hoy, Mañana, Lunes 12 de Octubre, etc.)
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

  // Buscar la cita agendada más próxima
  const nextAppointment = appointments
    .filter((appt) => appt.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="flex-1 flex flex-col pb-20 animate-fade-in text-neutral-950 text-left">
      {/* Header Bar */}
      <div className="flex justify-between items-center py-3 px-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Menu 
            onClick={() => { playSoundEffect("click"); setIsSideMenuOpen(true); }}
            className="w-5 h-5 text-neutral-850 cursor-pointer" 
          />
          <span className="font-serif text-lg font-bold uppercase tracking-widest text-[#111]">AGEMED</span>
        </div>
        <div 
          onClick={() => { playSoundEffect("click"); navigate("/profile"); }}
          className="w-9 h-9 rounded-full ring-2 ring-stone-200 overflow-hidden cursor-pointer"
        >
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" 
            alt="Profile user" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="p-6">
        {/* General Greeting banner */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 leading-none">
            Hola, {patientProfile?.full_name ? `Sra. ${patientProfile.full_name.split(' ')[0]}` : "Sra. Martínez"}
          </h2>
          <p className="text-stone-500 text-xs mt-1.5 font-medium">¿Cómo podemos ayudarle con su salud hoy?</p>
        </div>

        {/* Citas Search field */}
        <div className="mt-5 relative">
          <input 
            type="text" 
            placeholder="Reserva una cita" 
            onClick={() => handleSpecialtyClick("Medicina General")}
            className="w-full bg-white border border-stone-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium text-stone-700 shadow-sm focus:outline-none cursor-pointer"
            readOnly
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
        </div>

        {/* UPCOMING APPOINTMENT SUMMARY CARD */}
        <div className="mt-6">
          <h3 className="font-serif text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">Próxima Cita</h3>
          {isDataLoading ? (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col items-center justify-center gap-2 h-44 animate-pulse">
              <svg className="animate-spin h-5 w-5 text-stone-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-mono">Cargando próxima cita...</span>
            </div>
          ) : nextAppointment ? (
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-stone-50 rounded-full -mr-8 -mt-8 -z-10"></div>
              
              <div className="flex gap-4 relative z-10 text-left">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 fill-emerald-600 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] text-stone-500 uppercase tracking-widest font-semibold font-mono">{nextAppointment.specialty}</p>
                  <h4 className="text-base font-bold text-stone-900 mt-0.5">Dr(a). {nextAppointment.doctorName}</h4>
                  
                  <div className="flex flex-col gap-1.5 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-stone-600 font-medium font-mono">
                      <Clock className="w-3.5 h-3.5 text-stone-400" /> {formatFriendlyDate(nextAppointment.date)}, {nextAppointment.time}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" /> Sede {nextAppointment.locationName}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  playSoundEffect("click");
                  navigate("/pre-appointment");
                }}
                className="w-full bg-stone-950 hover:bg-stone-900 text-white font-medium py-2.5 rounded-xl text-xs mt-4 transition duration-150 relative z-10 active:scale-98 cursor-pointer"
              >
                Ver detalles de preparación
              </button>
              {appointments.filter(a => a.status === "scheduled").length > 1 && (
                <button
                  onClick={() => { playSoundEffect("click"); navigate("/mis-citas"); }}
                  className="w-full text-center text-[11px] font-bold text-stone-500 hover:text-stone-900 underline mt-2.5 relative z-10 cursor-pointer"
                >
                  Ver todas mis citas ({appointments.filter(a => a.status === "scheduled").length})
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 border-dashed shadow-xs flex flex-col items-center justify-center text-center py-8">
              <CalendarDays className="w-8 h-8 text-stone-300" />
              <p className="text-xs text-stone-500 font-semibold mt-2">No tiene citas programadas</p>
              <button 
                onClick={() => {
                  playSoundEffect("click");
                  resetBookingFlow();
                  navigate("/reservar-cita");
                }}
                className="mt-3 bg-stone-900 hover:bg-stone-950 text-white px-4 py-2 rounded-xl text-[11px] font-bold active:scale-98 transition cursor-pointer"
              >
                Reservar nueva cita
              </button>
            </div>
          )}
        </div>

        {/* ESPECIALIDADES CATEGORIES */}
        <div className="mt-7">
          <div className="flex justify-between items-baseline mb-3.5">
            <h3 className="font-serif text-sm font-bold text-stone-800 uppercase tracking-wider">Especialidades</h3>
            <button 
              onClick={() => { playSoundEffect("click"); navigate("/specialties"); }}
              className="text-stone-500 font-serif text-xs font-semibold underline hover:text-stone-800 cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { name: "Medicina General", icon: Briefcase, color: "bg-stone-100 text-stone-800" },
              { name: "Cardiología", icon: Heart, color: "bg-rose-50 text-rose-700" },
              { name: "Oftalmología", icon: Eye, color: "bg-blue-50 text-blue-700" },
              { name: "Pediatría", icon: Smile, color: "bg-amber-50 text-amber-700" },
            ].map((esp, i) => {
              const Icon = esp.icon;
              return (
                <div 
                  key={i}
                  onClick={() => handleSpecialtyClick(esp.name)}
                  className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-xs flex flex-col items-center justify-center text-center cursor-pointer hover:border-stone-400 active:scale-97 transition duration-150"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${esp.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-850 mt-2.5">{esp.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DAILY MEDIC TIP OF THE DAY */}
        <div className="mt-7 bg-emerald-50 rounded-2xl border border-emerald-100 overflow-hidden shadow-xs text-left">
          <div className="p-5">
            <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider font-mono">Consejo del día</p>
            <h4 className="font-serif text-base font-bold text-stone-900 mt-1">Mantenga su corazón fuerte con caminatas diarias</h4>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Un paseo de 20 minutos puede mejorar significativamente su salud cardiovascular y bienestar mental.
            </p>
          </div>
          <div className="h-28 w-full relative">
            <img 
              src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800"
              alt="Sunny trees garden path"
              className="w-full h-full object-cover grayscale-10 border-t border-emerald-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  User, Phone, ChevronRight, Bell, Shield, HelpCircle, LogOut 
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const {
    playSoundEffect,
    setIsLoggedIn,
    setIsCallActive,
    patientProfile,
  } = useAppState();

  const emergencyPhone = patientProfile?.emergency_phone || "+34 600 000 000";
  const emergencyContactName = patientProfile?.emergency_contact_name || "Ricardo Martínez (Hijo)";

  const handleLogOut = () => {
    playSoundEffect("hangup");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleDialEmergency = () => {
    playSoundEffect("call");
    setIsCallActive(true);
  };

  return (
    <div className="flex-1 flex flex-col pb-20 animate-fade-in text-neutral-900 text-left">
      {/* Header bar */}
      <div className="flex justify-between items-center py-3 px-6 border-b border-stone-200">
        <span className="font-serif text-lg font-bold uppercase tracking-widest text-[#111]">AGEMED</span>
        <div 
          className="w-9 h-9 rounded-full ring-2 ring-emerald-500 overflow-hidden"
        >
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" 
            alt="Elena Profile user photo" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="p-6">
        {/* User core profile layout */}
        <div className="flex flex-col items-center py-2 text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white relative">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300" 
              alt="Elena Martinez Portrait" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h3 className="font-serif text-2xl font-bold text-stone-900 mt-3">{patientProfile?.full_name || "Elena Martínez"}</h3>
          <p className="text-stone-400 text-xs font-mono font-medium tracking-wide mt-1 uppercase">Asegurado de EsSalud</p>
        </div>

        {/* Clinical File details cards spacing */}
        <div className="mt-5 space-y-3">
          <div className="bg-white p-3.5 rounded-xl border border-stone-155 shadow-xs text-center relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-400"></div>
            <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider font-mono">Nombre Completo</span>
            <span className="text-sm font-bold text-stone-900 mt-1 block">{patientProfile?.full_name || "Elena Martínez Ruiz"}</span>
          </div>
        </div>

        {/* EMERGENCY DIAL CONTROLS */}
        <div className="mt-5 bg-[#F0F4F1] p-5 rounded-2xl border border-stone-200/80 shadow-xs relative overflow-hidden text-left">
          <div className="absolute right-0 bottom-0 text-stone-400/10 -mr-6 -mb-6">
            <User className="w-32 h-32 stroke-[1]" />
          </div>

          <div className="flex gap-3 items-center mb-3">
            <div className="bg-[#58735F]/15 text-[#58735F] p-2 rounded-xl">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-serif text-[#324537] leading-none">Contacto de Emergencia</h4>
              <p className="text-[10px] text-stone-500 font-mono font-semibold mt-1">Llamada directa</p>
            </div>
          </div>

          <h5 className="text-sm font-bold text-stone-900">{emergencyContactName}</h5>
          
          <div className="mt-2.5 bg-[#FAFAF9] p-3 rounded-xl border border-stone-200">
            <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider font-mono">Teléfono de Emergencia</span>
            <span className="text-sm font-bold text-stone-900 font-mono tracking-wide mt-1 block">{emergencyPhone}</span>
          </div>

          <button 
            type="button"
            onClick={handleDialEmergency}
            className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 mt-4 active:scale-98 transition duration-155 shadow-sm relative z-10 cursor-pointer"
          >
            <Phone className="w-4 h-4 stroke-[2.5]" /> Llamar ahora
          </button>
        </div>

        {/* GENERAL DEVICE SETTINGS MENU */}
        <div className="mt-6 text-left">
          <h4 className="font-serif text-sm font-extrabold text-stone-850 mb-3 uppercase tracking-wider">Ajustes</h4>
          
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden divide-y divide-stone-100">
            {[
              { label: "Notificaciones", icon: Bell, route: "/profile/notifications" },
              { label: "Privacidad", icon: Shield, route: "/profile/privacy" },
              { label: "Ayuda y Preguntas", icon: HelpCircle, route: "/profile/help" }
            ].map((cfg, idx) => {
              const Icon = cfg.icon;
              return (
                <div 
                  key={idx}
                  onClick={() => {
                    playSoundEffect("click");
                    navigate(cfg.route);
                  }}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition"
                >
                  <div className="flex items-center gap-3 text-stone-800">
                    <Icon className="w-4.5 h-4.5 text-stone-400" />
                    <span className="text-xs font-bold">{cfg.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              );
            })}
          </div>
        </div>

        {/* LOGOUT */}
        <div className="mt-6 pb-4">
          <button
            type="button"
            onClick={handleLogOut}
            className="w-full bg-white hover:bg-rose-50/50 text-rose-750 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 border border-rose-200 shadow-xs active:scale-98 transition duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-700" /> Cerrar Sesión Segura
          </button>
        </div>

      </div>
    </div>
  );
}

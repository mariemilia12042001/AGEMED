import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  Smartphone, Sliders, Bell, Phone, Volume2
} from "lucide-react";

export default function LeftSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const {
    isSoundEnabled,
    setIsSoundEnabled,
    playSoundEffect,
    triggerNotification,
    isIncomingCall,
    isCallActive,
    triggerCallSimulation
  } = useAppState();

  const handleQuickJumper = (path: string) => {
    playSoundEffect("click");
    navigate(path);
  };

  const menuScreens = [
    { path: "/", label: "1. Login" },
    { path: "/dashboard", label: "2. Inicio" },
    { path: "/doctors", label: "3. Médicos" },
    { path: "/pre-appointment", label: "4. Seg. Pre-Cita" },
    { path: "/consultation-form", label: "5. Formulario" },
    { path: "/date-selection", label: "6. Calendario" },
    { path: "/confirmed", label: "7. Cita Ok" },
    { path: "/history", label: "8. Historial" },
    { path: "/profile", label: "9. Perfil" },
    { path: "/chat", label: "10. Chat Asistente" },
  ];

  return (
    <div className="w-full md:w-96 bg-neutral-950 p-6 flex flex-col border-b md:border-b-0 md:border-r border-neutral-800 shrink-0 text-left">
      
      {/* Title Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-600 p-2 rounded-lg text-white">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-serif tracking-tight text-white">AGEMED Simulador</h1>
          <p className="text-xs text-neutral-400">Panel de Control & Eventos</p>
        </div>
      </div>

      {/* Quick Screen Selector */}
      <div className="mb-6 bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
        <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-emerald-500" /> Ir a Pantalla Directa (Test)
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {menuScreens.map((scr) => {
            const isActive = currentPath === scr.path || (scr.path === "/" && currentPath === "/login");
            return (
              <button
                key={scr.path}
                onClick={() => handleQuickJumper(scr.path)}
                className={`py-1.5 px-2 text-left rounded text-xs transition duration-240 ${
                  isActive
                    ? "bg-emerald-600/20 text-emerald-400 font-medium border border-emerald-500/30"
                    : "bg-neutral-950/60 text-neutral-300 hover:bg-neutral-850"
                }`}
              >
                {scr.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Push Notifications Emulators */}
      <div className="mb-6 bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
        <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-amber-500" /> Forzar Notificaciones Push
        </label>
        <p className="text-[11px] text-neutral-400 mb-3">
          Emula recordatorios en tiempo real. Aparecerán como banners dinámicos en el móvil y sonarán.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => triggerNotification("medicamento")}
            className="w-full bg-neutral-950 hover:bg-neutral-850 text-neutral-200 text-xs py-2 px-3 rounded-lg flex items-center justify-between border border-neutral-850 active:scale-95 transition cursor-pointer"
          >
            <span className="flex items-center gap-2 text-rose-400">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              Recordatorio Medicamento
            </span>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded">Atorvastatina</span>
          </button>

          <button
            onClick={() => triggerNotification("cita")}
            className="w-full bg-neutral-950 hover:bg-neutral-850 text-neutral-200 text-xs py-2 px-3 rounded-lg flex items-center justify-between border border-neutral-850 active:scale-95 transition cursor-pointer"
          >
            <span className="flex items-center gap-2 text-amber-400">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
              Consulta Pendiente
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">Cardiología</span>
          </button>

          <button
            onClick={() => triggerNotification("seguimiento")}
            className="w-full bg-neutral-950 hover:bg-neutral-850 text-neutral-200 text-xs py-2 px-3 rounded-lg flex items-center justify-between border border-neutral-850 active:scale-95 transition cursor-pointer"
          >
            <span className="flex items-center gap-2 text-indigo-400">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              Seguimiento Médico
            </span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">Receta Digital</span>
          </button>
        </div>
      </div>

      {/* Simulated Emergency Incoming Call */}
      <div className="mb-6 bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
        <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-blue-500" /> Simular Médico / Contacto
        </label>
        <button
          onClick={() => triggerCallSimulation(navigate)}
          disabled={isIncomingCall || isCallActive}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 animate-bounce" /> Recibir llamada de Emergencia
        </button>
      </div>

      {/* Sounds and alerts */}
      <div className="mt-auto bg-neutral-900 p-4 rounded-xl border border-neutral-800">
        <div className="flex items-center gap-2 mb-1.5">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-neutral-200">Efectos Sonoros</h3>
          <button 
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`ml-auto text-[10px] px-2 py-0.5 rounded font-bold uppercase transition cursor-pointer ${
              isSoundEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-800 text-neutral-500"
            }`}
          >
            {isSoundEnabled ? "Activo" : "Mudo"}
          </button>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          La experiencia interactiva incluye alertas interactivas audibles. Use audífonos para una mejor experiencia de EsSalud digital.
        </p>
      </div>

      {/* Footer Credit */}
      <div className="mt-4 pt-4 border-t border-neutral-900 flex justify-between items-center">
        <span className="text-[10px] text-neutral-500">AGEMED Premium v4.0</span>
        <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-bold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Conectado a Gemini
        </span>
      </div>

    </div>
  );
}

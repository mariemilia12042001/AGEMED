import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { updateSettings } from "../../lib/supabase/patient";
import { 
  ArrowLeft, Bell, Shield, HelpCircle, Volume2, VolumeX, ShieldAlert, ChevronRight
} from "lucide-react";

export default function Configuracion() {
  const navigate = useNavigate();
  const { isSoundEnabled, setIsSoundEnabled, playSoundEffect, setIsSideMenuOpen, patientId } = useAppState();

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  const handleToggleSound = async () => {
    const newVal = !isSoundEnabled;
    setIsSoundEnabled(newVal);
    // play a confirmation sound using the new state right after toggle if enabled
    if (newVal) {
      setTimeout(() => {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
          }
        } catch (e) {}
      }, 50);
    }
    // Persist to Supabase
    if (patientId) {
      try {
        await updateSettings(patientId, { isSoundEnabled: newVal });
      } catch (err) {
        console.warn("Failed to persist sound setting:", err);
      }
    }
  };

  const menuOptions = [
    {
      title: "Notificaciones",
      desc: "Recordatorios de medicamentos y alertas de reservas",
      icon: Bell,
      path: "/profile/notifications"
    },
    {
      title: "Privacidad y Consentimiento",
      desc: "Protección de datos conforme con EsSalud",
      icon: Shield,
      path: "/profile/privacy"
    },
    {
      title: "Centro de Soporte",
      desc: "Contacto al triaje digital y manual del paciente",
      icon: HelpCircle,
      path: "/profile/help"
    }
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
          <span className="font-serif text-lg font-bold text-[#111]">Configuración</span>
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
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest font-mono">Preferencias</span>
          <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight mt-1">Ajustes Generales</h2>
          <p className="text-xs text-stone-500 mt-1">
            Personalice su experiencia interactiva en la aplicación AGEMED y controle la seguridad de su historial.
          </p>
        </div>

        {/* Diagnostic Toggle Row (Sound System) */}
        <div className="bg-white border border-stone-200 p-4 rounded-2xl flex justify-between items-center shadow-xs">
          <div className="flex gap-3 items-center">
            <div className={`p-2 rounded-xl border ${isSoundEnabled ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-stone-50 text-stone-400 border-stone-200"}`}>
              {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Efectos de Sonido Chimes</h4>
              <p className="text-[10px] text-stone-500 mt-0.5">Alertas de audio para interacciones y alertas de salud</p>
            </div>
          </div>
          <button
            onClick={handleToggleSound}
            className={`w-12 h-6 rounded-full transition duration-200 relative p-1 flex items-center shrink-0 cursor-pointer ${isSoundEnabled ? "bg-[#58735F]" : "bg-stone-300"}`}
          >
            <span className={`w-4 h-4 bg-white rounded-full shadow-md transition duration-200 ${isSoundEnabled ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Settings options list */}
        <div className="space-y-3">
          {menuOptions.map((opt, oIdx) => {
            const Icon = opt.icon;
            return (
              <button
                key={oIdx}
                onClick={() => {
                  playSoundEffect("click");
                  navigate(opt.path);
                }}
                className="w-full bg-white border border-stone-200 hover:border-stone-400 p-4 rounded-2xl transition duration-150 text-left flex justify-between items-center shadow-xs hover:shadow-sm cursor-pointer"
              >
                <div className="flex gap-4 items-center">
                  <div className="p-2.5 rounded-xl bg-stone-100 text-stone-600 border border-stone-200/60">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{opt.title}</h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">{opt.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Legal credentials card */}
        <div className="mt-auto bg-stone-50 border border-stone-200 p-4 rounded-xl flex gap-3 text-xs text-stone-600 font-medium">
          <ShieldAlert className="w-5 h-5 text-stone-550 shrink-0 mt-0.5" />
          <div>
            <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Identificación del Terminal</span>
            <p className="text-[10px] text-stone-500 leading-normal mt-1">
              AGEMED Clinically Verified v1.0.4. Conectado de manera encriptada a los nodos de telemedicina autorizados de la red nacional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

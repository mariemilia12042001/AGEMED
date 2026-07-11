import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import SideMenu from "./SideMenu";
import { 
  Bell, FileText, CalendarCheck, Activity, Phone, X, Download, User
} from "lucide-react";

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  const {
    systemTime,
    activeBanner,
    handleBannerClick,
    hasNewNotifications,
    isIncomingCall,
    setIsIncomingCall,
    isCallActive,
    setIsCallActive,
    callTimer,
    playSoundEffect,
    showPdfAlert,
    setShowPdfAlert,
    activePdfData,
    downloadingDocId,
    activeCallInfo,
    setActiveCallInfo,
  } = useAppState();

  // Fallback si no hay información específica del contacto (llamada legacy)
  const callName = activeCallInfo?.name || "Dr. Alejandro Valdivia";
  const callRole = activeCallInfo?.role || "Llamada de EsSalud";
  const callPhoto = activeCallInfo?.photo || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300";
  const callMessage = activeCallInfo?.message || "El especialista a cargo de su cita le está timbrando para validar sus síntomas.";
  const callOrigin = activeCallInfo?.origin || 'doctor';

  const hangUpCall = () => {
    playSoundEffect("hangup");
    setIsIncomingCall(false);
    setIsCallActive(false);
    setActiveCallInfo(null);
  };

  const handleTabClick = (path: string) => {
    playSoundEffect("click");
    navigate(path);
  };

  const isLoginPath = activePath === "/" || activePath === "/login";
  const isChatPath = activePath === "/chat";

  return (
    <div className="relative w-full max-w-[400px] h-[830px] rounded-[50px] border-[12px] border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden shadow-2xl">
      
      {/* Phone Ear Speaker & Front Camera Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-2">
        <span className="w-10 h-1 bg-neutral-800 rounded-full"></span>
        <span className="w-2 h-2 bg-neutral-900 rounded-full border border-neutral-800"></span>
      </div>

      {/* DYNAMIC TOP SLIDE-DOWN PUSH NOTIFICATION */}
      {activeBanner && (
        <div 
          onClick={() => handleBannerClick(activeBanner, navigate)}
          className="absolute top-8 left-3 right-3 bg-neutral-900/95 backdrop-blur border border-neutral-700/80 text-white rounded-2xl p-3 shadow-2xl z-50 cursor-pointer animate-pulse flex gap-3 transition hover:bg-neutral-850"
        >
          <div className="bg-emerald-600/20 text-emerald-400 p-2 rounded-xl self-start">
            {activeBanner.type === "medicamento" ? (
              <Activity className="w-5 h-5 text-rose-500" />
            ) : activeBanner.type === "cita" ? (
              <CalendarCheck className="w-5 h-5 text-amber-500" />
            ) : (
              <FileText className="w-5 h-5 text-indigo-500" />
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-xs font-bold text-neutral-100">{activeBanner.title}</span>
              <span className="text-[9px] text-neutral-400">Ahora</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-snug line-clamp-2">
              {activeBanner.body}
            </p>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">
              Ver detalles en la aplicación ➔
            </div>
          </div>
        </div>
      )}

      {/* INTERNAL CONTENT VIEW CONTAINER */}
      <div className="flex-1 flex flex-col bg-[#FAF8F5] text-neutral-950 relative h-full pt-6">
        
        {/* GLOBAL SIDE DRAWER NAVIGATION MENU */}
        <SideMenu />
        
        {/* Phone Top Status Bar */}
        <div className="flex py-1.5 px-6 items-center justify-between text-neutral-800 font-medium text-xs tracking-tight z-40 bg-[#FAF8F5]">
          <span>{systemTime || "10:30 AM"}</span>
          <div className="flex items-center gap-1.5">
            {/* Simulated Signal Bars */}
            <div className="flex items-end gap-[1.5px] h-2">
              <span className="w-[2px] h-[3px] bg-neutral-700 rounded-sm"></span>
              <span className="w-[2px] h-[5px] bg-neutral-700 rounded-sm"></span>
              <span className="w-[2px] h-[7px] bg-neutral-700 rounded-sm"></span>
              <span className="w-[2px] h-[9px] bg-neutral-700 rounded-sm"></span>
            </div>
            <span className="text-[10px]">5G</span>
            {/* Battery bar */}
            <div className="w-5 h-2.5 border border-neutral-700 rounded-sm p-[1px] flex items-center">
              <div className="h-full w-4/5 bg-neutral-700 rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Dynamic page children */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </div>

        {/* FLOATING ACTION BOTTOM ASSISTANT CHAT BUBBLE TRIGGER BUTTON */}
        {!isLoginPath && !isChatPath && (
          <button 
            onClick={() => {
              playSoundEffect("click");
              navigate("/chat");
            }}
            className="absolute bottom-20 right-6 w-14 h-14 bg-stone-950 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 z-40 cursor-pointer transition border border-stone-800"
          >
            <div className="relative">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              {hasNewNotifications && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-stone-950 animate-pulse"></span>
              )}
            </div>
          </button>
        )}

        {/* PERSISTENT PHONE BOTTOM TAB NAVIGATION BAR */}
        {!isLoginPath && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-stone-200 py-2.5 px-4 grid grid-cols-4 gap-1 text-center text-[10px] font-bold text-stone-400 z-40 shrink-0">
            {[
              { path: "/dashboard", label: "Inicio", icon: HomeIcon },
              { path: "/mis-citas", label: "Citas", icon: CalendarCheckIcon, aliasPaths: ["/pre-appointment", "/doctors", "/consultation-form", "/date-selection", "/confirmed", "/reservar-cita"] },
              { path: "/history", label: "Historial", icon: ClockHistoryIcon },
              { path: "/profile", label: "Perfil", icon: UserIconBadge }
            ].map((item) => {
              const Icon = item.icon;
              const isCurrent = activePath === item.path || (item.aliasPaths && item.aliasPaths.includes(activePath));
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleTabClick(item.path)}
                  className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                    isCurrent ? "text-stone-900 border-t-2 border-stone-900 -mt-2.5 pt-2.5 font-bold" : "text-stone-400 hover:text-stone-700 font-semibold"
                  }`}
                >
                  <Icon className="w-5.5 h-5.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* SIMULATED PHONE GLASS REFLECTION */}
      <div className="absolute inset-0 pointer-events-none rounded-[38px] border border-white/5 bg-gradient-to-tr from-white/0 via-white/5 to-white/0"></div>

      {/* FULL INCOMING EMERGENCY CALL MODAL SIMULATOR FRAME */}
      {isIncomingCall && (
        <div className="absolute inset-0 z-50 bg-neutral-900/98 backdrop-blur flex flex-col items-center justify-between p-12 text-white animate-fade-in font-serif">
          <div className="text-center pt-12">
            <span className="w-16 h-16 rounded-full bg-emerald-600/10 text-emerald-500 flex items-center justify-center animate-pulse border border-emerald-500/20 mx-auto">
              <Phone className="w-8 h-8 rotate-90" />
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-6">{callName}</h3>
            <p className="text-xs text-neutral-400 font-mono font-medium tracking-widest mt-2 uppercase">{callRole}</p>
          </div>

          <p className="text-xs text-neutral-300 text-center leading-relaxed font-sans max-w-xs">
            {callMessage}
          </p>

          <div className="flex justify-center gap-12 w-full pb-12 font-sans font-bold text-xs">
            {/* Hang up */}
            <button 
              onClick={hangUpCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-rose-600 hover:bg-rose-500 rounded-full flex items-center justify-center shadow-lg transform active:scale-90 transition">
                <Phone className="w-6 h-6 rotate-135" />
              </div>
              <span className="text-neutral-400">Rechazar</span>
            </button>

            {/* Answer */}
            <button 
              onClick={() => {
                playSoundEffect("success");
                setIsIncomingCall(false);
                setIsCallActive(true);
              }}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center shadow-lg transform active:scale-90 transition relative">
                <span className="absolute inset-0 rounded-full bg-emerald-600/30 animate-ping z-0"></span>
                <Phone className="w-6 h-6 relative z-10" />
              </div>
              <span className="text-emerald-400">Responder</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE CALL CONNECTED MODAL */}
      {isCallActive && (
        <div className="absolute inset-0 z-50 bg-stone-950 flex flex-col items-center justify-between p-12 text-white animate-fade-in font-serif">
          <div className="text-center pt-12">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-emerald-500/30 mx-auto">
              <img 
                src={callPhoto} 
                alt={callName} 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-bold font-serif text-white mt-6">{callName}</h3>
            <p className="text-[11px] text-emerald-400 font-mono font-medium tracking-widest mt-1.5 uppercase flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Conectado • {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-[10px] text-neutral-400 font-mono font-medium mt-1 uppercase">{callRole}</p>
          </div>

          {/* Call soundwaves */}
          <div className="flex items-center gap-1.5 h-6">
            {[1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 5, 2, 1].map((val, idx) => (
              <span 
                key={idx} 
                style={{ height: `${val * 4}px` }} 
                className="w-[2.5px] bg-emerald-500 rounded-full animate-pulse"
              ></span>
            ))}
          </div>

          <div className="text-center font-sans">
            <p className="text-xs text-stone-400 italic">
              {callOrigin === 'emergency'
                ? '"Estamos conectando su llamada segura, por favor mantenga la línea..."'
                : '"Estimada Elena, ¿cómo se siente hoy con respecto a su presión?"'}
            </p>
          </div>

          <div className="pb-12 text-center text-xs text-neutral-400 font-bold font-sans">
            <button 
              onClick={hangUpCall}
              className="w-14 h-14 bg-rose-600 hover:bg-rose-500 rounded-full flex items-center justify-center shadow-lg transform active:scale-90 transition cursor-pointer mx-auto mb-2"
            >
              <Phone className="w-6 h-6 rotate-135" />
            </button>
            <span>Colgar</span>
          </div>
        </div>
      )}

      {/* PDF DOWNLOAD OVERLAY DRAWER */}
      {showPdfAlert && activePdfData && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full p-6 text-stone-900 shadow-2xl animate-fade-in border border-stone-200">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <button 
                onClick={() => { playSoundEffect("click"); setShowPdfAlert(false); }}
                className="p-1 hover:bg-stone-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="border-b border-stone-100 pb-3 text-left">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">Documento Certificado Digital</span>
              <h3 className="text-lg font-serif font-black text-stone-900 mt-1 truncate">Receta_Medica_{activePdfData.doctorName.replace(/ /g, "_")}.pdf</h3>
              <p className="text-xs text-emerald-800 font-semibold font-mono mt-1">Emitido por EsSalud Digital</p>
            </div>

            <div className="py-4 space-y-3 text-left">
              <div className="flex justify-between text-xs text-stone-600 font-mono">
                <span>Paciente:</span>
                <span className="font-semibold text-stone-900">Elena Martínez Ruiz</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600 font-mono">
                <span>DNI:</span>
                <span className="font-semibold text-stone-900">45.289.102-K</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600 font-mono">
                <span>Médico:</span>
                <span className="font-semibold text-stone-900">{activePdfData.doctorName}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600 font-mono">
                <span>Fecha:</span>
                <span className="font-semibold text-stone-900">{activePdfData.date}</span>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 mt-2">
                <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Medicamentos Indicados</span>
                {activePdfData.medicines.map((med, mi) => (
                  <div key={mi} className="text-xs text-stone-800 flex justify-between border-b border-dashed border-stone-200 py-1.5 last:border-none">
                    <span className="font-bold">{med.name}</span>
                    <span className="text-stone-500 font-mono text-[10px] font-semibold">{med.frequency}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                playSoundEffect("click");
                setShowPdfAlert(false);
                alert("¡Receta médica PDF guardada localmente en su dispositivo de manera segura!");
              }}
              className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 mt-2 shadow-xs transition"
            >
              <Download className="w-4 h-4 text-stone-400" /> Guardar en este dispositivo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline Helper SVG Icons to match existing styles
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
    </svg>
  );
}

function CalendarCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
  );
}

function ClockHistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );
}

function UserIconBadge({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
  );
}

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  X, Home, Calendar, ClipboardList, Stethoscope, 
  UserSquare2, Award, FileSpreadsheet, MessageSquare, 
  User, Settings, LogOut, Receipt
} from "lucide-react";

export default function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const { 
    isSideMenuOpen, 
    setIsSideMenuOpen, 
    playSoundEffect,
    setIsLoggedIn
  } = useAppState();

  if (!isSideMenuOpen) return null;

  const menuItems = [
    { label: "Inicio", path: "/home", icon: Home },
    { label: "Reservar cita", path: "/reservar-cita", icon: Calendar },
    { label: "Mis citas", path: "/mis-citas", icon: ClipboardList },
    { label: "Especialidades", path: "/especialidades", icon: Stethoscope },
    { label: "Médicos", path: "/medicos", icon: UserSquare2 },
    { label: "Resultados médicos", path: "/resultados", icon: Award },
    { label: "Recetas", path: "/recetas", icon: FileSpreadsheet },
    { label: "Facturas médicas", path: "/facturas", icon: Receipt },
    { label: "Mensajes", path: "/mensajes", icon: MessageSquare },
    { label: "Perfil", path: "/perfil", icon: User },
    { label: "Configuración", path: "/configuracion", icon: Settings }
  ];

  const handleNavigate = (path: string) => {
    playSoundEffect("click");
    setIsSideMenuOpen(false);
    navigate(path);
  };

  const handleLogoutClick = () => {
    playSoundEffect("hangup");
    setIsSideMenuOpen(false);
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleOverlayClick = () => {
    playSoundEffect("click");
    setIsSideMenuOpen(false);
  };

  return (
    <div className="absolute inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={handleOverlayClick}
        className="absolute inset-x-0 inset-y-0 bg-black/50 z-40 animate-fade-in"
      />

      {/* Drawer Panel */}
      <div className="relative flex flex-col w-[75%] max-w-[290px] h-full bg-white shadow-2xl z-50 animate-slide-in text-neutral-900 border-r border-stone-200 text-left">
        {/* Drawer Header */}
        <div className="bg-[#FAF8F5] p-5 border-b border-stone-200">
          <div className="flex justify-between items-center mb-4">
            <span className="font-serif text-lg font-bold uppercase tracking-widest text-stone-900">
              AGEMED
            </span>
            <button
              onClick={() => { playSoundEffect("click"); setIsSideMenuOpen(false); }}
              className="p-1 hover:bg-stone-200/60 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          {/* Patient Info Card */}
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-full ring-2 ring-emerald-500/30 overflow-hidden shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" 
                alt="Profile user" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-950 font-serif leading-none">Sra. Martínez</h4>
              <p className="text-[10px] text-emerald-800 font-semibold font-mono tracking-wider mt-1 uppercase">
                • Paciente
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            // The active state check maps both clean routes requested and alternative paths
            const isMatch = activePath === item.path || 
              (item.path === "/home" && activePath === "/dashboard") ||
              (item.path === "/especialidades" && activePath === "/specialties") ||
              (item.path === "/medicos" && activePath === "/doctors") ||
              (item.path === "/mensajes" && activePath === "/chat") ||
              (item.path === "/perfil" && activePath === "/profile") ||
              (item.path === "/configuracion" && activePath.startsWith("/profile/"));

            return (
              <button
                key={idx}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left text-xs transition font-semibold cursor-pointer ${
                  isMatch
                    ? "bg-[#58735F]/10 text-[#2C4132] font-black"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isMatch ? "text-[#58735F]" : "text-stone-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout Option at the bottom */}
        <div className="p-3 border-t border-stone-200 bg-stone-50">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left text-xs text-rose-700 hover:bg-rose-50 font-bold transition cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0 text-rose-500" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

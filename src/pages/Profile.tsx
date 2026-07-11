import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  User, Phone, ChevronRight, Bell, Shield, HelpCircle, LogOut, ShieldAlert 
} from "lucide-react";
import { encryptData } from "../utils/crypto";
import SensitiveDataField from "../components/SensitiveDataField";

export default function Profile() {
  const navigate = useNavigate();
  const {
    playSoundEffect,
    setIsLoggedIn,
    setDniInput,
    setIsCallActive,
    patientProfile,
    patientId,
    refetchPatientData
  } = useAppState();

  const [encryptedData, setEncryptedData] = useState<{
    dni: any;
    bloodType: any;
    emergencyPhone: any;
  } | null>(null);

  useEffect(() => {
    async function loadProfileValues() {
      if (patientProfile) {
        setEncryptedData({
          dni: {
            ciphertext: patientProfile.dni_encrypted,
            iv: patientProfile.dni_iv,
            salt: patientProfile.dni_salt
          },
          bloodType: patientProfile.blood_type_encrypted ? {
            ciphertext: patientProfile.blood_type_encrypted,
            iv: patientProfile.blood_type_iv,
            salt: patientProfile.blood_type_salt
          } : null,
          emergencyPhone: patientProfile.emergency_phone_encrypted ? {
            ciphertext: patientProfile.emergency_phone_encrypted,
            iv: patientProfile.emergency_phone_iv,
            salt: patientProfile.emergency_phone_salt
          } : null
        });
      } else {
        try {
          // Fallback encriptando valores demo en render inicial
          const dniEnc = await encryptData("45.289.102-K", "1234");
          const bloodEnc = await encryptData("🩸 O Positivo (EsSalud Altura)", "1234");
          const phoneEnc = await encryptData("+34 600 000 000 (Ricardo Martínez)", "1234");
          
          setEncryptedData({
            dni: dniEnc,
            bloodType: bloodEnc,
            emergencyPhone: phoneEnc
          });
        } catch (err) {
          console.error("Critical: Could not initialize secure medical profile", err);
        }
      }
    }
    loadProfileValues();
  }, [patientProfile]);

  const handleLogOut = () => {
    playSoundEffect("hangup");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleDialEmergency = () => {
    playSoundEffect("call");
    setIsCallActive(true);
  };

  const handleConfigAlert = (label: string) => {
    playSoundEffect("click");
    alert(`La sección de configuración "${label}" se encuentra cifrada de acuerdo con las normativas internacionales de protección de datos de EsSalud.`);
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

        {/* Security Alert Header Banner */}
        <div className="mt-4 bg-[#FAF6F0] border border-amber-200 rounded-xl p-3 flex gap-2.5 items-center">
          <Shield className="w-5 h-5 text-amber-700 shrink-0" />
          <div className="text-[10px] text-amber-900 font-medium leading-relaxed">
            <span className="font-bold">Datos Criptográficos:</span> Su perfil cuenta con cifrado <span className="font-bold">AES-GCM-256</span> local. Utilice el PIN de demostración <span className="font-mono bg-amber-100 px-1 py-0.2 rounded font-bold">1234</span> para consultar su información médica.
          </div>
        </div>

        {/* Clinical File details cards spacing */}
        <div className="mt-5 space-y-3">
          <div className="bg-white p-3.5 rounded-xl border border-stone-155 shadow-xs text-center relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-400"></div>
            <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider font-mono">Nombre Completo</span>
            <span className="text-sm font-bold text-stone-900 mt-1 block">{patientProfile?.full_name || "Elena Martínez Ruiz"}</span>
          </div>

          {encryptedData ? (
            <>
              <SensitiveDataField 
                label="Número de Documento (DNI)" 
                encryptedData={encryptedData.dni} 
              />

              <SensitiveDataField 
                label="Tipo de Sangre" 
                encryptedData={encryptedData.bloodType} 
                textColor="text-rose-750"
              />
            </>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-stone-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-[10px] text-stone-400 font-bold uppercase font-mono">Iniciando bóveda...</span>
            </div>
          )}
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
              <p className="text-[10px] text-stone-500 font-mono font-semibold mt-1">Llamada segura</p>
            </div>
          </div>

          <h5 className="text-sm font-bold text-stone-900">{patientProfile?.emergency_contact_name || "Ricardo Martínez (Hijo)"}</h5>
          
          {/* Encrypted Phone field inside the Emergency Contact */}
          <div className="mt-2.5">
            {encryptedData && (
              <SensitiveDataField 
                label="Teléfono de Emergencia" 
                encryptedData={encryptedData.emergencyPhone}
                className="bg-[#FAFAF9]"
              />
            )}
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

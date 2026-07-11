import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { updateSettings } from "../../lib/supabase/patient";
import { 
  ArrowLeft, Bell, MessageSquare, Volume2, ShieldCheck, Mail
} from "lucide-react";

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { playSoundEffect, isSoundEnabled, setIsSoundEnabled, patientId, patientSettings } = useAppState();

  const [appointmentReminders, setAppointmentReminders] = useState(
    patientSettings?.notifications_appointments ?? true
  );
  const [pillReminders, setPillReminders] = useState(
    patientSettings?.notifications_medicines ?? true
  );
  const [dailyRecoms, setDailyRecoms] = useState(
    patientSettings?.notifications_daily_tips ?? false
  );
  const [emailDigest, setEmailDigest] = useState(
    patientSettings?.notifications_email_digest ?? true
  );

  // Sync if patientSettings is loaded async after mount
  useEffect(() => {
    if (patientSettings) {
      setAppointmentReminders(patientSettings.notifications_appointments ?? true);
      setPillReminders(patientSettings.notifications_medicines ?? true);
      setDailyRecoms(patientSettings.notifications_daily_tips ?? false);
      setEmailDigest(patientSettings.notifications_email_digest ?? true);
    }
  }, [patientSettings]);

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/profile");
  };

  const handleToggle = async (
    key: "notificationsAppointments" | "notificationsMedicines" | "notificationsDailyTips" | "notificationsEmailDigest" | "isSoundEnabled",
    currentVal: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    playSoundEffect("click");
    const newVal = !currentVal;
    setter(newVal);
    if (key === "isSoundEnabled") setIsSoundEnabled(newVal);
    if (patientId) {
      try {
        await updateSettings(patientId, { [key]: newVal });
      } catch (err) {
        console.warn("Failed to persist notification setting:", err);
      }
    }
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
          <span className="font-serif text-lg font-bold text-[#111]">Ajustes de Notificaciones</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-800 mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-stone-900">Manténgase Informado</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            Seleccione qué alertas prefiere recibir en su teléfono móvil y correo electrónico registrado de EsSalud.
          </p>
        </div>

        {/* Channels */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden divide-y divide-stone-100 p-1">
          {/* Item 1 */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex gap-3 item-start">
              <div className="p-2 bg-stone-100 rounded-lg text-stone-600 self-start">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Recordatorios de Citas</h4>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">Notificaciones push 24h y 2h antes de su consulta.</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle("notificationsAppointments", appointmentReminders, setAppointmentReminders)}
              className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                appointmentReminders ? "bg-[#58735F]" : "bg-stone-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                appointmentReminders ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Item 2 */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex gap-3 item-start">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-700 self-start">
                <span>💊</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Recordatorio de Medicamentos</h4>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">Alertas automáticas en base a sus recetas médicas vigentes.</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle("notificationsMedicines", pillReminders, setPillReminders)}
              className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                pillReminders ? "bg-[#58735F]" : "bg-stone-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                pillReminders ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Item 3 */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex gap-3 item-start">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-900 self-start">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Consejos de Salud del Día</h4>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">Recomendaciones personalizadas para su bienestar cardiovascular.</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle("notificationsDailyTips", dailyRecoms, setDailyRecoms)}
              className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                dailyRecoms ? "bg-[#58735F]" : "bg-stone-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                dailyRecoms ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Item 4 */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex gap-3 item-start">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-700 self-start">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Resumen por Correo</h4>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">Reporte mensual de atenciones y recetas en formato digital.</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle("notificationsEmailDigest", emailDigest, setEmailDigest)}
              className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                emailDigest ? "bg-[#58735F]" : "bg-stone-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                emailDigest ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Item 5 - Sound synthesis */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex gap-3 item-start">
              <div className="p-2 bg-stone-100 rounded-lg text-stone-800 self-start">
                <Volume2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Efectos Sonoros en la App</h4>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">Alertas acústicas interactivas al presionar botones o interactuar.</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle("isSoundEnabled", isSoundEnabled, setIsSoundEnabled)}
              className={`w-11 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                isSoundEnabled ? "bg-[#58735F]" : "bg-stone-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ${
                isSoundEnabled ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        {/* Security badge and guidelines */}
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 flex gap-3 text-xs text-stone-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Nuestros canales cumplen con la ley de protección de datos personales. Usted puede desactivar los recordatorios en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  );
}

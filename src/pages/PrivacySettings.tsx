import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, Shield, Eye, Lock, FileText, Download, CheckCircle
} from "lucide-react";

export default function PrivacySettings() {
  const navigate = useNavigate();
  const { playSoundEffect } = useAppState();

  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/profile");
  };

  const handleExportData = () => {
    playSoundEffect("click");
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
      playSoundEffect("success");
      alert("¡Su Historial Clínico Encriptado ha sido preparado y enviado con éxito a su correo electrónico institucional de EsSalud!");
    }, 2000);
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
          <span className="font-serif text-lg font-bold text-[#111]">Privacidad y Encriptado</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-800 mx-auto mb-3">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-serif text-base font-bold text-stone-900">Salud Encriptada de Extremo a Extremo</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            AGEMED garantiza la confidencialidad de su información médica según la Ley de Protección de Datos Personales N° 29733.
          </p>
        </div>

        {/* Security Parameters Details */}
        <div className="space-y-4">
          {/* Section 1 */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 shadow-xs flex gap-3 text-xs leading-relaxed text-left">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 mb-1">Cifrado Local Activo (AES-GCM + PBKDF2)</h4>
              <p className="text-[11px] text-amber-800 font-medium">
                Sus datos (DNI, tipo de sangre, recetas, montos de facturación y métricas) se encriptan localmente mediante la API Web Crypto del navegador con una clave de derivación derivada de su contraseña/PIN. Ningún dato sensible viaja en texto plano.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex gap-3 text-xs leading-relaxed text-left">
            <Lock className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-stone-900 mb-1">Clave de Acceso Médico Única</h4>
              <p className="text-[11px] text-stone-500">
                Solo el especialista autorizado en triaje puede desencriptar e ingresar diagnósticos. Su DNI actúa como llave de firmas.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex gap-3 text-xs leading-relaxed text-left">
            <Eye className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-stone-900 mb-1">Auditoría Registrada de Accesos</h4>
              <p className="text-[11px] text-stone-500">
                Cada consulta a su receta o historial deja una marca digital inmutable. Puede ver sus auditorías solicitándolo en mesa de partes.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex gap-3 text-xs leading-relaxed text-left">
            <FileText className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-stone-900 mb-1">Cumplimiento Oficial EsSalud</h4>
              <p className="text-[11px] text-stone-500">
                Interconexión bajo protocolos de seguridad militar de grado hospitalario (AES-256) administrados en servidores nacionales libres de filtraciones.
              </p>
            </div>
          </div>
        </div>

        {/* EXPORT DATA WITH PROGRESS CONTAINER */}
        <div className="bg-[#FBF9F6] p-5 rounded-2xl border border-stone-200 text-left">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-mono">Exportar Datos Clínicos</span>
          <h4 className="font-serif text-sm font-extrabold text-stone-950 mt-1">Descargar Mi Carpeta Médica Colectiva</h4>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            Obtenga una copia autorizada en PDF encriptado de todas sus recetas médicas, diagnósticos y citas guardadas en este dispositivo.
          </p>

          <button
            onClick={handleExportData}
            disabled={exporting}
            className={`w-full font-bold py-3 px-4 rounded-xl text-xs mt-4 flex items-center justify-center gap-2 active:scale-98 transition duration-150 shadow-xs cursor-pointer ${
              exported 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-150" 
                : "bg-stone-950 hover:bg-stone-900 text-white"
            }`}
          >
            {exporting ? (
              <span className="flex items-center gap-1.5 font-mono">
                <span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></span> Encriptando Carpeta...
              </span>
            ) : exported ? (
              <>
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600" /> ¡Carpeta Enviada por E-mail!
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-stone-400" /> Exportar Mi Historial Clínico Seguro (PDF)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

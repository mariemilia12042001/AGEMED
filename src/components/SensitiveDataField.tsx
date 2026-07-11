import React, { useState, useEffect } from "react";
import { decryptData } from "../utils/crypto";
import { Lock, Unlock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAppState } from "../context/AppContext";

interface SensitiveDataFieldProps {
  label: string;
  encryptedData: {
    ciphertext: string;
    iv: string;
    salt: string;
  };
  className?: string;
  textColor?: string; // Optional custom color for the decrypted value (e.g. blood icon)
}

export default function SensitiveDataField({
  label,
  encryptedData,
  className = "",
  textColor = "text-stone-900"
}: SensitiveDataFieldProps) {
  const { playSoundEffect } = useAppState();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [decryptedValue, setDecryptedValue] = useState("");
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Auto-lock again if left unattended (e.g. 45 seconds for medical privacy compliance)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUnlocked) {
      timer = setTimeout(() => {
        handleLock();
      }, 45000); // 45 seconds autolock
    }
    return () => clearTimeout(timer);
  }, [isUnlocked]);

  const handleUnlockClick = () => {
    playSoundEffect("click");
    setShowPinInput(prev => !prev);
    setErrorStatus(null);
    setPin("");
  };

  const handleLock = () => {
    playSoundEffect("click");
    setIsUnlocked(false);
    setDecryptedValue("");
    setShowPinInput(false);
    setPin("");
    setErrorStatus(null);
  };

  const handleSubmitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorStatus("Ingrese un PIN válido.");
      return;
    }

    setIsDecrypting(true);
    setErrorStatus(null);

    // Minor loading simulated timeout to show cipher calculation is happening
    setTimeout(async () => {
      try {
        const decrypted = await decryptData(
          encryptedData.ciphertext,
          encryptedData.iv,
          encryptedData.salt,
          pin
        );
        
        setDecryptedValue(decrypted);
        setIsUnlocked(true);
        setShowPinInput(false);
        playSoundEffect("success");
      } catch (err: any) {
        playSoundEffect("hangup");
        setErrorStatus("PIN incorrecto. No se pudo descifrar la información.");
      } finally {
        setIsDecrypting(false);
      }
    }, 400);
  };

  return (
    <div className={`bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs relative overflow-hidden transition-all duration-300 ${className}`}>
      
      {/* Decorative vertical security bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isUnlocked ? "bg-emerald-600" : "bg-amber-600"}`}></div>

      <div className="flex justify-between items-start pl-1">
        <div className="flex-1 min-w-0 pr-3">
          <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider font-mono">
            {label}
          </span>
          
          <div className="mt-1.5 flex items-center gap-1.5 min-h-[1.5rem]">
            {isUnlocked ? (
              <span className={`text-xs font-bold font-mono tracking-wide break-all ${textColor}`}>
                {decryptedValue}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-stone-400">
                <span className="text-xs font-semibold font-mono tracking-widest text-stone-500">• • • • • •</span>
                <span className="text-[10px] uppercase font-bold text-stone-400 font-mono tracking-wider bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                  Protegido
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lock/Unlock Toggle Buttons */}
        <div className="shrink-0">
          {isUnlocked ? (
            <button
              onClick={handleLock}
              type="button"
              className="flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition cursor-pointer select-none"
              title="Ocultar darto sensible de nuevo"
            >
              <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ocultar</span>
            </button>
          ) : (
            <button
              onClick={handleUnlockClick}
              type="button"
              className="flex items-center gap-1 text-[9px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2.5 py-1.5 transition cursor-pointer select-none"
              title="Desbloquear con PIN"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>{showPinInput ? "Cancelar" : "Desbloquear"}</span>
            </button>
          )}
        </div>
      </div>

      {/* PIN entry nested drawer */}
      {showPinInput && !isUnlocked && (
        <form onSubmit={handleSubmitPin} className="mt-3 pt-3 border-t border-dashed border-stone-200 relative pl-1 animate-fade-in text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] text-stone-500 font-bold block">
              Ingrese su PIN militar o médico:
            </span>
            <span className="text-[8px] bg-sky-50 text-sky-700 border border-sky-100 px-1 rounded font-mono font-bold">
              Demo PIN: 1234
            </span>
          </div>

          <div className="flex gap-1.5">
            <input
              type="password"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              disabled={isDecrypting}
              className="flex-1 bg-stone-50 border border-stone-250 rounded-lg text-xs font-bold text-center tracking-widest text-stone-850 py-1.5 focus:outline-none focus:border-stone-400 placeholder:opacity-50"
              autoFocus
            />
            <button
              type="submit"
              disabled={isDecrypting}
              className="bg-stone-900 hover:bg-stone-950 disabled:bg-stone-400 text-white font-bold text-[10px] px-3.5 rounded-lg border border-stone-850 transition flex items-center justify-center cursor-pointer select-none"
            >
              {isDecrypting ? (
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span>Validar</span>
              )}
            </button>
          </div>

          {errorStatus && (
            <div className="mt-2 text-[9px] text-rose-700 bg-rose-50 border border-rose-100/80 p-2 rounded-lg flex items-center gap-1.5 font-medium animate-shake">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{errorStatus}</span>
            </div>
          )}
        </form>
      )}

      {/* Temporary visual feedback banner when unlocked */}
      {isUnlocked && (
        <div className="mt-2 text-[8px] uppercase tracking-wider font-mono text-emerald-805 flex items-center justify-center gap-1 bg-emerald-50 border border-emerald-100 py-1.5 rounded-lg animate-fade-in font-bold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Información desbloqueada temporalmente</span>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, FileText, Download, CheckCircle, Clock, ToggleLeft, HelpCircle, Shield
} from "lucide-react";
import { encryptData } from "../utils/crypto";
import SensitiveDataField from "../components/SensitiveDataField";

export default function Recetas() {
  const navigate = useNavigate();
  const { prescriptions, downloadPrescription, downloadingDocId, playSoundEffect, setIsSideMenuOpen } = useAppState();

  const [securedPrescriptions, setSecuredPrescriptions] = useState<any[]>([]);
  const [isLoadingSecure, setIsLoadingSecure] = useState(true);

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  useEffect(() => {
    async function initSecurePrescriptions() {
      setIsLoadingSecure(true);
      try {
        const secured = await Promise.all(
          prescriptions.map(async (presc: any) => {
            // If the prescription already carries encrypted data from Supabase DB, use it directly
            const encNotes = presc.encryptedNotes?.ciphertext
              ? presc.encryptedNotes
              : await encryptData(presc.notes || "Tomar con abundante agua.", "1234");

            const encMedicines = await Promise.all(
              presc.medicines.map(async (med: any) => {
                // If med already has encrypted details from DB, pass them through
                if (med.encryptedDetails?.ciphertext) {
                  return { ...med };
                }
                const combinedInfo = `${med.name} (${med.dosage} - ${med.duration})`;
                const encMed = await encryptData(combinedInfo, "1234");
                return {
                  ...med,
                  encryptedDetails: encMed
                };
              })
            );
            return {
              ...presc,
              encryptedNotes: encNotes,
              medicines: encMedicines
            };
          })
        );
        setSecuredPrescriptions(secured);
      } catch (err) {
        console.error("Error al cifrar fórmulas", err);
      } finally {
        setIsLoadingSecure(false);
      }
    }
    initSecurePrescriptions();
  }, [prescriptions]);

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
          <span className="font-serif text-lg font-bold text-[#111]">Recetas Médicas</span>
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
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest font-mono">Tratamiento Médico</span>
          <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight mt-1">Farmacia Digital & Recetas</h2>
          <p className="text-xs text-stone-500 mt-1">
            Gestione y descargue las órdenes médicas emitidas durante sus consultas de EsSalud. Presione Descargar para abrir la ficha interactiva.
          </p>
        </div>

        {/* Security Banner info */}
        <div className="bg-[#FAF6F0] border border-amber-200 rounded-xl p-3 flex gap-2.5 items-center">
          <Shield className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="text-[10.5px] text-amber-900 font-medium leading-relaxed">
            Las fórmulas de dosificación y las indicaciones post-consulta están cifradas criptográficamente. Desbloquee con el PIN demo <span className="font-mono bg-amber-100 px-1 py-0.2 rounded font-bold">1234</span>.
          </p>
        </div>

        {/* Prescription List */}
        <div className="space-y-4">
          {isLoadingSecure ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-[10px] text-stone-400 font-bold uppercase font-mono tracking-wider">Cifrando base de farmacia...</span>
            </div>
          ) : (
            securedPrescriptions.map((presc) => (
              <div 
                key={presc.id}
                className="bg-white border border-stone-250 rounded-2xl p-4 shadow-xs hover:border-stone-400 transition"
              >
                <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                  <div className="flex gap-2.5 items-center">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800 border border-emerald-100">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">Dr(a). {presc.doctorName}</h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">{presc.specialty}</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-stone-400 font-bold font-mono bg-stone-50 border border-stone-100/60 px-2 py-0.5 rounded-md">
                    {presc.date}
                  </span>
                </div>

                {/* Medicines overview inside the item */}
                <div className="py-3">
                  <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider block mb-2">Composición Indicada</span>
                  <div className="space-y-3">
                    {presc.medicines.map((med: any, mi: number) => (
                      <div key={mi} className="text-xs pb-1 last:border-none">
                        <SensitiveDataField 
                          label={`Sustancia Activa & Frecuencia`}
                          encryptedData={med.encryptedDetails}
                          className="bg-stone-50/60 p-2 border-stone-150"
                        />
                        <span className="text-[8px] text-stone-450 font-mono mt-1 block">Frecuencia recomendada: {med.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient Note */}
                <div className="mt-1">
                  <SensitiveDataField 
                    label="Pautas Médicas Post-Consulta"
                    encryptedData={presc.encryptedNotes}
                    className="p-3 bg-stone-50/80 border-stone-200"
                    textColor="text-stone-605 italic font-medium"
                  />
                </div>

                {/* Main functional download button */}
                <button
                  onClick={() => downloadPrescription(presc)}
                  disabled={downloadingDocId === presc.id}
                  className="w-full mt-3.5 bg-stone-900 hover:bg-stone-950 text-white font-bold py-2.5 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  {downloadingDocId === presc.id ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Cifrando Documentación...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Ver Receta Digital Firmada</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

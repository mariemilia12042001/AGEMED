import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, Receipt, CreditCard, ChevronRight, FileText, Sparkles, Download, Shield 
} from "lucide-react";
import { encryptData } from "../utils/crypto";
import SensitiveDataField from "../components/SensitiveDataField";

export default function Facturas() {
  const navigate = useNavigate();
  const { playSoundEffect, setIsSideMenuOpen, patientId } = useAppState();

  const [isLoadingSecure, setIsLoadingSecure] = useState(true);
  const [securedInvoices, setSecuredInvoices] = useState<any[]>([]);

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  const staticInvoicesData = [
    {
      id: "fac-1",
      billNo: "FAC-2026-90234",
      date: "14 May, 2026",
      concept: "Consulta Especializada con Electrocardiograma (ECG)",
      clinicalCenter: "Clínica San Lucas - Torre B",
      specialty: "Cardiología Preventiva",
      status: "Pagada",
      rawDetails: {
        payer: "Elena Martínez Ruiz - DNI: 45.289.102-K",
        total: "S/. 250.00 PEN",
        card: "Visa Crédito •••• 4059 (Autorizada)"
      }
    },
    {
      id: "fac-2",
      billNo: "FAC-2026-88122",
      date: "18 Abr, 2026",
      concept: "Perfil Sangre Completo & Glucosa Glicosilada",
      clinicalCenter: "Laboratorio Central de EsSalud",
      specialty: "Hematología & Bioquímica",
      status: "Pagada",
      rawDetails: {
        payer: "Elena Martínez Ruiz - DNI: 45.289.102-K",
        total: "S/. 180.00 PEN",
        card: "Pago en Efectivo (Ventanilla Sede Centro)"
      }
    }
  ];

  useEffect(() => {
    async function initSecureBilling() {
      setIsLoadingSecure(true);
      try {
        let invoicesToSecure = staticInvoicesData;

        if (patientId) {
          const { getInvoices } = await import("../../lib/supabase/invoice");
          const res = await getInvoices(patientId);
          if (!res.error && res.data && res.data.length > 0) {
            // Map DB invoice rows — encrypted fields come from DB, no re-encryption needed
            invoicesToSecure = res.data.map((dbInv: any) => ({
              id: dbInv.id,
              billNo: dbInv.bill_no || `FAC-${dbInv.id.slice(0, 8).toUpperCase()}`,
              date: new Date(dbInv.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
              concept: dbInv.concept || "Consulta Médica",
              clinicalCenter: dbInv.clinical_center || "EsSalud",
              specialty: dbInv.specialty || "Especialidad",
              status: dbInv.status || "Pagada",
              // Pre-encrypted DB fields — bypass re-encryption
              encryptedPayer: dbInv.payer_encrypted ? {
                ciphertext: dbInv.payer_encrypted, iv: dbInv.payer_iv, salt: dbInv.payer_salt
              } : null,
              encryptedTotal: dbInv.total_encrypted ? {
                ciphertext: dbInv.total_encrypted, iv: dbInv.total_iv, salt: dbInv.total_salt
              } : null,
              encryptedCard: dbInv.payment_method_encrypted ? {
                ciphertext: dbInv.payment_method_encrypted, iv: dbInv.payment_method_iv, salt: dbInv.payment_method_salt
              } : null,
              rawDetails: null
            }));
          } else if (res.error) {
            console.warn("getInvoices error, using fallback:", res.error);
          }
        }

        const secured = await Promise.all(
          invoicesToSecure.map(async (fac: any) => {
            // If encrypted fields are pre-loaded from DB, use them directly
            const encPayer = fac.encryptedPayer?.ciphertext
              ? fac.encryptedPayer
              : await encryptData(fac.rawDetails?.payer || "Paciente", "1234");
            const encTotal = fac.encryptedTotal?.ciphertext
              ? fac.encryptedTotal
              : await encryptData(fac.rawDetails?.total || "S/. 0.00 PEN", "1234");
            const encCard = fac.encryptedCard?.ciphertext
              ? fac.encryptedCard
              : await encryptData(fac.rawDetails?.card || "Tarjeta de Crédito", "1234");
            return { ...fac, encryptedPayer: encPayer, encryptedTotal: encTotal, encryptedCard: encCard };
          })
        );
        setSecuredInvoices(secured);
      } catch (err) {
        console.error("No se pudo cifrar los datos de facturación", err);
      } finally {
        setIsLoadingSecure(false);
      }
    }
    initSecureBilling();
  }, [patientId]);

  return (
    <div className="flex-1 flex flex-col pb-20 animate-fade-in text-neutral-900 text-left bg-[#FAF8F5]">
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
          <span className="font-serif text-lg font-bold text-[#111]">Facturas Médicas</span>
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
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest font-mono">Historial de Pagos</span>
          <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight mt-1">Cuentas & Facturación</h2>
          <p className="text-xs text-stone-500 mt-1">
            Gestione y descargue los comprobantes de pago de sus atenciones médicas. Sus datos de cobro se encuentran protegidos.
          </p>
        </div>

        {/* Security Banner */}
        <div className="bg-[#FAF6F0] border border-amber-200 rounded-xl p-3 flex gap-2.5 items-center">
          <Shield className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="text-[10.5px] text-amber-900 font-medium leading-relaxed">
            Las finanzas médicas y datos impositivos usan encriptación <span className="font-bold">AES-GCM</span> local. Para consultarlas ingrese su clave de demostración <span className="font-mono bg-amber-100 px-1 py-0.2 rounded font-bold">1234</span>.
          </p>
        </div>

        {/* Invoice List */}
        <div className="space-y-4">
          {isLoadingSecure ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-[10px] text-stone-400 font-bold uppercase font-mono tracking-wider">Cifrando transacciones...</span>
            </div>
          ) : (
            securedInvoices.map((fac) => (
              <div 
                key={fac.id}
                className="bg-white border border-stone-250 rounded-2xl p-4 shadow-sm relative text-left hover:border-stone-400 transition"
              >
                <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                  <div className="flex gap-2.5 items-center">
                    <div className="p-2 bg-stone-100 text-stone-700 rounded-xl">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900">{fac.billNo}</h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">{fac.clinicalCenter}</p>
                    </div>
                  </div>
                  <span className="text-[9.5px] bg-emerald-50 text-emerald-800 font-semibold font-mono border border-emerald-100 px-2.5 py-0.5 rounded-md">
                    {fac.status}
                  </span>
                </div>

                {/* Concept and details */}
                <div className="py-3">
                  <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider block mb-1">Detalle del Servicio</span>
                  <p className="text-xs font-bold text-stone-850">{fac.concept}</p>
                  <span className="text-[10px] text-[#58735F] font-mono mt-0.5 block">Especialidad: {fac.specialty}</span>
                </div>

                {/* Embedded Secure Fields */}
                <div className="space-y-2.5 bg-stone-50/50 p-2.5 rounded-xl border border-stone-150">
                  <SensitiveDataField 
                    label="Contribuyente (Payer)" 
                    encryptedData={fac.encryptedDetails.payer}
                    className="bg-white"
                  />
                  
                  <SensitiveDataField 
                    label="Método de Pago Autorizado" 
                    encryptedData={fac.encryptedDetails.card}
                    className="bg-white"
                  />

                  <SensitiveDataField 
                    label="Monto Total Cancelado" 
                    encryptedData={fac.encryptedDetails.total}
                    className="bg-white"
                    textColor="text-[#2C4132] font-black"
                  />
                </div>

                {/* Action button to download */}
                <button
                  type="button"
                  onClick={() => {
                    playSoundEffect("click");
                    alert(`El comprobante oficial electrónico "${fac.billNo}" acreditado por EsSalud se ha descargado exitosamente como comprobante PDF.`);
                    playSoundEffect("success");
                  }}
                  className="w-full mt-3.5 bg-stone-900 hover:bg-stone-950 text-white font-bold py-2.5 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-stone-400" /> Descargar Factura Electrónica (PDF)
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

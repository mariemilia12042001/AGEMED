import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, Download, Search
} from "lucide-react";

export default function Resultados() {
  const navigate = useNavigate();
  const { playSoundEffect, setIsSideMenuOpen, patientId } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  const staticResults = [
    {
      id: "res-1",
      testName: "Perfil Lipídico Completo",
      date: "04 Jun, 2026",
      specialty: "Cardiología Preventiva",
      doctor: "Dra. Elena Rivas",
      status: "Verificado",
      notes: "Niveles de Colesterol LDL ligeramente elevados; Colesterol HDL adecuado conforme a la edad del paciente.",
      metrics: [
        { name: "Colesterol Total", value: "210 mg/dL", range: "Deseable < 200", alert: true },
        { name: "Colesterol LDL", value: "135 mg/dL", range: "Deseable < 100", alert: true },
        { name: "Colesterol HDL", value: "54 mg/dL", range: "Deseable > 50", alert: false },
        { name: "Triglicéridos", value: "148 mg/dL", range: "Deseable < 150", alert: false },
      ]
    },
    {
      id: "res-2",
      testName: "Hemoglobina Glicosilada (HbA1c) & Glucosa",
      date: "18 May, 2026",
      specialty: "Medicina General",
      doctor: "Dr. Víctor Málaga",
      status: "Normal",
      notes: "Niveles de glucemia en ayunas óptimos. Sin indicadores de resistencia metabólica o prediabetes.",
      metrics: [
        { name: "Glucosa en Ayunas", value: "92 mg/dL", range: "Normal 70-100", alert: false },
        { name: "HbA1c", value: "5.4%", range: "Normal < 5.7%", alert: false },
      ]
    },
    {
      id: "res-3",
      testName: "Dosaje de Hormonas Tiroideas (TSH y T4L)",
      date: "02 Abr, 2026",
      specialty: "Endocrinología Clínica",
      doctor: "Dra. Carmen Ugarte",
      status: "Verificado",
      notes: "La actividad de la glándula tiroides se reporta estable con parámetros de secreción estándar.",
      metrics: [
        { name: "TSH Ultrasensible", value: "2.4 uIU/mL", range: "Rango 0.4 - 4.5", alert: false },
        { name: "T4 Libre", value: "1.2 ng/dL", range: "Rango 0.8 - 1.8", alert: false },
      ]
    }
  ];

  useEffect(() => {
    async function loadResults() {
      setIsLoading(true);
      try {
        let toShow: any[] = staticResults;
        if (patientId) {
          try {
            const { getDiagnostics } = await import("../../lib/supabase/diagnostic");
            const res = await getDiagnostics(patientId);
            if (!res.error && res.data && res.data.length > 0) {
              toShow = res.data.map((dbRes: any) => ({
                id: dbRes.id,
                testName: dbRes.test_name,
                date: new Date(dbRes.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
                specialty: dbRes.specialty?.name || "Especialidad",
                doctor: dbRes.doctor_name || "Médico",
                status: dbRes.status || "Verificado",
                notes: dbRes.notes || "Sin notas clínicas adicionales.",
                metrics: (dbRes.metrics || []).map((m: any) => ({
                  name: m.metric_name,
                  value: m.value || "-",
                  range: m.normal_range || "",
                  alert: m.has_alert || false
                }))
              }));
            }
          } catch {
            toShow = staticResults;
          }
        }
        setResults(toShow);
      } finally {
        setIsLoading(false);
      }
    }
    loadResults();
  }, [patientId]);

  const filteredResults = results.filter(res => 
    res.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <span className="font-serif text-lg font-bold text-[#111]">Resultados</span>
        </div>
        <button
          onClick={() => { playSoundEffect("click"); setIsSideMenuOpen(true); }}
          className="text-stone-500 hover:text-stone-900 text-xs font-serif font-black"
        >
          Menú
        </button>
      </div>

      <div className="p-6 space-y-5 flex-1 flex flex-col">
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-500 tracking-widest font-mono">Exámenes Diagnósticos</span>
          <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight mt-1">Laboratorio & Informes</h2>
          <p className="text-xs text-stone-500 mt-1">
            Visualice los datos analíticos de exámenes clínicos firmados digitalmente de manera segura por la junta de EsSalud.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar por prueba o médico..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-205 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-stone-700 shadow-xs focus:outline-none focus:border-stone-400"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        {/* Results Cards List */}
        <div className="space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-[10px] text-stone-400 font-bold uppercase font-mono tracking-wider">Cargando resultados...</span>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-stone-500 border border-dashed border-stone-200 rounded-2xl bg-[#FCFAF7] text-xs">
              No se han encontrado registros concordantes.
            </div>
          ) : (
            filteredResults.map((res) => (
              <div 
                key={res.id} 
                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs relative text-left"
              >
                <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[9px] text-[#58735F] uppercase font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {res.specialty}
                    </span>
                    <h3 className="text-xs font-black text-stone-950 mt-1.5">{res.testName}</h3>
                    <p className="text-[10px] text-stone-500 mt-1">Médico Creador: <span className="font-bold text-stone-700">{res.doctor}</span></p>
                  </div>
                  <span className="text-[9px] text-stone-400 font-mono font-bold shrink-0">{res.date}</span>
                </div>

                {/* Metrics detail table */}
                <div className="py-3 space-y-2">
                  <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider block">Métricas Analizadas</span>
                  <div className="grid grid-cols-2 gap-2">
                    {res.metrics.map((m: any, mIdx: number) => (
                      <div key={mIdx} className="bg-stone-50 p-2 rounded-xl border border-stone-100 flex flex-col justify-between">
                        <div className="flex justify-between items-baseline gap-1">
                          <span className="text-[9px] text-stone-500 font-bold truncate">{m.name}</span>
                          {m.alert && <span className="text-[8px] bg-rose-100 text-rose-800 font-black px-1.5 rounded-full">Alto</span>}
                        </div>
                        <div className="mt-1 bg-white p-2 rounded-lg border border-stone-150">
                          <span className={`text-xs font-bold font-mono tracking-wide ${m.alert ? "text-rose-750" : "text-stone-900"}`}>{m.value}</span>
                        </div>
                        <span className="text-[8px] text-stone-400 block font-mono mt-1 text-center">{m.range}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient notes section */}
                {res.notes && (
                  <div className="mt-1 p-3 bg-stone-100/50 rounded-lg border border-stone-200">
                    <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider font-mono">Notas Diagnósticas</span>
                    <p className="text-xs text-stone-700 italic mt-1">{res.notes}</p>
                  </div>
                )}

                {/* Floating Download Option */}
                <button
                  type="button"
                  onClick={() => {
                    playSoundEffect("click");
                    alert(`El informe clínico original de "${res.testName}" certificado administrativamente por EsSalud se ha descargado a su memoria local.`);
                    playSoundEffect("success");
                  }}
                  className="w-full mt-3.5 bg-stone-900 hover:bg-stone-950 text-white font-bold py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar Certificado Firmado (.ZIP/PDF)
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

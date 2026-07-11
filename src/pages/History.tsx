import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  Menu, MapPin, FileText 
} from "lucide-react";

export default function History() {
  const navigate = useNavigate();
  const {
    prescriptions,
    historyTab,
    setHistoryTab,
    downloadingDocId,
    downloadPrescription,
    playSoundEffect,
    setIsSideMenuOpen
  } = useAppState();

  const handleTabClick = (tab: "Todos" | "Recientes" | "Especialistas") => {
    playSoundEffect("click");
    setHistoryTab(tab);
  };

  const filteredPrescriptions = prescriptions.filter((presc) => {
    if (historyTab === "Recientes") {
      // Mostrar las últimas 2 recetas ordenadas por fecha (más recientes primero)
      const sorted = [...prescriptions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const recentIds = sorted.slice(0, 2).map(p => p.id);
      return recentIds.includes(presc.id);
    }
    if (historyTab === "Especialistas") {
      return presc.specialty === "Cardiología" || 
             presc.specialty === "Cardiología Preventiva" ||
             presc.specialty === "Neurología" ||
             presc.specialty === "Traumatología";
    }
    return true; // "Todos"
  });

  return (
    <div className="flex-1 flex flex-col pb-20 animate-fade-in text-neutral-900 text-left">
      {/* Header bar */}
      <div className="flex justify-between items-center py-3 px-6 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-3 text-left">
          <Menu 
            onClick={() => { playSoundEffect("click"); setIsSideMenuOpen(true); }}
            className="w-5 h-5 text-neutral-800 cursor-pointer" 
          />
          <span className="font-serif text-lg font-bold uppercase tracking-widest text-[#111]">AGEMED</span>
        </div>
        <div 
          onClick={() => { playSoundEffect("click"); navigate("/profile"); }}
          className="w-9 h-9 rounded-full ring-2 ring-stone-200 overflow-hidden cursor-pointer"
        >
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" 
            alt="User profile thumbnail menu" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="p-6">
        {/* Headline */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 leading-none">Historial Médico</h2>
          <p className="text-stone-500 text-xs mt-2 leading-relaxed">
            Consulte sus citas de EsSalud anteriores y descargue sus recetas médicas digitales de forma segura.
          </p>
        </div>

        {/* Segmented Filter Tab Controls */}
        <div className="mt-5 flex gap-2">
          {(["Todos", "Recientes", "Especialistas"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`py-2 px-4 rounded-full text-xs font-bold transition duration-150 cursor-pointer ${
                historyTab === tab 
                  ? "bg-stone-950 text-white" 
                  : "bg-stone-200/60 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Past Prescriptions list */}
        <div className="mt-6 space-y-4">
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map((presc) => (
              <div key={presc.id} className="bg-white p-4 rounded-xl border border-stone-250 shadow-xs text-left relative">
                {/* Completion Status badge */}
                <div className="flex justify-between items-center pb-3 border-b border-stone-100 mb-3">
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-110 font-mono">
                    Completada
                  </span>
                  <span className="text-stone-500 font-mono text-[11px] font-semibold">{presc.date}</span>
                </div>

                {/* Specialist Row */}
                <div className="flex gap-3 text-left">
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 ring-1 ring-stone-100">
                    <img src={presc.doctorPhoto} alt={presc.doctorName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 leading-tight">{presc.doctorName}</h4>
                    <p className="text-[10px] text-stone-400 font-bold uppercase font-mono tracking-widest mt-0.5">{presc.specialty}</p>
                    <span className="flex items-center gap-1 text-[11px] text-stone-500 mt-1 font-mono">
                      <MapPin className="w-3 h-3 text-stone-400" /> {presc.location}
                    </span>
                  </div>
                </div>

                {/* Download PDF CTA trigger button */}
                <button 
                  type="button"
                  onClick={() => downloadPrescription(presc)}
                  disabled={downloadingDocId === presc.id}
                  className="w-full bg-white hover:bg-stone-50 text-stone-850 border border-stone-350 font-bold py-3.5 rounded-xl text-xs mt-4 flex items-center justify-center gap-2 active:scale-98 transition duration-150 disabled:opacity-50 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-stone-500" /> 
                  {downloadingDocId === presc.id ? "Generando PDF Seguro..." : "Descargar Receta Digital"}
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white text-center py-12 px-4 rounded-xl border border-stone-200 mt-4 text-stone-400">
              <p className="font-serif font-bold text-sm">Sin registros</p>
              <p className="text-xs mt-1">No hay recetas médicas para esta categoría.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

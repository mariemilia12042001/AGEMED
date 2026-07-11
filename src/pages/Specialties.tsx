import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, Search, Heart, Briefcase, Eye, Smile, Bone, Scissors, Activity, Brain, ShieldAlert
} from "lucide-react";
import { getActiveSpecialties } from "../../lib/supabase/specialty";

// Map database icon keys to frontend Lucide components
const iconMap: Record<string, React.ComponentType<any>> = {
  "home-heart": Briefcase,
  "heart-pulse": Heart,
  "eye": Eye,
  "baby": Smile,
  "bone": Bone,
  "sparkles": Scissors,
  "scissors": Scissors,
  "activity": Activity,
  "brain": Brain
};

export default function Specialties() {
  const navigate = useNavigate();
  const { playSoundEffect, setSelectedSpecialty } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const staticSpecialties = [
    { name: "Medicina General", icon_key: "home-heart", color_class: "bg-stone-100 text-stone-800", active_doctors_count: 4, description: "Cuidado primario y preventivo integral de adultos." },
    { name: "Cardiología", icon_key: "heart-pulse", color_class: "bg-rose-50 text-rose-700", active_doctors_count: 2, description: "Evaluación y tratamiento de afecciones cardíacas." },
    { name: "Oftalmología", icon_key: "eye", color_class: "bg-blue-50 text-blue-700", active_doctors_count: 1, description: "Salud ocular, agudeza visual y chequeos preventivos." },
    { name: "Pediatría", icon_key: "baby", color_class: "bg-amber-50 text-amber-700", active_doctors_count: 3, description: "Seguimiento médico y vacunas infantiles." },
    { name: "Traumatología", icon_key: "bone", color_class: "bg-emerald-50 text-emerald-700", active_doctors_count: 1, description: "Lesiones osteoarticulares y dolor crónico muscular." },
    { name: "Dermatología", icon_key: "sparkles", color_class: "bg-purple-50 text-purple-700", active_doctors_count: 1, description: "Tratamientos de la piel, alergias y lunares." },
    { name: "Ginecología", icon_key: "activity", color_class: "bg-fuchsia-50 text-fuchsia-700", active_doctors_count: 2, description: "Controles preventivos y salud reproductiva." },
    { name: "Neurología", icon_key: "brain", color_class: "bg-indigo-50 text-indigo-700", active_doctors_count: 1, description: "Trastornos del sistema nervioso y migrañas." },
  ];

  useEffect(() => {
    async function loadSpecialties() {
      setLoading(true);
      setError(null);
      try {
        const res = await getActiveSpecialties();
        if (res.error) {
          console.warn("Error al cargar especialidades reales, usando fallback:", res.error);
          setSpecialties(staticSpecialties);
        } else if (res.data) {
          setSpecialties(res.data);
        }
      } catch (err: any) {
        console.error("Excepción al obtener especialidades, usando fallback:", err);
        setSpecialties(staticSpecialties);
      } finally {
        setLoading(false);
      }
    }
    loadSpecialties();
  }, []);

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  const handleSelect = (specName: string) => {
    playSoundEffect("click");
    setSelectedSpecialty(specName);
    navigate("/doctors");
  };

  const filtered = specialties.filter(spec => 
    (spec.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (spec.description || "").toLowerCase().includes(searchQuery.toLowerCase())
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
          <span className="font-serif text-lg font-bold text-[#111]">Especialidades</span>
        </div>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar especialidad médica..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium text-stone-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
        </div>

        <p className="text-[11px] font-mono text-stone-400 font-bold uppercase mt-5 tracking-wider">
          {filtered.length} Especialidades disponibles
        </p>

        {/* List */}
        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-[10px] text-stone-400 font-bold uppercase font-mono tracking-wider">Cargando especialidades...</span>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((spec, i) => {
              const Icon = iconMap[spec.icon_key || ""] || Briefcase;
              return (
                <div 
                  key={i}
                  onClick={() => handleSelect(spec.name)}
                  className="bg-white p-4 rounded-xl border border-stone-200/80 hover:border-stone-400 cursor-pointer flex items-start gap-4 transition active:scale-[0.99] duration-150"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${spec.color_class || "bg-stone-100 text-stone-800"}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-sm font-bold text-stone-900">{spec.name}</h4>
                      <span className="bg-stone-100 text-stone-500 font-mono font-bold text-[9px] px-2 py-0.5 rounded-full">
                        {spec.active_doctors_count} Médicos
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 leading-normal">{spec.description}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white text-center py-12 px-4 rounded-xl border border-stone-200 mt-4 h-44 flex flex-col justify-center items-center">
              <ShieldAlert className="w-8 h-8 text-stone-300" />
              <p className="text-stone-405 font-serif font-bold text-sm mt-2">Sin coincidencias</p>
              <p className="text-stone-400 text-xs mt-1">Busque otra especialidad autorizada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

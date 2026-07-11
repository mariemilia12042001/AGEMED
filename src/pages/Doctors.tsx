import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Doctor } from "../types";
import { initialDoctors } from "../data";
import { getDoctors, DoctorFilters } from "../../lib/supabase/doctor";

export default function Doctors() {
  const navigate = useNavigate();
  const {
    selectedSpecialty,
    setSelectedSpecialty,
    searchDoctorQuery,
    setSearchDoctorQuery,
    setSelectedDoctor,
    playSoundEffect,
    sedeFilter,
    setSedeFilter,
    ratingFilter,
    turnoFilter
  } = useAppState();

  // Sedes disponibles según los doctores fallback (lo que ve el usuario en el demo)
  const SEDES_CENTROS = [
    { key: "Cualquiera",           label: "Todos los centros" },
    { key: "Clínica San Lucas",    label: "Clínica San Lucas" },
    { key: "Hospital Real de San Rafael", label: "Hospital San Rafael" },
    { key: "Sede Centro",          label: "Sede Centro" },
    { key: "Sede Norte",           label: "Sede Norte" },
    { key: "Sede Sur",             label: "Sede Sur" },
    { key: "Sede Este",            label: "Sede Este" },
    { key: "Clínica Central",      label: "Clínica Central" },
  ];

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function mapDbDoctorToFrontend(dbDoc: any): Doctor {
    return {
      id: dbDoc.id,
      name: dbDoc.name,
      specialty: dbDoc.specialty?.name || "Especialista",
      rating: Number(dbDoc.rating),
      image: dbDoc.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
      description: dbDoc.description || "",
      location: `${dbDoc.sede || ""}, ${dbDoc.location_office || ""}`.trim().replace(/^,\s*/, "")
    };
  }

  useEffect(() => {
    async function loadDoctors() {
      setLoading(true);
      setError(null);

      const filters: DoctorFilters = {};
      
      // Mapear especialidad seleccionada si no es la general
      if (selectedSpecialty && selectedSpecialty !== "Medicina General") {
        filters.specialtySlug = selectedSpecialty.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar tildes
          .replace(/[^a-z0-9]/g, "-");
      }

      if (searchDoctorQuery) {
        filters.search = searchDoctorQuery;
      }

      if (sedeFilter && sedeFilter !== "Cualquiera") {
        filters.sede = sedeFilter;
      }

      if (ratingFilter && ratingFilter > 0) {
        filters.minRating = ratingFilter;
      }

      if (turnoFilter && turnoFilter !== "Cualquiera") {
        filters.turno = (turnoFilter.includes("Mañana") ? "Mañana" : "Tarde") as any;
      }

      try {
        const res = await getDoctors(filters);
        if (res.error) {
          console.warn("Error al cargar médicos reales de Supabase, usando fallback:", res.error);
          fallbackLocalFiltering();
        } else if (res.data) {
          setDoctors(res.data.map(mapDbDoctorToFrontend));
        }
      } catch (err: any) {
        console.error("Excepción al cargar médicos:", err);
        fallbackLocalFiltering();
      } finally {
        setLoading(false);
      }
    }

    function fallbackLocalFiltering() {
      const filteredLocal = initialDoctors.filter((doc: Doctor) => {
        const matchesSpecialty = doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
        
        const matchesSearch = 
          doc.name.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchDoctorQuery.toLowerCase());

        const matchesSede = sedeFilter === "Cualquiera" ||
          doc.location.toLowerCase().includes(sedeFilter.toLowerCase());

        const matchesRating = !ratingFilter || doc.rating >= ratingFilter;

        return matchesSpecialty && matchesSearch && matchesSede && matchesRating;
      });
      setDoctors(filteredLocal);
    }

    loadDoctors();
  }, [selectedSpecialty, searchDoctorQuery, sedeFilter, ratingFilter, turnoFilter]);

  const handleBackToDashboard = () => {
    playSoundEffect("click");
    navigate("/dashboard");
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    playSoundEffect("click");
    setSelectedDoctor(doctor);
    navigate("/consultation-form");
  };

  return (
    <div className="flex-1 flex flex-col pb-20 animate-fade-in text-neutral-900 text-left">
      {/* Header bar */}
      <div className="flex justify-between items-center py-3 px-6 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleBackToDashboard}
            className="p-1 hover:bg-stone-100 rounded-full transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-850" />
          </button>
          <span className="font-serif text-lg font-bold text-[#111]">{selectedSpecialty}</span>
        </div>
        <div 
          onClick={() => { playSoundEffect("click"); navigate("/profile"); }}
          className="w-9 h-9 rounded-full ring-2 ring-stone-200 overflow-hidden cursor-pointer"
        >
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" 
            alt="Profile Patient" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="p-6">
        {/* Search inside specialists */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar especialista..." 
            value={searchDoctorQuery}
            onChange={(e) => setSearchDoctorQuery(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium text-stone-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
        </div>

        {/* SEDE / CENTRO DE SALUD SELECTOR */}
        <div className="mt-4">
          <span className="text-[10px] font-mono text-stone-500 font-bold uppercase tracking-wider">Centro de salud</span>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin whitespace-nowrap">
            {SEDES_CENTROS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => { playSoundEffect("click"); setSedeFilter(s.key); }}
                className={`shrink-0 py-1.5 px-3 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                  sedeFilter === s.key
                    ? "bg-stone-950 text-white border-stone-950"
                    : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter header */}
        <div className="mt-3.5 flex justify-between items-center">
          <span className="text-[11px] font-mono text-stone-400 font-bold uppercase">
            {doctors.length} Especialistas Encontrados
          </span>
          <button 
            onClick={() => { playSoundEffect("click"); navigate("/doctors-filter"); }}
            className="flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:border-stone-400 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" /> Más Filtros
          </button>
        </div>

        {/* Doctor List cards */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-[10px] text-stone-400 font-bold uppercase font-mono tracking-wider">Cargando especialistas...</span>
            </div>
          ) : doctors.length > 0 ? (
            doctors.map((doc: Doctor) => (
              <div key={doc.id} className="bg-white p-4 rounded-xl border border-stone-250 shadow-xs flex flex-col">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 ring-1 ring-stone-100">
                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-stone-900 leading-snug">{doc.name}</h4>
                      <span className="text-yellow-600 text-xs font-bold font-mono shrink-0 flex items-center gap-0.5">
                        ★ {doc.rating}
                      </span>
                    </div>
                    <p className="text-[10px] uppercase text-stone-400 font-bold tracking-wider font-mono mt-0.5">{doc.specialty}</p>
                    <span className="text-[10px] text-zinc-500 font-sans block mt-1 leading-snug">{doc.location}</span>
                  </div>
                </div>
                
                <p className="text-[11px] text-zinc-650 mt-3 line-clamp-3 leading-relaxed text-left">
                  {doc.description}
                </p>

                <button 
                  onClick={() => handleSelectDoctor(doc)}
                  className="bg-stone-950 hover:bg-stone-900 text-white font-medium py-2 rounded-lg text-xs mt-4 w-full active:scale-98 transition duration-150 cursor-pointer"
                >
                  Reservar Consulta
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white text-center py-12 px-4 rounded-xl border border-stone-200 mt-4 h-52 flex flex-col justify-center">
              <p className="text-stone-405 font-serif font-bold text-sm">Disculpe</p>
              <p className="text-stone-400 text-xs mt-2">No se han encontrado médicos especialistas para su búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

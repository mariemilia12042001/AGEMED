import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { 
  ArrowLeft, ChevronRight, Clock, Check, AlertCircle, MapPin
} from "lucide-react";
import { Appointment } from "../types";

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Franjas horarias por defecto si el doctor no tiene una lista propia
const DEFAULT_TIME_SLOTS = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM"];

// Días laborables por defecto: lunes a viernes
const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5];

function toIsoDate(year: number, monthIndex0: number, day: number): string {
  return `${year}-${String(monthIndex0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function DateSelection() {
  const navigate = useNavigate();
  const {
    selectedDoctor,
    selectedBookDate,
    setSelectedBookDate,
    selectedBookTime,
    setSelectedBookTime,
    consultationReason,
    symptomsInput,
    symptomsDuration,
    setAppointments,
    playSoundEffect,
  } = useAppState();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mes visible en el calendario (por defecto el mes actual). Se puede
  // avanzar al siguiente mes si el usuario lo desea. No permitimos ir a
  // meses pasados porque no tiene sentido en un flujo de reserva.
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth()); // 0-11

  const doctorWeekdays = selectedDoctor?.availableWeekdays && selectedDoctor.availableWeekdays.length > 0
    ? selectedDoctor.availableWeekdays
    : DEFAULT_WEEKDAYS;

  const doctorTimeSlots = selectedDoctor?.availableTimeSlots && selectedDoctor.availableTimeSlots.length > 0
    ? selectedDoctor.availableTimeSlots
    : DEFAULT_TIME_SLOTS;

  // Cuando el mes o el doctor cambian, buscamos el primer día seleccionable
  // y lo pre-seleccionamos para que el botón "Confirmar" no quede en un día no válido.
  useEffect(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    let firstAvailable: number | null = null;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const isFuture = date.getTime() >= today.getTime();
      const isDoctorDay = doctorWeekdays.includes(date.getDay());
      if (isFuture && isDoctorDay) {
        firstAvailable = d;
        break;
      }
    }
    if (firstAvailable !== null) {
      setSelectedBookDate(firstAvailable);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewYear, viewMonth, selectedDoctor?.id]);

  // Si el time slot actual no está entre los del doctor, ajustamos al primero disponible
  useEffect(() => {
    if (!doctorTimeSlots.includes(selectedBookTime)) {
      setSelectedBookTime(doctorTimeSlots[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor?.id]);

  const handleBack = () => {
    playSoundEffect("click");
    navigate("/consultation-form");
  };

  const goPrevMonth = () => {
    // No permitimos ir a un mes pasado (antes del mes actual)
    if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) return;
    playSoundEffect("click");
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goNextMonth = () => {
    playSoundEffect("click");
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleConfirmReservation = () => {
    if (!selectedDoctor) {
      setError("Por favor, seleccione un especialista primero.");
      return;
    }

    // Validar que el día seleccionado sea válido para el doctor
    const chosenDate = new Date(viewYear, viewMonth, selectedBookDate);
    if (chosenDate.getTime() < today.getTime()) {
      setError("La fecha seleccionada ya pasó. Elija un día futuro.");
      return;
    }
    if (!doctorWeekdays.includes(chosenDate.getDay())) {
      setError("El especialista no atiende ese día. Elija otro día resaltado.");
      return;
    }
    if (!doctorTimeSlots.includes(selectedBookTime)) {
      setError("El especialista no atiende en ese horario. Elija otro.");
      return;
    }

    playSoundEffect("click");
    setLoading(true);
    setError(null);

    const isoDate = toIsoDate(viewYear, viewMonth, selectedBookDate);

    const locationParts = (selectedDoctor.location || "").split(",");
    const newAppointment: Appointment = {
      id: `appt-${Date.now()}`,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      doctorPhoto: selectedDoctor.image,
      date: isoDate,
      time: selectedBookTime,
      locationName: (locationParts[0] || "Hospital de EsSalud").trim(),
      locationDetails: (locationParts.slice(1).join(",") || "Piso 4, Consultorio 402").trim(),
      status: "scheduled",
      consultationReason: consultationReason || "Control de salud integral y consulta médica.",
      symptoms: symptomsInput || "Ninguno",
      symptomsDuration: symptomsDuration,
      preparationItems: [
        { id: `pre-${Date.now()}-1`, label: "Ayuno de 8 horas", checked: false },
        { id: `pre-${Date.now()}-2`, label: "Traer historial previo", checked: false },
        { id: `pre-${Date.now()}-3`, label: "Llegar 15 min antes", checked: false },
      ],
    };

    setAppointments((prev: Appointment[]) => [newAppointment, ...prev]);
    playSoundEffect("success");
    setLoading(false);
    navigate("/confirmed");
  };

  // Construir la grilla del calendario del mes visible
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay(); // 0=Dom, 1=Lun...
  // Convertir a semana que empieza en Lunes: cuántas celdas vacías van antes del día 1
  const leadingBlanks = (firstWeekday + 6) % 7;

  const isSameMonth = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
  const monthTitle = `${MONTH_NAMES_ES[viewMonth]} ${viewYear}`;

  return (
    <div className="flex-1 flex flex-col pb-20 animate-fade-in text-neutral-900 text-left">
      {/* Header bar */}
      <div className="flex justify-between items-center py-3 px-6 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-3 text-left">
          <button 
            type="button"
            onClick={handleBack}
            className="p-1 hover:bg-stone-100 rounded-full transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-850" />
          </button>
          <span className="font-serif text-lg font-bold text-[#111]">Cita</span>
        </div>
        <div className="w-9 h-9"></div>
      </div>

      <div className="p-6">
        {/* Headline */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 leading-tight">Seleccione una fecha</h2>
          <p className="text-stone-500 text-xs mt-2 leading-relaxed">
            Elija el día y la hora que mejor se adapten a su agenda de salud.
          </p>
        </div>

        {/* SEDE / CENTRO ASIGNADO al doctor */}
        {selectedDoctor && (
          <div className="mt-4 bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex gap-3 items-start">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider font-mono block">Centro de atención</span>
              <h4 className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                {(selectedDoctor.location || "Sede principal").split(",")[0].trim()}
              </h4>
              <p className="text-[10px] text-stone-500 mt-0.5 truncate">
                {(selectedDoctor.location || "").split(",").slice(1).join(",").trim() || "Consultorio de especialidad"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { playSoundEffect("click"); navigate("/doctors"); }}
              className="text-[10px] font-bold text-stone-500 hover:text-stone-900 underline whitespace-nowrap"
            >
              Cambiar
            </button>
          </div>
        )}

        {selectedDoctor && (
          <p className="text-[11px] text-emerald-800 font-mono font-semibold mt-3 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 inline-block">
            Disponibilidad de {selectedDoctor.name}
          </p>
        )}

        {/* Calendar Widget Container */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mt-6 text-left">
          <div className="flex justify-between items-center mb-4">
            <span className="font-serif text-sm font-extrabold text-stone-850">{monthTitle}</span>
            <div className="flex gap-1">
              <button 
                type="button" 
                onClick={goPrevMonth}
                disabled={isSameMonth}
                className="p-1 border border-stone-200 rounded-lg hover:border-stone-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button 
                type="button" 
                onClick={goNextMonth}
                className="p-1 border border-stone-250 rounded-lg hover:border-stone-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-wider">
            <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span className="text-stone-400">Sáb</span><span className="text-stone-400">Dom</span>
          </div>

          {/* Day numbers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
            {/* Celdas vacías al inicio */}
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <span key={`blank-${i}`} className="py-1.5"></span>
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewYear, viewMonth, day);
              const isPast = date.getTime() < today.getTime();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isDoctorDay = doctorWeekdays.includes(date.getDay());
              const isSelectable = !isPast && isDoctorDay;
              const isSelected = selectedBookDate === day;
              const isToday = date.getTime() === today.getTime();

              if (!isSelectable) {
                return (
                  <span
                    key={day}
                    className={`py-1.5 font-mono ${
                      isPast 
                        ? "text-stone-300" 
                        : isWeekend 
                          ? "text-stone-300" 
                          : "text-stone-350 line-through decoration-stone-200"
                    }`}
                    title={isPast ? "Fecha pasada" : "No disponible"}
                  >
                    {day}
                  </span>
                );
              }

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => { playSoundEffect("click"); setSelectedBookDate(day); }}
                  className={`py-1.5 text-center font-mono rounded-full cursor-pointer transition ${
                    isSelected 
                      ? "bg-stone-950 text-white font-bold" 
                      : isToday
                        ? "border border-emerald-400 text-emerald-800 hover:bg-emerald-50"
                        : "hover:bg-stone-100 text-stone-900"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Leyenda pequeña */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-stone-500 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-950 inline-block"></span> Seleccionado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full border border-emerald-400 inline-block"></span> Hoy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-300 inline-block"></span> No disponible
            </span>
          </div>
        </div>

        {/* TIME SLOTS CONTAINER BLOCK */}
        <div className="mt-6 text-left">
          <h3 className="font-serif text-sm font-bold text-stone-850 mb-3 uppercase tracking-wider">Horarios disponibles</h3>
          
          <div className="space-y-2">
            {doctorTimeSlots.map((tm) => {
              const isSelected = selectedBookTime === tm;
              return (
                <div 
                  key={tm}
                  onClick={() => {
                    playSoundEffect("click");
                    setSelectedBookTime(tm);
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isSelected 
                      ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs" 
                      : "bg-white border-stone-200 text-stone-800 hover:border-stone-400"
                  }`}
                >
                  <span className="text-xs font-bold font-mono flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-500" /> {tm}
                  </span>
                  {isSelected ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3 stroke-[3]" /> Seleccionado
                    </span>
                  ) : (
                    <span className="bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono">
                      Disponible
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Book trigger action */}
        {error && (
          <div className="mt-4 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-605 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleConfirmReservation}
          disabled={loading}
          className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl text-xs mt-6 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition duration-200 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></span> Reservando...
            </span>
          ) : (
            <>Confirmar Reservación de Cita ➔</>
          )}
        </button>

      </div>
    </div>
  );
}

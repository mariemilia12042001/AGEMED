import { Doctor, Appointment, Prescription, PushNotification } from "./types";

// Franjas horarias base (patrones reales para simular escenarios distintos por doctor)
const SLOTS_MORNING = ["08:00 AM", "09:30 AM", "11:00 AM"];
const SLOTS_FULL_DAY = ["08:30 AM", "10:00 AM", "11:30 AM", "02:30 PM", "04:00 PM"];
const SLOTS_AFTERNOON = ["01:30 PM", "03:00 PM", "04:30 PM", "06:00 PM"];
const SLOTS_EARLY = ["07:30 AM", "09:00 AM", "10:30 AM"];

export const initialDoctors: Doctor[] = [
  // ══════════ MEDICINA GENERAL ══════════
  {
    id: "dra-morales",
    name: "Dra. Elena Morales",
    specialty: "Medicina General",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
    description: "Enfoque en geriatría y bienestar emocional. Reconocida por su trato empático y diagnósticos precisos en pacientes crónicos.",
    location: "Sede Norte, Consultorio 210",
    availableWeekdays: [1, 2, 3, 4, 5],
    availableTimeSlots: SLOTS_FULL_DAY,
  },
  {
    id: "dr-ruiz",
    name: "Dr. Roberto Ruiz",
    specialty: "Medicina General",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    description: "Experto en medicina preventiva y nutrición clínica. Diseña planes personalizados para mantener un estilo de vida activo y saludable.",
    location: "Sede Sur, Consultorio 104",
    availableWeekdays: [1, 3, 5],
    availableTimeSlots: SLOTS_MORNING,
  },
  {
    id: "dra-torres",
    name: "Dra. Lucía Torres",
    specialty: "Medicina General",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    description: "Dedicada a la atención primaria y seguimiento de pacientes polimedicados. Claridad y paciencia al explicar tratamientos.",
    location: "Sede Este, Consultorio 302",
    availableWeekdays: [2, 4],
    availableTimeSlots: SLOTS_AFTERNOON,
  },
  {
    id: "dr-cardenas",
    name: "Dr. Sebastián Cárdenas",
    specialty: "Medicina General",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    description: "Especialista en cuidado preventivo y salud integral para adultos mayores con más de 15 años de trayectoria en atención de alta complejidad.",
    location: "Sede Centro, Consultorio 201",
    availableWeekdays: [1, 2, 4, 5],
    availableTimeSlots: SLOTS_FULL_DAY,
  },

  // ══════════ CARDIOLOGÍA ══════════
  {
    id: "dr-valdivia",
    name: "Dr. Alejandro Valdivia",
    specialty: "Cardiología",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300",
    description: "Cardiología preventiva y arritmias. Miembro sénior de la Sociedad Peruana de Cardiología con más de 20 años atendiendo pacientes.",
    location: "Clínica San Lucas, Torre Médica Piso 4",
    availableWeekdays: [2, 4],
    availableTimeSlots: SLOTS_MORNING,
  },
  {
    id: "dra-salinas",
    name: "Dra. Rocío Salinas",
    specialty: "Cardiología",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300",
    description: "Ecocardiografía avanzada y seguimiento post-infarto. Enfoque en rehabilitación cardíaca y control lipídico integral.",
    location: "Clínica San Lucas, Piso 3",
    availableWeekdays: [1, 3, 5],
    availableTimeSlots: SLOTS_FULL_DAY,
  },

  // ══════════ OFTALMOLOGÍA ══════════
  {
    id: "dra-marta-ruiz",
    name: "Dra. Marta Ruiz",
    specialty: "Oftalmología",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=300",
    description: "Diagnóstico y tratamiento de patologías retinales, agudeza visual y control preventivo de cataratas y glaucoma.",
    location: "Clínica Central, Piso 2",
    availableWeekdays: [1, 3, 5],
    availableTimeSlots: SLOTS_EARLY,
  },

  // ══════════ PEDIATRÍA ══════════
  {
    id: "dra-herrera",
    name: "Dra. Carolina Herrera",
    specialty: "Pediatría",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300",
    description: "Especialista en desarrollo infantil y esquemas de vacunación. Atención cálida para bebés y niños en edad escolar.",
    location: "Sede Norte, Consultorio 105",
    availableWeekdays: [1, 2, 3, 4, 5],
    availableTimeSlots: SLOTS_MORNING,
  },
  {
    id: "dr-aguilar",
    name: "Dr. Manuel Aguilar",
    specialty: "Pediatría",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    description: "Pediatría general y control del niño sano. Manejo respetuoso de vacunas y controles de crecimiento.",
    location: "Sede Sur, Consultorio 108",
    availableWeekdays: [2, 4],
    availableTimeSlots: SLOTS_FULL_DAY,
  },

  // ══════════ TRAUMATOLOGÍA ══════════
  {
    id: "dr-nunez",
    name: "Dr. Fernando Núñez",
    specialty: "Traumatología",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    description: "Lesiones osteoarticulares, dolor lumbar crónico y rehabilitación deportiva. Enfoque conservador antes de cirugía.",
    location: "Hospital Real de San Rafael, Piso 5",
    availableWeekdays: [1, 4, 5],
    availableTimeSlots: SLOTS_AFTERNOON,
  },

  // ══════════ DERMATOLOGÍA ══════════
  {
    id: "dra-palacios",
    name: "Dra. Andrea Palacios",
    specialty: "Dermatología",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
    description: "Tratamientos de piel, revisión de lunares, alergias cutáneas y dermatología estética conservadora.",
    location: "Sede Centro, Consultorio 305",
    availableWeekdays: [3, 5],
    availableTimeSlots: SLOTS_MORNING,
  },

  // ══════════ GINECOLOGÍA ══════════
  {
    id: "dra-leon",
    name: "Dra. Patricia León",
    specialty: "Ginecología",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    description: "Controles preventivos, salud reproductiva y climaterio. Atención cercana con enfoque en salud integral de la mujer.",
    location: "Sede Norte, Consultorio 220",
    availableWeekdays: [2, 4],
    availableTimeSlots: SLOTS_FULL_DAY,
  },
  {
    id: "dra-vargas",
    name: "Dra. Sofía Vargas",
    specialty: "Ginecología",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=300",
    description: "Ginecología general y seguimiento de embarazo de bajo riesgo. Consejería anticonceptiva y planificación familiar.",
    location: "Sede Sur, Consultorio 112",
    availableWeekdays: [1, 3, 5],
    availableTimeSlots: SLOTS_AFTERNOON,
  },

  // ══════════ NEUROLOGÍA ══════════
  {
    id: "dr-vera",
    name: "Dr. Ignacio Vera",
    specialty: "Neurología",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300",
    description: "Trastornos del sistema nervioso central, migrañas crónicas y evaluación de deterioro cognitivo temprano.",
    location: "Hospital Real de San Rafael, Piso 4",
    availableWeekdays: [1, 3],
    availableTimeSlots: SLOTS_MORNING,
  },
];

// Fecha de la cita demo: mañana en formato ISO YYYY-MM-DD
const _tomorrow = new Date();
_tomorrow.setDate(_tomorrow.getDate() + 1);
const _tomorrowIso = `${_tomorrow.getFullYear()}-${String(_tomorrow.getMonth() + 1).padStart(2, "0")}-${String(_tomorrow.getDate()).padStart(2, "0")}`;

export const initialAppointments: Appointment[] = [
  {
    id: "appt-1",
    doctorName: "Dr. Alejandro Valdivia",
    specialty: "Cardiología",
    doctorPhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300",
    date: _tomorrowIso,
    time: "10:30 AM",
    locationName: "Clínica San Lucas",
    locationDetails: "Torre Médica, Piso 4, Consultorio 402",
    status: "scheduled",
    consultationReason: "Control de arritmia leve y revisión general de electrocardiograma.",
    symptoms: "Fatiga menor por las tardes",
    symptomsDuration: "2-3 días",
    preparationItems: [
      { id: "pre-1", label: "Ayuno de 8 horas", checked: true },
      { id: "pre-2", label: "Traer historial previo", checked: true },
      { id: "pre-3", label: "Llegar 15 min antes", checked: true },
    ],
  }
];

export const initialPrescriptions: Prescription[] = [
  {
    id: "rec-1",
    date: "15 Oct 2023",
    doctorName: "Dra. Rocío Salinas",
    specialty: "Cardiología",
    doctorPhoto: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300",
    location: "Clínica San Lucas, Piso 3",
    medicines: [
      { name: "Atorvastatina 20mg", dosage: "1 tableta", frequency: "Cada 24 horas", duration: "30 días", checked: false },
      { name: "Aspirina 100mg", dosage: "1 tableta", frequency: "Cada 24 horas (después del almuerzo)", duration: "60 días", checked: false }
    ],
    notes: "Monitorear la presión arterial dos veces por semana."
  },
  {
    id: "rec-2",
    date: "02 Oct 2023",
    doctorName: "Dra. Elena Morales",
    specialty: "Medicina General",
    doctorPhoto: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
    location: "Sede Norte, Consultorio 210",
    medicines: [
      { name: "Paracetamol 1g", dosage: "1 tableta", frequency: "Cada 8 horas si hay dolor o fiebre", duration: "5 días", checked: false },
      { name: "Ibuprofeno 400mg", dosage: "1 tableta", frequency: "Cada 12 horas", duration: "3 días", checked: false }
    ],
    notes: "Tomar abundante agua y guardar reposo por 48 horas."
  },
  {
    id: "rec-3",
    date: "22 Sep 2023",
    doctorName: "Dra. Marta Ruiz",
    specialty: "Oftalmología",
    doctorPhoto: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=300",
    location: "Clínica Central, Piso 2",
    medicines: [
      { name: "Lágrimas Artificiales Gotas", dosage: "1 gota en cada ojo", frequency: "Cada 4 horas", duration: "15 días", checked: false }
    ],
    notes: "Evitar frotar los ojos y limitar uso de pantallas digitales."
  },
  {
    id: "rec-4",
    date: "10 Sep 2023",
    doctorName: "Dr. Fernando Núñez",
    specialty: "Traumatología",
    doctorPhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    location: "Hospital Real de San Rafael, Piso 5",
    medicines: [
      { name: "Gel de Diclofenac", dosage: "Aplicar en zona lumbar", frequency: "Cada 12 horas con masajes suaves", duration: "10 días", checked: false }
    ],
    notes: "Realizar estiramientos recomendados 2 veces al día."
  }
];

export const defaultNotifications: PushNotification[] = [
  {
    id: "not-1",
    type: "cita",
    title: "Cita programada para mañana",
    body: "Estimada Elena, recuerde su cita con el Dr. Alejandro Valdivia de Cardiología mañana a las 10:30 AM en Clínica San Lucas.",
    receivedAt: "Hace 10 minutos",
    read: false,
    actionPayload: "details-appt-1"
  },
  {
    id: "not-2",
    type: "medicamento",
    title: "Toma de Medicamento: Atorvastatina",
    body: "Es hora de tomar Atorvastatina (1 tableta - 20mg). Recuerde ingerirla antes de acostarse para control de lípidos.",
    receivedAt: "Hace 2 horas",
    read: true,
    actionPayload: "history"
  }
];

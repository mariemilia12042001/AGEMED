import { Doctor, Appointment, Prescription, PushNotification } from "./types";

export const initialDoctors: Doctor[] = [
  {
    id: "dr-sanz",
    name: "Dr. Alejandro Sanz",
    specialty: "Medicina General",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    description: "Especialista en cuidado preventivo y salud integral para adultos mayores con más de 15 años de trayectoria en atención de alta complejidad.",
    location: "Sede Centro, Piso 2, Consultorio 201"
  },
  {
    id: "dra-morales",
    name: "Dra. Elena Morales",
    specialty: "Medicina General",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
    description: "Enfoque en geriatría y bienestar emocional. Reconocida por su trato empático y diagnósticos precisos en pacientes crónicos.",
    location: "Sede Norte, local 12"
  },
  {
    id: "dr-ruiz",
    name: "Dr. Roberto Ruiz",
    specialty: "Medicina General",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    description: "Experto en medicina preventiva y nutrición clínica. Ayuda a sus pacientes a mantener un estilo de vida activo y saludable mediante planes preventivos personalizados.",
    location: "Sede Sur, Consultorio 104"
  },
  {
    id: "dra-torres",
    name: "Dra. Lucía Torres",
    specialty: "Medicina General",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    description: "Dedicada a la atención primaria y seguimiento de pacientes polimedicados. Claridad y paciencia en la explicación de tratamientos.",
    location: "Sede Este, Consultorio 302"
  },
  {
    id: "dr-mendez",
    name: "Dr. Alejandro Méndez",
    specialty: "Cardiología",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    description: "Especialista sénior en cardiología preventiva y arritmias cardiovasculares, graduado con honores y miembro de la Sociedad Peruana de Cardiología.",
    location: "Clínica Central, Consultorio 402"
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: "appt-1",
    doctorName: "Dr. Alejandro Valdivia",
    specialty: "Cardiología Preventiva",
    doctorPhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    date: "Mañana, 14 de Octubre",
    time: "10:30 AM",
    locationName: "Clínica San Lucas",
    locationDetails: "Torre Médica, Piso 4, Consultorio 402",
    status: "scheduled",
    consultationReason: "Control de arritmia leve y revisión general de electrocardiograma.",
    symptoms: "Fatiga menor por las tardes",
    symptomsDuration: "2-3 días"
  }
];

export const initialPrescriptions: Prescription[] = [
  {
    id: "rec-1",
    date: "15 Oct 2023",
    doctorName: "Dra. Elena Rivas",
    specialty: "Cardiología",
    doctorPhoto: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
    location: "Clínica Central, Piso 4",
    medicines: [
      { name: "Atorvastatina 20mg", dosage: "1 tableta", frequency: "Cada 24 horas", duration: "30 días", checked: false },
      { name: "Aspirina 100mg", dosage: "1 tableta", frequency: "Cada 24 horas (después del almuerzo)", duration: "60 días", checked: false }
    ],
    notes: "Monitorear la presión arterial dos veces por semana."
  },
  {
    id: "rec-2",
    date: "02 Oct 2023",
    doctorName: "Dr. Jorge Luis",
    specialty: "Medicina General",
    doctorPhoto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    location: "Consultorio Norte, local 12",
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
    doctorPhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    location: "Clínica Central, Piso 2",
    medicines: [
      { name: "Lágrimas Artificiales Gotas", dosage: "1 gota en cada ojo", frequency: "Cada 4 horas", duration: "15 días", checked: false }
    ],
    notes: "Evitar frotar los ojos y limitar uso de pantallas digitales."
  },
  {
    id: "rec-4",
    date: "10 Sep 2023",
    doctorName: "Dr. Luis Mendez",
    specialty: "Fisioterapia",
    doctorPhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    location: "Centro Kinesia, Sala B",
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
    body: "Estimada Elena, recuerde su cita con el Dr. Alejandro Valdivia de Cardiología Preventiva mañana a las 10:30 AM en Clínica San Lucas.",
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

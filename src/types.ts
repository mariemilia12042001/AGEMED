export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  image: string;
  description: string;
  location: string;
  // Días de la semana en que atiende (0=Domingo, 1=Lunes, ..., 6=Sábado)
  availableWeekdays?: number[];
  // Franjas horarias en que atiende ese doctor
  availableTimeSlots?: string[];
}

export interface EncryptedValue {
  ciphertext: string;
  iv: string;
  salt: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  doctorPhoto: string;
  date: string; // e.g. "Mañana, 14 de Octubre" or "Jueves, 24 de Agosto"
  time: string; // e.g. "10:30 AM" or "12:00 PM"
  locationName: string; // e.g. "Clínica San Lucas", "Hospital Real de San Rafael"
  locationDetails: string; // e.g. "Torre Médica, Piso 4, Consultorio 402"
  status: 'scheduled' | 'completada' | 'pendiente_informacion' | 'cancelada';
  consultationReason?: string;
  symptoms?: string;
  symptomsDuration?: string;
  preparationItems?: { id: string; label: string; checked: boolean }[];
}

export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  specialty: string;
  doctorPhoto: string;
  location: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    checked?: boolean;
    encryptedDetails?: EncryptedValue;
  }[];
  notes?: string;
  encryptedNotes?: EncryptedValue;
}

export interface PushNotification {
  id: string;
  type: 'medicamento' | 'cita' | 'seguimiento';
  title: string;
  body: string;
  receivedAt: string;
  read: boolean;
  actionPayload?: string; // Screen key or custom navigation
}

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

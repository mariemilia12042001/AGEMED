import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Doctor, Appointment, Prescription, PushNotification, ChatMessage } from "../types";
import { initialDoctors, initialAppointments, initialPrescriptions, defaultNotifications } from "../data";

// Supabase services imports
import { getProfile, getSettings } from "../../lib/supabase/patient";
import { getAppointments } from "../../lib/supabase/appointment";
import { getPrescriptions } from "../../lib/supabase/prescription";
import { getNotifications } from "../../lib/supabase/notification";
import { getChatHistory, sendMessageToAssistant } from "../../lib/supabase/chat";

// Mapping functions to adapt database schema models to existing frontend models
export function mapDbAppointmentToFrontend(dbApp: any): Appointment {
  return {
    id: dbApp.id,
    doctorName: dbApp.doctor?.name || "Médico Especialista",
    specialty: dbApp.doctor?.specialty?.name || dbApp.specialty || "Especialidad",
    doctorPhoto: dbApp.doctor?.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    date: dbApp.date,
    time: dbApp.time_slot,
    locationName: dbApp.doctor?.sede || dbApp.destination_location || "Sede Principal",
    locationDetails: dbApp.doctor?.location_office || dbApp.location_details || "",
    status: dbApp.status === 'completed' ? 'completada' : dbApp.status === 'cancelled' ? 'cancelada' : 'scheduled',
    consultationReason: dbApp.consultation_reason || "",
    symptoms: dbApp.symptoms || "",
    symptomsDuration: dbApp.symptoms_duration || "",
    preparationItems: (dbApp.preparationitem || []).map((item: any) => ({
      id: item.id,
      label: item.label,
      checked: item.is_checked
    }))
  };
}

export function mapDbPrescriptionToFrontend(dbPresc: any): Prescription {
  return {
    id: dbPresc.id,
    date: dbPresc.date || "Fecha",
    doctorName: dbPresc.doctor?.name || "Médico Especialista",
    specialty: dbPresc.doctor?.specialty?.name || "Especialidad",
    doctorPhoto: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
    location: dbPresc.location || dbPresc.doctor?.sede || "Clínica Principal",
    medicines: (dbPresc.medicines || []).map((med: any) => ({
      name: "", // Will be decrypted in UI via SensitiveDataField
      dosage: "",
      frequency: med.frequency || "",
      duration: med.duration || "",
      checked: med.is_checked,
      encryptedDetails: {
        ciphertext: med.medicine_details_encrypted,
        iv: med.medicine_details_iv,
        salt: med.medicine_details_salt
      }
    })),
    notes: "",
    encryptedNotes: {
      ciphertext: dbPresc.notes_encrypted,
      iv: dbPresc.notes_iv,
      salt: dbPresc.notes_salt
    }
  };
}

export function mapDbNotificationToFrontend(dbNot: any): PushNotification {
  return {
    id: dbNot.id,
    type: dbNot.type === 'medicamento' || dbNot.type === 'cita' || dbNot.type === 'seguimiento' ? dbNot.type : 'cita',
    title: dbNot.title || "Notificación",
    body: dbNot.body || "",
    receivedAt: dbNot.received_at ? new Date(dbNot.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Ahora mismo",
    read: dbNot.is_read || false,
    actionPayload: dbNot.action_payload || ""
  };
}

interface AppContextProps {
  // Navigation & Screen selection
  activePath: string;
  setActivePath: (path: string) => void;
  
  // User Authentication
  dniInput: string;
  setDniInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;

  // Supabase Patient details
  patientId: string;
  setPatientId: (id: string) => void;
  patientProfile: any | null;
  setPatientProfile: React.Dispatch<React.SetStateAction<any | null>>;
  patientSettings: any | null;
  setPatientSettings: React.Dispatch<React.SetStateAction<any | null>>;
  isDataLoading: boolean;
  dataError: string | null;
  refetchPatientData: (id?: string) => Promise<void>;

  // Specialists & Specialty search
  selectedSpecialty: string;
  setSelectedSpecialty: (spec: string) => void;
  searchDoctorQuery: string;
  setSearchDoctorQuery: (query: string) => void;
  selectedDoctor: Doctor | null;
  setSelectedDoctor: (doc: Doctor | null) => void;

  // Doctor Filters
  sedeFilter: string;
  setSedeFilter: (sede: string) => void;
  ratingFilter: number;
  setRatingFilter: (rating: number) => void;
  turnoFilter: string;
  setTurnoFilter: (turno: string) => void;

  // Booking states
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  consultationReason: string;
  setConsultationReason: (reason: string) => void;
  symptomsInput: string;
  setSymptomsInput: (symptoms: string) => void;
  symptomsDuration: string;
  setSymptomsDuration: (duration: string) => void;
  selectedBookDate: number;
  setSelectedBookDate: (day: number) => void;
  selectedBookTime: string;
  setSelectedBookTime: (time: string) => void;
  preparationList: { id: string; label: string; checked: boolean }[];
  togglePreparationItem: (id: string) => void;

  // Medical prescriptions and downloads
  prescriptions: Prescription[];
  setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
  historyTab: "Todos" | "Recientes" | "Especialistas";
  setHistoryTab: (tab: "Todos" | "Recientes" | "Especialistas") => void;
  downloadingDocId: string | null;
  downloadPrescription: (presc: Prescription) => void;
  showPdfAlert: boolean;
  setShowPdfAlert: (show: boolean) => void;
  activePdfData: Prescription | null;
  setActivePdfData: (presc: Prescription | null) => void;

  // Sound system toggle
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  playSoundEffect: (type: "notification" | "click" | "success" | "call" | "hangup") => void;

  // Chatbot State
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  userChatInput: string;
  setUserChatInput: (input: string) => void;
  isAiLoading: boolean;
  handleSendMessage: (e?: React.FormEvent, customText?: string) => Promise<void>;

  // Notification simulator
  notifications: PushNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<PushNotification[]>>;
  hasNewNotifications: boolean;
  setHasNewNotifications: (has: boolean) => void;
  activeBanner: PushNotification | null;
  setActiveBanner: (banner: PushNotification | null) => void;
  triggerNotification: (type: "medicamento" | "cita" | "seguimiento") => void;
  handleBannerClick: (not: PushNotification, navigateCallback: (path: string) => void) => void;

  // Call simulation state
  isIncomingCall: boolean;
  setIsIncomingCall: (incoming: boolean) => void;
  isCallActive: boolean;
  setIsCallActive: (active: boolean) => void;
  callTimer: number;
  setCallTimer: (time: number) => void;
  triggerCallSimulation: (navigateCallback: (path: string) => void) => void;

  // Real-time top bar system clock
  systemTime: string;

  // Global Side Menu Drawer State
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: (val: boolean) => void;
}

const AppStateContext = createContext<AppContextProps | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [activePath, setActivePath] = useState<string>("/");
  
  // User Authentication
  const [dniInput, setDniInput] = useState<string>("45.289.102-K");
  const [passwordInput, setPasswordInput] = useState<string>("••••••••");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Supabase Patient details
  const [patientId, setPatientId] = useState<string>("a001a001-a001-a001-a001-a001a001a001");
  const [patientProfile, setPatientProfile] = useState<any | null>(null);
  const [patientSettings, setPatientSettings] = useState<any | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Specialists & Specialty search
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Medicina General");
  const [searchDoctorQuery, setSearchDoctorQuery] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Doctor Filters
  const [sedeFilter, setSedeFilter] = useState<string>("Cualquiera");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [turnoFilter, setTurnoFilter] = useState<string>("Cualquiera");

  // Booking states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultationReason, setConsultationReason] = useState<string>("");
  const [symptomsInput, setSymptomsInput] = useState<string>("");
  const [symptomsDuration, setSymptomsDuration] = useState<string>("2-3 días");
  const [selectedBookDate, setSelectedBookDate] = useState<number>(3);
  const [selectedBookTime, setSelectedBookTime] = useState<string>("12:00 PM");
  
  const [preparationList, setPreparationList] = useState([
    { id: "pre-1", label: "Ayuno de 8 horas", checked: true },
    { id: "pre-2", label: "Traer historial previo", checked: true },
    { id: "pre-3", label: "Llegar 15 min antes", checked: true }
  ]);

  const togglePreparationItem = (id: string) => {
    playSoundEffect("click");
    setPreparationList(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p));
  };

  // Prescription records
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [historyTab, setHistoryTab] = useState<"Todos" | "Recientes" | "Especialistas">("Todos");
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [showPdfAlert, setShowPdfAlert] = useState<boolean>(false);
  const [activePdfData, setActivePdfData] = useState<Prescription | null>(null);

  // Sound effects
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "assistant",
      text: "¡Hola! Soy tu Asistente AGEMED. Estoy aquí para ayudarte con tus citas, resolver dudas médicas generales o asisterte con el uso de la aplicación.",
      timestamp: "10:00 AM"
    },
    {
      id: "m2",
      sender: "assistant",
      text: "¿En qué puedo apoyarte hoy? He notado que tienes una cita programada para mañana.",
      timestamp: "10:00 AM"
    },
    {
      id: "m3",
      sender: "user",
      text: "Hola, tengo dudas sobre mi cita de mañana.",
      timestamp: "10:01 AM"
    }
  ]);
  const [userChatInput, setUserChatInput] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Push notifications
  const [notifications, setNotifications] = useState<PushNotification[]>(defaultNotifications);
  const [hasNewNotifications, setHasNewNotifications] = useState<boolean>(true);
  const [activeBanner, setActiveBanner] = useState<PushNotification | null>(null);

  // Telephone system
  const [isIncomingCall, setIsIncomingCall] = useState<boolean>(false);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callTimer, setCallTimer] = useState<number>(0);
  const callIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tracking system time
  const [systemTime, setSystemTime] = useState<string>("");

  // Global Side Menu Drawer State
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);

  const refetchPatientData = async (targetId?: string) => {
    const idToUse = targetId || patientId;
    if (!idToUse) return;
    setIsDataLoading(true);
    setDataError(null);
    try {
      const [profileRes, appointmentsRes, prescriptionsRes, notificationsRes, settingsRes, chatRes] = await Promise.all([
        getProfile(idToUse),
        getAppointments(idToUse),
        getPrescriptions(idToUse),
        getNotifications(idToUse),
        getSettings(idToUse),
        getChatHistory(idToUse)
      ]);

      if (profileRes.data) {
        setPatientProfile(profileRes.data);
      } else if (profileRes.error) {
        console.warn("Real patient profile fetch failed, using fallback:", profileRes.error);
      }

      if (appointmentsRes.data) {
        setAppointments(appointmentsRes.data.map(mapDbAppointmentToFrontend));
      } else if (appointmentsRes.error) {
        console.warn("Real appointments fetch failed, using fallback:", appointmentsRes.error);
        setAppointments(initialAppointments);
      }

      if (prescriptionsRes.data) {
        setPrescriptions(prescriptionsRes.data.map(mapDbPrescriptionToFrontend));
      } else if (prescriptionsRes.error) {
        console.warn("Real prescriptions fetch failed, using fallback:", prescriptionsRes.error);
        setPrescriptions(initialPrescriptions);
      }

      if (notificationsRes.data) {
        setNotifications(notificationsRes.data.map(mapDbNotificationToFrontend));
      } else if (notificationsRes.error) {
        console.warn("Real notifications fetch failed, using fallback:", notificationsRes.error);
        setNotifications(defaultNotifications);
      }

      if (settingsRes.data) {
        setPatientSettings(settingsRes.data);
        setIsSoundEnabled(settingsRes.data.is_sound_enabled);
      } else if (settingsRes.error) {
        console.warn("Real settings fetch failed, using fallback:", settingsRes.error);
      }

      if (chatRes.data && chatRes.data.length > 0) {
        const dbMessages = chatRes.data.map((msg: any) => ({
          id: msg.id,
          sender: msg.sender as 'user' | 'assistant',
          text: msg.text,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setChatMessages(dbMessages);
      } else if (chatRes.error) {
        console.warn("Chat history fetch failed, keeping default messages:", chatRes.error);
      }
    } catch (err: any) {
      console.error("Supabase data loading exception, using fallback mocks:", err);
      setAppointments(initialAppointments);
      setPrescriptions(initialPrescriptions);
      setNotifications(defaultNotifications);
      setDataError(err.message || "Error al sincronizar con Supabase");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && patientId) {
      refetchPatientData(patientId);
    } else {
      setAppointments([]);
      setPrescriptions([]);
      setPatientProfile(null);
      setPatientSettings(null);
    }
  }, [isLoggedIn, patientId]);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      let hours = d.getHours();
      let minutes = d.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minStr = minutes < 10 ? "0" + minutes : minutes;
      setSystemTime(`${hours}:${minStr} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Call duration counter
  useEffect(() => {
    if (isCallActive) {
      callIntervalRef.current = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
      }
      setCallTimer(0);
    }
    return () => {
      if (callIntervalRef.current) clearInterval(callIntervalRef.current);
    };
  }, [isCallActive]);

  // Play modern microchimes using Web Audio API synthesis
  const playSoundEffect = (type: "notification" | "click" | "success" | "call" | "hangup") => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      switch (type) {
        case "notification": {
          const osc1 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(880, ctx.currentTime);
          osc1.frequency.setValueAtTime(1200, ctx.currentTime + 0.1); 
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc1.connect(gain);
          gain.connect(ctx.destination);
          osc1.start();
          osc1.stop(ctx.currentTime + 0.5);
          break;
        }
        case "click": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(650, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
          break;
        }
        case "success": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
          osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
          break;
        }
        case "call": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(480, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
          break;
        }
        case "hangup": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
          break;
        }
      }
    } catch (e) {
      console.log("Web Audio not supported or blocked directly by user gesture rules.", e);
    }
  };

  // Push notifications
  const triggerNotification = (type: "medicamento" | "cita" | "seguimiento") => {
    playSoundEffect("notification");
    
    let newNot: PushNotification;
    
    if (type === "medicamento") {
      newNot = {
        id: `not-${Date.now()}`,
        type: "medicamento",
        title: "Recordatorio Médico: Atorvastatina 20mg",
        body: "Estimada Elena, es hora de su dosis nocturna para control del colesterol. Recuerde marcar su toma.",
        receivedAt: "Ahora mismo",
        read: false,
        actionPayload: "history"
      };
    } else if (type === "cita") {
      newNot = {
        id: `not-${Date.now()}`,
        type: "cita",
        title: "Cita Pendiente de Confirmación",
        body: "Su cita de Cardiología Preventiva con el Dr. Alejandro Valdivia se encuentra lista. Confirme su asistencia.",
        receivedAt: "Ahora mismo",
        read: false,
        actionPayload: "details-appt-1"
      };
    } else {
      newNot = {
        id: `not-${Date.now()}`,
        type: "seguimiento",
        title: "Seguimiento Post-Consulta",
        body: "EsSalud le recuerda descargar su receta digital de Cardiología emitida por la Dra. Elena Rivas.",
        receivedAt: "Ahora mismo",
        read: false,
        actionPayload: "history"
      };
    }

    setNotifications(prev => [newNot, ...prev]);
    setHasNewNotifications(true);
    setActiveBanner(newNot);
    
    setTimeout(() => {
      setActiveBanner(null);
    }, 6000);
  };

  const handleBannerClick = (not: PushNotification, navigateCallback: (path: string) => void) => {
    setActiveBanner(null);
    playSoundEffect("click");
    if (not.actionPayload === "history") {
      navigateCallback("/history");
    } else if (not.actionPayload === "details-appt-1") {
      navigateCallback("/pre-appointment");
    }
  };

  // Mock Receipt/Prescription PDF generator
  const downloadPrescription = (presc: Prescription) => {
    playSoundEffect("click");
    setDownloadingDocId(presc.id);
    
    setTimeout(() => {
      setDownloadingDocId(null);
      setActivePdfData(presc);
      setShowPdfAlert(true);
      playSoundEffect("success");
    }, 1500);
  };

  // Emergency Call Simulation
  const triggerCallSimulation = (navigateCallback: (path: string) => void) => {
    playSoundEffect("call");
    setIsIncomingCall(true);
    navigateCallback("/profile");
  };

  // Chat conversation
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || userChatInput;
    if (!textToSend.trim()) return;

    playSoundEffect("click");

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserChatInput("");
    setIsAiLoading(true);

    try {
      // 1st attempt: Supabase Edge Function (stores messages in DB, applies system prompt + Gemini)
      if (patientId) {
        const edgeRes = await sendMessageToAssistant(patientId, textToSend);
        if (!edgeRes.error && edgeRes.data) {
          const assistantMsg: ChatMessage = {
            id: edgeRes.data.assistantResponse.id,
            sender: "assistant",
            text: edgeRes.data.assistantResponse.text,
            timestamp: new Date(edgeRes.data.assistantResponse.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => [...prev, assistantMsg]);
          playSoundEffect("success");
          return;
        }
        console.warn("Edge Function chat failed, trying local API:", edgeRes.error);
      }

      // 2nd attempt: local /api/chat (development proxy or local AI backend)
      const chatHistory = [...chatMessages, userMsg].map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: "assistant",
        text: data.text || "He recibido tu consulta. Estoy aquí para atenderte.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, assistantMsg]);
      playSoundEffect("success");
    } catch (err) {
      // 3rd attempt: offline fallback mock response
      console.error("AI Assistant request error:", err);
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: "assistant",
          text: `Estimada Elena, he registrado tu consulta: "${textToSend}". Recuerda que tu cita con el Dr. Valdivia es mañana a las 10:30 AM en Clínica San Lucas y es vital mantener tu ayuno de 8 horas. No dudes en consultarme sobre tus medicamentos.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, assistantMsg]);
        playSoundEffect("success");
      }, 1000);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        activePath,
        setActivePath,
        dniInput,
        setDniInput,
        passwordInput,
        setPasswordInput,
        isLoggedIn,
        setIsLoggedIn,
        patientId,
        setPatientId,
        patientProfile,
        setPatientProfile,
        patientSettings,
        setPatientSettings,
        isDataLoading,
        dataError,
        refetchPatientData,
        selectedSpecialty,
        setSelectedSpecialty,
        searchDoctorQuery,
        setSearchDoctorQuery,
        selectedDoctor,
        setSelectedDoctor,
        sedeFilter,
        setSedeFilter,
        ratingFilter,
        setRatingFilter,
        turnoFilter,
        setTurnoFilter,
        appointments,
        setAppointments,
        consultationReason,
        setConsultationReason,
        symptomsInput,
        setSymptomsInput,
        symptomsDuration,
        setSymptomsDuration,
        selectedBookDate,
        setSelectedBookDate,
        selectedBookTime,
        setSelectedBookTime,
        preparationList,
        togglePreparationItem,
        prescriptions,
        setPrescriptions,
        historyTab,
        setHistoryTab,
        downloadingDocId,
        downloadPrescription,
        showPdfAlert,
        setShowPdfAlert,
        activePdfData,
        setActivePdfData,
        isSoundEnabled,
        setIsSoundEnabled,
        playSoundEffect,
        chatMessages,
        setChatMessages,
        userChatInput,
        setUserChatInput,
        isAiLoading,
        handleSendMessage,
        notifications,
        setNotifications,
        hasNewNotifications,
        setHasNewNotifications,
        activeBanner,
        setActiveBanner,
        triggerNotification,
        handleBannerClick,
        isIncomingCall,
        setIsIncomingCall,
        isCallActive,
        setIsCallActive,
        callTimer,
        setCallTimer,
        triggerCallSimulation,
        systemTime,
        isSideMenuOpen,
        setIsSideMenuOpen
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}

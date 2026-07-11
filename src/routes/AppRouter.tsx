import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ─── Lazy-loaded pages (code-split per route) ────────────────────────────────
const Login             = lazy(() => import("../pages/Login"));
const Dashboard         = lazy(() => import("../pages/Dashboard"));
const Doctors           = lazy(() => import("../pages/Doctors"));
const PreAppointment    = lazy(() => import("../pages/PreAppointment"));
const ConsultationForm  = lazy(() => import("../pages/ConsultationForm"));
const DateSelection     = lazy(() => import("../pages/DateSelection"));
const Confirmed         = lazy(() => import("../pages/Confirmed"));
const History           = lazy(() => import("../pages/History"));
const Profile           = lazy(() => import("../pages/Profile"));
const Chat              = lazy(() => import("../pages/Chat"));
const Specialties       = lazy(() => import("../pages/Specialties"));
const Directions        = lazy(() => import("../pages/Directions"));
const DoctorsFilter     = lazy(() => import("../pages/DoctorsFilter"));
const NotificationSettings = lazy(() => import("../pages/NotificationSettings"));
const PrivacySettings   = lazy(() => import("../pages/PrivacySettings"));
const HelpSettings      = lazy(() => import("../pages/HelpSettings"));
const ForgotPassword    = lazy(() => import("../pages/ForgotPassword"));
const ReservarCita      = lazy(() => import("../pages/ReservarCita"));
const MisCitas          = lazy(() => import("../pages/MisCitas"));
const Resultados        = lazy(() => import("../pages/Resultados"));
const Recetas           = lazy(() => import("../pages/Recetas"));
const Facturas          = lazy(() => import("../pages/Facturas"));
const Configuracion     = lazy(() => import("../pages/Configuracion"));

/** Minimal fallback shown while a page chunk is loading */
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <span className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-[#58735F] animate-spin" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Home / Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Dashboard />} />

        {/* Booking flow */}
        <Route path="/reservar-cita" element={<ReservarCita />} />
        <Route path="/mis-citas" element={<MisCitas />} />

        {/* Specialties */}
        <Route path="/specialties" element={<Specialties />} />
        <Route path="/especialidades" element={<Specialties />} />

        {/* Doctors */}
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/medicos" element={<Doctors />} />

        <Route path="/pre-appointment" element={<PreAppointment />} />
        <Route path="/consultation-form" element={<ConsultationForm />} />
        <Route path="/date-selection" element={<DateSelection />} />
        <Route path="/confirmed" element={<Confirmed />} />

        {/* History */}
        <Route path="/history" element={<History />} />

        {/* Diagnostics, Prescriptions & Billing */}
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/recetas" element={<Recetas />} />
        <Route path="/facturas" element={<Facturas />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/perfil" element={<Profile />} />

        {/* Chat / Messages */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/mensajes" element={<Chat />} />

        {/* Settings */}
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/profile/notifications" element={<NotificationSettings />} />
        <Route path="/profile/privacy" element={<PrivacySettings />} />
        <Route path="/profile/help" element={<HelpSettings />} />

        {/* Miscellaneous */}
        <Route path="/directions" element={<Directions />} />
        <Route path="/doctors-filter" element={<DoctorsFilter />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dynamic 404 Route redirecting to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}


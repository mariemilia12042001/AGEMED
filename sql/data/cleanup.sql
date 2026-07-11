-- ============================================================================
-- SCRIPT DE LIMPIEZA DE DATOS DE PRUEBA - AGEMED (EsSalud Digital)
-- ============================================================================
-- Este script elimina toda la información de las tablas en orden inverso de
-- dependencias para evitar violaciones de claves foráneas. Las tablas permanecen
-- intactas, listas para ser repobladas.

-- Opción alternativa rápida (si se tienen privilegios suficientes de administrador):
-- TRUNCATE TABLE 
--   ChatMessage, 
--   ParkingValidation, 
--   PatientSettings, 
--   PushNotification, 
--   Invoice, 
--   ResultMetric, 
--   DiagnosticResult, 
--   PrescriptionMedicine, 
--   Prescription, 
--   PreparationItem, 
--   Appointment, 
--   Doctor, 
--   Patient, 
--   Specialty 
-- CASCADE;

BEGIN;

-- 1. Tablas hoja (sin dependencias directas de otras tablas en cascada)
DELETE FROM ChatMessage;
DELETE FROM ParkingValidation;
DELETE FROM PatientSettings;
DELETE FROM PushNotification;
DELETE FROM Invoice;
DELETE FROM ResultMetric;

-- 2. Tablas intermedias de diagnósticos y recetas
DELETE FROM DiagnosticResult;
DELETE FROM PrescriptionMedicine;
DELETE FROM Prescription;
DELETE FROM PreparationItem;

-- 3. Tablas de citas y entidades principales
DELETE FROM Appointment;
DELETE FROM Doctor;
DELETE FROM Patient;
DELETE FROM Specialty;

COMMIT;

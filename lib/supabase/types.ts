export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';
export type NotificationType = 'medicamento' | 'cita' | 'seguimiento';
export type MessageSender = 'assistant' | 'user';

export interface Database {
  public: {
    Tables: {
      specialty: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          icon_key: string | null;
          color_class: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          icon_key?: string | null;
          color_class?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          icon_key?: string | null;
          color_class?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patient: {
        Row: {
          id: string;
          dni_encrypted: string;
          dni_iv: string;
          dni_salt: string;
          email: string;
          password_hash: string;
          full_name: string;
          blood_type_encrypted: string | null;
          blood_type_iv: string | null;
          blood_type_salt: string | null;
          emergency_contact_name: string | null;
          emergency_phone_encrypted: string | null;
          emergency_phone_iv: string | null;
          emergency_phone_salt: string | null;
          registered_center: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dni_encrypted: string;
          dni_iv: string;
          dni_salt: string;
          email: string;
          password_hash: string;
          full_name: string;
          blood_type_encrypted?: string | null;
          blood_type_iv?: string | null;
          blood_type_salt?: string | null;
          emergency_contact_name?: string | null;
          emergency_phone_encrypted?: string | null;
          emergency_phone_iv?: string | null;
          emergency_phone_salt?: string | null;
          registered_center?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dni_encrypted?: string;
          dni_iv?: string;
          dni_salt?: string;
          email?: string;
          password_hash?: string;
          full_name?: string;
          blood_type_encrypted?: string | null;
          blood_type_iv?: string | null;
          blood_type_salt?: string | null;
          emergency_contact_name?: string | null;
          emergency_phone_encrypted?: string | null;
          emergency_phone_iv?: string | null;
          emergency_phone_salt?: string | null;
          registered_center?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      doctor: {
        Row: {
          id: string;
          name: string;
          specialty_id: string | null;
          rating: number | null;
          image_url: string | null;
          description: string | null;
          location_office: string | null;
          sede: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          specialty_id?: string | null;
          rating?: number | null;
          image_url?: string | null;
          description?: string | null;
          location_office?: string | null;
          sede?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          specialty_id?: string | null;
          rating?: number | null;
          image_url?: string | null;
          description?: string | null;
          location_office?: string | null;
          sede?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_specialty_id_fkey";
            columns: ["specialty_id"];
            isOneToOne: false;
            referencedRelation: "specialty";
            referencedColumns: ["id"];
          }
        ];
      };
      appointment: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          time_slot: string;
          status: AppointmentStatus;
          consultation_reason: string | null;
          symptoms: string | null;
          symptoms_duration: string | null;
          destination_location: string | null;
          location_details: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          time_slot: string;
          status?: AppointmentStatus;
          consultation_reason?: string | null;
          symptoms?: string | null;
          symptoms_duration?: string | null;
          destination_location?: string | null;
          location_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          date?: string;
          time_slot?: string;
          status?: AppointmentStatus;
          consultation_reason?: string | null;
          symptoms?: string | null;
          symptoms_duration?: string | null;
          destination_location?: string | null;
          location_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointment_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient";
            referencedColumns: ["id"];
          }
        ];
      };
      preparationitem: {
        Row: {
          id: string;
          appointment_id: string;
          label: string;
          is_checked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          label: string;
          is_checked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          label?: string;
          is_checked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "preparationitem_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointment";
            referencedColumns: ["id"];
          }
        ];
      };
      prescription: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          location: string | null;
          notes_encrypted: string | null;
          notes_iv: string | null;
          notes_salt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          location?: string | null;
          notes_encrypted?: string | null;
          notes_iv?: string | null;
          notes_salt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          date?: string;
          location?: string | null;
          notes_encrypted?: string | null;
          notes_iv?: string | null;
          notes_salt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prescription_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctor";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescription_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient";
            referencedColumns: ["id"];
          }
        ];
      };
      prescriptionmedicine: {
        Row: {
          id: string;
          prescription_id: string;
          medicine_details_encrypted: string;
          medicine_details_iv: string;
          medicine_details_salt: string;
          frequency: string | null;
          duration: string | null;
          is_checked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prescription_id: string;
          medicine_details_encrypted: string;
          medicine_details_iv: string;
          medicine_details_salt: string;
          frequency?: string | null;
          duration?: string | null;
          is_checked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prescription_id?: string;
          medicine_details_encrypted?: string;
          medicine_details_iv?: string;
          medicine_details_salt?: string;
          frequency?: string | null;
          duration?: string | null;
          is_checked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prescriptionmedicine_prescription_id_fkey";
            columns: ["prescription_id"];
            isOneToOne: false;
            referencedRelation: "prescription";
            referencedColumns: ["id"];
          }
        ];
      };
      diagnosticresult: {
        Row: {
          id: string;
          patient_id: string;
          test_name: string;
          date: string;
          specialty_id: string | null;
          doctor_name: string | null;
          status: string | null;
          notes_encrypted: string | null;
          notes_iv: string | null;
          notes_salt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          test_name: string;
          date: string;
          specialty_id?: string | null;
          doctor_name?: string | null;
          status?: string | null;
          notes_encrypted?: string | null;
          notes_iv?: string | null;
          notes_salt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          test_name?: string;
          date?: string;
          specialty_id?: string | null;
          doctor_name?: string | null;
          status?: string | null;
          notes_encrypted?: string | null;
          notes_iv?: string | null;
          notes_salt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diagnosticresult_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diagnosticresult_specialty_id_fkey";
            columns: ["specialty_id"];
            isOneToOne: false;
            referencedRelation: "specialty";
            referencedColumns: ["id"];
          }
        ];
      };
      resultmetric: {
        Row: {
          id: string;
          result_id: string;
          metric_name: string;
          value_encrypted: string;
          value_iv: string;
          value_salt: string;
          normal_range: string | null;
          has_alert: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          result_id: string;
          metric_name: string;
          value_encrypted: string;
          value_iv: string;
          value_salt: string;
          normal_range?: string | null;
          has_alert?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          result_id?: string;
          metric_name?: string;
          value_encrypted?: string;
          value_iv?: string;
          value_salt?: string;
          normal_range?: string | null;
          has_alert?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resultmetric_result_id_fkey";
            columns: ["result_id"];
            isOneToOne: false;
            referencedRelation: "diagnosticresult";
            referencedColumns: ["id"];
          }
        ];
      };
      invoice: {
        Row: {
          id: string;
          patient_id: string;
          bill_no: string;
          date: string;
          concept: string;
          clinical_center: string | null;
          specialty: string | null;
          status: string;
          payer_encrypted: string | null;
          payer_iv: string | null;
          payer_salt: string | null;
          total_encrypted: string;
          total_iv: string;
          total_salt: string;
          payment_method_encrypted: string | null;
          payment_method_iv: string | null;
          payment_method_salt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          bill_no: string;
          date: string;
          concept: string;
          clinical_center?: string | null;
          specialty?: string | null;
          status?: string;
          payer_encrypted?: string | null;
          payer_iv?: string | null;
          payer_salt?: string | null;
          total_encrypted: string;
          total_iv: string;
          total_salt: string;
          payment_method_encrypted?: string | null;
          payment_method_iv?: string | null;
          payment_method_salt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          bill_no?: string;
          date?: string;
          concept?: string;
          clinical_center?: string | null;
          specialty?: string | null;
          status?: string;
          payer_encrypted?: string | null;
          payer_iv?: string | null;
          payer_salt?: string | null;
          total_encrypted?: string;
          total_iv?: string;
          total_salt?: string;
          payment_method_encrypted?: string | null;
          payment_method_iv?: string | null;
          payment_method_salt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoice_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient";
            referencedColumns: ["id"];
          }
        ];
      };
      pushnotification: {
        Row: {
          id: string;
          patient_id: string;
          type: NotificationType;
          title: string;
          body: string;
          received_at: string;
          is_read: boolean;
          action_payload: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          type: NotificationType;
          title: string;
          body: string;
          received_at?: string;
          is_read?: boolean;
          action_payload?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          type?: NotificationType;
          title?: string;
          body?: string;
          received_at?: string;
          is_read?: boolean;
          action_payload?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pushnotification_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient";
            referencedColumns: ["id"];
          }
        ];
      };
      patientsettings: {
        Row: {
          id: string;
          patient_id: string;
          is_sound_enabled: boolean;
          notifications_appointments: boolean;
          notifications_medicines: boolean;
          notifications_daily_tips: boolean;
          notifications_email_digest: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          is_sound_enabled?: boolean;
          notifications_appointments?: boolean;
          notifications_medicines?: boolean;
          notifications_daily_tips?: boolean;
          notifications_email_digest?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          is_sound_enabled?: boolean;
          notifications_appointments?: boolean;
          notifications_medicines?: boolean;
          notifications_daily_tips?: boolean;
          notifications_email_digest?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patientsettings_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: true;
            referencedRelation: "patient";
            referencedColumns: ["id"];
          }
        ];
      };
      parkingvalidation: {
        Row: {
          id: string;
          patient_id: string;
          appointment_id: string;
          sede: string;
          validated_at: string;
          is_applied: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          appointment_id: string;
          sede: string;
          validated_at?: string;
          is_applied?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          appointment_id?: string;
          sede?: string;
          validated_at?: string;
          is_applied?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "parkingvalidation_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "parkingvalidation_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient";
            referencedColumns: ["id"];
          }
        ];
      };
      chatmessage: {
        Row: {
          id: string;
          patient_id: string;
          sender: MessageSender;
          text: string;
          timestamp: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          sender: MessageSender;
          text: string;
          timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          sender?: MessageSender;
          text?: string;
          timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chatmessage_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

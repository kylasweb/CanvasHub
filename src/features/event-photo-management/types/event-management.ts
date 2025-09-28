export interface PhotoEvent {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  location: string;
  start_date: Date;
  end_date: Date;
  max_participants: number;
  current_participants: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  registration_code: string;
  settings: EventSettings;
  created_at: Date;
  updated_at: Date;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  participant_id: string;
  participant_name: string;
  email: string;
  phone?: string;
  status: 'registered' | 'checked_in' | 'cancelled';
  registration_date: Date;
  check_in_date?: Date;
  photo_count: number;
  created_at: Date;
}

export interface EventPhoto {
  id: string;
  event_id: string;
  participant_id: string;
  title?: string;
  description?: string;
  original_url: string;
  thumbnail_url: string;
  category?: string;
  tags: string[];
  upload_date: Date;
  uploaded_by: string;
  download_count: number;
  is_approved: boolean;
  metadata: PhotoMetadata;
}

export interface PhotoMetadata {
  dimensions: {
    width: number;
    height: number;
  };
  size: number;
  format: string;
  camera?: {
    make: string;
    model: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
  };
  date_taken?: Date;
}

export interface EventAnalytics {
  event_id: string;
  total_registrations: number;
  checked_in_count: number;
  total_photos: number;
  unique_participants_with_photos: number;
  total_downloads: number;
  last_activity: Date;
}

export interface EventSettings {
  auto_check_in: boolean;
  photo_upload_enabled: boolean;
  photo_approval_required: boolean;
  max_photos_per_participant: number;
  photo_size_limit: number; // MB
  allowed_formats: string[];
  watermark_enabled: boolean;
  notification_settings: NotificationSettings;
  privacy_settings: PrivacySettings;
}

export interface NotificationSettings {
  registration_confirmation: boolean;
  event_reminder: boolean;
  photo_upload_notification: boolean;
  event_completion: boolean;
}

export interface PrivacySettings {
  photos_visible_to_participants: boolean;
  allow_photo_sharing: boolean;
  require_consent_for_photos: boolean;
}

export interface QRCodeData {
  event_id: string;
  registration_code: string;
  event_name: string;
  generated_at: Date;
  expires_at: Date;
  qr_code_url: string;
}
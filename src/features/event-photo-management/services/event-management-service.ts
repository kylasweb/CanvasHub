import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  PhotoEvent,
  EventRegistration,
  EventPhoto,
  EventAnalytics,
  EventSettings,
  QRCodeData
} from '../types/event-management';

export class EventManagementService {
  // Event Management
  static async createEvent(eventData: Omit<PhotoEvent, 'id' | 'created_at' | 'updated_at'>): Promise<PhotoEvent> {
    try {
      const eventRef = await addDoc(collection(db, 'photo_events'), {
        ...eventData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      const eventDoc = await getDoc(eventRef);
      const data = eventDoc.data();
      return {
        id: eventDoc.id,
        ...data,
        created_at: data?.created_at?.toDate(),
        updated_at: data?.updated_at?.toDate()
      } as PhotoEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  static async getEventsByTenant(tenantId: string): Promise<PhotoEvent[]> {
    try {
      const q = query(
        collection(db, 'photo_events'),
        where('tenant_id', '==', tenantId),
        orderBy('start_date', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data?.created_at?.toDate(),
          updated_at: data?.updated_at?.toDate(),
          start_date: data?.start_date?.toDate(),
          end_date: data?.end_date?.toDate()
        } as PhotoEvent;
      });
    } catch (error) {
      console.error('Error getting events:', error);
      throw new Error('Failed to get events');
    }
  }

  static async updateEvent(eventId: string, updates: Partial<PhotoEvent>): Promise<void> {
    try {
      const eventRef = doc(db, 'photo_events', eventId);
      await updateDoc(eventRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  // Registration Management
  static async createRegistration(registrationData: Omit<EventRegistration, 'id' | 'created_at'>): Promise<EventRegistration> {
    try {
      const registrationRef = await addDoc(collection(db, 'event_registrations'), {
        ...registrationData,
        created_at: serverTimestamp()
      });

      const registrationDoc = await getDoc(registrationRef);
      const data = registrationDoc.data();
      return {
        id: registrationDoc.id,
        ...data,
        created_at: data?.created_at?.toDate(),
        registration_date: data?.registration_date?.toDate()
      } as EventRegistration;
    } catch (error) {
      console.error('Error creating registration:', error);
      throw new Error('Failed to create registration');
    }
  }

  static async getRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
    try {
      const q = query(
        collection(db, 'event_registrations'),
        where('event_id', '==', eventId),
        orderBy('registration_date', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data?.created_at?.toDate(),
          registration_date: data?.registration_date?.toDate()
        } as EventRegistration;
      });
    } catch (error) {
      console.error('Error getting registrations:', error);
      throw new Error('Failed to get registrations');
    }
  }

  static async updateRegistrationStatus(registrationId: string, status: 'registered' | 'checked_in' | 'cancelled'): Promise<void> {
    try {
      const registrationRef = doc(db, 'event_registrations', registrationId);
      await updateDoc(registrationRef, {
        status: status,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw new Error('Failed to update registration status');
    }
  }

  // Photo Management
  static async addEventPhoto(eventId: string, photoData: Omit<EventPhoto, 'id' | 'created_at'>): Promise<EventPhoto> {
    try {
      const photoRef = await addDoc(collection(db, 'event_photos'), {
        ...photoData,
        created_at: serverTimestamp()
      });

      const photoDoc = await getDoc(photoRef);
      const data = photoDoc.data();
      return {
        id: photoDoc.id,
        ...data,
        created_at: data?.created_at?.toDate(),
        upload_date: data?.upload_date?.toDate()
      } as unknown as EventPhoto;
    } catch (error) {
      console.error('Error adding event photo:', error);
      throw new Error('Failed to add event photo');
    }
  }

  static async getPhotosByEvent(eventId: string): Promise<EventPhoto[]> {
    try {
      const q = query(
        collection(db, 'event_photos'),
        where('event_id', '==', eventId),
        orderBy('upload_date', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data?.created_at?.toDate(),
          upload_date: data?.upload_date?.toDate()
        } as unknown as EventPhoto;
      });
    } catch (error) {
      console.error('Error getting event photos:', error);
      throw new Error('Failed to get event photos');
    }
  }

  static async updatePhotoDownloads(photoId: string): Promise<void> {
    try {
      const photoRef = doc(db, 'event_photos', photoId);
      await updateDoc(photoRef, {
        download_count: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating photo downloads:', error);
      throw new Error('Failed to update photo downloads');
    }
  }

  // QR Code Management
  static async generateQRCode(eventId: string): Promise<QRCodeData> {
    try {
      // In a real implementation, this would generate an actual QR code
      // For now, we'll return mock data
      const eventDoc = await getDoc(doc(db, 'photo_events', eventId));
      const eventData = eventDoc.data();

      if (!eventData) {
        throw new Error('Event not found');
      }

      const qrData: QRCodeData = {
        event_id: eventId,
        registration_code: eventData.registration_code,
        event_name: eventData.name,
        generated_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${eventId}-${eventData.registration_code}`
      };

      // Store QR code data
      await addDoc(collection(db, 'qr_codes'), {
        ...qrData,
        created_at: serverTimestamp()
      });

      return qrData;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static async validateQRCode(qrCodeData: string): Promise<{ valid: boolean; eventId?: string }> {
    try {
      // Parse QR code data
      const [eventId, registrationCode] = qrCodeData.split('-');

      if (!eventId || !registrationCode) {
        return { valid: false };
      }

      // Validate against event
      const eventDoc = await getDoc(doc(db, 'photo_events', eventId));
      const eventData = eventDoc.data();

      if (!eventData || eventData.registration_code !== registrationCode) {
        return { valid: false };
      }

      // Check if event is still active
      const now = new Date();
      if (now < eventData.start_date.toDate() || now > eventData.end_date.toDate()) {
        return { valid: false };
      }

      return { valid: true, eventId };
    } catch (error) {
      console.error('Error validating QR code:', error);
      return { valid: false };
    }
  }

  // Analytics
  static async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    try {
      const registrationsQuery = query(
        collection(db, 'event_registrations'),
        where('event_id', '==', eventId)
      );
      const registrationsSnapshot = await getDocs(registrationsQuery);
      const registrations = registrationsSnapshot.docs.map(doc => doc.data());

      const photosQuery = query(
        collection(db, 'event_photos'),
        where('event_id', '==', eventId)
      );
      const photosSnapshot = await getDocs(photosQuery);
      const photos = photosSnapshot.docs.map(doc => doc.data());

      const totalRegistrations = registrations.length;
      const checkedInCount = registrations.filter(r => r.status === 'checked_in').length;
      const totalPhotos = photos.length;
      const totalDownloads = photos.reduce((sum, photo) => sum + (photo.download_count || 0), 0);

      // Calculate unique participants with photos
      const participantsWithPhotos = new Set(photos.map(photo => photo.uploaded_by)).size;

      return {
        event_id: eventId,
        total_registrations: totalRegistrations,
        checked_in_count: checkedInCount,
        total_photos: totalPhotos,
        unique_participants_with_photos: participantsWithPhotos,
        total_downloads: totalDownloads,
        last_activity: new Date()
      };
    } catch (error) {
      console.error('Error getting event analytics:', error);
      throw new Error('Failed to get event analytics');
    }
  }

  // Auto-notification System
  static async sendEventNotification(eventId: string, type: 'registration' | 'photo_upload' | 'event_reminder', recipientId: string): Promise<void> {
    try {
      // In a real implementation, this would send actual notifications
      // For now, we'll just log the notification
      console.log(`Sending ${type} notification for event ${eventId} to recipient ${recipientId}`);

      // Store notification record
      await addDoc(collection(db, 'event_notifications'), {
        event_id: eventId,
        type: type,
        recipient_id: recipientId,
        sent_at: serverTimestamp(),
        status: 'sent'
      });
    } catch (error) {
      console.error('Error sending event notification:', error);
      throw new Error('Failed to send event notification');
    }
  }

  // Default Settings
  static createDefaultEventSettings(): EventSettings {
    return {
      auto_check_in: true,
      photo_upload_enabled: true,
      photo_approval_required: false,
      max_photos_per_participant: 50,
      photo_size_limit: 10, // MB
      allowed_formats: ['jpg', 'jpeg', 'png', 'heic'],
      watermark_enabled: false,
      notification_settings: {
        registration_confirmation: true,
        event_reminder: true,
        photo_upload_notification: true,
        event_completion: true
      },
      privacy_settings: {
        photos_visible_to_participants: true,
        allow_photo_sharing: true,
        require_consent_for_photos: true
      }
    };
  }

  static generateRegistrationCode(): string {
    // Generate a unique 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
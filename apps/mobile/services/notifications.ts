import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  categoryId?: string;
  sound?: boolean;
  badge?: number;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  trigger: Date | { seconds: number } | { repeats: boolean; hour: number; minute: number };
  data?: Record<string, any>;
}

class NotificationService {
  private readonly PUSH_TOKEN_KEY = 'expo_push_token';
  private readonly NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';

  constructor() {
    this.configureNotifications();
  }

  private configureNotifications() {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Create notification categories
    this.createNotificationCategories();
  }

  private async createNotificationCategories() {
    await Notifications.setNotificationCategoryAsync('weather_alert', [
      {
        identifier: 'view_weather',
        buttonTitle: 'View Weather',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('crop_reminder', [
      {
        identifier: 'mark_done',
        buttonTitle: 'Mark Done',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze 1h',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('sync_status', [
      {
        identifier: 'retry_sync',
        buttonTitle: 'Retry',
        options: { opensAppToForeground: true },
      },
    ]);
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with actual project ID
      });

      // Store token locally
      await AsyncStorage.setItem(this.PUSH_TOKEN_KEY, token.data);

      // TODO: Send token to your server
      await this.sendTokenToServer(token.data);

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // TODO: Implement API call to register token
      console.log('Push token:', token);
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  async sendLocalNotification(notification: NotificationData): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          categoryIdentifier: notification.categoryId,
          sound: notification.sound !== false,
          badge: notification.badge,
        },
        trigger: null, // Send immediately
      });

      return id;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return null;
    }
  }

  async scheduleNotification(notification: ScheduledNotification): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger: notification.trigger,
      });

      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Pre-built notification types for farm management

  async sendWeatherAlert(
    alertType: 'frost' | 'storm' | 'drought' | 'heat',
    description: string,
    farmName?: string
  ): Promise<string | null> {
    const titles = {
      frost: '🌡️ Frost Warning',
      storm: '⛈️ Storm Alert',
      drought: '☀️ Drought Warning',
      heat: '🔥 Heat Advisory',
    };

    return this.sendLocalNotification({
      title: titles[alertType],
      body: `${farmName ? `${farmName}: ` : ''}${description}`,
      data: { type: 'weather_alert', alertType, farmName },
      categoryId: 'weather_alert',
    });
  }

  async sendCropReminder(
    task: string,
    cropName: string,
    fieldName?: string
  ): Promise<string | null> {
    return this.sendLocalNotification({
      title: '🌱 Crop Care Reminder',
      body: `${task} for ${cropName}${fieldName ? ` in ${fieldName}` : ''}`,
      data: { type: 'crop_reminder', task, cropName, fieldName },
      categoryId: 'crop_reminder',
    });
  }

  async sendSyncNotification(
    status: 'success' | 'error' | 'progress',
    message: string
  ): Promise<string | null> {
    const titles = {
      success: '✅ Sync Complete',
      error: '❌ Sync Failed',
      progress: '⏳ Syncing Data',
    };

    return this.sendLocalNotification({
      title: titles[status],
      body: message,
      data: { type: 'sync_status', status },
      categoryId: status === 'error' ? 'sync_status' : undefined,
    });
  }

  async sendPhotoUploadNotification(
    status: 'uploading' | 'success' | 'error',
    photoCount: number
  ): Promise<string | null> {
    const messages = {
      uploading: `Uploading ${photoCount} photo${photoCount > 1 ? 's' : ''}...`,
      success: `Successfully uploaded ${photoCount} photo${photoCount > 1 ? 's' : ''}`,
      error: `Failed to upload ${photoCount} photo${photoCount > 1 ? 's' : ''}`,
    };

    return this.sendLocalNotification({
      title: '📸 Photo Upload',
      body: messages[status],
      data: { type: 'photo_upload', status, photoCount },
    });
  }

  // Scheduled reminders

  async scheduleIrrigationReminder(
    fieldName: string,
    scheduleTime: { hour: number; minute: number }
  ): Promise<string | null> {
    return this.scheduleNotification({
      id: `irrigation_${fieldName}`,
      title: '💧 Irrigation Reminder',
      body: `Time to check irrigation for ${fieldName}`,
      trigger: {
        repeats: true,
        hour: scheduleTime.hour,
        minute: scheduleTime.minute,
      },
      data: { type: 'irrigation_reminder', fieldName },
    });
  }

  async scheduleHarvestReminder(
    cropName: string,
    harvestDate: Date
  ): Promise<string | null> {
    // Schedule 3 days before harvest
    const reminderDate = new Date(harvestDate);
    reminderDate.setDate(reminderDate.getDate() - 3);

    return this.scheduleNotification({
      id: `harvest_${cropName}`,
      title: '🌾 Harvest Reminder',
      body: `${cropName} is ready for harvest in 3 days`,
      trigger: reminderDate,
      data: { type: 'harvest_reminder', cropName, harvestDate: harvestDate.toISOString() },
    });
  }

  async schedulePlantingReminder(
    cropName: string,
    plantingDate: Date
  ): Promise<string | null> {
    return this.scheduleNotification({
      id: `planting_${cropName}`,
      title: '🌱 Planting Reminder',
      body: `Time to plant ${cropName}`,
      trigger: plantingDate,
      data: { type: 'planting_reminder', cropName, plantingDate: plantingDate.toISOString() },
    });
  }

  // Notification preferences

  async saveNotificationPreferences(preferences: {
    weatherAlerts: boolean;
    cropReminders: boolean;
    syncNotifications: boolean;
    photoUpload: boolean;
    quietHours: { enabled: boolean; start: string; end: string };
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.NOTIFICATION_PREFERENCES_KEY,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  async getNotificationPreferences(): Promise<any> {
    try {
      const preferences = await AsyncStorage.getItem(this.NOTIFICATION_PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : {
        weatherAlerts: true,
        cropReminders: true,
        syncNotifications: true,
        photoUpload: false,
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {};
    }
  }

  private isInQuietHours(): boolean {
    // TODO: Implement quiet hours check
    return false;
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const scheduled = await this.getScheduledNotifications();
      const now = Date.now();

      for (const notification of scheduled) {
        // Remove notifications that are more than 24 hours old
        if (notification.trigger && typeof notification.trigger === 'object' && 'date' in notification.trigger) {
          const triggerTime = new Date(notification.trigger.date as any).getTime();
          if (now - triggerTime > 24 * 60 * 60 * 1000) {
            await this.cancelNotification(notification.identifier);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }

  // Handle notification responses
  setupNotificationHandlers() {
    // Handle notification received while app is foregrounded
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const { notification, actionIdentifier } = response;
    const data = notification.request.content.data;

    switch (actionIdentifier) {
      case 'view_weather':
        // Navigate to weather screen
        break;
      case 'mark_done':
        // Mark crop task as done
        break;
      case 'snooze':
        // Reschedule notification for 1 hour later
        this.snoozeNotification(notification.request, 3600);
        break;
      case 'retry_sync':
        // Trigger sync retry
        break;
      default:
        // Handle default tap
        break;
    }
  }

  private async snoozeNotification(
    originalRequest: Notifications.NotificationRequest,
    snoozeSeconds: number
  ): Promise<void> {
    await this.scheduleNotification({
      id: `snoozed_${originalRequest.identifier}`,
      title: originalRequest.content.title || '',
      body: originalRequest.content.body || '',
      trigger: { seconds: snoozeSeconds },
      data: originalRequest.content.data,
    });
  }
}

export const notificationService = new NotificationService();
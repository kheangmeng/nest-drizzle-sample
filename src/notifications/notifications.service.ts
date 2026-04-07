/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = path.resolve(process.cwd(), 'firebase-adminsdk.json');

    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  /**
   * Send a push notification to a specific device token
   */
  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    if (!token) return;

    const message: admin.messaging.Message = {
      notification: { title, body },
      token: token,
      data: data || {},
      android: {
        priority: 'high',
        notification: { sound: 'default' },
      },
      apns: {
        payload: {
          aps: { sound: 'default' },
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending FCM message', error);
      // If the token is invalid or expired, you should ideally remove it from your DB
      throw error;
    }
  }

  /**
   * Send a notification to a specific topic (e.g., 'news', 'promotions')
   */
  async sendToTopic(topic: string, title: string, body: string) {
    const message: admin.messaging.Message = {
      notification: { title, body },
      topic: topic,
    };

    return admin.messaging().send(message);
  }
}

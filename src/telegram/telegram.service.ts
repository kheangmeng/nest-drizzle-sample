import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
  }

  /**
   * Pushes a message to the configured Telegram chat/channel
   */
  async sendMessage(message: string) {
    if (!this.botToken || !this.chatId) {
      this.logger.warn('Telegram credentials are not configured. Message skipped.');
      return;
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    try {
      // Using native Node.js fetch (Node 18+)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML', // Allows bold, italic, links, etc.
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Telegram API Error: ${errorData}`);
      }

      this.logger.log('Telegram push message sent successfully');
    } catch (error: any) {
      this.logger.error('Failed to send Telegram message', error);
      // Depending on your requirements, you might want to throw the error
      // so the Bull queue knows the job failed and can retry it.
      throw error;
    }
  }
}

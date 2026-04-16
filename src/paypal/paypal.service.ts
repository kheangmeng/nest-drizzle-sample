/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    // Dynamically set URL based on environment
    const env = this.configService.get<string>('PAYPAL_ENVIRONMENT');
    this.apiUrl = env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  }

  /**
   * Generates an OAuth2 Access Token for PayPal API requests.
   */
  private async getAccessToken(): Promise<string> {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${this.apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      this.logger.error('Failed to generate PayPal access token');
      throw new Error('PayPal Authentication Failed');
    }

    const data = await response.json();

    return data.access_token;
  }

  /**
   * Creates an order requiring user approval.
   */
  async createOrder(amount: number, orderId: string) {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.apiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2), // PayPal requires 2 decimal places
            },
          },
        ],
      }),
    });

    if (!response.ok) throw new BadRequestException('Failed to create PayPal order');

    return response.json(); // Returns id (PayPal Order ID) and links (approval URL)
  }

  /**
   * Captures the funds after the user approves the payment on the frontend.
   */
  async capturePayment(paypalOrderId: string) {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.apiUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`PayPal Capture Failed: ${err}`);
      throw new BadRequestException('Failed to capture PayPal payment');
    }

    return response.json();
  }

  /**
   * Cryptographically verifies the incoming webhook signature.
   */
  async verifyWebhookSignature(headers: Record<string, string>, rawBody: Buffer): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const webhookId = this.configService.get<string>('PAYPAL_WEBHOOK_ID');

    const response = await fetch(`${this.apiUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody.toString('utf8')),
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();

    return data.verification_status === 'SUCCESS';
  }
}

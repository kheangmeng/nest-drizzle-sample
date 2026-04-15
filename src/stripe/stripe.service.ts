/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe.Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(stripeSecret, {
      apiVersion: '2026-03-25.dahlia', // Use the latest supported version
    });
  }

  /**
   * Creates a PaymentIntent for the frontend to complete the checkout.
   */
  async createPaymentIntent(amount: number, orderId: string, metadata: any = {}) {
    const currency = this.configService.get<string>('STRIPE_CURRENCY') || 'usd';

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amounts in cents
        currency,
        metadata: {
          orderId,
          ...metadata,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error('Failed to create Payment Intent', error);
      throw new BadRequestException('Payment initiation failed');
    }
  }

  /**
   * Verifies the Stripe Webhook signature using the raw body buffer.
   */
  constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret); //as Stripe.Event;
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${(error as Error).message}`);
      throw new BadRequestException('Webhook Error');
    }
  }
}

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './drizzle/drizzle.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FileUploadController } from './file-upload/file-upload.controller';
import { LoggerMiddleware } from './logger/logger.middleware';
import { UserController } from './users/users.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { CategoriesModule } from './categories/categories.module';
import { CategoryController } from './categories/categories.controller';
import { ProductsModule } from './products/products.module';
import { ProductController } from './products/products.controller';
import { OrdersModule } from './orders/orders.module';
import { OrderController } from './orders/orders.controller';
import { PaymentController } from './payments/payments.controller';
import { PaymentsModule } from './payments/payments.module';
import { TelegramModule } from './telegram/telegram.module';
import { StripeModule } from './stripe/stripe.module';
import { PaypalModule } from './paypal/paypal.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Global Redis configuration for Bull Queues
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 5000, // Time-to-live in milliseconds (v5+)
      max: 100, // Maximum number of items in cache
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time to live in milliseconds (e.g., 60 seconds)
        limit: 10, // Maximum number of requests within the ttl
      },
    ]),
    DrizzleModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    TelegramModule,
    StripeModule,
    PaypalModule,
    ReportsModule,
  ],
  controllers: [
    AppController,
    UserController,
    CategoryController,
    ProductController,
    OrderController,
    PaymentController,
    FileUploadController,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    NotificationsModule,
  ],
  controllers: [AppController, UserController, CategoryController, FileUploadController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

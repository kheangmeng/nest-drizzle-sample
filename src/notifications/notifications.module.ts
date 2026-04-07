import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Global() // Make it global so you can inject it anywhere easily
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

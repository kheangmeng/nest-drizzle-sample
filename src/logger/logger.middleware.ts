import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // We use the standard NestJS Logger, which will be powered by Winston globally
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Listen for the response to finish so we can log the status code and duration
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const duration = Date.now() - startTime;

      const logMessage = `${method} ${originalUrl} ${statusCode} ${contentLength}b - ${userAgent} ${ip} [${duration}ms]`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}

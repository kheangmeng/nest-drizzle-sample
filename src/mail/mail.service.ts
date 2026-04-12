/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { existsSync, promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_PORT') === 465, // true for 465, false for other ports
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  private async compileTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);

    // In production build, ensure these files are copied to the dist folder
    // via 'assets' config in nest-cli.json
    if (!existsSync(templatePath)) {
      this.logger.error(`Template not found: ${templatePath}`);
      return `<p>Error: Template ${templateName} not found.</p>`;
    }

    const templateSource = await fs.readFile(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template(data);
  }

  async sendWelcomeEmail(email: string) {
    const name = 'John Doe';
    const html = await this.compileTemplate('welcome', {
      name,
      email,
      dashboardUrl: 'https://myapp.com/dashboard',
    });
    const mailOptions = {
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: `Welcome, ${name}!`,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
    }
  }

  async sendOrderedEmail(email: string) {
    const name = 'John Doe';
    const html = await this.compileTemplate('ordered', {
      name,
      email,
      dashboardUrl: 'https://myapp.com/dashboard',
    });
    const mailOptions = {
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: `Ordered, ${name}!`,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`ordered email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send ordered email to ${email}`, error);
    }
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetLink = `https://myapp.com/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

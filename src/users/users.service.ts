import { ConflictException, Inject, Injectable, BadRequestException } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, and, gt } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>,
    private mailService: MailService, // Inject MailService here
  ) {}

  async getUsers() {
    // Using Drizzle's Relational Queries API
    return this.db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }

  async findById(id: number) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async findByValidResetToken(hashedToken: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.resetToken, hashedToken),
          gt(schema.users.resetTokenExpiresAt, new Date()), // Ensure token is not expired
        ),
      )
      .limit(1);
    return result[0] || null;
  }

  async findByRefreshToken(refreshToken: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.refreshToken, refreshToken))
      .limit(1);
    return result[0] || null;
  }

  async updateRefreshToken(id: number, refreshToken: string | null) {
    await this.update(id, { refreshToken });
  }

  async forgotPassword(email: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration

    await this.update(user.id, {
      resetToken: hashedToken,
      resetTokenExpiresAt: expiresAt,
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.findByValidResetToken(hashedToken);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiresAt: null,
    });
  }

  async create(user: typeof schema.users.$inferInsert) {
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds = 10;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword: string = await bcrypt.hash(user.password, saltRounds);

    const result = await this.db
      .insert(schema.users)
      .values({ ...user, password: hashedPassword })
      .returning({
        email: schema.users.email,
        name: schema.users.name,
        password: schema.users.password,
        createdAt: schema.users.createdAt,
      });

    const newUser = result[0];

    if (newUser) {
      await this.mailService.sendWelcomeEmail(newUser.email);
    }

    return newUser;
  }

  async update(id: number, data: Partial<typeof schema.users.$inferInsert>) {
    await this.db.update(schema.users).set(data).where(eq(schema.users.id, id));
  }
}

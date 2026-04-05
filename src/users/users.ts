export interface CreateUser {
  name: string;
  email: string;
  password: string;
}

export type AuthUser = Pick<CreateUser, 'email' | 'password'>;

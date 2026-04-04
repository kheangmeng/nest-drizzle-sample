export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export type AuthDto = Pick<CreateUserDto, 'email' | 'password'>;

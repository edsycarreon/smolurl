import { SignInAccountDTO } from '../../dto';

export const castSignInDTO = (data: any): SignInAccountDTO => ({
  email: data.email,
  password: data.password,
});

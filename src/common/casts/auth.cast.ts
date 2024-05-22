import { SignInAccountDTO } from '../../dto';

export const castSignInDTO = (data: any): SignInAccountDTO => ({
  id: data.person_id,
  email: data.email,
  password: data.password,
});

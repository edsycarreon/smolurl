import { SignInAccountDTO } from 'src/dto/auth.dto';

export const castSignInDTO = (data: any): SignInAccountDTO => ({
  id: data.person_id,
  email: data.email,
  password: data.password,
});

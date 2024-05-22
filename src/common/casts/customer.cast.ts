import { CustomerDTO } from '../../dto';

export const castCustomerDto = (data: any): CustomerDTO => ({
  id: data.person_id,
  firstName: data.first_name,
  lastName: data.last_name,
  email: data.email,
  password: data.password,
  addedAt: data.added_at,
  updatedAt: data.updated_at,
});

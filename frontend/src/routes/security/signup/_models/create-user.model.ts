import type { User } from '$lib/user/models/user.model';

export interface CreateUserForm extends User {
	password: string;
	repeatPassword: string;
}

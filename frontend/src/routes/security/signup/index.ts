import type { Form } from "$lib/models/form.model";
import type { CreateUserForm } from "./_models/create-user.model";

export async function signUp(event: SubmitEvent) {
    console.log(event);

    return {};
}

export function validateForm(form: Form<CreateUserForm>): boolean {
    return false;
}
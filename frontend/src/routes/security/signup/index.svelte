<script type="ts">
	import { post } from "$lib/api";
	import type { Form } from "$lib/models/form.model";

	import { validateForm } from ".";
	import type { CreateUserForm } from "./_models/create-user.model";

	const form: Form<CreateUserForm> = {
		email: {},
		password: {},
		repeatPassword: {},
		username: {},
	}

	function signUp(event: SubmitEvent) {
		console.log(form);
		const validate = validateForm(form);
		if (validate) {
			const createUser = post('http://localhost:3333/auth/signup', );
		}
		return {};
	}
</script>
<svelte:head>
	<title>Signup</title>
	<meta name="description" content="Signup" />
</svelte:head>
<div class="container">
	<div class="row">
		<form on:submit|preventDefault="{signUp}">
			<div class="form-group">
				<label for="emailAdress">Email address</label>
				<input type="email" class="form-control" id="emailAdress" aria-describedby="emailHelp" placeholder="Enter email" bind:value="{form.email.value}">
				<small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
			</div>
			<div class="form-group">
				<label for="username">Username</label>
				<input type="text" class="form-control" id="username" aria-describedby="passwordHelp" placeholder="Enter username" bind:value="{form.username.value}">
				<small id="passwordHelp" class="form-text text-muted">Be creative !</small>
			</div>
			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" class="form-control" id="password" placeholder="Enter password" bind:value="{form.password.value}">
			</div>
			<div class="form-group">
				<label for="repeatPassword">Repeat password</label>
				<input type="password" class="form-control" id="repeatPassword" placeholder="Enter password again" bind:value="{form.repeatPassword.value}">
			</div>
			<button type="submit">Confirm</button>
		</form>
	</div>
</div>

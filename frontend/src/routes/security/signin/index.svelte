<script>

import { signIn } from ".";

</script>
<svelte:head>
	<title>Signin</title>
	<meta name="description" content="Signin" />
</svelte:head>
<div class="container">
	<div class="row">
		<form on:submit="{signIn}">
			<div class="form-group">
				<label for="emailAdress">Email address</label>
				<input type="email" class="form-control" id="emailAdress" aria-describedby="emailHelp" placeholder="Enter email">
				<small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
			</div>
			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" class="form-control" id="password" placeholder="Enter password">
			</div>
		</form>
	</div>
</div>

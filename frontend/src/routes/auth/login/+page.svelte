<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Input from '$lib/components/Input.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);

	// Redirect if already authenticated
	onMount(() => {
		if (authStore.isAuthenticated) {
			goto('/dashboard');
		}
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		
		if (!email || !password) {
			error = 'Veuillez remplir tous les champs';
			return;
		}

		isLoading = true;
		error = '';

		const result = await authStore.login(email, password);
		
		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error || 'Erreur de connexion';
		}
		
		isLoading = false;
	}
</script>

<svelte:head>
	<title>Connexion - W3C Sitemap Validator</title>
</svelte:head>

<div class="login-form">
	<div class="form-header">
		<h1>Connexion</h1>
		<p>Accédez à votre tableau de bord pour valider vos sitemaps</p>
	</div>

	<form onsubmit={handleSubmit} class="form">
		{#if error}
			<Alert variant="error" title="Erreur de connexion">
				{error}
			</Alert>
		{/if}

		<Input
			type="email"
			label="Adresse email"
			placeholder="votre@email.com"
			bind:value={email}
			required
			autocomplete="email"
		/>

		<Input
			type="password"
			label="Mot de passe"
			placeholder="Votre mot de passe"
			bind:value={password}
			required
			autocomplete="current-password"
		/>

		<div class="form-actions">
			<Button
				type="submit"
				variant="primary"
				size="lg"
				loading={isLoading}
				disabled={isLoading}
			>
				{isLoading ? 'Connexion...' : 'Se connecter'}
			</Button>
		</div>
	</form>

	<div class="form-footer">
		<p>
			Pas encore de compte ? 
			<a href="/auth/register" class="form-link">Créer un compte</a>
		</p>
		<p>
			<a href="/forgot-password" class="form-link">Mot de passe oublié ?</a>
		</p>
	</div>
</div>

<style>
	.login-form {
		width: 100%;
	}

	.form-header {
		text-align: center;
		margin-bottom: var(--space-2xl);
	}

	.form-header h1 {
		font-family: var(--font-primary);
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0 0 var(--space-sm);
	}

	.form-header p {
		font-size: 1rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.form-actions {
		margin-top: var(--space-md);
	}

	.form-footer {
		margin-top: var(--space-2xl);
		text-align: center;
	}

	.form-footer p {
		margin: 0 0 var(--space-sm);
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.form-link {
		color: var(--accent-primary);
		text-decoration: none;
		font-weight: 600;
		transition: color var(--transition-fast);
	}

	.form-link:hover {
		color: var(--accent-primary-dark);
		text-decoration: underline;
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.form-header h1 {
			font-size: 1.75rem;
		}
	}
</style>

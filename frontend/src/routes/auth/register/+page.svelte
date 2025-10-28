<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Input from '$lib/components/Input.svelte';

	let fullName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
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
		
		// Validation
		if (!fullName || !email || !password || !confirmPassword) {
			error = 'Veuillez remplir tous les champs';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Les mots de passe ne correspondent pas';
			return;
		}

		if (password.length < 8) {
			error = 'Le mot de passe doit contenir au moins 8 caractères';
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			error = 'Veuillez entrer une adresse email valide';
			return;
		}

		isLoading = true;
		error = '';

		const result = await authStore.register(email, password, fullName);
		
		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error || 'Erreur lors de la création du compte';
		}
		
		isLoading = false;
	}
</script>

<svelte:head>
	<title>Inscription - W3C Sitemap Validator</title>
</svelte:head>

<div class="register-form">
	<div class="form-header">
		<h1>Créer un compte</h1>
		<p>Commencez à valider vos sitemaps en quelques minutes</p>
	</div>

	<form onsubmit={handleSubmit} class="form">
		{#if error}
			<Alert variant="error" title="Erreur d'inscription">
				{error}
			</Alert>
		{/if}

		<Input
			type="text"
			label="Nom complet"
			placeholder="Jean Dupont"
			bind:value={fullName}
			required
			autocomplete="name"
		/>

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
			placeholder="Minimum 8 caractères"
			bind:value={password}
			required
			autocomplete="new-password"
		/>

		<Input
			type="password"
			label="Confirmer le mot de passe"
			placeholder="Répétez votre mot de passe"
			bind:value={confirmPassword}
			required
			autocomplete="new-password"
		/>

		<div class="form-actions">
			<Button
				type="submit"
				variant="primary"
				size="lg"
				loading={isLoading}
				disabled={isLoading}
			>
				{isLoading ? 'Création du compte...' : 'Créer mon compte'}
			</Button>
		</div>
	</form>

	<div class="form-footer">
		<p>
			Déjà un compte ? 
			<a href="/auth/login" class="form-link">Se connecter</a>
		</p>
		<p class="terms">
			En créant un compte, vous acceptez nos 
			<a href="/terms" class="form-link">conditions d'utilisation</a> et notre 
			<a href="/privacy" class="form-link">politique de confidentialité</a>.
		</p>
	</div>
</div>

<style>
	.register-form {
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

	.form-footer .terms {
		font-size: 0.75rem;
		line-height: 1.4;
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

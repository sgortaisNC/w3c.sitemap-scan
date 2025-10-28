<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { creditsStore } from '$lib/stores/credits.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';

	let isLoading = $state(true);

	// Redirect if not authenticated
	onMount(async () => {
		if (!authStore.isAuthenticated) {
			goto('/auth/login');
		} else {
			// Load credits balance
			await creditsStore.fetchBalance();
			isLoading = false;
		}
	});

	async function handleLogout() {
		await authStore.logout();
		goto('/');
	}
</script>

<svelte:head>
	<title>Tableau de bord - W3C Sitemap Validator</title>
</svelte:head>

{#if isLoading}
	<div class="loading">
		<div class="spinner"></div>
		<p>Chargement...</p>
	</div>
{:else}
	<div class="dashboard">
		<header class="dashboard-header">
			<div class="header-content">
				<div class="header-left">
					<h1>Tableau de bord</h1>
					<nav class="header-nav">
						<a href="/dashboard" class="nav-link active">Tableau de bord</a>
						<a href="/scan" class="nav-link">Nouveau scan</a>
						<a href="/scans" class="nav-link">Mes scans</a>
						<a href="/credits" class="nav-link">Crédits</a>
					</nav>
				</div>
				<div class="user-info">
					<span>Bonjour, {authStore.user?.fullName || authStore.user?.email}</span>
					<Button variant="outline" size="sm" onclick={handleLogout}>
						Déconnexion
					</Button>
				</div>
			</div>
		</header>

		<main class="dashboard-main">
			<Alert variant="info" title="Bienvenue !">
				Vous êtes maintenant connecté à votre tableau de bord. Les fonctionnalités de scan seront bientôt disponibles.
			</Alert>

			<div class="dashboard-grid">
				<div class="dashboard-card">
					<h2>Mes crédits</h2>
					<div class="credit-display">
						<span class="credit-amount">{creditsStore.balance.current}</span>
						<span class="credit-label">crédits disponibles</span>
					</div>
					<Button variant="primary" size="md" onclick={() => window.location.href = '/credits'}>
						Acheter des crédits
					</Button>
				</div>

				<div class="dashboard-card">
					<h2>Scans récents</h2>
					<div class="empty-state">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
							<polyline points="14,2 14,8 20,8"/>
							<line x1="16" y1="13" x2="8" y2="13"/>
							<line x1="16" y1="17" x2="8" y2="17"/>
							<polyline points="10,9 9,9 8,9"/>
						</svg>
						<p>Aucun scan pour le moment</p>
						<Button variant="outline" size="sm" onclick={() => window.location.href = '/scan'}>
							Lancer un scan
						</Button>
					</div>
				</div>

				<div class="dashboard-card">
					<h2>Statistiques</h2>
					<div class="stats-grid">
						<div class="stat-item">
							<span class="stat-value">0</span>
							<span class="stat-label">Scans effectués</span>
						</div>
						<div class="stat-item">
							<span class="stat-value">0</span>
							<span class="stat-label">URLs validées</span>
						</div>
						<div class="stat-item">
							<span class="stat-value">0</span>
							<span class="stat-label">Erreurs trouvées</span>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}

<style>
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: var(--space-lg);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--gray-200);
		border-top: 3px solid var(--accent-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.dashboard {
		min-height: 100vh;
		background: var(--gray-50);
	}

	.dashboard-header {
		background: var(--white);
		border-bottom: 1px solid var(--gray-200);
		padding: var(--space-lg) 0;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--space-lg);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.header-nav {
		display: flex;
		gap: var(--space-lg);
	}

	.nav-link {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.nav-link:hover {
		color: var(--text-main);
		background: var(--gray-100);
	}

	.nav-link.active {
		color: var(--accent-primary);
		background: var(--accent-primary-light);
	}

	.dashboard-header h1 {
		font-family: var(--font-primary);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
	}

	.user-info span {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.dashboard-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-2xl) var(--space-lg);
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-xl);
		margin-top: var(--space-xl);
	}

	.dashboard-card {
		background: var(--white);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		box-shadow: var(--shadow-medium);
		border: 1px solid var(--gray-200);
	}

	.dashboard-card h2 {
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 var(--space-lg);
	}

	.credit-display {
		text-align: center;
		margin-bottom: var(--space-lg);
	}

	.credit-amount {
		display: block;
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--accent-primary);
		line-height: 1;
	}

	.credit-label {
		display: block;
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-top: var(--space-xs);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-xl) 0;
	}

	.empty-state svg {
		color: var(--text-tertiary);
		margin-bottom: var(--space-md);
	}

	.empty-state p {
		color: var(--text-secondary);
		margin: 0 0 var(--space-lg);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-lg);
	}

	.stat-item {
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--accent-primary);
		line-height: 1;
	}

	.stat-label {
		display: block;
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin-top: var(--space-xs);
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: var(--space-md);
			text-align: center;
		}

		.user-info {
			flex-direction: column;
			gap: var(--space-md);
		}

		.dashboard-main {
			padding: var(--space-lg);
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
			gap: var(--space-lg);
		}

		.stats-grid {
			grid-template-columns: 1fr;
			gap: var(--space-md);
		}
	}
</style>

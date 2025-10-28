<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { scansStore } from '$lib/stores/scans.svelte';
	import { creditsStore } from '$lib/stores/credits.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Input from '$lib/components/Input.svelte';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';

	let sitemapUrl = $state('');
	let error = $state('');
	let isLoading = $state(false);

	// Redirect if not authenticated
	onMount(() => {
		if (!authStore.isAuthenticated) {
			goto('/auth/login');
		} else {
			// Load user's credit balance and scan history
			loadUserData();
		}
	});

	async function loadUserData() {
		// Load credit balance and recent scans
		await Promise.all([
			creditsStore.fetchBalance(),
			scansStore.fetchScans(1, 5)
		]);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		
		if (!sitemapUrl.trim()) {
			error = 'Veuillez entrer une URL de sitemap';
			return;
		}

		// Basic URL validation
		try {
			new URL(sitemapUrl);
		} catch {
			error = 'Veuillez entrer une URL valide';
			return;
		}

		// Check if it looks like a sitemap URL
		if (!sitemapUrl.includes('sitemap') && !sitemapUrl.endsWith('.xml')) {
			error = 'L\'URL doit pointer vers un fichier sitemap XML';
			return;
		}

		isLoading = true;
		error = '';

		const result = await scansStore.createScan(sitemapUrl);
		
		if (result.success && result.data) {
			// Redirect to scan details page
			goto(`/scan/${result.data.id}`);
		} else {
			error = result.error || 'Erreur lors de la création du scan';
		}
		
		isLoading = false;
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusVariant(status: string) {
		switch (status) {
			case 'success': return 'success';
			case 'failed': return 'error';
			case 'processing': return 'warning';
			case 'pending': return 'info';
			default: return 'info';
		}
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'success': return 'Terminé';
			case 'failed': return 'Échec';
			case 'processing': return 'En cours';
			case 'pending': return 'En attente';
			default: return 'Inconnu';
		}
	}
</script>

<svelte:head>
	<title>Nouveau scan - W3C Sitemap Validator</title>
</svelte:head>

<div class="scan-page">
	<header class="page-header">
		<div class="header-content">
			<div class="header-left">
				<h1>Nouveau scan</h1>
				<p>Validez votre sitemap XML avec les standards W3C</p>
			</div>
			<div class="header-right">
				<div class="credit-display">
					<span class="credit-amount">{creditsStore.balance.current}</span>
					<span class="credit-label">crédits disponibles</span>
				</div>
			</div>
		</div>
	</header>

	<main class="scan-main">
		<div class="scan-grid">
			<!-- Scan Form -->
			<Card variant="default">
				<div class="card-header">
					<h2>Créer un nouveau scan</h2>
					<p>Entrez l'URL de votre sitemap XML pour commencer la validation</p>
				</div>

				<form onsubmit={handleSubmit} class="scan-form">
					{#if error}
						<Alert variant="error" title="Erreur">
							{error}
						</Alert>
					{/if}

					<Input
						type="url"
						label="URL du sitemap"
						placeholder="https://example.com/sitemap.xml"
						bind:value={sitemapUrl}
						required
					/>

					<div class="form-actions">
						<Button
							type="submit"
							variant="primary"
							size="lg"
							loading={isLoading}
							disabled={isLoading || creditsStore.balance.current === 0}
						>
							{isLoading ? 'Création du scan...' : 'Lancer le scan'}
						</Button>
					</div>

					{#if creditsStore.balance.current === 0}
						<Alert variant="warning" title="Crédits insuffisants">
							Vous n'avez plus de crédits disponibles. 
							<a href="/credits" class="alert-link">Acheter des crédits</a>
						</Alert>
					{/if}
				</form>
			</Card>

			<!-- Recent Scans -->
			<Card variant="default">
				<div class="card-header">
					<h2>Scans récents</h2>
					<a href="/dashboard" class="view-all-link">Voir tout</a>
				</div>

				{#if scansStore.isLoading}
					<div class="loading-state">
						<div class="spinner"></div>
						<p>Chargement des scans...</p>
					</div>
				{:else if scansStore.scans.length === 0}
					<div class="empty-state">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
							<polyline points="14,2 14,8 20,8"/>
							<line x1="16" y1="13" x2="8" y2="13"/>
							<line x1="16" y1="17" x2="8" y2="17"/>
							<polyline points="10,9 9,9 8,9"/>
						</svg>
						<p>Aucun scan pour le moment</p>
					</div>
				{:else}
					<div class="scans-list">
						{#each scansStore.scans as scan}
							<div class="scan-item" onclick={() => goto(`/scan/${scan.id}`)}>
								<div class="scan-info">
									<div class="scan-url">{scan.sitemapUrl}</div>
									<div class="scan-meta">
										<span class="scan-date">{formatDate(scan.startedAt)}</span>
										{#if scan.totalUrls}
											<span class="scan-count">{scan.totalUrls} URLs</span>
										{/if}
									</div>
								</div>
								<div class="scan-status">
									<Badge variant={getStatusVariant(scan.status)}>
										{getStatusLabel(scan.status)}
									</Badge>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card>
		</div>

		<!-- Help Section -->
		<Card variant="default">
			<div class="help-content">
				<div class="help-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/>
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
						<line x1="12" y1="17" x2="12.01" y2="17"/>
					</svg>
				</div>
				<div class="help-text">
					<h3>Comment trouver votre sitemap ?</h3>
					<p>Votre sitemap se trouve généralement à l'une de ces adresses :</p>
					<ul>
						<li><code>https://votresite.com/sitemap.xml</code></li>
						<li><code>https://votresite.com/sitemap_index.xml</code></li>
						<li><code>https://votresite.com/sitemaps/sitemap.xml</code></li>
					</ul>
					<p>Vous pouvez aussi vérifier dans votre fichier <code>robots.txt</code> à l'adresse <code>https://votresite.com/robots.txt</code></p>
				</div>
			</div>
		</Card>
	</main>
</div>

<style>
	.scan-page {
		min-height: 100vh;
		background: var(--gray-50);
	}

	.page-header {
		background: var(--white);
		border-bottom: 1px solid var(--gray-200);
		padding: var(--space-xl) 0;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--space-lg);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-left h1 {
		font-family: var(--font-primary);
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0 0 var(--space-sm);
	}

	.header-left p {
		color: var(--text-secondary);
		margin: 0;
	}

	.credit-display {
		text-align: center;
		background: var(--accent-primary-light);
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		min-width: 120px;
	}

	.credit-amount {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--accent-primary);
		line-height: 1;
	}

	.credit-label {
		display: block;
		font-size: 0.75rem;
		color: var(--accent-primary);
		margin-top: var(--space-xs);
	}

	.scan-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-2xl) var(--space-lg);
	}

	.scan-grid {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: var(--space-xl);
		margin-bottom: var(--space-xl);
	}


	.card-header {
		margin-bottom: var(--space-xl);
	}

	.card-header h2 {
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 var(--space-sm);
	}

	.card-header p {
		color: var(--text-secondary);
		margin: 0;
	}

	.view-all-link {
		color: var(--accent-primary);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 600;
		transition: color var(--transition-fast);
	}

	.view-all-link:hover {
		color: var(--accent-primary-dark);
		text-decoration: underline;
	}

	.scan-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.form-actions {
		margin-top: var(--space-md);
	}

	.alert-link {
		color: inherit;
		text-decoration: underline;
		font-weight: 600;
	}

	.loading-state,
	.empty-state {
		text-align: center;
		padding: var(--space-xl) 0;
	}

	.spinner {
		width: 24px;
		height: 24px;
		border: 2px solid var(--gray-200);
		border-top: 2px solid var(--accent-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto var(--space-md);
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.empty-state svg {
		color: var(--text-tertiary);
		margin-bottom: var(--space-md);
	}

	.empty-state p {
		color: var(--text-secondary);
		margin: 0;
	}

	.scans-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.scan-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md);
		background: var(--gray-50);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all var(--transition-fast);
		border: 1px solid transparent;
	}

	.scan-item:hover {
		background: var(--white);
		border-color: var(--gray-200);
		box-shadow: var(--shadow-light);
	}

	.scan-info {
		flex: 1;
		min-width: 0;
	}

	.scan-url {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--text-main);
		margin-bottom: var(--space-xs);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.scan-meta {
		display: flex;
		gap: var(--space-md);
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.scan-status {
		flex-shrink: 0;
		margin-left: var(--space-md);
	}


	.help-content {
		display: flex;
		gap: var(--space-lg);
		align-items: flex-start;
	}

	.help-icon {
		flex-shrink: 0;
		color: var(--accent-primary);
		margin-top: var(--space-xs);
	}

	.help-text h3 {
		font-family: var(--font-primary);
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 var(--space-sm);
	}

	.help-text p {
		color: var(--text-secondary);
		margin: 0 0 var(--space-sm);
		line-height: 1.5;
	}

	.help-text ul {
		margin: var(--space-sm) 0;
		padding-left: var(--space-lg);
	}

	.help-text li {
		color: var(--text-secondary);
		margin-bottom: var(--space-xs);
	}

	.help-text code {
		background: var(--gray-100);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--accent-primary);
	}

	/* Mobile optimizations */
	@media (max-width: 1024px) {
		.scan-grid {
			grid-template-columns: 1fr;
			gap: var(--space-lg);
		}
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: var(--space-lg);
			text-align: center;
		}

		.scan-main {
			padding: var(--space-lg);
		}

		.help-content {
			flex-direction: column;
			gap: var(--space-md);
		}
	}
</style>

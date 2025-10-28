<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { scansStore } from '$lib/stores/scans.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';

	let scanId = $derived(parseInt($page.params.id || '0'));
	let isLoading = $state(true);
	let error = $state('');
	let refreshInterval: ReturnType<typeof setInterval> | null = null;

	// Redirect if not authenticated
	onMount(() => {
		if (!authStore.isAuthenticated) {
			goto('/auth/login');
		} else {
			loadScanData();
		}

		return () => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
		};
	});

	async function loadScanData() {
		isLoading = true;
		error = '';

		const result = await scansStore.fetchScanDetails(scanId);
		
		if (result.success && result.data) {
			// If scan is still processing, set up auto-refresh
			if (result.data.status === 'processing' || result.data.status === 'pending') {
				startAutoRefresh();
			}
			
			// Load scan results
			await scansStore.fetchScanResults(scanId);
		} else {
			error = result.error || 'Erreur lors du chargement du scan';
		}
		
		isLoading = false;
	}

	function startAutoRefresh() {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
		
		refreshInterval = setInterval(async () => {
			const result = await scansStore.fetchScanDetails(scanId);
			if (result.success && result.data) {
				// Stop refreshing if scan is complete
				if (result.data.status === 'success' || result.data.status === 'failed') {
					clearInterval(refreshInterval!);
					refreshInterval = null;
				}
			}
		}, 3000); // Refresh every 3 seconds
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

	function formatDuration(startedAt: string, finishedAt?: string) {
		const start = new Date(startedAt);
		const end = finishedAt ? new Date(finishedAt) : new Date();
		const diffMs = end.getTime() - start.getTime();
		const diffSeconds = Math.floor(diffMs / 1000);
		const diffMinutes = Math.floor(diffSeconds / 60);
		const diffHours = Math.floor(diffMinutes / 60);

		if (diffHours > 0) {
			return `${diffHours}h ${diffMinutes % 60}m`;
		} else if (diffMinutes > 0) {
			return `${diffMinutes}m ${diffSeconds % 60}s`;
		} else {
			return `${diffSeconds}s`;
		}
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

	function getProgressPercentage() {
		if (!scansStore.currentScan) return 0;
		if (scansStore.currentScan.status === 'success') return 100;
		if (scansStore.currentScan.status === 'failed') return 100;
		if (scansStore.currentScan.status === 'pending') return 0;
		
		// For processing, estimate based on results
		const totalUrls = scansStore.currentScan.totalUrls || 0;
		const processedUrls = scansStore.results.length;
		return totalUrls > 0 ? Math.min((processedUrls / totalUrls) * 100, 90) : 0;
	}

	function getErrorCount() {
		return scansStore.results.filter(r => !r.isValid).length;
	}

	function getWarningCount() {
		return scansStore.results.reduce((count, r) => count + (r.warnings?.length || 0), 0);
	}
</script>

<svelte:head>
	<title>Scan #{scanId} - W3C Sitemap Validator</title>
</svelte:head>

<div class="scan-details-page">
	{#if isLoading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Chargement du scan...</p>
		</div>
	{:else if error}
		<Alert variant="error" title="Erreur">
			{error}
		</Alert>
	{:else if scansStore.currentScan}
		<header class="page-header">
			<div class="header-content">
				<div class="header-left">
					<div class="breadcrumb">
						<a href="/scan" class="breadcrumb-link">Scans</a>
						<span class="breadcrumb-separator">/</span>
						<span class="breadcrumb-current">Scan #{scanId}</span>
					</div>
					<h1>Scan #{scanId}</h1>
					<p class="scan-url">{scansStore.currentScan.sitemapUrl}</p>
				</div>
				<div class="header-right">
					<Badge variant={getStatusVariant(scansStore.currentScan.status)} size="lg">
						{getStatusLabel(scansStore.currentScan.status)}
					</Badge>
				</div>
			</div>
		</header>

		<main class="scan-main">
			<!-- Progress Section -->
			{#if scansStore.currentScan.status === 'processing' || scansStore.currentScan.status === 'pending'}
				<Card variant="default">
					<div class="progress-header">
						<h2>Progression du scan</h2>
						<span class="progress-percentage">{Math.round(getProgressPercentage())}%</span>
					</div>
					<div class="progress-bar">
						<div class="progress-fill" style="width: {getProgressPercentage()}%"></div>
					</div>
					<div class="progress-info">
						<div class="progress-stats">
							<span>URLs traitées: {scansStore.results.length}</span>
							{#if scansStore.currentScan.totalUrls}
								<span>sur {scansStore.currentScan.totalUrls}</span>
							{/if}
						</div>
						<div class="progress-duration">
							Durée: {formatDuration(scansStore.currentScan.startedAt, scansStore.currentScan.finishedAt)}
						</div>
					</div>
				</Card>
			{/if}

			<!-- Results Summary -->
			{#if scansStore.currentScan.status === 'success' || scansStore.currentScan.status === 'failed'}
				<div class="results-summary">
					<Card variant="default">
						<div class="summary-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M9 12l2 2 4-4"/>
								<circle cx="12" cy="12" r="10"/>
							</svg>
						</div>
						<div class="summary-content">
							<h3>Scan terminé</h3>
							<p>Résultats disponibles</p>
						</div>
					</Card>

					<Card variant="default">
						<div class="stats-grid">
							<div class="stat-item">
								<span class="stat-value">{scansStore.results.length}</span>
								<span class="stat-label">URLs analysées</span>
							</div>
							<div class="stat-item">
								<span class="stat-value">{getErrorCount()}</span>
								<span class="stat-label">Erreurs</span>
							</div>
							<div class="stat-item">
								<span class="stat-value">{getWarningCount()}</span>
								<span class="stat-label">Avertissements</span>
							</div>
							<div class="stat-item">
								<span class="stat-value">{formatDuration(scansStore.currentScan.startedAt, scansStore.currentScan.finishedAt)}</span>
								<span class="stat-label">Durée</span>
							</div>
						</div>
					</Card>
				</div>
			{/if}

			<!-- Error Message -->
			{#if scansStore.currentScan.status === 'failed' && scansStore.currentScan.errorMsg}
				<Alert variant="error" title="Échec du scan">
					{scansStore.currentScan.errorMsg}
				</Alert>
			{/if}

			<!-- Results List -->
			{#if scansStore.results.length > 0}
				<Card variant="default">
					<div class="card-header">
						<h2>Résultats détaillés</h2>
						<div class="results-actions">
							<Button variant="outline" size="sm">
								Exporter
							</Button>
						</div>
					</div>

					<div class="results-list">
						{#each scansStore.results as result}
							<div class="result-item" class:has-errors={!result.isValid}>
								<div class="result-info">
									<div class="result-url">{result.url}</div>
									<div class="result-meta">
										<span class="result-date">{formatDate(result.checkedAt)}</span>
										{#if result.errors && result.errors.length > 0}
											<span class="result-errors">{result.errors.length} erreur(s)</span>
										{/if}
										{#if result.warnings && result.warnings.length > 0}
											<span class="result-warnings">{result.warnings.length} avertissement(s)</span>
										{/if}
									</div>
								</div>
								<div class="result-status">
									{#if result.isValid}
										<Badge variant="success">Valide</Badge>
									{:else}
										<Badge variant="error">Invalide</Badge>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</Card>
			{:else if scansStore.currentScan.status === 'success'}
				<Card variant="default">
					<div class="empty-state">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M9 12l2 2 4-4"/>
							<circle cx="12" cy="12" r="10"/>
						</svg>
						<h3>Aucun problème détecté</h3>
						<p>Toutes les URLs de votre sitemap sont conformes aux standards W3C !</p>
					</div>
				</Card>
			{/if}
		</main>
	{/if}
</div>

<style>
	.scan-details-page {
		min-height: 100vh;
		background: var(--gray-50);
	}

	.loading-state {
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
		align-items: flex-start;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin-bottom: var(--space-sm);
		font-size: 0.875rem;
	}

	.breadcrumb-link {
		color: var(--accent-primary);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.breadcrumb-link:hover {
		color: var(--accent-primary-dark);
		text-decoration: underline;
	}

	.breadcrumb-separator {
		color: var(--text-tertiary);
	}

	.breadcrumb-current {
		color: var(--text-secondary);
	}

	.header-left h1 {
		font-family: var(--font-primary);
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0 0 var(--space-sm);
	}

	.scan-url {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--text-secondary);
		background: var(--gray-100);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		display: inline-block;
		margin: 0;
	}

	.scan-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-2xl) var(--space-lg);
	}


	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-lg);
	}

	.progress-header h2 {
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0;
	}

	.progress-percentage {
		font-family: var(--font-mono);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--accent-primary);
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: var(--gray-200);
		border-radius: var(--radius-sm);
		overflow: hidden;
		margin-bottom: var(--space-md);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent-primary), #0088E6);
		border-radius: var(--radius-sm);
		transition: width 0.3s ease;
	}

	.progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.progress-stats {
		display: flex;
		gap: var(--space-md);
	}

	.results-summary {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: var(--space-lg);
		margin-bottom: var(--space-xl);
	}


	.summary-icon {
		flex-shrink: 0;
		color: var(--success);
	}

	.summary-content h3 {
		font-family: var(--font-primary);
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 var(--space-xs);
	}

	.summary-content p {
		color: var(--text-secondary);
		margin: 0;
		font-size: 0.875rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
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
		margin-bottom: var(--space-xs);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}


	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xl);
	}

	.card-header h2 {
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0;
	}

	.results-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.result-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md);
		background: var(--white);
		border: 1px solid var(--gray-200);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
	}

	.result-item.has-errors {
		border-left: 4px solid var(--error);
		background: rgba(239, 3, 108, 0.05);
	}

	.result-item:hover {
		box-shadow: var(--shadow-light);
	}

	.result-info {
		flex: 1;
		min-width: 0;
	}

	.result-url {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--text-main);
		margin-bottom: var(--space-xs);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.result-meta {
		display: flex;
		gap: var(--space-md);
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.result-errors {
		color: var(--error);
		font-weight: 600;
	}

	.result-warnings {
		color: var(--accent-secondary);
		font-weight: 600;
	}

	.result-status {
		flex-shrink: 0;
		margin-left: var(--space-md);
	}


	.empty-state {
		text-align: center;
		padding: var(--space-2xl) 0;
	}

	.empty-state svg {
		color: var(--success);
		margin-bottom: var(--space-lg);
	}

	.empty-state h3 {
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 var(--space-sm);
	}

	.empty-state p {
		color: var(--text-secondary);
		margin: 0;
	}

	/* Mobile optimizations */
	@media (max-width: 1024px) {
		.results-summary {
			grid-template-columns: 1fr;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: var(--space-lg);
		}

		.scan-main {
			padding: var(--space-lg);
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.progress-info {
			flex-direction: column;
			gap: var(--space-sm);
			align-items: flex-start;
		}
	}
</style>

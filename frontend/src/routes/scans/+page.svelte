<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { scansStore } from '$lib/stores/scans.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';

	let isLoading = $state(true);
	let error = $state('');
	let currentPage = $state(1);
	let searchQuery = $state('');

	// Redirect if not authenticated
	onMount(() => {
		if (!authStore.isAuthenticated) {
			goto('/auth/login');
		} else {
			loadScans();
		}
	});

	async function loadScans() {
		isLoading = true;
		error = '';

		const result = await scansStore.fetchScans(currentPage, 10);
		
		if (!result.success) {
			error = result.error || 'Erreur lors du chargement des scans';
		}
		
		isLoading = false;
	}

	async function handlePageChange(page: number) {
		currentPage = page;
		await loadScans();
	}

	async function handleDelete(scanId: number) {
		if (confirm('Êtes-vous sûr de vouloir supprimer ce scan ?')) {
			const result = await scansStore.deleteScan(scanId);
			if (result.success) {
				await loadScans();
			} else {
				error = result.error || 'Erreur lors de la suppression';
			}
		}
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

	function getFilteredScans() {
		if (!searchQuery.trim()) {
			return scansStore.scans;
		}
		
		return scansStore.scans.filter(scan => 
			scan.sitemapUrl.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}
</script>

<svelte:head>
	<title>Mes scans - W3C Sitemap Validator</title>
</svelte:head>

<div class="scans-page">
	<header class="page-header">
		<div class="header-content">
			<div class="header-left">
				<h1>Mes scans</h1>
				<p>Historique de tous vos scans de sitemap</p>
			</div>
			<div class="header-right">
				<Button variant="primary" onclick={() => goto('/scan')}>
					Nouveau scan
				</Button>
			</div>
		</div>
	</header>

	<main class="scans-main">
		{#if error}
			<Alert variant="error" title="Erreur">
				{error}
			</Alert>
		{/if}

		<!-- Search and Filters -->
		<Card variant="default">
			<div class="filters-content">
				<div class="search-box">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8"/>
						<path d="M21 21l-4.35-4.35"/>
					</svg>
					<input
						type="text"
						placeholder="Rechercher par URL de sitemap..."
						bind:value={searchQuery}
						class="search-input"
					/>
				</div>
				<div class="filters-info">
					<span class="results-count">
						{getFilteredScans().length} scan{getFilteredScans().length > 1 ? 's' : ''}
					</span>
				</div>
			</div>
		</Card>

		<!-- Scans List -->
		{#if isLoading}
			<Card variant="default">
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Chargement des scans...</p>
				</div>
			</Card>
		{:else if getFilteredScans().length === 0}
			<Card variant="default">
				<div class="empty-state">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
						<polyline points="14,2 14,8 20,8"/>
						<line x1="16" y1="13" x2="8" y2="13"/>
						<line x1="16" y1="17" x2="8" y2="17"/>
						<polyline points="10,9 9,9 8,9"/>
					</svg>
					<h3>Aucun scan trouvé</h3>
					<p>
						{#if searchQuery.trim()}
							Aucun scan ne correspond à votre recherche.
						{:else}
							Vous n'avez pas encore effectué de scan.
						{/if}
					</p>
					<Button variant="primary" onclick={() => goto('/scan')}>
						Lancer votre premier scan
					</Button>
				</div>
			</Card>
		{:else}
			<div class="scans-list">
				{#each getFilteredScans() as scan}
					<Card variant="default">
						<div class="scan-content">
							<div class="scan-info">
								<div class="scan-header">
									<h3 class="scan-title">Scan #{scan.id}</h3>
									<Badge variant={getStatusVariant(scan.status)}>
										{getStatusLabel(scan.status)}
									</Badge>
								</div>
								<div class="scan-url">{scan.sitemapUrl}</div>
								<div class="scan-meta">
									<div class="scan-dates">
										<span class="scan-date">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
												<line x1="16" y1="2" x2="16" y2="6"/>
												<line x1="8" y1="2" x2="8" y2="6"/>
												<line x1="3" y1="10" x2="21" y2="10"/>
											</svg>
											{formatDate(scan.startedAt)}
										</span>
										{#if scan.finishedAt}
											<span class="scan-duration">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<circle cx="12" cy="12" r="10"/>
													<polyline points="12,6 12,12 16,14"/>
												</svg>
												{formatDuration(scan.startedAt, scan.finishedAt)}
											</span>
										{/if}
									</div>
									{#if scan.totalUrls}
										<div class="scan-stats">
											<span class="scan-count">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
													<polyline points="14,2 14,8 20,8"/>
													<line x1="16" y1="13" x2="8" y2="13"/>
													<line x1="16" y1="17" x2="8" y2="17"/>
													<polyline points="10,9 9,9 8,9"/>
												</svg>
												{scan.totalUrls} URLs
											</span>
											{#if scan.resultCount !== undefined}
												<span class="scan-results">
													<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
														<path d="M9 12l2 2 4-4"/>
														<circle cx="12" cy="12" r="10"/>
													</svg>
													{scan.resultCount} résultats
												</span>
											{/if}
										</div>
									{/if}
								</div>
								{#if scan.errorMsg}
									<div class="scan-error">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<circle cx="12" cy="12" r="10"/>
											<line x1="15" y1="9" x2="9" y2="15"/>
											<line x1="9" y1="9" x2="15" y2="15"/>
										</svg>
										{scan.errorMsg}
									</div>
								{/if}
							</div>
							<div class="scan-actions">
								<Button 
									variant="outline" 
									size="sm" 
									onclick={() => goto(`/scan/${scan.id}`)}
								>
									Voir détails
								</Button>
								<Button 
									variant="ghost" 
									size="sm" 
									onclick={() => handleDelete(scan.id)}
								>
									Supprimer
								</Button>
							</div>
						</div>
					</Card>
				{/each}
			</div>

			<!-- Pagination -->
			{#if scansStore.pagination.totalPages > 1}
				<Card variant="default">
					<div class="pagination">
						<Button 
							variant="outline" 
							size="sm"
							disabled={currentPage === 1}
							onclick={() => handlePageChange(currentPage - 1)}
						>
							Précédent
						</Button>
						
						<div class="pagination-info">
							Page {currentPage} sur {scansStore.pagination.totalPages}
						</div>
						
						<Button 
							variant="outline" 
							size="sm"
							disabled={currentPage === scansStore.pagination.totalPages}
							onclick={() => handlePageChange(currentPage + 1)}
						>
							Suivant
						</Button>
					</div>
				</Card>
			{/if}
		{/if}
	</main>
</div>

<style>
	.scans-page {
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

	.scans-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-2xl) var(--space-lg);
	}


	.filters-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-lg);
	}

	.search-box {
		position: relative;
		flex: 1;
		max-width: 400px;
	}

	.search-box svg {
		position: absolute;
		left: var(--space-md);
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-tertiary);
	}

	.search-input {
		width: 100%;
		padding: var(--space-md) var(--space-md) var(--space-md) 3rem;
		border: 2px solid var(--gray-300);
		border-radius: var(--radius-lg);
		font-family: var(--font-primary);
		font-size: 1rem;
		background: var(--white);
		transition: all var(--transition-fast);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 3px var(--accent-primary-light);
	}

	.search-input::placeholder {
		color: var(--text-tertiary);
	}

	.results-count {
		font-size: 0.875rem;
		color: var(--text-secondary);
		font-weight: 500;
	}


	.loading-state,
	.empty-state {
		padding: var(--space-2xl) 0;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--gray-200);
		border-top: 3px solid var(--accent-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto var(--space-lg);
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.empty-state svg {
		color: var(--text-tertiary);
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
		margin: 0 0 var(--space-lg);
	}

	.scans-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		margin-bottom: var(--space-xl);
	}


	.scan-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-lg);
	}

	.scan-info {
		flex: 1;
		min-width: 0;
	}

	.scan-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-sm);
	}

	.scan-title {
		font-family: var(--font-primary);
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0;
	}

	.scan-url {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-bottom: var(--space-md);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.scan-meta {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.scan-dates {
		display: flex;
		gap: var(--space-lg);
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.scan-dates span {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.scan-stats {
		display: flex;
		gap: var(--space-lg);
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.scan-stats span {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.scan-error {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: 0.875rem;
		color: var(--error);
		margin-top: var(--space-sm);
		padding: var(--space-sm);
		background: rgba(239, 3, 108, 0.1);
		border-radius: var(--radius-md);
	}

	.scan-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		flex-shrink: 0;
	}


	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--space-lg);
	}

	.pagination-info {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: var(--space-lg);
			text-align: center;
		}

		.scans-main {
			padding: var(--space-lg);
		}

		.filters-content {
			flex-direction: column;
			align-items: stretch;
		}

		.search-box {
			max-width: none;
		}

		.scan-content {
			flex-direction: column;
			gap: var(--space-md);
		}

		.scan-actions {
			flex-direction: row;
			justify-content: flex-end;
		}

		.scan-dates,
		.scan-stats {
			flex-direction: column;
			gap: var(--space-sm);
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { creditsStore } from '$lib/stores/credits.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';

	let isLoading = $state(true);
	let error = $state('');
	let selectedPackage = $state<number | null>(null);
	let showPurchaseModal = $state(false);

	// Redirect if not authenticated
	onMount(() => {
		if (!authStore.isAuthenticated) {
			goto('/auth/login');
		} else {
			loadCreditsData();
		}
	});

	async function loadCreditsData() {
		isLoading = true;
		error = '';

		const [balanceResult, packagesResult] = await Promise.all([
			creditsStore.fetchBalance(),
			creditsStore.fetchPackages()
		]);

		if (!balanceResult.success || !packagesResult.success) {
			error = 'Erreur lors du chargement des données de crédits';
		}

		isLoading = false;
	}

	async function handlePurchase(packageId: number) {
		selectedPackage = packageId;
		showPurchaseModal = true;
	}

	async function confirmPurchase() {
		if (!selectedPackage) return;

		const result = await creditsStore.purchaseCredits(selectedPackage, 'stripe');
		
		if (result.success) {
			showPurchaseModal = false;
			selectedPackage = null;
			// TODO: Redirect to payment page or show success message
		} else {
			error = result.error || 'Erreur lors de l\'achat';
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

	function formatPrice(price: number, currency: string) {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: currency.toUpperCase()
		}).format(price);
	}

	function getTransactionIcon(type: string) {
		switch (type) {
			case 'purchase':
				return 'plus';
			case 'usage':
				return 'minus';
			case 'refund':
				return 'refresh';
			default:
				return 'circle';
		}
	}

	function getTransactionColor(type: string) {
		switch (type) {
			case 'purchase':
				return 'success';
			case 'usage':
				return 'error';
			case 'refund':
				return 'warning';
			default:
				return 'info';
		}
	}
</script>

<svelte:head>
	<title>Mes crédits - W3C Sitemap Validator</title>
</svelte:head>

<div class="credits-page">
	{#if isLoading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Chargement de vos crédits...</p>
		</div>
	{:else}
		<header class="page-header">
			<div class="header-content">
				<div class="header-left">
					<h1>Mes crédits</h1>
					<p>Gérez votre solde de crédits et achetez des packages</p>
				</div>
				<div class="header-right">
					<div class="balance-display">
						<span class="balance-amount">{creditsStore.balance.current}</span>
						<span class="balance-label">crédits disponibles</span>
					</div>
				</div>
			</div>
		</header>

		<main class="credits-main">
			{#if error}
				<Alert variant="error" title="Erreur">
					{error}
				</Alert>
			{/if}

			<!-- Balance Overview -->
			<div class="balance-overview">
				<Card variant="default">
					<div class="balance-card">
						<div class="balance-info">
							<h2>Solde actuel</h2>
							<div class="balance-amount-large">{creditsStore.balance.current}</div>
							<div class="balance-details">
								<div class="balance-detail">
									<span class="detail-label">Total acheté</span>
									<span class="detail-value">{creditsStore.balance.totalPurchased}</span>
								</div>
								<div class="balance-detail">
									<span class="detail-label">Total utilisé</span>
									<span class="detail-value">{creditsStore.balance.totalUsed}</span>
								</div>
							</div>
						</div>
						<div class="balance-actions">
							<Button variant="primary" size="lg" onclick={() => document.getElementById('packages')?.scrollIntoView()}>
								Acheter des crédits
							</Button>
						</div>
					</div>
				</Card>
			</div>

			<!-- Credit Packages -->
			<section id="packages" class="packages-section">
				<h2>Packages de crédits</h2>
				<p>Choisissez le package qui correspond à vos besoins</p>

				<div class="packages-grid">
					{#each creditsStore.packages as pkg}
						<Card variant={pkg.popular ? 'elevated' : 'default'}>
							{#if pkg.popular}
								<div class="popular-badge">
									<Badge variant="success">Populaire</Badge>
								</div>
							{/if}
							
							<div class="package-header">
								<h3 class="package-name">{pkg.name}</h3>
								<div class="package-credits">{pkg.credits} crédits</div>
								<div class="package-price">{formatPrice(pkg.price, pkg.currency)}</div>
							</div>

							<div class="package-description">
								<p>{pkg.description}</p>
							</div>

							<div class="package-actions">
								<Button 
									variant={pkg.popular ? 'primary' : 'outline'} 
									size="lg" 
									onclick={() => handlePurchase(pkg.id)}
									loading={creditsStore.isLoading && selectedPackage === pkg.id}
								>
									Acheter maintenant
								</Button>
							</div>
						</Card>
					{/each}
				</div>
			</section>

			<!-- Recent Transactions -->
			<section class="transactions-section">
				<div class="section-header">
					<h2>Transactions récentes</h2>
					<Button variant="outline" size="sm" onclick={() => loadCreditsData()}>
						Actualiser
					</Button>
				</div>

				{#if creditsStore.transactions.length === 0}
					<Card variant="default">
						<div class="empty-state">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M9 12l2 2 4-4"/>
								<circle cx="12" cy="12" r="10"/>
							</svg>
							<h3>Aucune transaction</h3>
							<p>Vos transactions de crédits apparaîtront ici</p>
						</div>
					</Card>
				{:else}
					<Card variant="default">
						<div class="transactions-list">
							{#each creditsStore.transactions as transaction}
								<div class="transaction-item">
									<div class="transaction-icon">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											{#if getTransactionIcon(transaction.type) === 'plus'}
												<path d="M12 5v14M5 12h14"/>
											{:else if getTransactionIcon(transaction.type) === 'minus'}
												<path d="M5 12h14"/>
											{:else if getTransactionIcon(transaction.type) === 'refresh'}
												<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
												<path d="M21 3v5h-5"/>
												<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
												<path d="M3 21v-5h5"/>
											{:else}
												<circle cx="12" cy="12" r="10"/>
											{/if}
										</svg>
									</div>
									<div class="transaction-info">
										<div class="transaction-description">{transaction.description}</div>
										<div class="transaction-date">{formatDate(transaction.createdAt)}</div>
									</div>
									<div class="transaction-amount">
										<Badge variant={getTransactionColor(transaction.type)}>
											{transaction.type === 'usage' ? '-' : '+'}{transaction.amount}
										</Badge>
									</div>
								</div>
							{/each}
						</div>
					</Card>
				{/if}
			</section>
		</main>
	{/if}
</div>

<!-- Purchase Modal -->
{#if showPurchaseModal}
	<div class="modal-overlay" onclick={() => showPurchaseModal = false}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Confirmer l'achat</h3>
				<button class="modal-close" onclick={() => showPurchaseModal = false}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"/>
						<line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				</button>
			</div>
			<div class="modal-body">
				<p>Vous allez être redirigé vers la page de paiement sécurisée.</p>
			</div>
			<div class="modal-actions">
				<Button variant="outline" onclick={() => showPurchaseModal = false}>
					Annuler
				</Button>
				<Button variant="primary" onclick={confirmPurchase}>
					Confirmer
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.credits-page {
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

	.balance-display {
		text-align: center;
		background: var(--accent-primary-light);
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		min-width: 120px;
	}

	.balance-amount {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--accent-primary);
		line-height: 1;
	}

	.balance-label {
		display: block;
		font-size: 0.75rem;
		color: var(--accent-primary);
		margin-top: var(--space-xs);
	}

	.credits-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-2xl) var(--space-lg);
	}

	.balance-overview {
		margin-bottom: var(--space-2xl);
	}

	.balance-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-xl);
	}

	.balance-info h2 {
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 var(--space-md);
	}

	.balance-amount-large {
		font-size: 3rem;
		font-weight: 700;
		color: var(--accent-primary);
		line-height: 1;
		margin-bottom: var(--space-lg);
	}

	.balance-details {
		display: flex;
		gap: var(--space-xl);
	}

	.balance-detail {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.detail-label {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.detail-value {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-main);
	}

	.packages-section,
	.transactions-section {
		margin-bottom: var(--space-2xl);
	}

	.packages-section h2,
	.transactions-section h2 {
		font-family: var(--font-primary);
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 var(--space-sm);
	}

	.packages-section p {
		color: var(--text-secondary);
		margin: 0 0 var(--space-xl);
	}

	.packages-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-xl);
	}


	.popular-badge {
		position: absolute;
		top: -8px;
		right: -8px;
	}

	.package-header {
		margin-bottom: var(--space-lg);
	}

	.package-name {
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 var(--space-sm);
	}

	.package-credits {
		font-size: 1.125rem;
		color: var(--accent-primary);
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.package-price {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
	}

	.package-description {
		margin-bottom: var(--space-xl);
	}

	.package-description p {
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-lg);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-2xl) 0;
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
		margin: 0;
	}

	.transactions-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.transaction-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--gray-50);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
	}

	.transaction-item:hover {
		background: var(--white);
		box-shadow: var(--shadow-light);
	}

	.transaction-icon {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		background: var(--white);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent-primary);
	}

	.transaction-info {
		flex: 1;
		min-width: 0;
	}

	.transaction-description {
		font-weight: 500;
		color: var(--text-main);
		margin-bottom: var(--space-xs);
	}

	.transaction-date {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.transaction-amount {
		flex-shrink: 0;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-lg);
	}

	.modal-content {
		background: var(--white);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-large);
		width: 100%;
		max-width: 400px;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-xl);
		border-bottom: 1px solid var(--gray-200);
	}

	.modal-header h3 {
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0;
	}

	.modal-close {
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		transition: all var(--transition-fast);
	}

	.modal-close:hover {
		background: var(--gray-100);
		color: var(--text-main);
	}

	.modal-body {
		padding: var(--space-xl);
	}

	.modal-body p {
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	.modal-actions {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-xl);
		border-top: 1px solid var(--gray-200);
		justify-content: flex-end;
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: var(--space-lg);
			text-align: center;
		}

		.credits-main {
			padding: var(--space-lg);
		}

		.balance-card {
			flex-direction: column;
			gap: var(--space-lg);
			text-align: center;
		}

		.balance-details {
			justify-content: center;
		}

		.packages-grid {
			grid-template-columns: 1fr;
		}

		.section-header {
			flex-direction: column;
			gap: var(--space-md);
			align-items: flex-start;
		}

		.transaction-item {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}

		.transaction-amount {
			align-self: flex-end;
		}
	}
</style>

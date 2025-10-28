<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		authStore.init();
	});
</script>

<svelte:head>
	<title>Audit W3C Automatique - Votre site est-il vraiment conforme ?</title>
	<meta name="description" content="Scan profond de votre sitemap, rapport W3C complet en 1 clic. Sans expertise technique requise. Déjà 5M+ pages auditées." />
</svelte:head>

<!-- Hero Section -->
<section class="hero">
	<div class="container">
		<div class="hero-content max-w-5xl mx-auto text-center">
			<!-- Phrase d'accroche -->
			<h1 class="heading-1 mb-6">
				Votre site est-il vraiment conforme ?
			</h1>
			
			<!-- Promesse claire -->
			<p class="text-lead text-white mb-8" style="opacity: 0.95;">
				Scan profond de votre sitemap, rapport W3C complet en 1 clic.
				<br>
				<span class="hero-accent">Sans expertise technique requise.</span>
			</p>

			<!-- Bénéfices clés -->
			<div class="benefits-grid mb-12">
				<div class="benefit-item">
					<svg class="benefit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
					</svg>
					<span>Rapide</span>
				</div>
				<div class="benefit-item">
					<svg class="benefit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					<span>Fiable</span>
				</div>
				<div class="benefit-item">
					<svg class="benefit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					<span>Gain de temps</span>
				</div>
				<div class="benefit-item">
					<svg class="benefit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
					</svg>
					<span>Sécurisé</span>
				</div>
			</div>

			<!-- CTA Principal -->
			<div class="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center mb-12">
				{#if !authStore.isAuthenticated}
					<Button variant="primary" size="xl" onclick={() => window.location.href = '/auth/register'}>
						Testez gratuitement
					</Button>
					<Button variant="outline-white" size="xl" onclick={() => window.location.href = '/demo'}>
						Voir la démo
					</Button>
				{:else}
					<Button variant="primary" size="xl" onclick={() => window.location.href = '/dashboard'}>
						Nouveau scan
					</Button>
				{/if}
			</div>

			<!-- Preuve sociale -->
			<div class="proof-section">
				<div class="proof-metric">
					<div class="text-5xl font-bold mb-2 text-white">5M+</div>
					<div class="text-white" style="opacity: 0.9;">Pages auditées</div>
				</div>
				<div class="proof-stats">
					<div class="proof-item">
						<div class="text-2xl font-bold text-white">100%</div>
						<div class="text-sm text-white" style="opacity: 0.8;">W3C Compliant</div>
					</div>
					<div class="proof-item">
						<div class="text-2xl font-bold text-white">24/7</div>
						<div class="text-sm text-white" style="opacity: 0.8;">Monitoring</div>
					</div>
					<div class="proof-item">
						<div class="text-2xl font-bold text-white">2min</div>
						<div class="text-sm text-white" style="opacity: 0.8;">Rapport prêt</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		background: linear-gradient(135deg, var(--accent-primary) 0%, #0088E6 50%, #0073CC 100%);
		padding: var(--space-3xl) 0;
		position: relative;
		overflow: hidden;
	}

	.hero::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
		opacity: 0.3;
		pointer-events: none;
	}

	.hero-content {
		position: relative;
		z-index: 1;
	}

	.hero-accent {
		color: var(--accent-secondary);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		display: inline;
		font-weight: 600;
	}

	/* Bénéfices grid */
	.benefits-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: var(--space-lg);
		max-width: 500px;
		margin: 0 auto;
	}

	.benefit-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-lg);
		backdrop-filter: blur(10px);
		transition: all var(--transition-fast);
	}

	.benefit-item:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-2px);
	}

	.benefit-icon {
		width: 24px;
		height: 24px;
		color: var(--accent-secondary);
	}

	.benefit-item span {
		color: var(--white);
		font-weight: 600;
		font-size: 0.875rem;
	}

	/* Preuve sociale */
	.proof-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xl);
		padding: var(--space-xl) 0;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.proof-metric {
		text-align: center;
	}

	.proof-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-xl);
		text-align: center;
	}

	.proof-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	/* Problem/Solution sections */
	.problem-section, .solution-section {
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
	}

	.problem-section {
		background: #fef2f2;
		border: 2px solid #fecaca;
	}

	.solution-section {
		background: #f0fdf4;
		border: 2px solid #bbf7d0;
	}

	.problem-item, .solution-item {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--white);
		border-radius: var(--radius-lg);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border: 2px solid var(--border-medium);
		transition: all var(--transition-fast);
	}

	.problem-item:hover, .solution-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.problem-item h4, .solution-item h4 {
		color: var(--text-main);
		font-weight: 700;
	}

	.problem-item p, .solution-item p {
		color: var(--text-main);
		opacity: 0.8;
		font-weight: 500;
	}

	.problem-icon, .solution-icon {
		font-size: 1.5rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.space-y-4 > * + * {
		margin-top: var(--space-md);
	}

	/* Timeline Container */
	.timeline-container {
		position: relative;
		max-width: 1200px;
		margin: 0 auto;
	}

	.timeline-container::before {
		content: '';
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 4px;
		background: linear-gradient(180deg, var(--accent-primary), #0088E6, var(--accent-secondary));
		transform: translateX(-50%);
		border-radius: 2px;
		z-index: 1;
	}

	/* Timeline Steps */
	.timeline-step {
		display: flex;
		align-items: center;
		margin-bottom: 6rem;
		position: relative;
		z-index: 2;
	}

	.timeline-step:nth-child(odd) {
		flex-direction: row;
	}

	.timeline-step:nth-child(even) {
		flex-direction: row-reverse;
	}

	.timeline-step:last-child {
		margin-bottom: 0;
	}

	/* Step Visual */
	.step-visual {
		flex: 0 0 200px;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.step-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: var(--white);
		border: 4px solid var(--accent-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		box-shadow: 0 8px 32px rgba(0, 156, 255, 0.4);
		transition: all var(--transition-normal);
	}

	.step-circle:hover {
		transform: scale(1.1);
		box-shadow: 0 12px 40px rgba(0, 156, 255, 0.5);
		border-color: var(--accent-primary-hover);
	}

	.step-number {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--accent-primary);
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.step-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		opacity: 0;
		transition: all var(--transition-normal);
		color: var(--accent-primary);
	}

	.step-circle:hover .step-number {
		opacity: 0;
	}

	.step-circle:hover .step-icon {
		opacity: 1;
	}

	.step-connector {
		width: 4px;
		height: 60px;
		background: linear-gradient(180deg, var(--accent-primary), #0088E6);
		margin-top: var(--space-md);
		border-radius: 2px;
	}


	/* Step Content */
	.step-content {
		flex: 1;
		padding: 0 var(--space-xl);
	}

	.step-card {
		background: var(--white);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		border: 2px solid var(--border-medium);
		transition: all var(--transition-normal);
		position: relative;
		overflow: hidden;
	}

	.step-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, var(--accent-primary), #0088E6);
	}

	.step-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
		border-color: var(--accent-primary);
	}

	.step-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-main);
		margin-bottom: var(--space-md);
	}

	.step-description {
		color: var(--text-main);
		opacity: 0.8;
		margin-bottom: var(--space-lg);
		line-height: 1.6;
		font-weight: 500;
	}

	/* Step Demos */
	.step-demo {
		margin-top: var(--space-lg);
	}

	/* Input Demo */
	.input-demo {
		background: var(--gray-100);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		border: 2px solid var(--border-medium);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.input-label {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text-main);
		margin-bottom: var(--space-sm);
	}

	.input-field {
		display: flex;
		align-items: center;
		background: var(--white);
		border: 2px solid var(--border-medium);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		transition: all var(--transition-fast);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.input-field:hover {
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 3px rgba(0, 156, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.input-text {
		flex: 1;
		color: var(--text-main);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 700;
		opacity: 0.9;
	}

	.input-button {
		width: 32px;
		height: 32px;
		background: var(--accent-primary);
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--white);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.input-button:hover {
		background: var(--accent-primary-hover);
		transform: scale(1.05);
	}

	/* Scan Demo */
	.scan-demo {
		background: var(--gray-100);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		border: 2px solid var(--border-medium);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.scan-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-md);
	}

	.scan-status {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-weight: 700;
		color: var(--text-main);
	}

	.scan-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent-primary);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.scan-progress {
		font-weight: 800;
		color: var(--accent-primary);
		font-size: 1.125rem;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: var(--gray-200);
		border-radius: var(--radius-full);
		overflow: hidden;
		margin-bottom: var(--space-md);
	}

	.progress-fill {
		width: 75%;
		height: 100%;
		background: linear-gradient(90deg, var(--accent-primary), #0088E6);
		border-radius: var(--radius-full);
		animation: scan-progress 3s ease-in-out infinite;
	}

	@keyframes scan-progress {
		0% { width: 0%; }
		50% { width: 75%; }
		100% { width: 100%; }
	}

	.scan-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-md);
	}

	.stat {
		text-align: center;
		padding: var(--space-md);
		background: var(--white);
		border-radius: var(--radius-md);
		border: 2px solid var(--border-medium);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.stat-number {
		display: block;
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--text-main);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-main);
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	/* Report Demo */
	.report-demo {
		background: var(--gray-100);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		border: 2px solid var(--border-medium);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.report-header {
		text-align: center;
		margin-bottom: var(--space-lg);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--border-light);
	}

	.report-title {
		font-size: 1.125rem;
		font-weight: 800;
		color: var(--text-main);
		margin-bottom: var(--space-xs);
	}

	.report-date {
		font-size: 0.875rem;
		color: var(--text-main);
		opacity: 0.7;
		font-weight: 600;
	}

	.report-summary {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.summary-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--white);
		border-radius: var(--radius-md);
		border: 2px solid var(--border-medium);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: all var(--transition-fast);
	}

	.summary-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.summary-icon {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.875rem;
	}

	.summary-item.success .summary-icon {
		background: rgba(49, 236, 86, 0.1);
		color: var(--success);
	}

	.summary-item.warning .summary-icon {
		background: rgba(255, 204, 0, 0.1);
		color: var(--accent-secondary-hover);
	}

	.summary-item.info .summary-icon {
		background: var(--accent-primary-light);
		color: var(--accent-primary);
	}

	.summary-number {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--text-main);
	}

	.summary-label {
		font-size: 0.75rem;
		color: var(--text-main);
		opacity: 0.8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.report-actions {
		display: flex;
		gap: var(--space-sm);
		justify-content: center;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 700;
		transition: all var(--transition-fast);
		cursor: pointer;
		border: none;
	}

	.action-btn.primary {
		background: var(--accent-primary);
		color: var(--white);
	}

	.action-btn.primary:hover {
		background: var(--accent-primary-hover);
		transform: translateY(-1px);
	}

	.action-btn.secondary {
		background: var(--white);
		color: var(--text-main);
		border: 1px solid var(--border-medium);
	}

	.action-btn.secondary:hover {
		background: var(--gray-50);
		border-color: var(--accent-primary);
	}

	/* Why Choose Section */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: var(--space-xl);
		max-width: 1400px;
		margin: 0 auto;
	}

	.feature-card {
		background: var(--white);
		border-radius: var(--radius-2xl);
		padding: var(--space-2xl);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
		border: 2px solid var(--border-light);
		transition: all var(--transition-normal);
		position: relative;
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.feature-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, var(--accent-primary), #0088E6);
		opacity: 0;
		transition: opacity var(--transition-normal);
	}

	.feature-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
		border-color: var(--accent-primary);
	}

	.feature-card:hover::before {
		opacity: 1;
	}

	.feature-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-lg);
	}

	.feature-icon {
		width: 64px;
		height: 64px;
		border-radius: var(--radius-xl);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-normal);
		position: relative;
		overflow: hidden;
	}

	.feature-icon::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, var(--accent-primary), #0088E6);
		opacity: 0.1;
		transition: opacity var(--transition-normal);
	}

	.feature-card:hover .feature-icon::before {
		opacity: 0.2;
	}

	.feature-icon svg {
		position: relative;
		z-index: 1;
		transition: all var(--transition-normal);
	}

	.feature-card:hover .feature-icon svg {
		transform: scale(1.1);
	}

	.feature-badge {
		background: var(--gray-100);
		border-radius: var(--radius-full);
		padding: var(--space-sm) var(--space-md);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		min-width: 80px;
		transition: all var(--transition-normal);
	}

	.feature-card:hover .feature-badge {
		background: var(--accent-primary-light);
		transform: scale(1.05);
	}

	.badge-number {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--accent-primary);
		line-height: 1;
	}

	.badge-text {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-main);
		opacity: 0.8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.feature-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.feature-title {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--text-main);
		margin-bottom: var(--space-md);
		line-height: 1.2;
	}

	.feature-description {
		color: var(--text-main);
		opacity: 0.8;
		margin-bottom: var(--space-lg);
		line-height: 1.6;
		font-weight: 500;
		flex: 1;
	}

	.feature-metrics {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-md);
		margin-top: auto;
	}

	.metric {
		text-align: center;
		padding: var(--space-md);
		background: var(--gray-50);
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-light);
		transition: all var(--transition-fast);
	}

	.feature-card:hover .metric {
		background: var(--accent-primary-light);
		border-color: var(--accent-primary);
		transform: translateY(-2px);
	}

	.metric-value {
		display: block;
		font-size: 1.125rem;
		font-weight: 800;
		color: var(--accent-primary);
		margin-bottom: var(--space-xs);
	}

	.metric-label {
		font-size: 0.75rem;
		color: var(--text-main);
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	/* Feature-specific colors */
	.feature-speed .feature-icon {
		background: linear-gradient(135deg, #10B981, #059669);
		color: var(--white);
	}

	.feature-reliability .feature-icon {
		background: linear-gradient(135deg, var(--success), #22C55E);
		color: var(--white);
	}

	.feature-reports .feature-icon {
		background: linear-gradient(135deg, var(--accent-secondary), #F59E0B);
		color: var(--white);
	}

	.feature-security .feature-icon {
		background: linear-gradient(135deg, var(--error), #DC2626);
		color: var(--white);
	}

	.feature-team .feature-icon {
		background: linear-gradient(135deg, #8B5CF6, #7C3AED);
		color: var(--white);
	}

	.feature-universal .feature-icon {
		background: linear-gradient(135deg, var(--accent-primary), #2563EB);
		color: var(--white);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.timeline-container::before {
			left: 30px;
		}

		.timeline-step {
			flex-direction: column !important;
			align-items: flex-start;
			margin-bottom: 4rem;
		}

		.step-visual {
			flex: none;
			width: 100%;
			flex-direction: row;
			align-items: center;
			margin-bottom: var(--space-lg);
		}

		.step-circle {
			width: 60px;
			height: 60px;
			margin-right: var(--space-lg);
		}

		.step-number {
			font-size: 1.25rem;
		}

		.step-icon {
			width: 20px;
			height: 20px;
		}

		.step-connector {
			width: 60px;
			height: 4px;
			margin-top: 0;
			margin-left: var(--space-lg);
		}

		.step-content {
			padding: 0;
			width: 100%;
		}

		.step-card {
			padding: var(--space-lg);
		}

		.step-title {
			font-size: 1.25rem;
		}

		.report-summary {
			grid-template-columns: 1fr;
			gap: var(--space-sm);
		}

		.report-actions {
			flex-direction: column;
		}

		.action-btn {
			justify-content: center;
		}

		.scan-stats {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.timeline-container::before {
			left: 20px;
		}

		.step-circle {
			width: 50px;
			height: 50px;
		}

		.step-number {
			font-size: 1rem;
		}

		.step-icon {
			width: 16px;
			height: 16px;
		}

		.step-card {
			padding: var(--space-md);
		}

		.step-title {
			font-size: 1.125rem;
		}

		.input-demo,
		.scan-demo,
		.report-demo {
			padding: var(--space-md);
		}

		/* Why Choose Section Mobile */
		.features-grid {
			grid-template-columns: 1fr;
			gap: var(--space-lg);
		}

		.feature-card {
			padding: var(--space-lg);
		}

		.feature-icon {
			width: 56px;
			height: 56px;
		}

		.feature-title {
			font-size: 1.25rem;
		}

		.feature-metrics {
			grid-template-columns: 1fr;
			gap: var(--space-sm);
		}

		.metric {
			padding: var(--space-sm);
		}
	}

	/* CTA Section */
	.cta-section {
		background: linear-gradient(135deg, var(--accent-primary) 0%, #0088E6 100%);
		position: relative;
		overflow: hidden;
	}

	.cta-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="cta-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23cta-grid)"/></svg>');
		opacity: 0.3;
		pointer-events: none;
	}

	.cta-content {
		position: relative;
		z-index: 1;
	}

	.cta-proof {
		display: flex;
		justify-content: center;
	}

	.proof-badges {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
		justify-content: center;
	}

	.cta-guarantees {
		margin-top: var(--space-lg);
		padding-top: var(--space-lg);
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	/* Optimisations pour PC */
	@media (min-width: 1024px) {
		.hero {
			padding: 6rem 0;
		}

		.hero-content {
			max-width: 56rem;
		}

		.hero-accent {
			color: var(--accent-secondary);
			text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
		}

		.hero h1 {
			font-size: 4rem;
			line-height: 1.1;
		}

		.hero .text-lead {
			font-size: 1.5rem;
			max-width: 48rem;
			margin: 0 auto var(--space-xl) auto;
		}

		.hero .flex {
			gap: var(--space-lg);
		}

		.hero .flex button {
			min-width: 200px;
		}
	}

	@media (min-width: 1280px) {
		.hero h1 {
			font-size: 4.5rem;
		}

		.hero .text-lead {
			font-size: 1.625rem;
		}

		.hero .flex button {
			min-width: 220px;
		}
	}

	/* Optimisations pour les très grands écrans */
	@media (min-width: 1536px) {
		.hero {
			padding: 8rem 0;
		}

		.hero h1 {
			font-size: 5rem;
		}

		.hero .text-lead {
			font-size: 1.75rem;
		}

		.container {
			max-width: 1400px;
		}
	}
</style>

<!-- Problem/Solution Section -->
<section class="py-20 bg-white">
	<div class="container">
		<div class="text-center mb-16">
			<h2 class="heading-2 mb-4">
				Fini les audits manuels chronophages
			</h2>
			<p class="text-lead max-w-3xl mx-auto">
				Vérifiez la conformité W3C de votre site entier en quelques minutes, 
				avec des rapports clairs et des recommandations concrètes.
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
			<!-- Problème -->
			<div class="problem-section">
				<h3 class="heading-3 mb-6" style="color: var(--error);">❌ Avant</h3>
				<div class="space-y-4">
					<div class="problem-item">
						<div class="problem-icon">⏰</div>
						<div>
							<h4 class="font-semibold mb-1">Audits manuels</h4>
							<p class="text-sm text-gray-600">Des heures à vérifier chaque page une par une</p>
						</div>
					</div>
					<div class="problem-item">
						<div class="problem-icon">🤯</div>
						<div>
							<h4 class="font-semibold mb-1">Expertise technique</h4>
							<p class="text-sm text-gray-600">Besoin de connaître HTML/CSS/W3C sur le bout des doigts</p>
						</div>
					</div>
					<div class="problem-item">
						<div class="problem-icon">📊</div>
						<div>
							<h4 class="font-semibold mb-1">Rapports incomplets</h4>
							<p class="text-sm text-gray-600">Difficile de suivre les erreurs et les corrections</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Solution -->
			<div class="solution-section">
				<h3 class="heading-3 mb-6" style="color: var(--success);">✅ Avec notre solution</h3>
				<div class="space-y-4">
					<div class="solution-item">
						<div class="solution-icon">⚡</div>
						<div>
							<h4 class="font-semibold mb-1">Scan automatique</h4>
							<p class="text-sm text-gray-600">Toutes vos pages analysées en 2 minutes chrono</p>
						</div>
					</div>
					<div class="solution-item">
						<div class="solution-icon">🎯</div>
						<div>
							<h4 class="font-semibold mb-1">Rapports clairs</h4>
							<p class="text-sm text-gray-600">Erreurs classées par priorité avec solutions concrètes</p>
						</div>
					</div>
					<div class="solution-item">
						<div class="solution-icon">📈</div>
						<div>
							<h4 class="font-semibold mb-1">Suivi en temps réel</h4>
							<p class="text-sm text-gray-600">Monitoring continu et alertes automatiques</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Why Choose Section -->
<section class="py-20 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
	<div class="container">
		<div class="text-center mb-20">
			<h2 class="heading-2 mb-4">
				Pourquoi choisir notre solution ?
			</h2>
			<p class="text-lead max-w-3xl mx-auto">
				Des outils professionnels conçus pour les développeurs, freelances et agences
			</p>
		</div>

		<!-- Features Grid -->
		<div class="features-grid">
			<!-- Feature 1 - Speed -->
			<div class="feature-card feature-speed">
				<div class="feature-header">
					<div class="feature-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M13 10V3L4 14h7v7l9-11h-7z"/>
						</svg>
					</div>
					<div class="feature-badge">
						<span class="badge-number">95%</span>
						<span class="badge-text">Gain de temps</span>
					</div>
				</div>
				<div class="feature-content">
					<h3 class="feature-title">Rapide comme l'éclair</h3>
					<p class="feature-description">
						Scan de 10 000 pages en moins de 5 minutes. 
						Résultats instantanés, pas d'attente.
					</p>
					<div class="feature-metrics">
						<div class="metric">
							<span class="metric-value">2min</span>
							<span class="metric-label">Temps moyen</span>
						</div>
						<div class="metric">
							<span class="metric-value">10K</span>
							<span class="metric-label">Pages max</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Feature 2 - Reliability -->
			<div class="feature-card feature-reliability">
				<div class="feature-header">
					<div class="feature-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<div class="feature-badge">
						<span class="badge-number">99.9%</span>
						<span class="badge-text">Précision</span>
					</div>
				</div>
				<div class="feature-content">
					<h3 class="feature-title">100% fiable</h3>
					<p class="feature-description">
						Basé sur les standards W3C officiels. 
						Détection précise de toutes les erreurs.
					</p>
					<div class="feature-metrics">
						<div class="metric">
							<span class="metric-value">W3C</span>
							<span class="metric-label">Standards</span>
						</div>
						<div class="metric">
							<span class="metric-value">24/7</span>
							<span class="metric-label">Disponible</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Feature 3 - Reports -->
			<div class="feature-card feature-reports">
				<div class="feature-header">
					<div class="feature-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
						</svg>
					</div>
					<div class="feature-badge">
						<span class="badge-number">3+</span>
						<span class="badge-text">Formats</span>
					</div>
				</div>
				<div class="feature-content">
					<h3 class="feature-title">Rapports détaillés</h3>
					<p class="feature-description">
						Erreurs classées par priorité avec solutions concrètes. 
						Export PDF/CSV pour vos clients.
					</p>
					<div class="feature-metrics">
						<div class="metric">
							<span class="metric-value">PDF</span>
							<span class="metric-label">Export</span>
						</div>
						<div class="metric">
							<span class="metric-value">CSV</span>
							<span class="metric-label">Données</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Feature 4 - Security -->
			<div class="feature-card feature-security">
				<div class="feature-header">
					<div class="feature-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
						</svg>
					</div>
					<div class="feature-badge">
						<span class="badge-number">100%</span>
						<span class="badge-text">Sécurisé</span>
					</div>
				</div>
				<div class="feature-content">
					<h3 class="feature-title">Sécurité garantie</h3>
					<p class="feature-description">
						Vos données sont chiffrées et sécurisées. 
						Conformité RGPD et ISO 27001.
					</p>
					<div class="feature-metrics">
						<div class="metric">
							<span class="metric-value">RGPD</span>
							<span class="metric-label">Compliant</span>
						</div>
						<div class="metric">
							<span class="metric-value">ISO</span>
							<span class="metric-label">27001</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Feature 5 - Team -->
			<div class="feature-card feature-team">
				<div class="feature-header">
					<div class="feature-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
						</svg>
					</div>
					<div class="feature-badge">
						<span class="badge-number">∞</span>
						<span class="badge-text">Collaboration</span>
					</div>
				</div>
				<div class="feature-content">
					<h3 class="feature-title">Équipe & clients</h3>
					<p class="feature-description">
						Partagez les rapports avec votre équipe. 
						Parfait pour les agences et freelances.
					</p>
					<div class="feature-metrics">
						<div class="metric">
							<span class="metric-value">Team</span>
							<span class="metric-label">Sharing</span>
						</div>
						<div class="metric">
							<span class="metric-value">API</span>
							<span class="metric-label">Intégration</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Feature 6 - Universal -->
			<div class="feature-card feature-universal">
				<div class="feature-header">
					<div class="feature-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
						</svg>
					</div>
					<div class="feature-badge">
						<span class="badge-number">∞</span>
						<span class="badge-text">Compatible</span>
					</div>
				</div>
				<div class="feature-content">
					<h3 class="feature-title">Support multi-CMS</h3>
					<p class="feature-description">
						WordPress, Drupal, Shopify, custom... 
						Tous les sites sont supportés.
					</p>
					<div class="feature-metrics">
						<div class="metric">
							<span class="metric-value">WP</span>
							<span class="metric-label">WordPress</span>
						</div>
						<div class="metric">
							<span class="metric-value">Custom</span>
							<span class="metric-label">Sites</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- How It Works -->
<section class="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
	<div class="container">
		<div class="text-center mb-20">
			<h2 class="heading-2 mb-4">
				Comment ça marche ?
			</h2>
			<p class="text-lead max-w-2xl mx-auto">
				En 3 étapes simples, obtenez un audit complet de votre site
			</p>
		</div>

		<!-- Timeline Container -->
		<div class="timeline-container">
			<!-- Step 1 -->
			<div class="timeline-step step-1">
				<div class="step-visual">
					<div class="step-circle">
						<div class="step-number">1</div>
						<div class="step-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
								<polyline points="14,2 14,8 20,8"/>
								<line x1="16" y1="13" x2="8" y2="13"/>
								<line x1="16" y1="17" x2="8" y2="17"/>
								<polyline points="10,9 9,9 8,9"/>
							</svg>
						</div>
					</div>
					<div class="step-connector"></div>
				</div>
				<div class="step-content">
					<div class="step-card">
						<h3 class="step-title">Collez votre sitemap</h3>
						<p class="step-description">
							Entrez simplement l'URL de votre sitemap XML. 
							Support jusqu'à 10 000 pages.
						</p>
						<div class="step-demo">
							<div class="input-demo">
								<div class="input-label">URL de votre sitemap</div>
								<div class="input-field">
									<span class="input-text">https://monsite.com/sitemap.xml</span>
									<div class="input-button">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M9 18l6-6-6-6"/>
										</svg>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Step 2 -->
			<div class="timeline-step step-2">
				<div class="step-visual">
					<div class="step-circle">
						<div class="step-number">2</div>
						<div class="step-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M13 10V3L4 14h7v7l9-11h-7z"/>
							</svg>
						</div>
					</div>
					<div class="step-connector"></div>
				</div>
				<div class="step-content">
					<div class="step-card">
						<h3 class="step-title">Scan automatique</h3>
						<p class="step-description">
							Notre robot analyse chaque page selon les standards W3C. 
							Résultats en 2-5 minutes.
						</p>
						<div class="step-demo">
							<div class="scan-demo">
								<div class="scan-header">
									<div class="scan-status">
										<div class="scan-indicator"></div>
										<span>Scan en cours...</span>
									</div>
									<div class="scan-progress">75%</div>
								</div>
								<div class="progress-bar">
									<div class="progress-fill"></div>
								</div>
								<div class="scan-stats">
									<div class="stat">
										<span class="stat-number">1,247</span>
										<span class="stat-label">pages scannées</span>
									</div>
									<div class="stat">
										<span class="stat-number">23</span>
										<span class="stat-label">erreurs trouvées</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Step 3 -->
			<div class="timeline-step step-3">
				<div class="step-visual">
					<div class="step-circle">
						<div class="step-number">3</div>
						<div class="step-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
							</svg>
						</div>
					</div>
				</div>
				<div class="step-content">
					<div class="step-card">
						<h3 class="step-title">Rapport détaillé</h3>
						<p class="step-description">
							Recevez un rapport complet avec erreurs classées par priorité 
							et solutions concrètes.
						</p>
						<div class="step-demo">
							<div class="report-demo">
								<div class="report-header">
									<div class="report-title">Rapport d'audit W3C</div>
									<div class="report-date">Généré il y a 2 minutes</div>
								</div>
								<div class="report-summary">
									<div class="summary-item success">
										<div class="summary-icon">✓</div>
										<div class="summary-content">
											<div class="summary-number">847</div>
											<div class="summary-label">Pages conformes</div>
										</div>
									</div>
									<div class="summary-item warning">
										<div class="summary-icon">⚠</div>
										<div class="summary-content">
											<div class="summary-number">23</div>
											<div class="summary-label">Erreurs détectées</div>
										</div>
									</div>
									<div class="summary-item info">
										<div class="summary-icon">ℹ</div>
										<div class="summary-content">
											<div class="summary-number">12</div>
											<div class="summary-label">Avertissements</div>
										</div>
									</div>
								</div>
								<div class="report-actions">
									<button class="action-btn primary">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
											<polyline points="7,10 12,15 17,10"/>
											<line x1="12" y1="15" x2="12" y2="3"/>
										</svg>
										Télécharger PDF
									</button>
									<button class="action-btn secondary">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
											<polyline points="14,2 14,8 20,8"/>
										</svg>
										Voir détails
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20 cta-section">
	<div class="container text-center">
		<div class="cta-content">
			<h2 class="heading-2 mb-4 text-white">
				Prêt à auditer votre site ?
			</h2>
			<p class="text-lead mb-8 max-w-3xl mx-auto text-white" style="opacity: 0.95;">
				Rejoignez plus de 2 500 développeurs et agences qui font confiance à notre solution 
				pour garantir la conformité W3C de leurs sites web.
			</p>
			
			<!-- Preuve sociale -->
			<div class="cta-proof mb-8">
				<div class="proof-badges">
					<Badge variant="success" size="lg">✓ 2 500+ utilisateurs</Badge>
					<Badge variant="primary" size="lg">✓ 5M+ pages auditées</Badge>
					<Badge variant="secondary" size="lg">✓ 99.9% satisfaction</Badge>
				</div>
			</div>

			<!-- CTA Buttons -->
			<div class="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center mb-8">
				{#if !authStore.isAuthenticated}
					<Button variant="secondary" size="xl" onclick={() => window.location.href = '/auth/register'}>
						Testez gratuitement
					</Button>
					<Button variant="outline-white" size="xl" onclick={() => window.location.href = '/demo'}>
						Voir la démo
					</Button>
				{:else}
					<Button variant="secondary" size="xl" onclick={() => window.location.href = '/dashboard'}>
						Nouveau scan
					</Button>
				{/if}
			</div>

			<!-- Garanties -->
			<div class="cta-guarantees">
				<p class="text-sm text-white" style="opacity: 0.8;">
					✓ Essai gratuit • ✓ Aucun engagement • ✓ Support 24/7
				</p>
			</div>
		</div>
	</div>
</section>

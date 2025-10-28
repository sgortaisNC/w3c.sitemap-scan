<script lang="ts">
	import '../app.css';
</script>

<svelte:head>
	<title>Authentification - W3C Sitemap Validator</title>
	<meta name="description" content="Connectez-vous ou créez un compte pour valider vos sitemaps" />
</svelte:head>

<div class="auth-layout">
	<div class="auth-container">
		<div class="auth-header">
			<a href="/" class="auth-logo">
				<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
					<rect width="32" height="32" rx="8" fill="url(#gradient)"/>
					<path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2z" fill="white"/>
					<defs>
						<linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
							<stop stop-color="#0066CC"/>
							<stop offset="1" stop-color="#004499"/>
						</linearGradient>
					</defs>
				</svg>
				<span>W3C Validator</span>
			</a>
		</div>
		
		<div class="auth-content">
			<slot />
		</div>
		
		<div class="auth-footer">
			<p>Déjà un compte ? <a href="/auth/login">Se connecter</a></p>
			<p>Nouveau ? <a href="/auth/register">Créer un compte</a></p>
		</div>
	</div>
</div>

<style>
	.auth-layout {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--accent-primary-light) 0%, var(--accent-secondary-light) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-lg);
	}

	.auth-container {
		width: 100%;
		max-width: 400px;
		background: var(--white);
		border-radius: var(--radius-2xl);
		box-shadow: var(--shadow-large);
		overflow: hidden;
	}

	.auth-header {
		padding: var(--space-2xl) var(--space-2xl) var(--space-lg);
		text-align: center;
		border-bottom: 1px solid var(--gray-200);
	}

	.auth-logo {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		text-decoration: none;
		color: var(--text-main);
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: 700;
		transition: color var(--transition-fast);
	}

	.auth-logo:hover {
		color: var(--accent-primary);
	}

	.auth-content {
		padding: var(--space-2xl);
	}

	.auth-footer {
		padding: var(--space-lg) var(--space-2xl) var(--space-2xl);
		text-align: center;
		background: var(--gray-50);
		border-top: 1px solid var(--gray-200);
	}

	.auth-footer p {
		margin: 0 0 var(--space-sm);
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.auth-footer a {
		color: var(--accent-primary);
		text-decoration: none;
		font-weight: 600;
		transition: color var(--transition-fast);
	}

	.auth-footer a:hover {
		color: var(--accent-primary-dark);
		text-decoration: underline;
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.auth-layout {
			padding: var(--space-md);
		}
		
		.auth-container {
			max-width: 100%;
		}
		
		.auth-header,
		.auth-content,
		.auth-footer {
			padding: var(--space-lg);
		}
	}
</style>

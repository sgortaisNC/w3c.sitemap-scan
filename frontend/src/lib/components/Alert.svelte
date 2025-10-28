<script lang="ts">
	interface Props {
		variant?: 'success' | 'error' | 'warning' | 'info';
		title?: string;
		children?: import('svelte').Snippet;
		dismissible?: boolean;
		onDismiss?: () => void;
	}

	let { 
		variant = 'info', 
		title, 
		children, 
		dismissible = false,
		onDismiss 
	}: Props = $props();

	function handleDismiss() {
		if (onDismiss) {
			onDismiss();
		}
	}
</script>

<div class="alert alert-{variant}">
	<div class="alert-content">
		{#if title}
			<div class="alert-title">{title}</div>
		{/if}
		{#if children}
			<div class="alert-body">
				{@render children()}
			</div>
		{/if}
	</div>
	{#if dismissible}
		<button class="alert-dismiss" onclick={handleDismiss} aria-label="Fermer">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	{/if}
</div>

<style>
	.alert {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		border-left: 4px solid;
		margin: var(--space-md) 0;
		position: relative;
	}

	.alert-content {
		flex: 1;
	}

	.alert-title {
		font-family: var(--font-primary);
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 var(--space-sm) 0;
	}

	.alert-body {
		font-family: var(--font-primary);
		font-size: 0.875rem;
		line-height: 1.5;
		margin: 0;
	}

	.alert-dismiss {
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color var(--transition-fast);
	}

	.alert-dismiss:hover {
		background: rgba(0, 0, 0, 0.1);
	}

	/* Variants */
	.alert-success {
		background: rgba(49, 236, 86, 0.1);
		border-left-color: var(--success);
		color: #1B5E20;
	}

	.alert-success .alert-title {
		color: #1B5E20;
	}

	.alert-error {
		background: rgba(239, 3, 108, 0.1);
		border-left-color: var(--error);
		color: #B71C1C;
	}

	.alert-error .alert-title {
		color: #B71C1C;
	}

	.alert-warning {
		background: var(--accent-secondary-light);
		border-left-color: var(--accent-secondary);
		color: #B8860B;
	}

	.alert-warning .alert-title {
		color: #B8860B;
	}

	.alert-info {
		background: var(--accent-primary-light);
		border-left-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	.alert-info .alert-title {
		color: var(--accent-primary);
	}
</style>

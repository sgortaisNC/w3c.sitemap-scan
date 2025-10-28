<script lang="ts">
	interface Props {
		variant?: 'default' | 'elevated' | 'outlined' | 'filled';
		padding?: 'sm' | 'md' | 'lg';
		children?: import('svelte').Snippet;
	}

	let { variant = 'default', padding = 'md', children }: Props = $props();
</script>

<div class="card card-{variant} card-padding-{padding} interactive">
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.card {
		background: var(--white);
		border-radius: var(--radius-xl);
		transition: all var(--transition-normal);
		position: relative;
		overflow: hidden;
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-card-hover);
	}

	.card-default {
		box-shadow: var(--shadow-card);
		border: 1px solid var(--border-light);
	}

	.card-elevated {
		box-shadow: var(--shadow-card-hover);
		border: none;
	}

	.card-outlined {
		box-shadow: none;
		border: 2px solid var(--border-medium);
	}

	.card-filled {
		background: var(--accent-soft);
		box-shadow: none;
		border: 1px solid rgba(255, 204, 0, 0.2);
	}

	.card-padding-sm {
		padding: var(--space-md);
	}

	.card-padding-md {
		padding: var(--space-lg);
	}

	.card-padding-lg {
		padding: var(--space-xl);
	}

	/* Card content patterns */
	.card-header {
		margin-bottom: var(--space-lg);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--border-light);
	}

	.card-title {
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 var(--space-sm) 0;
	}

	.card-subtitle {
		font-family: var(--font-primary);
		font-size: 0.875rem;
		color: var(--gray-600);
		margin: 0;
	}

	.card-body {
		margin-bottom: var(--space-lg);
	}

	.card-footer {
		margin-top: var(--space-lg);
		padding-top: var(--space-md);
		border-top: 1px solid var(--border-light);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>

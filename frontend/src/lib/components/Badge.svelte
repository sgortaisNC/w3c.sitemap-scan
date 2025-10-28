<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
		size?: 'sm' | 'md' | 'lg';
		children?: import('svelte').Snippet;
	}

	let { variant = 'primary', size = 'md', children }: Props = $props();
</script>

<span class="badge badge-{variant} badge-{size}">
	{#if children}
		{@render children()}
	{/if}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		font-family: var(--font-primary);
		font-weight: 600;
		border-radius: var(--radius-full);
		white-space: nowrap;
	}

	.badge-primary {
		background: var(--accent-primary-light);
		color: var(--accent-primary);
		border: 1px solid rgba(0, 156, 255, 0.2);
	}

	.badge-secondary {
		background: var(--accent-secondary-light);
		color: var(--accent-secondary-hover);
		border: 1px solid rgba(255, 204, 0, 0.3);
	}

	.badge-success {
		background: rgba(49, 236, 86, 0.1);
		color: var(--success);
		border: 1px solid rgba(49, 236, 86, 0.2);
	}

	.badge-error {
		background: rgba(239, 3, 108, 0.1);
		color: var(--error);
		border: 1px solid rgba(239, 3, 108, 0.2);
	}

	.badge-warning {
		background: var(--accent-secondary-light);
		color: #B8860B;
		border: 1px solid rgba(255, 204, 0, 0.3);
	}

	.badge-info {
		background: var(--gray-100);
		color: var(--gray-700);
		border: 1px solid var(--border-light);
	}

	.badge-sm {
		padding: 0.125rem 0.5rem;
		font-size: 0.75rem;
	}

	.badge-md {
		padding: 0.25rem 0.75rem;
		font-size: 0.875rem;
	}

	.badge-lg {
		padding: 0.375rem 1rem;
		font-size: 1rem;
	}
</style>

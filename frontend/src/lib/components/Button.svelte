<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'outline' | 'outline-white' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg' | 'xl';
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		children?: import('svelte').Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let { 
		variant = 'primary', 
		size = 'md', 
		disabled = false, 
		loading = false,
		type = 'button', 
		children, 
		onclick 
	}: Props = $props();
</script>

<button
	type={type}
	class="btn btn-{variant} btn-{size}"
	class:btn-loading={loading}
	{disabled}
	onclick={onclick}
>
	{#if loading}
		<svg class="btn-spinner" viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.25"/>
			<path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
		</svg>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		font-family: var(--font-primary);
		font-weight: 600;
		text-decoration: none;
		border: 2px solid transparent;
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all var(--transition-fast);
		position: relative;
		overflow: hidden;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none !important;
	}

	.btn:not(:disabled):hover {
		transform: translateY(-1px);
		box-shadow: 0 8px 25px var(--shadow-medium);
	}

	.btn:not(:disabled):active {
		transform: translateY(0);
		box-shadow: 0 4px 12px var(--shadow-light);
	}

	/* Variants */
	.btn-primary {
		background: linear-gradient(135deg, var(--accent-primary) 0%, #0088E6 100%);
		color: var(--white);
		box-shadow: var(--shadow-button);
	}

	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, #0088E6 0%, #0073CC 100%);
		box-shadow: var(--shadow-button-hover);
	}

	.btn-secondary {
		background: var(--accent-secondary);
		color: var(--text-main);
		box-shadow: var(--shadow-button-secondary);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--accent-secondary-hover);
		box-shadow: var(--shadow-button-secondary-hover);
	}

	.btn-outline {
		background: transparent;
		color: var(--accent-primary);
		border-color: var(--accent-primary);
	}

	.btn-outline:hover:not(:disabled) {
		background: var(--accent-primary);
		color: var(--white);
		box-shadow: var(--shadow-button);
	}

	/* Outline variant for white text on colored backgrounds */
	.btn-outline-white {
		background: transparent;
		color: var(--white);
		border-color: var(--white);
	}

	.btn-outline-white:hover:not(:disabled) {
		background: var(--white);
		color: var(--accent-primary);
		box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
	}

	.btn-ghost {
		background: transparent;
		color: var(--text-main);
	}

	.btn-ghost:hover:not(:disabled) {
		background: var(--gray-100);
	}

	.btn-danger {
		background: var(--error);
		color: var(--white);
		box-shadow: var(--shadow-button-danger);
	}

	.btn-danger:hover:not(:disabled) {
		background: #D6025A;
		box-shadow: var(--shadow-button-danger-hover);
	}

	/* Sizes */
	.btn-sm {
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
		min-height: 2rem;
	}

	.btn-md {
		padding: var(--space-md) var(--space-lg);
		font-size: 1rem;
		min-height: 2.5rem;
	}

	.btn-lg {
		padding: var(--space-lg) var(--space-xl);
		font-size: 1.125rem;
		min-height: 3rem;
	}

	.btn-xl {
		padding: var(--space-xl) var(--space-2xl);
		font-size: 1.25rem;
		min-height: 3.5rem;
	}

	/* Loading state */
	.btn-loading {
		pointer-events: none;
	}

	.btn-spinner {
		width: 1em;
		height: 1em;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.btn {
			min-height: 48px;
			font-size: 1rem;
		}
		
		.btn-sm {
			min-height: 44px;
			font-size: 0.875rem;
		}
	}
</style>

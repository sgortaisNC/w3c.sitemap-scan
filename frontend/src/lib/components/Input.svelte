<script lang="ts">
	interface Props {
		id?: string;
		type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
		label?: string;
		placeholder?: string;
		value?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		autocomplete?: string;
		oninput?: (event: Event) => void;
		onblur?: (event: Event) => void;
		onfocus?: (event: Event) => void;
	}

	let { 
		id,
		type = 'text',
		label,
		placeholder,
		value = $bindable(''),
		error,
		required = false,
		disabled = false,
		autocomplete,
		oninput,
		onblur,
		onfocus
	}: Props = $props();

	let showPassword = $state(false);
	let inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	function handleInput(event: Event) {
		if (oninput) {
			oninput(event);
		}
	}

	function handleBlur(event: Event) {
		if (onblur) {
			onblur(event);
		}
	}

	function handleFocus(event: Event) {
		if (onfocus) {
			onfocus(event);
		}
	}
</script>

<div class="input-group">
	{#if label}
		<label for={inputId} class="input-label">
			{label}
			{#if required}
				<span class="required">*</span>
			{/if}
		</label>
	{/if}
	
	<div class="input-wrapper" class:has-error={error}>
		{#if type === 'password'}
			<div class="password-input">
				<input
					{id}
					type={showPassword ? 'text' : 'password'}
					{placeholder}
					bind:value
					{required}
					{disabled}
					autocomplete={autocomplete as any}
					oninput={handleInput}
					onblur={handleBlur}
					onfocus={handleFocus}
					class="input-field"
				/>
				<button
					type="button"
					class="password-toggle"
					onclick={togglePasswordVisibility}
					aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
					{disabled}
				>
					{#if showPassword}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
							<line x1="1" y1="1" x2="23" y2="23"/>
						</svg>
					{:else}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
							<circle cx="12" cy="12" r="3"/>
						</svg>
					{/if}
				</button>
			</div>
		{:else}
			<input
				{id}
				{type}
				{placeholder}
				bind:value
				{required}
				{disabled}
				autocomplete={autocomplete as any}
				oninput={handleInput}
				onblur={handleBlur}
				onfocus={handleFocus}
				class="input-field"
			/>
		{/if}
	</div>
	
	{#if error}
		<div class="input-error">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" y1="8" x2="12" y2="12"/>
				<line x1="12" y1="16" x2="12.01" y2="16"/>
			</svg>
			<span>{error}</span>
		</div>
	{/if}
</div>

<style>
	.input-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.input-label {
		font-family: var(--font-primary);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-main);
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.required {
		color: var(--error);
		font-weight: 700;
	}

	.input-wrapper {
		position: relative;
	}

	.input-wrapper.has-error .input-field {
		border-color: var(--error);
		box-shadow: 0 0 0 3px rgba(239, 3, 108, 0.1);
	}

	.input-field {
		width: 100%;
		padding: var(--space-md);
		border: 2px solid var(--gray-300);
		border-radius: var(--radius-lg);
		font-family: var(--font-primary);
		font-size: 1rem;
		background: var(--white);
		transition: all var(--transition-fast);
	}

	.input-field:focus {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 3px var(--accent-primary-light);
	}

	.input-field:disabled {
		background: var(--gray-100);
		color: var(--text-tertiary);
		cursor: not-allowed;
	}

	.input-field::placeholder {
		color: var(--text-tertiary);
	}

	.password-input {
		position: relative;
	}

	.password-toggle {
		position: absolute;
		right: var(--space-md);
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		transition: color var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.password-toggle:hover:not(:disabled) {
		color: var(--text-main);
	}

	.password-toggle:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.input-error {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: 0.75rem;
		color: var(--error);
		margin-top: var(--space-xs);
	}

	.input-error svg {
		flex-shrink: 0;
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.input-field {
			font-size: 16px; /* Prevent zoom on iOS */
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import '../app.css';

	let { children } = $props();
	let authStore: any = null;

	// Initialize stores
	onMount(async () => {
		const authModule = await import('$lib/stores/auth.svelte');
		authStore = authModule.authStore;
		authStore.init();
	});

	// Check if user should be redirected
	$effect(() => {
		if (authStore) {
			const currentPath = $page.url.pathname;
			const isAuthPage = currentPath.startsWith('/auth');
			const isDashboardPage = currentPath.startsWith('/dashboard');
			
			if (authStore.isAuthenticated && isAuthPage) {
				goto('/dashboard');
			} else if (!authStore.isAuthenticated && isDashboardPage) {
				goto('/auth/login');
			}
		}
	});
</script>

<svelte:head>
	<title>W3C Sitemap Validator</title>
	<meta name="description" content="Validate your website sitemap with W3C standards" />
</svelte:head>

{@render children?.()}

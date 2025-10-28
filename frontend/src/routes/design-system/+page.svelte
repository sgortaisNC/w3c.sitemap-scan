<script lang="ts">
	import { Button, Badge, Card, Alert } from '$lib';
</script>

<svelte:head>
	<title>Design System - W3C Sitemap Validator</title>
	<meta name="description" content="Design system showcase for W3C Sitemap Validator" />
</svelte:head>

<div class="container py-20">
	<h1 class="heading-1 mb-12 text-center">Design System Showcase</h1>

	<!-- Buttons Section -->
	<section class="mb-16">
		<h2 class="heading-2 mb-8">Buttons</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<Card variant="default" padding="lg">
				<h3 class="heading-4 mb-4">Button Variants</h3>
				<div class="flex flex-wrap gap-4 mb-6">
					<Button variant="primary">Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="danger">Danger</Button>
				</div>
				
				<h4 class="heading-4 mb-4">Button Sizes</h4>
				<div class="flex flex-wrap items-center gap-4">
					<Button variant="primary" size="sm">Small</Button>
					<Button variant="primary" size="md">Medium</Button>
					<Button variant="primary" size="lg">Large</Button>
					<Button variant="primary" size="xl">Extra Large</Button>
				</div>
			</Card>

			<Card variant="default" padding="lg">
				<h3 class="heading-4 mb-4">Button States</h3>
				<div class="flex flex-wrap gap-4 mb-6">
					<Button variant="primary">Normal</Button>
					<Button variant="primary" loading>Loading</Button>
					<Button variant="primary" disabled>Disabled</Button>
				</div>
				
				<h4 class="heading-4 mb-4">Interactive Examples</h4>
				<div class="flex flex-wrap gap-4">
					<Button variant="primary" onclick={() => alert('Primary clicked!')}>Click Me</Button>
					<Button variant="outline" onclick={() => alert('Outline clicked!')}>Outline</Button>
				</div>
			</Card>
		</div>
	</section>

	<!-- Badges Section -->
	<section class="mb-16">
		<h2 class="heading-2 mb-8">Badges</h2>
		
		<Card variant="default" padding="lg">
			<h3 class="heading-4 mb-4">Badge Variants</h3>
			<div class="flex flex-wrap gap-4 mb-6">
				<Badge variant="primary">Primary</Badge>
				<Badge variant="secondary">Secondary</Badge>
				<Badge variant="success">Success</Badge>
				<Badge variant="error">Error</Badge>
				<Badge variant="warning">Warning</Badge>
				<Badge variant="info">Info</Badge>
			</div>
			
			<h4 class="heading-4 mb-4">Badge Sizes</h4>
			<div class="flex flex-wrap items-center gap-4">
				<Badge variant="primary" size="sm">Small</Badge>
				<Badge variant="primary" size="md">Medium</Badge>
				<Badge variant="primary" size="lg">Large</Badge>
			</div>
		</Card>
	</section>

	<!-- Cards Section -->
	<section class="mb-16">
		<h2 class="heading-2 mb-8">Cards</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<Card variant="default" padding="md">
				<div class="card-header">
					<h3 class="card-title">Default Card</h3>
					<p class="card-subtitle">With subtitle</p>
				</div>
				<div class="card-body">
					<p class="text-base">This is a default card with standard styling.</p>
				</div>
			</Card>

			<Card variant="elevated" padding="md">
				<div class="card-header">
					<h3 class="card-title">Elevated Card</h3>
					<p class="card-subtitle">With shadow</p>
				</div>
				<div class="card-body">
					<p class="text-base">This card has an elevated shadow effect.</p>
				</div>
			</Card>

			<Card variant="outlined" padding="md">
				<div class="card-header">
					<h3 class="card-title">Outlined Card</h3>
					<p class="card-subtitle">With border</p>
				</div>
				<div class="card-body">
					<p class="text-base">This card has a prominent border.</p>
				</div>
			</Card>

			<Card variant="filled" padding="md">
				<div class="card-header">
					<h3 class="card-title">Filled Card</h3>
					<p class="card-subtitle">With background</p>
				</div>
				<div class="card-body">
					<p class="text-base">This card has a filled background color.</p>
				</div>
			</Card>
		</div>
	</section>

	<!-- Alerts Section -->
	<section class="mb-16">
		<h2 class="heading-2 mb-8">Alerts</h2>
		
		<div class="space-y-4">
			<Alert variant="success" title="Success!">
				Your sitemap has been successfully validated. All URLs are W3C compliant.
			</Alert>

			<Alert variant="error" title="Validation Error">
				Some URLs in your sitemap failed validation. Please check the detailed report.
			</Alert>

			<Alert variant="warning" title="Warning">
				Your sitemap contains some warnings that should be addressed for better SEO.
			</Alert>

			<Alert variant="info" title="Information">
				The validation process is complete. You can now download your report.
			</Alert>

			<Alert variant="info" title="Dismissible Alert" dismissible>
				This alert can be dismissed by clicking the X button.
			</Alert>
		</div>
	</section>

	<!-- Typography Section -->
	<section class="mb-16">
		<h2 class="heading-2 mb-8">Typography</h2>
		
		<Card variant="default" padding="lg">
			<div class="space-y-6">
				<div>
					<h1 class="heading-1">Heading 1 - Main Title</h1>
					<h2 class="heading-2">Heading 2 - Section Title</h2>
					<h3 class="heading-3">Heading 3 - Subsection</h3>
					<h4 class="heading-4">Heading 4 - Card Title</h4>
				</div>

				<div>
					<p class="text-lg">Large text for important content and lead paragraphs.</p>
					<p class="text-base">Base text for regular content and body text.</p>
					<p class="text-sm">Small text for captions and secondary information.</p>
					<p class="text-xs">Extra small text for labels and metadata.</p>
					<p class="text-lead">Lead text for introductions and summaries.</p>
				</div>

				<div>
					<p class="text-code">Code text for technical terms and code snippets.</p>
				</div>
			</div>
		</Card>
	</section>

	<!-- Color Palette Section -->
	<section class="mb-16">
		<h2 class="heading-2 mb-8">Color Palette</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<Card variant="default" padding="lg">
				<h3 class="heading-4 mb-4">Primary Colors</h3>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded" style="background: var(--accent-primary);"></div>
						<span class="text-sm">--accent-primary (#009CFF)</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded" style="background: var(--accent-secondary);"></div>
						<span class="text-sm">--accent-secondary (#FFCC00)</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded" style="background: var(--accent-soft);"></div>
						<span class="text-sm">--accent-soft (#FFF6E2)</span>
					</div>
				</div>
			</Card>

			<Card variant="default" padding="lg">
				<h3 class="heading-4 mb-4">Semantic Colors</h3>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded" style="background: var(--success);"></div>
						<span class="text-sm">--success (#31EC56)</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded" style="background: var(--error);"></div>
						<span class="text-sm">--error (#EF036C)</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded" style="background: var(--text-main);"></div>
						<span class="text-sm">--text-main (#20304B)</span>
					</div>
				</div>
			</Card>

			<Card variant="default" padding="lg">
				<h3 class="heading-4 mb-4">Background Colors</h3>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded border" style="background: var(--bg-main);"></div>
						<span class="text-sm">--bg-main (#F6F7FB)</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded border" style="background: var(--white);"></div>
						<span class="text-sm">--white (#FFFFFF)</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded" style="background: var(--gray-100);"></div>
						<span class="text-sm">--gray-100 (#F1F3F5)</span>
					</div>
				</div>
			</Card>
		</div>
	</section>
</div>

<style>

	.space-y-4 {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.space-y-6 > * + * {
		margin-top: var(--space-lg);
	}

	.space-y-3 > * + * {
		margin-top: var(--space-sm);
	}
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'subtle' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	type BaseProps = {
		/** Visual style. primary = coral action, secondary = amber, subtle/ghost = quiet. */
		variant?: Variant;
		size?: Size;
		/** Render as a link instead of a button when `href` is provided. */
		href?: string;
		children: Snippet;
	};

	type Props = BaseProps &
		Omit<HTMLButtonAttributes, 'children'> &
		Omit<HTMLAnchorAttributes, 'children' | 'href'>;

	let {
		variant = 'primary',
		size = 'md',
		href,
		class: extraClass = '',
		children,
		...rest
	}: Props = $props();

	const sizeClasses: Record<Size, string> = {
		sm: 'text-sm px-4 py-2 gap-1.5',
		md: 'text-base px-5 py-2.5 gap-2',
		lg: 'text-lg px-7 py-3.5 gap-2.5'
	};

	const variantClasses: Record<Variant, string> = {
		primary:
			'bg-coral-600 text-white shadow-soft hover:bg-coral-700 hover:shadow-[var(--shadow-coral)] active:bg-coral-700',
		secondary:
			'bg-amber-300 text-ink shadow-soft hover:bg-amber-400 hover:shadow-[var(--shadow-amber)] active:bg-amber-500 active:text-white',
		subtle:
			'bg-paper-raised text-ink ring-1 ring-ink/10 shadow-soft hover:bg-coral-50 hover:ring-coral-200 hover:text-coral-700 active:bg-coral-100',
		ghost:
			'bg-transparent text-coral-600 hover:bg-coral-50 hover:text-coral-700 active:bg-coral-100'
	};

	const base =
		'inline-flex items-center justify-center font-semibold rounded-2xl ' +
		'transition-all duration-200 ease-out select-none ' +
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ' +
		'hover:-translate-y-0.5 active:translate-y-0 ' +
		'disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0';

	const cls = $derived(
		`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${extraClass}`
	);
</script>

{#if href}
	<a {href} class={cls} {...rest as HTMLAnchorAttributes}>
		{@render children()}
	</a>
{:else}
	<button class={cls} {...rest as HTMLButtonAttributes}>
		{@render children()}
	</button>
{/if}

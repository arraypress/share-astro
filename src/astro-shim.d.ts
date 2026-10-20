/**
 * @module astro-shim
 *
 * Ambient declaration so plain `tsc --noEmit` can typecheck without
 * choking on `.astro` extensions. Astro's Vite plugin resolves the
 * real component factory at runtime.
 */
declare module '*.astro' {
	const component: (_props: Record<string, unknown>) => unknown;
	export default component;
}

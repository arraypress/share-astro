/**
 * @module @arraypress/share-astro
 *
 * Share buttons for Astro: the device's share sheet, the networks people use
 * now (X, Bluesky, Threads, LinkedIn, WhatsApp, …) and copy link. Inline SVG,
 * zero dependencies, no third-party requests, CSP-safe.
 *
 * ```astro
 * ---
 * import { Share } from '@arraypress/share-astro';
 * ---
 * <Share title={post.data.title} />
 * ```
 *
 * The link builders are also exported without the component, for endpoints,
 * emails or anything else: `@arraypress/share-astro/links`.
 */
export { default as Share } from './Share.astro';
export { shareLinks, shareHref, taggedUrl, NETWORKS, DEFAULT_NETWORKS, LABELS } from './links';
export type { Network, ShareInput, ShareLink } from './links';
export type { ShareProps } from './types';
export { icons } from './icons';

/**
 * @module types
 *
 * Props for <Share>.
 */
import type { Network, ShareInput } from './links';

export interface ShareProps extends Omit<ShareInput, 'url'> {
	/** The URL to share. Default: the page's canonical URL (Astro.site + pathname). */
	url?: string;
	/** Which buttons, in order. Default: native, X, Bluesky, Threads, LinkedIn, Facebook, WhatsApp, email, copy. */
	networks?: Network[];
	/**
	 * The device's share sheet (navigator.share) — iMessage, WhatsApp,
	 * AirDrop, Signal… in one tap. 'add' (default): shown where supported,
	 * beside the links. 'replace': where supported it is the ONLY network
	 * button (copy stays). false: never.
	 */
	native?: 'add' | 'replace' | false;
	/** Show each network's name beside its icon. Default false (icons, with aria-labels). */
	labels?: boolean;
	/** Icon size in px. Default 20. */
	size?: number;
	/** The list's accessible name. Default 'Share'. */
	label?: string;
	/** Announced after a copy. Default 'Link copied'. */
	copiedLabel?: string;
	/** Drop the built-in button look; style everything with `itemClass`. */
	unstyled?: boolean;
	/** Classes on every button / link — e.g. your theme's utility classes. */
	itemClass?: string;
	class?: string;
}

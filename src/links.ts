/**
 * @module links
 *
 * Share-link builders: what each network's "share this" URL looks like.
 * No Astro, no DOM — import `@arraypress/share-astro/links` from anywhere
 * (an endpoint, an email template, a test).
 *
 * ```ts
 * import { shareLinks } from '@arraypress/share-astro/links';
 * shareLinks({ url: 'https://example.com/post', title: 'A post' }, ['x', 'whatsapp']);
 * // → [{ id: 'x', label: 'X', href: 'https://x.com/intent/post?…' }, …]
 * ```
 *
 * Two networks have no link at all, and that's deliberate:
 *   - `native` is the device's own share sheet (navigator.share) — it is how
 *     a phone reaches iMessage, WhatsApp, AirDrop, Signal and the rest in one
 *     tap, and the component handles it in the browser.
 *   - `copy` copies the URL.
 *
 * Mastodon needs the reader's own server (there is no central share URL), so
 * it only builds when you pass `mastodon: 'mastodon.social'`; otherwise it
 * is skipped. The `sms:` link is the only way to prefill iMessage / Messages
 * from the web — `sms:?&body=` is the form both iOS and Android accept.
 */

/** Every network the package knows. */
export const NETWORKS = [
	'native',
	'x',
	'bluesky',
	'threads',
	'mastodon',
	'linkedin',
	'facebook',
	'reddit',
	'whatsapp',
	'telegram',
	'hackernews',
	'pinterest',
	'email',
	'sms',
	'copy',
] as const;

export type Network = (typeof NETWORKS)[number];

/** Networks the browser handles (no href). */
export const ACTIONS: readonly Network[] = ['native', 'copy'];

/** The default set — the ones people actually share to in 2026. */
export const DEFAULT_NETWORKS: Network[] = ['native', 'x', 'bluesky', 'threads', 'linkedin', 'facebook', 'whatsapp', 'email', 'copy'];

export interface ShareInput {
	/** The absolute URL being shared. */
	url: string;
	/** The page title — the post text on most networks. */
	title?: string;
	/** A longer line (email body, Pinterest description). Default: title. */
	text?: string;
	/** An image URL — Pinterest only. */
	media?: string;
	/** X handle to credit, without the @. */
	via?: string;
	/** Hashtags for X, without the #. */
	hashtags?: string[];
	/** The reader's Mastodon server, e.g. 'mastodon.social'. Mastodon is skipped without it. */
	mastodon?: string;
	/**
	 * UTM tags added to the shared URL. `source` defaults to the network id,
	 * so analytics can tell a WhatsApp share from a LinkedIn one.
	 */
	utm?: { medium?: string; campaign?: string; source?: string };
}

export interface ShareLink {
	id: Network;
	/** The visible / accessible name: "X", "WhatsApp", "Copy link". */
	label: string;
	/** Undefined for `native` and `copy`, which are buttons. */
	href?: string;
	/** The (UTM-tagged) URL the link shares — what `copy` copies. */
	url: string;
}

export const LABELS: Record<Network, string> = {
	native: 'Share',
	x: 'X',
	bluesky: 'Bluesky',
	threads: 'Threads',
	mastodon: 'Mastodon',
	linkedin: 'LinkedIn',
	facebook: 'Facebook',
	reddit: 'Reddit',
	whatsapp: 'WhatsApp',
	telegram: 'Telegram',
	hackernews: 'Hacker News',
	pinterest: 'Pinterest',
	email: 'Email',
	sms: 'Messages',
	copy: 'Copy link',
};

const enc = encodeURIComponent;

/** Build a query string, dropping empty values. */
function qs(params: Record<string, string | undefined>): string {
	return Object.entries(params)
		.filter((entry): entry is [string, string] => Boolean(entry[1]))
		.map(([k, v]) => `${k}=${enc(v)}`)
		.join('&');
}

/** The URL with UTM tags for one network (unchanged when `utm` is unset). */
export function taggedUrl(input: ShareInput, network: Network): string {
	if (!input.utm) return input.url;
	try {
		const u = new URL(input.url);
		u.searchParams.set('utm_source', input.utm.source ?? network);
		if (input.utm.medium) u.searchParams.set('utm_medium', input.utm.medium);
		if (input.utm.campaign) u.searchParams.set('utm_campaign', input.utm.campaign);
		return u.toString();
	} catch {
		return input.url;
	}
}

/** "Title url" — the one-box networks (Bluesky, Threads, WhatsApp, …) take a single text. */
const textWithUrl = (title: string | undefined, url: string): string => (title ? `${title} ${url}` : url);

/** Normalise a Mastodon server: 'https://mastodon.social/' → 'mastodon.social'. */
const host = (server: string): string => server.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

/**
 * The share href for one network, or undefined when it has none (`native`,
 * `copy`) or can't be built (`mastodon` without a server).
 */
export function shareHref(network: Network, input: ShareInput): string | undefined {
	const url = taggedUrl(input, network);
	const { title, media, via, hashtags, mastodon } = input;
	const text = input.text ?? title;
	switch (network) {
		case 'x':
			return `https://x.com/intent/post?${qs({ url, text: title, via, hashtags: hashtags?.join(',') })}`;
		case 'bluesky':
			return `https://bsky.app/intent/compose?${qs({ text: textWithUrl(title, url) })}`;
		case 'threads':
			return `https://www.threads.com/intent/post?${qs({ text: textWithUrl(title, url) })}`;
		case 'mastodon':
			return mastodon ? `https://${host(mastodon)}/share?${qs({ text: textWithUrl(title, url) })}` : undefined;
		case 'linkedin':
			return `https://www.linkedin.com/sharing/share-offsite/?${qs({ url })}`;
		case 'facebook':
			return `https://www.facebook.com/sharer/sharer.php?${qs({ u: url })}`;
		case 'reddit':
			return `https://www.reddit.com/submit?${qs({ url, title })}`;
		case 'whatsapp':
			return `https://wa.me/?${qs({ text: textWithUrl(title, url) })}`;
		case 'telegram':
			return `https://t.me/share/url?${qs({ url, text: title })}`;
		case 'hackernews':
			return `https://news.ycombinator.com/submitlink?${qs({ u: url, t: title })}`;
		case 'pinterest':
			return `https://pinterest.com/pin/create/button/?${qs({ url, media, description: text })}`;
		case 'email':
			return `mailto:?${qs({ subject: title, body: textWithUrl(text === title ? undefined : text, url) })}`;
		case 'sms':
			return `sms:?&${qs({ body: textWithUrl(title, url) })}`;
		default:
			return undefined;
	}
}

/**
 * Links for a list of networks, in the order given. Unknown ids and links
 * that can't be built (Mastodon without a server) are dropped; `native` and
 * `copy` come back without an href.
 */
export function shareLinks(input: ShareInput, networks: readonly Network[] = DEFAULT_NETWORKS): ShareLink[] {
	return networks
		.filter((id): id is Network => (NETWORKS as readonly string[]).includes(id))
		.map((id) => ({ id, label: LABELS[id], href: shareHref(id, input), url: taggedUrl(input, id) }))
		.filter((link) => link.href !== undefined || ACTIONS.includes(link.id));
}

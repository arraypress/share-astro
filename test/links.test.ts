/**
 * test/links.test.ts — the share-link builders.
 */
import { describe, it, expect } from 'vitest';
import { shareHref, shareLinks, taggedUrl, NETWORKS, DEFAULT_NETWORKS } from '../src/links';
import { icons } from '../src/icons';

const input = { url: 'https://example.com/a post?x=1', title: 'Ten tools & tips' };
const q = (href: string) => new URL(href).searchParams;

describe('shareHref', () => {
	it('encodes the URL and title for X, with via and hashtags', () => {
		const href = shareHref('x', { ...input, via: 'margin', hashtags: ['seo', 'tools'] })!;
		expect(href.startsWith('https://x.com/intent/post?')).toBe(true);
		expect(q(href).get('url')).toBe(input.url);
		expect(q(href).get('text')).toBe(input.title);
		expect(q(href).get('via')).toBe('margin');
		expect(q(href).get('hashtags')).toBe('seo,tools');
	});

	it('puts title and URL in one text for single-box networks', () => {
		for (const n of ['bluesky', 'threads', 'whatsapp'] as const) {
			expect(q(shareHref(n, input)!).get('text')).toBe(`${input.title} ${input.url}`);
		}
	});

	it('uses each network’s own parameter names', () => {
		expect(q(shareHref('facebook', input)!).get('u')).toBe(input.url);
		expect(q(shareHref('linkedin', input)!).get('url')).toBe(input.url);
		expect(q(shareHref('reddit', input)!).get('title')).toBe(input.title);
		expect(q(shareHref('hackernews', input)!).get('t')).toBe(input.title);
		expect(q(shareHref('telegram', input)!).get('url')).toBe(input.url);
	});

	it('only builds Mastodon with a server, normalising it', () => {
		expect(shareHref('mastodon', input)).toBeUndefined();
		expect(shareHref('mastodon', { ...input, mastodon: 'https://mastodon.social/' })!.startsWith('https://mastodon.social/share?')).toBe(true);
	});

	it('builds mailto and sms links that prefill the body', () => {
		const mail = shareHref('email', { ...input, text: 'Worth a read' })!;
		expect(mail.startsWith('mailto:?')).toBe(true);
		expect(decodeURIComponent(mail)).toContain('subject=Ten tools & tips');
		expect(decodeURIComponent(mail)).toContain(`body=Worth a read ${input.url}`);
		expect(shareHref('sms', input)!.startsWith('sms:?&body=')).toBe(true);
	});

	it('includes media on Pinterest only when given', () => {
		expect(q(shareHref('pinterest', input)!).has('media')).toBe(false);
		expect(q(shareHref('pinterest', { ...input, media: 'https://example.com/i.png' })!).get('media')).toBe('https://example.com/i.png');
	});

	it('has no href for the browser actions', () => {
		expect(shareHref('native', input)).toBeUndefined();
		expect(shareHref('copy', input)).toBeUndefined();
	});
});

describe('taggedUrl', () => {
	it('leaves the URL alone without utm', () => {
		expect(taggedUrl(input, 'x')).toBe(input.url);
	});
	it('tags the source as the network by default', () => {
		const u = new URL(taggedUrl({ ...input, utm: { medium: 'social', campaign: 'launch' } }, 'whatsapp'));
		expect(u.searchParams.get('utm_source')).toBe('whatsapp');
		expect(u.searchParams.get('utm_medium')).toBe('social');
		expect(u.searchParams.get('utm_campaign')).toBe('launch');
		expect(u.searchParams.get('x')).toBe('1');
	});
	it('returns an unparseable URL unchanged', () => {
		expect(taggedUrl({ url: 'not a url', utm: {} }, 'x')).toBe('not a url');
	});
});

describe('shareLinks', () => {
	it('keeps order, drops unknowns and unbuildable links', () => {
		const ids = shareLinks(input, ['copy', 'mastodon', 'nope' as never, 'x']).map((l) => l.id);
		expect(ids).toEqual(['copy', 'x']);
	});
	it('defaults to the default set', () => {
		expect(shareLinks(input).map((l) => l.id)).toEqual(DEFAULT_NETWORKS);
	});
	it('gives copy the tagged URL', () => {
		const copy = shareLinks({ ...input, utm: {} }, ['copy'])[0];
		expect(new URL(copy.url).searchParams.get('utm_source')).toBe('copy');
	});
});

describe('icons', () => {
	it('has an icon for every network, plus the copied check', () => {
		for (const n of NETWORKS) expect(icons[n]?.body).toMatch(/^<path/);
		expect(icons.copied.kind).toBe('stroke');
	});
});

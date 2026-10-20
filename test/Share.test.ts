/**
 * test/Share.test.ts — what <Share> renders.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ShareRaw from '../src/Share.astro';
import type { ShareProps } from '../src/types';

const Share = ShareRaw as Parameters<AstroContainer['renderToString']>[0];
let container: AstroContainer;
beforeAll(async () => {
	container = await AstroContainer.create();
});
const render = (props: ShareProps = {}) => container.renderToString(Share, { props: { url: 'https://example.com/p', ...props } as unknown as Record<string, unknown> });

describe('<Share>', () => {
	it('renders a labelled list of links that open safely', async () => {
		const html = await render({ title: 'Hi', networks: ['x', 'whatsapp'] });
		expect(html).toContain('aria-label="Share"');
		expect(html).toContain('aria-label="Share on X"');
		expect(html).toContain('aria-label="Share on WhatsApp"');
		expect(html.match(/rel="noopener noreferrer"/g)).toHaveLength(2);
		expect(html.match(/target="_blank"/g)).toHaveLength(2);
	});

	it('does not open email or sms in a new tab, and names them naturally', async () => {
		const html = await render({ networks: ['email', 'sms'] });
		expect(html).not.toContain('target="_blank"');
		expect(html).toContain('aria-label="Share by email"');
		expect(html).toContain('aria-label="Share by text message"');
	});

	it('renders native and copy hidden until the script reveals them', async () => {
		const html = await render({ networks: ['native', 'copy'] });
		expect(html).toMatch(/data-ap-share-native-item[^>]*hidden/);
		expect(html).toMatch(/data-ap-share-copy-item[^>]*hidden/);
		expect(html).toContain('data-ap-share-action="native"');
		expect(html).toContain('data-ap-share-action="copy"');
	});

	it('drops the native button with native={false}', async () => {
		const html = await render({ native: false });
		expect(html).not.toContain('data-ap-share-action="native"');
	});

	it('marks replace mode for the script', async () => {
		expect(await render({ native: 'replace' })).toContain('data-ap-share-native="replace"');
	});

	it('shows names and drops aria-labels with labels', async () => {
		const html = await render({ networks: ['x'], labels: true });
		expect(html).toMatch(/<span[^>]*>X<\/span>/);
		expect(html).not.toContain('aria-label="Share on X"');
	});

	it('passes itemClass through and can drop the built-in look', async () => {
		const html = await render({ networks: ['x'], itemClass: 'my-btn', unstyled: true });
		expect(html).toContain('class="my-btn"');
		expect(html).not.toContain('ap-share-item');
	});

	it('has a live region for copy feedback', async () => {
		expect(await render()).toMatch(/role="status"[^>]*data-ap-share-status/);
	});
});

/**
 * @module client
 *
 * The browser half of <Share>: the native share sheet and copy link. Bundled
 * by Astro from the component's <script>, so it runs once per page load
 * however many <Share> rows a page has; clicks are delegated from document,
 * and the native buttons are revealed on every `astro:page-load` (View
 * Transitions swap the DOM, the listener stays).
 *
 * Progressive: without JS the native and copy buttons stay hidden (they're
 * rendered `hidden`), and the network links still work.
 */

const COPIED_MS = 2000;

/** Can this browser open the OS share sheet for a URL? */
function canShareNatively(url: string): boolean {
	if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
	try {
		return typeof navigator.canShare !== 'function' || navigator.canShare({ url });
	} catch {
		return false;
	}
}

/** Reveal what JS makes possible: copy everywhere, native where supported. */
export function revealShare(root: ParentNode = document): void {
	root.querySelectorAll<HTMLElement>('[data-ap-share]').forEach((row) => {
		const url = row.dataset.apShareUrl ?? location.href;
		const native = canShareNatively(url);
		row.querySelectorAll<HTMLElement>('[data-ap-share-copy-item]').forEach((li) => (li.hidden = false));
		row.querySelectorAll<HTMLElement>('[data-ap-share-native-item]').forEach((li) => (li.hidden = !native));
		/* native="replace": the share sheet stands in for the network links. */
		if (native && row.dataset.apShareNative === 'replace') {
			row.querySelectorAll<HTMLElement>('[data-ap-share-link-item]').forEach((li) => (li.hidden = true));
		}
	});
}

/** Copy text, falling back to a hidden textarea where the async API is blocked. */
async function copyText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const area = document.createElement('textarea');
		area.value = text;
		area.setAttribute('readonly', '');
		area.style.position = 'fixed';
		area.style.opacity = '0';
		document.body.append(area);
		area.select();
		let ok = false;
		try {
			ok = document.execCommand('copy');
		} catch {
			ok = false;
		}
		area.remove();
		return ok;
	}
}

function announce(row: Element | null, text: string): void {
	const status = row?.querySelector('[data-ap-share-status]');
	if (!status) return;
	status.textContent = '';
	/* A fresh text node each time so repeat copies are announced. */
	requestAnimationFrame(() => (status.textContent = text));
}

async function onClick(event: MouseEvent): Promise<void> {
	const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-ap-share-action]');
	if (!button) return;
	const row = button.closest<HTMLElement>('[data-ap-share]');
	const url = button.dataset.url ?? row?.dataset.apShareUrl ?? location.href;

	if (button.dataset.apShareAction === 'native') {
		try {
			await navigator.share({ url, title: button.dataset.title || undefined, text: button.dataset.text || undefined });
		} catch {
			/* Dismissed (AbortError) or refused — nothing to report. */
		}
		return;
	}

	if (button.dataset.apShareAction === 'copy') {
		const ok = await copyText(url);
		announce(row, ok ? (row?.dataset.apShareCopied ?? 'Link copied') : "Couldn't copy the link");
		if (!ok) return;
		button.dataset.copied = 'true';
		window.setTimeout(() => delete button.dataset.copied, COPIED_MS);
	}
}

/** Bind once per page (the bundled module runs once). */
export function initShare(): void {
	document.addEventListener('click', (e) => void onClick(e));
	document.addEventListener('astro:page-load', () => revealShare());
	revealShare();
}

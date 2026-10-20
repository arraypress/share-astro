# @arraypress/share-astro

> Share buttons for Astro: the device's own share sheet, the networks people
> actually use, and copy link. Inline SVG, zero dependencies, no third-party
> requests, CSP-safe.

- **The native share sheet** (`navigator.share`) where the device has one.
  That's how a phone reaches iMessage, WhatsApp, AirDrop, Signal, Slack and
  everything else in one tap. It's hidden where it isn't supported.
- **15 networks:** X, Bluesky, Threads, Mastodon, LinkedIn, Facebook, Reddit,
  WhatsApp, Telegram, Hacker News, Pinterest, email, Messages (SMS), copy link
  and the share sheet.
- **Nothing loads from the networks.** The icons are inline SVG and the links
  are plain links, so there are no widgets, no tracking pixels and no CSP
  entries.
- **Accessible:** a labelled list, an aria-label on every icon-only button, a
  live region that announces "Link copied", and visible focus.
- **Styles that get out of the way.** Every built-in rule has zero specificity,
  so your own classes win without `!important`.

## Install

```bash
npm install @arraypress/share-astro
```

## Use

```astro
---
import { Share } from '@arraypress/share-astro';
---
<Share title={post.data.title} />
```

The URL defaults to the page's canonical URL (`Astro.site` + the path), so set
`site` in `astro.config.mjs`.

```astro
<!-- Pick the networks and their order -->
<Share networks={['native', 'whatsapp', 'bluesky', 'linkedin', 'copy']} />

<!-- On phones, just the share sheet (plus copy) -->
<Share native="replace" />

<!-- Names beside the icons -->
<Share labels />

<!-- Your own button styles -->
<Share unstyled itemClass="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-card-2" />

<!-- Tag shares for analytics: utm_source is the network -->
<Share utm={{ medium: 'social', campaign: 'launch' }} />
```

## Props

| Prop | Default | |
|---|---|---|
| `url` | canonical URL | The URL to share. |
| `title` | — | Post text on most networks; the email subject. |
| `text` | `title` | A longer line, used in the email body and the Pinterest description. |
| `networks` | native, x, bluesky, threads, linkedin, facebook, whatsapp, email, copy | Which buttons, in order. |
| `native` | `'add'` | `'add'` shows the share sheet button beside the links. `'replace'` shows only it (plus copy) where it's supported. `false` never shows it. |
| `labels` | `false` | Show network names. |
| `size` | `20` | Icon size in px. |
| `label` | `'Share'` | The list's accessible name. |
| `copiedLabel` | `'Link copied'` | Announced after copying. |
| `via` | — | The X handle to credit, without the @. |
| `hashtags` | — | X hashtags, without the #. |
| `media` | — | An image URL, used by Pinterest. |
| `mastodon` | — | The reader's server, e.g. `'mastodon.social'`. Mastodon is skipped without it, because there's no central share URL. |
| `utm` | — | `{ medium, campaign, source }`. `source` defaults to the network id. |
| `unstyled` | `false` | Drop the built-in button look. |
| `itemClass` | — | Classes added to every button and link. |
| `class` | — | Classes on the wrapper. |

CSS variables: `--ap-share-size` (2.5rem), `--ap-share-gap` (0.25rem),
`--ap-share-radius` (999px), `--ap-share-hover`.

## Without the component

The link builders have no Astro or DOM dependency:

```ts
import { shareLinks, shareHref } from '@arraypress/share-astro/links';

shareHref('whatsapp', { url, title });
shareLinks({ url, title }, ['x', 'bluesky', 'email']); // [{ id, label, href, url }]
```

## Notes

- **iMessage has no web share URL.** The share sheet reaches it, and the
  `sms` network prefills Messages (`sms:?&body=`, which iOS and Android both
  accept).
- **Without JavaScript** the share sheet and copy buttons stay hidden, and the
  network links still work.
- **View Transitions:** clicks are delegated from `document`, and the share
  sheet button is re-checked on every `astro:page-load`.

## Licence

MIT. Brand icons are from Simple Icons (CC0), and the generic glyphs are from
Lucide (ISC). See LICENSE.

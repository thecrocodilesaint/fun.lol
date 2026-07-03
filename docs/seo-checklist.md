# slapz.lol SEO Checklist

## Google Search Console

- Verify `https://slapz.lol` in Google Search Console.
- Submit `https://slapz.lol/sitemap.xml`.
- Use URL Inspection for `https://slapz.lol/`.
- Request indexing for the homepage after deployment.
- Inspect important landing pages:
  - `https://slapz.lol/features`
  - `https://slapz.lol/custom-bio-pages`
  - `https://slapz.lol/slappers`
  - `https://slapz.lol/tribes`
  - `https://slapz.lol/games`
  - `https://slapz.lol/about`
  - `https://slapz.lol/help`
- Inspect a published public profile URL, such as `https://slapz.lol/u/example`.
- Confirm private or hidden profiles are not indexed.

## Crawling And Indexing

- Open `https://slapz.lol/robots.txt` and confirm it points to the sitemap.
- Open `https://slapz.lol/sitemap.xml` and confirm it includes public pages and published public profiles only.
- Confirm dashboard, settings, owner/admin, reset password, and API routes are not listed in the sitemap.
- Confirm private profiles return `noindex,nofollow` metadata.

## Rich Results And Social Sharing

- Test the homepage in Google Rich Results Test.
- Test the homepage and a public profile with a social sharing preview/debugger.
- Confirm Open Graph and Twitter/X card tags show the correct title, description, URL, and image.
- Confirm the default OG image loads at `/assets/slapz-og-image.png`.

## Mobile And Performance

- Run Google Lighthouse on the homepage.
- Check Core Web Vitals in Search Console after traffic appears.
- Test mobile friendliness at 360px, 390px, 430px, 768px, 1024px, and desktop widths.
- Confirm no horizontal scrolling on public pages.
- Confirm homepage text appears quickly and is not blocked by animations.

## Content Maintenance

- Keep page titles unique.
- Keep meta descriptions specific and under roughly 160 characters when possible.
- Add new public feature pages to the sitemap when they become crawlable.
- Avoid adding private dashboard or API URLs to the sitemap.

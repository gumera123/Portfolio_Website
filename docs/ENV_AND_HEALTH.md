## Cloudflare Pages deployment

- Build command: `npm run build`
- Output directory: `dist`
- SPA routing: handled by `public/_redirects`
- Custom domain: add `gumerajorry.com` in the Cloudflare Pages dashboard, then point your registrar DNS to Cloudflare

## Free contact form

- Use a free form backend such as Formspree
- Set `VITE_CONTACT_ENDPOINT` in Cloudflare Pages environment variables to your form endpoint
- Local development still works with the fallback `/api/inquiry` route


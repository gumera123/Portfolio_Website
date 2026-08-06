# Deployment

## Cloudflare Pages

This portfolio is a fully static site — no server component.

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **SPA routing:** handled by `public/_redirects` (all paths rewrite to `/index.html`), so deep links like `https://gumerajorry.com/projects` work on refresh.
- **App router:** `BrowserRouter` — clean URLs, no `#` in the address bar.
- **Custom domain:** add the domain in the Cloudflare Pages dashboard (Workers & Pages → your project → Custom domains), then point your registrar's DNS to Cloudflare.

## Local development

```bash
npm install
npm run dev        # http://127.0.0.1:5173
```

## Local production preview

```bash
npm run build
npm run preview    # http://127.0.0.1:4173
```

## Notes

- No `.env` file is required. Secrets are not part of this project.
- `server.cjs` / `scripts/` / the old SMTP contact form were removed — the contact page is email + GitHub links only.
- Test suite (if present): `npx jest`

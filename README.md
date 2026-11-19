# Nebula Proxy

A Google-inspired Nebula homepage with a Node.js backend for **approved-site text previews**.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm start
```

Open http://localhost:3000.

Type a normal search to open Google Search, or enter `https://example.com` to preview page text.

## Important limitations

This is **not** an unrestricted browsing proxy. It only fetches approved HTTPS hosts in `server.js`, blocks redirects, and displays text (not interactive websites). For public hosting, add production-grade request limits, response streaming size limits, DNS/IP checks, and deployment hardening. GitHub Pages cannot run the Node.js backend.

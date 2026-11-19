# Nebula Browser

A browser-style web application with tabs, address bar, navigation, refresh, bookmarks and embedded web previews.

## Run

Requires Node.js 20+.

```bash
npm install
npm start
```

Open http://localhost:3000. On Windows PowerShell where npm.ps1 is blocked, use `npm.cmd install` and `npm.cmd start`.

## Features

- Tabs, new tab, close tab, back, forward, refresh and home
- Address bar that recognizes HTTPS/HTTP addresses and searches other input
- Wikipedia-powered search results shown inside Nebula
- Bookmarks stored in the current browser's localStorage
- Iframe previews of websites that allow embedding, plus a link to open the original

## Limitations

This is a website, **not a full browser engine or universal proxy**. Many websites block embedding with CSP or X-Frame-Options, and iframe navigation is restricted by the browser's same-origin policy. A frame may appear blank or show an error. Use the “Open original site” link for such websites. Browser back/forward navigates Nebula's own top-level entries, not internal clicks inside third-party iframes.

The existing Node backend includes an approved-host text preview API at `/api/proxy`; it is not used to bypass site embedding protections. This project does not claim private browsing or anonymity. Render can host the Node.js app; GitHub Pages alone cannot.

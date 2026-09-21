# Notes / To‑Do Next.js Starter

Quick starter for a Next.js notes/todo app with MongoDB and Tailwind.

Getting started

1. Install dependencies

```bash
npm install
```

2. Copy environment example and set your MongoDB URI

```bash
cp .env.example .env.local
# edit .env.local and set MONGODB_URI
```

3. Run dev server

```bash
npm run dev
```

Notes about PostCSS audit

- `npm audit` suggested forcing an upgrade that would move `next` to v16 (breaking change).
- To avoid that, this project pins a patched `postcss` via `overrides` in `package.json` so you can `npm install` without forcing Next.js to upgrade.

If you prefer to follow the audit fix and accept breaking upgrades, run `npm audit fix --force`.

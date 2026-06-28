# IPTV LUX 2.0

Premium IPTV channel browser — built with SvelteKit.

## Quick start

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run preview
```

## Data pipeline

The data pipeline preprocesses raw CSV files from `data/` into an optimized JSON store in `generated/`. The frontend only reads from `generated/`.

```bash
npm run data
```

The pipeline runs automatically on `npm run build`.

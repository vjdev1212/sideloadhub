# SideloadHub

SideloadHub is a centralized catalog for iOS apps distributed through public GitHub releases. It tracks releases and IPA assets as metadata and exposes an AltStore/SideStore-compatible source.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (Neon/Supabase compatible)
- GitHub REST API
- Vercel-friendly server routes and cron

## Environment

Copy `.env.example` to `.env.local` and configure PostgreSQL and optional GitHub/authentication secrets.

## Development

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Source

The public source endpoint is `/api/source.json`. It is intentionally generated server-side; IPA binaries are never stored by SideloadHub and download links point at the original GitHub release assets.

## Architecture

GitHub imports and synchronization belong in server-side services. The database is the cache of record, so normal frontend requests do not query GitHub. Source generation validates records before inclusion so a broken repository cannot invalidate the complete catalog.

## Roadmap

- GitHub repository import and release synchronization
- `.altstore.json` developer configuration
- PostgreSQL-backed source generation
- webhook + Vercel Cron synchronization
- approval workflow and protected admin area
- source health/validation
- version history and release notes
- SEO, sitemap, accessibility and production hardening

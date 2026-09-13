# SideloadHub

SideloadHub is a centralized catalog for iOS apps distributed through public GitHub releases. It tracks releases and IPA assets as metadata and exposes an AltStore/SideStore-compatible source.

## Free-tier deployment

The recommended $0 setup is:

- **Vercel Hobby** for the Next.js application
- **Supabase Free** for PostgreSQL
- **GitHub Actions** for the 15-minute sync fallback
- **GitHub webhooks** for near-immediate release updates

Supabase Free currently includes a 500 MB Postgres database, 5 GB egress, and 1 GB file storage. Free projects can pause after inactivity, so keeping the GitHub sync workflow enabled is useful. Vercel Hobby supports a native daily cron, while the repository's GitHub Actions workflow handles more frequent syncs without requiring Vercel Pro.

### Vercel

1. Import this GitHub repository into Vercel.
2. Add the environment variables from `.env.example`.
3. Deploy.
4. Keep the generated Vercel URL for the GitHub Actions `SITE_URL` variable.

### Supabase

Create one Free project and use its Postgres connection URLs for `DATABASE_URL` and `DIRECT_URL`.

### GitHub Actions sync

In the SideloadHub repository settings, create:

- Repository variable `SITE_URL` = your deployed Vercel URL, without a trailing slash.
- Repository secret `CRON_SECRET` = the same value configured on Vercel.

The workflow in `.github/workflows/sync.yml` calls `/api/cron/sync` every 15 minutes. Standard GitHub-hosted runners are free for public repositories.

### GitHub webhook

Configure a GitHub webhook on each tracked app repository:

- Payload URL: `https://YOUR_DOMAIN/api/webhooks/github`
- Content type: `application/json`
- Secret: the same `GITHUB_WEBHOOK_SECRET` configured on Vercel
- Events: **Release**

A published release can therefore update SideloadHub immediately, while GitHub Actions provides a periodic fallback.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- GitHub REST API
- Vercel server routes
- GitHub Actions scheduler

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

## Current deployment model

Release flow:

`GitHub release -> webhook -> SideloadHub sync -> PostgreSQL -> AltStore/SideStore source`

Fallback flow:

`GitHub Actions -> /api/cron/sync -> PostgreSQL -> source`

## Remaining production work

- protected admin dashboard and approval UI
- additional source-health tooling
- automated integration tests
- final SEO/accessibility hardening

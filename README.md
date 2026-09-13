# SideloadHub

SideloadHub is a centralized catalog for iOS apps distributed through public GitHub releases. It tracks release and IPA metadata without storing IPA binaries. Each imported repository gets its own AltStore/SideStore feed with the five newest valid versions.

## Free-tier deployment

The recommended $0 setup is:

- **Vercel Hobby** for the Next.js application
- **Neon Free** for PostgreSQL
- **GitHub Actions** for the 15-minute sync fallback
- **GitHub webhooks** for near-immediate release updates
- **GitHub Releases** as the binary host

### Vercel

1. Import this GitHub repository into Vercel.
2. Add the environment variables from `.env.example`.
3. Deploy with the repository root as the Root Directory.
4. Use `npx prisma generate && npx prisma db push && next build` as the initial Build Command.

### Neon

Create one Neon project and use its PostgreSQL connection string for `DATABASE_URL` and `DIRECT_URL`. No application tables need to be created manually; Prisma creates them from `prisma/schema.prisma` during the initial deployment.

### GitHub token and webhook

`GITHUB_TOKEN` is recommended for higher GitHub API limits.

Configure a webhook on each tracked repository:

- Payload URL: `https://YOUR_DOMAIN/api/webhooks/github`
- Content type: `application/json`
- Secret: the same `GITHUB_WEBHOOK_SECRET` configured on Vercel
- Events: **Release**

A published release can therefore update SideloadHub immediately, while GitHub Actions provides a periodic fallback.

### GitHub Actions sync

In the SideloadHub repository settings, create:

- Repository variable `SITE_URL` = your deployed Vercel URL, without a trailing slash.
- Repository secret `CRON_SECRET` = the same value configured on Vercel.

The workflow in `.github/workflows/sync.yml` calls `/api/cron/sync` every 15 minutes.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- GitHub REST API
- Vercel server routes
- GitHub Actions scheduler
- Optional Google authentication via Auth.js

## Environment

Copy `.env.example` to `.env.local` and configure PostgreSQL, GitHub, webhook, cron, and optional Google authentication credentials.

For Google sign-in, configure:

- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

## Development

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Repository feeds

Each tracked repository exposes its own AltStore/SideStore JSON feed:

`https://YOUR_DOMAIN/{repository_name}/altstore.json`

For example:

`https://sideloadhub.vercel.app/itorrent/altstore.json`

The feed contains only that repository's app and at most its five newest valid versions. IPA `downloadURL` values point directly to GitHub release assets; SideloadHub does not store or proxy IPA binaries.

The app details page also shows a **Download IPA** button for every available IPA asset in version history.

## Catalog behavior

The homepage shows:

- the **10 newest repositories**
- **Top Starred Apps** based on community ratings
- a single **Add Repository** action

There is no global source page and no approval queue. Importing a valid public GitHub repository makes it eligible for the catalog immediately.

## Release flow

`GitHub release -> webhook -> SideloadHub sync -> PostgreSQL -> repository-specific altstore.json`

Fallback flow:

`GitHub Actions -> /api/cron/sync -> PostgreSQL -> repository-specific altstore.json`

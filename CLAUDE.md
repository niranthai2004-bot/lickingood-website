@AGENTS.md

# LickinGood Website

A donut shop website. Built with Next.js (App Router) + TypeScript + Tailwind CSS. Deployed to Vercel.

## Project facts

- **Product:** Marketing + ordering site for the LickinGood donut shop.
- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, ESLint. Source lives under `src/`.
- **Hosting:** Vercel — connected to the `lickingood-website` GitHub repo. Pushes to the default branch trigger a production deploy; pushes to other branches create preview deployments.
- **Repo:** GitHub `lickingood-website`.

## Working agreement with Claude

- Claude has standing permission to **read and edit files anywhere in this directory** to keep the project in sync. No need to ask before editing source, config, or content files.
- Claude should still **ask before destructive or shared-state actions**: deleting files, force-pushing, rewriting git history, dropping branches, or anything that affects the GitHub remote or Vercel deployment.
- Commits and pushes are **not** authorized by default — ask before running `git commit` or `git push`.

## Conventions

- App Router pages live under `src/app/`.
- Tailwind is the styling system; avoid adding a second CSS framework.
- Keep components colocated with the route that uses them until reuse forces a move to `src/components/`.

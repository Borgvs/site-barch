# AGENTS.md

## Cursor Cloud specific instructions

This workspace contains **three independent git repositories** under `/agent/repos/`:

| Repo | Path | Dev command | Port |
|------|------|-------------|------|
| **site-barch** | `/agent/repos/site-barch` | `npm run dev` | 3001 |
| **painel-barch** | `/agent/repos/painel-barch` | `npm run dev` | 3000 |
| **Barch (Files API)** | `/agent/repos/Barch` | `python3 app.py` | 5000 |

There is no root `docker-compose` or monorepo orchestrator — start each service from its own directory.

### site-barch (marketing site)

Self-contained; no external services required for local dev. See `README.md`.

```bash
cd /agent/repos/site-barch && npm run dev   # http://localhost:3001
```

### painel-barch (construction management panel)

Requires `.env.local` with Supabase credentials before the dev server can serve pages (middleware creates a Supabase client on every request). Copy from `.env.example` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for login OTP via `/api/auth/send-magic-link`)
- `RESEND_API_KEY` (required for magic-link email delivery)

Without these, `npm run dev` starts but all routes return HTTP 500 from middleware. `npm run build` and `npm run types` work without env vars.

**Cursor secrets → `.env.local`:** When secrets are injected as environment variables, write them into `painel-barch/.env.local` (gitignored) and restart the dev server. Values must be **real API keys from the Supabase and Resend dashboards**, not placeholder text or the env-var names themselves. The Supabase URL must start with `https://` and include `.supabase.co`; keys are typically JWTs (`eyJ...`) or publishable keys (`sb_...`); Resend keys start with `re_`. Placeholder values cause middleware error: `Invalid supabaseUrl`.

```bash
cd /agent/repos/painel-barch && npm run dev   # http://localhost:3000
```

### Barch Files API (Flask)

Optional Nextcloud WebDAV credentials (`USERNAME`, `PASSWORD`, `WEBDAV_URL`). `/ping` works without them; file search/list endpoints need a reachable WebDAV server.

```bash
cd /agent/repos/Barch && python3 app.py   # http://localhost:5000
```

### Lint / test / build

| Repo | Lint | Types | Tests | Build |
|------|------|-------|-------|-------|
| site-barch | `npm run lint` (no ESLint config yet — prompts interactively) | `npm run types` | — | `npm run build` |
| painel-barch | same as above | `npm run types` | — | `npm run build` |
| Barch | — | — | `PYTHONPATH=. pytest` | — |

**Barch pytest note:** Run from `/agent/repos/Barch` with `PYTHONPATH=.` so `barch_files_api` is importable. Two tests (`test_search_endpoint`, `test_case_insensitive`) are currently failing on `main` — pre-existing, not environment-related.

**ESLint note:** Neither Next.js app has an `eslint.config.*` file. Use `npm run types` for static checks until ESLint is configured.

### Long-running dev servers

Use tmux for background servers (example):

```bash
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s site-barch-dev -c /agent/repos/site-barch -- zsh -l
tmux -f /exec-daemon/tmux.portal.conf send-keys -t site-barch-dev:0.0 'npm run dev' C-m
```

### Python PATH

`pip install --user` puts `pytest` and `flask` in `~/.local/bin`. Add to PATH if needed: `export PATH="$HOME/.local/bin:$PATH"`.

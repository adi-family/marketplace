# ADI marketplaces

This repository **is** the marketplace — per the standing decision
(`mono › business/decisions/2026-08-31-marketplaces-are-a-manifest-in-a-git-repo.md`):
a marketplace is one JSON manifest at an HTTPS URL the operator chose. No platform,
no hosting, no accounts, nothing to operate.

An **app is a git repository at a pinned commit**, and installing one is cloning it.
This repository holds the manifests that say which repository and which commit; the
apps themselves live in repositories of their own, one per app, prefixed `mp-`.

One directory per kind of marketplace:

| path | kind | status |
| --- | --- | --- |
| [`apps/marketplace.json`](apps/marketplace.json) | apps (dashboards) | live |
| `tools/…`, `agents/…`, `presets/…` | the other three kinds | later, deliberately not yet |

Published apps:

| app | repository |
| --- | --- |
| Starter Status | [`adi-family/mp-starter-status`](https://github.com/adi-family/mp-starter-status) |

## Add this marketplace to a machine

```sh
adi-mono marketplace add adi \
  https://raw.githubusercontent.com/adi-family/marketplace/main/apps/marketplace.json
adi-mono marketplace sync
adi-mono marketplace apps
adi-mono marketplace install adi/starter-status --name "Starter Status"
```

The local name (`adi`) is the machine's own — the first half of `adi/<slug>` installs
are addressed by. The manifest's `name` field is display text only. The name given at
install is the operator's: it becomes their dashboard's name, id and hostname, and two
people installing one app under two names is ordinary.

## Publish an app

An app is a dashboard (`mono › guides/dashboards.md`). Its repository carries the
authored files at its **root** — `frontend/index.ts` and `backend/index.ts` are
required, and a repository without them is refused rather than installed into
something that could never start. It must **not** version `config.toml`, `.adi/` or
`node_modules/`: those belong to the installing machine, which adds them to the
clone's local excludes so `git status` in an installed app shows only its owner's work.

1. Push the app as its own repository, `adi-family/mp-<slug>`.
2. Take the commit: `git rev-parse HEAD`.
3. Add the entry to `apps/marketplace.json`:

```json
{
  "slug": "<slug>",
  "name": "<Human name>",
  "description": "<one line on what it is for>",
  "version": "0.1.0",
  "repo": "https://github.com/adi-family/mp-<slug>.git",
  "commit": "<the full 40-character sha>",
  "branch": "main"
}
```

Releasing a new version is changing `commit` (and `version`, for the reader). Every
machine sees it on its next sync, and **nothing moves until somebody updates** —
`adi-mono marketplace update <id>`, a fast-forward that refuses rather than walk over
changes its operator made.

Rules the installer enforces (see `mono › docs/marketplace.md` for all of them):

- `slug` — one safe path segment (`[A-Za-z0-9._-]`); the published identity, *not* the
  directory an install lands as;
- `repo` — `https://` only (or a `file://` path while an app is being developed);
  `ssh://` and `git@host:path` are refused, since they reach for the operator's keys;
- `commit` — a full 40-hex object name. Never a branch or a tag: the pin is what makes
  the listing somebody read the thing that installs, whatever is pushed afterwards;
- `branch` — optional, only when the pin is not on the repository's default branch. It
  decides what a later `git pull` in the installed copy follows;
- a manifest is validated whole — the first entry that does not belong refuses the fetch;
- unknown fields are ignored, so this manifest keeps parsing when newer kinds ship.

One app is one repository. Git cannot clone a subdirectory, and lifting one to the root
would leave a working copy its own history disagreed with — which would cost the property
the whole design is for: an installed app **stays a clone**, and can be read, edited,
committed to and pulled.

Install is inert on arrival: files land, nothing executes until
`adi-mono marketplace start <id>`.

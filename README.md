# ADI marketplaces

This repository **is** the marketplace — per the standing decision
(`mono › business/decisions/2026-08-31-marketplaces-are-a-manifest-in-a-git-repo.md`):
a marketplace is one JSON manifest at an HTTPS URL the operator chose. No platform,
no hosting, no accounts, nothing to operate.

An **item is a git repository at a pinned commit**, and installing one is cloning it.
This repository holds the manifests that say which repository and which commit; the
items themselves live in repositories of their own, one per item, prefixed `mp-`.

An item is a **bundle**: a named collection of platform elements — agents, tools,
dashboards, LLM and embedding backends, hive services, triggers, a project scaffold —
which the repository declares simply by having a directory per kind at its root. All of
it installs, or one element of it does. An app is the special case of a bundle whose
only element is a dashboard, which is what `starter-status` is.

One manifest, at [`apps/marketplace.json`](apps/marketplace.json). The path is v1's — when an
item could only be an app — and it stays where it is because every machine already fetches that
URL. A bundle of agents and tools is listed in the same file.

Published:

| item | what it carries | repository |
| --- | --- | --- |
| Starter Status | a dashboard | [`mp-starter-status`](https://github.com/adi-family/mp-starter-status) |
| Code reviewer | an agent | [`mp-reviewer`](https://github.com/adi-family/mp-reviewer) |
| Changelog tools | two tools | [`mp-changelog-tools`](https://github.com/adi-family/mp-changelog-tools) |
| Standup board | a dashboard | [`mp-standup`](https://github.com/adi-family/mp-standup) |
| CRM suite | agent · tool · LLM backend · dashboard | [`mp-crm-suite`](https://github.com/adi-family/mp-crm-suite) |

**The last four are demos, and say so on their own pages.** They exist to be read by
somebody publishing their first item: one per shape — an agent alone, tools alone, a
dashboard alone, and one bundle carrying four kinds at once. Each repository's README
is the item's long form in the Store, so the explanation and the thing explained are
the same file.

## Add this marketplace to a machine

**Nothing to do: it is already there.** Since 2026-09-14 every machine starts with this
marketplace configured, under the name `store` — so every install is addressed
`store/<slug>`, and the ADI Store's own Install button is one click
(`mono › crates/adi-marketplace/src/sources.rs`).

```sh
adi-mono marketplace sync
adi-mono marketplace apps
adi-mono marketplace install store/starter-status --name "Starter Status"
```

It has no privileges for being official: `adi-mono marketplace remove store` removes it
like any other source, and a second marketplace is added beside it with
`adi-mono marketplace add <name> <url>`. The local name is the machine's own — the first
half of the address — and the manifest's `name` field is display text only. The name
given at install is the operator's: it becomes their copy's name, id and hostname, and
two people installing one item under two names is ordinary.

## Publish an app

An app is a dashboard (`mono › guides/dashboards.md`). Its repository carries the
authored files at its **root** — `frontend/index.ts` and `backend/index.ts` are
required, and a repository without them is refused rather than installed into
something that could never start. It must **not** version `config.toml`, `.adi/` or
`node_modules/`: those belong to the installing machine, which adds them to the
clone's local excludes so `git status` in an installed app shows only its owner's work.

1. Push the item as its own repository, `adi-family/mp-<slug>`, with one directory per
   kind at its root — `agents/`, `tools/`, `dashboards/<name>/`, `llm/`, `embeddings/`,
   `services/`, `triggers/`, `project/`. The four demo repositories above are each an
   example of one shape; copy whichever is closest.
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

# ADI marketplaces

This repository **is** the marketplace — per the standing decision
(`mono › business/decisions/2026-08-31-marketplaces-are-a-manifest-in-a-git-repo.md`):
a marketplace is one JSON manifest at an HTTPS URL the operator chose. No platform,
no hosting, no accounts, nothing to operate.

One directory per kind of marketplace. Each holds that kind's `marketplace.json`
and the published artifacts beside it:

| path | kind | status |
| --- | --- | --- |
| [`apps/marketplace.json`](apps/marketplace.json) | apps (dashboards) | live — the v1 built in ADI-38 |
| `tools/…`, `agents/…`, `presets/…` | the other three kinds | later, deliberately not in v1 |

## Add this marketplace to a machine

```sh
adi-mono marketplace add adi \
  https://raw.githubusercontent.com/adi-family/marketplace/main/apps/marketplace.json
adi-mono marketplace sync
adi-mono marketplace apps
```

The local name (`adi`) is the machine's own — the first half of `adi/<slug>` installs
are addressed by. The manifest's `name` field is display text only.

## Publish an app

An app is a dashboard; the artifact is the same `DashboardBundle` JSON the panel's
export produces (authored files as base64, nothing generated).

1. Export the app in the panel (Dashboards › ⋯ › export) or from the machine that has it.
2. Commit the bundle here: `apps/<slug>.bundle.json`.
3. Add the entry to `apps/marketplace.json`:

```json
{
  "slug": "<slug>",
  "name": "<Human name>",
  "description": "<one line on what it is for>",
  "version": "0.1.0",
  "artifact": "https://raw.githubusercontent.com/adi-family/marketplace/main/apps/<slug>.bundle.json"
}
```

Rules the installer enforces (see `mono › docs/marketplace.md` for all of them):

- `slug` — one safe path segment (`[A-Za-z0-9._-]`), it is the install identity;
- `artifact` — `https://` only, `http://` is refused at sync;
- a manifest is validated whole — the first entry that does not belong refuses the fetch;
- unknown fields are ignored, so this manifest keeps parsing when newer kinds ship.

Install is inert on arrival: files land, nothing executes until
`adi-mono marketplace start <slug>`.

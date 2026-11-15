# 18 — Git Workflow

## 1. Repositories
`korak-api` and `korak-web`, independent histories and pipelines.

## 2. Branching (proposed)
Trunk-based with short-lived branches.
- `main` is always deployable and protected: no direct pushes, pull request required, CI must pass.
- Branch names: `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>`, `docs/<short-name>`.
- Branches live days, not weeks; large work is split into small, mergeable steps.

## 3. Commits
Conventional style: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`. One logical change per commit; the message says what and why.

## 4. Pull requests
- Small and focused; no unrelated refactoring.
- Description states the purpose, the security implications, and how it was tested.
- Checklist: tests added/updated · docs updated (Doc 20) · no secrets · migrations reviewed · UI follows the design system · accessibility checked for UI changes.
- At least one review before merge. Merge by squash to keep `main` readable.

## 5. Releases
Semantic version tags (`vMAJOR.MINOR.PATCH`) per repo. Each release has short notes listing changes, migrations, and any required configuration. Production deploys come from tags (Doc 17).

## 6. Cross-repo changes
When a feature needs both repos: ship the backward-compatible API change first, then the frontend. Link the two pull requests. Breaking API changes require a new API version, not a silent change.

## 7. Hotfixes
Branch from `main` (or the release tag), fix with a reproducing test, review, merge, tag, deploy. No bypassing CI.

## 8. Repository hygiene
- `.gitignore` covers `.env`, build output, and dependency folders.
- No credentials, tokens, or real customer data in history. If a secret is committed, rotate it immediately; deleting the commit is not enough.
- Dependency updates are reviewed like any other change.

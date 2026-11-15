# 20 — Documentation Standards

## 1. Principle
Code should be understandable without excessive comments; documentation explains *what exists, how to use it, and why decisions were made*. If a change alters behavior, the same pull request updates the documentation.

## 2. What must be documented
Every **module**, **service**, **API endpoint**, **entity**, and **security decision**.

## 3. Where documentation lives
| Content | Location |
|---------|----------|
| Project-wide standards (Docs 00–20) | A shared docs location agreed by the team (OPEN: dedicated docs repo or copied into each repo's `docs/`) |
| Backend module, service, entity, API docs | `korak-api/docs/` |
| Frontend feature docs and component notes | `korak-web/docs/` |
| Security decisions | `docs/security-decisions.md` |
| Setup and scripts | Each repo's `README.md` |

## 4. Templates
**Module:** purpose · responsibilities · what it depends on · endpoints · entities · security considerations · tests.

**Service/Action:** purpose · inputs and outputs · side effects (database, queue, external calls) · failure modes · how to test.

**Endpoint:** method and path · purpose · authentication/authorization · request fields and validation · response shape · error cases · rate limit · security notes. Generated from code where practical (tool OPEN, Doc 06), then reviewed.

**Entity:** purpose · columns with types and meaning · relationships · indexes · soft delete yes/no and why · security classification of sensitive columns.

**Security decision:** date · decision · reason · alternatives considered · consequences.

## 5. Writing rules
- Plain language; short sentences; one idea per paragraph.
- Mark undecided items **OPEN** and recommendations **(proposed)**. Nothing OPEN is implemented until resolved.
- Do not document secrets, credentials, or real customer data.
- Prefer examples and tables over long prose.

## 6. Maintaining these standards
- Each document has a status line (Draft / Agreed) and a last-reviewed date.
- Changes to standards go through a pull request like code, and are summarized in a short changelog in `00-README.md`.
- When a decision from the OPEN list is made, update the affected documents and remove it from the list in the same change.

## 7. Definition of done
A feature is not done until: code merged with tests (Doc 16), endpoint/entity/module docs updated, any security decision recorded, and the OPEN list adjusted if it was affected.

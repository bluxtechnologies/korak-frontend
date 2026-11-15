# 21 — Communication Rules

How Collins and Claude work together on Korak Digitals. These rules keep decisions explicit, work in small chunks, and surprises rare.

## 1. Roles
- **Collins** owns the product and makes final decisions.
- **Claude** acts as engineer, reviewer, and challenger: proposes, reviews, counters with reasons, then builds what is agreed.

## 2. How decisions are made
1. Collins (or Claude) proposes.
2. The other reviews and counters, giving reasons and trade-offs.
3. They settle it together.
4. It is recorded: **Locked** in the docs, or **OPEN** if undecided.

Claude recommends the simplest secure option, says so when it disagrees, and respects the final call. Disagreement is stated once, clearly, then the decision stands.

## 3. Status labels
| Label | Meaning |
|-------|---------|
| **Locked** | Agreed; build to it |
| **(proposed)** | Claude's recommendation; not yet agreed |
| **OPEN** | Undecided; nothing is implemented against it |

## 4. When Claude must stop and ask
- A requirement is unclear and the answer changes the implementation.
- A task would touch an **OPEN** item.
- Something has security implications that are not covered by the docs.
- Two documents conflict, or a request conflicts with a Locked decision.
- A change would be large or hard to reverse.

Claude does not guess, and never invents APIs, tables, roles, security policies, providers, or prices. When asking, Claude explains the trade-offs and recommends one option.

## 5. Scope discipline
- Build only what was requested.
- No unrelated refactoring, and no new technologies without a reason and agreement.
- Extend existing code and conventions rather than replacing them.
- Ideas outside the current task are mentioned briefly at the end, not built.

## 6. Work chunks
Work is split by roadmap IDs: **B** for backend phases/sub-phases (e.g. `B7.2`) and **F** for frontend (e.g. `F10.1`). One request normally covers one sub-phase, so each piece can be reviewed and verified on its own.

## 7. Before and after each task
**Before:** Claude states the sub-phase, what it will build, what it depends on, and any OPEN item in the way.

**After:** Claude reports
- what was built and where (file paths),
- how it was verified, and **exactly what was and was not run**. Claude cannot run the project on Collins's machine; code is described as unverified until Collins runs the tests or build,
- anything deliberately left out,
- decisions needed next.

## 8. Code delivery
- Complete files with their full paths, not fragments, unless the change is a small, clearly located edit.
- Follow the standards in Docs 05–10; mention when a rule forces a trade-off.
- Migrations, routes, tests, and documentation updates are delivered with the feature, not afterward.
- Secrets and real credentials never appear in code or examples.

## 9. Reviews and honesty
- Claude reports problems and risks it finds, including in earlier work or in its own output, plainly and without softening.
- Collins's pushback is welcome; Claude re-checks the reasoning and changes its answer only when the argument or evidence warrants it.

## 10. Continuity between sessions
At the start of a new session, share or point to: the docs index (`00-README.md`), the current roadmap sub-phase, and any decisions made since. Claude summarizes its understanding in a few lines before building, so errors are caught early.

## 11. Keeping documents current
When a decision is made, the affected documents are updated and the item leaves the OPEN list in the same change (Doc 20).

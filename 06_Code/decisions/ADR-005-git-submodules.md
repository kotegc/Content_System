# ADR-005: Git Submodules as the Sharing Mechanism

## Status
Accepted

## Date
2026-06-29

## Context

`SYS-2026_CONTENT_SYSTEM` contains design tokens, math macros, block registry definitions, and the IR transformer — shared infrastructure that must be consumed by at minimum `PUB_2026_PUBLISHER` and `MYP-2026_MY_PORTFOLIO`, and eventually by future repos (`PAR-2026_PARALIA`, others).

The sharing mechanism must satisfy several constraints:

- SCSS consumers (Dart Sass / Quarto) resolve `@import` by **file path on disk**. There is no package manager between Sass and the filesystem. Whatever mechanism is used, the shared files must ultimately be present at a known path inside the consumer repo.
- Quarto's `include-in-header` and LaTeX's `\input` also resolve by **file path on disk**.
- The portfolio website (`My_Portfolio`) already has an established GitHub remote and deployment pipeline. The mechanism must not disrupt that.
- The system must work on a single developer's machine without requiring any running infrastructure.

## Decision

Git submodules. `SYS-2026_CONTENT_SYSTEM` is added as a submodule at `06_Code/system/` in each consumer repo.

Each consumer's `.gitmodules` records:
- The submodule path (`06_Code/system`)
- The remote URL (`https://github.com/kotegc/Content_System.git`)
- The pinned commit hash (tracked by git automatically)

Consumers reference system files via relative paths:
- SCSS: `@import "../../system/06_Code/tokens/base"` (from `theme/`)
- Quarto: `../../../../system/06_Code/macros/generated/mathjax-macros.html` (from `examples/project/docs/`)

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| **npm package (GitHub Packages or npm registry)** | Correct enterprise pattern — versioned releases, Renovate/Dependabot for automatic updates, semantic versioning. However: Dart Sass and Quarto resolve SCSS imports by filesystem path, not by npm module resolution. Publishing to npm does not eliminate the need for the files to be at a known path on disk. The filesystem problem still exists; npm adds overhead without solving it. The right answer when there are many consumers or a team involved. See Signals to Revisit. |
| **Monorepo (Nx, Turborepo)** | Eliminates the sharing problem entirely — all repos in one git repository, shared code via relative paths. However: `My_Portfolio` has an existing GitHub remote (`kotegc/My_Portfolio`) and a deployment pipeline. Merging into a monorepo collapses independent git histories and requires migrating the deployment pipeline. The operational disruption is not justified for a single developer. |
| **Symlinks** | Simple to create, zero overhead. However: not portable across machines or operating systems. A symlink pointing to `c:\Users\georg\Local_Drive\CLIENTS\SYS-2026_CONTENT_SYSTEM` does not exist on any other machine or in any CI environment. Rejected immediately. |
| **File copy** | Copy `base.scss`, `macros.yml`, etc. into each consumer when they change. Explicitly rejected. Creates multiple copies of the same file with no enforcement that they stay in sync. This is the pattern that caused the original divergence. |
| **Git subtree** | Copies the subproject's history into the consumer repo rather than using a pointer. Consumers get the files without any additional init step. However: updates require `git subtree pull` in each consumer repo; there is no version pin; consumer copies diverge independently over time. More operational overhead than submodules for a shared infrastructure layer. |

## Consequences

**Positive:**
- Solves the filesystem path problem directly. After `git submodule update --init`, system files are at a deterministic path inside each consumer repo.
- Version pinning is recorded in git. Each consumer's submodule pointer records the exact commit of the system it was tested against. A system update that breaks a consumer is visible in git history.
- Works completely offline after the initial clone. No registry, no server, no running service.
- The system repo (`Content_System`) retains its own independent git history, branches, and tags.

**Negative (known tradeoffs):**
- **Submodule initialization is not automatic.** After cloning a consumer repo, `git submodule update --init` must be run or `06_Code/system/` is an empty directory. Build scripts should guard against this (see `RELIABILITY.md` Gap 3 and the guard added to `scripts/build.ps1` and `scripts/build.sh`).
- **Version updates are manual.** When the system repo is updated, each consumer repo must explicitly update its submodule pin (`git submodule update --remote`) and commit the pointer change. This does not happen automatically.
- **Submodule URL changes require coordination.** When the system repo's remote URL changes (as it did when moving from a local `file://` path to the GitHub URL), `.gitmodules` must be updated in every consumer and `git submodule sync` must be run. For two consumers this is manageable; for many, it becomes error-prone.
- Submodules are a source of confusion for developers who are not familiar with them. The empty directory after clone is a common stumbling point.

**Neutral:**
- The initial setup used a local `file:///` URL for the submodule during development (before the system repo was on GitHub). This required a `git submodule sync` in each consumer after the URL was updated to the GitHub remote. This is a one-time migration cost of starting development locally before pushing to GitHub.

## Signals to Revisit

- **When there are more than 3 consumer repos:** The manual update coordination across repos scales poorly. At that point, publish to GitHub Packages (a private npm registry built into GitHub, free for private repos) and use Renovate to open automated update PRs. The SCSS filesystem path problem is solved by a postinstall script that copies the relevant files to a known path, or by configuring Sass's `loadPaths`.
- **When another person joins the workflow:** Submodule failure modes (empty directory, detached HEAD) are confusing to people who didn't set up the system. The `git submodule update --init` step is easy to document but easy to forget. At that point, evaluate the npm package path for a smoother onboarding experience.
- **When CI is added to consumer repos:** CI runners clone repos fresh every run. They must be configured with `git submodule update --init` or the build will fail. Document this before adding CI.

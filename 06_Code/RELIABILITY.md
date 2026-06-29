# Reliability Gap Analysis

This document is an honest audit of where the current content system infrastructure falls short of its stated reliability goal: **producing beautiful, publication-quality documentation as reliably and repeatably as Microsoft Word or Adobe InDesign**.

That is a high bar. Word and InDesign work on any Windows or Mac machine after a straightforward install, produce consistent output every time, and do not require a developer to set them up. The gaps below describe where this system currently falls short of that standard and what specific actions close each gap.

Gaps are prioritized by practical impact. Gaps 6 and 7 are tracked separately and will be addressed in later phases.

---

## Gap 1: No Fresh-Machine Setup Documentation

**Risk: High**

If your development machine were replaced today, there is no single document that describes how to get from a clean Windows install to a working Publisher output. The process involves multiple tools with non-obvious installation steps, none of which are currently documented together.

The required steps (currently undocumented):

| Tool | Purpose | Install |
|---|---|---|
| Git | Version control, submodule management | git-scm.com |
| Node.js (LTS) | Astro build, npm, Sanity CLI | nodejs.org |
| Python 3.12+ | Macro generation (`generate-macros.py`) | python.org |
| Quarto | Document compiler | quarto.org |
| MiKTeX or TeX Live | LaTeX for PDF output | miktex.org or tug.org/texlive (4–8 GB) |
| IBM Plex Sans/Mono | Publisher body font | fonts.google.com or IBM GitHub |
| Grotesky | Portfolio display font | (private, must be installed manually) |
| Topaz | Portfolio retro font | (private, must be installed manually) |

After tools are installed, the setup sequence is:

```bash
# Clone consumer repos with submodule initialized
git clone --recurse-submodules https://github.com/kotegc/Publisher.git

# Or, if already cloned without --recurse-submodules:
git submodule update --init

# Verify the build works
cd 06_Code/engineering-publisher
./scripts/build.ps1 report   # Windows
./scripts/build.sh report    # macOS/Linux
```

**How to close it:** The `doctor.ps1` script in `PUB_2026_PUBLISHER/06_Code/engineering-publisher/` is the right place to encode this. It already exists; extend it to check for every prerequisite and report what is missing with install instructions. A separate `SETUP.md` in `Content_System` should document the one-time sequence for getting all three repos configured and linked.

---

## Gap 2: No Automated Validation That the System Compiles

**Risk: Medium**

If `tokens/base.scss` is changed in `Content_System` — a variable renamed, a token removed — nothing currently detects that the Publisher's SCSS compilation is broken until a document is manually rendered and a Sass error appears. The error message will reference a line number in `report.scss`, not the source of the problem in `base.scss`.

Word does not allow you to corrupt your own stylesheet silently. This system currently does.

**How to close it:** A GitHub Actions workflow in `Content_System` that, on every push to `main`, checks out `Publisher` with the submodule initialized, runs a Quarto render on `examples/project/docs/report.qmd`, and fails the push if the render fails. This catches SCSS compilation errors, missing macro definitions, and malformed token values before they reach any consumer.

The workflow file would be `.github/workflows/validate.yml` in `Content_System`. No existing file needs to change.

---

## Gap 3: Submodule Initialization Is Not Enforced ✓ (Partially Addressed)

**Risk: Medium** → Mitigated by build script guard added in this session.

If `Publisher` is cloned without `--recurse-submodules`, `06_Code/system/` is an empty directory. The build then fails with a Sass file-not-found error that does not mention submodules. This is a confusing failure mode with a simple fix.

**What was done:** `scripts/build.ps1` and `scripts/build.sh` now check for the presence of `06_Code/system/06_Code/tokens/base.scss` before running any Quarto commands. If the file is missing, they print a clear diagnostic and exit with a non-zero code:

```
Error: Content system submodule not initialized.
Run: git submodule update --init
```

**Remaining gap:** The guard only covers the build scripts. A developer running `quarto render` directly (bypassing the build scripts) will still see the unhelpful Sass error. Documenting the `--recurse-submodules` flag in `README.md` closes this.

---

## Gap 4: Font Dependencies Are Invisible

**Risk: Medium**

Publisher output quality depends on specific fonts being installed on the system running the build:

| Font | Used in | If missing |
|---|---|---|
| IBM Plex Sans | HTML body, Reveal.js | Browser/OS falls back silently to system sans-serif |
| IBM Plex Mono | HTML code blocks | Falls back to system monospace |
| Grotesky | Portfolio display headings | Falls back to IBM Plex Sans |
| Topaz | Portfolio retro elements | Falls back to IBM Plex Mono |

"Falls back silently" is the problem. There is no error, no warning — the build succeeds but the output looks wrong. For PDF output, LaTeX will substitute a different font and the typography changes without any notification.

This is unlike Word or InDesign, both of which warn when a document uses a font that is not installed.

**How to close it:** Two steps:
1. Add a font check to `doctor.ps1` that enumerates installed fonts (PowerShell can query `[System.Drawing.FontFamily]::Families` or the Windows registry) and reports which required fonts are missing.
2. Document where to obtain each font in `SETUP.md`. IBM Plex is freely available. Grotesky and Topaz are private and must be noted as such with their source.

---

## Gap 5: No Version Pinning for Quarto or LaTeX

**Risk: Low–Medium**

The system has no record of which tool versions are expected to produce correct output. Quarto 1.5 and 1.6 have behavior differences. LaTeX package updates (managed automatically by MiKTeX) can silently break PDF compilation. If a document that rendered correctly in June stops rendering correctly in September, there is no baseline to compare against.

Word handles this by shipping its own rendering engine with the application. This system depends on external tools that update independently.

**How to close it:** Add a `VERSIONS.md` file (or a section in `SETUP.md`) that records the known-good versions tested at the time of each significant system update:

```markdown
## Known-good configuration (2026-06-29)
- Quarto: 1.6.x
- MiKTeX: 24.x
- Node.js: 22.x (LTS)
- Python: 3.12.x
- Dart Sass: ships with Quarto, no separate version
```

This is a reference, not enforcement. It allows version-related failures to be diagnosed by comparing the current installed version against the last known-good configuration.

For stronger enforcement: Quarto supports a `quarto-required` field in `_quarto.yml` that fails the render if the installed Quarto version does not satisfy a version constraint. This should be added to `examples/project/docs/_quarto.yml`.

---

## Summary

| Gap | Risk | Status |
|---|---|---|
| 1. No fresh-machine setup documentation | High | Open — extend `doctor.ps1`, write `SETUP.md` |
| 2. No automated SCSS/build validation | Medium | Open — add GitHub Actions workflow to `Content_System` |
| 3. Submodule initialization not enforced | Medium | Mitigated — guard added to build scripts |
| 4. Font dependencies are invisible | Medium | Open — extend `doctor.ps1`, document in `SETUP.md` |
| 5. No version pinning | Low–Medium | Open — write `VERSIONS.md`, add `quarto-required` to `_quarto.yml` |

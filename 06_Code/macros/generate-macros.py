#!/usr/bin/env python3
"""Generate macros/generated/macros.tex and macros/generated/mathjax-macros.html
from macros/macros.yml.

Usage:
    python generate-macros.py

Run from the macros/ directory or from anywhere — paths are resolved relative
to this script's location.
"""

import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Error: pyyaml not installed. Run: pip install pyyaml")
    sys.exit(1)

MACROS_DIR  = Path(__file__).resolve().parent
MACROS_YML  = MACROS_DIR / "macros.yml"
GENERATED   = MACROS_DIR / "generated"
MACROS_TEX  = GENERATED / "macros.tex"
MATHJAX_HTML = GENERATED / "mathjax-macros.html"

TEX_NOTICE = """\
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% GENERATED FILE — DO NOT EDIT
%
% Source:    macros/macros.yml
% Generator: macros/generate-macros.py
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"""

HTML_NOTICE = """\
<!--
  GENERATED FILE — DO NOT EDIT

  Source:    macros/macros.yml
  Generator: macros/generate-macros.py
-->"""


def load_macros():
    with open(MACROS_YML, encoding="utf-8") as f:
        return yaml.safe_load(f)


def to_latex(name, spec):
    if isinstance(spec, str):
        return f"\\providecommand{{\\{name}}}{{{spec}}}"
    definition, nargs = spec
    return f"\\providecommand{{\\{name}}}[{nargs}]{{{definition}}}"


def write_macros_tex(macros):
    GENERATED.mkdir(exist_ok=True)
    lines = [TEX_NOTICE, ""]
    for name, spec in macros.items():
        lines.append(to_latex(name, spec))
    lines.append("")
    MACROS_TEX.write_text("\n".join(lines), encoding="utf-8")
    print(f"  {MACROS_TEX.relative_to(MACROS_DIR.parent)}")


def write_mathjax_html(macros):
    GENERATED.mkdir(exist_ok=True)
    macros_js = json.dumps(macros, indent=2, ensure_ascii=False)
    html = f"""{HTML_NOTICE}
<script>
window.MathJax = window.MathJax || {{}};
window.MathJax.tex = window.MathJax.tex || {{}};
window.MathJax.tex.macros = {macros_js};
</script>
"""
    MATHJAX_HTML.write_text(html, encoding="utf-8")
    print(f"  {MATHJAX_HTML.relative_to(MACROS_DIR.parent)}")


def main():
    if not MACROS_YML.exists():
        print(f"Error: {MACROS_YML} not found")
        sys.exit(1)

    macros = load_macros()
    n = len(macros)
    print(f"Generating from {n} macros in macros.yml ...")
    write_macros_tex(macros)
    write_mathjax_html(macros)
    print("Done.")


if __name__ == "__main__":
    main()

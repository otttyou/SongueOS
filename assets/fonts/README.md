# SoengOS local font assets

The current offline prototype intentionally avoids remote web-font dependencies.
Both HTML shells use system UI and monospace font stacks from local CSS, so the
interface renders completely without network access even when no bundled font
binary is present.

If a branded typeface is bundled later, place `.woff2` files in this directory
and add matching `@font-face` declarations in `assets/styles/`.

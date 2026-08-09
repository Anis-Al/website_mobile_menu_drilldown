# website_mobile_menu_drilldown

Turns the Odoo 19 mobile menu (`#top_menu_collapse_mobile`) into a drilldown:
full-width rows, separators, chevron-right, one level per screen with a back
bar. Styling only — no controller, no model, no override of `website.submenu`.

## Files

| File | Role |
|---|---|
| `static/src/scss/mobile_menu.scss` | All layout. Scoped to `#top_menu_collapse_mobile`, so desktop/sidebar/hamburger headers are untouched. |
| `static/src/js/mega_menu_drilldown.js` | ~20 lines. One delegated click that flags the open block with `o_mm_open`. Nothing else. |
| `views/s_mega_menu_multi_menus.xml` | Inherits `website_sale.s_mega_menu_multi_menus` to render a third category level as `.o_mm_sub`. |

## Levels

1. **Website menus** — Odoo already renders these as Bootstrap accordions in
   the mobile offcanvas. The SCSS pins the expanded `.accordion-button` as the
   back bar and its `.accordion-collapse` as the panel, so "back" is just
   collapsing it. No JS.
2. **Mega menu** — Odoo already drills it to a full-screen panel
   (`.o_mega_menu_is_offcanvas`, `.o_mega_nav` back bar). Untouched.
3. **Inside the mega menu snippet** — `mega_menu_content` is an HTML *field*,
   not a template: no toggle markup, nothing to inherit. Hence the JS.

Blocks that drill = a grid column, or a `.o_mm_sub` (level 3, from the view).
Rows that only navigate render as cards.

## Gotchas

- **`[class*="col"]` also matches `o_colored_level`**, which sits on
  `<section>`. Always match `col-`.
- **Specificity**: the "a leaf link has no chevron" rule carries
  `.top_menu.o_mega_menu_is_offcanvas` and outranks anything written under
  `.o_mega_menu`. Every chevron override down there needs `!important`.
- **`position: fixed` needs no transformed ancestor.** Odoo puts
  `transform: translateX(5%)` on `.o_mega_menu > section`, which would become
  the containing block. It is reset here.
- **Mega levels flow, they are not stacked layers.** Stacking them made each
  panel the next one's containing block — one broken link and a level renders
  inline at half height. Instead the open block's *siblings* are hidden
  (`.o_mm_open ~ *`, `*:has(~ .o_mm_open)`) and each level flows in
  `.o_mega_menu`, the single scroll container.
- **Back bar is `sticky`, not `absolute`.** It is a child of that scroll
  container; absolute would scroll away on a long list.
- **Sass evaluates `min()`.** `min(400px, 100vw)` fails to compile. Put such
  values in a custom property, whose value Sass passes through literally.
- **The mega menu element is shared.** Odoo moves the same DOM node between
  the desktop and mobile navbars (`website.MegaMenuDropdown.moveMegaMenu`), so
  the JS mutates nothing and all styling stays scoped to the offcanvas id.

## After changing views/s_mega_menu_multi_menus.xml

`mega_menu_content` stores a *snapshot* of that template, taken when it was
last applied. Upgrading the module does not update existing menus. In the
builder: select the mega menu → toggle **eCommerce categories** off and back
on to re-render it.

## Knobs

Custom properties at the top of the SCSS: `--mm-fg`, `--mm-bg`, `--mm-sep`,
`--mm-pad-x`, `--mm-pad-y`, `--mm-size`, `--mm-bar-h`, `--mm-top` (offcanvas
header height), `--mm-card-bg`, `--mm-card-radius`, `--mm-card-gap`.

Assumes a right-side offcanvas (`offcanvas-end`, the Odoo default mobile
header).

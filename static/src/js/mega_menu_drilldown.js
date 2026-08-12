import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

// Drilldown inside the mega menu snippet content, on mobile only.
//
// ponytail: the snippet content is an HTML field, so there is nothing to
// inherit and no toggle markup to rely on. Cheapest thing that works: one
// delegated click that flags the column with `o_mm_open`. All the layout is
// CSS, scoped to #top_menu_collapse_mobile, so the desktop mega menu is
// untouched even though Odoo moves the very same element between the two
// navbars (see website.MegaMenuDropdown.moveMegaMenu).
const COLUMN_CONTENT = "nav, ul, ol, .list-group";

export class MobileMegaMenuDrilldown extends Interaction {
    static selector = "#top_menu_collapse_mobile";
    dynamicContent = {
        _root: { "t-on-click.withTarget": this.onClick },
    };

    /**
     * @param {HTMLElement} rootEl
     */
    closeAll(rootEl) {
        for (const el of rootEl.querySelectorAll(".o_mm_open")) {
            el.classList.remove("o_mm_open");
        }
    }

    /**
     * @param {MouseEvent} ev
     * @param {HTMLElement} rootEl
     */
    onClick(ev, rootEl) {
        if (document.body.classList.contains("editor_enable")) {
            return;
        }
        if (ev.target.closest(".o_mega_nav")) {
            // Odoo's back arrow is the only back control, at every level. It
            // steps out of one level; only on the first one does it fall
            // through to Odoo and close the mega menu.
            const openEls = rootEl.querySelectorAll(".o_mm_open");
            if (!openEls.length) {
                return;
            }
            ev.preventDefault();
            ev.stopPropagation(); // Or Bootstrap closes the whole dropdown.
            // Document order: the last one is the deepest.
            openEls[openEls.length - 1].classList.remove("o_mm_open");
            return;
        }
        if (!ev.target.closest(".o_mega_menu")) {
            // Left the mega menu: reset.
            this.closeAll(rootEl);
            return;
        }
        const headingEl = ev.target.closest("h1, h2, h3, h4, h5, h6");
        if (!headingEl) {
            return; // Sub level links keep navigating.
        }
        const columnEl = headingEl.parentElement;
        if (columnEl.classList.contains("o_mm_open")) {
            // Already the current level: the title is a plain link to that
            // category, same destination as the .o_mm_all row hidden here.
            return;
        }
        if (!columnEl.querySelector(COLUMN_CONTENT)) {
            return; // Nothing to drill into.
        }
        ev.preventDefault();
        // Forward: keep the ancestors open, they are the levels behind.
        for (const el of rootEl.querySelectorAll(".o_mm_open")) {
            if (!el.contains(columnEl)) {
                el.classList.remove("o_mm_open");
            }
        }
        columnEl.classList.add("o_mm_open");
    }
}

registry
    .category("public.interactions")
    .add("website_mobile_menu_drilldown.mega_menu", MobileMegaMenuDrilldown);

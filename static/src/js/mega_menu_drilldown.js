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
        if (!ev.target.closest(".o_mega_menu")) {
            // Left the mega menu (e.g. its back arrow): reset.
            this.closeAll(rootEl);
            return;
        }
        const headingEl = ev.target.closest("h1, h2, h3, h4, h5, h6");
        if (!headingEl) {
            return; // Sub level links keep navigating.
        }
        const columnEl = headingEl.parentElement;
        if (!columnEl.querySelector(COLUMN_CONTENT)) {
            return; // Nothing to drill into.
        }
        ev.preventDefault();
        if (columnEl.classList.contains("o_mm_open")) {
            // Back: close this level and whatever was open below it.
            this.closeAll(columnEl);
            columnEl.classList.remove("o_mm_open");
            return;
        }
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

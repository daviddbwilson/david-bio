/*
 * Link previews for the home page.
 *
 * Any element with data-card="key", where key exists in cards.js, gets a
 * preview: a tilted card in the right margin on desktop, and a drawer at the
 * bottom of the screen on touch devices and in windows too narrow for the card.
 *
 * Without this script every link is still an ordinary link.
 */
(function () {
    "use strict";

    var cards = window.DB_CARDS || {};
    var triggers = Array.prototype.filter.call(
        document.querySelectorAll("[data-card]"),
        function (el) {
            return cards[el.getAttribute("data-card")];
        }
    );
    if (!triggers.length) return;

    var column = document.querySelector("main");
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Desktop card geometry, in px.
    var GAP = 36; // between the text column and the card
    var EDGE = 20; // between the card and the window edge
    var CARD_MIN = 220;
    var CARD_MAX = 300;

    function cardFor(el) {
        return cards[el.getAttribute("data-card")];
    }

    function isLink(el) {
        return el.tagName === "A";
    }

    // True when there is a hover-capable pointer and the right margin is wide
    // enough for the card to sit beside the text without covering it.
    function useCard() {
        if (!canHover.matches) return false;
        var margin =
            document.documentElement.clientWidth -
            column.getBoundingClientRect().right;
        return margin >= GAP + CARD_MIN + EDGE;
    }

    /* ---- Set up each trigger ---------------------------------------- */

    // Captions for screen readers, referenced with aria-describedby.
    var descriptions = document.createElement("div");
    descriptions.hidden = true;

    triggers.forEach(function (el) {
        var key = el.getAttribute("data-card");
        var card = cards[key];

        if (isLink(el)) {
            if (card.url) el.setAttribute("href", card.url);
        } else {
            // A card with no link: make the word reachable by keyboard.
            el.tabIndex = 0;
        }
        el.classList.add("card-link");

        var text = [card.url && card.badge, card.caption]
            .filter(Boolean)
            .join(": ");
        if (text) {
            var desc = document.createElement("span");
            desc.id = "card-desc-" + key;
            desc.textContent = text;
            descriptions.appendChild(desc);
            el.setAttribute("aria-describedby", desc.id);
        }

        el.addEventListener("pointerenter", function (e) {
            if (e.pointerType === "mouse" && useCard()) showCard(el);
        });
        el.addEventListener("pointerleave", function () {
            if (shown === el) hideCard();
        });
        el.addEventListener("focus", function () {
            if (useCard() && el.matches(":focus-visible")) showCard(el);
        });
        el.addEventListener("blur", function () {
            if (shown === el) hideCard();
        });
        if (!isLink(el)) {
            el.addEventListener("keydown", function (e) {
                if ((e.key === "Enter" || e.key === " ") && !useCard()) {
                    e.preventDefault();
                    openDrawer(el);
                }
            });
        }
    });
    document.body.appendChild(descriptions);

    /* ---- Images: nothing is fetched until someone shows interest ----- */

    var warmed = false;

    // After the first hover or tap, fetch the other images in the background
    // so later previews appear without a wait.
    function warmImages() {
        if (warmed) return;
        warmed = true;
        var idle =
            window.requestIdleCallback ||
            function (fn) {
                return setTimeout(fn, 300);
            };
        idle(function () {
            Object.keys(cards).forEach(function (key) {
                if (cards[key].image) new Image().src = cards[key].image;
            });
        });
    }

    // Put a card's image, badge and caption into a card or drawer element.
    function fill(root, card, onResize) {
        var media = root.querySelector(".preview-media");
        var img = media.querySelector("img");
        var badge = root.querySelector(".preview-badge");
        var caption = root.querySelector(".preview-caption");

        media.classList.remove("is-loaded");
        img.removeAttribute("src");
        if (card.image) {
            media.hidden = false;
            media.style.aspectRatio =
                card.width && card.height
                    ? card.width + " / " + card.height
                    : "";
            img.alt = card.alt || "";
            img.onload = function () {
                media.classList.add("is-loaded");
                if (onResize) onResize();
            };
            img.onerror = function () {
                media.hidden = true;
                if (onResize) onResize();
            };
            img.src = card.image;
        } else {
            media.hidden = true;
        }

        var showBadge = Boolean(card.url && card.badge);
        badge.hidden = !showBadge;
        badge.textContent = showBadge ? card.badge : "";
        caption.textContent = card.caption || "";
    }

    function previewMarkup() {
        return (
            '<div class="preview-media"><img alt="" decoding="async" /></div>' +
            '<div class="preview-text">' +
            '<span class="preview-badge"></span>' +
            '<p class="preview-caption"></p>' +
            "</div>"
        );
    }

    /* ---- Desktop: card in the right margin --------------------------- */

    var cardEl = null;
    var shown = null;

    function showCard(el) {
        if (!cardEl) {
            cardEl = document.createElement("div");
            cardEl.className = "preview-card";
            // The caption reaches screen readers through aria-describedby.
            cardEl.setAttribute("aria-hidden", "true");
            cardEl.innerHTML = previewMarkup();
            document.body.appendChild(cardEl);
        }
        shown = el;
        fill(cardEl, cardFor(el), placeCard);
        // Alternate the tilt so neighbouring cards lean different ways.
        var tilt = triggers.indexOf(el) % 2 ? 2 : -2.5;
        cardEl.style.setProperty("--tilt", tilt + "deg");
        placeCard();
        cardEl.classList.add("is-visible");
        warmImages();
    }

    // Beside the text column, vertically centred on the hovered word and kept
    // inside the window.
    function placeCard() {
        if (!shown || !cardEl) return;
        var col = column.getBoundingClientRect();
        var word = shown.getBoundingClientRect();
        var viewWidth = document.documentElement.clientWidth;
        var width = Math.min(CARD_MAX, viewWidth - col.right - GAP - EDGE);
        cardEl.style.width = width + "px";
        var height = cardEl.offsetHeight;
        var top = word.top + word.height / 2 - height / 2;
        top = Math.min(top, window.innerHeight - height - EDGE);
        top = Math.max(top, EDGE);
        cardEl.style.left = col.right + GAP + window.scrollX + "px";
        cardEl.style.top = top + window.scrollY + "px";
    }

    function hideCard() {
        shown = null;
        if (cardEl) cardEl.classList.remove("is-visible");
    }

    /* ---- Touch and narrow windows: drawer ---------------------------- */

    var drawer = null;
    var openLink = null;
    var closeButton = null;
    var active = null; // the trigger whose preview is in the drawer
    var drag = null;
    var swallowClick = false;

    function buildDrawer() {
        drawer = document.createElement("div");
        drawer.className = "preview-drawer";
        drawer.setAttribute("role", "dialog");
        drawer.setAttribute("aria-modal", "true");
        drawer.innerHTML =
            '<div class="preview-drawer-bar">' +
            '<button type="button" class="preview-close" aria-label="Close preview">&times;</button>' +
            "</div>" +
            '<div class="preview-drawer-body">' +
            previewMarkup() +
            "</div>" +
            '<a class="preview-open">Open</a>';
        document.body.appendChild(drawer);
        openLink = drawer.querySelector(".preview-open");
        closeButton = drawer.querySelector(".preview-close");

        closeButton.addEventListener("click", function () {
            closeDrawer();
        });
        openLink.addEventListener("click", function () {
            // Let the link open first, then tidy up.
            setTimeout(closeDrawer, 0);
        });

        // Swipe down to dismiss.
        drawer.addEventListener("pointerdown", function (e) {
            if (e.button) return;
            drag = { id: e.pointerId, y: e.clientY, t: e.timeStamp, dy: 0, moved: false };
        });
        drawer.addEventListener("pointermove", function (e) {
            if (!drag || e.pointerId !== drag.id) return;
            var dy = e.clientY - drag.y;
            if (!drag.moved) {
                if (Math.abs(dy) < 6) return;
                drag.moved = true;
                drawer.setPointerCapture(e.pointerId);
                drawer.classList.add("is-dragging");
            }
            drag.dy = Math.max(0, dy);
            drawer.style.transform = "translateY(" + drag.dy + "px)";
        });
        function endDrag(e) {
            if (!drag || e.pointerId !== drag.id) return;
            var d = drag;
            drag = null;
            drawer.classList.remove("is-dragging");
            if (!d.moved) return;
            // The gesture was a drag, so it must not also count as a tap.
            swallowClick = true;
            setTimeout(function () {
                swallowClick = false;
            }, 50);
            var speed = d.dy / Math.max(1, e.timeStamp - d.t); // px per ms
            if (d.dy > 70 || (d.dy > 24 && speed > 0.5)) closeDrawer();
            else drawer.style.transform = "";
        }
        drawer.addEventListener("pointerup", endDrag);
        drawer.addEventListener("pointercancel", endDrag);
        drawer.addEventListener(
            "click",
            function (e) {
                if (swallowClick) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            },
            true
        );
    }

    function openDrawer(el) {
        if (!drawer) buildDrawer();
        var card = cardFor(el);
        hideCard();
        fill(drawer, card, makeRoom);
        drawer.setAttribute(
            "aria-label",
            el.textContent.replace(/\s+/g, " ").trim() + " preview"
        );

        if (card.url) {
            openLink.hidden = false;
            openLink.href = card.url;
            // Match how the word itself opens: a new tab for other sites.
            if (isLink(el) && el.target) {
                openLink.target = el.target;
                openLink.rel = el.rel || "noopener";
            } else {
                openLink.removeAttribute("target");
                openLink.removeAttribute("rel");
            }
        } else {
            openLink.hidden = true;
            openLink.removeAttribute("href");
        }

        if (active) active.classList.remove("is-active");
        active = el;
        el.classList.add("is-active");

        drawer.style.transform = "";
        drawer.classList.add("is-open");
        makeRoom();
        (card.url ? openLink : closeButton).focus({ preventScroll: true });
        warmImages();
    }

    // Keep the tapped word visible above the drawer.
    function makeRoom() {
        if (!active || !drawer) return;
        var height = drawer.offsetHeight;
        document.documentElement.style.setProperty(
            "--drawer-space",
            height + "px"
        );
        var word = active.getBoundingClientRect();
        var limit = window.innerHeight - height - 16;
        var delta = 0;
        if (word.bottom > limit) delta = word.bottom - limit;
        else if (word.top < 8) delta = word.top - 8;
        if (delta) {
            window.scrollBy({
                top: delta,
                behavior: reduceMotion.matches ? "auto" : "smooth",
            });
        }
    }

    function closeDrawer(options) {
        if (!active) return;
        var el = active;
        active = null;
        el.classList.remove("is-active");
        drawer.classList.remove("is-open");
        drawer.style.transform = "";
        document.documentElement.style.removeProperty("--drawer-space");
        if (!options || options.restoreFocus !== false) {
            el.focus({ preventScroll: true });
        }
    }

    /* ---- Page-level events ------------------------------------------- */

    document.addEventListener("click", function (e) {
        var target = e.target;
        var el = target.closest ? target.closest("[data-card]") : null;
        if (el && triggers.indexOf(el) !== -1) {
            // Desktop with room for the card: the link behaves as a link.
            if (useCard()) return;
            // Let people open a link in a new tab or window the usual way.
            if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return;
            }
            e.preventDefault();
            // A second tap on the open word closes its preview.
            if (active === el) closeDrawer();
            else openDrawer(el);
            return;
        }
        if (active && !drawer.contains(target)) {
            // A tap outside closes the drawer. If it landed on another link
            // or button, leave focus there.
            var onControl = target.closest && target.closest("a, button");
            closeDrawer({ restoreFocus: !onControl });
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            if (active) closeDrawer();
            else if (shown) hideCard();
            return;
        }
        // Keep Tab inside the drawer while it is open.
        if (e.key === "Tab" && active) {
            var stops = [openLink, closeButton].filter(function (node) {
                return !node.hidden;
            });
            var index = stops.indexOf(document.activeElement);
            var next;
            if (index === -1) next = stops[0];
            else if (e.shiftKey) next = stops[(index - 1 + stops.length) % stops.length];
            else next = stops[(index + 1) % stops.length];
            e.preventDefault();
            next.focus();
        }
    });

    window.addEventListener("resize", function () {
        hideCard();
        if (!active) return;
        if (useCard()) closeDrawer();
        else makeRoom();
    });
})();

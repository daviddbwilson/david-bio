/*
 * Link previews for the home page.
 *
 * Any element with data-card="key", where key exists in cards.js, gets a
 * preview. With a mouse, an image card rises out of the hovered word and
 * sways on a springy stem as the pointer moves. On touch devices, a tap opens
 * the same picture in a sheet at the bottom of the screen, and the page
 * shrinks back behind it.
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

    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    var ICONS = {
        video:
            '<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M1.5 3.79c0-.71.52-1.29 1.17-1.29h4.66c.65 0 1.17.58 1.17 1.29v6.42c0 .71-.52 1.29-1.17 1.29H2.67c-.65 0-1.17-.58-1.17-1.29V3.79Z"/>' +
            '<path d="m8.87 5.7 2.67-1.14c.44-.19.96.09.96.51v3.86c0 .42-.52.7-.96.51L8.87 8.3a.56.56 0 0 1-.37-.51V6.21c0-.22.14-.41.37-.51Z"/>' +
            "</svg>",
        post:
            '<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M3.5 1.5h7a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"/>' +
            '<path d="M5 4.75h4M5 7h4M5 9.25h2.25"/>' +
            "</svg>",
    };

    function cardFor(el) {
        return cards[el.getAttribute("data-card")];
    }

    // A caption is usually plain words, but can be a function that makes them.
    function captionOf(card) {
        var caption = card.caption;
        return (typeof caption === "function" ? caption() : caption) || "";
    }

    function isLink(el) {
        return el.tagName === "A";
    }

    // A mouse or trackpad gets the hover card; everything else gets the drawer.
    function useCard() {
        return canHover.matches;
    }

    /* ---- Set up each trigger ---------------------------------------- */

    // What the link is, in words, for screen readers: "Demo video", "Blog post".
    function kindOf(card) {
        if (!card.url || !card.badge) return "";
        var isVideo = card.icon === "video" && !/video/i.test(card.badge);
        return card.badge + (isVideo ? " video" : "");
    }

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
        // A quiet card leaves its word looking like ordinary text.
        el.classList.add(card.quiet ? "card-quiet" : "card-link");

        // A picture with no caption is described by its alt text instead.
        var text = [kindOf(card), captionOf(card) || card.alt]
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
            if (e.pointerType === "mouse" && useCard()) showCard(el, e);
        });
        el.addEventListener("pointermove", function (e) {
            if (shown === el && e.pointerType === "mouse") aim(e);
        });
        el.addEventListener("pointerleave", function () {
            if (shown === el) hideCard();
        });
        el.addEventListener("focus", function () {
            if (useCard() && el.matches(":focus-visible")) showCard(el, null);
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

    // The picture itself: image, with the badge and caption laid over it.
    function figureMarkup() {
        return (
            '<div class="preview-figure">' +
            '<div class="preview-media"><img alt="" decoding="async" draggable="false" /></div>' +
            '<span class="preview-badge"></span>' +
            '<p class="preview-caption"></p>' +
            "</div>"
        );
    }

    // Put a card's image, badge and caption into a figure.
    function fill(root, card, onResize) {
        var figure = root.querySelector(".preview-figure");
        var media = figure.querySelector(".preview-media");
        var img = media.querySelector("img");
        var badge = figure.querySelector(".preview-badge");
        var caption = figure.querySelector(".preview-caption");

        var words = captionOf(card);
        figure.style.setProperty("--tone", card.tone || "#161616");
        figure.classList.toggle("no-image", !card.image);
        figure.classList.toggle("no-caption", !words);
        img.style.objectPosition = card.focus || "";
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
                figure.classList.add("no-image");
                if (onResize) onResize();
            };
            img.src = card.image;
        } else {
            media.hidden = true;
        }

        var showBadge = Boolean(card.url && card.badge);
        badge.hidden = !showBadge;
        badge.innerHTML = "";
        if (showBadge) {
            badge.appendChild(document.createTextNode(card.badge));
            if (ICONS[card.icon]) {
                badge.insertAdjacentHTML("beforeend", ICONS[card.icon]);
            }
        }
        caption.textContent = words;
    }

    /* ---- Mouse: a card on a springy stem ------------------------------
     *
     * The card stands on a point just above the hovered word (the "foot").
     * The foot is pulled toward a spot between the word and the pointer by a
     * spring, so it keeps close to the word and follows the pointer loosely.
     * The card pivots about the foot: when the foot moves, the top of the card
     * lags behind and then swings back, like a reed. Moving to another word
     * carries the same card across, with the same momentum.
     */

    var GAP = 12; // px between the word and the card
    var EDGE = 10; // px kept clear of the window edge
    var FOLLOW = 0.55; // how far the foot goes toward the pointer (0 = stays put)
    var FOOT = { stiffness: 210, damping: 21 }; // settles quickly, tiny overshoot
    var SWAY = { stiffness: 170, damping: 19 }; // one soft swing back, no ringing
    var POP = { stiffness: 320, damping: 24 }; // growing out of the word
    var LEAN_PER_SPEED = 0.007; // degrees of lean per px/s of foot speed
    var MAX_LEAN = 6; // degrees
    var FADE = 160; // ms; matches the opacity transition in styles.css

    var cardEl = null;
    var shown = null; // the trigger the card is showing for
    var pointer = null; // last pointer position over the trigger, or null
    var frame = 0;
    var lastTime = 0;
    var below = false; // card sits under the word when there's no room above
    var restTilt = 0;
    var hiddenAt = -1e9; // when the card was last put away
    var size = { w: 0, h: 0 };
    // Spring state: foot position, sway angle and scale, each with a velocity.
    var s = { x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0, k: 1, vk: 0 };
    var goal = { x: 0, y: 0 };

    function buildCard() {
        cardEl = document.createElement("div");
        cardEl.className = "preview-card";
        // The caption reaches screen readers through aria-describedby.
        cardEl.setAttribute("aria-hidden", "true");
        cardEl.innerHTML = figureMarkup();
        document.body.appendChild(cardEl);
    }

    // The part of the word under the pointer (a link can wrap over two lines).
    function lineOf(el) {
        var rects = el.getClientRects();
        if (pointer) {
            for (var i = 0; i < rects.length; i++) {
                if (pointer.y >= rects[i].top - 2 && pointer.y <= rects[i].bottom + 2) {
                    return rects[i];
                }
            }
        }
        return rects[0] || el.getBoundingClientRect();
    }

    // Work out where the foot should come to rest.
    function setGoal() {
        if (!shown || !cardEl) return;
        var word = lineOf(shown);
        var viewWidth = document.documentElement.clientWidth;
        size.w = cardEl.offsetWidth;
        size.h = cardEl.offsetHeight;

        var centre = word.left + word.width / 2;
        var x = pointer ? centre + (pointer.x - centre) * FOLLOW : centre;
        var half = size.w / 2;
        x = Math.max(EDGE + half, Math.min(x, viewWidth - EDGE - half));

        below = word.top - GAP - size.h < EDGE;
        goal.x = x;
        goal.y = below ? word.bottom + GAP : word.top - GAP;
        cardEl.classList.toggle("is-below", below);
    }

    function aim(e) {
        pointer = { x: e.clientX, y: e.clientY };
        setGoal();
        wake();
    }

    function showCard(el, e) {
        if (!cardEl) buildCard();
        // Coming from another word a moment ago counts as still being out.
        var arriving =
            !cardEl.classList.contains("is-visible") &&
            performance.now() - hiddenAt > FADE;
        shown = el;
        pointer = e ? { x: e.clientX, y: e.clientY } : null;
        fill(cardEl, cardFor(el), function () {
            setGoal();
            wake();
        });
        // Alternate the resting tilt so neighbouring cards lean different ways.
        restTilt = triggers.indexOf(el) % 2 ? 1.5 : -2;
        setGoal();

        if (reduceMotion.matches) {
            s.x = goal.x;
            s.y = goal.y;
            s.a = 0;
            s.k = 1;
            s.vx = s.vy = s.va = s.vk = 0;
            draw();
        } else if (arriving) {
            // Start small, at the word, and grow out of it.
            var word = lineOf(el);
            s.x = pointer ? pointer.x : word.left + word.width / 2;
            s.y = goal.y;
            s.vx = s.vy = 0;
            s.a = restTilt * 2;
            s.va = 0;
            s.k = 0.6;
            s.vk = 0;
            draw();
        } else {
            // Already out: carry on from where it is, with a small nudge.
            s.vk -= 1.2;
        }
        cardEl.classList.add("is-visible");
        wake();
        warmImages();
    }

    function hideCard() {
        if (!shown) return;
        shown = null;
        pointer = null;
        hiddenAt = performance.now();
        if (cardEl) cardEl.classList.remove("is-visible");
    }

    // Start the animation loop if it isn't running.
    function wake() {
        if (reduceMotion.matches) {
            if (shown) {
                s.x = goal.x;
                s.y = goal.y;
                draw();
            }
            return;
        }
        if (!frame) {
            lastTime = 0;
            frame = requestAnimationFrame(tick);
        }
    }

    function spring(value, velocity, target, config, dt) {
        var force = (target - value) * config.stiffness - velocity * config.damping;
        velocity += force * dt;
        return [value + velocity * dt, velocity];
    }

    function tick(now) {
        frame = 0;
        var dt = lastTime ? Math.min((now - lastTime) / 1000, 1 / 30) : 1 / 60;
        lastTime = now;

        // Two small steps per frame keep the springs stable on slow frames.
        for (var i = 0; i < 2; i++) {
            var h = dt / 2;
            var r = spring(s.x, s.vx, goal.x, FOOT, h);
            s.x = r[0];
            s.vx = r[1];
            r = spring(s.y, s.vy, goal.y, FOOT, h);
            s.y = r[0];
            s.vy = r[1];

            // The top lags behind the foot: lean away from the direction of travel.
            var lean = -s.vx * LEAN_PER_SPEED * (below ? -1 : 1);
            lean = Math.max(-MAX_LEAN, Math.min(MAX_LEAN, lean));
            r = spring(s.a, s.va, restTilt + lean, SWAY, h);
            s.a = r[0];
            s.va = r[1];

            r = spring(s.k, s.vk, 1, POP, h);
            s.k = r[0];
            s.vk = r[1];
        }
        draw();

        var moving =
            Math.abs(s.vx) + Math.abs(s.vy) > 2 ||
            Math.abs(s.va) > 0.5 ||
            Math.abs(s.vk) > 0.01 ||
            Math.abs(goal.x - s.x) + Math.abs(goal.y - s.y) > 0.3 ||
            Math.abs(restTilt - s.a) > 0.05;
        // Keep going until the card has settled, or has finished fading out.
        var fading = !shown && now - hiddenAt < FADE;
        if (moving && (shown || fading)) frame = requestAnimationFrame(tick);
    }

    // The foot is the card's bottom centre (or top centre when it sits below).
    function draw() {
        var left = s.x - size.w / 2;
        var top = below ? s.y : s.y - size.h;
        cardEl.style.transform =
            "translate3d(" + left.toFixed(2) + "px," + top.toFixed(2) + "px,0) " +
            "rotate(" + s.a.toFixed(2) + "deg) scale(" + s.k.toFixed(3) + ")";
    }

    /* ---- Touch: a sheet over the page ---------------------------------
     *
     * A tap opens the picture in a sheet at the bottom of the screen. The
     * picture runs edge to edge and the sheet carries on below it in the
     * picture's own tone, so the sheet is as tall as its picture needs.
     * Behind it the page shrinks back and dims, and slides up if it has to
     * so that the tapped word stays in view. Dragging the sheet down pulls
     * the page forward again in step with the finger.
     */

    var SHEET_MS = 450; // matches the sheet transitions in styles.css
    var SHEET_MAX = 0.6; // tallest picture, as a share of the screen height
    var RECEDE_SCALE = 0.94; // how small the page gets behind the sheet
    var RECEDE_DROP = 12; // px the page drops, so its rounded top shows
    var RECEDE_RADIUS = 14; // px
    var SCRIM = 0.45; // how dark the page gets
    var FLICK = 0.4; // px per ms; a faster downward flick closes the sheet
    var CLEARANCE = 64; // px kept between the tapped word and the sheet

    var root = document.documentElement;
    var page = document.querySelector(".page");
    var drawer = null;
    var scrim = null;
    var openLink = null;
    var closeButton = null;
    var active = null; // the trigger whose preview is in the sheet
    var drag = null;
    var swallowClick = false;
    var receded = false; // the page is pinned and pushed back
    var restoreTimer = 0;
    var sheetHeight = 0;
    var lift = 0; // px the page slides up to keep the tapped word in view
    var pageShift = 0; // the page's current vertical offset, in px

    // "Watch demo", "Read blog post": what the button will do.
    function actionLabel(card) {
        if (card.action) return card.action;
        if (!card.badge) return "Open";
        var verb = card.icon === "video" ? "Watch" : "Read";
        return verb + " " + card.badge.charAt(0).toLowerCase() + card.badge.slice(1);
    }

    function buildDrawer() {
        scrim = document.createElement("div");
        scrim.className = "preview-scrim";
        document.body.appendChild(scrim);

        drawer = document.createElement("div");
        drawer.className = "preview-drawer";
        drawer.setAttribute("role", "dialog");
        drawer.setAttribute("aria-modal", "true");
        // The close button is for keyboards and screen readers; it only shows
        // when a keyboard focuses it. On touch: swipe down or tap outside.
        drawer.innerHTML =
            '<div class="preview-drawer-bar">' +
            '<button type="button" class="preview-close">Close</button>' +
            "</div>" +
            figureMarkup() +
            '<a class="preview-open" draggable="false"></a>';
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

        // Drag the sheet down to dismiss it. The drag starts on the sheet, but
        // the finger can leave it, so the rest is followed on the document.
        drawer.addEventListener("pointerdown", function (e) {
            if (e.button || drag) return;
            drag = { id: e.pointerId, y: e.clientY, t: e.timeStamp, dy: 0, moved: false };
            document.addEventListener("pointermove", onDragMove, true);
            document.addEventListener("pointerup", onDragEnd, true);
            document.addEventListener("pointercancel", onDragEnd, true);
        });
        // A drag must not also count as a tap, wherever the finger lifts.
        document.addEventListener(
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

    function onDragMove(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var dy = e.clientY - drag.y;
        if (!drag.moved) {
            if (Math.abs(dy) < 6) return;
            drag.moved = true;
            drawer.classList.add("is-dragging");
            root.classList.add("sheet-dragging");
        }
        drag.dy = dy;
        if (dy >= 0) {
            // Down: the sheet follows the finger and the page comes forward.
            drawer.style.transform = "translateY(" + dy + "px)";
            setRecede(1 - Math.min(1, dy / sheetHeight));
        } else {
            // Up: there is nowhere to go, so it gives a little and resists.
            var give = 28 * (1 - 1 / (-dy / 80 + 1));
            drawer.style.transform = "translateY(" + (-give).toFixed(1) + "px)";
            setRecede(1);
        }
    }

    function onDragEnd(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag;
        drag = null;
        document.removeEventListener("pointermove", onDragMove, true);
        document.removeEventListener("pointerup", onDragEnd, true);
        document.removeEventListener("pointercancel", onDragEnd, true);
        drawer.classList.remove("is-dragging");
        root.classList.remove("sheet-dragging");
        if (!d.moved) return;
        swallowClick = true;
        setTimeout(function () {
            swallowClick = false;
        }, 50);
        var speed = d.dy / Math.max(1, e.timeStamp - d.t); // px per ms
        var far = d.dy > sheetHeight * 0.3;
        var flicked = d.dy > 16 && speed > FLICK;
        if (far || flicked) {
            closeDrawer();
        } else {
            drawer.style.transform = "";
            setRecede(1);
        }
    }

    // The picture is as wide as the sheet and as tall as its shape needs,
    // up to a share of the screen. Returns the sheet's resulting height.
    function sizeSheet(card) {
        var media = drawer.querySelector(".preview-media");
        var rest = drawer.offsetHeight - media.offsetHeight;
        var height = 0;
        if (card.image && card.width && card.height && !media.hidden) {
            var natural = (drawer.clientWidth * card.height) / card.width;
            height = Math.round(Math.min(natural, window.innerHeight * SHEET_MAX));
            media.style.aspectRatio = "auto";
            media.style.height = height + "px";
        } else {
            media.style.height = "";
        }
        return rest + height;
    }

    // Where the bottom of a word would be if the page were not pushed back.
    function restingBottom(el) {
        var bottom = el.getBoundingClientRect().bottom;
        if (!receded) return bottom;
        return (bottom - pageShift) / RECEDE_SCALE;
    }

    // Pin the page in place as a screen-sized layer, so it can be pushed back
    // as one piece and cannot scroll under the sheet.
    function pinPage() {
        if (receded) return;
        var scrolled = window.scrollY;
        page.style.height = window.innerHeight + "px";
        root.classList.add("sheet-open");
        page.classList.add("is-receded");
        page.scrollTop = scrolled;
        receded = true;
    }

    // Put the page back exactly where it was.
    function unpinPage() {
        if (!receded || active) return;
        var scrolled = page.scrollTop;
        page.classList.remove("is-receded");
        root.classList.remove("sheet-open");
        page.style.height = "";
        page.style.transform = "";
        page.style.borderRadius = "";
        window.scrollTo(0, scrolled);
        receded = false;
    }

    // amount: 1 is fully pushed back, 0 is where the page normally sits.
    function setRecede(amount) {
        var scale = 1 - (1 - RECEDE_SCALE) * amount;
        pageShift = (RECEDE_DROP - lift) * amount;
        page.style.transform = amount
            ? "translate3d(0," + pageShift.toFixed(1) + "px,0) scale(" + scale.toFixed(4) + ")"
            : "";
        page.style.borderRadius = (RECEDE_RADIUS * amount).toFixed(1) + "px";
        scrim.style.opacity = (SCRIM * amount).toFixed(3);
    }

    function openDrawer(el) {
        if (!drawer) buildDrawer();
        var card = cardFor(el);
        hideCard();
        var wordBottom = restingBottom(el);

        fill(drawer, card, null);
        drawer.style.setProperty("--tone", card.tone || "#161616");
        drawer.setAttribute(
            "aria-label",
            el.textContent.replace(/\s+/g, " ").trim() + " preview"
        );

        if (card.url) {
            openLink.hidden = false;
            openLink.href = card.url;
            openLink.textContent = actionLabel(card);
            if (ICONS[card.icon]) {
                openLink.insertAdjacentHTML("beforeend", ICONS[card.icon]);
            }
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
        drawer.classList.toggle("no-link", !card.url);

        if (active) active.classList.remove("is-active");
        active = el;
        el.classList.add("is-active");

        sheetHeight = sizeSheet(card);
        clearTimeout(restoreTimer);
        pinPage();
        // Slide the page up just enough to keep the word, and a couple of
        // lines after it, clear of the sheet.
        var room = window.innerHeight - sheetHeight - CLEARANCE;
        lift = Math.max(0, RECEDE_DROP + RECEDE_SCALE * wordBottom - room);
        setRecede(1);

        drawer.style.transform = "";
        drawer.classList.add("is-open");
        (card.url ? openLink : closeButton).focus({ preventScroll: true });
        warmImages();
    }

    function closeDrawer(options) {
        if (!active) return;
        var el = active;
        active = null;
        el.classList.remove("is-active");
        drawer.classList.remove("is-open");
        drawer.style.transform = "";
        setRecede(0);
        clearTimeout(restoreTimer);
        restoreTimer = setTimeout(unpinPage, reduceMotion.matches ? 0 : SHEET_MS);
        if (!options || options.restoreFocus !== false) {
            el.focus({ preventScroll: true });
        }
    }

    /* ---- Page-level events ------------------------------------------- */

    document.addEventListener("click", function (e) {
        var target = e.target;
        var el = target.closest ? target.closest("[data-card]") : null;
        if (el && triggers.indexOf(el) !== -1) {
            // With a mouse the link behaves as a link.
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

    // The card is placed against the window, so anything that moves the page
    // under it puts it away.
    window.addEventListener("scroll", hideCard, { passive: true });
    window.addEventListener("blur", hideCard);
    var lastWidth = window.innerWidth;
    window.addEventListener("resize", function () {
        hideCard();
        var turned = window.innerWidth !== lastWidth;
        lastWidth = window.innerWidth;
        if (!receded) return;
        // Phones resize when their toolbars show and hide: keep the pinned
        // page as tall as the screen. A change of width means the phone was
        // turned, or the window is now on a mouse: start again.
        page.style.height = window.innerHeight + "px";
        if (active && (turned || useCard())) closeDrawer();
    });

    // Coming back with the Back button can restore the page mid-sheet.
    window.addEventListener("pageshow", function (e) {
        if (e.persisted && receded && !active) unpinPage();
    });
})();

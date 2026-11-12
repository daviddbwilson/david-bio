/*
 * Preview cards for the home page.
 *
 * Each key matches a data-card="…" attribute in index.html. Edit captions,
 * images and URLs here; the markup does not need to change.
 *
 *   url      Where the link goes. Leave it out for a hover-only card: no badge
 *            and no "Open" button are shown, and the word is not a link.
 *            Keep the href in index.html the same as this, because that href
 *            is what works when JavaScript is off.
 *   badge    One or two words for what the link is: "Demo", "Talk",
 *            "Testimonial", "Blog post".
 *   icon     "video" or "post": the icon shown beside the badge.
 *   caption  A few words, shown on the image. Keep it to one short line.
 *   image    Path to the image (WebP, about 800px on the long edge).
 *   width, height  The image's pixel size, so the card is the right shape
 *            before the image has loaded.
 *   tone     A dark colour taken from the bottom edge of the image. The image
 *            fades into it so the caption stays readable.
 *   alt      Describes the image for people who can't see it.
 */
window.DB_CARDS = {
    disney: {
        url: "https://vimeo.com/738368274",
        badge: "Testimonial",
        icon: "video",
        caption: "Disney's testimonial. In front of the Falcon!",
        image: "assets/cards/01-disney-falcon.webp",
        width: 800,
        height: 450,
        tone: "#19191a",
        alt: "A Disney cast member speaking to camera in front of the Millennium Falcon",
    },
    neon: {
        url: "https://neon.ac/preview",
        badge: "Demo",
        icon: "video",
        caption: "Instant data exploration to stay in flow",
        image: "assets/cards/02-neon-canvas.webp",
        width: 800,
        height: 547,
        tone: "#1f1c14",
        alt: "Neon: a bar chart of sales by state, with one filter highlighted in pink across every other chart",
    },
    hunch: {
        url: "https://x.com/Scobleizer/status/1784743064541757913",
        badge: "Demo",
        icon: "video",
        // DRAFT caption.
        caption: "Hunch. A canvas for chaining AI models.",
        image: "assets/cards/03-hunch-canvas.webp",
        width: 800,
        height: 547,
        tone: "#1a1a1a",
        alt: "The Hunch canvas: a meeting video flows through transcription and summary blocks into a finished product brief",
    },
    agents: {
        url: "/blog/reliable-background-agents/",
        badge: "Blog post",
        icon: "post",
        // DRAFT caption.
        caption: "Before OpenClaw. Early is still wrong.",
        image: "assets/cards/04-agents-office.webp",
        width: 800,
        height: 600,
        tone: "#0b130e",
        alt: "An empty office at night, with one old monitor still running tool calls",
    },
    rewind: {
        url: "https://www.youtube.com/watch?v=gTQG0SfJb9Y",
        badge: "Talk",
        icon: "video",
        // DRAFT caption.
        caption: "LinkedIn Rewind. Idea to production in four days.",
        image: "assets/cards/05-rewind-cards.webp",
        width: 800,
        height: 546,
        tone: "#1b1918",
        alt: "Three overlapping LinkedIn Rewind cards, each summing up a person's year in posts, reactions and a top quote",
    },
    gda: {
        url: "https://hex.tech/blog/introducing-generative-data-apps/",
        badge: "Blog post",
        icon: "post",
        // DRAFT caption.
        caption: "Describe an app. An agent builds it.",
        // Placeholder image: has a play button overlaid; clean frame to come.
        image: "assets/cards/07-hex-gda-title-card.webp",
        width: 800,
        height: 417,
        tone: "#1b1819",
        alt: "Title card from the Hex launch video: Introducing Generative Data Apps",
    },
    evals: {
        url: "https://hex.tech/blog/we-used-evals-to-improve-ai-feature/",
        badge: "Blog post",
        icon: "post",
        // DRAFT caption.
        caption: "Wrong chart edits: 21% down to 3%.",
        // Placeholder image: may be replaced by a results chart from the post.
        image: "assets/cards/08-hex-evals-header.webp",
        width: 800,
        height: 495,
        tone: "#1d1320",
        alt: "The evals post's header: a mountain road of switchbacks on a purple background",
    },
};

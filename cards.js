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
 *   badge    "Video" or "Blog post": the kind of thing the link opens.
 *   caption  One short line.
 *   image    Path to the image (WebP, about 800px on the long edge).
 *   width, height  The image's pixel size, so the card is the right shape
 *            before the image has loaded.
 *   alt      Describes the image for people who can't see it.
 */
window.DB_CARDS = {
    disney: {
        url: "https://vimeo.com/738368274",
        badge: "Video",
        caption:
            "They shot a testimonial in front of the Millennium Falcon. A big moment for the kid from Cape Town.",
        image: "assets/cards/01-disney-falcon.webp",
        width: 800,
        height: 450,
        alt: "A frame from Disney's testimonial video, filmed in front of the Millennium Falcon",
    },
    neon: {
        url: "https://neon.ac/preview",
        badge: "Video",
        caption:
            "Neon. Filter one chart and every other chart responds instantly.",
        image: "assets/cards/02-neon-canvas.webp",
        width: 800,
        height: 500,
        alt: "Neon's canvas of linked charts",
    },
    hunch: {
        url: "https://x.com/Scobleizer/status/1784743064541757913",
        badge: "Video",
        caption:
            "Hunch. A canvas for chaining AI models together. Won Latent Space's AI UX award.",
        image: "assets/cards/03-hunch-canvas.webp",
        width: 800,
        height: 500,
        alt: "The Hunch canvas, with AI model blocks connected into a workflow",
    },
    agents: {
        url: "/blog/reliable-background-agents/",
        badge: "Blog post",
        caption: "Before OpenClaw and GrokBot. Early is still wrong.",
        image: "assets/cards/04-agents-office.webp",
        width: 800,
        height: 600,
        alt: "Illustration of an office staffed by background agents",
    },
    rewind: {
        url: "https://www.youtube.com/watch?v=gTQG0SfJb9Y",
        badge: "Video",
        caption:
            "LinkedIn Rewind. Idea to production in four days, then 60+ versions in 17.",
        image: "assets/cards/05-rewind-cards.webp",
        width: 800,
        height: 600,
        alt: "A spread of LinkedIn Rewind year-in-review cards",
    },
    gda: {
        url: "https://hex.tech/blog/introducing-generative-data-apps/",
        badge: "Blog post",
        // DRAFT caption: David to add his own line.
        caption:
            "Launched in beta, May 2026. Describe an app and an agent builds it on your governed data.",
        // Placeholder image: has a play button overlaid; clean frame to come.
        image: "assets/cards/07-hex-gda-title-card.webp",
        width: 800,
        height: 450,
        alt: "Title card from the launch video for Hex's generative data apps",
    },
    evals: {
        url: "https://hex.tech/blog/we-used-evals-to-improve-ai-feature/",
        badge: "Blog post",
        // DRAFT caption.
        caption:
            "I wrote up how we used evals to take wrong chart edits from 21% to 3%. Most of the gain came from the code around the model, not the prompt.",
        // Placeholder image: may be replaced by a results chart from the post.
        image: "assets/cards/08-hex-evals-header.webp",
        width: 800,
        height: 420,
        alt: "Header image from the Hex blog post on evals",
    },
};

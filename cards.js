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
 *            "Testimonial", "Blog post", "Case study".
 *   icon     "video" or "post": the icon shown beside the badge.
 *   caption  A few words, shown on the image. Keep it to one short line.
 *            Leave it out to show the image on its own. It can also be a
 *            function that returns the words, for a caption that changes.
 *   action   Optional. The words on the phone sheet's button. Without it the
 *            button says "Watch <badge>" for a video and "Read <badge>" for
 *            anything else.
 *   quiet    Optional. true leaves the word looking like ordinary text, with
 *            no dotted underline: a preview for people who happen on it.
 *   image    Path to the image (WebP, about 800px on the long edge).
 *   width, height  The image's pixel size, so the card is the right shape
 *            before the image has loaded.
 *   tone     A dark colour taken from the bottom edge of the image. The image
 *            fades into it so the caption stays readable.
 *   focus    Optional. Which part of the image to keep when it has to be
 *            cropped (the drawer crops tall images), as a CSS object-position
 *            value such as "50% 10%" for "the top middle".
 *   alt      Describes the image for people who can't see it.
 */
window.DB_CARDS = {
    // An easter egg on the name at the top: a photo and a greeting that
    // follows the visitor's clock.
    hello: {
        quiet: true,
        caption: function () {
            var hour = new Date().getHours();
            var part =
                hour >= 5 && hour < 12
                    ? "morning"
                    : hour >= 12 && hour < 18
                      ? "afternoon"
                      : "evening";
            return "Good " + part + "! \uD83D\uDC4B";
        },
        image: "assets/cards/00-david.webp",
        width: 800,
        height: 800,
        tone: "#16191d",
        focus: "50% 30%",
        alt: "David, smiling, in a cream cable-knit jumper",
    },
    hardware: {
        url: "https://www.bould.com/work/aruba",
        badge: "Case study",
        icon: "post",
        caption: "I loved working with Fred Bould and his team to design our sensor",
        image: "assets/cards/11-cape-sensor-mounting.webp",
        width: 768,
        height: 432,
        tone: "#1a1a1a",
        alt: "Five steps of mounting the sensor: a wall plate, a bracket, a yellow network cable, and the white ribbed sensor clipping on",
    },
    // No url: a picture and a caption only, on the word "software".
    software: {
        caption: "Simple at a glance. More detail as you dig.",
        image: "assets/cards/10-cape-dashboard.webp",
        width: 800,
        height: 435,
        tone: "#161d18",
        alt: "The Cape dashboard on a laptop, with a green smiley for each part of the network, in front of a monitor showing detailed WiFi charts",
    },
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
        caption: "Before OpenClaw. Early is still wrong :(",
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
        caption: "My first product launch at Hex",
        // A frame from the launch video, with the player's play button on it.
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
        caption: "Wrong chart edits: 21% down to 3%.",
        // The post's header image.
        image: "assets/cards/08-hex-evals-header.webp",
        width: 800,
        height: 495,
        tone: "#1d1320",
        alt: "The evals post's header: a mountain road of switchbacks on a purple background",
    },
    // No url: this one is a picture only, on the word "family".
    // The children's faces are covered in the image file itself.
    family: {
        image: "assets/cards/09-family-cards.webp",
        width: 800,
        height: 929,
        tone: "#1a1a19",
        focus: "50% 8%",
        alt: "My family dressed as playing cards: a king, a queen and two jokers. The children's faces are covered with emoji.",
    },
};

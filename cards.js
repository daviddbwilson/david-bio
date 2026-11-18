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
 *   icon     "video", "post", "play" or "game": the icon shown beside the badge.
 *   caption  A few words, shown on the image. Keep it to one short line.
 *            Leave it out to show the image on its own. It can also be a
 *            function that returns the words, for a caption that changes,
 *            or a list of versions, longest first: the card shows the first
 *            that fits on two lines.
 *   action   Optional. The words on the phone sheet's button. Without it the
 *            button says "Watch <badge>" for a video and "Read <badge>" for
 *            anything else.
 *   quiet    Optional. true leaves the word looking like ordinary text, with
 *            no dotted underline: a preview for people who happen on it.
 *   image    Path to the image (WebP, about 800px on the long edge).
 *   video    Optional. Path to a short silent MP4 that plays in a loop over the
 *            image. The image should be the video's first frame, at the same
 *            shape: it shows until the video starts, and on its own for
 *            people who have asked for reduced motion.
 *   width, height  The image's pixel size, so the card is the right shape
 *            before the image has loaded.
 *   tone     A dark colour taken from the bottom edge of the image. The image
 *            fades into it so the caption stays readable.
 *   focus    Optional. Which part of the image to keep when it has to be
 *            cropped (the drawer crops tall images), as a CSS object-position
 *            value such as "50% 10%" for "the top middle".
 *   light    Optional. Set to true when the image is mostly white, so the
 *            badge gets a darker glass and stays readable.
 *   fullBleed  Optional. true runs the photo to the bottom edge of the card,
 *            with no band of tone below it and only a light shade behind the
 *            caption. For photos of people, where the fade would hide too much.
 *   badgeAt  Optional. "bottom" puts the badge in the bottom left corner, for
 *            a picture with something in its top left. Only for cards with
 *            no caption, because the caption sits there.
 *   alt      Describes the image for people who can't see it.
 */
window.DB_CARDS = {
    // An easter egg on the name at the top: a photo and a greeting. When
    // San Francisco's weather is known, the greeting comes from David's own
    // time and weather; otherwise it follows the visitor's clock.
    hello: {
        quiet: true,
        caption: function () {
            var wave = " \uD83D\uDC4B"; // waving hand
            var weather = window.DB_SF_WEATHER;
            if (weather) {
                var sfHour = Number(
                    new Intl.DateTimeFormat("en-US", {
                        timeZone: "America/Los_Angeles",
                        hour: "numeric",
                        hourCycle: "h23",
                    }).format(new Date())
                );
                var greeting =
                    sfHour < 5 || sfHour >= 23
                        ? "Hello"
                        : sfHour < 12
                          ? "Good morning"
                          : sfHour < 18
                            ? "Good afternoon"
                            : "Good evening";
                // The shorter version is for a card too narrow for the longer.
                return [
                    greeting + " from " + weather + " San Francisco!" + wave,
                    greeting + " from San Francisco!" + wave,
                ];
            }
            var hour = new Date().getHours();
            var words =
                hour < 5
                    ? "Hello, night owl!"
                    : hour < 7
                      ? "Hello, early bird!"
                      : hour < 12
                        ? "Good morning!"
                        : hour < 18
                          ? "Good afternoon!"
                          : "Good evening!";
            return words + wave;
        },
        image: "assets/cards/00-david.webp",
        width: 800,
        height: 800,
        tone: "#16191d",
        focus: "50% 30%",
        fullBleed: true,
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
    // No caption: the picture carries its own title. The video is the game's
    // portrait trailer, cut down and silent; the image is its first frame,
    // which is mostly white paper, hence light.
    takeoff: {
        url: "https://takeoff.david.bio/",
        badge: "Play",
        icon: "game",
        action: "Play Takeoff",
        image: "assets/cards/12-takeoff-trailer.webp",
        video: "assets/cards/12-takeoff-trailer.mp4",
        width: 600,
        height: 800,
        tone: "#f6f6f6",
        light: true,
        // The title's handwriting runs through the top left corner.
        badgeAt: "bottom",
        alt: "Takeoff's trailer. It opens on the title card: 'a short story about takeoff' handwritten above a pencil sketch of a small round probe on white paper",
    },
    makingof: {
        url: "/blog/how-i-made-takeoff/",
        badge: "Blog post",
        icon: "post",
        caption: "Six evenings, and a joy to make",
        // A figure from the post: the first four pictures on the autopilot's
        // contact sheet.
        image: "assets/cards/13-takeoff-autopilot.webp",
        width: 800,
        height: 497,
        tone: "#101216",
        alt: "Four automated screenshots of rooms in the game, each with its test's file name underneath",
    },
    // No url: this one is a picture only, on "wife and two kids".
    // The children's faces are covered in the image file itself.
    family: {
        quiet: true,
        fullBleed: true,
        caption: "Trick or treat \uD83C\uDCCF", // joker
        image: "assets/cards/09-family-cards.webp",
        width: 800,
        height: 1066,
        tone: "#1b1a18",
        focus: "50% 8%",
        alt: "My family dressed as playing cards: a king, a queen and two jokers. The children's faces are covered with emoji.",
    },
};

/*
 * San Francisco's weather for the greeting on the name, as a phrase such as
 * "a foggy" or "an unusually warm". Fetched once a visit from the US National
 * Weather Service's forecast for downtown San Francisco (free, no key) and
 * kept for half an hour. If it fails, the greeting falls back to the
 * visitor's own clock.
 */
(function () {
    // Normal highs and lows for downtown San Francisco, in °C, for the middle
    // of each month (1991-2020, rounded). normalFor() reads between them, so
    // "unusual" is judged against the normal for this week of the year.
    var NORMAL_HIGH = [14.4, 15.9, 16.9, 17.8, 18.9, 20.3, 20.5, 20.9, 22.2, 21.7, 18.3, 14.4];
    var NORMAL_LOW = [8.0, 9.2, 9.6, 10.3, 11.3, 12.4, 13.2, 13.8, 14.1, 13.1, 10.5, 8.1];
    // The forecast for the grid square over downtown (37.7749, -122.4194).
    var URL = "https://api.weather.gov/gridpoints/MTR/85,105/forecast";
    var KEY = "db-sf-weather";

    function normalFor(normals, isoDate) {
        var month = Number(isoDate.slice(5, 7)) - 1;
        var day = Number(isoDate.slice(8, 10));
        var t = (day - 15) / 30; // -0.5 to +0.5 of the way to the next month
        var other = normals[(month + (t < 0 ? 11 : 1)) % 12];
        return normals[month] + (other - normals[month]) * Math.abs(t);
    }

    // The forecast's words can't be relied on (the NWS says it has no fixed
    // list of them), but its icon codes are a fixed set: the icon URL looks
    // like .../icons/land/night/wind_bkn/tsra_sct,100, where the first code
    // is what it's like now and ",100" is the chance of it in percent.
    // The longest phrase here sets the longest caption, which must fit on two
    // lines on the card and on a 320px phone. Check before adding a longer one.
    function describe(data) {
        var now = data.properties.periods[0];
        var parts = /\/(day|night)\/([a-z_]+)(?:,(\d+))?/.exec(now.icon || "");
        if (!parts) return "";
        var day = parts[1] === "day";
        var windy = /^wind_/.test(parts[2]);
        var code = parts[2].replace(/^wind_/, "");
        var likely = !parts[3] || Number(parts[3]) >= 50;
        var temp = ((now.temperature - 32) * 5) / 9;
        var off = temp - normalFor(day ? NORMAL_HIGH : NORMAL_LOW, now.startTime);

        if (code === "fog") return "a foggy";
        if (likely && /^(tsra|tornado|hurricane|tropical_storm)/.test(code)) return "a stormy";
        if (likely && /^(snow|blizzard)$/.test(code)) return "a snowy";
        if (likely && /sleet|fzra|rain_snow/.test(code)) return "a wintry";
        if (likely && /^rain/.test(code)) {
            return /drizzle/i.test(now.shortForecast) ? "a drizzly" : "a rainy";
        }
        if (off >= 6) return "an unusually warm";
        if (off <= -5) return "an unusually chilly";
        if (windy) return "a windy";
        if (/^(haze|smoke|dust)$/.test(code)) return "a hazy";
        if (code === "skc" || code === "few") return day ? "a sunny" : "a clear";
        if (code === "sct") return "a partly cloudy";
        if (code === "bkn" || code === "ovc") return "a grey";
        return "";
    }

    function remember(phrase) {
        window.DB_SF_WEATHER = phrase;
        try {
            sessionStorage.setItem(KEY, JSON.stringify({ phrase: phrase, at: Date.now() }));
        } catch (e) {}
    }

    try {
        var saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
        if (saved && Date.now() - saved.at < 30 * 60 * 1000) {
            window.DB_SF_WEATHER = saved.phrase;
            return;
        }
    } catch (e) {}

    if (!window.fetch) return;
    fetch(URL)
        .then(function (r) {
            return r.ok ? r.json() : Promise.reject();
        })
        .then(function (data) {
            remember(describe(data));
        })
        .catch(function () {});
})();

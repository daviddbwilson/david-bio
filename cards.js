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
                    greeting + " from " + weather + " San Francisco" + wave,
                    greeting + " from San Francisco" + wave,
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
        // ?v= because the photo was recropped under the same name.
        image: "assets/cards/00-david.webp?v=2",
        width: 720,
        height: 744,
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
 * "a foggy" or "a snowy(!!!)". Fetched once a visit from the US National
 * Weather Service's forecast for downtown San Francisco (free, no key) and
 * kept for half an hour. If it fails, the greeting falls back to the
 * visitor's own clock.
 *
 * describeWeather() turns the forecast into one phrase from a fixed list.
 * The list is fixed so every possible caption can be checked to fit on two
 * lines; the longest ("an unusually warm") leaves about 6% to spare on a
 * 320px phone. Check before adding a longer phrase. Its rules were tuned
 * against 200+ real forecasts judged by a model (89% agreement).
 */
(function () {
    // Normal highs and lows for downtown San Francisco, in °C, for the middle
    // of each month (1991-2020, rounded). normalFor() reads between them, so
    // "unusual" is judged against the normal for this week of the year.
    var NORMAL_HIGH = [14.4, 15.9, 16.9, 17.8, 18.9, 20.3, 20.5, 20.9, 22.2, 21.7, 18.3, 14.4];
    var NORMAL_LOW = [8.0, 9.2, 9.6, 10.3, 11.3, 12.4, 13.2, 13.8, 14.1, 13.1, 10.5, 8.1];
    // The forecast for the grid square over downtown (37.7749, -122.4194).
    var URL = "https://api.weather.gov/gridpoints/MTR/85,105/forecast";
    var KEY = "db-sf-weather-2";

    function normalFor(normals, isoDate) {
        var month = Number(isoDate.slice(5, 7)) - 1;
        var day = Number(isoDate.slice(8, 10));
        var t = (day - 15) / 30; // -0.5 to +0.5 of the way to the next month
        var other = normals[(month + (t < 0 ? 11 : 1)) % 12];
        return normals[month] + (other - normals[month]) * Math.abs(t);
    }

    var PHRASES = [
        // Rare in San Francisco, so they get excited.
        "a stormy(!!!)", "a snowy(!!!)", "an icy(!!!)", "a frosty(!!)",
        "a thundery(!)", "a sweltering(!)", "a frigid(!)", "a very windy(!)",
        // Everyday.
        "a foggy", "a drizzly", "a soggy", "a showery", "a rainy",
        "an unusually warm", "an unusually chilly", "a balmy", "a windy", "a breezy",
        "a smoky", "a hazy", "a dusty",
        "a clearing", "a clouding-over",
        "a sunny", "a clear", "a mostly sunny", "a partly cloudy", "a cloudy", "a grey",
    ];

    function describeWeather(f) {
        var segs = String(f.icon || "").split("/");
        var when = segs.shift();
        var day = when ? when === "day" : !!f.day;
        var pop = Number(f.pop) || 0;
        var short = String(f.short || "").toLowerCase();
        var detail = String(f.detail || "").toLowerCase();
        // San Francisco's hour, when known: morning fog and frost burn off.
        var hour = f.hour == null ? 14 : Number(f.hour);
        var clauses = short.split(" then ");
        var PRECIP = /^(rain|rain_showers|rain_showers_hi|tsra|tsra_sct|tsra_hi|snow|blizzard|sleet|fzra|rain_fzra|snow_fzra|rain_snow|rain_sleet|snow_sleet)$/;
        var parsed = segs.map(function (s, i) {
            var m = /^([a-z_]+)(?:,(\d+))?$/.exec(s) || [];
            var code = (m[1] || "").replace(/^wind_/, "");
            var words = clauses.length === segs.length ? clauses[i] : short;
            // The icon sometimes shows snow or storms the words don't mention.
            if (/^(snow|blizzard)$/.test(code) && !/snow|flurr|blizzard/.test(short)) code = "rain";
            if (/^tsra/.test(code) && !/thunder|t-storm/.test(short)) code = "rain";
            var chance = m[2] ? Number(m[2]) : PRECIP.test(code) ? pop : 100;
            // "Chance Light Rain" isn't rain; it takes 60% to count as it.
            var hedged = /^(slight chance|chance|isolated|scattered)\b/.test(words);
            return { windy: /^wind_/.test(m[1] || ""), code: code, chance: chance, hedged: hedged, likely: chance >= (hedged ? 60 : 50) };
        });
        var now = parsed[0] || { code: "", chance: 100, likely: false, windy: false };
        var next = parsed[1];
        var speeds = (String(f.wind || "").match(/\d+/g) || []).map(Number);
        var wind = Math.max.apply(null, [0].concat(speeds));
        var calmest = speeds.length ? Math.min.apply(null, speeds) : 0;
        var gust = Number(f.gust) || 0;
        var off = f.offC == null || f.offC === "" ? null : Number(f.offC);

        var SKY = /^(skc|few|sct|bkn|ovc)$/;
        var CLEARISH = /^(skc|few|sct)$/;
        var WET = /^(rain|rain_showers|rain_showers_hi|tsra|tsra_sct|tsra_hi)$/;
        var any = function (re) { return parsed.some(function (s) { return re.test(s.code) && s.likely; }); };
        var has = function (re) { return parsed.some(function (s) { return re.test(s.code); }); };
        var morning = day && hour < 11;

        // 1. The extraordinary, anywhere in the period.
        if (has(/^(tornado|hurricane|tropical_storm)$/)) return "a stormy(!!!)";
        // Only a chance of snow after rain that's likely is still a rainy period.
        var surelyWet = parsed.some(function (s) { return /^(rain|tsra)/.test(s.code) && s.likely && !s.hedged; });
        if (parsed.some(function (s) { return /^(snow|blizzard)$/.test(s.code) && s.likely && !(s.hedged && surelyWet); })) return "a snowy(!!!)";
        if (any(/sleet|fzra|rain_snow/) || (has(/^fog$/) && /freezing fog/.test(short))) return "an icy(!!!)";
        if (any(/^tsra/)) return "a thundery(!)";
        if (gust >= 45 || wind >= 35) return "a very windy(!)";
        if (has(/^dust$/) || /blowing dust/.test(short)) return "a dusty";

        // 2. Rain worth mentioning.
        if (any(WET)) {
            if (/drizzle/.test(short)) return "a drizzly";
            if (/heavy rain/.test(short) || (pop >= 90 && /^rain\b/.test(short))) return "a soggy";
            if (parsed.some(function (s) { return /showers/.test(s.code) && s.likely; })) return "a showery";
            return "a rainy";
        }

        // 3. Fog. By day, fog that gives way to sun only counts in the morning.
        var fogThenFair = day && now.code === "fog" && next && CLEARISH.test(next.code);
        if ((has(/^fog$/) || /\bfog\b/.test(clauses[clauses.length - 1])) && (!fogThenFair || morning)) return "a foggy";

        // 4. Temperature, against the normal for this week.
        var frost = /frost/.test(short) && (!day || morning);
        if (off != null) {
            if (off >= 10) return "a sweltering(!)";
            if (off <= -8) return frost ? "a frosty(!!)" : "a frigid(!)";
        }
        if (frost) return "a frosty(!!)";
        if (off != null) {
            if (off >= 6) return "an unusually warm";
            if (off <= -5) return "an unusually chilly";
            if (!day && off >= 4) return "a balmy";
        }
        if (now.code === "hot") return "a sweltering(!)";
        if (now.code === "cold") return "a frigid(!)";

        // 5. Wind.
        if (parsed.some(function (s) { return s.windy; }) || wind >= 23 || (wind >= 20 && calmest >= 15) || gust >= 30) return "a windy";

        // 6. What's in the air.
        if (has(/^smoke$/)) return "a smoky";
        if (has(/^haze$/)) return "a hazy";

        // 7. Changing skies: a real chance of rain that clears, or fair weather
        //    that turns to likely rain.
        if (PRECIP.test(now.code) && now.chance >= 45 && next && CLEARISH.test(next.code)) return "a clearing";
        if (CLEARISH.test(now.code) && next && PRECIP.test(next.code) && next.likely) return "a clouding-over";

        if (wind >= 16 || gust >= 28) return "a breezy";

        // 8. The sky. With only an unlikely chance of rain in the icon, take the
        //    sky from the words, and assume some cloud if they don't say.
        var sky = SKY.test(now.code) ? now.code : next && SKY.test(next.code) ? next.code : "";
        var text = sky === "bkn" || sky === "" ? short + " " + detail : "";
        if (/partly sunny|partly cloudy/.test(text)) return "a partly cloudy";
        if (/mostly sunny/.test(text)) return "a mostly sunny";
        if (/mostly clear/.test(text)) return "a clear";
        if (/mostly cloudy/.test(text)) return "a cloudy";
        if (!sky && /\b(sunny)\b/.test(text)) return "a sunny";
        if (!sky && /\b(clear)\b/.test(text)) return "a clear";
        if (!sky && /\bcloudy\b/.test(text)) return "a grey";
        if (!sky && PRECIP.test(now.code)) return now.chance >= 30 ? "a cloudy" : "a partly cloudy";
        if (sky === "skc" || sky === "few") return day ? "a sunny" : "a clear";
        if (sky === "sct") return day ? "a mostly sunny" : "a partly cloudy";
        if (sky === "bkn") return "a cloudy";
        if (sky === "ovc") return "a grey";
        return "";
    }

    // From the forecast's current 12-hour period to describeWeather's input.
    function describe(data) {
        var p = data.properties.periods[0];
        var detail = p.detailedForecast || "";
        var gust = /gusts as high as (\d+)/.exec(detail);
        var tempC = ((p.temperature - 32) * 5) / 9;
        var sfHour = Number(
            new Intl.DateTimeFormat("en-US", {
                timeZone: "America/Los_Angeles",
                hour: "numeric",
                hourCycle: "h23",
            }).format(new Date())
        );
        return describeWeather({
            icon: String(p.icon || "").replace(/^.*\/icons\/land\//, "").replace(/\?.*$/, ""),
            day: p.isDaytime,
            short: p.shortForecast,
            detail: detail,
            pop: p.probabilityOfPrecipitation && p.probabilityOfPrecipitation.value,
            wind: p.windSpeed,
            gust: gust ? Number(gust[1]) : 0,
            offC: tempC - normalFor(p.isDaytime ? NORMAL_HIGH : NORMAL_LOW, p.startTime),
            hour: sfHour,
        });
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

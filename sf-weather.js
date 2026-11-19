/*
 * San Francisco's time and weather for the greeting on the name card:
 * "Good evening from a foggy San Francisco 👋". cards.js asks
 * window.DB_SF_GREETING() for it and falls back to the visitor's own clock
 * when it returns nothing.
 *
 * The weather is the next three hours of the US National Weather Service's
 * hourly forecast for downtown, plus SFO airport's latest reports for
 * thunder (both free, no key), fetched once a visit and kept for half an
 * hour. describeWeather() turns it into one phrase from PHRASES.
 * The list is fixed so every caption can be checked to fit on two lines.
 * The test harness loads this file under node, so it exports its pieces.
 */
(function (root) {
    var PHRASES = [
        // Rare in San Francisco, so they get excited.
        "a stormy(!!!)", "a snowy(!!!)", "an icy(!!!)", "a frosty(!!)",
        "a thundery(!)", "a sweltering(!)", "a frigid(!)", "a very windy(!)",
        "a foggy", "a drizzly", "a soggy", "a showery", "a rainy",
        "an unusually warm", "an unusually chilly", "a balmy", "a windy", "a breezy",
        "a smoky", "a hazy", "a dusty",
        "a clearing", "a clouding-over",
        "a sunny", "a clear", "a mostly sunny", "a partly cloudy", "a cloudy", "a grey",
    ];

    // Normal highs and lows for downtown San Francisco, in °C, for the middle
    // of each month (NOAA 1991-2020, rounded).
    var NORMAL_HIGH = [14.4, 15.9, 16.9, 17.8, 18.9, 20.3, 20.5, 20.9, 22.2, 21.7, 18.3, 14.4];
    var NORMAL_LOW = [8.0, 9.2, 9.6, 10.3, 11.3, 12.4, 13.2, 13.8, 14.1, 13.1, 10.5, 8.1];
    // The grid square over downtown (37.7749, -122.4194).
    var URL = "https://api.weather.gov/gridpoints/MTR/85,105/forecast/hourly";
    // What SFO airport is reporting now. Forecasts call any shower in a
    // stormy pattern "Showers And Thunderstorms", so thunder is only said
    // when the airport has actually heard it.
    var OBSERVED = "https://api.weather.gov/stations/KSFO/observations?limit=3";
    var KEY = "db-sf-weather-6";
    var CACHE_FOR = 30 * 60 * 1000;
    var GOOD_FOR = 60 * 60 * 1000;

    // San Francisco's date and time of day, wherever the visitor is.
    function sfClock(date) {
        var parts = {};
        new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Los_Angeles",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hourCycle: "h23",
        })
            .formatToParts(date)
            .forEach(function (p) {
                parts[p.type] = Number(p.value);
            });
        return { month: parts.month - 1, day: parts.day, hour: parts.hour + parts.minute / 60 };
    }

    // The forecast calls 6am to 6pm "day" all year, so "sunny" would show
    // after a winter sunset. Work it out from the sun over San Francisco
    // instead (the US Naval Observatory's low-precision formulas, good to a
    // few minutes).
    function sunIsUp(date) {
        var rad = Math.PI / 180;
        var d = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 864e5;
        var g = (357.529 + 0.98560028 * d) * rad;
        var q = 280.459 + 0.98564736 * d;
        var l = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad;
        var e = (23.439 - 0.00000036 * d) * rad;
        var ra = Math.atan2(Math.cos(e) * Math.sin(l), Math.cos(l));
        var dec = Math.asin(Math.sin(e) * Math.sin(l));
        var hourAngle = (18.697374558 + 24.06570982441908 * d) * 15 * rad - 122.4194 * rad - ra;
        var lat = 37.7749 * rad;
        var altitude = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(hourAngle));
        return altitude > -0.833 * rad;
    }

    // The normal temperature for this time of year and time of day, in °C.
    // Between mid-month values it reads across to the neighbouring month.
    function normalAt(date) {
        var c = sfClock(date);
        var t = (c.day - 15) / 30;
        var across = function (normals) {
            var other = normals[(c.month + (t < 0 ? 11 : 1)) % 12];
            return normals[c.month] + (other - normals[c.month]) * Math.abs(t);
        };
        var low = across(NORMAL_LOW);
        var high = across(NORMAL_HIGH);
        // How far from the low to the high it typically is at each three hours
        // from midnight: coolest at 6am, warmest at 3pm, cooling fast after dark.
        var DAY = [0.2, 0.1, 0, 0.25, 0.8, 1, 0.6, 0.35, 0.2];
        var i = Math.floor(c.hour / 3);
        var warmth = DAY[i] + (DAY[i + 1] - DAY[i]) * (c.hour / 3 - i);
        return low + (high - low) * warmth;
    }

    var PRECIP = /^(rain|rain_showers|rain_showers_hi|tsra|tsra_sct|tsra_hi|snow|blizzard|sleet|fzra|rain_fzra|snow_fzra|rain_snow|rain_sleet|snow_sleet)$/;
    var SKY = /^(skc|few|sct|bkn|ovc)$/;
    var CLEARISH = /^(skc|few|sct)$/;
    var WET = /^(rain|rain_showers|rain_showers_hi|tsra|tsra_sct|tsra_hi)$/;

    // One NWS icon code with its words, e.g. ("tsra_hi,30", "Chance Showers
    // And Thunderstorms", 40) → { code: "tsra_hi", chance: 30, ... }.
    // chance falls back to the chance of rain for rain and snow codes.
    function entry(iconCode, words, pop) {
        var m = /^([a-z_]+)(?:,(\d+))?$/.exec(iconCode || "") || [];
        var code = (m[1] || "").replace(/^wind_/, "");
        words = String(words || "").toLowerCase();
        // The icon sometimes shows snow or storms the words don't mention.
        if (/^(snow|blizzard)$/.test(code) && !/snow|flurr|blizzard/.test(words)) code = "rain";
        if (/^tsra/.test(code) && !/thunder|t-storm/.test(words)) code = "rain";
        var chance = m[2] ? Number(m[2]) : PRECIP.test(code) ? pop || 0 : 100;
        // "Chance Light Rain" isn't rain; it takes 60% to count as it.
        var hedged = /^(slight chance|chance|isolated|scattered)\b/.test(words);
        // Except showers and thunderstorms, which are hit-or-miss by nature,
        // so a forecast that mentions them at all is fair to repeat.
        var needs = !hedged ? 50 : /showers/.test(code) && !/^tsra/.test(code) ? 35 : /^tsra/.test(code) ? 50 : 60;
        return {
            code: code,
            chance: chance,
            hedged: hedged,
            // Only rain, snow and storms can be likely; a sky code never is.
            likely: PRECIP.test(code) && chance >= needs,
            windy: /^wind_/.test(m[1] || ""),
            words: words,
        };
    }

    // The words most of these entries share.
    function mostSaid(entries) {
        var n = function (e) { return entries.filter(function (o) { return o.words === e.words; }).length; };
        return entries.reduce(function (best, e) { return n(e) > n(best) ? e : best; }).words;
    }

    // w = {
    //   day:     the sun is up
    //   hour:    San Francisco's hour, 0-24 (morning fog and frost burn off)
    //   thunder, pouring: thunder or heavy rain reported at SFO in the last
    //            90 minutes
    //   pop:     highest chance of rain or snow, 0-100
    //   windAvg, windMax: mph, the average and the strongest
    //   tempC:   temperature now, °C, or null when unknown
    //   offC:    tempC minus the normal for now, or null
    //   entries: what's forecast, earliest first, each from entry()
    // }
    function describeWeather(w) {
        var all = w.entries;
        var now = all[0];
        var later = all.length > 1 ? all[all.length - 1] : null;
        var day = w.day;
        var off = w.offC;
        var morning = day && w.hour < 11;
        var words = all.map(function (e) { return e.words; }).join(" | ");
        var any = function (re) { return all.some(function (e) { return re.test(e.code) && e.likely; }); };
        var anySoon = function (re) { return all.slice(0, 2).some(function (e) { return re.test(e.code) && e.likely; }); };
        var has = function (re) { return all.some(function (e) { return re.test(e.code); }); };
        var soon = all.slice(0, 2);
        var fog = soon.some(function (e) { return e.code === "fog" || /\bfog\b/.test(e.words); });

        // 1. The extraordinary.
        if (has(/^(tornado|hurricane|tropical_storm)$/)) return "a stormy(!!!)";
        // Only a chance of snow after rain that's likely is still a rainy period.
        var surelyWet = all.some(function (e) { return /^(rain|tsra)/.test(e.code) && e.likely && !e.hedged; });
        if (all.some(function (e) { return /^(snow|blizzard)$/.test(e.code) && e.likely && !(e.hedged && surelyWet); })) return "a snowy(!!!)";
        if (any(/sleet|fzra|rain_snow/) || (fog && /freezing fog/.test(words))) return "an icy(!!!)";
        if (w.thunder && any(/^tsra/)) return "a thundery(!)";
        if (w.windMax >= 35) return "a very windy(!)";
        if (has(/^dust$/) || /blowing dust/.test(words)) return "a dusty";

        // 2. Rain worth mentioning. Dry now and wet soon is "clouding over".
        if (later && !now.likely && /^rain$/.test(later.code) && later.likely) return "a clouding-over";
        // Drizzle is forecast at low chances ("Patchy Drizzle", 15%) but it's
        // what SF summer mornings do, so the word is enough.
        if (all.slice(0, 2).some(function (e) { return /drizzle/.test(e.words) && !/chance/.test(e.words); })) return "a drizzly";
        if (anySoon(WET)) {
            if (/drizzle/.test(words)) return "a drizzly";
            if (w.pouring || /heavy rain/.test(words) || (w.pop >= 90 && /^rain\b/.test(now.words))) return "a soggy";
            if (all.slice(0, 2).some(function (e) { return /showers/.test(e.code) && e.likely; })) return "a showery";
            return "a rainy";
        }

        // 3. Fog. By day, fog that gives way to sun only counts in the morning.
        var fogThenFair = day && now.code === "fog" && later && CLEARISH.test(later.code);
        if (fog && (!fogThenFair || morning)) return "a foggy";

        // 4. Temperature against normal.
        var frost = /frost/.test(words) && (!day || morning);
        if (off != null) {
            if (off >= 10) return "a sweltering(!)";
            if (off <= -8) return frost ? "a frosty(!!)" : "a frigid(!)";
        }
        if (frost) return "a frosty(!!)";
        // Each also needs a temperature that feels like it: a foggy 59°F July
        // afternoon is normal, and a night has to reach 63°F to be balmy.
        if (off != null) {
            if (off >= 6 && w.tempC >= 20) return "an unusually warm";
            if (off <= -5 && w.tempC <= 12) return "an unusually chilly";
            if (!day && off >= 2 && w.tempC >= 17) return "a balmy";
        }
        if (now.code === "hot") return "a sweltering(!)";
        if (now.code === "cold") return "a frigid(!)";

        // 5. Wind.
        if (now.windy || w.windAvg >= 28) return "a windy";

        // 6. What's in the air.
        if (has(/^smoke$/)) return "a smoky";
        if (has(/^haze$/)) return "a hazy";

        // 7. A real chance of rain that clears.
        if (later && PRECIP.test(now.code) && now.chance >= 45 && CLEARISH.test(later.code)) return "a clearing";

        if (w.windAvg >= 22) return "a breezy";

        // 8. The sky now. With only an unlikely chance of rain in the icon, take
        //    it from the words, and assume some cloud if they don't say.
        var skies = all.filter(function (e) { return SKY.test(e.code); });
        var count = function (e) { return skies.filter(function (o) { return o.code === e.code; }).length; };
        // What most of the hours say, or the first hour if that's clearer:
        // a clear evening clouding up later still reads as clear now.
        var CLEARNESS = ["skc", "few", "sct", "bkn", "ovc"];
        var skyFrom = skies.length ? skies.reduce(function (best, e) { return count(e) > count(best) ? e : best; }) : null;
        if (skyFrom && SKY.test(now.code) && CLEARNESS.indexOf(now.code) < CLEARNESS.indexOf(skyFrom.code)) skyFrom = now;
        var sky = skyFrom ? skyFrom.code : "";
        var text = sky === "bkn" || sky === "" ? (skyFrom ? mostSaid(skies.filter(function (e) { return e.code === sky; })) : now.words) : "";
        if (/partly sunny|partly cloudy/.test(text)) return "a partly cloudy";
        if (/mostly sunny/.test(text)) return "a mostly sunny";
        if (/mostly clear/.test(text)) return "a clear";
        if (/mostly cloudy/.test(text)) return "a cloudy";
        if (!sky && /\bsunny\b/.test(text)) return day ? "a sunny" : "a clear";
        if (!sky && /\bclear\b/.test(text)) return "a clear";
        if (!sky && /\bcloudy\b/.test(text)) return "a grey";
        if (!sky && PRECIP.test(now.code)) return now.chance >= 20 ? "a cloudy" : "a partly cloudy";
        if (sky === "skc" || sky === "few") return day ? "a sunny" : "a clear";
        if (sky === "sct") return day ? "a mostly sunny" : "a partly cloudy";
        if (sky === "bkn") return "a cloudy";
        if (sky === "ovc") return "a grey";
        return "";
    }

    // The next three hours of the hourly forecast, as describeWeather's input.
    // observations: the airport's recent reports, or null when unknown.
    function fromHourly(periods, date, observations) {
        // An hour with less than 20 minutes left is mostly over.
        var hours = periods
            .filter(function (p) { return Date.parse(p.endTime) > date.getTime() + 20 * 60 * 1000; })
            .slice(0, 3);
        if (!hours.length) return null;
        var pop = 0;
        var winds = [];
        var entries = hours.map(function (p) {
            var chance = (p.probabilityOfPrecipitation && p.probabilityOfPrecipitation.value) || 0;
            pop = Math.max(pop, chance);
            winds = winds.concat((String(p.windSpeed).match(/\d+/g) || []).map(Number));
            var code = String(p.icon || "").replace(/^.*\/icons\/land\/(day|night)\//, "").replace(/\?.*$/, "").split("/")[0];
            return entry(code, p.shortForecast, chance);
        });
        var temp = hours[0].temperature;
        var reported = function (code, words) {
            return (observations || []).some(function (o) {
                var recent = date.getTime() - Date.parse(o.timestamp) < 90 * 60 * 1000;
                var said = (o.presentWeather || []).some(function (pw) { return code.test(pw.rawString || ""); }) || words.test(o.textDescription || "");
                return recent && said;
            });
        };
        return {
            thunder: reported(/TS/, /thunder/i),
            pouring: reported(/^\+(RA|SHRA)/, /heavy rain/i),
            day: sunIsUp(date),
            hour: sfClock(date).hour,
            pop: pop,
            windAvg: winds.length ? winds.reduce(function (a, b) { return a + b; }, 0) / winds.length : 0,
            windMax: winds.length ? Math.max.apply(null, winds) : 0,
            tempC: typeof temp === "number" ? ((temp - 32) * 5) / 9 : null,
            offC: typeof temp === "number" ? ((temp - 32) * 5) / 9 - normalAt(date) : null,
            entries: entries,
        };
    }

    // The greeting as [long, short], or null when the weather isn't known.
    // The short one is for a card too narrow for the long one. The forecast
    // is kept, not the phrase, so day, night and morning are worked out at
    // the moment of the hover.
    var weather = null;
    var weatherAt = 0;
    var loading = false;

    function greeting() {
        // An hour-old forecast in a tab left open is out of date: fall back
        // to the visitor's clock and fetch again for the next hover.
        if (!weather || Date.now() - weatherAt > GOOD_FOR) {
            if (weatherAt && !loading) load();
            return null;
        }
        var now = new Date();
        var h = sfClock(now).hour;
        var day = sunIsUp(now);
        var phrase = describeWeather(Object.assign({}, weather, { day: day, hour: h }));
        if (PHRASES.indexOf(phrase) < 0) return null;
        // Evening starts at sunset or 6pm, whichever comes first: "afternoon"
        // reads oddly an hour after a 4:55pm winter sunset.
        var hello = h < 5 || h >= 23 ? "Hello" : h < 12 ? "Good morning" : h < 18 && day ? "Good afternoon" : "Good evening";
        var wave = " \uD83D\uDC4B"; // waving hand
        return [hello + " from " + phrase + " San Francisco" + wave, hello + " from San Francisco" + wave];
    }

    function load() {
        try {
            // A saved forecast still good enough to use is used straight away;
            // past half an hour it's also fetched again.
            var saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
            if (saved && saved.w && Date.now() - saved.at < GOOD_FOR) {
                weather = saved.w;
                weatherAt = saved.at;
                if (Date.now() - saved.at < CACHE_FOR) return;
            }
        } catch (e) {}
        if (!root.fetch) return;
        loading = true;
        var get = function (url) {
            return fetch(url).then(function (r) {
                if (!r.ok) throw new Error("HTTP " + r.status + " from " + url);
                return r.json();
            });
        };
        Promise.all([
            get(URL),
            // Without the airport's reports the card just won't say thundery.
            get(OBSERVED).catch(function () {
                return null;
            }),
        ])
            .then(function (both) {
                var now = new Date();
                var observed = both[1] && both[1].features.map(function (f) { return f.properties; });
                var w = fromHourly(both[0].properties.periods, now, observed);
                if (!w) throw new Error("no hours left in the forecast");
                weather = w;
                weatherAt = now.getTime();
                try {
                    sessionStorage.setItem(KEY, JSON.stringify({ w: w, at: weatherAt }));
                } catch (e) {}
            })
            .catch(function (e) {
                // The greeting quietly falls back to the visitor's clock; this
                // is the only sign the weather stopped working.
                console.warn("david.bio: no San Francisco weather for the name card", e);
            })
            .then(function () {
                loading = false;
            });
    }

    root.DB_SF_GREETING = greeting;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = { PHRASES: PHRASES, entry: entry, describeWeather: describeWeather, fromHourly: fromHourly, normalAt: normalAt, sunIsUp: sunIsUp, greeting: greeting, _set: function (w, at) { weather = w; weatherAt = at; } };
    } else {
        load();
    }
})(typeof window !== "undefined" ? window : globalThis);

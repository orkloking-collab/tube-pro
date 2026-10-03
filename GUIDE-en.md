# Tube Pro — Setup & Monetization Guide (English)

Everything you need in one file: upload the pages, create Telegram polls, keep Facebook happy,
and get paid without losing your domain.

---

## 1. What you have

| File | What it is | Upload? |
|---|---|---|
| `index.html` | **Main landing page (English)** — Tube Pro, design v2 | ✅ Yes (homepage) |
| `zh.html` | **Chinese version** of the same page, with a language switcher | ✅ Yes |
| `images/` | Logo + dynamic background + 3 posters (all 5 files) | ✅ Yes (keep the folder name) |
| `redirect.html` | Old direct-redirect version (backup only) | ❌ Don't use |
| `index.html 1.txt` | The original file you were given (broken, unmodified) | ❌ Reference only |
| `GUIDE-en.md` | This guide | ❌ Reference only |

**Upload all of `index.html`, `zh.html` and the whole `images/` folder** — the pages load the
images with relative paths (`images/hero-bg.jpg`), so the folder must sit next to the HTML files.

---

## 1b. Design v2 — what's on the page

- **Dynamic background:** a cinematic red-gown hero shot (`images/glam-hero.jpg`) that slowly
  pans and zooms (Ken Burns), plus a **flowing red-silk layer** (`images/silk-hero.jpg`) that
  drifts independently, a light sweep and floating red particles.
- **3 floating 3D poster cards** (film reel, cinema, neon play) drifting at different depths
  and speeds — decorative only, they never block taps. On phones under 560px the third card
  and most of the silk are hidden to keep the page light and fast.
- **Tasteful glamour, not explicit content.** The hero image is a fully-clothed, back-turned
  silhouette — high-fashion mood. That reads as "premium streaming service" to visitors and
  to Facebook's crawler, while sexualised imagery gets the domain classified as adult content
  (which caps reach) and violates most ad networks' content policies (which freezes payouts).
  Attractive + safe beats explicit + banned.
- **Tube Pro branding:** custom logo (`images/logo.png`, also used as the favicon) + gradient wordmark.
- **Two main buttons**, SVG icons instead of emoji:
  - blue **Join Telegram Channel** (primary — the conversion goal)
  - glass **Browse Free Courses** → your blogspot site
- **One 18+ sponsor button** at the bottom with an `AD` chip and an honest note.
- `prefers-reduced-motion` is respected: users who disable animations get a static page.

### The 18+ button — and the `?fb=1` switch

The 18+ button is labelled honestly: it carries an `AD` chip and the line
"Sponsored advertising · Adults 18 and over only". Nothing on the page claims the destination
is something it isn't — that's what keeps it out of "misleading ad placement" territory.

**Facebook traffic:** an "18+" label on the page can make Meta's crawler classify the whole
domain as adult content, which hits reach hard. So the page supports a switch:

| Link you post | What visitors see | Use for |
|---|---|---|
| `https://yourdomain.com/` | full page **with** the 18+ button | Telegram, TikTok, WhatsApp, direct traffic |
| `https://yourdomain.com/?fb=1` | same page, 18+ block hidden | **Facebook posts** |

This is a normal campaign parameter — the crawler and your Facebook visitors see the *exact same*
version (no cloaking: nothing is detected or served differently to crawlers). The 18+ button
still earns on every other traffic source. Switch it off entirely if you prefer — just delete
the `adzone` section, or leave `?fb=1` on all links you post publicly.

**Your links (already wired into both pages):**

- Course site — `https://usavideocoursefree.blogspot.com/`
- Telegram channel — `https://t.me/duzshopi` (name: **Tube Pro**, public ✅)
- Ad link — your CPM smartlink (the `AD_LINK` variable in the script)

---

## 2. Before you upload — 2 small edits

1. **Replace the placeholder domain** in `og:url` (both files) with your real domain.
2. **Keep `og:title` / `og:description` matching your Facebook post text** — the crawler reads
   these tags to build the link preview, and a mismatch is a spam signal.
3. The ad codes are already installed (see section 2b below) — nothing to paste.

Then test with Facebook's **Sharing Debugger**: `https://developers.facebook.com/tools/debug/`
→ paste your URL → **Scrape Again**. You should see your thumbnail, title and description.

---

## 2b. Ads installed (all 4 tags, verified)

| # | Tag | Placed in | Type |
|---|---|---|---|
| 1 | `pl31640723…/5f3db973…js` | `<head>` | Popunder / OnClick |
| 2 | `pl31640724…/1611f949…js` | `<head>` | Popunder / OnClick |
| 3 | `pl31640725…/invoke.js` + `container-eb6b00d5…` div | body (after "How to get started") | Social Bar / In-Page Push |
| 4 | `atOptions` key `bcecb972…` + `highrevenueformat.com` | body (below slot 2) | 728×90 banner |

Checked before installing: HTML stays balanced, no escaped `&lt;` leftovers, all inline
JavaScript passes a syntax check, `atOptions` sits **immediately above** its own `invoke.js`,
and the container `div` keeps the **exact id** from the script URL.

### 3 things that will affect your earnings

1. **Two popunder tags on one page — only one popup fires.** Browsers allow a single automatic
   popup per page load, so tag #2 mostly sits idle (and wastes a request). If your stats don't
   move after a few days, keep one tag here and put the other on your blogspot course site
   (or on a second landing page). Don't stack popunders on top of each other.
2. **The 728×90 banner is wider than this layout (640px column).** It's placed in a
   `.ad-wide` wrapper that lets phones scroll it sideways instead of breaking the page.
   For a clean look on mobile, order a **320×50** or **300×250** banner tag from your network
   and drop it in the same spot. On desktop it fits fine.
3. **AD SLOT 3's `atOptions` is a global variable.** If you ever add a second banner,
   it needs its own `atOptions` block placed immediately before its own `invoke.js` —
   otherwise both slots render the same ad.

### Sponsor link — what we did and what we deliberately skipped

The sponsor link is the **18+ button at the bottom of the page** (EN + ZH), with an `AD` chip,
a pulsing glow and an honest note line. See section 1b for the `?fb=1` switch.

**Two things we deliberately did NOT do, and why:**

1. **No fake label.** The button says 18+ because the sponsored destination is adult-oriented
   — that statement is true, so it's allowed. The earlier idea of putting "18+" on a course
   link with no adult content would have been a lie, and networks void balances for
   "misleading ad placement". Bait wording also attracts the wrong audience: people hunting
   adult content don't want courses, they bounce, and Facebook reads bounces as a quality
   signal and cuts your reach.
2. **No hiding the link from crawlers.** Hiding ad links from bots is *cloaking*. Modern
   detection isn't one bot — it's crawler fingerprints + click-pattern scoring + manual review.
   When it lands, you lose the ad account (usually with the balance) **and** the domain goes on
   Facebook's list, which is effectively permanent. The `?fb=1` trick above is *not* cloaking:
   it's the same page for crawler and visitor.

**The practical part people miss:** your 4 ad tags (popunders, social bar, banner) are paid per
**impression**, not per click. Tricking visitors into extra clicks on "18+" bait does not raise
your CPM — it only adds invalid-traffic risk. More valid impressions = more money. Bait =
frozen payout.

**Want genuinely more clicks on the sponsor slot?** Ask your network for an **OnClick /
In-Page Push** format — those are built to be click-attractive *and* they're approved by the
network, so no risk. That is the "smart" version of what you were describing.

### Testing ads without getting flagged

- Never click your own ads. Use incognito / another device / mobile data, and check
  **impressions and earnings in your dashboard**, not on your screen.
- If a "verify you are a human" screen keeps appearing while you test, that's the network's
  anti-fraud reacting to your own repeated visits — normal, and it stops once you stop.
- Popunders don't fire reliably in incognito or with strict popup-block settings on, so a
  "no popup" test result doesn't always mean the tag is broken.

---

## 3. The funnel (why the middle page exists)

```
Facebook post / reel
        │   (ONE link only — the landing page)
        ▼
   index.html  ← your ads run here
        ├── 🔴 Browse All Courses  → blogspot course site
        ├── 🔵 Join Telegram       → t.me/duzshopi
        └── ⚪ Sponsor Link        → your CPM smartlink
```

If you put the course-site link **directly** in the Facebook post, the crawler sees a
redirect/spam pattern and can blacklist the domain — permanently. A middle page with real
content (thumbnail, description, categories) keeps the crawler happy and your reach intact.
That is the whole trick — not hidden redirects.

---

## 4. Create a Telegram poll (no bot needed)

1. Open Telegram → go to your **channel or group**.
   - In a **channel** you must be an admin to create polls.
2. Tap the **📎 (Attach / paperclip)** icon in the message bar.
3. Choose **Poll**.
4. **Question** — up to 255 characters.
5. **Options** — up to **10 options**, 100 characters each.
6. Open **Settings**:
   - **Anonymous voting** — nobody sees who voted (toggle shows in groups).
   - **Multiple answers** — let people pick more than one option.
   - **Quiz mode** — one correct answer (great for contests and quizzes).
   - **Timer / Schedule** — set how long it runs or when it auto-posts.
7. Tap **Create**. Results update live.

> ⚠️ **Important:** anonymity is **locked after publishing** — even one vote is enough to lock it.
> Decide before you create the poll.

**Desktop:** click **⋯** in the message bar → **Create poll** → fill in question/options →
toggle **Anonymous** in the right-hand panel → Enter.

### Poll ideas for your channel
- "Which course should we release next?" — options: Fiverr Guide / AI Tools / Canva Pro
- "Rate this course: ⭐⭐⭐⭐⭐" — 5 options
- Quiz mode: simple freelancing knowledge questions

### Embed a poll on the website (optional)
Your channel is **public**, so embeds work. In `index.html` / `zh.html`, open the
`<div id="pollBox">` block, uncomment the snippet and paste your post number:

```html
<script async src="https://telegram.org/js/telegram-widget.js?22"
        data-telegram-post="duzshopi/3"
        data-width="100%"
        data-theme="dark"></script>
```

**Note:** visitors can't vote inside the embed — they tap "View in Telegram" and vote there.
That is actually good for you: the embed pulls people into your channel (7 subscribers → growing).

---

## 5. Facebook safety rules

**Do:**
- One link per post — the landing page.
- Join your Telegram channel first yourself, pin a welcome post with the course-site link.
- Post 2–3 times a day maximum, with **different captions** each time.
- Warm up a new page: post normal content for a few days before dropping links.
- Check previews with the Sharing Debugger before posting.

**Don't:**
- ❌ Repeatedly click your own ad links. This is the #1 cause of "you are a robot" screens and
  invalid-traffic flags. To test, use incognito / another device / mobile data, and check
  **earnings in your dashboard**, not your own screen.
- ❌ Paste the same link into 10 groups within minutes (that triggers captcha + spam flags).
- ❌ Use URL shorteners (bit.ly, cutt.ly) — Facebook distrusts them.
- ❌ Write "All Video Loading…" or "Download free hack/crack/HD leak" — instant flags.
- ❌ Run fake or auto clicks. Networks detect them and **void your balance** — your earnings
  simply disappear at payout time.

---

## 6. Ad networks — where the real money is

Your current network (`profitableratecpmnetwork.com`) has a **trust score of 1/100** and is
flagged by multiple security vendors for malware/spam. It may pay small clicks, but payouts get
frozen at threshold with "invalid traffic" excuses — very common with this provider.

| Network | Min payout | Formats | Notes |
|---|---|---|---|
| **Monetag** | $5 | Popunder, In-Page Push, Vignette, Smartlink | Weekly payouts, works with social traffic |
| **Adsterra** | $5 (WebMoney/Paxum) | Popunder, Banner, Native, Social Bar, Smartlink | Good for FB traffic, NET-15 |
| **PropellerAds** | $5 | Popunder, Push, OnClick | Long-established, social traffic welcome |

**Recommendation:** start with **banner / native / vignette** formats (visible on the page) plus
one popunder. Do **not** switch to auto-redirect popups — keep the page real.

Also avoid putting a direct ad link in Facebook posts/comments; Meta flags third-party ad links.
A landing page with the code on it is the standard, safe method the networks themselves recommend.

---

## 7. Bonus: a second income line

Since you publish your own videos on Facebook, you may qualify for **Facebook Content
Monetization** — and **Bangladesh is on the eligible-country list**. Requirements
(roughly the same everywhere):

- Page at least 30 days old
- **5,000 followers**
- **60,000 watch minutes in the last 60 days**
- Original content, no policy strikes
- 18+

The Bangladesh CPM is low ($0.30–$2 per 1,000 views), but it's **risk-free money** that stacks
on top of the landing-page method. Start growing the page now — the requirements compound.

---

## 8. Checklist

- [ ] `index.html` + `zh.html` uploaded to your domain root
- [ ] `og:url` replaced with your real domain (both files)
- [ ] Ad code pasted into AD SLOT 1 and AD SLOT 2 (both files)
- [ ] Page tested in a phone browser — all three buttons work
- [ ] Facebook Sharing Debugger shows a correct preview
- [ ] Telegram channel: welcome post pinned, description filled, poll posted
- [ ] First Facebook post published with the landing-page link
- [ ] Earnings checked in your ad dashboard (never test by clicking your own links)

_Chinese version of the pages: `zh.html`. A Chinese or Bengali version of this guide can be
added on request._

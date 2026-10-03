# Tube Pro — Setup & Monetization Guide (English)

Everything you need in one file: upload the pages, create Telegram polls, keep Facebook happy,
and get paid without losing your domain.

---

## 1. What you have

| File | What it is | Upload? |
|---|---|---|
| `index.html` | **Main landing page (English)** — Facebook traffic lands here | ✅ Yes (homepage) |
| `zh.html` | **Chinese version** of the same page, with a language switcher | ✅ Yes |
| `redirect.html` | Old direct-redirect version (kept as backup only) | ❌ Don't use |
| `index.html 1.txt` | The original file you were given (broken, unmodified) | ❌ Reference only |
| `GUIDE-en.md` | This guide | ❌ Reference only |

**Your links (already wired into both pages):**

- Course site — `https://usavideocoursefree.blogspot.com/`
- Telegram channel — `https://t.me/duzshopi` (name: **Tube Pro**, public ✅)
- Ad link — your CPM smartlink (the `AD_LINK` variable in the script)

---

## 2. Before you upload — 3 small edits

1. **Replace the placeholder domain** in `og:url` (both files) with your real domain.
2. **Keep `og:title` / `og:description` matching your Facebook post text** — the crawler reads
   these tags to build the link preview, and a mismatch is a spam signal.
3. **Paste your ad network code** into the two marked slots:
   - `AD SLOT 1` — Popunder / Social Bar / In-Page Push (in `<head>`)
   - `AD SLOT 2` — Banner / Native (in the middle of the page)

Then test with Facebook's **Sharing Debugger**: `https://developers.facebook.com/tools/debug/`
→ paste your URL → **Scrape Again**. You should see your thumbnail, title and description.

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

// Raw data fetchers for the automated ingestion pipeline.
//
// Two tiers:
// - "trusted-feed": official RSS/APIs (Grants.gov, Devpost, ioscholarships).
//   High confidence in the source itself, so listings extracted from these
//   are auto-approved (autoApprove: true).
// - "scraped": general web pages (AnitaB, SWE, AAUW, Outreachy). Parsing a
//   page's HTML with AI is less reliable than a structured feed, so these
//   always land as "pending" for a human to review (autoApprove: false).

export interface RawListing {
  rawText: string;
  sourceUrl: string;
  sourceType: "trusted-feed" | "scraped";
  autoApprove: boolean;
}

function decodeEntities(str: string): string {
  return str
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
  ).trim();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "BloomOpportunityBot/1.0 (+https://bloom-weld-three.vercel.app)",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed for ${url}: ${res.status}`);
  return res.text();
}

/** Parses <item>...</item> blocks out of a raw RSS/XML string. */
function parseRssItems(xml: string): { title: string; link: string; description: string }[] {
  const items: { title: string; link: string; description: string }[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of itemBlocks) {
    const title = (block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
    const link = (block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "").trim();
    const description = (block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || "").trim();
    items.push({
      title: decodeEntities(title),
      link: decodeEntities(link),
      description: stripHtml(decodeEntities(description)),
    });
  }
  return items;
}

// ─── TRUSTED (RSS / API) SOURCES — auto-approved ───────────────────────────

const TRUSTED_FEEDS = [
  { name: "Grants.gov", url: "https://grants.gov/rss/GG_NewOppByCategory.xml" },
  { name: "ioscholarships", url: "https://ioscholarships.com/feed" },
];

// Capped low per source per run to stay inside serverless function time
// limits (each item triggers one AI normalization call downstream).
const MAX_ITEMS_PER_FEED = 5;

async function fetchRssFeed(feedUrl: string): Promise<RawListing[]> {
  const xml = await fetchText(feedUrl);
  const items = parseRssItems(xml).slice(0, MAX_ITEMS_PER_FEED);
  return items.map((item) => ({
    rawText: `Title: ${item.title}\nLink: ${item.link}\nDescription: ${item.description}`,
    sourceUrl: item.link || feedUrl,
    sourceType: "trusted-feed" as const,
    autoApprove: true,
  }));
}

async function fetchDevpostHackathons(): Promise<RawListing[]> {
  const res = await fetch(
    "https://devpost.com/api/hackathons?status[]=open&order_by=recently-added",
    { headers: { "User-Agent": "BloomOpportunityBot/1.0" } }
  );
  if (!res.ok) throw new Error(`Devpost API failed: ${res.status}`);
  const data = await res.json();
  const hackathons = (data?.hackathons || []).slice(0, MAX_ITEMS_PER_FEED);
  return hackathons.map((h: any) => ({
    rawText: [
      `Title: ${h.title}`,
      `URL: ${h.url}`,
      `Themes: ${(h.themes || []).map((t: any) => t.name).join(", ")}`,
      `Submission period: ${h.submission_period_dates}`,
      `Prize: ${h.prize_amount}`,
      `Open state: ${h.open_state}`,
    ].join("\n"),
    sourceUrl: h.url,
    sourceType: "trusted-feed" as const,
    autoApprove: true,
  }));
}

export async function fetchTrustedSources(): Promise<RawListing[]> {
  const results: RawListing[] = [];

  for (const feed of TRUSTED_FEEDS) {
    try {
      results.push(...(await fetchRssFeed(feed.url)));
    } catch (err) {
      console.warn(`[Ingestion] Trusted feed failed (${feed.name}):`, err);
    }
  }

  try {
    results.push(...(await fetchDevpostHackathons()));
  } catch (err) {
    console.warn("[Ingestion] Devpost API failed:", err);
  }

  return results;
}

// ─── SCRAPED SOURCES — always start as "pending" for admin review ─────────

const SCRAPED_PAGES = [
  // ── Women in STEM communities ──
  { name: "AnitaB.org", url: "https://anitab.org/get-involved/scholarships/" },
  { name: "Women Techmakers (Google)", url: "https://www.womentechmakers.com/" },
  { name: "Girls in Tech", url: "https://girlsintech.org/" },
  { name: "Society of Women Engineers (SWE)", url: "https://swe.org/scholarships/" },

  // ── Professional organizations ──
  { name: "IEEE Women in Engineering", url: "https://wie.ieee.org/" },
  { name: "ACM-W", url: "https://women.acm.org/" },
  { name: "Lean In", url: "https://leanin.org/" },

  // ── Hackathons & competitions ──
  { name: "Devfolio", url: "https://devfolio.co/hackathons" },
  { name: "Unstop Hackathons", url: "https://unstop.com/hackathons" },
  { name: "HackerEarth Challenges", url: "https://www.hackerearth.com/challenges/" },
  { name: "TechGig", url: "https://www.techgig.com/hackathon" },

  // ── Conference discovery ──
  { name: "10times", url: "https://10times.com/technology" },
  { name: "WikiCFP", url: "http://www.wikicfp.com/cfp/" },
  { name: "All Conference Alert", url: "https://www.allconferencealert.com/" },

  // ── Scholarships / fellowships (women in STEM, global) ──
  { name: "British Council Women in STEM Scholarships", url: "https://study-uk.britishcouncil.org/scholarships/womens-scholarships-stem" },
  { name: "AAUW Fellowships", url: "https://www.aauw.org/resources/programs/fellowships-grants/" },
  { name: "L'Oréal-UNESCO For Women in Science", url: "https://www.forwomeninscience.com/" },
  { name: "Zonta International – Amelia Earhart Fellowship", url: "https://www.zonta.org/Web/Programs/Amelia_Earhart_Fellowship" },
  { name: "Schlumberger Foundation – Faculty for the Future", url: "https://www.fftf.slb.com/" },
  { name: "MPOWER Women in STEM Scholarship", url: "https://www.mpowerfinancing.com/scholarships" },

  // ── Internships / research programs ──
  { name: "Pathways to Science", url: "https://www.pathwaystoscience.org/" },
  { name: "SheKunj", url: "https://www.shekunj.com/" },
  { name: "Outreachy", url: "https://www.outreachy.org/apply/" },
  { name: "DAAD Scholarships", url: "https://www.daad.de/en/study-and-research-in-germany/scholarships/" },
  { name: "Mitacs Globalink", url: "https://www.mitacs.ca/en/programs/globalink" },

  // ── Coding communities ──
  { name: "Women Who Code", url: "https://www.womenwhocode.com/" },
  { name: "PyLadies", url: "https://pyladies.com/" },
  { name: "Django Girls", url: "https://djangogirls.org/" },
  { name: "Girls Who Code", url: "https://girlswhocode.com/" },
  { name: "Rewriting the Code", url: "https://www.rewritingthecode.org/" },
  { name: "Black Girls Code", url: "https://www.blackgirlscode.com/" },

  // ── Broader STEM / science orgs ──
  { name: "Association for Women in Science (AWIS)", url: "https://awis.org/" },
  { name: "OWSD", url: "https://owsd.net/" },
  { name: "Women in Data Science (WiDS)", url: "https://www.widsconference.org/" },
  { name: "Women in Bio", url: "https://www.womeninbio.org/" },

  // ── Space / aerospace ──
  { name: "Space Kidz India", url: "https://spacekidzindia.in/" },
  { name: "NASA STEM Engagement", url: "https://www.nasa.gov/stem/" },
  { name: "ESA Education", url: "https://www.esa.int/Education" },

  // ── General opportunity aggregators ──
  { name: "Opportunity Desk", url: "https://opportunitydesk.org/" },
  { name: "Youth Opportunities", url: "https://www.youthop.com/" },
];

// A few sources from your list couldn't be added because the name was
// ambiguous / multiple similarly-named sites exist and I couldn't confirm
// the canonical URL: "Women for STEM India", "WiSTEM Global",
// "CII Women in STEM", "ScholarShare", "ScholrNet", "Girls in Aerospace
// Foundation", "Conference Alerts India", "Million Women Mentors".
// If you have the exact URLs for these, add them to SCRAPED_PAGES above in
// the same { name, url } format.

export async function fetchScrapedSources(): Promise<RawListing[]> {
  const settled = await Promise.allSettled(
    SCRAPED_PAGES.map(async (page) => {
      const html = await fetchText(page.url);
      const text = stripHtml(html);
      return {
        rawText: text,
        sourceUrl: page.url,
        sourceType: "scraped" as const,
        autoApprove: false,
      };
    })
  );

  const results: RawListing[] = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") {
      results.push(r.value);
    } else {
      console.warn(`[Ingestion] Scraped source failed (${SCRAPED_PAGES[i].name}):`, r.reason?.message || r.reason);
    }
  });
  return results;
}

export const dynamic = "force-dynamic";

const DEFAULT_KEYWORDS = [
  "rail",
  "railway",
  "network rail",
  "operational property",
  "examination",
  "examinations",
  "inspection",
  "inspections",
  "ste4",
  "ste5",
  "building examination",
  "buildings examination",
  "condition survey",
  "structural examination",
  "structural inspection",
  "fire risk assessment",
  "fire safety",
  "dsear",
  "station",
  "depot",
  "asset inspection",
  "property inspection",
  "surveying",
  "civil engineering",
];

function getKeywords(searchParams) {
  const raw = searchParams.get("keywords");
  if (!raw) return DEFAULT_KEYWORDS;
  const parsed = raw.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  return parsed.length ? parsed : DEFAULT_KEYWORDS;
}

function isoNoMs(date) {
  return date.toISOString().slice(0, 19);
}

function scoreNotice(text, keywords) {
  const lower = String(text || "").toLowerCase();

  const matchedKeywords = keywords.filter((keyword) =>
    lower.includes(keyword.toLowerCase())
  );

  let score = matchedKeywords.length * 10;

  if (lower.includes("network rail")) score += 40;
  if (lower.includes("railway")) score += 25;
  if (lower.includes("rail ")) score += 20;
  if (lower.includes("operational property")) score += 40;
  if (lower.includes("ste4")) score += 40;
  if (lower.includes("ste5")) score += 40;
  if (lower.includes("examination")) score += 25;
  if (lower.includes("inspection")) score += 20;
  if (lower.includes("fire risk")) score += 20;
  if (lower.includes("dsear")) score += 30;

  let decision = "Excluded";
  let reason = "No target keywords found";

  if (score >= 60) {
    decision = "High Match";
    reason = "Strong match against Modus Rail target services";
  } else if (score >= 30) {
    decision = "Medium Match";
    reason = "Some relevant keywords found";
  } else if (score > 0) {
    decision = "Low Match";
    reason = "Weak keyword match; review manually";
  }

  return { score, matchedKeywords, decision, reason };
}

function ftsRegion(release) {
  const buyerParty =
    Array.isArray(release?.parties) &&
    release.parties.find((p) => Array.isArray(p?.roles) && p.roles.includes("buyer"));

  return (
    buyerParty?.address?.region ||
    buyerParty?.address?.locality ||
    release?.buyer?.address?.region ||
    release?.buyer?.address?.locality ||
    release?.tender?.items?.[0]?.deliveryAddresses?.[0]?.region ||
    "-"
  );
}

function mapFindATender(release, keywords) {
  const title = release?.tender?.title || release?.title || "Untitled notice";
  const description = release?.tender?.description || release?.description || "";
  const buyer = release?.buyer?.name || "Unknown buyer";
  const region = ftsRegion(release);
  const deadline = release?.tender?.tenderPeriod?.endDate || "";
  const noticeId = release?.id || "";
  const ocid = release?.ocid || "";

  const haystack = `${title} ${description} ${buyer} ${region}`;
  const scored = scoreNotice(haystack, keywords);

  return {
    id: `fts-${ocid || noticeId || title}`,
    noticeId,
    title,
    buyer,
    region,
    deadline,
    source: "Find a Tender",
    url: noticeId ? `https://www.find-tender.service.gov.uk/Notice/${noticeId}` : "",
    ...scored,
  };
}

async function fetchFindATender(keywords) {
  const tenders = [];
  const errors = [];
  const seen = new Set();

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 90);

  let cursor = "";
  let pages = 0;
  const maxPages = 5;

  while (pages < maxPages) {
    const params = new URLSearchParams({
      limit: "100",
      updatedFrom: isoNoMs(from),
      updatedTo: isoNoMs(now),
    });

    if (cursor) params.set("cursor", cursor);

    const url = `https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages?${params.toString()}`;

    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        errors.push(`Find a Tender returned ${res.status}`);
        break;
      }

      const data = await res.json();
      const releases = Array.isArray(data?.releases) ? data.releases : [];

      for (const release of releases) {
        const mapped = mapFindATender(release, keywords);
        if (seen.has(mapped.id)) continue;
        seen.add(mapped.id);
        tenders.push(mapped);
      }

      let nextCursor = "";

      if (data?.links?.next) {
        try {
          const nextUrl = new URL(data.links.next);
          nextCursor = nextUrl.searchParams.get("cursor") || "";
        } catch {}
      }

      if (!nextCursor && data?.next) nextCursor = data.next;
      if (!nextCursor && data?.cursor) nextCursor = data.cursor;

      if (!nextCursor) break;

      cursor = nextCursor;
      pages += 1;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Find a Tender error");
      break;
    }
  }

  return { tenders, errors };
}

function mapContractsFinder(item, keywords) {
  const title = item?.title || item?.Title || "Untitled notice";
  const description = item?.description || item?.Description || "";
  const buyer =
    item?.organisationName ||
    item?.OrganisationName ||
    item?.buyerName ||
    "Unknown buyer";
  const region = item?.regionText || item?.region || item?.Region || "-";
  const deadline = item?.deadlineDate || item?.DeadlineDate || "";
  const id = item?.id || item?.Id || item?.noticeIdentifier || title;

  const haystack = `${title} ${description} ${buyer} ${region}`;
  const scored = scoreNotice(haystack, keywords);

  return {
    id: `cf-${id}`,
    noticeId: id,
    title,
    buyer,
    region,
    deadline,
    source: "Contracts Finder",
    url: item?.id ? `https://www.contractsfinder.service.gov.uk/Notice/${item.id}` : "",
    ...scored,
  };
}

async function fetchContractsFinder(keywords) {
  const tenders = [];
  const errors = [];

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 90);

  try {
    const res = await fetch(
      "https://www.contractsfinder.service.gov.uk/api/rest/2/search_notices/json",
      {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchCriteria: {
            keyword: "",
            statuses: ["Open"],
            publishedFrom: isoNoMs(from),
            publishedTo: isoNoMs(now),
          },
          size: 100,
        }),
      }
    );

    if (!res.ok) {
      errors.push(`Contracts Finder returned ${res.status}`);
      return { tenders, errors };
    }

    const data = await res.json();
    const list = data?.noticeList || data?.NoticeList || [];

    for (const hit of list) {
      const item = hit?.item || hit?.Item || hit;
      tenders.push(mapContractsFinder(item, keywords));
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Contracts Finder error");
  }

  return { tenders, errors };
}

function dedupe(tenders) {
  const seen = new Set();
  return tenders.filter((t) => {
    const key = `${t.source}|${t.title}|${t.buyer}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keywords = getKeywords(searchParams);

  const [fts, cf] = await Promise.all([
    fetchFindATender(keywords),
    fetchContractsFinder(keywords),
  ]);

  const all = dedupe([...fts.tenders, ...cf.tenders]).sort((a, b) => b.score - a.score);
  const matched = all.filter((t) => t.score > 0);
  const excluded = all.filter((t) => t.score === 0);

  return Response.json({
    all,
    matched,
    excluded,
    sourceStatus: {
      findATender: fts.errors.length ? fts.errors.join("; ") : "OK",
      contractsFinder: cf.errors.length ? cf.errors.join("; ") : "OK",
    },
  });
}

const KEYWORDS = [
  "examination",
  "examinations",
  "inspection",
  "inspections",
  "ste4",
  "ste5",
  "operational property",
  "building examination",
  "buildings examination",
  "condition survey",
  "structural examination",
  "fire risk assessment",
  "dsear",
  "asset inspection",
  "asset condition",
  "surveying",
  "structural inspection",
  "railway inspection",
  "rail inspection",
  "property inspection",
];

function isoNoMs(date) {
  return date.toISOString().slice(0, 19);
}

function textIncludesKeyword(text, keyword) {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

function extractBuyerRegion(release) {
  const buyerParty =
    Array.isArray(release?.parties) &&
    release.parties.find(
      (p) => Array.isArray(p?.roles) && p.roles.includes("buyer")
    );

  return (
    buyerParty?.address?.region ||
    buyerParty?.address?.locality ||
    release?.buyer?.address?.region ||
    release?.buyer?.address?.locality ||
    ""
  );
}

function mapReleaseToTender(release) {
  const title = release?.tender?.title || release?.title || "";
  const description = release?.tender?.description || release?.description || "";
  const buyer = release?.buyer?.name || "";
  const region = extractBuyerRegion(release);
  const deadline = release?.tender?.tenderPeriod?.endDate || "";
  const ocid = release?.ocid || "";
  const noticeId = release?.id || "";

  const haystack = `${title} ${description} ${buyer} ${region}`.toLowerCase();
  const matchedKeywords = KEYWORDS.filter((k) => textIncludesKeyword(haystack, k));

  if (matchedKeywords.length === 0) return null;

  const publicUrl = noticeId
    ? `https://www.find-tender.service.gov.uk/Notice/${noticeId}`
    : "";

  return {
    id: ocid || noticeId || `${title}-${deadline}`,
    title: title || "Untitled notice",
    buyer: buyer || "Unknown buyer",
    region: region || "",
    deadline: deadline || "",
    source: "Find a Tender",
    matchedKeywords,
    url: publicUrl,
  };
}

export async function GET() {
  try {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 30);

    const params = new URLSearchParams({
      limit: "100",
      updatedFrom: isoNoMs(from),
      updatedTo: isoNoMs(now),
      stages: "tender",
    });

    const url = `https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages?${params.toString()}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return Response.json(
        {
          count: 0,
          tenders: [],
          error: `Find a Tender request failed with status ${res.status}`,
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    const releases = Array.isArray(data?.releases) ? data.releases : [];

    const tenders = releases
      .map(mapReleaseToTender)
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : 0;
        const bTime = b.deadline ? new Date(b.deadline).getTime() : 0;
        return aTime - bTime;
      });

    return Response.json({
      count: tenders.length,
      tenders,
      source: "Find a Tender",
    });
  } catch (error) {
    return Response.json(
      {
        count: 0,
        tenders: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}

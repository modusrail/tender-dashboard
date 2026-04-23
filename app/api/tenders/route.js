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
  "structural inspection",
  "fire risk assessment",
  "fire safety",
  "dsear",
  "rail",
  "railway",
  "network rail",
  "station",
  "depot",
  "asset inspection",
  "asset condition",
  "surveying",
  "civil engineering",
  "property inspection",
];

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

function formatTender(release) {
  const title = release?.tender?.title || release?.title || "";
  const description = release?.tender?.description || release?.description || "";
  const buyer = release?.buyer?.name || "Unknown buyer";
  const region = extractBuyerRegion(release);
  const deadline = release?.tender?.tenderPeriod?.endDate || "";
  const noticeId = release?.id || "";
  const ocid = release?.ocid || "";

  const haystack = `${title} ${description} ${buyer} ${region}`.toLowerCase();

  const matchedKeywords = KEYWORDS.filter((keyword) =>
    haystack.includes(keyword.toLowerCase())
  );

  if (matchedKeywords.length === 0) return null;

  return {
    id: ocid || noticeId || title,
    title: title || "Untitled notice",
    buyer,
    region: region || "-",
    deadline: deadline || "",
    source: "Find a Tender",
    matchedKeywords,
    url: noticeId
      ? `https://www.find-tender.service.gov.uk/Notice/${noticeId}`
      : "",
  };
}

export async function GET() {
  try {
    const res = await fetch(
      "https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages?limit=100",
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      return Response.json({
        tenders: [],
        error: `Find a Tender request failed with status ${res.status}`,
      });
    }

    const data = await res.json();
    const releases = Array.isArray(data?.releases) ? data.releases : [];

    const tenders = releases
      .map(formatTender)
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : 0;
        const bTime = b.deadline ? new Date(b.deadline).getTime() : 0;
        return aTime - bTime;
      });

    return Response.json({
      tenders,
      count: tenders.length,
    });
  } catch (error) {
    return Response.json({
      tenders: [],
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

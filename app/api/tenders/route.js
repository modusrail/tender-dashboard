const SAMPLE = [
  {
    id: "1",
    title: "Buildings Examination Framework",
    buyer: "Network Rail",
    region: "Eastern",
    deadline: "2026-05-06",
    source: "Find a Tender",
    matchedKeywords: ["examination", "buildings"],
  },
];

export async function GET() {
  try {
    const res = await fetch(
      "https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages?limit=50",
      { cache: "no-store" }
    );

    const data = await res.json();

    const tenders =
      data?.releases?.map((r) => ({
        id: r.ocid,
        title: r.tender?.title || "No title",
        buyer: r.buyer?.name || "Unknown",
        region: r.buyer?.address?.region || "",
        deadline: r.tender?.tenderPeriod?.endDate || "",
        source: "Find a Tender",
        matchedKeywords: [],
      })) || [];

    return Response.json({
      tenders: tenders.length ? tenders : SAMPLE,
    });
  } catch (err) {
    return Response.json({
      tenders: SAMPLE,
      error: "Using fallback data",
    });
  }
}

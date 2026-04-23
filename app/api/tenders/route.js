export async function GET() {
  const keywords = [
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
  ];

  const results = [];

  try {
    // Contracts Finder sample query
    const cfRes = await fetch("https://www.contractsfinder.service.gov.uk/api/rest/2/search_notices/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keyword: "",
        page_number: 1,
        page_size: 50,
      }),
      cache: "no-store",
    });

    if (cfRes.ok) {
      const cfData = await cfRes.json();

      const notices = Array.isArray(cfData?.notices) ? cfData.notices : [];

      for (const notice of notices) {
        const title = notice?.title || "";
        const description = notice?.description || "";
        const buyer = notice?.organisationName || "";
        const deadline = notice?.deadlineDate || "";
        const region = notice?.deliveryRegion || "";
        const url = notice?.link || "";

        const haystack = `${title} ${description} ${buyer} ${region}`.toLowerCase();

        const matchedKeywords = keywords.filter((k) => haystack.includes(k));

        if (matchedKeywords.length > 0) {
          results.push({
            id: `cf-${notice?.id || Math.random()}`,
            title,
            buyer,
            region,
            category: "Matched Tender",
            deadline,
            status: "Review",
            source: "Contracts Finder",
            matchedKeywords,
            url,
          });
        }
      }
    }
  } catch (error) {
    console.error("Contracts Finder fetch failed:", error);
  }

  try {
    // Find a Tender OCDS release packages
    const ftsRes = await fetch(
      "https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages?limit=50",
      { cache: "no-store" }
    );

    if (ftsRes.ok) {
      const ftsData = await ftsRes.json();
      const releases = Array.isArray(ftsData?.releases) ? ftsData.releases : [];

      for (const release of releases) {
        const title = release?.tender?.title || "";
        const description = release?.tender?.description || "";
        const buyer = release?.buyer?.name || "";
        const deadline = release?.tender?.tenderPeriod?.endDate || "";
        const region =
          release?.parties?.find((p) => p?.roles?.includes("buyer"))?.address?.region || "";
        const url = release?.links?.self || "";

        const haystack = `${title} ${description} ${buyer} ${region}`.toLowerCase();

        const matchedKeywords = keywords.filter((k) => haystack.includes(k));

        if (matchedKeywords.length > 0) {
          results.push({
            id: `fts-${release?.ocid || Math.random()}`,
            title,
            buyer,
            region,
            category: "Matched Tender",
            deadline,
            status: "Review",
            source: "Find a Tender",
            matchedKeywords,
            url,
          });
        }
      }
    }
  } catch (error) {
    console.error("Find a Tender fetch failed:", error);
  }

  return Response.json({
    count: results.length,
    tenders: results,
  });
}

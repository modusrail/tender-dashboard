export async function GET() {
  return Response.json({
    count: 3,
    tenders: [
      {
        id: "1",
        title: "Buildings Examination Framework",
        buyer: "Network Rail",
        region: "Eastern",
        deadline: "2026-05-06",
        source: "Find a Tender",
        matchedKeywords: ["examination", "buildings"],
      },
      {
        id: "2",
        title: "Fire Risk Assessment Services",
        buyer: "Transport for Wales",
        region: "Wales",
        deadline: "2026-05-12",
        source: "Sell2Wales",
        matchedKeywords: ["fire risk assessment"],
      },
      {
        id: "3",
        title: "Structural Inspection Support",
        buyer: "Local Authority",
        region: "London",
        deadline: "2026-05-18",
        source: "Contracts Finder",
        matchedKeywords: ["inspection"],
      },
    ],
  });
}

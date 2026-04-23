"use client";

import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All sources");

  useEffect(() => {
    async function loadTenders() {
      try {
        const res = await fetch("/api/tenders", { cache: "no-store" });
        const data = await res.json();
        setTenders(data.tenders || []);
      } catch (error) {
        console.error("Failed to load tenders:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTenders();
  }, []);

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const matchesSource =
        sourceFilter === "All sources" || tender.source === sourceFilter;

      const haystack = [
        tender.title,
        tender.buyer,
        tender.region,
        tender.category,
        tender.deadline,
        tender.status,
        tender.source,
        ...(tender.matchedKeywords || []),
      ]
        .join(" ")
        .toLowerCase();

      return matchesSource && haystack.includes(search.toLowerCase());
    });
  }, [tenders, search, sourceFilter]);

  const allSources = useMemo(() => {
    const unique = Array.from(new Set(tenders.map((t) => t.source)));
    return ["All sources", ...unique];
  }, [tenders]);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
            <div>
              <h1 style={{ margin: 0 }}>Tender Watch Dashboard</h1>
              <div style={{ color: "#64748b", marginTop: "6px" }}>
                Live matched tenders from official public sources
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tenders..."
                style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", minWidth: "240px" }}
              />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
              >
                {allSources.map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div>Loading live tenders...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                    <th style={thStyle}>Tender</th>
                    <th style={thStyle}>Buyer</th>
                    <th style={thStyle}>Region</th>
                    <th style={thStyle}>Deadline</th>
                    <th style={thStyle}>Source</th>
                    <th style={thStyle}>Matched Keywords</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenders.map((tender) => (
                    <tr key={tender.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={tdStyleStrong}>
                        {tender.url ? (
                          <a href={tender.url} target="_blank" rel="noreferrer" style={{ color: "#0f172a", textDecoration: "none" }}>
                            {tender.title}
                          </a>
                        ) : (
                          tender.title
                        )}
                      </td>
                      <td style={tdStyle}>{tender.buyer}</td>
                      <td style={tdStyle}>{tender.region}</td>
                      <td style={tdStyle}>{formatDate(tender.deadline)}</td>
                      <td style={tdStyle}>{tender.source}</td>
                      <td style={tdStyle}>{(tender.matchedKeywords || []).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const thStyle = {
  paddingBottom: "12px",
  paddingRight: "16px",
};

const tdStyle = {
  padding: "16px 16px 16px 0",
  color: "#475569",
};

const tdStyleStrong = {
  padding: "16px 16px 16px 0",
  fontWeight: "600",
  color: "#0f172a",
};

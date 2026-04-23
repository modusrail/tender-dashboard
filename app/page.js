"use client";

import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All sources");

  useEffect(() => {
    async function loadTenders() {
      try {
        setLoading(true);
        setApiError("");

        const res = await fetch("/api/tenders", { cache: "no-store" });
        const data = await res.json();

        if (data?.error) {
          setApiError(data.error);
        }

        const incoming = Array.isArray(data?.tenders) ? data.tenders : [];

        const withDecision = incoming.map((tender) => ({
          ...tender,
          decision: tender.decision || "Review",
        }));

        setTenders(withDecision);
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : "Failed to load tenders"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTenders();
  }, []);

  function updateDecision(id, decision) {
    setTenders((current) =>
      current.map((tender) =>
        tender.id === id ? { ...tender, decision } : tender
      )
    );
  }

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const matchesSource =
        sourceFilter === "All sources" || tender.source === sourceFilter;

      const haystack = [
        tender.title,
        tender.buyer,
        tender.region,
        tender.deadline,
        tender.source,
        tender.decision,
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

  const decisionCounts = useMemo(() => {
    return {
      review: tenders.filter((t) => t.decision === "Review").length,
      go: tenders.filter((t) => t.decision === "GO").length,
      ignore: tenders.filter((t) => t.decision === "Ignore").length,
    };
  }, [tenders]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e5e7eb",
        padding: "40px 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1380px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "16px",
          }}
        >
          {[
            { label: "Total Tenders", value: tenders.length },
            { label: "Review", value: decisionCounts.review },
            { label: "GO", value: decisionCounts.go },
            { label: "Ignore", value: decisionCounts.ignore },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "#f8f8f8",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ color: "#64748b", fontSize: "14px" }}>
                {card.label}
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "34px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#f8f8f8",
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "28px" }}>
                Tender Watch Dashboard
              </h1>
              <div style={{ color: "#64748b", marginTop: "8px" }}>
                Live matched tenders from official public sources
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tenders..."
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  minWidth: "240px",
                  fontSize: "14px",
                }}
              />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                }}
              >
                {allSources.map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>

          {loading && <div style={{ padding: "16px 0" }}>Loading tenders...</div>}

          {!loading && apiError && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "#fee2e2",
                color: "#991b1b",
                fontSize: "14px",
              }}
            >
              {apiError}
            </div>
          )}

          {!loading && !apiError && filteredTenders.length === 0 && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "#fff7ed",
                color: "#9a3412",
                fontSize: "14px",
              }}
            >
              No tenders matched your current search or source filter.
            </div>
          )}

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #d1d5db",
                    color: "#64748b",
                    textAlign: "left",
                  }}
                >
                  <th style={thStyle}>Tender</th>
                  <th style={thStyle}>Buyer</th>
                  <th style={thStyle}>Region</th>
                  <th style={thStyle}>Deadline</th>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Matched Keywords</th>
                  <th style={thStyle}>Decision</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenders.map((tender) => (
                  <tr
                    key={tender.id}
                    style={{ borderBottom: "1px solid #e5e7eb" }}
                  >
                    <td style={tdStrong}>
                      {tender.url ? (
                        <a
                          href={tender.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#111827", textDecoration: "none" }}
                        >
                          {tender.title}
                        </a>
                      ) : (
                        tender.title
                      )}
                    </td>
                    <td style={tdStyle}>{tender.buyer}</td>
                    <td style={tdStyle}>{tender.region || "-"}</td>
                    <td style={tdStyle}>{formatDate(tender.deadline)}</td>
                    <td style={tdStyle}>{tender.source}</td>
                    <td style={tdStyle}>
                      {(tender.matchedKeywords || []).join(", ")}
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={tender.decision}
                        onChange={(e) =>
                          updateDecision(tender.id, e.target.value)
                        }
                        style={{
                          padding: "8px 10px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          background: "#fff",
                        }}
                      >
                        <option>Review</option>
                        <option>GO</option>
                        <option>Ignore</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const thStyle = {
  padding: "12px 16px 12px 0",
};

const tdStyle = {
  padding: "14px 16px 14px 0",
  color: "#475569",
  verticalAlign: "top",
};

const tdStrong = {
  padding: "14px 16px 14px 0",
  color: "#111827",
  fontWeight: "600",
  verticalAlign: "top",
};

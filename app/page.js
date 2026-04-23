"use client";

import { useMemo, useState } from "react";

export default function Page() {
  const [tenders, setTenders] = useState([
    {
      id: 1,
      title: "Buildings Examination Framework",
      buyer: "Network Rail Infrastructure Ltd",
      region: "Eastern",
      category: "Examinations",
      deadline: "2026-05-06",
      status: "High Match",
      source: "Find a Tender",
    },
    {
      id: 2,
      title: "Fire Risk Assessment Services",
      buyer: "Transport for Wales",
      region: "Wales & Western",
      category: "Fire / FRA",
      deadline: "2026-05-12",
      status: "Review",
      source: "Sell2Wales",
    },
    {
      id: 3,
      title: "Structural Asset Inspection Support",
      buyer: "Local Authority",
      region: "London",
      category: "Inspections",
      deadline: "2026-05-18",
      status: "No Bid",
      source: "Contracts Finder",
    },
  ]);

  const [keywords, setKeywords] = useState([
    "Examinations",
    "Inspections",
    "STE4",
    "STE5",
    "Operational Property",
    "Buildings Examination",
    "Condition Survey",
    "Structural Examination",
    "Fire Risk Assessment",
    "DSEAR",
  ]);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [keywordInput, setKeywordInput] = useState("");

  const [newTender, setNewTender] = useState({
    title: "",
    buyer: "",
    region: "",
    category: "",
    deadline: "",
    status: "Review",
    source: "Manual Entry",
  });

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
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());

      return matchesSource && matchesSearch;
    });
  }, [tenders, search, sourceFilter]);

  const stats = useMemo(() => {
    const highMatch = tenders.filter((t) => t.status === "High Match").length;
    const review = tenders.filter((t) => t.status === "Review").length;
    const bid = tenders.filter((t) => t.status === "Bid").length;
    const submitted = tenders.filter((t) => t.status === "Submitted").length;

    return {
      total: tenders.length,
      highMatch,
      review,
      bid,
      submitted,
    };
  }, [tenders]);

  const allSources = useMemo(() => {
    const unique = Array.from(new Set(tenders.map((t) => t.source)));
    return ["All sources", ...unique];
  }, [tenders]);

  function updateTenderStatus(id, status) {
    setTenders((current) =>
      current.map((tender) =>
        tender.id === id ? { ...tender, status } : tender
      )
    );
  }

  function addKeyword() {
    const value = keywordInput.trim();
    if (!value) return;
    if (keywords.some((k) => k.toLowerCase() === value.toLowerCase())) {
      setKeywordInput("");
      return;
    }
    setKeywords((current) => [...current, value]);
    setKeywordInput("");
  }

  function removeKeyword(keywordToRemove) {
    setKeywords((current) =>
      current.filter((keyword) => keyword !== keywordToRemove)
    );
  }

  function handleNewTenderChange(field, value) {
    setNewTender((current) => ({ ...current, [field]: value }));
  }

  function addTender() {
    if (
      !newTender.title.trim() ||
      !newTender.buyer.trim() ||
      !newTender.deadline.trim()
    ) {
      alert("Please complete Title, Buyer, and Deadline.");
      return;
    }

    const tenderToAdd = {
      ...newTender,
      id: Date.now(),
      title: newTender.title.trim(),
      buyer: newTender.buyer.trim(),
      region: newTender.region.trim(),
      category: newTender.category.trim(),
      source: newTender.source.trim() || "Manual Entry",
    };

    setTenders((current) => [tenderToAdd, ...current]);

    setNewTender({
      title: "",
      buyer: "",
      region: "",
      category: "",
      deadline: "",
      status: "Review",
      source: "Manual Entry",
    });
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1450px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "340px 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              position: "sticky",
              top: "24px",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                Tender Watch
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  color: "#64748b",
                }}
              >
                Live tender tracker prototype
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "12px",
                }}
              >
                Search & filter
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tenders, buyers, region..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  marginBottom: "12px",
                }}
              />

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              >
                {allSources.map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "12px",
                }}
              >
                Tracked keywords
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addKeyword();
                  }}
                  placeholder="Add keyword"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                />
                <button
                  onClick={addKeyword}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#0f172a",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    style={{
                      background: "#f1f5f9",
                      color: "#334155",
                      fontSize: "12px",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#64748b",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "12px",
                }}
              >
                Add tender manually
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <input
                  value={newTender.title}
                  onChange={(e) =>
                    handleNewTenderChange("title", e.target.value)
                  }
                  placeholder="Tender title"
                  style={inputStyle}
                />
                <input
                  value={newTender.buyer}
                  onChange={(e) =>
                    handleNewTenderChange("buyer", e.target.value)
                  }
                  placeholder="Buyer"
                  style={inputStyle}
                />
                <input
                  value={newTender.region}
                  onChange={(e) =>
                    handleNewTenderChange("region", e.target.value)
                  }
                  placeholder="Region"
                  style={inputStyle}
                />
                <input
                  value={newTender.category}
                  onChange={(e) =>
                    handleNewTenderChange("category", e.target.value)
                  }
                  placeholder="Category"
                  style={inputStyle}
                />
                <input
                  type="date"
                  value={newTender.deadline}
                  onChange={(e) =>
                    handleNewTenderChange("deadline", e.target.value)
                  }
                  style={inputStyle}
                />
                <select
                  value={newTender.status}
                  onChange={(e) =>
                    handleNewTenderChange("status", e.target.value)
                  }
                  style={inputStyle}
                >
                  <option>High Match</option>
                  <option>Review</option>
                  <option>Bid</option>
                  <option>No Bid</option>
                  <option>Submitted</option>
                </select>
                <input
                  value={newTender.source}
                  onChange={(e) =>
                    handleNewTenderChange("source", e.target.value)
                  }
                  placeholder="Source"
                  style={inputStyle}
                />
                <button
                  onClick={addTender}
                  style={{
                    padding: "11px 14px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#0f172a",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Add tender
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: "16px",
              }}
            >
              {[
                { label: "Total Tenders", value: stats.total },
                { label: "High Match", value: stats.highMatch },
                { label: "Under Review", value: stats.review },
                { label: "Bid", value: stats.bid },
                { label: "Submitted", value: stats.submitted },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#64748b" }}>
                    {card.label}
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "34px",
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "center",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    Tender dashboard
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      marginTop: "4px",
                    }}
                  >
                    Search, review, and update tender opportunities
                  </div>
                </div>

                <div style={{ fontSize: "14px", color: "#64748b" }}>
                  Showing {filteredTenders.length} of {tenders.length}
                </div>
              </div>

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
                        borderBottom: "1px solid #e2e8f0",
                        color: "#64748b",
                        textAlign: "left",
                      }}
                    >
                      <th style={thStyle}>Tender</th>
                      <th style={thStyle}>Buyer</th>
                      <th style={thStyle}>Region</th>
                      <th style={thStyle}>Category</th>
                      <th style={thStyle}>Deadline</th>
                      <th style={thStyle}>Source</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenders.map((tender) => (
                      <tr
                        key={tender.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={tdStyleStrong}>{tender.title}</td>
                        <td style={tdStyle}>{tender.buyer}</td>
                        <td style={tdStyle}>{tender.region}</td>
                        <td style={tdStyle}>{tender.category}</td>
                        <td style={tdStyle}>{formatDate(tender.deadline)}</td>
                        <td style={tdStyle}>{tender.source}</td>
                        <td style={tdStyle}>
                          <select
                            value={tender.status}
                            onChange={(e) =>
                              updateTenderStatus(tender.id, e.target.value)
                            }
                            style={{
                              padding: "8px 10px",
                              borderRadius: "10px",
                              border: "1px solid #cbd5e1",
                              fontSize: "13px",
                            }}
                          >
                            <option>High Match</option>
                            <option>Review</option>
                            <option>Bid</option>
                            <option>No Bid</option>
                            <option>Submitted</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "16px",
                  }}
                >
                  How to use this
                </div>
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  <div>1. Add your tenders manually on the left.</div>
                  <div>2. Search by buyer, region, or tender title.</div>
                  <div>3. Filter by tender source.</div>
                  <div>4. Update each tender status as it progresses.</div>
                  <div>5. Refine keywords as your scope evolves.</div>
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "16px",
                  }}
                >
                  Next upgrade
                </div>
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  <div>• Save data permanently to a database</div>
                  <div>• Real login and user accounts</div>
                  <div>• Email alerts for new matches</div>
                  <div>• Automated tender imports</div>
                  <div>• Go / No-Go scoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  boxSizing: "border-box",
};

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

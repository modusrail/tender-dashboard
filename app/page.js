"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "tender_watch_v1";

const DEFAULT_KEYWORDS = [
  "rail",
  "railway",
  "network rail",
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
  "station",
  "depot",
  "asset inspection",
];

export default function Page() {
  const [hydrated, setHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [loginForm, setLoginForm] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [liveTenders, setLiveTenders] = useState([]);
  const [manualTenders, setManualTenders] = useState([]);
  const [keywords, setKeywords] = useState(DEFAULT_KEYWORDS);
  const [decisions, setDecisions] = useState({});

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [newKeyword, setNewKeyword] = useState("");

  const [newTender, setNewTender] = useState({
    title: "",
    buyer: "",
    region: "",
    deadline: "",
    source: "Manual Entry",
  });

  useEffect(() => {
    const savedUser = window.localStorage.getItem(`${STORAGE_PREFIX}_current_user`);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const userKey = getUserKey(currentUser.email);

    try {
      const savedKeywords = window.localStorage.getItem(`${userKey}_keywords`);
      const savedDecisions = window.localStorage.getItem(`${userKey}_decisions`);
      const savedManualTenders = window.localStorage.getItem(`${userKey}_manual_tenders`);

      setKeywords(savedKeywords ? JSON.parse(savedKeywords) : DEFAULT_KEYWORDS);
      setDecisions(savedDecisions ? JSON.parse(savedDecisions) : {});
      setManualTenders(savedManualTenders ? JSON.parse(savedManualTenders) : []);
    } catch {
      setKeywords(DEFAULT_KEYWORDS);
      setDecisions({});
      setManualTenders([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const userKey = getUserKey(currentUser.email);
    window.localStorage.setItem(`${userKey}_keywords`, JSON.stringify(keywords));
  }, [keywords, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const userKey = getUserKey(currentUser.email);
    window.localStorage.setItem(`${userKey}_decisions`, JSON.stringify(decisions));
  }, [decisions, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const userKey = getUserKey(currentUser.email);
    window.localStorage.setItem(`${userKey}_manual_tenders`, JSON.stringify(manualTenders));
  }, [manualTenders, currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    async function loadTenders() {
      try {
        setLoading(true);
        setApiError("");

        const res = await fetch("/api/tenders", { cache: "no-store" });
        const data = await res.json();

        if (data?.error) {
          setApiError(data.error);
        }

        setLiveTenders(Array.isArray(data?.tenders) ? data.tenders : []);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : "Failed to load tenders");
        setLiveTenders([]);
      } finally {
        setLoading(false);
      }
    }

    loadTenders();
  }, [currentUser]);

  const allTenders = useMemo(() => {
    return [...manualTenders, ...liveTenders];
  }, [manualTenders, liveTenders]);

  const filteredTenders = useMemo(() => {
    return allTenders.filter((tender) => {
      const haystack = [
        tender.title,
        tender.buyer,
        tender.region,
        tender.deadline,
        tender.source,
        ...(tender.matchedKeywords || []),
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch = haystack.includes(search.toLowerCase());

      const sourceMatch =
        sourceFilter === "All sources" || tender.source === sourceFilter;

      const keywordMatch =
        keywords.length === 0 ||
        keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));

      return searchMatch && sourceMatch && keywordMatch;
    });
  }, [allTenders, search, sourceFilter, keywords]);

  const allSources = useMemo(() => {
    const unique = Array.from(new Set(allTenders.map((t) => t.source).filter(Boolean)));
    return ["All sources", ...unique];
  }, [allTenders]);

  const stats = useMemo(() => {
    const review = filteredTenders.filter(
      (t) => (decisions[t.id] || "Review") === "Review"
    ).length;
    const go = filteredTenders.filter(
      (t) => (decisions[t.id] || "Review") === "GO"
    ).length;
    const ignore = filteredTenders.filter(
      (t) => (decisions[t.id] || "Review") === "Ignore"
    ).length;

    return {
      total: filteredTenders.length,
      review,
      go,
      ignore,
    };
  }, [filteredTenders, decisions]);

  function handleLogin() {
    if (!loginForm.name.trim() || !loginForm.email.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    const user = {
      name: loginForm.name.trim(),
      email: loginForm.email.trim().toLowerCase(),
    };

    window.localStorage.setItem(`${STORAGE_PREFIX}_current_user`, JSON.stringify(user));
    setCurrentUser(user);
  }

  function handleLogout() {
    window.localStorage.removeItem(`${STORAGE_PREFIX}_current_user`);
    setCurrentUser(null);
    setLiveTenders([]);
    setManualTenders([]);
    setKeywords(DEFAULT_KEYWORDS);
    setDecisions({});
    setSearch("");
    setSourceFilter("All sources");
  }

  function addKeyword() {
    const value = newKeyword.trim().toLowerCase();
    if (!value) return;
    if (keywords.includes(value)) {
      setNewKeyword("");
      return;
    }
    setKeywords((current) => [...current, value]);
    setNewKeyword("");
  }

  function removeKeyword(keywordToRemove) {
    setKeywords((current) => current.filter((k) => k !== keywordToRemove));
  }

  function updateDecision(id, value) {
    setDecisions((current) => ({
      ...current,
      [id]: value,
    }));
  }

  function addManualTender() {
    if (!newTender.title.trim() || !newTender.buyer.trim()) {
      alert("Please enter at least a tender title and buyer.");
      return;
    }

    const tender = {
      id: `manual-${Date.now()}`,
      title: newTender.title.trim(),
      buyer: newTender.buyer.trim(),
      region: newTender.region.trim() || "-",
      deadline: newTender.deadline || "",
      source: newTender.source.trim() || "Manual Entry",
      matchedKeywords: [],
      url: "",
      isManual: true,
    };

    setManualTenders((current) => [tender, ...current]);

    setNewTender({
      title: "",
      buyer: "",
      region: "",
      deadline: "",
      source: "Manual Entry",
    });
  }

  function deleteManualTender(id) {
    setManualTenders((current) => current.filter((t) => t.id !== id));

    setDecisions((current) => {
      const updated = { ...current };
      delete updated[id];
      return updated;
    });
  }

  if (!hydrated) {
    return (
      <div style={centerWrap}>
        <div style={cardStyle}>Loading dashboard...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={centerWrap}>
        <div style={{ ...cardStyle, width: "100%", maxWidth: "460px", padding: "32px" }}>
          <div style={{ fontSize: "34px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
            Tender Watch
          </div>
          <div style={{ color: "#64748b", marginBottom: "24px" }}>
            Sign in to open your saved dashboard
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input
                value={loginForm.name}
                onChange={(e) =>
                  setLoginForm((current) => ({ ...current, name: e.target.value }))
                }
                placeholder="Andrew Pickering"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((current) => ({ ...current, email: e.target.value }))
                }
                placeholder="andrew@company.co.uk"
                style={inputStyle}
              />
            </div>

            <button onClick={handleLogin} style={primaryButtonStyle}>
              Sign in
            </button>
          </div>

          <div style={{ marginTop: "18px", fontSize: "13px", color: "#64748b" }}>
            This sign-in is saved locally on this browser and device.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e5e7eb",
        padding: "28px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1500px", margin: "0 auto", display: "grid", gap: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "16px", color: "#64748b" }}>Signed in as</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827" }}>
              {currentUser.name}
            </div>
            <div style={{ color: "#64748b" }}>{currentUser.email}</div>
          </div>

          <button onClick={handleLogout} style={secondaryButtonStyle}>
            Sign out
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "16px",
          }}
        >
          <StatCard label="Total Tenders" value={stats.total} />
          <StatCard label="Review" value={stats.review} />
          <StatCard label="GO" value={stats.go} />
          <StatCard label="Ignore" value={stats.ignore} />
        </div>

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
              ...cardStyle,
              padding: "24px",
              position: "sticky",
              top: "24px",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>
              Tender Watch Dashboard
            </div>
            <div style={{ color: "#64748b", marginBottom: "22px" }}>
              Live tenders, saved decisions, and your own keyword bank
            </div>

            <SectionTitle>Search & filter</SectionTitle>

            <div style={{ display: "grid", gap: "10px", marginBottom: "24px" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tenders..."
                style={inputStyle}
              />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={inputStyle}
              >
                {allSources.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <SectionTitle>Your keywords</SectionTitle>

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addKeyword();
                }}
                placeholder="Add keyword"
                style={{ ...inputStyle, marginBottom: 0 }}
              />
              <button onClick={addKeyword} style={primaryButtonStyle}>
                Add
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  style={{
                    background: "#eef2f7",
                    borderRadius: "999px",
                    padding: "7px 10px",
                    fontSize: "12px",
                    color: "#334155",
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
                      cursor: "pointer",
                      color: "#64748b",
                      padding: 0,
                      fontSize: "12px",
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <SectionTitle>Add tender manually</SectionTitle>

            <div style={{ display: "grid", gap: "10px" }}>
              <input
                value={newTender.title}
                onChange={(e) =>
                  setNewTender((current) => ({ ...current, title: e.target.value }))
                }
                placeholder="Tender title"
                style={inputStyle}
              />
              <input
                value={newTender.buyer}
                onChange={(e) =>
                  setNewTender((current) => ({ ...current, buyer: e.target.value }))
                }
                placeholder="Buyer"
                style={inputStyle}
              />
              <input
                value={newTender.region}
                onChange={(e) =>
                  setNewTender((current) => ({ ...current, region: e.target.value }))
                }
                placeholder="Region"
                style={inputStyle}
              />
              <input
                type="date"
                value={newTender.deadline}
                onChange={(e) =>
                  setNewTender((current) => ({ ...current, deadline: e.target.value }))
                }
                style={inputStyle}
              />
              <input
                value={newTender.source}
                onChange={(e) =>
                  setNewTender((current) => ({ ...current, source: e.target.value }))
                }
                placeholder="Source"
                style={inputStyle}
              />
              <button onClick={addManualTender} style={primaryButtonStyle}>
                Add tender
              </button>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              <div>
                <div style={{ fontSize: "26px", fontWeight: "700", color: "#111827" }}>
                  Live tender pipeline
                </div>
                <div style={{ color: "#64748b", marginTop: "6px" }}>
                  Review opportunities and mark them GO / Review / Ignore
                </div>
              </div>
              <div style={{ fontSize: "14px", color: "#64748b" }}>
                Showing {filteredTenders.length} tenders
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

            {!loading && filteredTenders.length === 0 && (
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
                No tenders matched your current search, source, or keyword bank.
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
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenders.map((tender) => (
                    <tr key={tender.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
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
                        {(tender.matchedKeywords || []).join(", ") || "-"}
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={decisions[tender.id] || "Review"}
                          onChange={(e) => updateDecision(tender.id, e.target.value)}
                          style={smallSelectStyle}
                        >
                          <option>Review</option>
                          <option>GO</option>
                          <option>Ignore</option>
                        </select>
                      </td>
                      <td style={tdStyle}>
                        {tender.isManual ? (
                          <button
                            onClick={() => deleteManualTender(tender.id)}
                            style={{
                              border: "none",
                              background: "#fee2e2",
                              color: "#991b1b",
                              borderRadius: "10px",
                              padding: "8px 10px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Delete
                          </button>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>Live feed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getUserKey(email) {
  return `${STORAGE_PREFIX}_${email}`;
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

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "#f8f8f8",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "#64748b", fontSize: "14px" }}>{label}</div>
      <div
        style={{
          marginTop: "8px",
          fontSize: "34px",
          fontWeight: "700",
          color: "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: "14px",
        fontWeight: "700",
        color: "#111827",
        marginBottom: "12px",
      }}
    >
      {children}
    </div>
  );
}

const centerWrap = {
  minHeight: "100vh",
  background: "#e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#f8f8f8",
  borderRadius: "24px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "14px",
  color: "#334155",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  border: "none",
  background: "#111827",
  color: "#fff",
  borderRadius: "12px",
  padding: "11px 14px",
  cursor: "pointer",
  fontWeight: "600",
};

const secondaryButtonStyle = {
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#111827",
  borderRadius: "12px",
  padding: "11px 14px",
  cursor: "pointer",
  fontWeight: "600",
};

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

const smallSelectStyle = {
  padding: "8px 10px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "13px",
  background: "#fff",
};

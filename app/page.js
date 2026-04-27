"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_KEYWORDS = [
  "rail",
  "railway",
  "network rail",
  "operational property",
  "examination",
  "inspection",
  "ste4",
  "ste5",
  "condition survey",
  "structural inspection",
  "fire risk assessment",
  "dsear",
  "depot",
  "station",
];

export default function Page() {
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [keywords, setKeywords] = useState(DEFAULT_KEYWORDS);
  const [newKeyword, setNewKeyword] = useState("");
  const [tab, setTab] = useState("matched");
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ all: [], matched: [], excluded: [] });
  const [sourceStatus, setSourceStatus] = useState({});
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tenderUser");
    if (saved) {
      const user = JSON.parse(saved);
      setName(user.name || "");
      setEmail(user.email || "");
      setSignedIn(true);
    }

    const savedKeywords = localStorage.getItem("tenderKeywords");
    if (savedKeywords) setKeywords(JSON.parse(savedKeywords));

    const savedDecisions = localStorage.getItem("tenderDecisions");
    if (savedDecisions) setDecisions(JSON.parse(savedDecisions));
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    localStorage.setItem("tenderKeywords", JSON.stringify(keywords));
    loadTenders();
  }, [signedIn, keywords]);

  useEffect(() => {
    localStorage.setItem("tenderDecisions", JSON.stringify(decisions));
  }, [decisions]);

  async function loadTenders() {
    setLoading(true);
    const params = new URLSearchParams({ keywords: keywords.join(",") });

    try {
      const res = await fetch(`/api/tenders?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setData({
        all: json.all || [],
        matched: json.matched || [],
        excluded: json.excluded || [],
      });
      setSourceStatus(json.sourceStatus || {});
    } finally {
      setLoading(false);
    }
  }

  function signIn() {
    if (!name.trim() || !email.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    localStorage.setItem(
      "tenderUser",
      JSON.stringify({ name: name.trim(), email: email.trim() })
    );
    setSignedIn(true);
  }

  function signOut() {
    localStorage.removeItem("tenderUser");
    setSignedIn(false);
  }

  function addKeyword() {
    const word = newKeyword.trim().toLowerCase();
    if (!word) return;
    if (!keywords.includes(word)) setKeywords([...keywords, word]);
    setNewKeyword("");
  }

  function removeKeyword(word) {
    setKeywords(keywords.filter((k) => k !== word));
  }

  const currentRows = data[tab] || [];

  const filteredRows = useMemo(() => {
    return currentRows.filter((t) => {
      const text = [
        t.title,
        t.buyer,
        t.region,
        t.source,
        t.reason,
        ...(t.matchedKeywords || []),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [currentRows, search]);

  const counts = {
    all: data.all.length,
    matched: data.matched.length,
    excluded: data.excluded.length,
    go: Object.values(decisions).filter((x) => x === "GO").length,
  };

  if (!signedIn) {
    return (
      <div style={pageShell}>
        <div style={loginCard}>
          <img src="/modus-logo.jpg" style={{ width: 240, marginBottom: 24 }} />
          <h1 style={{ margin: 0 }}>Tender Watch</h1>
          <p style={{ color: "#64748b" }}>Sign in to open your Modus tender dashboard.</p>

          <input
            style={input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            style={input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button style={primaryButton} onClick={signIn}>
            Sign in
          </button>

          <p style={{ fontSize: 12, color: "#64748b" }}>
            This is local sign-in for now. Cloud login comes next.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageShell}>
      <div style={container}>
        <header style={header}>
          <div>
            <img src="/modus-logo.jpg" style={{ width: 220, marginBottom: 10 }} />
            <div style={{ color: "#64748b", fontSize: 14 }}>Signed in as</div>
            <h2 style={{ margin: 0 }}>{name}</h2>
            <div style={{ color: "#64748b" }}>{email}</div>
          </div>

          <button style={secondaryButton} onClick={signOut}>
            Sign out
          </button>
        </header>

        <div style={statsGrid}>
          <Stat label="All Notices" value={counts.all} />
          <Stat label="Matched" value={counts.matched} />
          <Stat label="Excluded" value={counts.excluded} />
          <Stat label="Marked GO" value={counts.go} />
        </div>

        <div style={mainGrid}>
          <aside style={card}>
            <h2 style={{ marginTop: 0 }}>Tender controls</h2>
            <p style={{ color: "#64748b" }}>
              Review what was included, what was excluded, and why.
            </p>

            <label style={label}>Search</label>
            <input
              style={input}
              placeholder="Search tenders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <label style={label}>Your keywords</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...input, marginBottom: 0 }}
                placeholder="Add keyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              />
              <button style={primaryButton} onClick={addKeyword}>
                Add
              </button>
            </div>

            <div style={chips}>
              {keywords.map((k) => (
                <span key={k} style={chip}>
                  {k}
                  <button style={chipX} onClick={() => removeKeyword(k)}>
                    ×
                  </button>
                </span>
              ))}
            </div>

            <button style={secondaryButton} onClick={loadTenders}>
              Refresh tenders
            </button>

            <div style={{ marginTop: 24 }}>
              <h3>Source status</h3>
              <p style={statusLine}>Find a Tender: {sourceStatus.findATender || "Not checked"}</p>
              <p style={statusLine}>Contracts Finder: {sourceStatus.contractsFinder || "Not checked"}</p>
            </div>
          </aside>

          <main style={card}>
            <div style={tabs}>
              <button style={tabButton(tab === "matched")} onClick={() => setTab("matched")}>
                Matched
              </button>
              <button style={tabButton(tab === "excluded")} onClick={() => setTab("excluded")}>
                Excluded
              </button>
              <button style={tabButton(tab === "all")} onClick={() => setTab("all")}>
                All Notices
              </button>
            </div>

            <h2 style={{ marginTop: 0 }}>
              {tab === "matched" && "Matched Notices"}
              {tab === "excluded" && "Excluded Notices"}
              {tab === "all" && "All Recent Notices"}
            </h2>

            <p style={{ color: "#64748b" }}>
              Showing {filteredRows.length} notices. {loading ? "Refreshing..." : ""}
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Score</th>
                    <th style={th}>Tender</th>
                    <th style={th}>Buyer</th>
                    <th style={th}>Deadline</th>
                    <th style={th}>Source</th>
                    <th style={th}>Keywords</th>
                    <th style={th}>Reason</th>
                    <th style={th}>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((t) => (
                    <tr key={t.id} style={tr}>
                      <td style={td}>{t.score}</td>
                      <td style={tdStrong}>
                        {t.url ? (
                          <a href={t.url} target="_blank" rel="noreferrer" style={link}>
                            {t.title}
                          </a>
                        ) : (
                          t.title
                        )}
                      </td>
                      <td style={td}>{t.buyer}</td>
                      <td style={td}>{formatDate(t.deadline)}</td>
                      <td style={td}>{t.source}</td>
                      <td style={td}>{(t.matchedKeywords || []).join(", ") || "-"}</td>
                      <td style={td}>{t.reason}</td>
                      <td style={td}>
                        <select
                          style={select}
                          value={decisions[t.id] || "Review"}
                          onChange={(e) =>
                            setDecisions({ ...decisions, [t.id]: e.target.value })
                          }
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
          </main>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={statCard}>
      <div style={{ color: "#64748b", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const pageShell = {
  minHeight: "100vh",
  background: "#e5e7eb",
  padding: 28,
  fontFamily: "Arial, sans-serif",
};

const container = {
  maxWidth: 1500,
  margin: "0 auto",
};

const loginCard = {
  maxWidth: 460,
  margin: "80px auto",
  background: "#fff",
  borderRadius: 24,
  padding: 34,
  boxShadow: "0 8px 30px rgba(15,23,42,0.12)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  marginBottom: 24,
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: 24,
  alignItems: "start",
};

const card = {
  background: "#fff",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 8px 30px rgba(15,23,42,0.10)",
};

const statCard = {
  background: "#fff",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 8px 30px rgba(15,23,42,0.10)",
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "11px 12px",
  marginBottom: 14,
};

const label = {
  display: "block",
  marginTop: 16,
  marginBottom: 6,
  fontWeight: 700,
};

const primaryButton = {
  background: "#111827",
  color: "#fff",
  border: 0,
  borderRadius: 12,
  padding: "11px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButton = {
  background: "#fff",
  color: "#111827",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "11px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const chips = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 14,
  marginBottom: 20,
};

const chip = {
  background: "#eef2f7",
  borderRadius: 999,
  padding: "7px 10px",
  fontSize: 12,
  color: "#334155",
};

const chipX = {
  marginLeft: 6,
  border: 0,
  background: "transparent",
  cursor: "pointer",
};

const statusLine = {
  fontSize: 13,
  color: "#475569",
};

const tabs = {
  display: "flex",
  gap: 10,
  marginBottom: 18,
};

const tabButton = (active) => ({
  border: 0,
  borderRadius: 999,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
  background: active ? "#111827" : "#eef2f7",
  color: active ? "#fff" : "#334155",
});

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const th = {
  textAlign: "left",
  padding: "12px 14px 12px 0",
  borderBottom: "1px solid #cbd5e1",
  color: "#64748b",
};

const td = {
  padding: "14px 14px 14px 0",
  borderBottom: "1px solid #e5e7eb",
  color: "#475569",
  verticalAlign: "top",
};

const tdStrong = {
  ...td,
  fontWeight: 700,
  color: "#111827",
};

const tr = {};

const link = {
  color: "#111827",
  textDecoration: "none",
};

const select = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
};

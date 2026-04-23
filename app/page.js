"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [tenders, setTenders] = useState([]);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("All");
  const [decisions, setDecisions] = useState({});
  const [keywords, setKeywords] = useState([
    "rail",
    "examination",
    "inspection",
    "fire",
    "dsear",
  ]);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    fetch("/api/tenders")
      .then((res) => res.json())
      .then((data) => {
        setTenders(data.tenders || []);
      });
  }, []);

  const handleDecision = (id, value) => {
    setDecisions((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setKeywords([...keywords, newKeyword.toLowerCase()]);
    setNewKeyword("");
  };

  const removeKeyword = (word) => {
    setKeywords(keywords.filter((k) => k !== word));
  };

  const filtered = tenders.filter((t) => {
    const text = `${t.title} ${t.buyer}`.toLowerCase();

    const keywordMatch = keywords.some((k) =>
      text.includes(k.toLowerCase())
    );

    const searchMatch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.buyer.toLowerCase().includes(search.toLowerCase());

    const sourceMatch = source === "All" || t.source === source;

    return keywordMatch && searchMatch && sourceMatch;
  });

  const counts = {
    total: filtered.length,
    review: Object.values(decisions).filter((d) => d === "Review").length,
    go: Object.values(decisions).filter((d) => d === "GO").length,
    ignore: Object.values(decisions).filter((d) => d === "Ignore").length,
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>Tender Watch Dashboard</h1>

      {/* STATS */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div>Total: {counts.total}</div>
        <div>Review: {counts.review}</div>
        <div>GO: {counts.go}</div>
        <div>Ignore: {counts.ignore}</div>
      </div>

      {/* KEYWORD MANAGER */}
      <div style={{ marginBottom: 20 }}>
        <h3>Your Keywords</h3>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add keyword"
          />
          <button onClick={addKeyword}>Add</button>
        </div>

        <div style={{ marginTop: 10 }}>
          {keywords.map((k) => (
            <span
              key={k}
              style={{
                marginRight: 10,
                padding: "5px 10px",
                background: "#eee",
                cursor: "pointer",
              }}
              onClick={() => removeKeyword(k)}
            >
              {k} ✕
            </span>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Search tenders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setSource(e.target.value)}>
          <option>All</option>
          <option>Find a Tender</option>
        </select>
      </div>

      {/* TABLE */}
      <table width="100%" border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Tender</th>
            <th>Buyer</th>
            <th>Region</th>
            <th>Deadline</th>
            <th>Source</th>
            <th>Decision</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.buyer}</td>
              <td>{t.region}</td>
              <td>{t.deadline || "-"}</td>
              <td>{t.source}</td>
              <td>
                <select
                  value={decisions[t.id] || "Review"}
                  onChange={(e) =>
                    handleDecision(t.id, e.target.value)
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
  );
}

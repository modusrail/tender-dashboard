"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");

  const [tenders, setTenders] = useState([]);
  const [keywords, setKeywords] = useState(["rail", "inspection"]);
  const [newKeyword, setNewKeyword] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) loadTenders();
  }, [user, keywords]);

  async function loadTenders() {
    const res = await fetch(`/api/tenders?keywords=${keywords.join(",")}`);
    const data = await res.json();
    setTenders(data.tenders || []);
  }

  function login() {
    const u = { email };
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  function addKeyword() {
    if (!newKeyword) return;
    setKeywords([...keywords, newKeyword.toLowerCase()]);
    setNewKeyword("");
  }

  function removeKeyword(k) {
    setKeywords(keywords.filter((x) => x !== k));
  }

  const filtered = tenders.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: filtered.length,
    review: filtered.length,
    go: 0,
    ignore: 0,
  };

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial" }}>
        <img src="/modus-logo.jpg" style={{ width: 200 }} />
        <h2>Sign in</h2>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={login}>Sign in</button>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div style={{ padding: 40, fontFamily: "Arial", background: "#f5f6f8" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <img src="/modus-logo.jpg" style={{ height: 50 }} />
        <button onClick={logout}>Sign out</button>
      </div>

      <h2>Signed in as {user.email}</h2>

      {/* STATS */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Card title="Total" value={stats.total} />
        <Card title="Review" value={stats.review} />
        <Card title="GO" value={stats.go} />
        <Card title="Ignore" value={stats.ignore} />
      </div>

      {/* SIDEBAR */}
      <div style={{ display: "flex", marginTop: 30, gap: 30 }}>
        <div style={{ width: 300 }}>
          <h3>Keywords</h3>

          <input
            placeholder="Add keyword"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
          />
          <button onClick={addKeyword}>Add</button>

          <div style={{ marginTop: 10 }}>
            {keywords.map((k) => (
              <div key={k}>
                {k}{" "}
                <button onClick={() => removeKeyword(k)}>x</button>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN TABLE */}
        <div style={{ flex: 1 }}>
          <h2>Tender Dashboard</h2>

          <input
            placeholder="Search tenders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <table
            style={{
              width: "100%",
              marginTop: 20,
              background: "white",
              borderRadius: 10,
            }}
          >
            <thead>
              <tr>
                <th>Tender</th>
                <th>Buyer</th>
                <th>Region</th>
                <th>Deadline</th>
                <th>Source</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <a href={t.url} target="_blank">
                      {t.title}
                    </a>
                  </td>
                  <td>{t.buyer}</td>
                  <td>{t.region}</td>
                  <td>{t.deadline}</td>
                  <td>{t.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
      <div>{title}</div>
      <div style={{ fontSize: 24 }}>{value}</div>
    </div>
  );
}

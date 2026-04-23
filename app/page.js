export default function Page() {
  const tenders = [
    {
      title: "Buildings Examination Framework",
      buyer: "Network Rail Infrastructure Ltd",
      region: "Eastern",
      category: "Examinations",
      deadline: "06 May 2026",
      status: "High Match",
      source: "Find a Tender",
    },
    {
      title: "Fire Risk Assessment Services",
      buyer: "Transport for Wales",
      region: "Wales & Western",
      category: "Fire / FRA",
      deadline: "12 May 2026",
      status: "Medium Match",
      source: "Sell2Wales",
    },
    {
      title: "Structural Asset Inspection Support",
      buyer: "Local Authority",
      region: "London",
      category: "Inspections",
      deadline: "18 May 2026",
      status: "Review",
      source: "Contracts Finder",
    },
  ];

  const keywords = [
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
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
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
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>
                Tender Watch
              </div>
              <div style={{ marginTop: "6px", fontSize: "14px", color: "#64748b" }}>
                Secure dashboard prototype with login-style layout
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
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                  Email
                </label>
                <input
                  placeholder="andrew@company.co.uk"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "14px",
                  border: "none",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>
                Notification settings
              </div>

              <div style={{ display: "grid", gap: "12px", fontSize: "14px", color: "#475569" }}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Email alerts for new tenders</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Daily digest at 9:00 AM</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>High-match only alerts</span>
                  <input type="checkbox" />
                </label>
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>
                Tracked keywords
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
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "16px",
              }}
            >
              {[
                { label: "New Matches", value: "14" },
                { label: "High Match", value: "5" },
                { label: "Awaiting Review", value: "7" },
                { label: "Email Alerts Sent", value: "11" },
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
                  <div style={{ fontSize: "14px", color: "#64748b" }}>{card.label}</div>
                  <div style={{ marginTop: "8px", fontSize: "34px", fontWeight: "700", color: "#0f172a" }}>
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
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>
                    Tender dashboard
                  </div>
                  <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
                    Live opportunities matched against your tracked services
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <input
                    placeholder="Search buyer, keyword or source"
                    style={{
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      minWidth: "240px",
                    }}
                  />
                  <select
                    style={{
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option>All sources</option>
                    <option>Find a Tender</option>
                    <option>Contracts Finder</option>
                    <option>BidStats</option>
                    <option>BravoNR</option>
                  </select>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", textAlign: "left" }}>
                      <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Tender</th>
                      <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Buyer</th>
                      <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Region</th>
                      <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Category</th>
                      <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Deadline</th>
                      <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Source</th>
                      <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenders.map((tender) => (
                      <tr key={tender.title} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 16px 16px 0", fontWeight: "600", color: "#0f172a" }}>{tender.title}</td>
                        <td style={{ padding: "16px 16px 16px 0", color: "#475569" }}>{tender.buyer}</td>
                        <td style={{ padding: "16px 16px 16px 0", color: "#475569" }}>{tender.region}</td>
                        <td style={{ padding: "16px 16px 16px 0", color: "#475569" }}>{tender.category}</td>
                        <td style={{ padding: "16px 16px 16px 0", color: "#475569" }}>{tender.deadline}</td>
                        <td style={{ padding: "16px 16px 16px 0", color: "#475569" }}>{tender.source}</td>
                        <td style={{ padding: "16px 16px 16px 0" }}>
                          <span
                            style={{
                              background: "#f1f5f9",
                              color: "#334155",
                              fontSize: "12px",
                              padding: "6px 10px",
                              borderRadius: "999px",
                            }}
                          >
                            {tender.status}
                          </span>
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
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
                  Suggested workflow
                </div>
                <div style={{ display: "grid", gap: "12px", fontSize: "14px", color: "#475569" }}>
                  <div>1. System checks all selected tender portals.</div>
                  <div>2. Matches results against your keyword bank.</div>
                  <div>3. Scores the opportunity by relevance.</div>
                  <div>4. Sends instant email alert or daily digest.</div>
                  <div>5. Dashboard stores everything for review and tracking.</div>
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
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
                  What can be added next
                </div>
                <div style={{ display: "grid", gap: "12px", fontSize: "14px", color: "#475569" }}>
                  <div>• Buyer watchlists</div>
                  <div>• Go / No-Go scoring</div>
                  <div>• Deadline reminders</div>
                  <div>• Export to Excel</div>
                  <div>• Assign tender owner internally</div>
                  <div>• Separate rail / fire / inspections views</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

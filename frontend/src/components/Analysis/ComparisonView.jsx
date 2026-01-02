import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../config/firebase";

export default function ComparisonView() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const snap = await getDocs(
      collection(db, "users", auth.currentUser.uid, "reports")
    );

    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setReports(data);
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const compareReports = async () => {
    setLoading(true);
    const fetched = [];

    for (const id of selected) {
      const ref = doc(db, "users", auth.currentUser.uid, "reports", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        fetched.push({ id, ...snap.data() });
      }
    }

    setSelectedReports(fetched);
    setComparison(buildComparison(fetched));
    setLoading(false);
  };

  const buildComparison = (reports) => {
    const map = {};

    reports.forEach(r => {
      const tests = r.tests || []; // 🔥 FIXED PATH
      tests.forEach(t => {
        if (!map[t.test_name]) map[t.test_name] = {};
        map[t.test_name][r.id] = {
          value: t.value,
          unit: t.unit,
          status: t.status
        };
      });
    });

    return map;
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Compare Lab Reports</h2>
      <p>Select at least 2 reports</p>

      {/* REPORT PICKER */}
      <div style={{ display: "grid", gap: "10px", maxWidth: "600px" }}>
        {reports.map(r => (
          <label
            key={r.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              background: selected.includes(r.id) ? "#eef2ff" : "#fff"
            }}
          >
            <input
              type="checkbox"
              checked={selected.includes(r.id)}
              onChange={() => toggleSelect(r.id)}
              style={{ marginRight: "12px" }}
            />
            <div>
              <strong>{r.fileName || "Lab Report"}</strong>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Uploaded{" "}
                {r.uploadedAt?.seconds
                  ? new Date(r.uploadedAt.seconds * 1000).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={compareReports}
        disabled={selected.length < 2 || loading}
        style={{
          marginTop: "16px",
          padding: "10px 16px",
          borderRadius: "6px",
          border: "none",
          background: "#6366f1",
          color: "white",
          cursor: "pointer"
        }}
      >
        {loading ? "Comparing..." : "Compare Selected Reports"}
      </button>

      {/* COMPARISON TABLE */}
      {comparison && (
        <div style={{ marginTop: "32px", overflowX: "auto" }}>
          <h3>Comparison</h3>

          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              marginTop: "12px"
            }}
          >
            <thead>
              <tr>
                <th style={th}>Test</th>
                {selectedReports.map(r => (
                  <th key={r.id} style={th}>
                    {r.fileName || "Report"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(comparison).map(([test, values]) => (
                <tr key={test}>
                  <td style={td}><strong>{test}</strong></td>
                  {selectedReports.map(r => (
                    <td key={r.id} style={td}>
                      {values[r.id]
                        ? `${values[r.id].value} ${values[r.id].unit || ""}`
                        : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = {
  borderBottom: "2px solid #ccc",
  padding: "10px",
  textAlign: "left",
  background: "#f9fafb"
};

const td = {
  borderBottom: "1px solid #eee",
  padding: "10px"
};

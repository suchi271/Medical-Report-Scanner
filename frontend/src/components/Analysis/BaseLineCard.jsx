export default function BaselineCard({ baseline, testName }) {
  if (!baseline) return null;

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "14px",
        borderRadius: "8px",
        background: "#f8fafc",
        border: "1px solid #e5e7eb"
      }}
    >
      <h4 style={{ marginBottom: "8px" }}>
        Personal Baseline — {testName}
      </h4>

      <p>
        Average: <strong>{baseline.personal_baseline?.toFixed(2)}</strong>
      </p>
      <p>
        Min: {baseline.min_value} | Max: {baseline.max_value}
      </p>
      <p>
        Variability (σ): {baseline.variability?.toFixed(2)}
      </p>
    </div>
  );
}

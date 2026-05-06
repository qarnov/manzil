import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/zakat")({ component: Zakat });

const NISAB = 568620;

const fields = [
  { key: "gold", label: "Gold & Silver value" },
  { key: "cashHome", label: "Cash at Home" },
  { key: "cashBank", label: "Cash at Bank" },
  { key: "investments", label: "Investments & Shares" },
  { key: "business", label: "Business Goods & Property" },
];

function Zakat() {
  const [vals, setVals] = useState<Record<string, string>>({});
  const num = (k: string) => parseFloat(vals[k] || "0") || 0;
  const assets = fields.reduce((a, f) => a + num(f.key), 0);
  const liabilities = num("loans");
  const net = assets - liabilities;
  const aboveNisab = net >= NISAB;
  const zakat = aboveNisab ? net * 0.025 : 0;

  const Field = ({ k, label }: { k: string; label: string }) => (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
      padding: 12, margin: "0 16px 10px"
    }}>
      <label className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>{label.toUpperCase()}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        <span style={{ color: "var(--muted)", fontSize: 16 }}>₹</span>
        <input type="number" inputMode="decimal" value={vals[k] || ""}
          onChange={(e) => setVals({ ...vals, [k]: e.target.value })}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontSize: 18, color: "var(--ink)", minHeight: 32
          }} placeholder="0" />
      </div>
    </div>
  );

  return (
    <>
      <TopBar title="Zakat Calculator" back />
      <div style={{
        margin: "12px 16px", padding: 12, background: "var(--card-dark)",
        border: "1px solid var(--border)", borderRadius: 10
      }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink)", lineHeight: 1.5 }}>
          Enter all assets held for over one lunar year. Zakat = 2.5% of net value above nisab.
        </div>
      </div>

      <div className="label-mono">ASSETS</div>
      {fields.map((f) => <Field key={f.key} k={f.key} label={f.label} />)}

      <div className="label-mono">MINUS LIABILITIES</div>
      <Field k="loans" label="Loans & Debts" />

      <div className="label-mono">RESULT</div>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, margin: "0 16px 10px", padding: 14 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>TOTAL NET VALUE</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>₹ {net.toLocaleString("en-IN")}</div>
      </div>

      <div style={{
        background: aboveNisab ? "var(--ink)" : "var(--card-dark)",
        color: aboveNisab ? "var(--card)" : "var(--ink)",
        border: aboveNisab ? "1px solid var(--gold)" : "1px solid var(--border)",
        borderRadius: 12, margin: "0 16px", padding: 16
      }}>
        {aboveNisab ? (
          <>
            <div className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>ZAKAT DUE (2.5%)</div>
            <div style={{ fontFamily: "var(--font-arabic)", fontSize: 28, marginTop: 6 }}>
              ₹ {zakat.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, fontWeight: 700 }}>No Zakat due</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>
              Total value is below Nisab.
            </div>
          </>
        )}
        <div className="mono" style={{ fontSize: 9, color: aboveNisab ? "var(--gold)" : "var(--muted)", marginTop: 10 }}>
          NISAB: ₹ {NISAB.toLocaleString("en-IN")} (87.48g × ₹6,500)
        </div>
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}

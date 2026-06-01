import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "../components/TopBar";
import duasData from "../data/duas.json";

export const Route = createFileRoute("/duas/$category")({ component: DuasCategory });

function DuasCategory() {
  const { category } = Route.useParams();
  const cat = duasData.categories.find((c) => c.id === category);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!cat) {
    return (
      <>
        <TopBar title="Not found" back />
        <div style={{ padding: 24 }} className="mono">Category not found.</div>
      </>
    );
  }

  return (
    <>
      <TopBar title={`${cat.name} ${cat.emoji}`} back />
      <div style={{ padding: "8px 18px 14px" }} className="mono">
        <span style={{ fontSize: 9, color: "var(--muted)" }}>
          {cat.duas.length} DUAS
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 16px" }}>
        {cat.duas.map((d, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} style={{
              position: "relative",
              background: "var(--card-dark)", border: "1px solid var(--border)",
              borderRadius: 12, padding: 14
            }}>
              <span className="mono" style={{
                position: "absolute", top: 10, right: 10,
                fontSize: 10, color: "var(--card)", background: "var(--ink)",
                padding: "2px 8px", borderRadius: 12, fontWeight: 600
              }}>×{d.repetitions}</span>

              <div className="arabic" style={{ fontSize: 22, color: "var(--ink)", paddingRight: 44 }}>
                {d.arabic}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 13, marginTop: 10, color: "var(--quote)", lineHeight: 1.5 }}>
                {d.translation}
              </div>
              <hr className="hr-dashed" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>{d.reference}</span>
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="mono"
                  style={{
                    fontSize: 10, color: "var(--ink)",
                    border: "1px solid var(--border)",
                    padding: "4px 10px", borderRadius: 12,
                  }}
                >
                  {isOpen ? "Hide Benefit ▲" : "Benefit ▼"}
                </button>
              </div>
              {isOpen && (
                <div style={{
                  marginTop: 10, padding: 10,
                  background: "var(--card)", border: "1px dashed var(--border)",
                  borderRadius: 8, fontSize: 12, lineHeight: 1.5, color: "var(--ink)"
                }}>
                  {d.benefit}
                </div>
              )}

              <button
                onClick={() =>
                  window.open(
                    "https://wa.me/?text=" +
                      encodeURIComponent(
                        d.arabic + "\n\n" + d.translation + "\n\n— " + d.reference + "\n\nShared via Manzil"
                      ),
                    "_blank"
                  )
                }
                style={{
                  marginTop: 12, width: "100%", minHeight: 44,
                  background: "#25D366", color: "#fff",
                  border: "none", borderRadius: 22,
                  fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                Share on WhatsApp
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}

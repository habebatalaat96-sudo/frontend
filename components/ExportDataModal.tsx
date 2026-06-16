import { useState } from "react";
import { X, Download, Database, ChevronRight, CheckCircle2, Circle, Layers } from "lucide-react";

const COLLECTIONS = [
  { id: "businesses", label: "Businesses", icon: "🏢", count: "2,341 records" },
  { id: "reviews", label: "Reviews", icon: "⭐", count: "18,902 records" },
  { id: "users", label: "Users", icon: "👤", count: "5,210 records" },
  { id: "pendingUpdates", label: "Pending Updates", icon: "🔄", count: "142 records" },
  { id: "categories", label: "Categories", icon: "🗂️", count: "88 records" },
  { id: "notifications", label: "Notifications", icon: "🔔", count: "3,670 records" },
  { id: "sessions", label: "Sessions", icon: "🔐", count: "9,501 records" },
  { id: "logs", label: "Logs", icon: "📋", count: "41,220 records" },
];

const FORMAT_OPTIONS = ["JSON", "CSV", "XML"];

export default function ExportDataModal({ onClose }: { onClose?: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState("JSON");
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => setSelected(new Set(COLLECTIONS.map((c) => c.id)));
  const clearAll = () => setSelected(new Set());

  const handleExport = async () => {
    if (selected.size === 0) return;
    setExporting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setExporting(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
    // Real call:
    // const token = localStorage.getItem('adminToken');
    // const params = [...selected].join(',');
    // const res = await fetch(`http://localhost:5000/admin/export?collections=${params}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // const data = await res.json();
    // const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url; link.download = `export-${Date.now()}.${format.toLowerCase()}`;
    // link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: "1rem",
    }}>
      <div style={{
        width: "100%", maxWidth: 620,
        background: "#0f1117",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Google font */}
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

        {/* Header */}
        <div style={{
          padding: "1.5rem 1.5rem 1rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #6c63ff22, #a78bfa22)",
              border: "1px solid #6c63ff44",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Database size={18} color="#a78bfa" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#f1f1f1" }}>Export Data</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 1 }}>
                {selected.size === 0 ? "Select collections to export" : `${selected.size} collection${selected.size > 1 ? "s" : ""} selected`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: 4, borderRadius: 8, lineHeight: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Format selector */}
        <div style={{ padding: "1rem 1.5rem 0", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#555", marginRight: 4, fontFamily: "'DM Mono', monospace" }}>FORMAT</span>
          {FORMAT_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              style={{
                padding: "4px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                cursor: "pointer", transition: "all 0.15s",
                border: format === f ? "1px solid #6c63ff" : "1px solid rgba(255,255,255,0.1)",
                background: format === f ? "#6c63ff22" : "transparent",
                color: format === f ? "#a78bfa" : "#555",
                fontFamily: "'DM Mono', monospace",
              }}
            >{f}</button>
          ))}
        </div>

        {/* Select all / clear */}
        <div style={{
          padding: "0.75rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Layers size={13} color="#555" />
            <span style={{ fontSize: 12, color: "#555" }}>Collections</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={selectAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#a78bfa", fontFamily: "'DM Sans', sans-serif" }}>
              Select all
            </button>
            <button onClick={clearAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
              Clear
            </button>
          </div>
        </div>

        {/* Collections grid */}
        <div style={{
          padding: "0 1.5rem",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8, maxHeight: 320, overflowY: "auto",
        }}>
          {COLLECTIONS.map((c) => {
            const isSelected = selected.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                  border: isSelected ? "1px solid #6c63ff66" : "1px solid rgba(255,255,255,0.06)",
                  background: isSelected ? "#6c63ff14" : "#ffffff06",
                  textAlign: "left", transition: "all 0.15s",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{c.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: isSelected ? "#c4b5fd" : "#ccc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Mono', monospace", marginTop: 1 }}>{c.count}</div>
                </div>
                {isSelected
                  ? <CheckCircle2 size={15} color="#6c63ff" />
                  : <Circle size={15} color="#333" />
                }
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem",
        }}>
          <div style={{ fontSize: 12, color: "#444", fontFamily: "'DM Mono', monospace" }}>
            {selected.size > 0 && `~${COLLECTIONS.filter(c => selected.has(c.id)).reduce((a, c) => a + parseInt(c.count.replace(/,/g, "")), 0).toLocaleString()} records`}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "#666",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >Cancel</button>
            <button
              onClick={handleExport}
              disabled={selected.size === 0 || exporting}
              style={{
                padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                cursor: selected.size === 0 ? "not-allowed" : "pointer",
                border: "none",
                background: done
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : selected.size === 0
                    ? "#1a1a2a"
                    : "linear-gradient(135deg, #6c63ff, #a78bfa)",
                color: selected.size === 0 ? "#444" : "white",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s",
                fontFamily: "'DM Sans', sans-serif",
                opacity: exporting ? 0.8 : 1,
              }}
            >
              {done ? (
                <><CheckCircle2 size={14} /> Done!</>
              ) : exporting ? (
                <><span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 14 }}>⟳</span> Exporting...</>
              ) : (
                <><Download size={14} /> Export {format}</>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

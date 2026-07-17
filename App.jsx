import React, { useState } from "react";
import { ClipboardCheck, MessageCircle, Search, Check, ShieldCheck, Car, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { createBooking, fetchBookingsByPhone, fetchReportByBooking } from "./firebase.js";

const WHATSAPP = "919606883464"; // TODO: replace with your number
const LOGO = "https://i.ibb.co/HDQ0sXwB/IMG-20260710-213757-285.jpg";
const navy = "#16213e";
const cream = "#f6f4ef";

const PACKAGES = [
  { name: "Basic", price: "₹999", desc: "30+ point inspection + PDF report" },
  { name: "Standard", price: "₹1,499", desc: "Basic + OBD scan + photos", popular: true },
  { name: "Premium", price: "₹2,199", desc: "Standard + video + negotiation notes" },
];

const SERVICES = [
  {
    icon: "🔍",
    title: "Used Vehicle Inspection",
    desc: "Independent 30+ point doorstep inspection before you buy any used car or bike.",
    items: ["Documents & RC check", "Engine bay inspection", "OBD/DTC scan", "Exterior & accident check", "Interior & electricals", "Test drive assessment", "PDF report on WhatsApp"],
    color: navy,
  },
  {
    icon: "🔧",
    title: "Minor Doorstep Repairs",
    desc: "Quick fixes done at your location — no need to visit a workshop for small issues.",
    items: ["Bulb & fuse replacement", "Wiper blade replacement", "Battery terminal cleaning", "Oil/coolant/fluid top-up", "Tyre pressure & puncture check", "Basic AC gas check"],
    color: "#1d7a4c",
  },
  {
    icon: "📄",
    title: "RC & Documentation Help",
    desc: "Assistance with vehicle paperwork so your purchase is legally clean.",
    items: ["RC transfer guidance", "Hypothecation clearance check", "Insurance transfer help", "Ownership verification", "Challan/fine check", "Document authentication"],
    color: "#0f3460",
  },
  {
    icon: "🚗",
    title: "Pre-Sale Inspection",
    desc: "Selling your vehicle? Get it inspected and certified to command a better price.",
    items: ["Full condition report", "Honest value assessment", "Issues identified before listing", "InspectMoto certification", "Builds buyer trust", "PDF report for listing"],
    color: "#c98a1e",
  },
];
const RATING_COLORS = {
  Superb: "#1d7a4c", Good: "#4d8f3a", Fair: "#c98a1e",
  Bad: "#c1521f", "Very Bad": "#a32626",
};

const SECTIONS = ["Documents","Exterior","Engine Bay","Interior & Electricals","Test Drive"];

export default function CustomerApp() {
  const [tab, setTab] = useState("book"); // book | status
  const [pkg, setPkg] = useState("Standard");
  const [form, setForm] = useState({ name: "", phone: "", vehicle: "", area: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupResults, setLookupResults] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [expandedReport, setExpandedReport] = useState(null);

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submitBooking() {
    if (!form.name || !form.phone || !form.vehicle) {
      alert("Please fill in name, phone and vehicle."); return;
    }
    setSubmitting(true);
    try {
      await createBooking({ ...form, package: pkg });
      const msg = encodeURIComponent(
        `*New Booking - InspectMoto*\nName: ${form.name}\nPhone: ${form.phone}\nVehicle: ${form.vehicle}\nArea: ${form.area}\nPackage: ${pkg}\nNotes: ${form.notes || "-"}`
      );
      window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
      setSubmitted(true);
    } catch (e) {
      alert("Booking failed: " + e.message);
    }
    setSubmitting(false);
  }

  async function lookupBookings() {
    if (!lookupPhone.trim()) { alert("Enter your phone number."); return; }
    setLookupLoading(true);
    try {
      const bookings = await fetchBookingsByPhone(lookupPhone);
      const withReports = await Promise.all(
        bookings.map(async (b) => {
          const report = b.reportId ? await fetchReportByBooking(b.id) : null;
          return { ...b, report };
        })
      );
      setLookupResults(withReports);
    } catch (e) {
      alert("Lookup failed: " + e.message);
    }
    setLookupLoading(false);
  }

  const statusColor = { pending: "#c98a1e", assigned: "#4d8f3a", in_progress: "#0f3460", completed: "#1d7a4c" };
  const statusLabel = { pending: "Pending confirmation", assigned: "Inspector assigned", in_progress: "Inspection in progress", completed: "Completed ✓" };

  return (
    <div style={{ minHeight: "100vh", background: cream, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", background: "#fff", minHeight: "100vh", boxShadow: "0 0 24px rgba(0,0,0,0.06)" }}>

        {/* Header */}
        <div style={{ background: navy, color: "#fff", padding: "18px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={LOGO} alt="InspectMoto" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.3 }}>InspectMoto</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Doorstep Vehicle Inspections • Bangalore</div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${navy} 0%, #0f3460 100%)`, color: "#fff", padding: "28px 20px 24px", textAlign: "center" }}>
          <img src={LOGO} alt="InspectMoto Logo" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.25)", marginBottom: 14 }} />
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
            Know before you buy. 🔍
          </div>
          <div style={{ fontSize: 13.5, opacity: 0.85, lineHeight: 1.6, marginBottom: 16 }}>
            We inspect any used vehicle at the seller's location — and send you an honest report before you pay a single rupee.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <HeroBadge>✅ 30+ Point Check</HeroBadge>
            <HeroBadge>📄 PDF Report</HeroBadge>
            <HeroBadge>🚗 Doorstep Service</HeroBadge>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #eee" }}>
          {[["book","Book Inspection"],["status","My Bookings"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: "13px 0", fontSize: 13.5, fontWeight: 700,
              border: "none", background: "none", cursor: "pointer",
              color: tab === id ? navy : "#999",
              borderBottom: tab === id ? `2.5px solid ${navy}` : "none",
              marginBottom: -2,
            }}>{label}</button>
          ))}
        </div>

        {/* Book tab */}
        {tab === "book" && !submitted && (
          <div style={{ padding: 20 }}>
            <p style={{ fontSize: 13, color: "#777", margin: "10px 0 18px", lineHeight: 1.5 }}>
              We come to the seller's location, run a 30+ point check and send you an honest report before you pay.
            </p>

            <Label>Choose Package</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {PACKAGES.map((p) => (
                <div key={p.name} onClick={() => setPkg(p.name)} style={{
                  border: `1.5px solid ${pkg === p.name ? navy : "#e5e2da"}`,
                  background: pkg === p.name ? "#eef0f6" : "#fff",
                  borderRadius: 10, padding: "12px 14px", cursor: "pointer", position: "relative",
                }}>
                  {p.popular && <span style={{ position: "absolute", top: -8, right: 12, background: "#c98a1e", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4 }}>POPULAR</span>}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: navy }}>{p.price}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#777", marginTop: 3 }}>{p.desc}</div>
                </div>
              ))}
            </div>

            <Label>Your Details</Label>
            <Input placeholder="Full name *" value={form.name} onChange={upd("name")} />
            <Input placeholder="Phone number *" value={form.phone} onChange={upd("phone")} type="tel" />
            <Input placeholder="Vehicle (make, model, year) *" value={form.vehicle} onChange={upd("vehicle")} />
            <Input placeholder="Seller's location / area" value={form.area} onChange={upd("area")} />
            <Input placeholder="Any specific concerns? (optional)" value={form.notes} onChange={upd("notes")} />

            <Btn onClick={submitBooking} disabled={submitting} color="#1d7a4c">
              <MessageCircle size={16}/> {submitting ? "Booking…" : "Confirm Booking via WhatsApp"}
            </Btn>
          </div>
        )}

        {tab === "book" && submitted && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: navy, marginBottom: 8 }}>Booking Confirmed!</div>
            <div style={{ fontSize: 13.5, color: "#666", lineHeight: 1.6, marginBottom: 24 }}>
              Your booking has been sent to us via WhatsApp. We'll confirm your slot and assign an inspector shortly.
            </div>
            <button onClick={() => { setSubmitted(false); setTab("status"); setLookupPhone(form.phone); }}
              style={{ background: navy, color: "#fff", border: "none", borderRadius: 8, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Track My Booking
            </button>
          </div>
        )}

       {tab === "services" && (
  <div style={{ padding: 20 }}>
    <div style={{ fontSize: 15, fontWeight: 800, color: navy, marginBottom: 4 }}>Our Services</div>
    <div style={{ fontSize: 12.5, color: "#888", marginBottom: 16 }}>Everything we offer — at your doorstep.</div>
    {SERVICES.map((s, i) => (
      <div key={i} style={{ border: "1px solid #e5e2da", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
        <div onClick={() => setExpandedService(expandedService === i ? null : i)}
          style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: navy }}>{s.title}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{s.desc}</div>
            </div>
          </div>
          {expandedService === i ? <ChevronUp size={16} color="#999"/> : <ChevronDown size={16} color="#999"/>}
        </div>
        {expandedService === i && (
          <div style={{ background: "#f9f8f5", padding: "12px 16px", borderTop: "1px solid #eee" }}>
            {s.items.map((item, j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13, color: "#444", borderBottom: j < s.items.length - 1 ? "1px solid #eee" : "none" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={11} color="#fff" strokeWidth={3}/>
                </div>
                {item}
              </div>
            ))}
            <button onClick={() => setTab("book")} style={{ marginTop: 12, width: "100%", background: s.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
              Book Now →
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
)}
        {/* Status tab */}
        {tab === "status" && (
          <div style={{ padding: 20 }}>
            <Label>Enter your phone number to find your bookings</Label>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)}
                placeholder="e.g. 9876543210" type="tel"
                style={{ flex: 1, padding: "10px 12px", fontSize: 14, border: "1px solid #ddd", borderRadius: 8 }} />
              <button onClick={lookupBookings} style={{
                background: navy, color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 14px", cursor: "pointer",
              }}><Search size={16}/></button>
            </div>

            {lookupLoading && <div style={{ color: "#888", fontSize: 13 }}>Searching…</div>}

            {lookupResults && lookupResults.length === 0 && (
              <div style={{ color: "#888", fontSize: 13 }}>No bookings found for this number.</div>
            )}

            {lookupResults && lookupResults.map((b) => (
              <div key={b.id} style={{ border: "1px solid #e5e2da", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{b.vehicle}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{b.package} • {new Date(b.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span style={{
                      background: statusColor[b.status] + "20",
                      color: statusColor[b.status],
                      fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4,
                    }}>{statusLabel[b.status]}</span>
                  </div>
                  {b.inspectorName && (
                    <div style={{ fontSize: 12.5, color: "#555", marginTop: 8 }}>
                      Inspector: <strong>{b.inspectorName}</strong>
                    </div>
                  )}
                </div>

                {b.report && (
                  <div style={{ borderTop: "1px solid #eee" }}>
                    <button onClick={() => setExpandedReport(expandedReport === b.id ? null : b.id)}
                      style={{ width: "100%", padding: "11px 16px", background: "#f6f4ef", border: "none",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        fontSize: 13, fontWeight: 700, color: navy, cursor: "pointer" }}>
                      View Inspection Report
                      {expandedReport === b.id ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                    </button>
                    {expandedReport === b.id && (
                      <div style={{ padding: "14px 16px" }}>
                        {b.report.recommendation && (
                          <div style={{ background: "#eef0f6", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 4 }}>RECOMMENDATION</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: navy }}>{b.report.recommendation}</div>
                          </div>
                        )}
                        {SECTIONS.map((s) => (
                          <div key={s} style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: navy, marginBottom: 6 }}>{s}</div>
                            {Object.entries(b.report.ratings || {})
                              .filter(([k]) => k.startsWith(s + "__"))
                              .map(([k, v]) => (
                                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f0eee8", fontSize: 12.5 }}>
                                  <span style={{ color: "#555" }}>{k.split("__")[1]}</span>
                                  <span style={{ fontWeight: 700, color: RATING_COLORS[v] || "#999" }}>{v}</span>
                                </div>
                              ))}
                          </div>
                        ))}
                        {b.report.notes && (
                          <div style={{ fontSize: 12.5, color: "#555", marginTop: 8 }}>
                            <strong>Notes:</strong> {b.report.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

       {selectedPkg && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
    <div style={{ background: "#fff", borderRadius: "18px 18px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: navy }}>{selectedPkg.name} Package</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1d7a4c" }}>{selectedPkg.price}</div>
        </div>
        <button onClick={() => setSelectedPkg(null)} style={{ background: "#f0eee8", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={16}/>
        </button>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>What's included</div>
      {selectedPkg.includes.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0eee8", fontSize: 13.5 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1d7a4c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Check size={12} color="#fff" strokeWidth={3}/>
          </div>
          <span style={{ color: "#333" }}>{item}</span>
        </div>
      ))}
      {selectedPkg.notIncludes.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginTop: 16, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Not included</div>
          {selectedPkg.notIncludes.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", fontSize: 13, color: "#aaa" }}>
              <X size={14} color="#ccc"/> {item}
            </div>
          ))}
        </>
      )}
      <button onClick={() => { setPkg(selectedPkg.name); setSelectedPkg(null); }}
        style={{ marginTop: 20, width: "100%", background: navy, color: "#fff", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
        Select {selectedPkg.name} — {selectedPkg.price}
      </button>
    </div>
  </div>
)}
        {/* Footer */}
        <div style={{ padding: "24px 20px 32px", textAlign: "center", background: navy, color: "#fff", marginTop: 8 }}>
          <img src={LOGO} alt="InspectMoto" style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", marginBottom: 10 }} />
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>InspectMoto</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 16 }}>Honest inspections. Real reports. Bangalore.</div>
          <button onClick={() => window.open(`https://wa.me/${WHATSAPP}`, "_blank")}
            style={{ background: "#1d7a4c", border: "none", color: "#fff", borderRadius: 8, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            💬 Chat with us on WhatsApp
          </button>
          <div style={{ fontSize: 11, opacity: 0.4, marginTop: 16 }}>© 2026 InspectMoto • Bangalore, India</div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 12.5, fontWeight: 700, color: "#555", marginBottom: 8 }}>{children}</div>;
}

function Input({ placeholder, value, onChange, type = "text" }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{
      width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #ddd",
      borderRadius: 8, marginBottom: 10, boxSizing: "border-box", fontFamily: "inherit",
    }} />
  );
}

function Btn({ children, onClick, disabled, color }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", background: disabled ? "#ccc" : color, color: "#fff",
      border: "none", borderRadius: 10, padding: "13px 0", fontSize: 15,
      fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6,
    }}>{children}</button>
  );
}

function Badge({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#eef0f6", color: "#16213e", fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6 }}>
      {icon} {text}
    </div>
  );
}

function HeroBadge({ children }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)" }}>
      {children}
    </div>
  );
}

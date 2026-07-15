import React, { useState } from "react";
import { ClipboardCheck, MessageCircle, Search, Check, ShieldCheck, Car, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { createBooking, fetchBookingsByPhone, fetchReportByBooking } from "./firebase.js";

const WHATSAPP = "919606883464"; // TODO: replace with your number
const navy = "#16213e";
const cream = "#f6f4ef";

const PACKAGES = [
  { name: "Basic", price: "₹699", desc: "30+ point inspection + PDF report" },
  { name: "Standard", price: "₹1,499", desc: "Basic + OBD scan + photos", popular: true },
  { name: "Premium", price: "₹2,199", desc: "Standard + video + negotiation notes" },
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
      window.open(`https://wa.me/919606883464/?text=${msg}`, "_blank");
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
        <div style={{ background: navy, color: "#fff", padding: "22px 20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ClipboardCheck size={26} strokeWidth={2.2} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>InspectMoto</div>
              <div style={{ fontSize: 11.5, opacity: 0.7 }}>Know before you buy</div>
            </div>
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
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <Badge icon={<ShieldCheck size={13}/>} text="Independent" />
              <Badge icon={<Car size={13}/>} text="Doorstep" />
              <Badge icon={<FileText size={13}/>} text="PDF report" />
            </div>
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

        {/* Footer */}
        <div style={{ padding: "20px", textAlign: "center", borderTop: "1px solid #eee" }}>
          <button onClick={() => window.open(`https://wa.me/${WHATSAPP}`, "_blank")}
            style={{ background: "#fff", border: `1.5px solid ${navy}`, color: navy, borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            💬 Chat with InspectMoto
          </button>
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

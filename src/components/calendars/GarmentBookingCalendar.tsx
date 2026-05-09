"use client";

import { useState } from "react";
import { AppearanceConfig } from "@/lib/types/builder";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceType = "consultation" | "first-fitting" | "final-fitting" | "alteration";

export interface GarmentService {
  id: ServiceType;
  name: string;
  duration: string;
  note: string;
}

export interface Craftsperson {
  id: string;
  initials: string;
  name: string;
  role: string;
  speciality: string;
}

export interface GarmentSlot {
  id: string;
  time: string;
  duration: string;
  note?: string;
  taken: boolean;
  craftspersonId: string;
  startTime: string;
  endTime: string;
  localStartTime: string;
}

export interface GarmentBookingCalendarProps {
  studioName?:     string;
  studioLocation?: string;
  appearance?:     AppearanceConfig;
  services?:       GarmentService[];
  craftspeople?:   Craftsperson[];
  slots?:          GarmentSlot[];
  onDateSelect:    (date: Date) => void;
  onBook:          (slot: GarmentSlot, name: string, email: string) => void;
  slotsLoading?:   boolean;
  bookingLoading?: boolean;
  labels?: Record<string, string>;
  content?: Record<string, any>;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEFAULT_SERVICES: GarmentService[] = [
  { id: "consultation",  name: "Initial consultation",     duration: "45 min",  note: "Complimentary"  },
  { id: "first-fitting", name: "First fitting",            duration: "60 min",  note: "Post deposit"   },
  { id: "final-fitting", name: "Final fitting & collection",duration: "45 min", note: "Completion"     },
  { id: "alteration",    name: "Alteration review",        duration: "30 min",  note: "Existing piece" },
];

const DEFAULT_CRAFTSPEOPLE: Craftsperson[] = [
  { id: "c1", initials: "E", name: "Elena Vance", role: "Lead Draper · 14 yrs", speciality: "Bridal · Occasion · Structured silhouettes" },
  { id: "c2", initials: "D", name: "David Cross", role: "Senior Draper · 9 yrs", speciality: "Everyday wear · Drape · Relaxed silhouettes"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["S","M","T","W","T","F","S"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number)    { return new Date(y, m, 1).getDay(); }

// ─── Main component ───────────────────────────────────────────────────────────

export default function GarmentBookingCalendar({
  studioName     = "Vélin",
  studioLocation = "London",
  appearance,
  services       = DEFAULT_SERVICES,
  craftspeople   = DEFAULT_CRAFTSPEOPLE,
  slots          = [],
  onDateSelect,
  onBook,
  slotsLoading   = false,
  bookingLoading = false,
  labels = {},
  content = {},
}: GarmentBookingCalendarProps) {
  const today = new Date();
  const [selectedService, setSelectedService] = useState<GarmentService>(services[0]);
  const [selectedDate, setSelectedDate]       = useState<Date>(today);
  const [viewMonth, setViewMonth]             = useState(today.getMonth());
  const [viewYear, setViewYear]               = useState(today.getFullYear());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [activeSlot, setActiveSlot] = useState<GarmentSlot | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDay(viewYear, viewMonth);
  const prevDays    = getDaysInMonth(viewYear, viewMonth - 1);

  const cells: { day: number; cur: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)  cells.push({ day: prevDays - i, cur: false });
  for (let d = 1; d <= daysInMonth; d++)   cells.push({ day: d, cur: true });
  while (cells.length % 7 !== 0)           cells.push({ day: cells.length - daysInMonth - firstDay + 1, cur: false });

  const goMonth = (dir: 1 | -1) => {
    let m = viewMonth + dir, y = viewYear;
    if (m > 11) { m = 0;  y++; }
    if (m < 0)  { m = 11; y--; }
    setViewMonth(m); setViewYear(y);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
    onDateSelect(newDate);
  };

  const isStudioClosed = (day: number) => { const d = new Date(viewYear, viewMonth, day); return d.getDay() === 0; };
  const hasAvailability = (day: number) => !isStudioClosed(day); 
  const isSel = (day: number) =>
    selectedDate.getDate() === day && selectedDate.getMonth() === viewMonth && selectedDate.getFullYear() === viewYear;

  const handleReserveClick = (slot: GarmentSlot) => {
    setActiveSlot(slot);
    setShowForm(true);
  };

  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSlot) {
      onBook(activeSlot, formData.name, formData.email);
    }
  };

  const border  = "var(--ct-border, #e8e0d4)";
  const muted   = "var(--ct-muted, #b8a898)";
  const textSec = "var(--ct-muted, #9a8e81)";
  const textPri = "var(--ct-text, #2a2118)";
  const bgSurface = "var(--ct-surface, #f5ede2)";
  const serif   = "var(--ct-font-heading, 'Cormorant Garamond', serif)";
  const sans    = "var(--ct-font, 'Jost', sans-serif)";
  const goldAccent = "var(--ct-accent, #c9a87c)";
  const darkColor = "var(--ct-accent-fg, #2a2118)";

  const appearanceVars = appearance ? {
    '--ct-bg': appearance.colorPalette.backgroundPrimary,
    '--ct-surface': appearance.colorPalette.backgroundSecondary,
    '--ct-text': appearance.colorPalette.textSecondary,
    '--ct-heading': appearance.colorPalette.textPrimary,
    '--ct-accent': appearance.colorPalette.accentPrimary,
    '--ct-accent-fg': appearance.colorPalette.accentSecondary,
    '--ct-border': appearance.colorPalette.borderColor,
    '--ct-font-heading': `'${appearance.typography.headingFont}', serif`,
    '--ct-font': `'${appearance.typography.bodyFont}', sans-serif`,
  } as React.CSSProperties : {};

  // Map slots to their craftsperson
  const craftspersonForSlot = (s: GarmentSlot) => craftspeople.find(c => c.id === s.craftspersonId) ?? craftspeople[0];

  return (
    <>
      <div style={{ background: 'var(--ct-bg, #fdfaf6)', borderRadius: 'var(--ct-radius, 20px)', boxShadow: 'var(--ct-shadow, none)', overflow: "hidden", fontFamily: sans, color: textPri, maxWidth: 1000, margin: "0 auto", position: "relative", ...appearanceVars }}>
        {/* ── Texture Overlay ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'var(--ct-texture)',
          pointerEvents: 'none',
          opacity: 0.25,
          zIndex: 1
        }} />

        {/* ── Header ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "22px 36px", borderBottom: `var(--ct-border-width, 1px) solid ${border}` }}>
          <div style={{ display: "flex", gap: 28 }}>
            {["Collections","Process","Journal"].map(l => (
              <span key={l} style={{ fontSize: 10, letterSpacing: 3, color: textSec, cursor: "pointer" }}>{l.toUpperCase()}</span>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 300, letterSpacing: 6 }}>{studioName.toUpperCase()}</div>
            <div style={{ fontSize: 8, letterSpacing: 6, color: muted, marginTop: 4 }}>ATELIER · {studioLocation.toUpperCase()}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 28 }}>
            {["Lookbook","Contact"].map(l => (
              <span key={l} style={{ fontSize: 10, letterSpacing: 3, color: textSec, cursor: "pointer" }}>{l.toUpperCase()}</span>
            ))}
          </div>
        </div>

        {/* ── Hero ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* Left — dark panel with woven texture */}
          <div style={{ background: textPri, padding: "52px 40px", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", overflow: "hidden", minHeight: 260 }}>
            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.12 }} viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="weave" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 10 Q5 0 10 10 Q15 20 20 10" fill="none" stroke="var(--ct-bg, #fdfaf6)" strokeWidth="0.6"/>
                </pattern>
              </defs>
              <rect width="400" height="260" fill="url(#weave)"/>
            </svg>
            <div style={{ fontSize: 8, letterSpacing: 6, color: muted, marginBottom: 20, position: "relative" }}>{labels.masthead_sub?.toUpperCase() || "BESPOKE GARMENT ATELIER"}</div>
            <div style={{ fontFamily: serif, fontSize: 54, fontWeight: 300, lineHeight: 1.1, color: "var(--ct-bg, #fdfaf6)", position: "relative" }}>
              {labels.masthead_title || "Made for you. Only ever you."}
            </div>
          </div>

          {/* Right — service selector */}
          <div style={{ padding: 40, background: bgSurface }}>
            <div style={{ fontSize: 8, letterSpacing: 5, color: muted, marginBottom: 20 }}>SELECT AN APPOINTMENT TYPE</div>
            {services.map(s => {
              const active = selectedService.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  style={{ padding: "14px 0", borderBottom: `var(--ct-border-width, 1px) solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end", cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 300, color: textPri, fontStyle: active ? "italic" : "normal" }}>{s.name}</div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: muted, marginTop: 3 }}>{s.duration.toUpperCase()} · {s.note.toUpperCase()}</div>
                  </div>
                  {active
                    ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: goldAccent, flexShrink: 0 }} />
                    : <span style={{ fontSize: 14, color: border }}>→</span>
                  }
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Stats band ── */}
        <div style={{ display: "flex", alignItems: "center", borderTop: `var(--ct-border-width, 1px) solid ${border}`, borderBottom: `var(--ct-border-width, 1px) solid ${border}` }}>
          {[["8","WEEKS AVERAGE\nLEAD TIME"],["3","FITTINGS PER\nCOMMISSION"],["2","SENIOR CRAFTSPEOPLE\nAVAILABLE"]].map(([n,l], i) => (
            <div key={i} style={{ flex: 1, padding: "14px 28px", display: "flex", alignItems: "center", gap: 12, borderRight: i < 2 ? `var(--ct-border-width, 1px) solid ${border}` : "none" }}>
              <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 300 }}>{n}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: textSec, lineHeight: 1.6, whiteSpace: "pre-line" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ── Booking ── */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr" }}>

          {/* Calendar */}
          <div style={{ padding: 36, borderRight: `var(--ct-border-width, 1px) solid ${border}` }}>
            <div style={{ fontSize: 8, letterSpacing: 5, color: muted, marginBottom: 24 }}>{labels.picker_title || "CHOOSE A DATE"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 300, fontStyle: "italic" }}>{MONTHS[viewMonth]}</div>
                <div style={{ fontSize: 9, letterSpacing: 4, color: muted }}>{viewYear}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {([-1,1] as const).map(d => (
                  <button key={d} onClick={() => goMonth(d)} style={{ width: 26, height: 26, border: `var(--ct-border-width, 1px) solid ${border}`, borderRadius: 'var(--ct-radius, 2px)', background: "transparent", color: muted, cursor: "pointer", fontSize: 11 }}>
                    {d === -1 ? "←" : "→"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 8, letterSpacing: 2, color: "#d8cfc4", padding: "6px 0" }}>{d}</div>
              ))}
              {cells.map((c, i) => {
                const av  = c.cur && hasAvailability(c.day);
                const sel = c.cur && isSel(c.day);
                return (
                  <div
                    key={i}
                    onClick={() => av && handleDateClick(c.day)}
                    style={{
                      aspectRatio: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      letterSpacing: 1,
                      borderRadius: 'var(--ct-radius, 2px)',
                      color: sel ? 'var(--ct-bg, #fdfaf6)' : av ? textPri : "#d8cfc4",
                      background: sel ? textPri : "transparent",
                      cursor: av ? "pointer" : "default",
                      transition: "all 0.15s",
                    }}
                  >
                    {c.day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slots */}
          <div style={{ padding: 36 }}>
            <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 300, fontStyle: "italic", marginBottom: 4 }}>
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            
            {slotsLoading ? (
                <div style={{ fontSize: 9, letterSpacing: 3, color: muted, padding: '20px 0' }}>{labels.status_loading || "CONSULTING THE ATELIER SCHEDULE..."}</div>
            ) : slots.length === 0 ? (
                <div style={{ fontSize: 9, letterSpacing: 3, color: muted, padding: '20px 0' }}>{labels.status_empty || "NO APPOINTMENTS AVAILABLE"}</div>
            ) : (
                slots.map(s => {
                const cp = craftspersonForSlot(s);
                return (
                    <div key={s.id} style={{ padding: "18px 0", borderBottom: `var(--ct-border-width, 1px) solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div>
                        <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 300, color: s.taken ? "#d8cfc4" : textPri }}>{s.time}</div>
                        <div style={{ fontSize: 9, letterSpacing: 3, color: muted, marginTop: 4 }}>{s.duration.toUpperCase()} · WITH {cp.name.toUpperCase()}</div>
                        {s.note && !s.taken && <div style={{ fontFamily: serif, fontSize: 13, fontStyle: "italic", color: textSec, marginTop: 6 }}>{s.note}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <button
                        disabled={s.taken || bookingLoading}
                        onClick={() => handleReserveClick(s)}
                        style={{
                            padding: "10px 22px",
                            border: `var(--ct-border-width, 1px) solid ${s.taken ? border : "var(--ct-btn-border, " + textPri + ")" }`,
                            borderRadius: 'var(--ct-radius, 2px)',
                            fontSize: 9,
                            letterSpacing: 4,
                            color: s.taken ? "#d8cfc4" : "var(--ct-btn-text, " + textPri + ")",
                            background: "var(--ct-btn-bg, transparent)",
                            cursor: (s.taken || bookingLoading) ? "default" : "pointer",
                            fontFamily: sans,
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                        }}
                        >
                        {s.taken ? (labels.taken_label || "TAKEN") : (labels.cta_button || "RESERVE")}
                        </button>
                    </div>
                    </div>
                );
                })
            )}
          </div>
        </div>

        {/* ── Booking Form Modal (Bespoke Style) ── */}
        {showForm && activeSlot && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(42,33,24,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                <div style={{ background: 'var(--ct-bg, #fdfaf6)', padding: 48, borderRadius: 'var(--ct-radius, 2px)', width: '100%', maxWidth: 500, border: `var(--ct-border-width, 1px) solid ${border}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 8, letterSpacing: 6, color: muted, marginBottom: 20 }}>APPOINTMENT COMMISSION</div>
                    <h3 style={{ fontFamily: serif, fontSize: 42, fontWeight: 300, marginBottom: 8 }}>{selectedService.name}</h3>
                    <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: textSec, marginBottom: 40 }}>
                       {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at {activeSlot.time}
                    </p>
                    
                    <form onSubmit={submitBooking} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 8, letterSpacing: 4, color: muted, marginBottom: 8 }}>CLIENT FULL NAME</label>
                            <input 
                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `var(--ct-border-width, 1px) solid ${border}`, padding: '12px 0', fontFamily: serif, fontSize: 20, color: textPri, outline: 'none' }} 
                                required 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div style={{ marginBottom: 48 }}>
                            <label style={{ display: 'block', fontSize: 8, letterSpacing: 4, color: muted, marginBottom: 8 }}>CONTACT EMAIL</label>
                            <input 
                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `var(--ct-border-width, 1px) solid ${border}`, padding: '12px 0', fontFamily: serif, fontSize: 20, color: textPri, outline: 'none' }} 
                                type="email" 
                                required 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 20 }}>
                            <button 
                                type="button" 
                                onClick={() => setShowForm(false)}
                                style={{ flex: 1, background: 'transparent', border: `var(--ct-border-width, 1px) solid ${border}`, borderRadius: 'var(--ct-radius, 2px)', color: muted, padding: 16, fontSize: 9, letterSpacing: 4, cursor: 'pointer', fontFamily: sans }}
                            >
                                DISMISS
                            </button>
                            <button 
                                type="submit" 
                                disabled={bookingLoading}
                                style={{ flex: 1, background: textPri, border: 'none', borderRadius: 'var(--ct-radius, 2px)', color: 'var(--ct-bg, #fdfaf6)', padding: 16, fontSize: 9, letterSpacing: 4, cursor: 'pointer', fontFamily: sans }}
                            >
                                {bookingLoading ? 'RESERVING...' : 'CONFIRM APPOINTMENT'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ── Footer ── */}
        <div style={{ background: textPri, padding: "20px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 300, fontStyle: "italic", color: muted }}>
            Each piece begins with a conversation.
          </div>
          <div style={{ fontSize: 8, letterSpacing: 4, color: textSec }}>
            {studioName.toUpperCase()} · {studioLocation.toUpperCase()} · {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { AppearanceConfig } from "@/lib/types/builder";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Artist {
  id: string;
  initials: string;
  name: string;
  style: string;
  yearsExp: number;
  availability: "open" | "few" | "waitlist";
  slotsThisWeek: number;
}

export interface TattooSlot {
  id: string;
  time: string;
  maxHours: number;
  taken: boolean;
  flashAvailable: boolean;
  startTime: string;
  endTime: string;
  localStartTime: string;
}

export interface TattooBookingCalendarProps {
  studioName?:    string;
  studioLocation?: string;
  depositAmount?: string;      
  appearance?: AppearanceConfig;
  artists?:       Artist[];
  slots?:         TattooSlot[];
  onDateSelect:   (date: Date) => void;
  onBook:         (slot: TattooSlot, name: string, email: string) => void;
  slotsLoading?:  boolean;
  bookingLoading?: boolean;
  labels?: Record<string, string>;
  content?: Record<string, any>;
}

// ─── Demo data (Used if none provided) ────────────────────────────────────────

const DEFAULT_ARTISTS: Artist[] = [
  { id: "a1", initials: "S", name: "Sarah Jenkins", style: "Fine line · Botanical · Minimalist", yearsExp: 5, availability: "open",     slotsThisWeek: 3 },
  { id: "a2", initials: "M", name: "Marcus Thorne",      style: "Japanese · Neo Traditional",         yearsExp: 8, availability: "few",      slotsThisWeek: 1 },
  { id: "a3", initials: "J", name: "Jordan Reed",       style: "Blackwork · Geometric · Abstract",   yearsExp: 6, availability: "waitlist", slotsThisWeek: 0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_SHORT   = ["S","M","T","W","T","F","S"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number)    { return new Date(y, m, 1).getDay(); }

const availabilityConfig = {
  open:      { label: "OPEN",     bg: "#e8f0de", color: "#3a5e1a" },
  few:       { label: "1 LEFT",   bg: "#f5e8d0", color: "#7a4e10" },
  waitlist:  { label: "WAITLIST", bg: "#e8e2da", color: "#7a6e63" },
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function TattooBookingCalendar({
  studioName    = "Ink & Ether",
  studioLocation= "Brooklyn, NY",
  depositAmount = "$150",
  appearance,
  artists       = DEFAULT_ARTISTS,
  slots         = [],
  onDateSelect,
  onBook,
  slotsLoading  = false,
  bookingLoading = false,
  labels = {},
  content = {},
}: TattooBookingCalendarProps) {
  const today = new Date();
  const [selectedArtist, setSelectedArtist] = useState<Artist>(artists[0]);
  const [selectedDate, setSelectedDate]     = useState<Date>(today);
  const [viewMonth, setViewMonth]           = useState(today.getMonth());
  const [viewYear, setViewYear]             = useState(today.getFullYear());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [activeSlot, setActiveSlot] = useState<TattooSlot | null>(null);
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

  const hasAvailability = (day: number) => true; 
  const isSel = (day: number) =>
    selectedDate.getDate() === day && selectedDate.getMonth() === viewMonth && selectedDate.getFullYear() === viewYear;
  const isStudioClosed = (day: number) => { const d = new Date(viewYear, viewMonth, day); return d.getDay() === 0 || d.getDay() === 6; };

  const handleReserveClick = (slot: TattooSlot) => {
    setActiveSlot(slot);
    setShowForm(true);
  };

  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSlot) {
      onBook(activeSlot, formData.name, formData.email);
    }
  };

  const bgPage  = "var(--ct-bg, #f7f3ee)";
  const border  = "var(--ct-border, #e2dbd0)";
  const muted   = "var(--ct-muted, #a89880)";
  const textPri = "var(--ct-text, #1a1410)";
  const surface = "var(--ct-surface, #f7f3ee)";
  const heading = "var(--ct-heading, #1a1410)";
  const goldAccent = "var(--ct-accent, #c9a87c)";
  const darkColor = "var(--ct-accent-fg, #1a1410)";

  const appearanceVars = appearance ? {
    '--ct-bg': appearance.colorPalette.backgroundPrimary,
    '--ct-surface': appearance.colorPalette.backgroundSecondary,
    '--ct-text': appearance.colorPalette.textSecondary,
    '--ct-heading': appearance.colorPalette.textPrimary,
    '--ct-accent': appearance.colorPalette.accentPrimary,
    '--ct-accent-fg': appearance.colorPalette.accentSecondary,
    '--ct-border': appearance.colorPalette.borderColor,
    '--ct-font-heading': `'${appearance.typography.headingFont}', serif`,
    '--ct-font': `'${appearance.typography.bodyFont}', monospace`,
  } as React.CSSProperties : {};

  return (
    <>
      <div style={{ background: bgPage, borderRadius: 'var(--ct-radius, 20px)', boxShadow: 'var(--ct-shadow, none)', overflow: "hidden", fontFamily: 'var(--ct-font, "DM Mono", monospace)', color: textPri, maxWidth: 1000, margin: "0 auto", position: "relative", ...appearanceVars }}>
        {/* ── Texture Overlay ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'var(--ct-texture)',
          pointerEvents: 'none',
          opacity: 0.3,
          zIndex: 1
        }} />

        {/* ── Nav ── */}
        <div style={{ background: textPri, padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: 'var(--ct-font-heading, "Playfair Display", serif)', fontSize: 22, color: bgPage }}>
            {studioName.split(" ")[0]} <span style={{ fontStyle: "italic", color: goldAccent }}>{studioName.split(" ").slice(1).join(" ")}</span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {(labels.nav_items || "ARTISTS,FLASH,AFTERCARE").split(",").map(l => (
              <span key={l} style={{ fontSize: 10, letterSpacing: 3, color: muted, cursor: "pointer" }}>{l.trim()}</span>
            ))}
            <span style={{ padding: "8px 20px", border: `var(--ct-border-width, 1px) solid ${goldAccent}`, borderRadius: 'var(--ct-radius, 2px)', fontSize: 10, letterSpacing: 3, color: goldAccent, cursor: "pointer" }}>
              {labels.cta_button || "BOOK NOW"}
            </span>
          </div>
        </div>

        {/* ── Ticker ── */}
        <div style={{ background: goldAccent, padding: "8px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
          <div style={{ display: "inline-flex", gap: 40, animation: "tick 18s linear infinite" }}>
            {Array(2).fill((labels.ticker_items || "CUSTOM WORK,·,FINE LINE,·,BOTANICAL,·,BLACKWORK,·,BY APPOINTMENT,·,DEPOSIT REQUIRED,·").split(",")).flat().map((w, i) => (
              <span key={i} style={{ fontSize: 10, letterSpacing: 5, color: darkColor }}>{w.trim()}</span>
            ))}
          </div>
        </div>

        {/* ── Masthead ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${border}` }}>
          <div style={{ padding: "48px 32px", borderRight: `1px solid ${border}`, position: "relative", overflow: "hidden" }}>
            {/* SVG texture */}
            <svg style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, width: "100%", height: "100%" }} viewBox="0 0 300 300">
              <circle cx="80"  cy="80"  r="60" fill="none" stroke={textPri} strokeWidth="0.5"/>
              <circle cx="80"  cy="80"  r="40" fill="none" stroke={textPri} strokeWidth="0.5"/>
              <line x1="20"  y1="80"  x2="140" y2="80"  stroke={textPri} strokeWidth="0.3"/>
              <line x1="80"  y1="20"  x2="80"  y2="140" stroke={textPri} strokeWidth="0.3"/>
              <path d="M220 60 C240 40 260 80 240 100 C260 120 240 160 220 140 C200 160 180 120 200 100 C180 80 200 40 220 60Z" fill="none" stroke={textPri} strokeWidth="0.4"/>
              <line x1="10"  y1="10"  x2="290" y2="290" stroke={textPri} strokeWidth="0.2"/>
            </svg>
            <div style={{ fontSize: 9, letterSpacing: 5, color: muted, marginBottom: 20, position: "relative" }}>{studioLocation.toUpperCase()} · EST. 2019</div>
            <div style={{ fontFamily: 'var(--ct-font-heading, "Playfair Display", serif)', color: heading, fontSize: 52, lineHeight: 1.08, position: "relative" }}>
              {labels.masthead_title || "Wear your story."}
            </div>
            <div style={{ width: 40, height: 1, background: goldAccent, margin: "24px 0" }} />
            <div style={{ fontSize: 11, lineHeight: 2, color: "#7a6e63", maxWidth: 300, position: "relative" }}>
              {labels.masthead_sub || "Every session begins with a conversation. We don't rush. We don't template. Every piece is drawn for you, on you."}
            </div>
          </div>

          {/* Artist picker */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: muted, padding: "24px 28px 12px" }}>CHOOSE YOUR ARTIST</div>
            {artists.map(a => {
              const isSelectedArt = selectedArtist.id === a.id;
              const avail = availabilityConfig[a.availability];
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedArtist(a)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "52px 1fr auto",
                    gap: 14,
                    alignItems: "center",
                    padding: "16px 28px",
                    borderBottom: `var(--ct-border-width, 1px) solid ${border}`,
                    cursor: "pointer",
                    background: isSelectedArt ? textPri : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--ct-radius, 2px)', display: "flex", alignItems: "center", justifyContent: "center", fontFamily: 'var(--ct-font-heading, "Playfair Display", serif)', fontSize: 18, fontStyle: "italic", background: isSelectedArt ? goldAccent : surface, color: isSelectedArt ? textPri : muted, flexShrink: 0 }}>
                    {a.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: isSelectedArt ? bgPage : textPri, letterSpacing: 1 }}>{a.name.toUpperCase()}</div>
                    <div style={{ fontSize: 10, color: muted, marginTop: 4, letterSpacing: 1 }}>{a.style.toUpperCase()}</div>
                  </div>
                  <span style={{ fontSize: 9, letterSpacing: 2, padding: "4px 10px", borderRadius: 1, background: avail.bg, color: avail.color }}>
                    {avail.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Booking area ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

          {/* Calendar */}
          <div style={{ padding: 32, borderRight: `1px solid ${border}` }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: muted, marginBottom: 24 }}>{labels.picker_title || "SELECT A DATE"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--ct-font-heading, "Playfair Display", serif)', fontSize: 26, color: textPri }}>{MONTHS_SHORT[viewMonth]}</div>
                <div style={{ fontSize: 9, letterSpacing: 3, color: muted }}>{viewYear}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {([-1,1] as const).map(d => (
                  <button key={d} onClick={() => goMonth(d)} style={{ width: 28, height: 28, border: `var(--ct-border-width, 1px) solid ${border}`, background: "transparent", fontSize: 11, color: muted, cursor: "pointer", borderRadius: 'var(--ct-radius, 1px)' }}>
                    {d === -1 ? "←" : "→"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
              {DAYS_SHORT.map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 9, letterSpacing: 2, color: "#c4bbb0", padding: "6px 0" }}>{d}</div>
              ))}
              {cells.map((c, i) => {
                const av  = c.cur && hasAvailability(c.day) && !isStudioClosed(c.day);
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
                      borderRadius: 'var(--ct-radius, 1px)',
                      cursor: av ? "pointer" : "default",
                      color: sel ? bgPage : av ? textPri : muted,
                      background: sel ? textPri : "transparent",
                      position: "relative",
                      transition: "all 0.15s",
                    }}
                  >
                    {c.day}
                    {av && !sel && <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: goldAccent }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slots */}
          <div style={{ padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 28, borderBottom: `var(--ct-border-width, 1px) solid ${border}` }}>
              <div style={{ width: 44, height: 44, background: textPri, borderRadius: 'var(--ct-radius, 0px)', display: "flex", alignItems: "center", justifyContent: "center", fontFamily: 'var(--ct-font-heading, "Playfair Display", serif)', fontSize: 16, fontStyle: "italic", color: bgPage }}>
                {selectedArtist.initials}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--ct-font-heading, "Playfair Display", serif)', fontSize: 18, color: textPri }}>{selectedArtist.name}</div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: muted, marginTop: 3 }}>{selectedArtist.style.toUpperCase()} · {selectedArtist.yearsExp} YRS</div>
              </div>
              <div style={{ marginLeft: "auto", padding: "6px 14px", background: textPri, color: goldAccent, fontSize: 9, letterSpacing: 2, borderRadius: 'var(--ct-radius, 1px)' }}>
                {depositAmount} DEPOSIT
              </div>
            </div>

            <div style={{ fontFamily: 'var(--ct-font-heading, "Playfair Display", serif)', fontSize: 20, fontStyle: "italic", color: textPri, marginBottom: 6 }}>
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            
            {slotsLoading ? (
                <div style={{ fontSize: 10, letterSpacing: 3, color: muted, padding: '20px 0' }}>{labels.status_loading || "RECALLING AVAILABILITY..."}</div>
            ) : slots.length === 0 ? (
                <div style={{ fontSize: 10, letterSpacing: 3, color: muted, padding: '20px 0' }}>{labels.status_empty || "NO SESSIONS ON THIS DATE"}</div>
            ) : (
                slots.map(s => (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: `var(--ct-border-width, 1px) solid ${border}` }}>
                    <div>
                    <div style={{ fontFamily: 'var(--ct-font-heading, "Playfair Display", serif)', fontSize: 22, color: s.taken ? muted : textPri, textDecoration: s.taken ? "line-through" : "none" }}>{s.time}</div>
                    <div style={{ fontSize: 10, color: muted, letterSpacing: 2, marginTop: 4 }}>UP TO {s.maxHours} HRS</div>
                    <div style={{ fontSize: 10, color: s.taken ? "#c4bbb0" : goldAccent, letterSpacing: 2, marginTop: 6 }}>
                        {s.taken ? "TAKEN" : s.flashAvailable ? "CUSTOM · FLASH AVAILABLE" : "CUSTOM WORK ONLY"}
                    </div>
                    </div>
                    <button
                    disabled={s.taken || bookingLoading}
                    onClick={() => handleReserveClick(s)}
                    style={{
                        padding: "10px 20px",
                        borderRadius: 'var(--ct-radius, 1px)',
                        fontSize: 10,
                        letterSpacing: 3,
                        cursor: (s.taken || bookingLoading) ? "default" : "pointer",
                        border: `var(--ct-border-width, 1px) solid ${s.taken ? border : "var(--ct-btn-border, " + textPri + ")" }`,
                        color: s.taken ? muted : "var(--ct-btn-text, " + textPri + ")",
                        background: "var(--ct-btn-bg, transparent)",
                        fontFamily: 'var(--ct-font, "DM Mono", monospace)',
                        transition: "all 0.2s",
                    }}
                    >
                     {s.taken ? (labels.taken_label || "TAKEN") : (labels.cta_button || "RESERVE")}
                    </button>
                </div>
                ))
            )}
          </div>
        </div>

        {/* ── Booking Form Modal (Parchment Style) ── */}
        {showForm && activeSlot && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,20,16,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                <div style={{ background: bgPage, padding: 40, borderRadius: 'var(--ct-radius, 2px)', width: '100%', maxWidth: 450, border: `var(--ct-border-width, 1px) solid ${border}`, position: 'relative' }}>
                    <h3 style={{ fontFamily: 'var(--ct-font-heading, "Playfair Display", serif)', fontSize: 36, marginBottom: 12 }}>RESERVATION</h3>
                    <p style={{ fontFamily: 'var(--ct-font, "DM Mono", monospace)', fontSize: 10, color: muted, marginBottom: 32, letterSpacing: 3, textTransform: 'uppercase' }}>
                       {selectedArtist.name} · {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} @ {activeSlot.time}
                    </p>
                    
                    <form onSubmit={submitBooking}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: muted, marginBottom: 8 }}>FULL NAME</label>
                            <input 
                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `var(--ct-border-width, 1px) solid ${border}`, padding: '10px 0', fontFamily: 'inherit', color: textPri, outline: 'none' }} 
                                required 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div style={{ marginBottom: 32 }}>
                            <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: muted, marginBottom: 8 }}>EMAIL ADDRESS</label>
                            <input 
                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${border}`, padding: '10px 0', fontFamily: 'inherit', color: textPri, outline: 'none' }} 
                                type="email" 
                                required 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <button 
                                type="button" 
                                onClick={() => setShowForm(false)}
                                style={{ flex: 1, background: 'transparent', border: `var(--ct-border-width, 1px) solid ${border}`, borderRadius: 'var(--ct-radius, 0px)', color: muted, padding: 14, fontSize: 10, letterSpacing: 3, cursor: 'pointer' }}
                            >
                                CANCEL
                            </button>
                            <button 
                                type="submit" 
                                disabled={bookingLoading}
                                style={{ flex: 1, background: textPri, border: 'none', borderRadius: 'var(--ct-radius, 0px)', color: bgPage, padding: 14, fontSize: 10, letterSpacing: 3, cursor: 'pointer' }}
                            >
                                {bookingLoading ? 'RESERVING...' : 'CONFIRM'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ── Footer ── */}
        <div style={{ background: darkColor, padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: "#5a4f44" }}>48 HR RESCHEDULE NOTICE · DEPOSITS NON-REFUNDABLE</div>
          <div style={{ fontSize: 10, color: goldAccent, cursor: "pointer", letterSpacing: 2 }}>VIEW FLASH SHEET →</div>
        </div>

        <style>{`@keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </div>
    </>
  );
}

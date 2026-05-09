"use client";

import { useState, useEffect } from "react";
import { AppearanceConfig } from "@/lib/types/builder";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClassType = "all" | "pilates" | "hiit" | "yoga" | "barre";

export interface FitnessSession {
  id: string;
  time: string;
  className: string;
  instructor: string;
  duration: string;
  spots: number;
  totalSpots: number;
  intensity: 1 | 2 | 3 | 4;
  intensityLabel: string;
  type: Exclude<ClassType, "all">;
  startTime: string; // ISO
  endTime: string;   // ISO
  localStartTime: string;
}

export interface FitnessBookingCalendarProps {
  studioName?: string;
  studioTagline?: string;
  location?: string;
  appearance?: AppearanceConfig;
  slots: FitnessSession[];     // Passed from parent
  onDateSelect: (date: Date) => void;
  onBook: (session: FitnessSession, name: string, email: string) => void;
  slotsLoading?: boolean;
  bookingLoading?: boolean;
  labels?: Record<string, string>;
  content?: Record<string, any>;
}

const CLASS_FILTERS: { key: ClassType; label: string; meta: string }[] = [
  { key: "all",     label: "All classes",      meta: "WEEKLY SESSIONS" },
  { key: "pilates", label: "Reformer pilates", meta: "CORE & ALIGN"  },
  { key: "hiit",    label: "HIIT & strength",  meta: "HIGH INTENSITY"  },
  { key: "yoga",    label: "Yoga flow",        meta: "MIND & BODY"     },
  { key: "barre",   label: "Barre",            meta: "SCULPT & TONE"   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS   = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function IntensityBars({ level, label, accent }: { level: number; label: string; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 6 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ width: 18, height: 3, borderRadius: 1, background: i <= level ? accent : "#1c1c1c" }} />
      ))}
      <span style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginLeft: 6 }}>{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FitnessBookingCalendar({
  studioName   = "Form Studio",
  studioTagline= "LIVE BOOKING",
  location     = "New York",
  appearance,
  slots        = [],
  onDateSelect,
  onBook,
  slotsLoading = false,
  bookingLoading = false,
  labels = {},
  content = {},
}: FitnessBookingCalendarProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [viewMonth, setViewMonth]       = useState(today.getMonth());
  const [viewYear, setViewYear]         = useState(today.getFullYear());
  const [activeFilter, setActiveFilter] = useState<ClassType>("all");
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [activeSession, setActiveSession] = useState<FitnessSession | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstDay     = getFirstDayOfMonth(viewYear, viewMonth);
  const prevDays     = getDaysInMonth(viewYear, viewMonth - 1);

  const cells: { day: number; month: "prev" | "cur" | "next" }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)  cells.push({ day: prevDays - i,          month: "prev" });
  for (let d = 1; d <= daysInMonth; d++)   cells.push({ day: d,                      month: "cur"  });
  while (cells.length % 7 !== 0)           cells.push({ day: cells.length - daysInMonth - firstDay + 1, month: "next" });

  const filteredSessions = (slots || []).filter(
    s => activeFilter === "all" || s.type === activeFilter
  );

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

  const isSelected = (day: number) =>
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;

  const hasSlots = (day: number) => true; // Ideally check a list of dates with slots

  const handleBookClick = (session: FitnessSession) => {
    setActiveSession(session);
    setShowForm(true);
  };

  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSession) {
      onBook(activeSession, formData.name, formData.email);
    }
  };

  const accentColor = appearance?.colorPalette.accentPrimary || 'var(--ct-accent, #c8f542)';
  const bgColor = appearance?.colorPalette.backgroundPrimary || 'var(--ct-bg, #0d0d0d)';

  const appearanceVars = appearance ? {
    '--ct-bg': appearance.colorPalette.backgroundPrimary,
    '--ct-surface': appearance.colorPalette.backgroundSecondary,
    '--ct-text': appearance.colorPalette.textSecondary,
    '--ct-heading': appearance.colorPalette.textPrimary,
    '--ct-accent': appearance.colorPalette.accentPrimary,
    '--ct-border': appearance.colorPalette.borderColor,
    '--ct-font-heading': `'${appearance.typography.headingFont}', sans-serif`,
    '--ct-font': `'${appearance.typography.bodyFont}', sans-serif`,
  } as React.CSSProperties : {};

  const S = {
    page: {
      background: 'var(--ct-bg, #0d0d0d)',
      borderRadius: 'var(--ct-radius, 20px)',
      boxShadow: 'var(--ct-shadow, none)',
      overflow: "hidden",
      fontFamily: 'var(--ct-font, "Space Grotesk", sans-serif)',
      color: 'var(--ct-text, #f0ede6)',
      maxWidth: 1000,
      margin: "0 auto",
      position: "relative",
    } as React.CSSProperties,
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 28px",
      borderBottom: "var(--ct-border-width, 1px) solid var(--ct-border, #1c1c1c)",
    } as React.CSSProperties,
    logo: {
      fontFamily: 'var(--ct-font-heading, "Bebas Neue", sans-serif)',
      fontSize: 26,
      letterSpacing: 3,
      color: 'var(--ct-heading, #f0ede6)',
    } as React.CSSProperties,
    input: {
        width: '100%',
        background: 'var(--ct-surface, #1a1a1a)',
        border: 'var(--ct-border-width, 1px) solid var(--ct-border, #333)',
        borderRadius: 'var(--ct-radius, 8px)',
        padding: '12px',
        color: 'var(--ct-text, #fff)',
        marginBottom: '16px',
        fontFamily: 'inherit'
    } as React.CSSProperties
  };

  return (
    <>
      <div style={{ ...S.page, ...appearanceVars }}>
        {/* ── Texture Overlay ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'var(--ct-texture)',
          pointerEvents: 'none',
          opacity: 0.4,
          zIndex: 1
        }} />

        {/* ── Top bar ── */}
        <div style={S.topBar}>
          <div style={S.logo}>{studioName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: "#444" }}>{studioTagline}</span>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor, animation: "pulse 2s infinite" }} />
          </div>
        </div>

        {/* ── Hero ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", borderBottom: "var(--ct-border-width, 1px) solid var(--ct-border, #1c1c1c)" }}>
          <div style={{ padding: "36px 28px", borderRight: "var(--ct-border-width, 1px) solid var(--ct-border, #1c1c1c)" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 16 }}>
              {location.toUpperCase()} · {labels.masthead_sub?.toUpperCase() || "BOOK YOUR NEXT SESSION"}
            </div>
            <div style={{ fontFamily: 'var(--ct-font-heading, "Bebas Neue", sans-serif)', fontSize: 72, lineHeight: 0.92, letterSpacing: 2 }}>
              {labels.masthead_title || "PUSH YOUR LIMIT."}
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 28 }}>
              {[["12","CLASSES WEEKLY"],["8","SPOTS LEFT TODAY"],["45'","AVG SESSION"]].map(([n,l]) => (
                <div key={l} style={{ borderLeft: `2px solid ${accentColor}`, paddingLeft: 12 }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Class filters ── */}
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#333", marginBottom: 4 }}>FILTER BY CLASS</div>
            {CLASS_FILTERS.map(f => {
              const active = activeFilter === f.key;
              return (
                <div
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  style={{
                    padding: "11px 14px",
                    border: "var(--ct-border-width, 1px) solid",
                    borderColor: active ? accentColor : "var(--ct-border, #1c1c1c)",
                    borderRadius: 'var(--ct-radius, 8px)',
                    cursor: "pointer",
                    background: active ? accentColor : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: active ? bgColor : "#f0ede6" }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: active ? "#3a4a00" : "#444", marginTop: 2, letterSpacing: 1 }}>{f.meta}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Body: calendar + slots ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "var(--ct-border-width, 1px) solid var(--ct-border, #1c1c1c)" }}>

          {/* Calendar */}
          <div style={{ padding: 28, borderRight: "var(--ct-border-width, 1px) solid var(--ct-border, #1c1c1c)" }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#333", marginBottom: 20 }}>{labels.picker_title || "SELECT DATE"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={() => goMonth(-1)} style={calNavBtn}>&larr;</button>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2 }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button onClick={() => goMonth(1)}  style={calNavBtn}>&rarr;</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 9, letterSpacing: 2, color: "#333", padding: "4px 0" }}>{d}</div>
              ))}
              {cells.map((c, i) => {
                const isCur = c.month === "cur";
                const sel   = isCur && isSelected(c.day);
                const hasAvail = isCur && hasSlots(c.day);
                return (
                  <div
                    key={i}
                    onClick={() => isCur && handleDateClick(c.day)}
                    style={{
                      aspectRatio: "1",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 'var(--ct-radius, 6px)',
                      cursor: isCur ? "pointer" : "default",
                      fontSize: 12,
                      color: sel ? bgColor : isCur ? "#f0ede6" : "#222",
                      background: sel ? accentColor : "transparent",
                      fontWeight: sel ? 700 : 400,
                      gap: 3,
                      transition: "all 0.15s",
                    }}
                  >
                    {c.day}
                    {hasAvail && !sel && <div style={{ width: 3, height: 3, borderRadius: "50%", background: accentColor }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slots */}
          <div style={{ padding: 28 }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#333", marginBottom: 20 }}>AVAILABLE SESSIONS</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2 }}>
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            
            {slotsLoading ? (
                <div style={{ padding: '20px 0', color: '#444' }}>{labels.status_loading || "FETCHING SESSIONS..."}</div>
            ) : filteredSessions.length === 0 ? (
                <div style={{ padding: '20px 0', color: '#444' }}>{labels.status_empty || "NO SESSIONS AVAILABLE"}</div>
            ) : (
                filteredSessions.map(s => (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "var(--ct-border-width, 1px) solid var(--ct-border, #1c1c1c)" }}>
                    <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1 }}>{s.time}</div>
                    <div style={{ fontSize: 11, color: accentColor, letterSpacing: 2, marginTop: 1 }}>{s.className.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>{s.instructor} · {s.duration} · {s.spots > 0 ? `${s.spots} spots` : "Full"}</div>
                    <IntensityBars level={s.intensity} label={s.intensityLabel} accent={accentColor} />
                    </div>
                    <button
                    disabled={s.spots === 0 || bookingLoading}
                    onClick={() => handleBookClick(s)}
                    style={{
                        padding: "9px 18px",
                        borderRadius: 'var(--ct-radius, 99px)',
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: 2,
                        cursor: (s.spots === 0 || bookingLoading) ? "default" : "pointer",
                        border: `var(--ct-border-width, 1px) solid ${s.spots === 0 ? "var(--ct-border, #222)" : "var(--ct-btn-border, " + accentColor + ")" }`,
                        color: s.spots === 0 ? "var(--ct-muted, #333)" : "var(--ct-btn-text, " + accentColor + ")",
                        background: "var(--ct-btn-bg, transparent)",
                        fontFamily: "'Space Grotesk', sans-serif",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                    }}
                    >
                    {s.spots === 0 ? (labels.full_label || "FULL") : (labels.cta_button || "BOOK")}
                    </button>
                </div>
                ))
            )}
          </div>
        </div>

        {/* ── Booking Form Modal (Simple Inline) ── */}
        {showForm && activeSession && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                <div style={{ background: 'var(--ct-surface, #0d0d0d)', padding: 32, borderRadius: 'var(--ct-radius, 16px)', width: '100%', maxWidth: 400, border: 'var(--ct-border-width, 1px) solid var(--ct-border, #1c1c1c)' }}>
                    <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, marginBottom: 8, color: 'var(--ct-heading, #fff)' }}>CONFIRM SESSION</h3>
                    <p style={{ color: accentColor, fontSize: 12, marginBottom: 24, letterSpacing: 2 }}>{activeSession.className.toUpperCase()} @ {activeSession.time}</p>
                    
                    <form onSubmit={submitBooking}>
                        <input 
                            placeholder="Full Name" 
                            style={S.input} 
                            required 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                        <input 
                            placeholder="Email Address" 
                            type="email" 
                            style={S.input} 
                            required 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button 
                                type="button" 
                                onClick={() => setShowForm(false)}
                                style={{ flex: 1, background: 'transparent', border: 'var(--ct-border-width, 1px) solid var(--ct-border, #333)', color: 'var(--ct-muted, #666)', padding: 12, borderRadius: 'var(--ct-radius, 8px)', fontSize: 12, fontWeight: 700 }}
                            >
                                CANCEL
                            </button>
                            <button 
                                type="submit" 
                                disabled={bookingLoading}
                                style={{ flex: 1, background: accentColor, border: 'none', color: 'var(--ct-accent-fg, #000)', padding: 12, borderRadius: 'var(--ct-radius, 8px)', fontSize: 12, fontWeight: 700 }}
                            >
                                {bookingLoading ? 'BOOKING...' : 'CONFIRM'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ── Footer ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", background: "var(--ct-surface, #080808)" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "var(--ct-muted, #333)" }}>24HR CANCELLATION POLICY</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["MEMBERS SAVE 20%","DROP-IN AVAILABLE"].map(t => (
              <div key={t} style={{ padding: "5px 12px", borderRadius: 'var(--ct-radius, 99px)', background: "var(--ct-bg, #1c1c1c)", fontSize: 10, color: "var(--ct-muted, #444)", letterSpacing: 1 }}>{t}</div>
            ))}
          </div>
        </div>

        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </>
  );
}

const calNavBtn: React.CSSProperties = {
  width: 32, height: 32,
  borderRadius: 'var(--ct-radius, 50%)',
  border: "var(--ct-border-width, 1px) solid var(--ct-border, #1c1c1c)",
  background: "transparent",
  color: "var(--ct-text, #444)",
  cursor: "pointer",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

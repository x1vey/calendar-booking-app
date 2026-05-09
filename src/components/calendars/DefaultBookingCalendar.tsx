'use client';

/**
 * DefaultBookingCalendar
 * ──────────────────────
 * Theme: Classic  |  previewBg: #ffffff  |  accent: #6366f1
 *
 * Clean, neutral — works for any business type.
 * Uses the callme design language already established in the existing booking page.
 */

import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import type { AvailableSlot } from '@/lib/types';

export interface DefaultSlot extends AvailableSlot {
  label?: string;
}

export interface DefaultBookingCalendarProps {
  studioName: string;
  tagline?: string;
  location?: string;
  accentColor?: string;
  slots: DefaultSlot[];
  onDateSelect: (date: Date) => void;
  onBook: (slot: DefaultSlot, bookerName: string, bookerEmail: string) => Promise<void>;
  slotsLoading?: boolean;
  bookingLoading?: boolean;
  headerPrefix?: string;
  headerSuffix?: string;
  footer?: string;
  labels?: Record<string, string>;
  content?: Record<string, any>;
}

type Step = 'date' | 'slot' | 'form';

export default function DefaultBookingCalendar({
  studioName,
  tagline,
  location,
  accentColor,
  slots,
  onDateSelect,
  onBook,
  slotsLoading = false,
  bookingLoading = false,
  headerPrefix,
  headerSuffix,
  footer,
  labels = {},
  content = {},
}: DefaultBookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DefaultSlot | null>(null);
  const [step, setStep] = useState<Step>('date');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const accent = accentColor ?? 'var(--ct-accent, #6366f1)';
  const monthStart = startOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) });

  const handleDateClick = (day: Date) => {
    if (isBefore(day, startOfDay(new Date()))) return;
    setSelectedDate(day);
    setStep('slot');
    onDateSelect(day);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !name || !email) return;
    setSubmitting(true);
    try { await onBook(selectedSlot, name, email); } finally { setSubmitting(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: 'var(--ct-border-width, 2px) solid var(--ct-border, rgba(0,0,0,0.08))',
    borderRadius: 'var(--ct-radius, 0.75rem)',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    color: 'var(--ct-text)',
    background: 'transparent',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ background: 'var(--ct-bg, #fff)', color: 'var(--ct-text, #0f172a)', minHeight: '100vh', fontFamily: "var(--ct-font, 'Inter', system-ui, sans-serif)", position: 'relative' }}>
      {/* ── Texture Overlay ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'var(--ct-texture)',
        pointerEvents: 'none',
        opacity: 0.1,
        zIndex: 0
      }} />

      {headerPrefix && <div dangerouslySetInnerHTML={{ __html: headerPrefix }} style={{ position: 'relative', zIndex: 1 }} />}

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '2rem' }}>
          {location && <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: '0.25rem' }}>{location}</p>}
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 800, color: 'var(--ct-heading, #0f172a)', margin: 0 }}>{labels.masthead_title || studioName}</h1>
          {(labels.masthead_sub || tagline) && <p style={{ color: 'var(--ct-muted, #94a3b8)', marginTop: '0.5rem', fontWeight: 500 }}>{labels.masthead_sub || tagline}</p>}
        </div>

        {headerSuffix && <div dangerouslySetInnerHTML={{ __html: headerSuffix }} style={{ position: 'relative', zIndex: 1 }} />}

        <div style={{ background: 'var(--ct-surface, #f8fafc)', borderRadius: 'var(--ct-radius, 1.5rem)', padding: '2rem', border: 'var(--ct-border-width, 1px) solid var(--ct-border, rgba(0,0,0,0.06))', boxShadow: 'var(--ct-shadow, 0 4px 24px rgba(0,0,0,0.04))', position: 'relative', zIndex: 1 }}>
          {step !== 'date' && (
            <button onClick={() => setStep(step === 'form' ? 'slot' : 'date')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent, fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0 }}>
              ← Back
            </button>
          )}

          {step === 'date' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>{format(currentMonth, 'MMMM yyyy')}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[{ label: '‹', fn: () => setCurrentMonth(subMonths(currentMonth, 1)) }, { label: '›', fn: () => setCurrentMonth(addMonths(currentMonth, 1)) }].map(b => (
                    <button key={b.label} onClick={b.fn} style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--ct-radius, 0.75rem)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ct-text)' }}>{b.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.5rem' }}>
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--ct-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.4rem 0' }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                {Array.from({ length: monthStart.getDay() }).map((_, i) => <div key={`e${i}`} />)}
                {days.map(day => {
                  const past = isBefore(day, startOfDay(new Date()));
                  const sel = selectedDate && isSameDay(day, selectedDate);
                  return (
                    <button key={day.toString()} disabled={past} onClick={() => handleDateClick(day)}
                      style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--ct-radius, 0.75rem)', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: past ? 'not-allowed' : 'pointer', opacity: past ? 0.3 : 1, background: sel ? "var(--ct-accent, " + accent + ")" : isToday(day) ? "var(--ct-accent, " + accent + ")18" : 'transparent', color: sel ? "var(--ct-accent-fg, #fff)" : 'var(--ct-text)', transition: 'background 0.15s' }}>
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 'slot' && (
            <>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>{selectedDate ? format(selectedDate, 'EEEE, MMMM d') : (labels.picker_title || 'Select a Date')}</h2>
              {slotsLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 52, borderRadius: '0.75rem', background: 'var(--ct-border)', opacity: 0.4 }} />)}
                </div>
              ) : slots.length === 0 ? (
                <p style={{ color: 'var(--ct-muted)', textAlign: 'center', padding: '2rem 0', fontWeight: 500 }}>{labels.status_empty || "No slots available for this date."}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {slots.map((slot, i) => (
                    <button key={i} onClick={() => { setSelectedSlot(slot); setStep('form'); }}
                      style={{ padding: '0.875rem 1rem', borderRadius: 'var(--ct-radius, 0.75rem)', border: 'var(--ct-border-width, 2px) solid var(--ct-border)', background: 'var(--ct-btn-bg, transparent)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ct-btn-text, var(--ct-text))', transition: 'all 0.15s' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--ct-border)'; e.currentTarget.style.color = 'var(--ct-btn-text, var(--ct-text))'; }}>
                      {format(new Date(slot.localStartTime), 'h:mm a')}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'form' && selectedSlot && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Complete Booking</h2>
              <p style={{ color: accent, fontWeight: 700, marginBottom: '1.5rem', fontSize: '0.9rem' }}>{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''} · {format(new Date(selectedSlot.localStartTime), 'h:mm a')}</p>
              {[{ label: 'Full Name', type: 'text', val: name, set: setName }, { label: 'Email', type: 'email', val: email, set: setEmail }].map(f => (
                <div key={f.label} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ct-muted)', marginBottom: '0.4rem' }}>{f.label}</label>
                  <input style={inp} type={f.type} value={f.val} onChange={e => f.set(e.target.value)} required />
                </div>
              ))}
              <button type="submit" disabled={bookingLoading || submitting}
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem', borderRadius: 'var(--ct-radius, 0.75rem)', border: 'var(--ct-border-width, 0px) solid var(--ct-btn-border, transparent)', background: 'var(--ct-btn-bg, ' + accent + ')', color: 'var(--ct-btn-text, #fff)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', opacity: (bookingLoading || submitting) ? 0.6 : 1, transition: 'opacity 0.15s' }}>
                {(bookingLoading || submitting) ? (labels.status_loading || 'Confirming…') : (labels.cta_button || 'Confirm Booking')}
              </button>
            </form>
          )}
        </div>
      </div>

      {footer ? <div dangerouslySetInnerHTML={{ __html: footer }} style={{ position: 'relative', zIndex: 1 }} /> : (
        <p style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ct-muted)', padding: '1.5rem', position: 'relative', zIndex: 1 }}>
          Powered by <strong style={{ color: 'var(--ct-heading)' }}>callme</strong>
        </p>
      )}
    </div>
  );
}

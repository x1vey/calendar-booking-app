'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { THEMES, type CalendarTheme } from '@/lib/themes';

const THEME_KEYS = Object.keys(THEMES) as CalendarTheme[];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
      background: 'var(--ink)', color: 'var(--paper)',
      padding: '12px 20px',
      border: '1.4px solid var(--ink)',
      borderRadius: '999px',
      boxShadow: '6px 8px 0 -1px var(--paper-2), 6px 8px 0 0 var(--line-soft)',
      fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '13px',
      display: 'flex', alignItems: 'center', gap: '8px',
      animation: 'cm-slide-up 250ms cubic-bezier(0.4,0,0.2,1)',
    }}>
      <span style={{ color: 'var(--accent)', fontFamily: 'var(--f-hand)', fontSize: 18, lineHeight: 0 }}>✓</span>
      {message}
    </div>
  );
}

// ─── Theme card ───────────────────────────────────────────────────────────────
function ThemeCard({
  themeKey,
  isSelected,
  isActive,
  onClick,
}: {
  themeKey: CalendarTheme;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const theme = THEMES[themeKey];
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        border: isSelected ? '1.6px solid var(--ink)' : '1.4px solid var(--line-soft)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--card)',
        transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
        transform: hovered && !isSelected ? 'translateY(-2px)' : 'none',
        boxShadow: isSelected
          ? '6px 8px 0 -1px var(--paper-2), 6px 8px 0 0 var(--line-soft)'
          : hovered
          ? '3px 4px 0 var(--paper-2)'
          : 'none',
        textAlign: 'left',
        padding: 0,
        fontFamily: 'var(--f-body)',
      }}>

      {/* swatch */}
      <div style={{ height: 96, background: theme.previewBg, position: 'relative', flexShrink: 0, borderBottom: '1.4px solid var(--line-soft)' }}>
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          width: 26, height: 26, borderRadius: '50%',
          background: theme.accent,
          border: '1.4px solid var(--ink)',
        }} />
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            top: 18 + i * 16, left: 16,
            height: 5, width: `${42 - i * 8}%`,
            borderRadius: 3,
            background: i === 0 ? theme.accent : 'rgba(43,39,34,0.18)',
          }} />
        ))}
      </div>

      {/* text */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--f-hand)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>
            {theme.label}
          </span>
          {isActive && (
            <span className="cm-pill accent" style={{ fontSize: 9, padding: '2px 8px' }}>
              ACTIVE
            </span>
          )}
        </div>
        <p style={{
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--ink-3)', margin: '4px 0 0', lineHeight: 1.5,
        }}>
          {theme.description}
        </p>
      </div>

      {/* checkmark */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 26, height: 26, borderRadius: '50%',
          background: 'var(--ink)',
          border: '1.4px solid var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--paper)" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ThemesPage() {
  const [currentTheme, setCurrentTheme]   = useState<CalendarTheme>('default');
  const [selectedTheme, setSelectedTheme] = useState<CalendarTheme>('default');
  const [slug, setSlug]                   = useState<string>('');
  const [loading, setLoading]             = useState(true);
  const [applying, setApplying]           = useState(false);
  const [toast, setToast]                 = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/business/me')
      .catch(() => null)
      .then(async res => {
        if (!res?.ok) return;
        const data = await res.json();
        const theme = (data.calendar_theme ?? 'default') as CalendarTheme;
        setCurrentTheme(theme);
        setSelectedTheme(theme);
        setSlug(data.slug ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  const applyTheme = async () => {
    setApplying(true);
    try {
      const res = await fetch('/api/business/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendar_theme: selectedTheme }),
      });
      if (!res.ok) throw new Error('Failed');
      setCurrentTheme(selectedTheme);
      setToast(`Your booking link now uses the "${THEMES[selectedTheme].label}" theme.`);
    } catch {
      setToast('Something went wrong. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const dismissToast = useCallback(() => setToast(null), []);
  const hasChanges = selectedTheme !== currentTheme;

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            height: 200, borderRadius: 14,
            background: 'var(--paper-2)',
            border: '1.4px dashed var(--line-soft)',
            animation: 'cm-pulse 1.6s ease-in-out infinite',
          }} />
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes cm-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
      `}</style>

      {/* Header */}
      <header className="cm-head">
        <div>
          <h1 className="cm-h1">Calendar <em>theme</em></h1>
          <div className="cm-cap">CHOOSE HOW YOUR PUBLIC BOOKING PAGE LOOKS</div>
        </div>
      </header>

      {/* Theme grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 18,
        marginBottom: 28,
      }}>
        {THEME_KEYS.map(key => (
          <ThemeCard
            key={key}
            themeKey={key}
            isSelected={selectedTheme === key}
            isActive={currentTheme === key}
            onClick={() => setSelectedTheme(key)}
          />
        ))}
      </div>

      {/* Action bar */}
      <div className="cm-card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button
          onClick={applyTheme}
          disabled={!hasChanges || applying}
          className="cm-btn"
          style={{
            opacity: hasChanges && !applying ? 1 : 0.45,
            cursor: hasChanges && !applying ? 'pointer' : 'not-allowed',
          }}
        >
          {applying ? 'Applying…' : hasChanges ? `Apply "${THEMES[selectedTheme].label}"` : 'No changes'}
        </button>

        {slug && (
          <a
            href={`/book/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cm-pill"
            style={{ padding: '8px 14px', fontSize: 12 }}
          >
            Preview your link
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}

        {hasChanges && (
          <p className="cm-cap" style={{ margin: 0, marginTop: 0 }}>
            Switching from <b>{THEMES[currentTheme].label}</b> → <b>{THEMES[selectedTheme].label}</b>
          </p>
        )}
      </div>

      {/* Advanced info */}
      <div className="cm-card" style={{ marginTop: 18, background: 'var(--highlight)' }}>
        <h3 className="cm-h3" style={{ fontSize: 18, marginBottom: 6 }}>
          Advanced — custom CSS & HTML
        </h3>
        <p className="cm-cap" style={{ marginTop: 0, lineHeight: 1.6, letterSpacing: 0.06, fontSize: 11 }}>
          Each theme exposes <code>--ct-*</code> CSS custom properties you can override in your calendar&apos;s
          <b> Calendar Layout</b> JSON (<code>calendar_layout</code> field).
          You can also inject arbitrary HTML into <code>headerPrefix</code>, <code>headerSuffix</code>, and <code>footer</code> slots —
          perfect for custom logos or banners.
        </p>
      </div>

      {toast && <Toast message={toast} onClose={dismissToast} />}
    </>
  );
}

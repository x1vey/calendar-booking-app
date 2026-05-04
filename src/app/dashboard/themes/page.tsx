'use client';

/**
 * app/dashboard/themes/page.tsx
 * ──────────────────────────────
 * Theme picker for logged-in business owners.
 *
 * Features:
 *  • 2×2 grid of theme cards (color swatch + label + description)
 *  • Highlight currently-active theme
 *  • PATCH /api/business/me on apply
 *  • Success toast
 *  • "Preview your link →" button
 *
 * Data is fetched client-side for simplicity (matches existing dashboard patterns).
 */

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
      background: '#0f172a', color: '#fff',
      padding: '0.875rem 1.5rem',
      borderRadius: '1rem',
      boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
      fontWeight: 600, fontSize: '0.875rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      animation: 'slideUp 0.3s ease',
    }}>
      <span style={{ color: '#4ade80', fontSize: '1.1rem' }}>✓</span>
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
        border: isSelected
          ? '2px solid #6366f1'
          : '2px solid #e2e8f0',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#fff',
        transition: 'all 0.2s',
        transform: hovered && !isSelected ? 'translateY(-2px)' : 'none',
        boxShadow: isSelected
          ? '0 0 0 4px rgba(99,102,241,0.15), 0 8px 24px rgba(99,102,241,0.1)'
          : hovered
          ? '0 8px 24px rgba(0,0,0,0.08)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        textAlign: 'left',
      }}>

      {/* ── Colour swatch ─────────────────────────────────────────────────── */}
      <div style={{ height: 100, background: theme.previewBg, position: 'relative', flexShrink: 0 }}>
        {/* Accent dot */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          width: 24, height: 24, borderRadius: '50%',
          background: theme.accent,
          boxShadow: `0 0 0 3px ${theme.previewBg}, 0 0 0 5px ${theme.accent}40`,
        }} />
        {/* Mini calendar lines */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            top: 20 + i * 18, left: 16,
            height: 6, width: `${40 - i * 8}%`,
            borderRadius: 3,
            background: i === 0 ? theme.accent : `rgba(128,128,128,0.25)`,
            opacity: 0.7,
          }} />
        ))}
      </div>

      {/* ── Text content ──────────────────────────────────────────────────── */}
      <div style={{ padding: '1.25rem 1.25rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.975rem', color: '#0f172a' }}>
            {theme.label}
          </span>
          {isActive && (
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', background: '#6366f1', color: '#fff',
              padding: '0.2rem 0.5rem', borderRadius: '0.5rem',
            }}>
              Active
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          {theme.description}
        </p>
      </div>

      {/* ── Selected checkmark ────────────────────────────────────────────── */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 26, height: 26, borderRadius: '50%',
          background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
export default function ThemesPage() {
  const [currentTheme, setCurrentTheme]   = useState<CalendarTheme>('default');
  const [selectedTheme, setSelectedTheme] = useState<CalendarTheme>('default');
  const [slug, setSlug]                   = useState<string>('');
  const [loading, setLoading]             = useState(true);
  const [applying, setApplying]           = useState(false);
  const [toast, setToast]                 = useState<string | null>(null);

  // ── Fetch current business settings ───────────────────────────────────────
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

  // ── Apply theme ───────────────────────────────────────────────────────────
  const applyTheme = async () => {
    setApplying(true);
    try {
      const res = await fetch('/api/business/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendar_theme: selectedTheme }),
      });
      if (!res.ok) throw new Error('Failed to update theme');
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: 180, borderRadius: '1.25rem', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
          Calendar Theme
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.925rem' }}>
          Choose how your public booking page looks for clients.
        </p>
      </div>

      {/* ── Theme grid ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
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

      {/* ── Action bar ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        padding: '1.25rem 1.5rem',
        background: '#f8fafc',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0',
      }}>
        <button
          onClick={applyTheme}
          disabled={!hasChanges || applying}
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: '0.75rem', border: 'none',
            background: hasChanges ? '#6366f1' : '#e2e8f0',
            color: hasChanges ? '#fff' : '#94a3b8',
            fontWeight: 700, fontSize: '0.9rem',
            cursor: hasChanges && !applying ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}>
          {applying ? 'Applying…' : hasChanges ? `Apply "${THEMES[selectedTheme].label}"` : 'No changes'}
        </button>

        {slug && (
          <a
            href={`/book/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: '1.5px solid #e2e8f0',
              color: '#6366f1', fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              transition: 'border-color 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = '#6366f1')}
            onMouseOut={e => (e.currentTarget.style.borderColor = '#e2e8f0')}>
            Preview your link
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}

        {hasChanges && (
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Switching from <strong>{THEMES[currentTheme].label}</strong> → <strong>{THEMES[selectedTheme].label}</strong>
          </p>
        )}
      </div>

      {/* ── CSS override info panel ───────────────────────────────────────── */}
      <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
          🎨 Advanced: Custom CSS & HTML
        </h3>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>
          Each theme exposes <code style={{ background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>--ct-*</code> CSS custom properties you can override in your calendar&apos;s
          {' '}<strong>Calendar Layout</strong> JSON (<code style={{ background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>calendar_layout</code> field).
          You can also inject arbitrary HTML into <code>headerPrefix</code>, <code>headerSuffix</code>, and <code>footer</code> slots — perfect for custom logos or banners.
        </p>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast} onClose={dismissToast} />}
    </>
  );
}

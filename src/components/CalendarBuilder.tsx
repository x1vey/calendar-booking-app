'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Calendar } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { THEMES, getTheme, buildThemeCSS, type CalendarTheme, type ThemeStyles } from '@/lib/themes';
import './calendar-builder.css';

// ─── Map component name → dynamic import ─────────────────────────────────────
function useCalendarComponent(componentName: string) {
  switch (componentName) {
    case 'FitnessBookingCalendar':
      return dynamic(() => import('@/components/calendars/FitnessBookingCalendar'), { ssr: false });
    case 'TattooBookingCalendar':
      return dynamic(() => import('@/components/calendars/TattooBookingCalendar'), { ssr: false });
    case 'GarmentBookingCalendar':
      return dynamic(() => import('@/components/calendars/GarmentBookingCalendar'), { ssr: false });
    default:
      return dynamic(() => import('@/components/calendars/DefaultBookingCalendar'), { ssr: false });
  }
}

export default function CalendarBuilder({
  calendar,
  onUpdate,
}: {
  calendar: Calendar;
  onUpdate: (c: Calendar) => void;
}) {
  const [saving, setSaving] = useState(false);
  
  // Configuration state
  const [themeKey, setThemeKey] = useState<CalendarTheme>((calendar.calendar_theme as CalendarTheme) || 'default');
  const [styles, setStyles] = useState<ThemeStyles>(() => {
    if (calendar.calendar_layout) {
      try {
        const parsed = JSON.parse(calendar.calendar_layout);
        return parsed.styles || {};
      } catch (e) { }
    }
    return {};
  });

  const [htmlOverrides, setHtmlOverrides] = useState(() => {
    if (calendar.calendar_layout) {
      try {
        const parsed = JSON.parse(calendar.calendar_layout);
        return parsed.htmlOverrides || {};
      } catch (e) { }
    }
    return {};
  });

  const [labels, setLabels] = useState<Record<string, string>>(() => {
    if (calendar.calendar_layout) {
      try {
        const parsed = JSON.parse(calendar.calendar_layout);
        return parsed.labels || {};
      } catch (e) { }
    }
    return {};
  });

  // Resolve current theme metadata
  const theme = getTheme(themeKey);
  const CalendarComponent: any = useMemo(() => useCalendarComponent(theme.component), [theme.component]);

  // Build real-time CSS
  const themeCSS = useMemo(() => {
    let css = buildThemeCSS(themeKey, styles);
    
    // Inject dynamic Google Font imports if specified
    const fonts = [];
    if (styles.headingFont) fonts.push(styles.headingFont.replace(/\s+/g, '+'));
    if (styles.bodyFont) fonts.push(styles.bodyFont.replace(/\s+/g, '+'));
    
    if (fonts.length > 0) {
      const importUrl = `@import url('https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}:ital,wght@0,100..900;1,100..900&display=swap');`;
      css = importUrl + "\n" + css;
      
      // Override the variables
      if (styles.headingFont) css += `\n:root { --ct-font-heading: '${styles.headingFont}', serif; }`;
      if (styles.bodyFont) css += `\n:root { --ct-font: '${styles.bodyFont}', sans-serif; }`;
    }
    
    return css;
  }, [themeKey, styles]);

  const updateStyle = (key: any, value: any) => {
    setStyles((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateHtml = (key: string, value: string) => {
    setHtmlOverrides(prev => ({ ...prev, [key]: value }));
  };

  const updateLabel = (key: string, value: string) => {
    setLabels(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const config = { styles, htmlOverrides, labels };
    try {
      const res = await fetch(`/api/admin/calendars/${calendar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendar_theme: themeKey,
          calendar_layout: JSON.stringify(config),
          accent_color: styles.accentColor || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      onUpdate({ 
        ...calendar, 
        calendar_theme: themeKey, 
        calendar_layout: JSON.stringify(config),
        accent_color: styles.accentColor || null 
      } as any);
      alert('Calendar aesthetic saved!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cb-root">
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      
      <div className="cb-container">
        {/* Settings Panel */}
        <div className="cb-sidebar">
          <Card className="cb-card">
            <div className="cb-header">
              <h3 className="cb-title">Aesthetic Builder</h3>
              <p className="cb-description">Select a professional theme base and customize every detail to match your brand.</p>
            </div>

            <div className="cb-section">
              <label className="cb-label">Base Aesthetic</label>
              <div className="cb-theme-grid">
                {(Object.keys(THEMES) as CalendarTheme[]).map(key => (
                  <button
                    key={key}
                    onClick={() => setThemeKey(key)}
                    className={`cb-theme-btn ${themeKey === key ? 'active' : ''}`}
                    style={{ backgroundColor: THEMES[key].previewBg }}
                  >
                    <div className="cb-theme-btn-check">
                      {themeKey === key && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <span className="cb-theme-btn-label">{THEMES[key].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cb-divider" />

            <div className="cb-section">
              <h4 className="cb-section-title">Color Palette</h4>
              <div className="cb-color-grid">
                <ColorInput label="Accent" value={styles.accentColor || theme.accent} onChange={v => updateStyle('accentColor', v)} />
                <ColorInput label="Background" value={styles.bgColor || ''} placeholder="Theme Default" onChange={v => updateStyle('bgColor', v)} />
                <ColorInput label="Surface" value={styles.surfaceColor || ''} placeholder="Theme Default" onChange={v => updateStyle('surfaceColor', v)} />
                <ColorInput label="Text" value={styles.textColor || ''} placeholder="Theme Default" onChange={v => updateStyle('textColor', v)} />
                <ColorInput label="Heading" value={styles.headingColor || ''} placeholder="Theme Default" onChange={v => updateStyle('headingColor', v)} />
                <ColorInput label="Border" value={styles.borderColor || ''} placeholder="Theme Default" onChange={v => updateStyle('borderColor', v)} />
              </div>
            </div>

            <div className="cb-section">
              <label className="cb-label">Typography</label>
              <div className="cb-font-row">
                {(['sans', 'serif', 'mono'] as const).map(f => (
                  <button key={f} onClick={() => updateStyle('fontStack', f)} className={`cb-font-btn ${styles.fontStack === f || (!styles.fontStack && theme.fontStack === f) ? 'active' : ''} font-${f}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="cb-input-group" style={{ marginTop: 12 }}>
                <label className="cb-label-tiny">Theme Heading Font (Google Font Name)</label>
                <input 
                  className="cb-input" 
                  value={styles.headingFont || ''} 
                  placeholder="e.g. Playfair Display" 
                  onChange={e => updateStyle('headingFont' as any, e.target.value)} 
                />
              </div>
              <div className="cb-input-group" style={{ marginTop: 8 }}>
                <label className="cb-label-tiny">Theme Body Font (Google Font Name)</label>
                <input 
                  className="cb-input" 
                  value={styles.bodyFont || ''} 
                  placeholder="e.g. Inter" 
                  onChange={e => updateStyle('bodyFont' as any, e.target.value)} 
                />
              </div>
            </div>

            <div className="cb-section" style={{ marginTop: 16 }}>
              <label className="cb-label">Animation Style</label>
              <div className="cb-font-row">
                {(['fade', 'slide', 'pop', 'none'] as const).map(a => (
                  <button key={a} onClick={() => updateStyle('animationStyle', a)} className={`cb-font-btn ${styles.animationStyle === a ? 'active' : ''}`}>
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="cb-divider" />

            <div className="cb-section">
              <h4 className="cb-section-title">Shapes & Elements</h4>
              
              <label className="cb-label-tiny" style={{ marginTop: 12, display: 'block' }}>Border Radius</label>
              <div className="cb-font-row">
                {(['none', 'sm', 'md', 'lg', 'full'] as const).map(r => (
                  <button key={r} onClick={() => updateStyle('borderRadius', r)} className={`cb-font-btn ${styles.borderRadius === r ? 'active' : ''}`}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>

              <label className="cb-label-tiny" style={{ marginTop: 12, display: 'block' }}>Border Width</label>
              <div className="cb-font-row">
                {(['none', 'thin', 'medium', 'thick'] as const).map(w => (
                  <button key={w} onClick={() => updateStyle('borderWidth', w)} className={`cb-font-btn ${styles.borderWidth === w ? 'active' : ''}`}>
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </button>
                ))}
              </div>

              <label className="cb-label-tiny" style={{ marginTop: 12, display: 'block' }}>Shadow Style</label>
              <div className="cb-font-row">
                {(['none', 'soft', 'strong'] as const).map(s => (
                  <button key={s} onClick={() => updateStyle('shadowStyle', s)} className={`cb-font-btn ${styles.shadowStyle === s ? 'active' : ''}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              <label className="cb-label-tiny" style={{ marginTop: 12, display: 'block' }}>Button Shape</label>
              <div className="cb-font-row">
                {(['solid', 'outline', 'ghost'] as const).map(s => (
                  <button key={s} onClick={() => updateStyle('buttonShape', s)} className={`cb-font-btn ${styles.buttonShape === s ? 'active' : ''}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              <label className="cb-label-tiny" style={{ marginTop: 12, display: 'block' }}>Overlay Texture</label>
              <div className="cb-font-row">
                {(['none', 'noise', 'weave', 'dots', 'svg'] as const).map(t => (
                  <button key={t} onClick={() => updateStyle('texture', t)} className={`cb-font-btn ${styles.texture === t ? 'active' : ''}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="cb-divider" />

            <div className="cb-divider" />

            <div className="cb-section">
              <h4 className="cb-section-title">UI Labels & Text</h4>
              <p className="cb-description-tiny">Customize the specific wording used throughout the calendar.</p>
              
              <div className="cb-input-group">
                <label className="cb-label-tiny">Masthead Title</label>
                <input className="cb-input" value={labels.masthead_title ?? theme.labels.masthead_title} onChange={e => updateLabel('masthead_title', e.target.value)} />
              </div>
              
              <div className="cb-input-group">
                <label className="cb-label-tiny">Masthead Subline</label>
                <textarea className="cb-textarea" value={labels.masthead_sub ?? theme.labels.masthead_sub} onChange={e => updateLabel('masthead_sub', e.target.value)} />
              </div>

              <div className="cb-input-group">
                <label className="cb-label-tiny">Picker Title</label>
                <input className="cb-input" value={labels.picker_title ?? theme.labels.picker_title} onChange={e => updateLabel('picker_title', e.target.value)} />
              </div>

              <div className="cb-input-group">
                <label className="cb-label-tiny">CTA Button Text</label>
                <input className="cb-input" value={labels.cta_button ?? theme.labels.cta_button} onChange={e => updateLabel('cta_button', e.target.value)} />
              </div>

              {themeKey === 'tattoo' && (
                <>
                  <div className="cb-input-group">
                    <label className="cb-label-tiny">Nav Items (Comma separated)</label>
                    <input className="cb-input" value={labels.nav_items ?? theme.labels.nav_items} onChange={e => updateLabel('nav_items', e.target.value)} />
                  </div>
                  <div className="cb-input-group">
                    <label className="cb-label-tiny">Ticker Items (Comma separated)</label>
                    <textarea className="cb-textarea" value={labels.ticker_items ?? theme.labels.ticker_items} onChange={e => updateLabel('ticker_items', e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <div className="cb-divider" />

            <div className="cb-section">
              <h4 className="cb-section-title">HTML Overrides</h4>
              <p className="cb-description-tiny">Inject custom HTML into specific parts of the calendar wrapper.</p>
              <div className="cb-input-group">
                <label className="cb-label-tiny">Header Prefix (Logos/Banners)</label>
                <textarea className="cb-textarea" value={htmlOverrides.headerPrefix || ''} onChange={e => updateHtml('headerPrefix', e.target.value)} placeholder="e.g. <img src='...' />" />
              </div>
              <div className="cb-input-group">
                <label className="cb-label-tiny">Footer (Legal/Links)</label>
                <textarea className="cb-textarea" value={htmlOverrides.footer || ''} onChange={e => updateHtml('footer', e.target.value)} placeholder="e.g. <p>Powered by...</p>" />
              </div>
            </div>

            <div className="cb-divider" />

            <div className="cb-section">
              <h4 className="cb-section-title">Embed Anywhere</h4>
              <p className="cb-description-tiny">Use this code to add your booking calendar to any website or funnel builder.</p>
              <div className="cb-embed-box">
                <code className="cb-code">
                  {`<iframe src="${window?.location.origin}/book/${calendar.slug}?embed=true" width="100%" height="700px" frameborder="0"></iframe>`}
                </code>
                <Button variant="ghost" size="sm" className="cb-copy-btn" onClick={() => {
                  navigator.clipboard.writeText(`<iframe src="${window?.location.origin}/book/${calendar.slug}?embed=true" width="100%" height="700px" frameborder="0"></iframe>`);
                  alert('Embed code copied!');
                }}>
                  Copy Code
                </Button>
              </div>
            </div>

            <div className="cb-footer">
              <Button onClick={handleSave} disabled={saving} className="cb-save-btn">
                {saving ? 'Publishing...' : 'Save Aesthetic'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="cb-preview">
          <div className="cb-preview-header">
            <div className="cb-preview-tag">Live Preview</div>
            <div className="cb-preview-hint">This is exactly what your customers will see</div>
          </div>
          <div className="cb-preview-window">
             <CalendarComponent
                studioName={calendar.name || 'Your Studio'}
                tagline={calendar.subheading_text || 'Select a time for our session'}
                location={calendar.description || 'Virtual / In-person'}
                 accentColor={styles.accentColor || theme.accent}
                 slots={[]}
                 onDateSelect={() => {}}
                 onBook={async () => {}}
                 headerPrefix={htmlOverrides.headerPrefix}
                 headerSuffix={htmlOverrides.headerSuffix}
                 footer={htmlOverrides.footer}
                 labels={{ ...theme.labels, ...labels }}
                 content={theme.content}
              />
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="cb-color-input-group">
      <label className="cb-color-label">{label}</label>
      <div className="cb-color-row">
        <div className="cb-color-swatch-wrapper">
          <input type="color" value={value.startsWith('#') ? value : '#ffffff'} onChange={e => onChange(e.target.value)} className="cb-color-swatch" />
        </div>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="cb-color-text" />
      </div>
    </div>
  );
}

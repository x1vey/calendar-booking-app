'use client';

import React, { useState, useRef, useCallback } from 'react';
import { SectionBlock, PageLayout, DragState, SectionType } from './types';
import { SECTION_CATALOG, createSection, getDefaultLayout } from './catalog';
import SectionEditor from './SectionEditor';
import SectionPreview from './SectionPreview';
import { Calendar } from '@/lib/types';
import './landing-builder.css';

// ─── Main Builder Component ───

export default function LandingPageBuilder({
  calendar,
  onUpdate,
}: {
  calendar: Calendar;
  onUpdate: (c: Calendar) => void;
}) {
  // Load initial layout from calendar or use defaults
  const [layout, setLayout] = useState<PageLayout>(() => {
    if ((calendar as any).landing_layout) {
      try {
        return JSON.parse((calendar as any).landing_layout);
      } catch { }
    }
    return getDefaultLayout();
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'edit'>('split');
  const [saving, setSaving] = useState(false);
  const [dragState, setDragState] = useState<DragState>({ draggedId: null, overId: null, source: 'canvas' });

  // Refs for DnD
  const dragCounter = useRef(0);

  const selectedBlock = layout.sections.find(s => s.id === selectedId) || null;

  // ─── Section Ops ───
  const updateSection = useCallback((updated: SectionBlock) => {
    setLayout(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === updated.id ? updated : s)),
    }));
  }, []);

  const removeSection = useCallback((id: string) => {
    setLayout(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const duplicateSection = useCallback((id: string) => {
    setLayout(prev => {
      const idx = prev.sections.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      const original = prev.sections[idx];
      const clone: SectionBlock = {
        ...JSON.parse(JSON.stringify(original)),
        id: crypto.randomUUID?.() || Date.now().toString(36),
        label: original.label + ' (copy)',
      };
      const next = [...prev.sections];
      next.splice(idx + 1, 0, clone);
      return { ...prev, sections: next };
    });
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setLayout(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === id ? { ...s, visible: !s.visible } : s)),
    }));
  }, []);

  const moveSection = useCallback((fromIdx: number, toIdx: number) => {
    setLayout(prev => {
      const next = [...prev.sections];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return { ...prev, sections: next };
    });
  }, []);

  const addSectionFromPalette = useCallback((type: SectionType, insertAtIdx?: number) => {
    const section = createSection(type);
    setLayout(prev => {
      const next = [...prev.sections];
      if (insertAtIdx !== undefined) {
        next.splice(insertAtIdx, 0, section);
      } else {
        next.push(section);
      }
      return { ...prev, sections: next };
    });
    setSelectedId(section.id);
  }, []);

  // ─── Canvas DnD Handlers ───
  const handleDragStart = useCallback((e: React.DragEvent, id: string, source: 'canvas' | 'palette') => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDragState({ draggedId: id, overId: null, source });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, overId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState(prev => ({ ...prev, overId }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    const { draggedId, source } = dragState;

    if (source === 'palette' && draggedId) {
      // Dragging from palette — create new section
      addSectionFromPalette(draggedId as SectionType, targetIdx);
    } else if (source === 'canvas' && draggedId) {
      const fromIdx = layout.sections.findIndex(s => s.id === draggedId);
      if (fromIdx !== -1 && fromIdx !== targetIdx) {
        moveSection(fromIdx, targetIdx);
      }
    }
    setDragState({ draggedId: null, overId: null, source: 'canvas' });
  }, [dragState, layout.sections, addSectionFromPalette, moveSection]);

  const handleDragEnd = useCallback(() => {
    setDragState({ draggedId: null, overId: null, source: 'canvas' });
  }, []);

  // ─── Global Styles ───
  const updateGlobal = (key: string, value: string) => {
    setLayout(prev => ({ ...prev, globalStyles: { ...prev.globalStyles, [key]: value } }));
  };

  // ─── Save ───
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/calendars/${calendar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landing_layout: JSON.stringify(layout),
          landing_page_enabled: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }
      onUpdate({ ...calendar, landing_layout: JSON.stringify(layout) } as any);
      alert('Landing page saved!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───
  return (
    <div className="lpb-root">
      {/* ── Toolbar ── */}
      <div className="lpb-toolbar">
        <div className="lpb-toolbar-left">
          <div className="lpb-toolbar-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            <span>Landing Page Builder</span>
          </div>
          <div className="lpb-section-count">{layout.sections.length} sections</div>
        </div>
        <div className="lpb-toolbar-center">
          {(['edit', 'split', 'preview'] as const).map(mode => (
            <button key={mode} className={`lpb-view-btn ${viewMode === mode ? 'active' : ''}`} onClick={() => setViewMode(mode)}>
              {mode === 'edit' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
              {mode === 'split' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /></svg>}
              {mode === 'preview' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
              <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
            </button>
          ))}
        </div>
        <div className="lpb-toolbar-right">
          <button className="lpb-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <svg className="lpb-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                Saving...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                Save Page
              </>
            )}
          </button>
        </div>
      </div>

      <div className={`lpb-workspace lpb-mode-${viewMode}`}>
        {/* ── Left Panel: Section List + Editor ── */}
        {viewMode !== 'preview' && (
          <div className="lpb-panel-left">
            {/* Section Palette */}
            <div className="lpb-palette">
              <div className="lpb-palette-header">
                <h3>Add Section</h3>
                <span className="lpb-palette-hint">Drag onto canvas or click to add</span>
              </div>
              <div className="lpb-palette-grid">
                {SECTION_CATALOG.map(cat => (
                  <button
                    key={cat.type}
                    className="lpb-palette-item"
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.effectAllowed = 'copy';
                      e.dataTransfer.setData('text/plain', cat.type);
                      setDragState({ draggedId: cat.type, overId: null, source: 'palette' });
                    }}
                    onDragEnd={handleDragEnd}
                    onClick={() => addSectionFromPalette(cat.type)}
                    title={cat.description}
                  >
                    <svg className="lpb-palette-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={cat.icon} /></svg>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas: reorderable section list */}
            <div className="lpb-canvas-list">
              <div className="lpb-canvas-header">
                <h3>Page Sections</h3>
              </div>
              {layout.sections.length === 0 && (
                <div className="lpb-canvas-empty"
                  onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                  onDrop={e => handleDrop(e, 0)}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14" /></svg>
                  <p>Drop a section here to get started</p>
                </div>
              )}
              {layout.sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`lpb-canvas-item ${selectedId === section.id ? 'selected' : ''} ${!section.visible ? 'hidden-section' : ''} ${dragState.overId === section.id ? 'drop-target' : ''}`}
                  draggable
                  onDragStart={e => handleDragStart(e, section.id, 'canvas')}
                  onDragOver={e => handleDragOver(e, section.id)}
                  onDrop={e => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedId(selectedId === section.id ? null : section.id)}
                >
                  <div className="lpb-canvas-item-drag">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" /></svg>
                  </div>
                  <div className="lpb-canvas-item-info">
                    <span className="lpb-canvas-item-label">{section.label}</span>
                    <span className="lpb-canvas-item-type">{section.type}</span>
                  </div>
                  <div className="lpb-canvas-item-actions">
                    <button className="lpb-btn-icon" title={section.visible ? 'Hide' : 'Show'} onClick={e => { e.stopPropagation(); toggleVisibility(section.id); }}>
                      {section.visible ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      )}
                    </button>
                    <button className="lpb-btn-icon" title="Duplicate" onClick={e => { e.stopPropagation(); duplicateSection(section.id); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </button>
                    <button className="lpb-btn-icon danger" title="Remove" onClick={e => { e.stopPropagation(); removeSection(section.id); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                    <button className="lpb-btn-icon" title="Move up" disabled={idx === 0} onClick={e => { e.stopPropagation(); moveSection(idx, idx - 1); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
                    </button>
                    <button className="lpb-btn-icon" title="Move down" disabled={idx === layout.sections.length - 1} onClick={e => { e.stopPropagation(); moveSection(idx, idx + 1); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Properties Panel */}
            {selectedBlock && (
              <div className="lpb-props-panel">
                <div className="lpb-props-header">
                  <h3>Edit: {selectedBlock.label}</h3>
                  <button className="lpb-btn-icon" onClick={() => setSelectedId(null)} title="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
                <div className="lpb-props-body">
                  <SectionEditor block={selectedBlock} onChange={updateSection} />
                </div>
              </div>
            )}

            {/* Global Style Controls */}
            {!selectedBlock && (
              <div className="lpb-props-panel">
                <div className="lpb-props-header">
                  <h3>Global Styles</h3>
                </div>
                <div className="lpb-props-body">
                  <div className="lpb-prop-group">
                    <label className="lpb-prop-label">Accent Color</label>
                    <div className="lpb-color-row">
                      <input type="color" value={layout.globalStyles.accentColor} onChange={e => updateGlobal('accentColor', e.target.value)} className="lpb-color-input" />
                      <span className="lpb-color-hex">{layout.globalStyles.accentColor}</span>
                    </div>
                    <label className="lpb-prop-label">Background</label>
                    <div className="lpb-color-row">
                      <input type="color" value={layout.globalStyles.bgColor} onChange={e => updateGlobal('bgColor', e.target.value)} className="lpb-color-input" />
                      <span className="lpb-color-hex">{layout.globalStyles.bgColor}</span>
                    </div>
                    <label className="lpb-prop-label">Text Color</label>
                    <div className="lpb-color-row">
                      <input type="color" value={layout.globalStyles.textColor} onChange={e => updateGlobal('textColor', e.target.value)} className="lpb-color-input" />
                      <span className="lpb-color-hex">{layout.globalStyles.textColor}</span>
                    </div>
                    <label className="lpb-prop-label">Heading Color</label>
                    <div className="lpb-color-row">
                      <input type="color" value={layout.globalStyles.headingColor} onChange={e => updateGlobal('headingColor', e.target.value)} className="lpb-color-input" />
                      <span className="lpb-color-hex">{layout.globalStyles.headingColor}</span>
                    </div>

                    <div className="lpb-prop-divider" style={{ margin: '12px 0' }} />
                    <h4 style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>Calendar Widget</h4>
                    
                    <label className="lpb-prop-label">Widget Theme</label>
                    <div className="lpb-btn-row">
                      {(['flat', 'glass', 'neo'] as const).map(style => (
                        <button key={style} className={`lpb-chip ${layout.globalStyles.calendarStyle === style ? 'active' : ''}`} onClick={() => updateGlobal('calendarStyle', style)}>
                          {style}
                        </button>
                      ))}
                    </div>

                    <label className="lpb-prop-label">Widget Background</label>
                    <div className="lpb-color-row">
                      <input type="color" value={layout.globalStyles.calendarBgColor || '#ffffff'} onChange={e => updateGlobal('calendarBgColor', e.target.value)} className="lpb-color-input" />
                      <span className="lpb-color-hex">{layout.globalStyles.calendarBgColor || '#ffffff'}</span>
                    </div>

                    <label className="lpb-prop-label">Widget Text</label>
                    <div className="lpb-color-row">
                      <input type="color" value={layout.globalStyles.calendarTextColor || '#0f172a'} onChange={e => updateGlobal('calendarTextColor', e.target.value)} className="lpb-color-input" />
                      <span className="lpb-color-hex">{layout.globalStyles.calendarTextColor || '#0f172a'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Right Panel: Live Preview ── */}
        {viewMode !== 'edit' && (
          <div className="lpb-panel-right">
            <div className="lpb-preview-frame" style={{ background: layout.globalStyles.bgColor, color: layout.globalStyles.textColor }}>
              <style>{`
                .lpb-preview-frame .lpb-prev-h1, .lpb-preview-frame .lpb-prev-h2, .lpb-preview-frame .lpb-prev-h3 { color: ${layout.globalStyles.headingColor}; }
              `}</style>
              {layout.sections.filter(s => s.visible).map(section => (
                <div
                  key={section.id}
                  className={`lpb-preview-section ${selectedId === section.id ? 'highlighted' : ''}`}
                  onClick={() => { if (viewMode === 'split') setSelectedId(section.id); }}
                >
                  <SectionPreview block={section} accentColor={layout.globalStyles.accentColor} />
                </div>
              ))}
              {layout.sections.filter(s => s.visible).length === 0 && (
                <div className="lpb-preview-empty">
                  <p>No visible sections yet. Add sections from the palette.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

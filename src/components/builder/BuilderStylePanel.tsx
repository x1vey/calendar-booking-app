'use client';

import React from 'react';
import { useBuilderStore } from '@/lib/store/builderStore';

export default function BuilderStylePanel() {
  const { activeLeftTab, appearance, updateAppearance, setCodeEditorOpen } = useBuilderStore();

  if (activeLeftTab !== 'setup' && activeLeftTab !== 'appearance') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-4">
          <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm">Style controls for this section will appear here.</p>
        </div>
        
        {/* Footer always visible */}
        <div className="p-4 mt-auto border-t">
          <button 
            onClick={() => setCodeEditorOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all text-left flex justify-between items-center"
          >
            <span>Override HTML/CSS</span>
            <span className="text-slate-400">↗</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Style settings</h2>
        
        <div className="space-y-6">
          {/* Layout Style */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Layout</label>
            <div className="flex flex-col gap-2">
              {[
                { id: 'split_grid', label: 'Split Grid' },
                { id: 'stacked', label: 'Stacked' },
                { id: 'sidebar_left', label: 'Sidebar Left' },
              ].map(opt => (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${appearance.layout.layoutStyle === opt.id ? 'border-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                    {appearance.layout.layoutStyle === opt.id && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                  </div>
                  <span className={`text-sm ${appearance.layout.layoutStyle === opt.id ? 'font-medium text-slate-900' : 'text-slate-600'}`}>{opt.label}</span>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={appearance.layout.layoutStyle === opt.id}
                    onChange={() => updateAppearance({ layout: { ...appearance.layout, layoutStyle: opt.id as any } })}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Sections */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Sections</label>
            <div className="space-y-3">
              <ToggleRow 
                label="Hero Section" 
                checked={appearance.layout.showHeroSection} 
                onChange={(checked) => updateAppearance({ layout: { ...appearance.layout, showHeroSection: checked } })} 
              />
              <ToggleRow 
                label="Stats Bar" 
                checked={appearance.layout.showStatsBar} 
                onChange={(checked) => updateAppearance({ layout: { ...appearance.layout, showStatsBar: checked } })} 
              />
              <ToggleRow 
                label="Ticker Tape" 
                checked={appearance.layout.showTickerTape} 
                onChange={(checked) => updateAppearance({ layout: { ...appearance.layout, showTickerTape: checked } })} 
              />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Animation Style */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Animation Style</label>
            <select 
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white font-medium text-slate-700 outline-none focus:border-slate-400 transition-colors"
              value={appearance.animations.pageEntrance}
              onChange={(e) => updateAppearance({ animations: { ...appearance.animations, pageEntrance: e.target.value as any } })}
            >
              <option value="none">None</option>
              <option value="fade_in">Fade In</option>
              <option value="slide_up">Slide Up</option>
              <option value="stagger_in">Stagger In</option>
            </select>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Texture Overlay */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Texture</label>
            <select 
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white font-medium text-slate-700 outline-none focus:border-slate-400 transition-colors"
              value={appearance.texturesAndEffects.backgroundTexture}
              onChange={(e) => updateAppearance({ texturesAndEffects: { ...appearance.texturesAndEffects, backgroundTexture: e.target.value as any } })}
            >
              <option value="none">Clean (None)</option>
              <option value="woven">Woven Linen</option>
              <option value="noise">Film Grain</option>
              <option value="grid">Technical Grid</option>
              <option value="dots">Dot Matrix</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer always visible */}
      <div className="p-4 mt-auto border-t bg-slate-50">
        <button 
          onClick={() => setCodeEditorOpen(true)}
          className="w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:border-slate-400 shadow-sm transition-all text-left flex justify-between items-center"
        >
          <span>Override HTML/CSS</span>
          <span className="text-slate-400">↗</span>
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
      <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`}>
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

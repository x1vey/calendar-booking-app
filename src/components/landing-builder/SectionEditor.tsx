'use client';

import React from 'react';
import { SectionBlock } from './types';

// ─── Individual section property editors ───

function HeroEditor({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const update = (key: string, value: any) => onChange({ ...block, props: { ...block.props, [key]: value } });
  return (
    <div className="lpb-prop-group">
      <label className="lpb-prop-label">Headline</label>
      <input className="lpb-prop-input" value={block.props.headline} onChange={e => update('headline', e.target.value)} />
      <label className="lpb-prop-label">Subheadline</label>
      <input className="lpb-prop-input" value={block.props.subheadline} onChange={e => update('subheadline', e.target.value)} />
      <label className="lpb-prop-label">CTA Button Text</label>
      <input className="lpb-prop-input" value={block.props.ctaText} onChange={e => update('ctaText', e.target.value)} />
      <label className="lpb-prop-label">Hero Image URL</label>
      <input className="lpb-prop-input" placeholder="https://..." value={block.props.imageUrl || ''} onChange={e => update('imageUrl', e.target.value)} />
      <label className="lpb-prop-label">Alignment</label>
      <div className="lpb-btn-row">
        {['left', 'center', 'right'].map(a => (
          <button key={a} className={`lpb-chip ${block.props.alignment === a ? 'active' : ''}`} onClick={() => update('alignment', a)}>{a}</button>
        ))}
      </div>
    </div>
  );
}

function FeaturesEditor({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const items = block.props.items as { icon: string; title: string; description: string }[];
  const updateItem = (idx: number, key: string, value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    onChange({ ...block, props: { ...block.props, items: next } });
  };
  const addItem = () => onChange({ ...block, props: { ...block.props, items: [...items, { icon: '✨', title: '', description: '' }] } });
  const removeItem = (idx: number) => onChange({ ...block, props: { ...block.props, items: items.filter((_, i) => i !== idx) } });

  return (
    <div className="lpb-prop-group">
      <label className="lpb-prop-label">Section Headline</label>
      <input className="lpb-prop-input" value={block.props.headline} onChange={e => onChange({ ...block, props: { ...block.props, headline: e.target.value } })} />
      <div className="lpb-prop-divider" />
      {items.map((item, i) => (
        <div key={i} className="lpb-nested-card">
          <div className="lpb-nested-header">
            <span className="lpb-nested-title">Feature {i + 1}</span>
            <button className="lpb-btn-icon-sm danger" onClick={() => removeItem(i)} title="Remove">×</button>
          </div>
          <input className="lpb-prop-input sm" placeholder="Icon emoji" value={item.icon} onChange={e => updateItem(i, 'icon', e.target.value)} />
          <input className="lpb-prop-input" placeholder="Title" value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} />
          <textarea className="lpb-prop-textarea" placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} rows={2} />
        </div>
      ))}
      <button className="lpb-btn-add" onClick={addItem}>+ Add Feature</button>
    </div>
  );
}

function VideoEditor({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const update = (key: string, value: any) => onChange({ ...block, props: { ...block.props, [key]: value } });
  return (
    <div className="lpb-prop-group">
      <label className="lpb-prop-label">Headline</label>
      <input className="lpb-prop-input" value={block.props.headline} onChange={e => update('headline', e.target.value)} />
      <label className="lpb-prop-label">YouTube Video URL</label>
      <input className="lpb-prop-input" placeholder="https://youtube.com/watch?v=..." value={block.props.videoUrl} onChange={e => update('videoUrl', e.target.value)} />
      <label className="lpb-prop-label">Description (optional)</label>
      <textarea className="lpb-prop-textarea" value={block.props.description || ''} onChange={e => update('description', e.target.value)} rows={2} />
    </div>
  );
}

function TestimonialsEditor({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const items = block.props.items as { name: string; role: string; quote: string; avatar: string }[];
  const updateItem = (idx: number, key: string, value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    onChange({ ...block, props: { ...block.props, items: next } });
  };
  const addItem = () => onChange({ ...block, props: { ...block.props, items: [...items, { name: '', role: '', quote: '', avatar: '' }] } });
  const removeItem = (idx: number) => onChange({ ...block, props: { ...block.props, items: items.filter((_, i) => i !== idx) } });

  return (
    <div className="lpb-prop-group">
      <label className="lpb-prop-label">Section Headline</label>
      <input className="lpb-prop-input" value={block.props.headline} onChange={e => onChange({ ...block, props: { ...block.props, headline: e.target.value } })} />
      <div className="lpb-prop-divider" />
      {items.map((item, i) => (
        <div key={i} className="lpb-nested-card">
          <div className="lpb-nested-header">
            <span className="lpb-nested-title">Testimonial {i + 1}</span>
            <button className="lpb-btn-icon-sm danger" onClick={() => removeItem(i)} title="Remove">×</button>
          </div>
          <input className="lpb-prop-input" placeholder="Name" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
          <input className="lpb-prop-input" placeholder="Role / Company" value={item.role} onChange={e => updateItem(i, 'role', e.target.value)} />
          <textarea className="lpb-prop-textarea" placeholder="Quote" value={item.quote} onChange={e => updateItem(i, 'quote', e.target.value)} rows={2} />
          <input className="lpb-prop-input" placeholder="Avatar image URL (optional)" value={item.avatar || ''} onChange={e => updateItem(i, 'avatar', e.target.value)} />
        </div>
      ))}
      <button className="lpb-btn-add" onClick={addItem}>+ Add Testimonial</button>
    </div>
  );
}

function ExpectationsEditor({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const update = (key: string, value: any) => onChange({ ...block, props: { ...block.props, [key]: value } });
  return (
    <div className="lpb-prop-group">
      <label className="lpb-prop-label">Headline</label>
      <input className="lpb-prop-input" value={block.props.headline} onChange={e => update('headline', e.target.value)} />
      <label className="lpb-prop-label">Body</label>
      <textarea className="lpb-prop-textarea" value={block.props.body} onChange={e => update('body', e.target.value)} rows={5} placeholder="1. Step one&#10;2. Step two&#10;3. Step three" />
    </div>
  );
}

function CtaEditor({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const update = (key: string, value: any) => onChange({ ...block, props: { ...block.props, [key]: value } });
  return (
    <div className="lpb-prop-group">
      <label className="lpb-prop-label">Headline</label>
      <input className="lpb-prop-input" value={block.props.headline} onChange={e => update('headline', e.target.value)} />
      <label className="lpb-prop-label">Subheadline</label>
      <input className="lpb-prop-input" value={block.props.subheadline} onChange={e => update('subheadline', e.target.value)} />
      <label className="lpb-prop-label">Button Text</label>
      <input className="lpb-prop-input" value={block.props.ctaText} onChange={e => update('ctaText', e.target.value)} />
    </div>
  );
}

function FaqEditor({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const items = block.props.items as { question: string; answer: string }[];
  const updateItem = (idx: number, key: string, value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    onChange({ ...block, props: { ...block.props, items: next } });
  };
  const addItem = () => onChange({ ...block, props: { ...block.props, items: [...items, { question: '', answer: '' }] } });
  const removeItem = (idx: number) => onChange({ ...block, props: { ...block.props, items: items.filter((_, i) => i !== idx) } });

  return (
    <div className="lpb-prop-group">
      <label className="lpb-prop-label">Section Headline</label>
      <input className="lpb-prop-input" value={block.props.headline} onChange={e => onChange({ ...block, props: { ...block.props, headline: e.target.value } })} />
      <div className="lpb-prop-divider" />
      {items.map((item, i) => (
        <div key={i} className="lpb-nested-card">
          <div className="lpb-nested-header">
            <span className="lpb-nested-title">Q{i + 1}</span>
            <button className="lpb-btn-icon-sm danger" onClick={() => removeItem(i)} title="Remove">×</button>
          </div>
          <input className="lpb-prop-input" placeholder="Question" value={item.question} onChange={e => updateItem(i, 'question', e.target.value)} />
          <textarea className="lpb-prop-textarea" placeholder="Answer" value={item.answer} onChange={e => updateItem(i, 'answer', e.target.value)} rows={2} />
        </div>
      ))}
      <button className="lpb-btn-add" onClick={addItem}>+ Add FAQ Item</button>
    </div>
  );
}

function StatsEditor({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const items = block.props.items as { value: string; label: string }[];
  const updateItem = (idx: number, key: string, value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    onChange({ ...block, props: { ...block.props, items: next } });
  };
  const addItem = () => onChange({ ...block, props: { ...block.props, items: [...items, { value: '', label: '' }] } });
  const removeItem = (idx: number) => onChange({ ...block, props: { ...block.props, items: items.filter((_, i) => i !== idx) } });

  return (
    <div className="lpb-prop-group">
      <label className="lpb-prop-label">Headline</label>
      <input className="lpb-prop-input" value={block.props.headline} onChange={e => onChange({ ...block, props: { ...block.props, headline: e.target.value } })} />
      <div className="lpb-prop-divider" />
      {items.map((item, i) => (
        <div key={i} className="lpb-nested-card">
          <div className="lpb-nested-header">
            <span className="lpb-nested-title">Stat {i + 1}</span>
            <button className="lpb-btn-icon-sm danger" onClick={() => removeItem(i)} title="Remove">×</button>
          </div>
          <input className="lpb-prop-input" placeholder="Value (e.g. 500+)" value={item.value} onChange={e => updateItem(i, 'value', e.target.value)} />
          <input className="lpb-prop-input" placeholder="Label" value={item.label} onChange={e => updateItem(i, 'label', e.target.value)} />
        </div>
      ))}
      <button className="lpb-btn-add" onClick={addItem}>+ Add Stat</button>
    </div>
  );
}

function LogoStripEditor({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const logos = block.props.logos as { name: string; url: string }[];
  const updateItem = (idx: number, key: string, value: string) => {
    const next = [...logos];
    next[idx] = { ...next[idx], [key]: value };
    onChange({ ...block, props: { ...block.props, logos: next } });
  };
  const addItem = () => onChange({ ...block, props: { ...block.props, logos: [...logos, { name: '', url: '' }] } });
  const removeItem = (idx: number) => onChange({ ...block, props: { ...block.props, logos: logos.filter((_, i) => i !== idx) } });

  return (
    <div className="lpb-prop-group">
      <label className="lpb-prop-label">Headline</label>
      <input className="lpb-prop-input" value={block.props.headline} onChange={e => onChange({ ...block, props: { ...block.props, headline: e.target.value } })} />
      <div className="lpb-prop-divider" />
      {logos.map((item, i) => (
        <div key={i} className="lpb-nested-card">
          <div className="lpb-nested-header">
            <span className="lpb-nested-title">Logo {i + 1}</span>
            <button className="lpb-btn-icon-sm danger" onClick={() => removeItem(i)} title="Remove">×</button>
          </div>
          <input className="lpb-prop-input" placeholder="Company name" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
          <input className="lpb-prop-input" placeholder="Logo image URL (optional)" value={item.url || ''} onChange={e => updateItem(i, 'url', e.target.value)} />
        </div>
      ))}
      <button className="lpb-btn-add" onClick={addItem}>+ Add Logo</button>
    </div>
  );
}

// ─── Router ───

export default function SectionEditor({ block, onChange }: { block: SectionBlock; onChange: (b: SectionBlock) => void }) {
  const editors: Record<string, React.FC<{ block: SectionBlock; onChange: (b: SectionBlock) => void }>> = {
    hero: HeroEditor,
    features: FeaturesEditor,
    video: VideoEditor,
    testimonials: TestimonialsEditor,
    expectations: ExpectationsEditor,
    cta: CtaEditor,
    faq: FaqEditor,
    stats: StatsEditor,
    logo_strip: LogoStripEditor,
  };
  const Editor = editors[block.type];
  if (!Editor) return <p className="text-sm text-slate-400">No settings for this section.</p>;
  return <Editor block={block} onChange={onChange} />;
}

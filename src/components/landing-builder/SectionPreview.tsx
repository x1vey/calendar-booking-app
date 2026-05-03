'use client';

import React, { useState } from 'react';
import { SectionBlock, PageLayout } from './types';

// ─── YouTube embed helper ───
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

// ─── Section Renderers ───

function HeroPreview({ block, accent, onCtaClick }: { block: SectionBlock; accent: string; onCtaClick?: () => void }) {
  const { headline, subheadline, ctaText, imageUrl, alignment } = block.props;
  const align = alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center';
  const textAlign = alignment || 'center';
  return (
    <div className="lpb-prev-hero" style={{ textAlign: textAlign as any, alignItems: align }}>
      {imageUrl && <img src={imageUrl} alt="" className="lpb-prev-hero-img" />}
      <h1 className="lpb-prev-h1">{headline || 'Your Headline'}</h1>
      <p className="lpb-prev-sub">{subheadline || 'Your subheadline goes here'}</p>
      <button className="lpb-prev-cta" style={{ background: accent }} onClick={onCtaClick}>{ctaText || 'Book Now'}</button>
    </div>
  );
}

function FeaturesPreview({ block, accent }: { block: SectionBlock; accent: string }) {
  const items = (block.props.items || []) as { icon: string; title: string; description: string }[];
  return (
    <div className="lpb-prev-section">
      <h2 className="lpb-prev-h2">{block.props.headline}</h2>
      <div className="lpb-prev-features-grid">
        {items.map((item, i) => (
          <div key={i} className="lpb-prev-feature-card">
            <div className="lpb-prev-feature-icon" style={{ background: accent + '18', color: accent }}>{item.icon}</div>
            <h3 className="lpb-prev-h3">{item.title || 'Feature'}</h3>
            <p className="lpb-prev-body">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoPreview({ block }: { block: SectionBlock }) {
  const ytId = getYouTubeId(block.props.videoUrl || '');
  return (
    <div className="lpb-prev-section">
      <h2 className="lpb-prev-h2">{block.props.headline}</h2>
      {ytId ? (
        <div className="lpb-prev-video-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="lpb-prev-video-iframe"
          />
        </div>
      ) : (
        <div className="lpb-prev-video-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M10 9l5 3-5 3V9z" /></svg>
          <span>Paste a YouTube URL to preview</span>
        </div>
      )}
      {block.props.description && <p className="lpb-prev-body" style={{ textAlign: 'center', marginTop: 12 }}>{block.props.description}</p>}
    </div>
  );
}

function TestimonialsPreview({ block, accent }: { block: SectionBlock; accent: string }) {
  const items = (block.props.items || []) as { name: string; role: string; quote: string; avatar: string }[];
  return (
    <div className="lpb-prev-section">
      <h2 className="lpb-prev-h2">{block.props.headline}</h2>
      <div className="lpb-prev-testimonials-grid">
        {items.map((item, i) => (
          <div key={i} className="lpb-prev-testimonial-card">
            <svg className="lpb-prev-quote-icon" width="32" height="32" viewBox="0 0 24 24" fill={accent + '25'}><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            <p className="lpb-prev-body" style={{ fontStyle: 'italic', marginBottom: 16 }}>"{item.quote}"</p>
            <div className="lpb-prev-testimonial-author">
              {item.avatar ? (
                <img src={item.avatar} alt="" className="lpb-prev-avatar" />
              ) : (
                <div className="lpb-prev-avatar-placeholder" style={{ background: accent + '20', color: accent }}>{(item.name || 'A')[0]}</div>
              )}
              <div>
                <div className="lpb-prev-author-name">{item.name || 'Anonymous'}</div>
                <div className="lpb-prev-author-role">{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpectationsPreview({ block, accent }: { block: SectionBlock; accent: string }) {
  const lines = (block.props.body || '').split('\n').filter((l: string) => l.trim());
  return (
    <div className="lpb-prev-section">
      <h2 className="lpb-prev-h2">{block.props.headline}</h2>
      <div className="lpb-prev-expectations-list">
        {lines.map((line: string, i: number) => (
          <div key={i} className="lpb-prev-expect-item">
            <div className="lpb-prev-expect-num" style={{ background: accent, color: '#fff' }}>{i + 1}</div>
            <p className="lpb-prev-body">{line.replace(/^\d+[\.\)]\s*/, '')}</p>
          </div>
        ))}
        {lines.length === 0 && <p className="lpb-prev-body" style={{ color: '#94a3b8' }}>Add steps above to see them here.</p>}
      </div>
    </div>
  );
}

function CtaPreview({ block, accent, onCtaClick }: { block: SectionBlock; accent: string; onCtaClick?: () => void }) {
  return (
    <div className="lpb-prev-cta-section" style={{ background: accent + '08' }}>
      <h2 className="lpb-prev-h2" style={{ textAlign: 'center' }}>{block.props.headline}</h2>
      <p className="lpb-prev-sub" style={{ textAlign: 'center' }}>{block.props.subheadline}</p>
      <div style={{ textAlign: 'center' }}>
        <button className="lpb-prev-cta" style={{ background: accent }} onClick={onCtaClick}>{block.props.ctaText || 'Book Now'}</button>
      </div>
    </div>
  );
}

function FaqPreview({ block, accent }: { block: SectionBlock; accent: string }) {
  const items = (block.props.items || []) as { question: string; answer: string }[];
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="lpb-prev-section">
      <h2 className="lpb-prev-h2">{block.props.headline}</h2>
      <div className="lpb-prev-faq-list">
        {items.map((item, i) => (
          <div key={i} className="lpb-prev-faq-item" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <div className="lpb-prev-faq-q">
              <span>{item.question || 'Question?'}</span>
              <svg className={`lpb-prev-faq-chevron ${openIdx === i ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </div>
            {openIdx === i && <p className="lpb-prev-faq-a">{item.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsPreview({ block, accent }: { block: SectionBlock; accent: string }) {
  const items = (block.props.items || []) as { value: string; label: string }[];
  return (
    <div className="lpb-prev-section">
      <h2 className="lpb-prev-h2" style={{ textAlign: 'center' }}>{block.props.headline}</h2>
      <div className="lpb-prev-stats-grid">
        {items.map((item, i) => (
          <div key={i} className="lpb-prev-stat-card">
            <div className="lpb-prev-stat-value" style={{ color: accent }}>{item.value || '0'}</div>
            <div className="lpb-prev-stat-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoStripPreview({ block }: { block: SectionBlock }) {
  const logos = (block.props.logos || []) as { name: string; url: string }[];
  return (
    <div className="lpb-prev-section">
      <p className="lpb-prev-logo-headline">{block.props.headline}</p>
      <div className="lpb-prev-logo-row">
        {logos.map((logo, i) => (
          <div key={i} className="lpb-prev-logo-item">
            {logo.url ? (
              <img src={logo.url} alt={logo.name} className="lpb-prev-logo-img" />
            ) : (
              <span className="lpb-prev-logo-name">{logo.name || 'Logo'}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Preview Router ───

export default function SectionPreview({ block, accentColor, onCtaClick }: { block: SectionBlock; accentColor: string; onCtaClick?: () => void }) {
  const renderers: Record<string, React.FC<{ block: SectionBlock; accent: string; onCtaClick?: () => void }>> = {
    hero: HeroPreview,
    features: FeaturesPreview,
    video: VideoPreview,
    testimonials: TestimonialsPreview,
    expectations: ExpectationsPreview,
    cta: CtaPreview,
    faq: FaqPreview,
    stats: StatsPreview,
    logo_strip: LogoStripPreview,
  };
  const Renderer = renderers[block.type];
  if (!Renderer) return null;
  return <Renderer block={block} accent={accentColor} onCtaClick={onCtaClick} />;
}

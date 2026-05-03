import { SectionCatalogItem, SectionBlock, PageLayout } from './types';
import { v4 as uuidv4 } from 'uuid';

export const SECTION_CATALOG: SectionCatalogItem[] = [
  {
    type: 'hero',
    label: 'Hero',
    description: 'A bold headline with CTA button',
    icon: 'M3 4h18v4H3V4zm0 6h18v4H3v-4zm0 6h12v4H3v-4z',
    defaultProps: {
      headline: 'Book a Call With Me',
      subheadline: 'Let\'s find the perfect time to connect and discuss your goals.',
      ctaText: 'Book Now',
      imageUrl: '',
      alignment: 'center',
    },
  },
  {
    type: 'features',
    label: 'Features',
    description: 'Highlight key benefits in a grid',
    icon: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z',
    defaultProps: {
      headline: 'What You\'ll Get',
      items: [
        { icon: '🎯', title: 'Focused Strategy', description: 'A clear action plan tailored to your needs.' },
        { icon: '⚡', title: 'Quick Results', description: 'Start seeing progress within days, not months.' },
        { icon: '🤝', title: 'Expert Guidance', description: 'Backed by years of hands-on experience.' },
      ],
    },
  },
  {
    type: 'video',
    label: 'Video',
    description: 'Embed a YouTube video or VSL',
    icon: 'M4 4h16v12H4V4zm6 3v6l5-3-5-3z',
    defaultProps: {
      headline: 'Watch This First',
      videoUrl: '',
      description: '',
    },
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Social proof from your clients',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    defaultProps: {
      headline: 'What Clients Say',
      items: [
        { name: 'Alex Johnson', role: 'CEO', quote: 'This was exactly what I needed to move forward.', avatar: '' },
        { name: 'Maria Chen', role: 'Founder', quote: 'Highly recommended — professional and insightful.', avatar: '' },
      ],
    },
  },
  {
    type: 'expectations',
    label: 'Expectations',
    description: 'Describe what to expect from the call',
    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6m-3 7v4m-2-2h4',
    defaultProps: {
      headline: 'What to Expect',
      body: '1. We will review your current situation\n2. Identify key opportunities\n3. Build a concrete next-step plan',
    },
  },
  {
    type: 'cta',
    label: 'Call-to-Action',
    description: 'A strong closing section with CTA',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    defaultProps: {
      headline: 'Ready to Get Started?',
      subheadline: 'Book your free session today — no commitment required.',
      ctaText: 'Book My Call',
    },
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
    defaultProps: {
      headline: 'Frequently Asked Questions',
      items: [
        { question: 'How long is the session?', answer: 'Each session typically lasts 30-60 minutes.' },
        { question: 'Is there any cost?', answer: 'The initial consultation is completely free.' },
        { question: 'How do I prepare?', answer: 'Just come with your questions — no prep needed!' },
      ],
    },
  },
  {
    type: 'stats',
    label: 'Stats',
    description: 'Show impressive numbers',
    icon: 'M3 3v18h18M9 17V9m4 8V5m4 12v-4',
    defaultProps: {
      headline: 'Results That Speak',
      items: [
        { value: '500+', label: 'Clients Served' },
        { value: '98%', label: 'Satisfaction Rate' },
        { value: '10+', label: 'Years Experience' },
      ],
    },
  },
  {
    type: 'logo_strip',
    label: 'Logo Strip',
    description: 'Trusted-by / As seen in strip',
    icon: 'M2 6h4v12H2V6zm8 0h4v12h-4V6zm8 0h4v12h-4V6z',
    defaultProps: {
      headline: 'Trusted By',
      logos: [
        { name: 'Company A', url: '' },
        { name: 'Company B', url: '' },
        { name: 'Company C', url: '' },
        { name: 'Company D', url: '' },
      ],
    },
  },
];

export function createSection(type: SectionCatalogItem['type'], overrides?: any): SectionBlock {
  const catalog = SECTION_CATALOG.find(s => s.type === type);
  if (!catalog) throw new Error(`Unknown section type: ${type}`);
  return {
    id: uuidv4(),
    type: catalog.type,
    label: catalog.label,
    visible: true,
    props: { ...JSON.parse(JSON.stringify(catalog.defaultProps)), ...(overrides || {}) },
  };
}

export function getDefaultLayout(): PageLayout {
  return {
    sections: [
      createSection('hero', { headline: 'Book a Strategy Call', subheadline: 'Find a time that works for you below.' }),
      createSection('features'),
    ],
    globalStyles: {
      bgColor: '#f1f5f9',
      textColor: '#334155',
      headingColor: '#0f172a',
      accentColor: '#2563eb',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '16px',
      calendarBgColor: '#ffffff',
      calendarTextColor: '#0f172a',
      calendarStyle: 'flat'
    },
  };
}

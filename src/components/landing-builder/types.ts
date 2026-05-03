// Landing Page Builder – Type Definitions

export type SectionType =
  | 'hero'
  | 'features'
  | 'video'
  | 'testimonials'
  | 'expectations'
  | 'cta'
  | 'faq'
  | 'stats'
  | 'logo_strip';

export interface SectionBlock {
  id: string;
  type: SectionType;
  label: string;
  visible: boolean;
  props: Record<string, any>;
}

export interface PageLayout {
  sections: SectionBlock[];
  globalStyles: {
    bgColor: string;
    textColor: string;
    headingColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: string;
    calendarBgColor?: string;
    calendarTextColor?: string;
    calendarStyle?: 'flat' | 'glass' | 'neo';
  };
}

// Section catalog for the palette
export interface SectionCatalogItem {
  type: SectionType;
  label: string;
  description: string;
  icon: string; // SVG path data
  defaultProps: Record<string, any>;
}

// Drag state used by the DnD system
export interface DragState {
  draggedId: string | null;
  overId: string | null;
  source: 'canvas' | 'palette';
  draggedType?: SectionType;
}

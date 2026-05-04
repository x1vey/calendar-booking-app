import { create } from 'zustand';
import { AppearanceConfig, TeamMember, Service, RentalItem } from '../types/builder';
import { PRESETS } from '../presets';

export interface LandingSection {
  id: string;
  visible: boolean;
  content?: any;
}

export interface BuilderState {
  // ─── CALENDAR SLICE ──────────────────────────────────────────────────────
  id: string | null;
  name: string;
  slug: string;
  calendarMode: 'individual' | 'organisation';
  bookingType: 'single_slot' | 'multi_day' | 'seat_based' | 'rental' | 'recurring';
  teamMembers: TeamMember[];
  services: Service[];
  rentalItems: RentalItem[];
  availability: any | null;
  cancellationPolicy: any | null;
  integrations: any | null;

  // ─── APPEARANCE SLICE ────────────────────────────────────────────────────
  appearance: AppearanceConfig;

  // ─── LANDING SLICE ───────────────────────────────────────────────────────
  landingPage: {
    sections: LandingSection[];
    globalStyle: any;
    seo: any;
    inheritFromCalendar: boolean;
  };

  // ─── UI SLICE ────────────────────────────────────────────────────────────
  activeLeftTab: 'setup' | 'team' | 'services' | 'availability' | 'appearance' | 'landing' | 'integrations' | 'multi_day';
  advancedPanelOpen: boolean;
  codeEditorOpen: boolean;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  isDirty: boolean;
  lastSavedAt: string | null;
  isSaving: boolean;

  // ─── ACTIONS ─────────────────────────────────────────────────────────────
  
  // UI Actions
  setActiveLeftTab: (tab: BuilderState['activeLeftTab']) => void;
  setPreviewDevice: (device: BuilderState['previewDevice']) => void;
  setAdvancedPanelOpen: (open: boolean) => void;
  setCodeEditorOpen: (open: boolean) => void;

  // Calendar Actions
  setCalendarId: (id: string) => void;
  setCalendarMode: (mode: BuilderState['calendarMode']) => void;
  setBookingType: (type: BuilderState['bookingType']) => void;
  updateCalendarConfig: (partial: Partial<Pick<BuilderState, 'name' | 'slug' | 'availability' | 'cancellationPolicy' | 'integrations'>>) => void;

  // Appearance Actions
  updateAppearance: (partial: Partial<AppearanceConfig>) => void;
  loadPreset: (presetId: string) => void;

  // Landing Actions
  updateLandingPage: (partial: Partial<BuilderState['landingPage']>) => void;

  // Collections
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, partial: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  
  addService: (service: Service) => void;
  updateService: (id: string, partial: Partial<Service>) => void;
  removeService: (id: string) => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  // Calendar Slice Defaults
  id: null,
  name: '',
  slug: '',
  calendarMode: 'individual',
  bookingType: 'single_slot',
  teamMembers: [],
  services: [],
  rentalItems: [],
  availability: null,
  cancellationPolicy: null,
  integrations: null,

  // Appearance Slice Defaults
  appearance: {
    preset: 'default',
    colorPalette: PRESETS.default.colorPalette as any,
    typography: PRESETS.default.typography as any,
    layout: PRESETS.default.layout as any,
    animations: PRESETS.default.animations as any,
    texturesAndEffects: PRESETS.default.texturesAndEffects as any,
    customCss: { enabled: false, value: '' }
  },

  // Landing Slice Defaults
  landingPage: {
    sections: [
      { id: 'hero', visible: true },
      { id: 'about', visible: false },
      { id: 'team', visible: false },
      { id: 'services', visible: false },
      { id: 'calendar', visible: true },
      { id: 'testimonials', visible: false },
      { id: 'faq', visible: false },
      { id: 'footer', visible: true }
    ],
    globalStyle: {},
    seo: {},
    inheritFromCalendar: true
  },

  // UI Slice Defaults
  activeLeftTab: 'setup',
  advancedPanelOpen: false,
  codeEditorOpen: false,
  previewDevice: 'desktop',
  isDirty: false,
  lastSavedAt: null,
  isSaving: false,

  // UI Actions
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setPreviewDevice: (device) => set({ previewDevice: device }),
  setAdvancedPanelOpen: (open) => set({ advancedPanelOpen: open }),
  setCodeEditorOpen: (open) => set({ codeEditorOpen: open }),

  // Calendar Actions
  setCalendarId: (id) => set({ id }),
  setCalendarMode: (mode) => set({ calendarMode: mode }),
  setBookingType: (type) => set({ bookingType: type }),
  updateCalendarConfig: (partial) => set({ ...partial }),

  // Appearance Actions
  updateAppearance: (partial) => set((state) => ({ 
    appearance: { ...state.appearance, ...partial },
    isDirty: true
  })),
  
  loadPreset: (presetId) => {
    const preset = PRESETS[presetId] || PRESETS.default;
    set((state) => ({ 
      appearance: { 
        ...state.appearance, 
        preset: presetId as any,
        colorPalette: { ...state.appearance.colorPalette, ...(preset.colorPalette || {}) },
        typography: { ...state.appearance.typography, ...(preset.typography || {}) },
        layout: { ...state.appearance.layout, ...(preset.layout || {}) },
        animations: { ...state.appearance.animations, ...(preset.animations || {}) },
        texturesAndEffects: { ...state.appearance.texturesAndEffects, ...(preset.texturesAndEffects || {}) },
      },
      isDirty: true
    }));
  },

  // Landing Actions
  updateLandingPage: (partial) => set((state) => ({
    landingPage: { ...state.landingPage, ...partial },
    isDirty: true
  })),

  // Collections
  addTeamMember: (member) => set((state) => ({ teamMembers: [...state.teamMembers, member], isDirty: true })),
  updateTeamMember: (id, partial) => set((state) => ({
    teamMembers: state.teamMembers.map(m => m.id === id ? { ...m, ...partial } : m),
    isDirty: true
  })),
  removeTeamMember: (id) => set((state) => ({
    teamMembers: state.teamMembers.filter(m => m.id !== id),
    isDirty: true
  })),
  
  addService: (service) => set((state) => ({ services: [...state.services, service], isDirty: true })),
  updateService: (id, partial) => set((state) => ({
    services: state.services.map(s => s.id === id ? { ...s, ...partial } : s),
    isDirty: true
  })),
  removeService: (id) => set((state) => ({
    services: state.services.filter(s => s.id !== id),
    isDirty: true
  }))
}));

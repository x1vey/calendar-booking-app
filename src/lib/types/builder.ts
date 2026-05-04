export type CalendarMode = 'individual' | 'organisation';
export type BookingType = 'single_slot' | 'multi_day' | 'seat_based' | 'rental';
export type ThemePreset = 'fitness' | 'tattoo' | 'garment' | 'default' | 'blank' | 'custom';

// ─── APPEARANCE CONFIG ────────────────────────────────────────────────────────
export interface AppearanceConfig {
  preset: ThemePreset;
  colorPalette: {
    backgroundPrimary: string;
    backgroundSecondary: string;
    backgroundHero?: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary?: string;
    accentPrimary: string;
    accentSecondary?: string;
    borderColor: string;
    slotAvailableBg?: string;
    slotAvailableText?: string;
    slotTakenBg?: string;
    slotTakenText?: string;
    slotSelectedBg?: string;
    slotSelectedText?: string;
  };
  typography: {
    headingFont: string;
    headingWeight: number;
    headingLetterSpacing?: string;
    headingTransform?: 'uppercase' | 'capitalize' | 'none';
    bodyFont: string;
    bodyWeight: number;
    bodySizeScale: 'compact' | 'default' | 'spacious';
    accentFont?: string | null;
    baseFontSize: number;
    lineHeight: number;
  };
  layout: {
    layoutStyle: 'split_grid' | 'stacked' | 'sidebar_left' | 'sidebar_right' | 'full_width_timeline';
    borderRadiusStyle: 'sharp' | 'soft' | 'pill';
    density: 'compact' | 'comfortable' | 'spacious';
    showHeroSection: boolean;
    heroStyle?: 'text_only' | 'text_with_stats' | 'full_bleed' | 'minimal';
    showStatsBar: boolean;
    showTickerTape: boolean;
    tickerTapeContent?: string[];
    tickerTapeSpeed?: 'slow' | 'medium' | 'fast';
    showFooter: boolean;
    footerStyle?: 'minimal' | 'branded' | 'dark_full';
  };
  texturesAndEffects: {
    backgroundTexture: 'none' | 'woven' | 'noise' | 'grid' | 'dots' | 'diagonal_lines' | 'geometric' | 'custom_svg';
    backgroundTextureOpacity?: number;
    backgroundTextureColor?: string;
    heroOverlay: 'none' | 'dark_gradient' | 'light_gradient' | 'color_wash';
    heroOverlayOpacity?: number;
    cardStyle: 'flat' | 'elevated' | 'outlined' | 'glass';
    glassBlur?: number;
  };
  animations: {
    globalAnimationLevel: 'none' | 'subtle' | 'full';
    pageEntrance: 'none' | 'fade_in' | 'slide_up' | 'stagger_in';
    slotHover: 'none' | 'lift' | 'highlight' | 'border_grow';
    calendarDayHover: 'none' | 'fill' | 'scale' | 'glow';
    dateSelection: 'none' | 'pop' | 'ripple' | 'slide';
    bookingConfirmation: 'none' | 'confetti' | 'check_draw' | 'fade_success';
    tickerTapeEnabled: boolean;
    loadingSkeletonStyle: 'pulse' | 'shimmer' | 'wave';
    transitionDurationMs: number;
    respectReducedMotion: boolean;
  };
  customCss?: {
    enabled: boolean;
    value: string;
  };
}

// ─── TEAM MEMBER ──────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  calendarId: string;
  displayName: string;
  roleOrStyle: string;
  avatarInitial: string;
  avatarColor: string;
  specialityTags: string[];
  linkedCalendarId: string | null;
  useSharedHours: boolean;
  availabilityOverride: any | null; // Replace with proper Availability type later
  depositAmount: number | null;
  isBookable: boolean;
  isVisible: boolean;
  sortOrder: number;
}

// ─── SERVICE ──────────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  calendarId: string;
  name: string;
  description: string;
  durationMinutes: number;
  durationIsVariable: boolean;
  durationMin: number | null;
  durationMax: number | null;
  price: number;
  priceType: 'fixed' | 'per_hour' | 'per_day' | 'quote_only' | 'free';
  depositRequired: boolean;
  depositAmount: number | null;
  eligibleMemberIds: string[];
  intensityLevel: 1 | 2 | 3 | 4 | null;
  intensityLabel: string | null;
  categoryTag: string | null;
  bufferAfterMinutes: number;
  maxParticipants: number | null;
  customFields: any[]; // Define custom field structure
  isVisible: boolean;
  sortOrder: number;
}

// ─── RENTAL ITEM ──────────────────────────────────────────────────────────────
export interface RentalItem {
  id: string;
  calendarId: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  pricePerDay: number;
  pricePerHour: number | null;
  deposit: number | null;
  maxRentalDays: number | null;
  minRentalHours: number;
  quantity: number;
  isAvailable: boolean;
}

// ─── CALENDAR RECORD ──────────────────────────────────────────────────────────
export interface CalendarRecord {
  id: string;
  ownerId: string;
  ownerType: 'individual' | 'organisation';
  slug: string;
  name: string;
  calendarMode: CalendarMode;
  bookingType: BookingType;
  themePreset: ThemePreset;
  appearance: AppearanceConfig;
  landingPage: any; // LandingPageConfig
  availability: any; // AvailabilityConfig
  cancellationPolicy: any;
  integrations: any;
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

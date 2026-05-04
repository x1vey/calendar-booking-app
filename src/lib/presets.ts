import { AppearanceConfig } from './types/builder';

export const PRESETS: Record<string, Partial<AppearanceConfig>> = {
  fitness: {
    colorPalette: {
      backgroundPrimary: "#0d0d0d",
      backgroundSecondary: "#080808",
      textPrimary: "#f0ede6",
      textSecondary: "#888780",
      accentPrimary: "#c8f542",
      borderColor: "#1c1c1c"
    },
    typography: {
      headingFont: "Bebas Neue",
      bodyFont: "Space Grotesk",
      headingTransform: "uppercase",
      headingLetterSpacing: "2px",
      headingWeight: 700,
      bodyWeight: 400,
      bodySizeScale: "default",
      baseFontSize: 16,
      lineHeight: 1.5
    },
    layout: {
      layoutStyle: "split_grid",
      showHeroSection: true,
      showTickerTape: false,
      showStatsBar: true,
      density: "comfortable",
      borderRadiusStyle: "soft",
      showFooter: true
    },
    animations: {
      globalAnimationLevel: "subtle",
      pageEntrance: "fade_in",
      slotHover: "border_grow",
      dateSelection: "pop",
      calendarDayHover: "fill",
      bookingConfirmation: "check_draw",
      tickerTapeEnabled: false,
      loadingSkeletonStyle: "pulse",
      transitionDurationMs: 300,
      respectReducedMotion: true
    },
    texturesAndEffects: {
      backgroundTexture: "none",
      heroOverlay: "none",
      cardStyle: "flat"
    }
  },
  tattoo: {
    colorPalette: {
      backgroundPrimary: "#f7f3ee",
      backgroundSecondary: "#f0ece4",
      textPrimary: "#1a1410",
      textSecondary: "#a89880",
      accentPrimary: "#c9a87c",
      accentSecondary: "#D85A30",
      borderColor: "#e2dbd0"
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "DM Mono",
      headingWeight: 400,
      headingLetterSpacing: "1px",
      headingTransform: "none",
      bodyWeight: 400,
      bodySizeScale: "default",
      baseFontSize: 16,
      lineHeight: 1.6
    },
    layout: {
      layoutStyle: "split_grid",
      showHeroSection: true,
      showTickerTape: true,
      showStatsBar: false,
      density: "spacious",
      borderRadiusStyle: "sharp",
      showFooter: true
    },
    animations: {
      globalAnimationLevel: "subtle",
      pageEntrance: "fade_in",
      slotHover: "lift",
      dateSelection: "none",
      calendarDayHover: "fill",
      bookingConfirmation: "fade_success",
      tickerTapeEnabled: true,
      loadingSkeletonStyle: "pulse",
      transitionDurationMs: 300,
      respectReducedMotion: true
    },
    texturesAndEffects: {
      backgroundTexture: "none",
      heroOverlay: "none",
      cardStyle: "flat"
    }
  },
  garment: {
    colorPalette: {
      backgroundPrimary: "#fdfaf6",
      backgroundSecondary: "#f5ede2",
      textPrimary: "#2a2118",
      textSecondary: "#9a8e81",
      accentPrimary: "#c9a87c",
      borderColor: "#e8e0d4"
    },
    typography: {
      headingFont: "Cormorant Garamond",
      bodyFont: "Jost",
      headingWeight: 300,
      headingLetterSpacing: "6px",
      headingTransform: "none",
      bodyWeight: 400,
      bodySizeScale: "spacious",
      baseFontSize: 16,
      lineHeight: 1.7
    },
    layout: {
      layoutStyle: "sidebar_left",
      showHeroSection: true,
      showTickerTape: false,
      showStatsBar: true,
      density: "spacious",
      borderRadiusStyle: "sharp",
      showFooter: true
    },
    animations: {
      globalAnimationLevel: "none",
      pageEntrance: "fade_in",
      slotHover: "none",
      dateSelection: "none",
      calendarDayHover: "fill",
      bookingConfirmation: "fade_success",
      tickerTapeEnabled: false,
      loadingSkeletonStyle: "pulse",
      transitionDurationMs: 300,
      respectReducedMotion: true
    },
    texturesAndEffects: {
      backgroundTexture: "woven",
      backgroundTextureOpacity: 0.12,
      heroOverlay: "none",
      cardStyle: "flat"
    }
  },
  default: {
    colorPalette: {
      backgroundPrimary: "#ffffff",
      backgroundSecondary: "#f8fafc",
      textPrimary: "#1a1a1a",
      textSecondary: "#64748b",
      accentPrimary: "#6366f1",
      borderColor: "#e2e8f0"
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: 600,
      headingLetterSpacing: "0px",
      headingTransform: "none",
      bodyWeight: 400,
      bodySizeScale: "default",
      baseFontSize: 16,
      lineHeight: 1.5
    },
    layout: {
      layoutStyle: "split_grid",
      showHeroSection: false,
      showTickerTape: false,
      showStatsBar: false,
      density: "comfortable",
      borderRadiusStyle: "soft",
      showFooter: false
    },
    animations: {
      globalAnimationLevel: "none",
      pageEntrance: "none",
      slotHover: "none",
      dateSelection: "none",
      calendarDayHover: "none",
      bookingConfirmation: "none",
      tickerTapeEnabled: false,
      loadingSkeletonStyle: "pulse",
      transitionDurationMs: 0,
      respectReducedMotion: true
    },
    texturesAndEffects: {
      backgroundTexture: "none",
      heroOverlay: "none",
      cardStyle: "flat"
    }
  },
  blank: {
    colorPalette: {
      backgroundPrimary: "",
      backgroundSecondary: "",
      textPrimary: "",
      textSecondary: "",
      accentPrimary: "",
      borderColor: ""
    },
    typography: {
      headingFont: "",
      bodyFont: "",
      headingWeight: 400,
      bodyWeight: 400,
      bodySizeScale: "default",
      baseFontSize: 16,
      lineHeight: 1.5
    },
    layout: {
      layoutStyle: "split_grid",
      showHeroSection: false,
      showTickerTape: false,
      showStatsBar: false,
      density: "comfortable",
      borderRadiusStyle: "sharp",
      showFooter: false
    },
    animations: {
      globalAnimationLevel: "none",
      pageEntrance: "none",
      slotHover: "none",
      dateSelection: "none",
      calendarDayHover: "none",
      bookingConfirmation: "none",
      tickerTapeEnabled: false,
      loadingSkeletonStyle: "pulse",
      transitionDurationMs: 0,
      respectReducedMotion: true
    },
    texturesAndEffects: {
      backgroundTexture: "none",
      heroOverlay: "none",
      cardStyle: "flat"
    }
  }
};

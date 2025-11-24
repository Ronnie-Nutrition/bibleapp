// iOS Design System Theme for Bible App
// Matches SwiftUI app styling and Material UI integration

// iOS System Colors
export const colors = {
  // Primary Colors
  primary: '#007AFF',           // iOS Blue
  primaryDark: '#0051D5',       // Darker blue for active states
  primaryLight: '#B3D9FF',      // Light blue for disabled states
  
  // System Grays (iOS 13+)
  systemGray: '#8E8E93',        // Secondary text
  systemGray2: '#AEAEB2',       // Placeholder text
  systemGray3: '#C7C7CC',       // Separator lines
  systemGray4: '#D1D1D6',       // Background fills
  systemGray5: '#E5E5EA',       // Secondary background
  systemGray6: '#F2F2F7',       // Card backgrounds
  
  // Semantic Colors
  success: '#34C759',           // Green for completion
  warning: '#FF9500',           // Orange for difficulty/caution
  error: '#FF3B30',             // Red for errors
  info: '#5856D6',              // Purple for info
  
  // Text Colors
  textPrimary: '#000000',       // Primary text (dark mode: #FFFFFF)
  textSecondary: '#3C3C43',     // Secondary text (dark mode: #EBEBF5)
  textTertiary: '#3C3C4399',    // Tertiary text with opacity
  
  // Background Colors
  background: '#FFFFFF',        // Main background
  backgroundSecondary: '#F9F9F9', // Secondary background
  backgroundTertiary: '#F2F2F7', // Card/section background
  
  // Interactive Colors
  link: '#007AFF',              // Links
  linkVisited: '#5856D6',       // Visited links
  
  // Card & Surface Colors
  cardBackground: '#FFFFFF',    // Card background
  modalBackground: 'rgba(0, 0, 0, 0.4)', // Modal overlay
  
  // Border Colors
  border: '#C6C6C8',            // Standard borders
  borderLight: '#E5E5EA',       // Light borders
};

// iOS Typography Scale (San Francisco font system)
export const typography = {
  largeTitle: {
    fontSize: '34px',
    fontWeight: 700,
    lineHeight: '41px',
    letterSpacing: '0.37px',
  },
  title1: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: '34px',
    letterSpacing: '0.36px',
  },
  title2: {
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: '28px',
    letterSpacing: '0.35px',
  },
  title3: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '25px',
    letterSpacing: '0.38px',
  },
  headline: {
    fontSize: '17px',
    fontWeight: 600,
    lineHeight: '22px',
    letterSpacing: '-0.41px',
  },
  body: {
    fontSize: '17px',
    fontWeight: 400,
    lineHeight: '22px',
    letterSpacing: '-0.41px',
  },
  callout: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '21px',
    letterSpacing: '-0.32px',
  },
  subheadline: {
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: '20px',
    letterSpacing: '-0.24px',
  },
  footnote: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '18px',
    letterSpacing: '-0.08px',
  },
  caption1: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
    letterSpacing: '0px',
  },
  caption2: {
    fontSize: '11px',
    fontWeight: 400,
    lineHeight: '13px',
    letterSpacing: '0.07px',
  },
};

// iOS Spacing System (multiples of 4px)
export const spacing = {
  xs: '4px',      // 4px
  sm: '8px',      // 8px  
  md: '12px',     // 12px
  lg: '16px',     // 16px
  xl: '20px',     // 20px - Standard horizontal padding
  xxl: '24px',    // 24px
  xxxl: '32px',   // 32px
  xxxxl: '40px',  // 40px
};

// iOS Border Radius
export const borderRadius = {
  none: '0px',
  small: '4px',     // Small elements
  medium: '8px',    // Buttons
  large: '12px',    // Cards
  xlarge: '16px',   // Modals
  round: '50%',     // Circular elements
};

// iOS Shadows
export const shadows = {
  small: '0 1px 3px rgba(0, 0, 0, 0.12)',
  medium: '0 4px 6px rgba(0, 0, 0, 0.15)',
  large: '0 10px 25px rgba(0, 0, 0, 0.15)',
  card: '0 2px 10px rgba(0, 0, 0, 0.1)',
};

// iOS Component Sizes
export const sizes = {
  buttonHeight: '44px',        // Minimum tap target size
  inputHeight: '44px',         // Input field height
  tabBarHeight: '83px',        // Bottom tab bar
  navigationBarHeight: '44px', // Top navigation
  cardMinHeight: '100px',      // Minimum card height
};

// iOS Animation Durations
export const animation = {
  fast: '0.15s',
  normal: '0.25s',
  slow: '0.35s',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// Complete theme object for Material UI integration
export const iOSTheme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  sizes,
  animation,
};

export default iOSTheme;
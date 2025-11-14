import { createSystem, defaultConfig } from '@chakra-ui/react'

export const theme = createSystem(
  defaultConfig,
  {
    theme: {
      tokens: {
        colors: {
          // GoPay Brand Primary Colors - Teal/Turquoise
          primary: {
            50: { value: '#F0FDFA' },
            100: { value: '#CCFBF1' },
            200: { value: '#99F6E4' },
            300: { value: '#5EEAD4' },
            400: { value: '#2DD4BF' },
            500: { value: '#14B8A6' },    // GoPay Teal (primary brand color)
            600: { value: '#0E7C86' },    // GoPay Medium Teal
            700: { value: '#0D6B78' },    // Darker teal
            800: { value: '#0A5560' },    // Deep teal
            900: { value: '#0A3F48' },    // Very dark teal
          },
          // GoPay Brand Secondary Colors - Mint Accent
          secondary: {
            50: { value: '#F0FDFA' },
            100: { value: '#E0F9F6' },
            200: { value: '#B8F3ED' },
            300: { value: '#7FE9E0' },    // Light mint
            400: { value: '#5BC0A3' },    // Medium mint
            500: { value: '#A8E6D8' },    // Mint from logo
            600: { value: '#7FD4C1' },    // Darker mint
            700: { value: '#5BC0A3' },    // Deep mint
            800: { value: '#4A9D8A' },    // Very deep mint
            900: { value: '#387A71' },    // Darkest mint
          },
          // Success Colors
          success: {
            50: { value: '#F0FDF4' },
            100: { value: '#DCFCE7' },
            200: { value: '#BBEF63' },
            300: { value: '#86EFAC' },
            400: { value: '#4ADE80' },
            500: { value: '#22C55E' },
            600: { value: '#16A34A' },
            700: { value: '#15803D' },
            800: { value: '#166534' },
            900: { value: '#145231' },
          },
          // Danger Colors
          danger: {
            50: { value: '#FEF2F2' },
            100: { value: '#FEE2E2' },
            200: { value: '#FECACA' },
            300: { value: '#FCA5A5' },
            400: { value: '#F87171' },
            500: { value: '#EF4444' },
            600: { value: '#DC2626' },
            700: { value: '#B91C1C' },
            800: { value: '#991B1B' },
            900: { value: '#7F1D1D' },
          },
          // Warning Colors
          warning: {
            50: { value: '#FFFBEB' },
            100: { value: '#FEF3C7' },
            200: { value: '#FDE68A' },
            300: { value: '#FCD34D' },
            400: { value: '#FBBF24' },
            500: { value: '#F59E0B' },
            600: { value: '#D97706' },
            700: { value: '#B45309' },
            800: { value: '#92400E' },
            900: { value: '#78350F' },
          },
          // Info Colors
          info: {
            50: { value: '#EFF6FF' },
            100: { value: '#DBEAFE' },
            200: { value: '#BFDBFE' },
            300: { value: '#93C5FD' },
            400: { value: '#60A5FA' },
            500: { value: '#3B82F6' },
            600: { value: '#2563EB' },
            700: { value: '#1D4ED8' },
            800: { value: '#1E40AF' },
            900: { value: '#1E3A8A' },
          },
        },
        fonts: {
          body: { value: "'Poppins', 'Inter', system-ui, sans-serif" },
          heading: { value: "'Poppins', system-ui, sans-serif" },
          mono: { value: "'Fira Code', monospace" },
        },
        fontSizes: {
          xs: { value: '0.75rem' },
          sm: { value: '0.875rem' },
          md: { value: '1rem' },
          lg: { value: '1.125rem' },
          xl: { value: '1.25rem' },
          '2xl': { value: '1.5rem' },
          '3xl': { value: '1.875rem' },
          '4xl': { value: '2.25rem' },
          '5xl': { value: '3rem' },
          '6xl': { value: '3.75rem' },
        },
        fontWeights: {
          light: { value: '300' },
          normal: { value: '400' },
          medium: { value: '500' },
          semibold: { value: '600' },
          bold: { value: '700' },
          extrabold: { value: '800' },
        },
        lineHeights: {
          tight: { value: '1.25' },
          snug: { value: '1.375' },
          normal: { value: '1.5' },
          relaxed: { value: '1.625' },
          loose: { value: '2' },
        },
        letterSpacings: {
          tighter: { value: '-0.05em' },
          tight: { value: '-0.025em' },
          normal: { value: '0em' },
          wide: { value: '0.025em' },
          wider: { value: '0.05em' },
          widest: { value: '0.1em' },
        },
        spacing: {
          0: { value: '0' },
          1: { value: '0.25rem' },
          2: { value: '0.5rem' },
          3: { value: '0.75rem' },
          4: { value: '1rem' },
          5: { value: '1.25rem' },
          6: { value: '1.5rem' },
          8: { value: '2rem' },
          10: { value: '2.5rem' },
          12: { value: '3rem' },
          16: { value: '4rem' },
          20: { value: '5rem' },
          24: { value: '6rem' },
          28: { value: '7rem' },
          32: { value: '8rem' },
          36: { value: '9rem' },
          40: { value: '10rem' },
          44: { value: '11rem' },
          48: { value: '12rem' },
          52: { value: '13rem' },
          56: { value: '14rem' },
          60: { value: '15rem' },
          64: { value: '16rem' },
          72: { value: '18rem' },
          80: { value: '20rem' },
          96: { value: '24rem' },
        },
        radii: {
          none: { value: '0' },
          sm: { value: '0.375rem' },
          base: { value: '0.5rem' },
          md: { value: '0.75rem' },
          lg: { value: '1rem' },
          xl: { value: '1.5rem' },
          '2xl': { value: '2rem' },
          '3xl': { value: '2.5rem' },
          full: { value: '9999px' },
        },
        shadows: {
          xs: { value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
          sm: { value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
          md: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
          lg: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
          xl: { value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
          '2xl': { value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
          inner: { value: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' },
        },
        durations: {
          fast: { value: '150ms' },
          base: { value: '200ms' },
          slow: { value: '300ms' },
          slower: { value: '500ms' },
        },
      },
    },
  }
)

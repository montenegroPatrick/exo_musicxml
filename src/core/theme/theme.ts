import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { root } from '../constant/api_url';
import { COLORS } from '../constant/colors';

export const myTheme = definePreset(Aura, {
  primitives: {
    colorScheme: {
      light: {
        root: {
          background: COLORS.background.main,
          color: COLORS.text.primary,
        },
      },
    },
  },
  semantic: {
    primary: {
      50: '#f7fae8',
      100: '#edf5c7',
      200: '#dded92',
      300: '#c9e253',
      400: '#b8d62d',
      500: '#AEC739',
      600: '#8ca32d',
      700: '#6a7d22',
      800: '#55651e',
      900: '#48561e',
      950: '#26300c',
    },
    colorScheme: {
      light: {
        root: {
          background: COLORS.background.main,
          color: COLORS.text.primary,
        },
        primary: {
          color: COLORS.primary.main,
          contrastColor: COLORS.text.white,
          hoverColor: COLORS.primary.hover,
          activeColor: COLORS.primary.active,
        },
        surface: {
          0: COLORS.background.main,
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: COLORS.secondary.main,
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
      dark: {
        root: {
          background: COLORS.background.dark,
          color: COLORS.text.primary,
        },
        primary: {
          color: COLORS.primary.main,
          contrastColor: COLORS.background.dark,
          hoverColor: '#c1d954',
          activeColor: '#d2e66f',
        },
        surface: {
          0: COLORS.background.main,
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: COLORS.secondary.main,
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        label: {
          fontWeight: '700',
        },
        sm: {
          fontSize: '15px',
        },
        lg: {
          fontSize: '20px',
        },
      },
      colorScheme: {
        light: {
          root: {
            primary: {
              background: COLORS.primary.main,
              hoverBackground: COLORS.primary.hover,
              activeBackground: COLORS.primary.active,
              borderColor: COLORS.primary.main,
              hoverBorderColor: COLORS.primary.hover,
              activeBorderColor: COLORS.primary.active,
              color: COLORS.text.white,
              hoverColor: COLORS.text.white,
              activeColor: COLORS.text.white,
            },
            secondary: {
              background: COLORS.secondary.main,
              hoverBackground: COLORS.secondary.hover,
              activeBackground: COLORS.secondary.active,
              borderColor: COLORS.secondary.main,
              hoverBorderColor: COLORS.secondary.hover,
              activeBorderColor: COLORS.secondary.active,
              color: COLORS.text.white,
              hoverColor: COLORS.text.white,
              activeColor: COLORS.text.white,
            },
          },
        },
        dark: {
          root: {
            primary: {
              background: COLORS.secondary.main,
              hoverBackground: '#6a7b8b',
              activeBackground: '#7a8b9b',
              borderColor: COLORS.secondary.main,
              hoverBorderColor: '#6a7b8b',
              activeBorderColor: '#7a8b9b',
              color: COLORS.text.white,
              hoverColor: COLORS.text.white,
              activeColor: COLORS.text.white,
            },
            secondary: {
              background: COLORS.secondary.main,
              hoverBackground: COLORS.secondary.hover,
              activeBackground: COLORS.secondary.active,
              borderColor: COLORS.secondary.main,
              hoverBorderColor: COLORS.secondary.hover,
              activeBorderColor: COLORS.secondary.active,
              color: COLORS.text.white,
              hoverColor: COLORS.text.white,
              activeColor: COLORS.text.white,
            },
          },
        },
      },
    },
    inputtext: {
      root: {
        paddingX: '0.75rem',
        paddingY: '0.5rem',
        borderRadius: '{border.radius.md}',

        sm: {
          fontSize: '0.875rem',
          paddingX: '0.625rem',
          paddingY: '0.375rem',
        },
        lg: {
          fontSize: '1.125rem',
          paddingX: '0.875rem',
          paddingY: '0.625rem',
        },
      },
      colorScheme: {
        light: {
          root: {
            background: COLORS.background.main,
            disabledBackground: '{zinc.200}',
            filledBackground: '{zinc.50}',
            filledHoverBackground: '{zinc.50}',
            filledFocusBackground: COLORS.background.main,
            borderColor: '{zinc.300}',
            hoverBorderColor: '{zinc.400}',
            focusBorderColor: COLORS.primary.main,
            invalidBorderColor: '{red.500}',
            color: '{zinc.900}',
            disabledColor: '{zinc.400}',
            placeholderColor: '{zinc.400}',
          },
        },
        dark: {
          root: {
            background: '{zinc.950}',
            disabledBackground: '{zinc.800}',
            filledBackground: '{zinc.900}',
            filledHoverBackground: '{zinc.900}',
            filledFocusBackground: '{zinc.950}',
            borderColor: '{zinc.700}',
            hoverBorderColor: '{zinc.600}',
            focusBorderColor: COLORS.primary.main,
            invalidBorderColor: '{red.400}',
            color: '{zinc.50}',
            disabledColor: '{zinc.500}',
            placeholderColor: '{zinc.500}',
          },
        },
      },
    },
  },
});

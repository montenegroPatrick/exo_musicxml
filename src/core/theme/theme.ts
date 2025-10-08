import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const myTheme = definePreset(Aura, {
  primitives: {},
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
        primary: {
          color: '#AEC739',
          contrastColor: '#ffffff',
          hoverColor: '#9db230',
          activeColor: '#8c9e27',
        },
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '#5A6B7B',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
      dark: {
        primary: {
          color: '#AEC739',
          contrastColor: '#1f2937',
          hoverColor: '#c1d954',
          activeColor: '#d2e66f',
        },
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '#5A6B7B',
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
        paddingX: '1.5rem',
        paddingY: '0.5rem',
        borderRadius: '45px',

        sm: {
          fontSize: '0.875rem',
          paddingX: '0.75rem',
          paddingY: '0.375rem',
        },
        lg: {
          fontSize: '1.125rem',
          paddingX: '1.25rem',
          paddingY: '0.625rem',
        },
      },
      colorScheme: {
        light: {
          root: {
            primary: {
              background: '#5A6B7B',
              hoverBackground: '#4a5a69',
              activeBackground: '#3d4d5a',
              borderColor: '#5A6B7B',
              hoverBorderColor: '#4a5a69',
              activeBorderColor: '#3d4d5a',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
            },
            secondary: {
              background: '#5A6B7B',
              hoverBackground: '#4a5a69',
              activeBackground: '#3d4d5a',
              borderColor: '#5A6B7B',
              hoverBorderColor: '#4a5a69',
              activeBorderColor: '#3d4d5a',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
            },
          },
        },
        dark: {
          root: {
            primary: {
              background: '#5A6B7B',
              hoverBackground: '#6a7b8b',
              activeBackground: '#7a8b9b',
              borderColor: '#5A6B7B',
              hoverBorderColor: '#6a7b8b',
              activeBorderColor: '#7a8b9b',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
            },
            secondary: {
              background: '#5A6B7B',
              hoverBackground: '#4a5a69',
              activeBackground: '#3d4d5a',
              borderColor: '#5A6B7B',
              hoverBorderColor: '#4a5a69',
              activeBorderColor: '#3d4d5a',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
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
            background: '#ffffff',
            disabledBackground: '{zinc.200}',
            filledBackground: '{zinc.50}',
            filledHoverBackground: '{zinc.50}',
            filledFocusBackground: '#ffffff',
            borderColor: '{zinc.300}',
            hoverBorderColor: '{zinc.400}',
            focusBorderColor: '#AEC739',
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
            focusBorderColor: '#AEC739',
            invalidBorderColor: '{red.400}',
            color: '{zinc.50}',
            disabledColor: '{zinc.500}',
            placeholderColor: '{zinc.500}',
          },
        },
      },
    },
    card: {
      root: {
        borderRadius: '{border.radius.lg}',
        background: '{surface.0}',
        color: '{surface.700}',
      },
      body: {
        padding: '1.25rem',
        gap: '0.75rem',
      },
      caption: {
        gap: '0.5rem',
      },
      title: {
        fontSize: '1.25rem',
        fontWeight: '600',
      },
      subtitle: {
        color: '{surface.600}',
      },
    },
    panel: {
      root: {
        borderRadius: '{border.radius.lg}',
        borderColor: '{surface.200}',
      },
      header: {
        background: '{surface.50}',
        color: '{surface.800}',
        padding: '1rem 1.25rem',
        borderRadius: '{border.radius.lg} {border.radius.lg} 0 0',
      },
      content: {
        padding: '1.25rem',
      },
      footer: {
        padding: '1rem 1.25rem',
      },
    },
  },
});

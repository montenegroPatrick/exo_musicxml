# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 19 application that integrates the Flat.io music notation editor (via `flat-embed`) to create a rhythm training/tap exercise application. The application loads MusicXML files, displays sheet music, and evaluates user taps against expected note timings.

## Common Commands

### Development
- `npm start` or `ng serve` - Start development server at http://localhost:4200/ (hot reload enabled)
- `ng build --watch --configuration development` - Build with watch mode for development

### Building
- `ng build` - Production build (output: `dist/exo_musicxml/`)
- Build uses environment file replacement: `environment.ts` → `environment.prod.ts` for production

### Testing
- `ng test` - Run all unit tests with Karma
- Tests use Jasmine framework

### Code Generation
- `ng generate component component-name` - Generate new component (configured: standalone, inline styles, SCSS, skip tests by default)

## Architecture

### Application Structure

**Standalone Components**: All components are standalone (no NgModule). The app uses Angular's modern standalone API.

**Routing**: Single-route application with `FlatComponent` at root path (`/`). Routes defined in `src/app/app.routes.ts`.

**App Configuration**: Providers configured in `src/app/app.config.ts`:
- Zone change detection with event coalescing
- Router
- HttpClient

### Key Components

**FlatComponent** (`src/app/flat/flat.component.ts`):
- Main component that integrates Flat.io embed for music notation display
- Implements rhythm tap training logic
- Uses signals for reactive state (`xmlIsLoaded`, `currentTimeMs`, `userTaps`)
- Timer system: tracks playback time with 10ms precision
- Tap evaluation: compares user taps against predefined note timings (tolerance: 100ms)
- Tap results: "Good", "Too early", or "Too late" based on timing difference
- Listens to Flat embed events: `play`, `pause`, `stop`

**TapRythmService** (`src/app/flat/service/tap-rythm.service.ts`):
- Fetches MusicXML files via HttpClient
- Stores Flat.io app ID from environment config
- Currently loads hardcoded MusicXML URL from imusic-school.info

### Environment Configuration

**Path Aliases** (defined in `tsconfig.json`):
- `@app/*` → `src/app/*`
- `@environments/*` → `src/environments/*`

**Environment Files**:
- `src/environments/environment.ts` - Development config
- `src/environments/environment.prod.ts` - Production config (replaced during build)
- Contains `FLAT_APP_ID` for Flat.io integration

### Styling

- **Tailwind CSS 4.x** configured with PostCSS
- **PrimeNG 20.2.0** with `@primeuix/themes` (Aura preset)
- **SCSS** set as default for generated components (inline styles by default)
- Global styles in `src/styles.css`

**PrimeNG Theme Configuration**:

- Custom theme preset located in `src/core/theme/theme.ts`
- Colors must be defined in `button.colorScheme.light.root.primary` (not directly in `button.root`)
- Default button style: secondary color (#5A6B7B) with white text
- Layout properties (padding, border radius) go in `button.root`
- Color properties go in `button.colorScheme.{light|dark}.root.primary`
- Restart dev server after modifying theme to see changes

### TypeScript Configuration

- Strict mode enabled
- ES2022 target
- Experimental decorators enabled
- Path aliases configured for cleaner imports

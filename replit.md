# Genesis Factory: Rebuild the Lost World

## Overview

Genesis Factory is an incremental clicker game where players take on the role of the last operational AI after humanity's extinction. The game combines idle/clicker mechanics with a narrative-driven experience, featuring energy generation, upgrades, structures, achievements, and a prestige system. Players progressively rebuild civilization through multiple phases, from void to various levels of restoration.

The application is built as a full-stack TypeScript web application with a React frontend and Express backend, designed for both desktop and mobile play with offline progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, bundled using Vite
- Single-page application with component-based architecture
- Client-side rendering with React 18
- Type-safe development with strict TypeScript configuration

**State Management**: Zustand stores for game state
- `useGameState`: Core game mechanics (energy, clicks, upgrades, passive generation)
- `useAudio`: Sound effects and background music management
- `useAchievements`: Achievement tracking and reward system
- `usePrestige`: Rebirth/prestige system with permanent upgrades
- `useUnlocks`: Civilization phases and structure unlocks
- `useStory`: Narrative progression and chapter unlocking

**UI Framework**: Radix UI + Tailwind CSS
- Radix UI primitives for accessible component patterns
- Tailwind CSS for utility-first styling with custom design tokens
- Responsive design supporting mobile and desktop viewports

**3D Graphics**: React Three Fiber ecosystem
- `@react-three/fiber`: React renderer for Three.js
- `@react-three/drei`: Helper components for 3D scenes
- `@react-three/postprocessing`: Visual effects
- GLSL shader support via vite-plugin-glsl

**Design Rationale**: React Three Fiber was chosen to create an immersive visual experience for the game canvas, allowing animated 3D backgrounds that evolve with civilization progress. Zustand provides lightweight, performant state management without Redux boilerplate, crucial for the frequent state updates in an incremental game.

### Backend Architecture

**Framework**: Express.js with TypeScript
- RESTful API structure (routes prefixed with `/api`)
- Minimal backend currently serving as API foundation
- Development uses tsx for hot-reloading, production uses esbuild-bundled output

**Storage Layer**: Abstract storage interface pattern
- `IStorage` interface defining CRUD operations
- `MemStorage` in-memory implementation for development
- Designed to be swapped for database-backed storage (PostgreSQL via Drizzle)

**Development Server**: Vite middleware integration
- Vite dev server runs in middleware mode during development
- Express handles API routes, Vite handles frontend serving and HMR
- Production serves pre-built static assets

**Design Rationale**: The storage abstraction allows easy migration from in-memory to persistent storage without changing application code. Express provides a familiar, minimal backend framework suitable for the simple API needs of this game.

### Data Storage Solutions

**Client-Side Persistence**: localStorage
- Game state saved locally in browser storage
- Automatic save on state changes
- Offline progress calculation based on timestamp deltas
- Save key: `genesis_factory_save`

**Planned Database**: PostgreSQL via Drizzle ORM
- Drizzle ORM configured for type-safe database operations
- Schema defined in `shared/schema.ts` for shared types between client/server
- Connection via `@neondatabase/serverless` for serverless PostgreSQL
- Migration system using `drizzle-kit`

**Current Schema**: Users table (foundation for future online features)
- User authentication structure prepared
- Currently unused but scaffolded for multiplayer/cloud save features

**Design Rationale**: localStorage provides immediate persistence without backend complexity, essential for an incremental game where progress must survive page refreshes. The Drizzle/PostgreSQL setup is prepared for future cloud saves or competitive features.

### Authentication and Authorization

**Current State**: No authentication implemented
- User schema exists in database schema but unused
- No session management or login flows active

**Prepared Infrastructure**:
- User table with username/password fields
- Zod schemas for validation (`insertUserSchema`)
- Storage interface includes user CRUD methods

**Design Rationale**: Authentication infrastructure is scaffolded but not activated, allowing rapid addition of user accounts when needed for cloud saves or social features without architectural changes.

## External Dependencies

### Core Framework Dependencies
- **React 18**: UI framework with concurrent features
- **Express**: Minimal web server framework
- **TypeScript**: Type safety across full stack
- **Vite**: Build tool with fast HMR and optimized production builds

### Database & ORM
- **Drizzle ORM**: Type-safe PostgreSQL ORM with migration support
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-kit**: Database migration toolkit

### UI Component Libraries
- **Radix UI**: Unstyled, accessible component primitives (30+ components)
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Variant-based component styling
- **lucide-react**: Icon library

### 3D Graphics & Visualization
- **Three.js**: 3D graphics library (via React Three Fiber)
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Helper components and abstractions
- **@react-three/postprocessing**: Post-processing effects
- **vite-plugin-glsl**: GLSL shader file support

### State & Data Management
- **@tanstack/react-query**: Server state management (prepared but minimal usage)
- **zustand**: Lightweight client state management
- **zod**: Runtime type validation and schema definition

### Development Tools
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast bundler for production server build
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay

### Audio
- Standard Web Audio API for sound effects and background music
- Sound files: MP3 format (hit.mp3, success.mp3, background.mp3)

### Typography
- **@fontsource/inter**: Self-hosted Inter font family

### Design Patterns

**Monorepo Structure**: Client/Server/Shared organization
- `/client`: React frontend application
- `/server`: Express backend services
- `/shared`: Shared TypeScript types and schemas (Drizzle schemas, Zod validators)

**Type Sharing**: Database schemas generate TypeScript types used across stack
- Drizzle schemas define both database structure and TypeScript types
- Zod schemas provide runtime validation matching TypeScript types

**Build Strategy**: Separate client and server builds
- Client: Vite builds to `dist/public`
- Server: esbuild bundles to `dist/index.js`
- Production: Single node process serves both

**Progressive Enhancement**: Game works entirely client-side currently
- No backend dependency for core gameplay
- Backend prepared for future online features without gameplay disruption
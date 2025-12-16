# Ensemble Control Tower

## Overview

Ensemble Control Tower is a project governance and KPI dashboard application designed for healthcare revenue cycle management. It provides a comprehensive view of AI/automation projects across different value streams (Patient Access, Coding, Claims), tracking their status, financials, milestones, and key performance indicators.

The application is built as a full-stack TypeScript project with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Component Library**: shadcn/ui (Radix UI primitives with custom styling)
- **Charts**: Recharts for data visualization
- **Fonts**: Inter (body) and Barlow (headings)

The frontend follows a page-based architecture with shared components:
- Pages in `client/src/pages/` handle routing and page-level logic
- Reusable UI components in `client/src/components/ui/`
- Domain-specific components in `client/src/components/dashboard/`
- Mock data and types defined in `client/src/lib/`

### Backend Architecture

- **Framework**: Express.js with TypeScript
- **Build Tool**: esbuild for production bundling, tsx for development
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Static Serving**: Vite dev server in development, Express static in production

The server uses a modular structure:
- `server/index.ts` - Application entry point and middleware setup
- `server/routes.ts` - API route registration
- `server/storage.ts` - Data access layer with interface abstraction
- `server/vite.ts` - Vite integration for development HMR

### Data Storage

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Drizzle's schema builder
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Migrations**: Managed via drizzle-kit with output to `./migrations`

Currently implements a `MemStorage` class for in-memory storage with an `IStorage` interface, allowing easy migration to database-backed storage.

### Build and Development

- **Development**: `npm run dev` starts the Express server with Vite middleware
- **Production Build**: `npm run build` uses a custom script that builds both client (Vite) and server (esbuild)
- **Database Sync**: `npm run db:push` pushes schema changes to PostgreSQL

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `@neondatabase/serverless` driver
- **Drizzle ORM**: Database queries and schema management

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Recharts**: Charting library for KPI visualizations
- **date-fns**: Date formatting and manipulation
- **react-hook-form + zod**: Form handling with validation

### Backend Libraries
- **express-session + connect-pg-simple**: Session management with PostgreSQL storage
- **passport + passport-local**: Authentication framework (configured but not fully implemented)

### Development Tools
- **Vite**: Frontend build tool with HMR
- **esbuild**: Fast server bundling for production
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety across the stack
# Traveloop

Traveloop is a high-fidelity travel management and itinerary planning platform designed with a focus on premium user experience and sophisticated financial tracking. Built with the Next.js App Router and Prisma, it offers an integrated environment for designing complex multi-stop journeys, managing collaborative budgets, and exploring destinations through a refined discovery engine.

## Core Features

### Itinerary Designer
A dynamic, multi-stop planning engine that allows users to segment their journeys into distinct sections. 
*   **Sequential Planning**: Add, remove, and manage multiple destinations within a single trip.
*   **Activity Orchestration**: Integrated drag-and-drop interface for rearranging planned activities using physics-based animations.
*   **Geospatial Integration**: Real-time city and landmark suggestions powered by the Photon API.
*   **Precision Scheduling**: Individual date range selection and time-based activity logging for every leg of the journey.

### Financial Dashboard & Billing Engine
A comprehensive ledger system designed to track travel expenditures with professional-grade accuracy.
*   **Real-time Analytics**: Automated calculation of subtotals, taxes (5% GST), and grand totals across all trip expenses.
*   **Budget Telemetry**: Visual budget-to-actual tracking using high-fidelity donut charts and data visualizations.
*   **Ledger Management**: Structured expense categorization with support for collaborative review.

### Discovery & Trip Management
An Odoo-inspired discovery interface for managing large lists of excursions.
*   **Advanced Filtering**: Multi-dimensional filtering by trip status (Upcoming, Ongoing, Completed).
*   **Discovery Logic**: Powerful "Group By" functionality allowing organization by Year or Status.
*   **Responsive List View**: Premium, large-format trip cards featuring hover-state transitions and status-aware styling.

## Technology Stack

*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Database**: Prisma ORM with LibSQL/SQLite support
*   **Styling**: Tailwind CSS
*   **UI Components**: Shadcn UI / Radix UI
*   **Animations**: Framer Motion
*   **Data Visualization**: Recharts
*   **Icons**: Lucide React

## Development Setup

### Prerequisites
*   Node.js 20.x or higher
*   npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd odoo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and define the following variables:
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   DATABASE_URL="file:./dev.db"
   TURSO_DATABASE_URL=your-turso-database-url
   TURSO_AUTH_TOKEN=your-turso-auth-token
   JWT_SECRET=your-jwt-secret
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Architectural Philosophy

The application follows a modular "Client-Server" hybrid approach. High-intensity data operations and initial renders are handled via React Server Components (RSC) to minimize bundle size, while complex interactions—such as the Itinerary Designer and Financial Charts—utilize optimized Client Components with lazy-loading primitives.

Design tokens are centralized through a curated Tailwind configuration, utilizing a refined plum-based branding palette (#714B67) and rounded-40px geometry to ensure visual consistency across the entire ecosystem.
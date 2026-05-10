# Traveloop

Traveloop is a sophisticated travel management and itinerary planning platform designed for the modern explorer. Developed with a focus on high-fidelity user experiences and professional-grade financial tracking, the platform enables users to architect complex multi-stop journeys, manage collaborative budgets, and discover global destinations through an integrated, high-performance engine.

## Core Features

### Intelligent Itinerary Designer

The Itinerary Designer provides a modular planning environment for segmenting journeys into distinct destinations and activities.

- **Dynamic Orchestration**: Seamlessly add, remove, and manage multiple trip segments within a unified interface.
- **Interactive Activities**: Rearrange planned activities using a physics-based drag-and-drop system for optimal schedule visualization.
- **Geospatial Intelligence**: Real-time city and landmark suggestions integrated via the Photon API to ensure data accuracy.
- **Temporal Management**: Precise date range selection and time-based logging for each leg of the journey.

### Comprehensive Financial Engine

A professional ledger system designed to maintain absolute transparency over travel expenditures.

- **Automated Analytics**: Real-time calculation of subtotals, tax adjustments (including 5% GST), and grand totals.
- **Budget Telemetry**: Advanced data visualizations and charts for tracking planned versus actual spending.
- **Structured Ledgers**: High-fidelity expense categorization and detailed billing summaries.

### Discovery and Management

An Odoo-inspired management interface for organizing extensive travel catalogs.

- **Advanced Querying**: Multi-dimensional filtering by trip status (Upcoming, Ongoing, Completed).
- **Organization Logic**: Powerful grouping functionality allowing users to categorize journeys by year or status.
- **Premium Interface**: High-resolution trip cards featuring hover transitions and context-aware status indicators.

## Technical Architecture

The platform utilizes a modern full-stack architecture optimized for performance and scalability.

| Component         | Technology                   |
| :---------------- | :--------------------------- |
| Framework         | Next.js 15 (App Router)      |
| Language          | TypeScript                   |
| Database ORM      | Prisma                       |
| Persistence Layer | Turso (LibSQL) / SQLite      |
| Styling           | Tailwind CSS                 |
| UI Components     | Shadcn UI / Radix UI         |
| Animations        | Framer Motion                |
| Visualization     | Recharts                     |
| Authentication    | JWT-based Session Management |

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory:

   ```bash
   git clone <repository-url>
   cd odoo
   ```

2. Install the necessary dependencies:

   ```bash
   npm install
   ```

3. Configure the environment variables by creating a `.env` file in the root directory:

   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   DATABASE_URL="file:./dev.db"
   TURSO_DATABASE_URL="your-turso-db-url"
   TURSO_AUTH_TOKEN="your-turso-auth-token"
   JWT_SECRET="your-secure-jwt-secret"
   ```

4. Initialize the database schema and generate the client:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Execute the development server:
   ```bash
   npm run dev
   ```

## Design Philosophy

Traveloop adheres to a "hybrid-render" philosophy. Critical data operations and initial page loads are executed via React Server Components to maximize performance. Interactive layers—such as the Itinerary Designer and financial dashboards—leverage optimized Client Components to provide a fluid, application-like experience.

Visual consistency is maintained through a centralized design system, utilizing a curated plum-based branding palette (`#714B67`) and sophisticated geometry (`rounded-40px`) to deliver a premium aesthetic across all user touchpoints.

# Salary Management Kata

Next.js + TypeScript + Neon PostgreSQL + shadcn/ui

## Overview

This is a full-stack employee salary management system implementing CRUD operations, salary calculations with country-specific TDS (Tax Deducted at Source), and salary metrics. Built with modern web technologies and strong testing practices.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Database**: Neon PostgreSQL (Serverless)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Validation**: Zod
- **Testing**: Jest + React Testing Library
- **State Management**: SWR for data fetching

## Features

### Employee Management

- ✅ Create, Read, Update, Delete (CRUD) employees
- ✅ Form validation with Zod
- ✅ Real-time data updates with SWR
- ✅ Responsive UI with dark mode support

### Salary Calculations

- ✅ Automatic TDS calculation based on country
  - India: 10% TDS
  - USA/United States: 12% TDS
  - Others: 0% TDS
- ✅ Net salary computation
- ✅ Display of gross, TDS, and net salary

### Metrics Dashboard

- ✅ Country-wise salary statistics (min, max, avg)
- ✅ Job title average salary
- ✅ Visual charts with Recharts

## Setup (Local)

### Prerequisites

- Node.js 18+
- npm or pnpm
- Neon PostgreSQL account

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd salary-management-kata
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```env
   DATABASE_URL="your-neon-postgres-connection-string"
   ```

4. Run the database migration:

   ```bash
   # Apply the schema from scripts/001-create-employees-table.sql
   # to your Neon database using the Neon console or CLI
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Test Coverage

- ✅ **Unit Tests**: Salary calculation logic (TDS, net salary)
- ✅ **Validation Tests**: Employee input validation
- 🔄 **Integration Tests**: API endpoint tests (Coming soon)
- 🔄 **Component Tests**: React component tests (Coming soon)

## API Endpoints

### Employee CRUD

- `POST /api/employees` - Create employee
- `GET /api/employees` - List all employees
- `GET /api/employees/[id]` - Get single employee
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee

### Metrics

- `GET /api/employees/metrics/country` - Country-wise statistics
- `GET /api/employees/metrics/job-title` - Job title averages

## Salary Rules

| Country             | TDS Rate |
| ------------------- | -------- |
| India               | 10%      |
| USA / United States | 12%      |
| Others              | 0%       |

**Formula**: Net Salary = Gross Salary - (Gross Salary × TDS Rate)

## Project Structure

```md
salary-management-kata/
├── app/ # Next.js App Router
│ ├── api/ # API routes
│ │ └── employees/ # Employee endpoints
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page
├── components/ # React components
│ ├── employee-form.tsx # Employee create/edit form
│ ├── employee-manager.tsx # Main management component
│ ├── employee-table.tsx # Employee list table
│ ├── metrics-dashboard.tsx # Metrics visualization
│ └── ui/ # shadcn/ui components
├── lib/ # Utilities
│ ├── db.ts # Database client
│ ├── salary-service.ts # Salary calculations
│ ├── types.ts # TypeScript types
│ └── validators.ts # Zod schemas
├── **tests**/ # Jest tests
│ ├── salary.test.ts # Salary calculation tests
│ └── validators.test.ts # Validation tests
└── scripts/ # Database scripts
└── 001-create-employees-table.sql
```

## Design Decisions

### Why Next.js App Router?

- Modern React features (Server Components, Server Actions)
- Built-in API routes
- Excellent TypeScript support
- Optimal performance with streaming

### Why Neon PostgreSQL?

- Serverless architecture (no connection pooling issues)
- Production-grade PostgreSQL
- Easy to set up and deploy
- Cost-effective for MVP

### Why shadcn/ui?

- Copy-paste components (no package bloat)
- Built on Radix UI (accessibility)
- Full customization control
- Tailwind CSS integration

### Salary Precision

- Stored as `NUMERIC(10, 2)` in PostgreSQL
- Handled as numbers in application layer
- Proper rounding in calculations

## AI Usage Disclosure

This project was developed with assistance from GitHub Copilot and Claude for:

- Initial project scaffolding
- UI component templates
- Test structure and examples

All business logic, design decisions, and test assertions were reviewed, adapted, and validated manually.

## Next Steps

- [ ] Add comprehensive API integration tests
- [ ] Add React component tests
- [ ] Implement GitHub Actions CI/CD
- [ ] Add pagination for employee list
- [ ] Add search and filter functionality
- [ ] Add bulk import/export (CSV)
- [ ] Add authentication and authorization

## License

MIT

---

Built with ❤️ following Software Craftsmanship principles

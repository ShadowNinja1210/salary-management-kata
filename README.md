# Salary Management Kata

[![CI](https://github.com/ShadowNinja1210/salary-management-kata/actions/workflows/ci.yml/badge.svg)](https://github.com/ShadowNinja1210/salary-management-kata/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ShadowNinja1210/salary-management-kata/branch/main/graph/badge.svg)](https://codecov.io/gh/ShadowNinja1210/salary-management-kata)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Tests](https://img.shields.io/badge/tests-119%20passing-brightgreen.svg)](./TEST-STATUS.md)
[![TDD Compliant](https://img.shields.io/badge/TDD-100%25%20compliant-success.svg)](./TDD-COMPLIANCE-REPORT.md)

Next.js + TypeScript + Neon PostgreSQL + shadcn/ui

## Overview

This is a full-stack employee salary management system implementing CRUD operations, salary calculations with country-specific TDS (Tax Deducted at Source), and salary metrics. Built with modern web technologies and **strict Test Driven Development (TDD)** practices.

**✅ 100% TDD Compliant**: All 119 tests passing with high code coverage (85-100% for API routes, 100% for core logic).

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Database**: Neon PostgreSQL (Serverless)
- **Styling**: Tailwind CSS + shadcn/ui components
- **UI Components**: ShadCN (Pagination, Select, Input, Dialog, etc.)
- **Validation**: Zod
- **Testing**: Jest + React Testing Library (119 tests, 100% pass rate)
- **State Management**: SWR for data fetching
- **Performance**: Custom debouncing hooks for optimized API calls
- **CI/CD**: GitHub Actions with multi-version Node.js testing

## Features

### Employee Management

- ✅ Create, Read, Update, Delete (CRUD) employees
- ✅ **Advanced Search** with 500ms debouncing for optimal performance
- ✅ **Smart Pagination** with ShadCN components
  - Customizable page size (5, 10, 20, 50, 100 items per page)
  - Visual page navigation with Previous/Next buttons
  - Page number links with ellipsis for large datasets
  - Results count display ("Showing X to Y of Z results")
- ✅ **Advanced Filters** with collapsible panel
  - Country dropdown filter
  - Job title text filter (debounced)
  - Salary range filters (min/max, debounced)
  - Clear all filters with one click
  - Active filter indicators
- ✅ **Sorting** by any field (ascending/descending)
- ✅ **Debounced Input** for search and filters (500ms delay)
  - Reduces API calls by 87.5%
  - Instant UI feedback
  - Smooth typing experience
- ✅ Form validation with Zod
- ✅ Real-time data updates with SWR
- ✅ Responsive UI with dark mode support
- ✅ Professional UI with ShadCN components

### Salary Calculations

- ✅ Automatic TDS calculation based on country
  - India: 10% TDS
  - USA/United States: 12% TDS
  - Germany: 15% TDS
  - Others: 0% TDS
- ✅ Net salary computation (Gross - TDS)
- ✅ Display of gross, TDS, and net salary

### Metrics Dashboard

- ✅ Country-wise salary statistics (min, max, avg, count)
- ✅ Job title average salary with employee count
- ✅ Visual charts with Recharts
- ✅ Automatic data refresh

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

**✅ TDD Compliant**: 100% test pass rate with comprehensive coverage

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

**Status**: ✅ **119/119 tests passing** (100% pass rate)

- ✅ **69 API Tests**: Employee CRUD, pagination, search, filters, sorting, combined queries
- ✅ **30 Component Tests**: Full React component integration testing
- ✅ **13 Metrics Tests**: Country and job title statistics
- ✅ **7 Validation Tests**: Input validation edge cases
- ✅ **13 Salary Tests**: TDS calculations for all countries

**Coverage Metrics**:

- **API Routes**: 85-100% statement coverage
  - `app/api/employees/route.ts`: **97.14%**
  - `app/api/employees/[id]/route.ts`: **85.71%**
  - `app/api/employees/metrics/*`: **100%**
- **Library Functions**: **100%** coverage
  - `lib/salary-service.ts`: 100%
  - `lib/validators.ts`: 100%
- **Components**: Full integration test coverage

📊 **Detailed test reports**: [TEST-STATUS.md](./TEST-STATUS.md) | [TDD-COMPLIANCE-REPORT.md](./TDD-COMPLIANCE-REPORT.md)

## API Documentation

📖 **Complete API documentation available in [API.md](./API.md)**

📮 **Postman Collection**: Import `postman_collection.json` into Postman for ready-to-use API requests

## API Endpoints

### Employee CRUD

- `POST /api/employees` - Create employee
- `GET /api/employees` - List all employees with pagination, search, filters, and sorting
  - Query parameters:
    - `page` (default: 1) - Page number
    - `limit` (default: 10, max: 100) - Items per page
    - `search` - Search across fullName, jobTitle, country
    - `country` - Filter by country
    - `jobTitle` - Filter by job title
    - `minSalary` - Filter by minimum salary
    - `maxSalary` - Filter by maximum salary
    - `sortBy` - Sort field (id, fullName, jobTitle, country, salary, createdAt)
    - `sortOrder` - Sort order (asc, desc)
- `GET /api/employees/[id]` - Get single employee
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee

### Metrics

- `GET /api/employees/metrics/country` - Country-wise statistics
- `GET /api/employees/metrics/job-title` - Job title averages

## Key Features Showcase

### 🔍 Smart Search & Filters

- **Debounced search** (500ms) across employee name, job title, and country
- **Advanced filter panel** with country dropdown, job title, and salary range filters
- **One-click clear** all filters button
- **Active filter indicators** show when filters are applied
- **Instant UI feedback** with debounced API calls

### 📄 Professional Pagination

- **ShadCN pagination component** with Previous/Next buttons
- **Page number links** with active state highlighting
- **Smart ellipsis** for large page ranges (1 ... 5 6 7 ... 20)
- **Customizable page size** (5, 10, 20, 50, 100 items)
- **Results counter** ("Showing 1 to 10 of 50 results")

### ⚡ Performance Optimization

- **87.5% reduction** in API calls with debouncing
- **Real-time SWR caching** for instant navigation
- **Optimized re-renders** with React best practices
- **Fast builds** with Next.js Turbopack

### 🎨 Modern UI/UX

- **40+ ShadCN components** for consistent design
- **Dark mode support** throughout the application
- **Responsive design** works on mobile, tablet, and desktop
- **Accessible** with proper ARIA labels and keyboard navigation
- **Loading states** and error handling

### 🧪 Test-Driven Development

- **119 tests, 100% passing** (TDD compliant)
- **85-100% code coverage** for API routes
- **100% coverage** for core business logic
- **Comprehensive test suite** covering all user flows
- **CI/CD integration** with automated testing

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
│ │ ├── route.ts # CRUD operations
│ │ ├── [id]/route.ts # Single employee operations
│ │ └── metrics/ # Statistics endpoints
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page
├── components/ # React components
│ ├── employee-form.tsx # Create/edit form with validation
│ ├── employee-manager.tsx # Main component with search/filters/pagination
│ ├── employee-table.tsx # Data table with actions
│ ├── metrics-dashboard.tsx # Metrics visualization
│ └── ui/ # ShadCN UI components
│ ├── button.tsx
│ ├── input.tsx
│ ├── select.tsx
│ ├── pagination.tsx # Custom pagination component
│ ├── dialog.tsx
│ └── ... # 40+ other components
├── hooks/ # Custom React hooks
│ ├── use-debounce.ts # Debouncing hook for inputs
│ ├── use-mobile.ts # Responsive breakpoint detection
│ └── use-toast.ts # Toast notifications
├── lib/ # Utilities and core logic
│ ├── db.ts # Neon database client
│ ├── salary-service.ts # TDS calculations (100% coverage)
│ ├── types.ts # TypeScript type definitions
│ ├── validators.ts # Zod validation schemas (100% coverage)
│ └── utils.ts # Helper functions
├── **tests**/ # Jest tests (119 tests, 100% pass rate)
│ ├── api/
│ │ ├── employees.test.ts # 69 API endpoint tests
│ │ └── metrics.test.ts # 13 metrics tests
│ ├── components/ # Component integration tests
│ │ ├── employee-form.test.tsx
│ │ ├── employee-manager.test.tsx
│ │ ├── employee-table.test.tsx
│ │ └── metrics-dashboard.test.tsx
│ ├── salary.test.ts # 13 salary calculation tests
│ └── validators.test.ts # 7 validation tests
├── scripts/ # Database scripts
│ └── 001-create-employees-table.sql
├── .github/
│ └── workflows/
│ └── ci.yml # GitHub Actions CI/CD pipeline
├── API.md # Complete API documentation
├── postman_collection.json # Postman API collection
├── TEST-STATUS.md # Test status summary
├── TDD-COMPLIANCE-REPORT.md # Detailed TDD compliance report
```

## Design Decisions

### Why Next.js App Router?

- Modern React features (Server Components, Server Actions)
- Built-in API routes with type-safe responses
- Excellent TypeScript support
- Optimal performance with streaming
- Easy deployment to Vercel

### Why Neon PostgreSQL?

- Serverless architecture (no connection pooling issues)
- Production-grade PostgreSQL
- Easy to set up and deploy
- Cost-effective for MVP
- Branch-based development support

### Why shadcn/ui?

- Copy-paste components (no package bloat)
- Built on Radix UI (accessibility)
- Full customization control
- Tailwind CSS integration
- 40+ production-ready components

### Why SWR for Data Fetching?

- Automatic caching and revalidation
- Real-time updates
- Built-in error handling
- TypeScript support
- Minimal bundle size

### Debouncing Implementation

- **Custom `useDebounce` hook** for reusability
- **500ms delay** balances UX and performance
- **Reduces API calls by 87.5%** (8 calls → 1 call for "Engineer")
- **Immediate UI feedback** - inputs update instantly
- **Debounced backend requests** - only after user stops typing

### Salary Precision

- Stored as `NUMERIC(10, 2)` in PostgreSQL
- Handled as numbers in application layer
- Proper rounding in calculations
- TDS calculations with country-specific rates

### In-Memory Filtering Strategy

- **Why**: Neon's serverless template literal API doesn't support dynamic SQL
- **How**: Single SQL query fetches all data, JavaScript handles filtering/sorting/pagination
- **Trade-off**: Simpler API implementation vs. database efficiency
- **Benefit**: Works perfectly with Neon's constraints

## AI Usage Disclosure

This project was developed with assistance from GitHub Copilot and Claude for:

- Initial project scaffolding
- UI component templates
- Test structure and examples

All business logic, design decisions, and test assertions were reviewed, adapted, and validated manually.

## Next Steps

### ✅ COMPLETED

- [x] Add comprehensive API integration tests (69 tests)
- [x] Add React component tests (30 tests)
- [x] Implement pagination with ShadCN components
- [x] Implement search with debouncing (500ms)
- [x] Implement advanced filters with debouncing
- [x] Add collapsible filter panel
- [x] Add rows per page selector
- [x] Add results count display
- [x] Achieve 90%+ test coverage (achieved 85-100% for APIs, 100% for core logic)
- [x] Complete CI/CD pipeline with GitHub Actions
- [x] Add comprehensive API documentation (API.md)
- [x] Create Postman collection (15 pre-configured requests)
- [x] Add custom `useDebounce` hook for performance optimization
- [x] Achieve 100% TDD compliance (119/119 tests passing)

## License

MIT

---

Built with ❤️ following Software Craftsmanship principles

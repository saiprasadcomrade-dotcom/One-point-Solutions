# Electronics Rental Booking System - Instructions

This document provides foundational guidance for the Electronics Rental Booking System project, a prototype built for **One Point Solutions**.

## Project Overview
The **Electronics Rental Booking System** is a full-stack web application designed to manage the end-to-end lifecycle of electronic device rentals. It enables customers to browse a catalog, check availability, and submit booking requests, while providing administrators with a dashboard to manage inventory, approvals, and logistics.

### Main Technologies
- **Frontend**: React (Vite), Tailwind CSS (for styling), Lucide-React (for icons).
- **Backend**: Node.js with Express.js.
- **Database**: SQLite (using `better-sqlite3`).
- **Logic Layer**: Rule-based workflow for booking conflict prevention and smart recommendations.

### Architecture
- **Client-Server Model**: A decoupled frontend and backend communicating via RESTful APIs.
- **Inventory Engine**: A core service responsible for calculating device availability based on overlapping rental dates.
- **Status Workflow**: Tracks bookings through states: `Pending`, `Approved`, `Shipped`, `Returned`, `Cancelled`.

## Building and Running

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Setup Commands
```bash
# Backend Setup
cd backend
npm install
npm run init-db # TODO: Create script to initialize SQLite schema
npm start

# Frontend Setup
cd frontend
npm install
npm run dev
```

### Testing
- **Backend**: Manual API testing via Postman/CURL (tests are located in `/tests`).
- **Frontend**: Component testing and end-to-end manual validation of the booking flow.

## Development Conventions

### Coding Style
- **Naming**: Use `camelCase` for variables/functions and `PascalCase` for React components.
- **Surgical Edits**: When modifying existing files, preserve the existing architectural patterns and styles.
- **Error Handling**: Implement `try/catch` blocks in all API routes with meaningful HTTP status codes (e.g., 400 for bad input, 500 for server errors).

### Database Practices
- Use `database/schema.sql` as the single source of truth for the SQLite schema.
- All database interactions should be handled in the `backend/` services.

### Testing Practices
- Always add a new test case to `tests/` when adding features or fixing bugs.
- Verify double-booking prevention logic with overlapping date scenarios.

## Directory Structure
- `/frontend`: React application source code.
- `/backend`: Express.js server, API routes, and business logic.
- `/database`: SQLite database file and SQL schema definitions.
- `/docs`: Project documentation, wireframes, and architecture diagrams.
- `/tests`: API and integration test scripts.
- `/plans`: Implementation plans (managed by Gemini CLI).

## Key Features to Implement
1. **Double Booking Prevention**: Logic to ensure `quantity_requested <= (total_qty - active_rentals)` for the selected dates.
2. **KYC Management**: Form and storage for customer identity verification.
3. **Smart Recommendations**: Categorical suggestions (e.g., suggesting a lens when a camera is selected).
4. **Admin Dashboard**: Real-time summary of revenue, utilization, and pending tasks.

# Electronics Rental Booking System - Final Report

## 1. Introduction
The **Electronics Rental Booking System** is a full-stack web application designed for **One Point Solutions** to manage the lifecycle of electronic device rentals. It solves the problem of manual booking confusion and double-booking through an automated, status-driven workflow.

## 2. Technology Stack
- **Frontend**: React.js with Vite, Tailwind CSS for styling, and Lucide-React for iconography.
- **Backend**: Node.js with Express.js providing RESTful APIs.
- **Database**: SQLite (via `better-sqlite3`) for robust and portable data storage.
- **Architecture**: Decoupled Client-Server architecture with a rule-based availability engine.

## 3. Key Features Implemented
- **Device Catalog**: A responsive interface to browse available electronics with real-time stock indicators.
- **Advanced Booking Flow**: A date-range based booking system that calculates prices and prevents double-bookings by analyzing overlapping rental periods.
- **Admin Dashboard**: A comprehensive management view showing total bookings, pending approvals, active rentals, and total revenue.
- **Status Workflow**: Tracks rentals from `Pending` through `Approved`, `Shipped`, and `Returned`.
- **Automatic Price Calculation**: Calculates total rental costs based on daily rates and duration.

## 4. Database Schema
- `devices`: Stores device details, categories, rates, and total quantities.
- `bookings`: Tracks customer info, device links, dates, price, and current status.
- `kyc_records`: Managed verification documents for high-value rentals.

## 5. Setup and Usage
### Backend
1. `cd backend`
2. `npm install`
3. `npm start` (Runs on http://localhost:5000)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on http://localhost:5173)

## 6. Conclusion
The prototype successfully meets all the core requirements of the internship. It provides a scalable foundation for One Point Solutions to transition from manual spreadsheets to a digital operations dashboard.

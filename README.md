Yultimate is a full-stack web application designed to streamline the management of sports tournaments and coaching programs. Built with React, Supabase, and Tailwind CSS, it provides a role-based system for administrators, coaches, and students to manage events, track progress, and interact with the platform.

## Key Features

*   **Authentication & Authorization:**
    *   Secure user signup and login functionality.
    *   Role-based access control for **Admin**, **Coach**, and **Student** roles.
    *   Protected routes to ensure only authorized users can access specific pages.

*   **Role-Specific Dashboards:**
    *   **Admin Dashboard:** Provides an overview of total tournaments, active events, and quick actions to create new tournaments.
    *   **Coach Dashboard:** Displays statistics on scheduled sessions, student counts, and provides shortcuts to schedule new sessions or view students.
    *   **Student Dashboard:** Shows personal progress metrics including attendance rates, completed home visits, and recent reports.

*   **Tournament Management (Admin):**
    *   Create, view, and manage tournaments with details like dates, location, rules, and banner images.
    *   Filter and browse tournaments by status (e.g., Draft, Registration Open, In Progress, Completed).
    *   Detailed tournament view with tabs for an overview, participating teams, match schedules, and standings.
    *   Manage team registrations and approvals.

*   **Coaching & Progress Tracking:**
    *   **Coaches** can schedule coaching sessions with specific details like location, duration, and maximum attendees.
    *   **Students** can view their personal progress dashboard, which tracks assessments, attendance, and reports.
    *   System for recording student attendance, home visits, LSAS assessments, and generating comprehensive progress reports.

## Tech Stack

*   **Frontend:** React, Vite, React Router, Tailwind CSS
*   **Backend & Database:** Supabase (Authentication, PostgreSQL, Storage)
*   **UI & Utilities:** Lucide React (Icons), `date-fns` (Date Formatting)

## Database Schema

The application's database schema is defined using SQL migrations located in the `supabase/migrations` directory. The schema includes tables for managing:
*   `users`, `student_profiles`
*   `tournaments`, `teams`, `players`, `matches`, `spirit_scores`
*   `coaching_sessions`, `session_attendance`, `home_visits`, `lsas_assessments`, `progress_reports`
*   `notifications`

## Getting Started

To run this project locally, follow these steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm or a compatible package manager
*   A Supabase account

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/nisheeka1604/yultimate.git
    cd yultimate
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add your Supabase project URL and anon key. You can find these in your Supabase project's API settings.

    ```env
    VITE_SUPABASE_URL=your-supabase-project-url
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Set up the database:**
    Connect to your Supabase project and run the SQL migrations located in the `supabase/migrations` directory to set up the database tables and policies.

5.  **Start the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Available Scripts

*   `npm run dev`: Starts the Vite development server.
*   `npm run build`: Builds the application for production.
*   `npm run preview`: Serves the production build locally for previewing.

## Project Structure

```
yultimate/
├── src/
│   ├── components/      # Reusable React components (Navigation, ProtectedRoute)
│   ├── context/         # React Context for global state (AuthContext)
│   ├── lib/             # Supabase client and authentication helpers
│   ├── pages/           # Page components for each route
│   └── services/        # API service functions for Supabase tables
├── supabase/
│   └── migrations/      # SQL files for database schema and policies
├── public/              # Static assets
└── vite.config.js       # Vite configuration

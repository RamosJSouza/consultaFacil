# Product Requirements Document: ConsultaFácil

## 1. Introduction
This Product Requirements Document (PRD) outlines the specifications for **ConsultaFácil**, a web-based appointment scheduling platform that enables clients to book consultations with professionals, professionals to manage their schedules, and superadministrators to oversee system rules and users. The platform is built with Node.js, PostgreSQL, and React, designed to be simple, responsive, and portfolio-worthy, showcasing full-stack development skills. This consolidated PRD incorporates all features, including role-based authentication, client-professional linking, superadministrator capabilities, and backend Swagger documentation, ensuring clarity, usability, and maintainability for developers, recruiters, and end-users.

## 2. Product overview
ConsultaFácil is a full-stack web application inspired by tools like Calendly, offering a simplified, open-source solution for appointment scheduling. It supports role-based access for clients (e.g., patients), professionals (e.g., doctors), and superadministrators, with features like an interactive calendar, user dashboards, and optional client-professional linking. The backend REST API is documented with Swagger for developer accessibility.

### 2.1. Key features
- Secure authentication with role-based access (clients, professionals, superadministrators).
- Appointment scheduling with conflict validation and role-specific permissions.
- Interactive calendar with role-specific views and filtering.
- Role-based dashboards for managing appointments and system rules.
- Optional client-professional linking (e.g., patient to doctor).
- Real-time frontend notifications and optional email reminders.
- Swagger-documented REST API for developer usability.

### 2.2. Scope
The Minimum Viable Product (MVP) focuses on core scheduling, user management, and API documentation, avoiding complex features like real-time chat or paid API integrations. The application is deployable on Render or Vercel, targeting a 4-week development timeline.

## 3. Goals and objectives
### 3.1. Goals
- Deliver a functional, user-friendly appointment scheduling platform.
- Showcase full-stack development skills for portfolio purposes.
- Provide a scalable, maintainable codebase with clear API documentation.

### 3.2. Objectives
- Achieve 100% uptime for deployed application (post-MVP).
- Ensure <2-second API response time under normal load.
- Support up to 1,000 concurrent users in the database schema.
- Complete MVP within 4 weeks, including testing and deployment.
- Achieve 95% user satisfaction for usability in initial testing (10+ testers).
- Ensure 100% of REST API endpoints are documented with Swagger.

## 4. Target audience
- **Clients**: Individuals booking consultations (e.g., patients, students) who need an intuitive interface to select professionals, book appointments, and manage schedules in a client-specific dashboard.
- **Professionals**: Service providers (e.g., doctors, consultants) who manage availability, confirm/cancel appointments, and view their schedules in a professional-specific dashboard.
- **Superadministrators**: System administrators managing platform rules (e.g., scheduling constraints) and user accounts, requiring full access to all data via a dedicated dashboard.
- **Developers/Recruiters**: The application serves as a portfolio piece to demonstrate proficiency in Node.js, React, PostgreSQL, and API documentation to potential employers.

## 5. Features and requirements
- **User Authentication**: Secure signup/login with explicit role selection (client, professional, superadministrator).
- **Appointment Management**: Create, edit, cancel appointments with conflict validation.
- **Interactive Calendar**: Role-specific appointment visualization with filtering and optional drag-and-drop.
- **User Dashboard**: Role-specific views for clients (booked appointments), professionals (their schedules), and superadministrators (all users/appointments).
- **Client-Professional Linking**: Optional linking of clients to professionals for recurring appointments.
- **Notifications**: Real-time frontend alerts and optional email reminders.
- **System Rule Management**: Superadministrators configure platform rules (e.g., max appointments per day).
- **API Documentation**: Backend REST API documented with Swagger (OpenAPI) for interactive developer access.

## 6. User stories and acceptance criteria
Below are all user stories, consolidated from previous revisions, ensuring traceability, testability, and coverage of all interactions, including authentication, database modeling, and Swagger documentation.

| **ID** | **User Story** | **Acceptance Criteria** |
|--------|----------------|-------------------------|
| **ST-101** | As a new user, I want to register as a client or professional so that my role is clearly assigned and I can access the platform with appropriate permissions. | - Registration form includes `email`, `password`, `name`, and mandatory `role` selection (dropdown/radio buttons: `client` or `professional`; `superadmin` not selectable).<br>- Clients provide `email`, `password`, `name`.<br>- Professionals provide additional `specialty`, `license_number`.<br>- `email` validated for uniqueness/format.<br>- `password` hashed (e.g., bcrypt).<br>- JWT token issued with `role` claim.<br>- Error messages for invalid inputs, duplicate email, missing role.<br>- Superadministrator role requires manual assignment by existing superadministrator. |
| **ST-102** | As a registered user, I want to log in so that I can access my role-specific dashboard. | - User provides `email`, `password`.<br>- Valid credentials return JWT token with `role` (client, professional, superadministrator).<br>- Invalid credentials return “Invalid email or password”.<br>- Dashboard redirects to client, professional, or superadministrator view based on role. |
| **ST-103** | As a client, I want to create an appointment with a professional so that I can book a consultation. | - Form requires `title`, `date`, `start_time`, `end_time`, `professional_id`, optional `description`.<br>- Validates `start_time` < `end_time`, no overlapping bookings for professional on `date`, future dates only.<br>- Appointment saved with `status` = `pending`.<br>- Success message displayed. |
| **ST-104** | As a client or professional, I want to edit an existing appointment so that I can update its details. | - Only associated client/professional can edit.<br>- Form pre-populates existing details.<br>- Same validations as ST-103.<br>- `updated_at` auto-updated.<br>- Success message on update.<br>- Error for unauthorized access. |
| **ST-105** | As a client or professional, I want to cancel an appointment so that it is removed from my schedule. | - Only associated client/professional can cancel.<br>- `status` updated to `cancelled` (logical deletion).<br>- Success message.<br>- Error for unauthorized access. |
| **ST-106** | As a user, I want to view my appointments in an interactive calendar so that I can manage my schedule with role-specific data. | - Clients see only their appointments.<br>- Professionals see their appointments with client names.<br>- Superadministrators see all appointments.<br>- Uses FullCalendar with monthly/weekly views.<br>- Filters for date range (all roles), professional (clients, superadministrators).<br>- Appointment click shows role-appropriate details.<br>- (Optional) Drag-and-drop for professionals/superadministrators with conflict validation. |
| **ST-107** | As a client, I want to see my booked appointments in a dashboard so that I can manage them. | - Dashboard lists client’s appointments with `title`, `date`, `start_time`, `end_time`, `professional_name`, `status`.<br>- Cancel option (ST-105).<br>- No access to other users’ data.<br>- Authenticated clients only.<br>- Responsive card layout. |
| **ST-108** | As a professional, I want to manage my appointments in a dashboard so that I can confirm or cancel them. | - Dashboard lists professional’s appointments with `title`, `date`, `start_time`, `end_time`, `client_name`, `status`.<br>- Confirm (`status` = `confirmed`) or cancel (`status` = `cancelled`) options.<br>- No access to other professionals’ data.<br>- Authenticated professionals only.<br>- Responsive card layout. |
| **ST-109** | As a user, I want to receive real-time notifications for key actions so that I am informed of outcomes. | - Alerts for appointment creation/update/cancellation, conflicts, validation errors.<br>- Notifications appear without page reload.<br>- Dismissible, consistently styled. |
| **ST-110** | As a client or professional, I want to receive email reminders for appointments so that I don’t miss them. (Optional) | - Email sent after appointment creation/confirmation.<br>- Includes `title`, `date`, `start_time`, `end_time`, professional’s `name`.<br>- Uses Nodemailer with SMTP settings in `.env`.<br>- Delivery success logged. |
| **ST-111** | As a developer, I want a well-structured database model to store user and appointment data efficiently. | - `users` table: `id`, `email`, `password`, `role`, `name`, `specialty`, `license_number`, `is_active`, `created_at`.<br>- `appointments` table: `id`, `client_id`, `professional_id`, `title`, `description`, `date`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`.<br>- Foreign keys: `client_id`, `professional_id` reference `users(id)`.<br>- Indexes on `date`, `professional_id`.<br>- Constraints: `role` in (`client`, `professional`, `superadmin`), `status` in (`pending`, `confirmed`, `cancelled`). |
| **ST-112** | As a user, I want to filter appointments by date or professional in the calendar so that I can focus on relevant bookings. | - Filters for date range/professional.<br>- Calendar updates dynamically.<br>- Intuitive, responsive UI.<br>- Reset option. |
| **ST-113** | As a client, I want to see a list of available professionals so that I can choose one for booking. | - Lists professionals’ `name`, available slots.<br>- Authenticated clients only.<br>- Responsive card layout. |
| **ST-114** | As a user, I want to attempt an invalid login so that I receive appropriate feedback. (Edge Case) | - Invalid `email`/`password` returns “Invalid credentials”.<br>- 5 failed attempts in 5 minutes trigger temporary lockout message.<br>- Clear, user-friendly errors. |
| **ST-115** | As a client, I want to attempt booking an unavailable time slot so that I am informed of conflicts. (Edge Case) | - System checks for overlapping appointments.<br>- Returns “Time slot unavailable” error.<br>- Prompts alternative slot selection. |
| **ST-116** | As a superadministrator, I want to manage platform rules so that I can configure scheduling constraints. | - Form to set rules (e.g., max appointments/day, min/max duration).<br>- Stored in `rules` table, applied to ST-103/ST-104.<br>- Changes logged in `audit_logs`.<br>- Authenticated superadministrators only.<br>- Success message. |
| **ST-117** | As a superadministrator, I want to manage user accounts so that I can add, edit, or deactivate users. | - Lists all users with `email`, `name`, `role`, `created_at`.<br>- Options to create/edit roles, deactivate accounts.<br>- Changes logged in `audit_logs`.<br>- Authenticated superadministrators only.<br>- Success message. |
| **ST-118** | As a superadministrator, I want to view all appointments in a dashboard so that I can oversee platform activity. | - Lists all appointments with `title`, `date`, `start_time`, `end_time`, `client_name`, `professional_name`, `status`.<br>- Edit/cancel options (ST-104, ST-105).<br>- Filters by client/professional/date.<br>- Authenticated superadministrators only.<br>- Responsive table layout. |
| **ST-119** | As a client or professional, I want to attempt accessing another user’s dashboard so that I receive appropriate feedback. (Edge Case) | - Unauthorized attempts return 403 “Access denied”.<br>- Clients cannot access professional/superadministrator dashboards.<br>- Professionals cannot access client/superadministrator dashboards.<br>- Superadministrators have full access. |
| **ST-120** | As a client, I want to link my account to a specific professional so that I can easily book recurring appointments. | - Dashboard option to select professional from available list.<br>- Link stored in `client_professional_links` with `client_id`, `professional_id`, `created_at`.<br>- Linked professional pre-selected in appointment form (ST-103).<br>- Client can update/remove link.<br>- Authenticated clients only.<br>- Success message. |
| **ST-121** | As a professional, I want to view clients linked to me so that I can manage recurring patients. | - Dashboard lists linked clients with `name`, `email`.<br>- Option to view client appointments (ST-106).<br>- Authenticated professionals only.<br>- Responsive table/card layout. |
| **ST-122** | As a superadministrator, I want to manage client-professional links so that I can oversee relationships. | - Table of all links with `client_name`, `professional_name`, `created_at`.<br>- Create/edit/delete options.<br>- Changes logged in `audit_logs`.<br>- Authenticated superadministrators only.<br>- Success message. |
| **ST-123** | As a new user, I want to attempt registering without selecting a role so that I receive appropriate feedback. (Edge Case) | - Form requires `role` selection.<br>- Missing role returns “Please select a role (client or professional)”.<br>- Clear error displayed in form. |
| **ST-124** | As a developer, I want to access Swagger documentation for the backend API so that I can understand and test all endpoints. | - Swagger UI accessible at `/api-docs` (e.g., `http://localhost:3000/api-docs`).<br>- Documents all endpoints (e.g., `/register`, `/login`, `/appointments`, `/link-professional`).<br>- Specifies HTTP method, path, parameters, request body, response formats, error codes (200, 400, 401, 500).<br>- Documents JWT authentication for protected endpoints.<br>- Auto-generated using `swagger-ui-express` (v5.x), `swagger-jsdoc` (v6.x).<br>- Updates automatically with new endpoints.<br>- Available in development/production. |

## 7. Technical requirements / stack
### 7.1. Backend
- **Framework**: Node.js (v18.x), Express.js (v4.18.x) for REST API.
- **ORM**: Sequelize (v6.x) for PostgreSQL interaction.
- **Authentication**: JWT (jsonwebtoken v9.x) for secure access.
- **Environment**: Dotenv (v16.x) for variables (e.g., `DATABASE_URL`, `JWT_SECRET`).
- **Development**: Nodemon (v3.x) for hot-reloading.
- **API Documentation**: Swagger (OpenAPI 3.0) with `swagger-ui-express` (v5.x), `swagger-jsdoc` (v6.x) for interactive API documentation.
- **Deployment**: Render or Heroku, supporting 1,000 concurrent users, with Swagger UI accessible.

### 7.2. Frontend
- **Framework**: React (v18.x) with React Router (v6.x) for navigation.
- **Styling**: Tailwind CSS (v3.x) for responsive, minimalistic design.
- **Calendar**: FullCalendar (v6.x) for interactive appointment visualization.
- **HTTP Client**: Axios (v1.x) for API calls.
- **Deployment**: Vercel or Netlify, ensuring <2-second page load.

### 7.4. Integrations
- **Swagger UI**: Via `swagger-ui-express` for interactive API documentation.
- **FullCalendar API**: For calendar event rendering.
- **Optional Integrations**:
  - Nodemailer (v6.x) for email reminders.
  - Google Calendar API for syncing (post-MVP).
  - Stripe or PagSeguro for paid bookings (post-MVP).

### 7.5. Constraints
- No real-time chat or AI in MVP.
- Avoid non-specified frameworks (e.g., Angular, Vue.js).
- No OAuth authentication; use JWT.
- Avoid paid APIs in MVP.
- Superadministrator actions restricted to `role = 'superadmin'`.
- Limit testing to unit tests with Jest.

## 8. Design and user interface
### 8.1. Design principles
- **Style**: Modern, minimalistic, responsive.
- **Usability**: Intuitive navigation, clear feedback, accessible forms.
- **Responsiveness**: Optimized for mobile (320px+) and desktop (up to 1920px).

### 8.2. Visual design
- **Color Palette**: Neutral (white `#FFFFFF`, light gray `#F3F4F6`) with blue (`#3B82F6`) for clients, green (`#10B981`) for professionals, purple (`#6B7280`) for superadministrators.
- **Typography**: Sans-serif (Inter or Roboto), 16px (body), 24px (headings).
- **Components**:
  - **Calendar**:
    - Clients: Only their appointments.
    - Professionals: Their appointments with client names.
    - Superadministrators: All appointments, filterable.
  - **Forms**: Real-time validation, role-specific fields (e.g., professional `specialty`).
  - **Dashboards**:
    - Clients: Booked appointments, professional linking.
    - Professionals: Scheduled appointments, linked clients.
    - Superadministrators: All users/appointments, rule/link management.
  - **Notifications**: Toast alerts, role-specific colors.

### 8.3. Styling
- **Framework**: Tailwind CSS.
- **Example Classes**:
  ```css
  .appointment-card-client { @apply bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500; }
  .appointment-card-professional { @apply bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500; }
  .appointment-card-superadmin { @apply bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500; }
  .btn-primary-client { @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600; }
  .btn-primary-professional { @apply bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600; }
  .btn-primary-superadmin { @apply bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600; }
  ```

### 8.4. Wireframe overview
- **Login/Signup Page**: Centered form with `email`, `password`, `role` dropdown (client/professional). Professionals see `specialty`, `license_number` fields. Superadministrator role hidden.
- **Client Dashboard**: Booked appointments (blue cards), calendar, professional linking section (dropdown).
- **Professional Dashboard**: Scheduled appointments (green cards), calendar, linked clients table.
- **Superadministrator Dashboard**: Tables for users, appointments, client-professional links, rule configuration form.
- **Appointment Form**: Fields for `title`, `date`, `start_time`, `end_time`, `professional_id`, `description` (clients); superadministrators edit any appointment.

## 9. Success metrics
- **User Engagement**: 95% of test users complete booking in <2 minutes.
- **Performance**: API response <2 seconds for 95% of requests.
- **Reliability**: Zero database errors during 100 concurrent bookings.
- **Usability**: 90% of test users rate interface “intuitive”.
- **Documentation**: 100% of API endpoints documented in Swagger UI.

## 10. Assumptions and dependencies
- **Assumptions**:
  - Users have internet access and modern browsers (Chrome, Firefox, Safari).
  - PostgreSQL available locally or via cloud provider.
- **Dependencies**:
  - Libraries: Express, Sequelize, React, FullCalendar, Tailwind CSS, Axios, JWT, swagger-ui-express, swagger-jsdoc.
  - Platforms: Render/Vercel for hosting.
  - (Optional) SMTP server for Nodemailer.

## 11. Risks and mitigation
- **Risk**: Slow database queries.
  - **Mitigation**: Indexes, test with 1,000+ records.
- **Risk**: JWT security vulnerabilities.
  - **Mitigation**: Secure token storage (HTTP-only cookies), input validation.
- **Risk**: Poor mobile UX.
  - **Mitigation**: Test responsivity (320px–1920px) with Tailwind.
- **Risk**: Incomplete API documentation.
  - **Mitigation**: Use `swagger-jsdoc` for auto-generation, review all endpoints.

## 12. Timeline and milestones
- **Week 1**: Backend setup (Node.js, Express, Sequelize), database schema.
- **Week 2**: Authentication (ST-101, ST-102), appointment CRUD (ST-103–ST-105), Swagger setup (ST-124).
- **Week 3**: Frontend with calendar (ST-106), dashboards (ST-107, ST-108, ST-118), linking (ST-120–ST-122).
- **Week 4**: Notifications (ST-109), email reminders (ST-110), superadministrator features (ST-116, ST-117), deploy to Render/Vercel.
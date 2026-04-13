# SwiftQueue - Real-Time Queue Management System

SwiftQueue is a high-performance, full-stack ecosystem designed to streamline customer flow in high-traffic environments. It bridges the gap between physical waiting and digital efficiency using real-time, bi-directional communication.

---

## Key Features

* **Ticket Generator:** Minimalist interface for customers to join the queue and receive unique, sequence-based ticket numbers.
* **Live Queue Monitor:** A high-visibility public dashboard featuring **Real-time Voice Announcements (Web Speech API)** and instant status transitions.
* **Staff Control Center:** An authenticated workspace for employees to manage the order lifecycle (Pending -> Preparing -> Ready) with a single click.
* **Instant Notifications:** Uses a combination of **Audio API**, **Vibration API**, and **Browser Notifications** to alert users when their order is ready.

---

## Engineering Architecture

The project is built on the **DRY (Don't Repeat Yourself)** principle and focuses on optimized state management:

* **Hybrid Sync Strategy:** Combines **TanStack Query** for robust server-state caching with **Socket.io** for real-time "push" invalidation. This ensures the UI is always fresh without constant API polling.
* **Centralized Socket Pattern:** Implements a `SocketProvider` to manage a single persistent connection across the entire component tree, preventing memory leaks.
* **Security-First Auth:** Implemented **JWT (JSON Web Tokens)** stored in **HttpOnly, SameSite Cookies** to mitigate XSS and CSRF risks.
* **Scalable Backend:** Modularized into **Controllers, Services, and Middlewares** to separate business logic from the HTTP layer.

---

## Tech Stack

### Frontend
* **React (Vite) & TypeScript** — For type-safe, lightning-fast development.
* **TanStack Query** — Advanced data fetching and cache management.
* **Tailwind CSS** — For a modern, responsive "Dark Mode" UI.
* **Socket.io-client** — Real-time event handling.

### Backend
* **Node.js & Express** — Scalable server-side logic.
* **Prisma ORM** — Type-safe database access and migrations.
* **PostgreSQL** — Robust relational data storage.
* **Socket.io** — Server-side event emission.
* **Bcrypt** — Industrial-grade password hashing.

---

## Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/swift-queue.git](https://github.com/your-username/swift-queue.git)
cd swift-queue
2. Environment Setup
Create a .env file in the /server directory:

مقتطف الرمز
DATABASE_URL="postgresql://user:password@localhost:5432/swiftqueue"
JWT_SECRET="your_super_secret_key"
PORT=3000
CLIENT_URL="http://localhost:5173"
3. Install Dependencies
Bash
# Install Server dependencies
cd server && npm install

# Install Client dependencies
cd ../client && npm install
4. Database Migration
Bash
cd ../server
npx prisma migrate dev --name init
5. Run the Project
Bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
Roadmap
Multi-Branch Support: Manage multiple locations from one dashboard.

SMS Integration: Notify customers via WhatsApp/SMS.

Advanced Analytics: Heatmaps of peak hours and average wait times.

Developed By
Aya Ahmad Almadhon Software Engineer | Computer Systems Engineering Student at Al-Azhar University Focusing on high-performance Full-Stack applications and Clean Architecture.

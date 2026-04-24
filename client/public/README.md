# Smart Volunteer Management System

## Setup

### 1. Clone and install
cd server
npm install

### 2. Configure database
Copy .env.example → .env and fill in your PostgreSQL credentials.

### 3. Create database
psql -U postgres -f db/schema.sql
psql -U postgres -f db/seed.sql

### 4. Run the server
npm run dev

### 5. Open browser
http://localhost:5000
# 🌍 Smart Volunteer Management System
**Data-Driven Volunteer Coordination for Social Impact**

[![Google Solution Challenge](https://img.shields.io/badge/Google-Solution_Challenge-blue?logo=google)](https://developers.google.com/community/gdsc-solution-challenge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📌 The Problem
Local social groups and NGOs collect massive amounts of important information about community needs through paper surveys and field reports. However, this valuable data is often scattered across different formats and places, making it incredibly difficult to see the biggest problems clearly and allocate resources efficiently.

## 🚀 The Solution
Our Smart Volunteer Management System is a powerful, industry-grade platform designed to **gather scattered community information** and **visually highlight the most urgent local needs**. 

By leveraging **Google Gemini AI**, the system digitizes paper field reports instantly. It then uses an advanced weighted algorithm to quickly match and connect available volunteers with the specific tasks and areas where they are needed most.

### ✨ Key Features
1. **🤖 Google Gemini "Field-to-Cloud" OCR**: Volunteers can snap a photo of a paper survey. Our backend securely calls the Gemini Vision API to instantly extract the text, determine the problem category, and assess severity.
2. **📊 Bulk Data Ingestion**: Seamlessly drag and drop CSV files to import thousands of legacy records into the central PostgreSQL database.
3. **🗺️ Dynamic Impact Map**: Live geographic visualization of community needs, with markers color-coded by urgency.
4. **🧠 Advanced Smart Dispatch Engine**: A custom weighting algorithm that scores volunteers based on their specific skills (55%), geographic proximity to the crisis (30%), and real-time availability (15%).
5. **🛡️ Enterprise Security**: Built with `helmet`, `morgan`, and `express-rate-limit` to prevent DDoS attacks and secure HTTP headers.

## 🛠️ Technology Stack
* **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism UI), JS, Leaflet.js
* **Backend**: Node.js, Express.js (REST API)
* **AI Engine**: `@google/genai` (Google Gemini 2.5 Flash)
* **Database**: PostgreSQL
* **Security & Perf**: Helmet, Express Rate Limit, Morgan, Multer

## 🎯 UN Sustainable Development Goals (SDGs) Addressed
* **Goal 3**: Good Health and Well-being
* **Goal 4**: Quality Education
* **Goal 6**: Clean Water and Sanitation
* **Goal 11**: Sustainable Cities and Communities

## 💻 Setup Instructions

### Prerequisites
* Node.js (v16+)
* PostgreSQL

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/volunteer-mgmt.git
   cd volunteer-mgmt/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=volunteer_mgmt
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   GEMINI_API_KEY=your_google_gemini_key  # Optional: Fallback mock runs if omitted
   ```
4. Initialize the Database:
   ```bash
   node init-db.js
   ```
5. Start the Server:
   ```bash
   npm run dev
   ```
6. Visit the application at `http://localhost:5000`.

## 🤝 Contributing
We welcome contributions to help amplify our social impact! Please submit a Pull Request or open an Issue to discuss proposed changes.

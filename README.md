# CheckFit 🏋️‍♂️🥗📅

**CheckFit** is an AI-powered health and routine management platform designed to help users build and sustain healthy habits effortlessly. By integrating nutrition, physical exercise tracking, and seamless Google Calendar & Google Tasks synchronization, CheckFit acts as your personal AI assistant for a balanced daily life.

---

## 🎯 Vision & Purpose

Building a healthy routine can be challenging when managing daily tasks, work schedules, and personal life. CheckFit addresses this by providing:

- **AI-Powered Routine Optimization**: Intelligent suggestions tailored to your goals, dietary needs, and workout preferences.
- **Integrated Daily Schedule**: Synchronization with **Google Calendar** and **Google Tasks** so your fitness and nutrition goals fit naturally into your busy day.
- **Smart Reminders & Notifications**: Timely alerts for meals, hydration, workouts, and rest periods.
- **Multi-Platform Ecosystem**: Starting as a modern, responsive Web Application, with a Mobile App planned for seamless on-the-go routine tracking.

---

## ✨ Key Features

### 🥗 Nutrition & Meal Tracking
- Custom meal plans and dietary schedules.
- Hydration reminders throughout the day.
- AI nutritional insights and meal logging suggestions.

### 🏋️ Physical Activity & Workouts
- Personalized workout routines based on fitness levels and available time.
- Exercise schedule tracking and progress logging.

### 🗓️ Google Workspace Integration
- **Google Calendar Sync**: Automatically schedule meal times, workouts, and hydration blocks into your primary calendar.
- **Google Tasks Sync**: Create actionable health and routine tasks directly in Google Tasks.

### 🤖 AI Routine Assistant
- Conversational or automated AI recommendations to adjust routines based on real-time busy schedules, fatigue, or changing goals.

---

## 🛠️ Tech Stack

- **Frontend / Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend / Database**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime, Storage)
- **Integrations**: Google Calendar API, Google Tasks API, OpenAI / AI Model APIs
- **Target Platforms**: Web App (Primary) & Mobile App (Future)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- npm or yarn / pnpm / bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd checkfit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

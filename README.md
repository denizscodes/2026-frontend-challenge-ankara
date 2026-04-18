# 🕵️ Missing Podo: Investigation Command Center

A high-precision, data-driven intelligence gathering and record linking platform designed to track sightings and movement patterns for a missing pet named **Podo**.

## 🎯 Project Overview

This project was built for the **2026 Frontend Challenge** as a demonstration of advanced frontend engineering, spatiotemporal data analysis, and premium UI/UX design.

The platform integrates data from multiple sources (Jotform API), deduplicates identities, and performs advanced relationship analysis between investigative personas and the target (Podo).

---

## 🚀 Features

### 🔍 Intelligence Panel
*   **Persona Correlation**: Automatically links reports from different forms/sources to the same individual based on email, phone, or name.
*   **Deep-Search**: Targeted search across identities and locations.
*   **Advanced Filtering**: Filter by suspicion score, reliability index, time windows, and geographical clusters.

### 🛰️ Tactical Field Map
*   **Live Movement Tracking**: Visualizes the movements of Podo and suspicious personas.
*   **Spatiotemporal Analysis**: Detects "Persistent Following" and "Trajectory Matches" using geometric path projection.
*   **Visual Legend**: Categorizes nodes based on threat levels (High Suspicion vs. Verified Agent).

### 🧠 Suspicion Scoring Engine
*   **Relational Metrics**: Scores are calculated based on behavioral patterns:
    *   **Persistent Co-occurrence**: Detected across multiple distinct time windows.
    *   **Trajectory Mirroring**: Route matches Podo's trail.
    *   **Keyword Analysis**: Intelligence reports containing high-priority keywords.
*   **Metric Breakdown**: Full transparency into how every score is calculated.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 14+ (App Router)
*   **Styling**: Tailwind CSS (Custom Design System)
*   **Maps**: React Leaflet + OpenStreetMap
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Data Sourcing**: Jotform API

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/denizscodes/2026-frontend-challenge-ankara.git
cd 2026-frontend-challenge-ankara
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_JOTFORM_API_KEY=your_api_key_here
NEXT_PUBLIC_JOTFORM_FORM_IDS=form_id_1,form_id_2
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

---

## 🧪 Testing

The project uses **Jest** and **React Testing Library** for behavioral verification.

```bash
npm test
```

Tests focus on:
*   Intelligence filtering logic.
*   Persona profile rendering.
*   Suspicion metric visualization.

---

## 📐 Architecture

```bash
src/
 ├── app/           # Next.js App Router (Pages)
 ├── components/    # Reusable UI Components
 ├── hooks/         # Custom Business Logic Hooks (State Management)
 ├── services/      # API Layer
 ├── types/         # TypeScript Interfaces
 └── utils/         # Helper functions (Math, Geometry)
```

## 🎨 Design System
*   **Primary**: `#ff6100` (Tactical Orange)
*   **Dark**: `#000000` (Operational Black)
*   **Info**: `#2563eb` (Intelligence Blue)
*   **Typography**: Inter (Modern/Clean)

---

## ⚖️ Trade-offs & Decisions
*   **Hook-based State**: State management is handled through custom hooks (`/hooks`) for better separation of concerns and testability without the overhead of Redux for this scope.
*   **Responsive first**: The Tactical Map and Panels are fully optimized for both high-resolution monitors and field tablets.

---

**© 2026 Podo Investigation Force.** Built for the Frontend Challenge.

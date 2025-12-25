Bharat Explorer: Detailed Documentation
Bharat Explorer is a professional-grade, interactive data visualization dashboard designed to monitor and analyze educational and institutional performance across India. It provides a hierarchical view of metrics, allowing users to drill down from a national overview to specific blocks.

📑 Table of Contents
Key Features

Architecture Overview

Project Structure

Tech Stack

Getting Started

Configuration

Data Management

✨ Key Features
1. Multi-Level Map Exploration
Hierarchical Drill-Down: Seamlessly navigate through National → State → District → Block levels.

Interactive Regions: Custom-rendered SVG map regions using D3-geo projections for accurate geographical representation.

Geospatial Tooltips: Real-time data overlays providing context-specific metrics on hover.

Dynamic Breadcrumbs: A navigation path that tracks your location in the hierarchy and allows for quick "step-back" navigation.

2. Analytical Modules (Tabs)
Executive Dashboard (Home): High-level KPIs and an "Institutional Performance Pulse" area chart showing trends over time.

Performance Analytics: Deep dives into specific metrics such as SLO (Student Learning Outcomes), TLM (Teacher Learning Material), and CRO (Classroom Observation).

Visit Compliance: Comprehensive reports on visit adherence, comparing actual visits vs. targets.

Profiling: Detailed views for both School Profiling and Teacher Profiling to identify specific institutional needs.

3. Data Visualization & UI
Metric-Based Colorization: Map regions are color-coded based on performance values (e.g., Achievement %) using custom interpolation logic.

Responsive Charts: Interactive charts powered by Recharts for time-series and comparative analysis.

Modern Interface: Built with Shadcn UI components for a polished, accessible, and consistent user experience.

🏗 Architecture Overview
State Management
The application uses a centralized DashboardContext to manage complex global states:

Navigation: Tracks the activeTab and geographical mapState.

Filtering: Global filters for months, years, and specific geographical entities (State/District).

Data Flow: Raw data is fetched and passed through a reducer to provide filteredData to all child components.

Geographical Logic
The map system is built using d3-geo to process GeoJSON data:

IndiaMap.tsx calculates the projection and fits GeoJSON features into the viewable SVG area.

MapViewer.tsx handles the aggregation logic to translate flat data records into region-specific map metrics.

📁 Project Structure
Plaintext

src/
├── components/
│   ├── layout/       # Sidebar, Layout, and FilterBar components
│   ├── map/          # Core map logic (IndiaMap, MapRegion, Legend, etc.)
│   ├── shared/       # Reusable UI like ChartContainer and KPICards
│   ├── tabs/         # Individual module views (Home, Overview, SLO, etc.)
│   └── ui/           # Low-level Shadcn components
├── context/          # DashboardContext for global state management
├── hooks/            # Custom hooks for metrics and mobile responsiveness
├── types/            # TypeScript interfaces for map and dashboard data
└── utils/            # Color logic, geo-metrics, and report generators
public/               # GeoJSON files for map rendering
🛠 Tech Stack
Frontend: React 18, Vite, TypeScript.

Styling: Tailwind CSS, Lucide Icons, Shadcn UI.

Visualization: D3.js (d3-geo), Recharts.

State: React Context API + UseReducer.

Mock Backend: JSON-Server.

🚀 Getting Started
Installation
Bash

npm install
Running Development Servers
To use the full functionality (including school-level pins), you must run both the frontend and the mock backend.

Start Mock API:

Bash

npm run server
Start Dashboard:

Bash

npm run dev
📊 Data Management
The project utilizes a db.json file to simulate a real production database.

Visit Records: Tracks actual vs. target visits per block.

Metrics: Stores performance scores for SLO, TLM, and CRO verticals.

Institutional Data: Contains lists of schools and teacher IDs associated with specific blocks.

⚙️ Configuration
Tailwind: Custom theme tokens for map regions and metric colors defined in tailwind.config.ts.

CSS Variables: Theme-aware colors for primary, secondary, and success states located in index.css.

TypeScript: Path aliases (e.g., @/* for src/*) configured for cleaner imports.
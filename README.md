# BI Tool - Business Intelligence Dashboard

A comprehensive Business Intelligence tool built with React, TypeScript, and Supabase.

## Quick Start

```bash
npm install
npm run dev
```

## Documentation

- [Features](./docs/FEATURES.md) - Complete feature list
- [Setup Guide](./docs/README.md) - Detailed setup instructions
- [Large Dataset Guide](./docs/LARGE-DATASET-GUIDE.md) - Handling large datasets
- [Enterprise Setup](./docs/ENTERPRISE-SETUP.md) - Enterprise features

## Project Structure

```
BI project/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Libraries & utilities
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   └── workers/        # Web workers
├── backend/            # Express backend server
├── database/           # SQL migration files
├── docs/               # Documentation
└── samples/            # Sample datasets
```

## Features

- 📊 Multiple chart types (Bar, Line, Pie, Area, Scatter, Radar, Heatmap, Treemap)
- 📈 KPI cards and data tables
- 🎨 Dark/Light theme
- 📤 Export to PDF, CSV, Excel
- 🔍 Natural language queries
- 🤖 AI-powered insights
- 📱 Responsive design

## Tech Stack

- React 18 + TypeScript
- Vite
- Supabase (Auth + Database)
- Recharts
- ExcelJS

## Dataset Limits

- Maximum: 50,000 rows per dataset
- Recommended: Under 30,000 rows for best performance

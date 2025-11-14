# BI Tool - Business Intelligence Dashboard

A comprehensive Business Intelligence tool built with React, TypeScript, and Supabase.

## Features

- **Authentication**: Email/password authentication with Supabase
- **Dataset Management**: Upload and manage JSON datasets
- **Dashboard Creation**: Create multiple dashboards to organize visualizations
- **Visualizations**: 
  - Bar Charts
  - Line Charts
  - Pie Charts
  - KPI Cards
  - Data Tables
- **Interactive Charts**: Built with Recharts for responsive, interactive visualizations
- **Responsive Design**: Clean, modern UI that works on all devices

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a Supabase project at https://supabase.com

3. Run this SQL in your Supabase SQL editor:

```sql
-- Create datasets table
CREATE TABLE datasets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dashboards table
CREATE TABLE dashboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visualizations table
CREATE TABLE visualizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID REFERENCES dashboards ON DELETE CASCADE NOT NULL,
  dataset_id UUID REFERENCES datasets NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own datasets" ON datasets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own datasets" ON datasets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets" ON datasets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own dashboards" ON dashboards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboards" ON dashboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards" ON dashboards
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view visualizations in their dashboards" ON visualizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dashboards 
      WHERE dashboards.id = visualizations.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create visualizations in their dashboards" ON visualizations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM dashboards 
      WHERE dashboards.id = visualizations.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete visualizations in their dashboards" ON visualizations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM dashboards 
      WHERE dashboards.id = visualizations.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );
```

4. Update `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

## Usage

1. **Sign Up/Sign In**: Create an account or sign in
2. **Upload Datasets**: Go to Datasets page and upload JSON files (must be an array of objects)
3. **Create Dashboard**: Go to Dashboards page and create a new dashboard
4. **Add Visualizations**: Open a dashboard and add visualizations by selecting:
   - Dataset
   - Chart type
   - Required fields (X/Y axis, metrics, labels)
5. **View Analytics**: Interact with your charts and analyze your data

## Example Dataset Format

```json
[
  { "month": "Jan", "sales": 4000, "category": "Electronics" },
  { "month": "Feb", "sales": 3000, "category": "Electronics" },
  { "month": "Mar", "sales": 5000, "category": "Electronics" }
]
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Supabase (Auth + Database)
- Recharts (Visualizations)
- React Router
- Lucide React (Icons)

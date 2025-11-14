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
  dataset_id UUID REFERENCES datasets ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "datasets_policy" ON datasets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "dashboards_policy" ON dashboards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "visualizations_policy" ON visualizations FOR ALL USING (
  EXISTS (SELECT 1 FROM dashboards WHERE dashboards.id = visualizations.dashboard_id AND dashboards.user_id = auth.uid())
);
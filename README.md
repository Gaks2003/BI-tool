# Modern BI Dashboard

A cutting-edge Business Intelligence dashboard with advanced analytics, smart data aggregation, and actionable insights. Built with the latest React ecosystem for enterprise-grade performance.

## 🚀 Tech Stack

- **React 18.3** - Latest React with concurrent features
- **TypeScript 5.6** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Modern utility-first CSS
- **Zustand 5.0** - Lightweight state management
- **React Query 5.0** - Server state management
- **Supabase** - Backend-as-a-Service
- **Recharts** - Modern charting library

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── Auth.tsx      # Authentication
│   └── Layout.tsx    # App layout
├── pages/            # Route components
├── hooks/            # Custom React hooks
├── store/            # Zustand stores
├── lib/              # External libraries
└── types/            # TypeScript definitions
```

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/Gaks2003/BI-tool.git
cd BI-tool

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linter
npm run lint
```

## 🎯 Features

### 📊 **Advanced Visualizations**
- **Interactive Charts**: Bar, Line, Pie, Area, Scatter, Radar
- **Smart Data Aggregation**: Automatic grouping and statistical analysis
- **Chart-Specific Insights**: Tailored analysis for each visualization type
- **Data Validation**: Prevents invalid chart configurations
- **Customizable Entry Limits**: 10, 25, 50, 100, or all entries

### 📈 **Intelligent Analytics**
- **Business Insights**: Actionable recommendations from data patterns
- **Performance Analysis**: Top/bottom performers, trends, and gaps
- **Statistical Summaries**: Averages, ranges, distributions, and correlations
- **Error Handling**: Helpful suggestions for chart configuration issues

### 🎨 **User Experience**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching
- **Expandable Cards**: Detailed view with full-screen charts
- **Share & Download**: Export reports and share visualizations
- **Dataset Information**: Clear data source and record count display

### 🔐 **Enterprise Ready**
- **Secure Authentication**: User-based data access
- **Real-time Updates**: Live data synchronization
- **Performance Optimized**: Fast rendering with large datasets

### 🤖 **AI-Powered Analytics**
- **Voice Assistant**: Natural language queries with speech recognition
- **Intelligent Data Analysis**: Specific insights about salary, performance, departments, and outliers
- **Smart Pattern Recognition**: Automatic trend detection and anomaly identification
- **Contextual Recommendations**: Tailored business advice based on actual data patterns
- **Conversational Interface**: Follow-up questions for deeper analysis

## 🏗️ Architecture

- **Component-based** - Modular React components
- **Type-safe** - Full TypeScript coverage
- **State management** - Zustand for client state
- **Data fetching** - React Query for server state
- **Styling** - Tailwind CSS utility classes
- **Build optimization** - Vite with code splitting

## 📊 **Chart Library & Visualization Types**

### 📊 **Basic Charts (Essential for Any Dashboard)**
- **Bar Chart** – Compare categories or groups
- **Line Chart** – Show trends over time
- **Pie Chart** – Display proportions or percentages
- **Area Chart** – Visualize cumulative totals over time
- **Scatter Plot** – Show relationships between two variables
- **Histogram** – Display frequency distribution

### 📈 **Advanced Analytical Charts**
- **Box Plot (Box-and-Whisker)** – Show data distribution and outliers
- **Bubble Chart** – Add a third dimension to scatter plots
- **Heatmap** – Represent intensity or correlation using color
- **Radar Chart (Spider Chart)** – Compare multivariate data across categories
- **Waterfall Chart** – Visualize cumulative effect of sequential values
- **Pareto Chart** – Combine bar and line to highlight major contributors

### 🧠 **AI & Data Science Visuals**
- **Confusion Matrix** – Evaluate classification models
- **ROC Curve** – Assess model performance
- **Precision-Recall Curve** – Analyze trade-offs in classification
- **Feature Importance Plot** – Show which features impact predictions
- **Decision Tree Diagram** – Visualize model logic

### 🗺️ **Spatial & Geographical Charts**
- **Choropleth Map** – Color-coded regions based on data
- **Bubble Map** – Location-based data with magnitude
- **Vector Field Plot** – Show directional data (great for custom datasets!)
- **Heatmap Overlay on Maps** – Density or intensity visualization

### 🧩 **Interactive & Modular Charts**
- **Drill-down Bar Chart** – Click to explore subcategories
- **Dynamic Time Series Chart** – Zoom, pan, and filter over time
- **Multi-axis Chart** – Compare different metrics with separate axes
- **Treemap** – Hierarchical data with nested rectangles
- **Sunburst Chart** – Radial version of treemap

### 🎨 **Creative & Festival Mode Charts**
- **Theme-fused Line Chart** – Hacker/festival color overlays
- **Animated Bubble Chart** – Time-based transitions
- **Emoji-based Bar Chart** – Use icons for expressive storytelling
- **Gradient Area Chart** – Aesthetic data storytelling
- **Custom Icon Scatter Plot** – Replace dots with themed icons

### 📚 **Educational & Tutorial Charts**
- **Annotated Line Chart** – Add callouts and explanations
- **Step Chart** – Show changes at specific intervals
- **Gantt Chart** – Visualize project timelines
- **Funnel Chart** – Represent stages in a process
- **Sankey Diagram** – Flow of data or resources

## 🎯 **Current Implementation**

### **Available Now:**
- ✅ Bar Charts - Comparative Analysis
- ✅ Line Charts - Trend Analysis  
- ✅ Pie Charts - Distribution Analysis
- ✅ Area Charts - Cumulative Analysis
- ✅ Scatter Plots - Correlation Analysis
- ✅ Radar Charts - Multi-dimensional Analysis
- ✅ Bubble Charts - 3D scatter analysis
- ✅ Box Plots - Statistical distribution
- ✅ Waterfall Charts - Sequential changes

### **Coming Soon:**
- ✅ Heatmaps - Intensity visualization
- 🔄 Treemaps - Hierarchical data
- 🔄 Gantt Charts - Project timelines
- 🔄 Funnel Charts - Process stages
- 🔄 Sankey Diagrams - Flow visualization

### **AI Features Available:**
- ✅ **Voice Recognition** - Web Speech API integration with real-time transcription
- ✅ **Intelligent Data Analysis** - Specific insights about salary, performance, and departments
- ✅ **Outlier Detection** - Automatic identification of unusual patterns and anomalies
- ✅ **Department Comparison** - Cross-functional analysis with concrete metrics
- ✅ **Performance Analytics** - Top/bottom performer identification with rankings
- ✅ **Strategic Recommendations** - Context-aware business advice
- ✅ **Conversational Interface** - Natural follow-up questions and clarifications

## 💡 **Best Practices**

### **Chart Configuration Tips**
- Use **categorical fields** (department, location) for X-axis
- Use **numeric fields** (salary, performance_score, age) for Y-axis
- Group data by meaningful categories for better insights
- Limit entries for performance (25-50 recommended)

### **Data Analysis Guidelines**
- **Bar Charts**: Compare categories (departments, locations)
- **Line Charts**: Show trends over time or ordered data
- **Pie Charts**: Display proportions (max 8 categories)
- **Scatter Plots**: Explore relationships between variables

## 🚀 **Getting Started with Sample Data**

1. **Upload the provided sample_dataset.csv** (105 employee records)
2. **Create visualizations** using these field combinations:
   - `department` vs `salary` - Department salary analysis
   - `location` vs `performance_score` - Geographic performance
   - `years_experience` vs `salary` - Experience-salary correlation
   - `gender` vs `performance_score` - Diversity insights

3. **Explore insights** with detailed reports and analytics
4. **Ask the AI Assistant** specific questions like:
   - "Compare salary by department" → Get department-wise salary breakdowns
   - "Find performance outliers" → Identify high/low performers with names and scores
   - "Show me the top performers" → Ranked list of best employees
   - "Analyze department trends" → Cross-functional performance and salary analysis
   - "Find unusual patterns" → Detect salary/performance anomalies with specific examples

## 🛣️ **Roadmap**

### **Phase 1: Core Analytics** ✅
- Basic chart types (Bar, Line, Pie, Area, Scatter, Radar)
- Smart data aggregation and validation
- Interactive insights and reports
- Share and download functionality

### **Phase 2: Advanced Visualizations** 🔄
- Heatmaps and Treemaps
- Box plots and statistical charts
- Geographic mapping capabilities
- Multi-axis and drill-down charts

### **Phase 3: AI & Data Science** ✅
- **AI Assistant**: Voice-powered business intelligence with intelligent data analysis
- **Natural Language Queries**: "Compare departments", "Find outliers", "Show top performers"
- **Smart Insights**: Automatic pattern detection with specific employee and department insights
- **Voice Interaction**: Web Speech API integration for hands-free analysis
- **Contextual Analysis**: Salary equity, performance gaps, and department comparisons
- **Actionable Recommendations**: Data-driven business advice with concrete next steps

### **Phase 4: Enterprise Features** 🔮
- Real-time data streaming
- Advanced collaboration tools
- Custom branding and themes
- API integrations and webhooks
- Multi-language AI support
- Custom AI model integration

## 🚀 **Deployment**

### **GitHub Pages (Automatic)**
1. Fork [https://github.com/Gaks2003/BI-tool.git](https://github.com/Gaks2003/BI-tool.git)
2. Add Supabase secrets to GitHub repository settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push to main branch - automatic deployment via GitHub Actions
4. Enable GitHub Pages in repository settings

### **Manual Deployment**
```bash
# Build the project
npm run build

# Deploy dist/ folder to your hosting provider
# (Vercel, Netlify, AWS S3, etc.)
```

### **Environment Setup**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Set up the required database tables (users, dashboards, datasets, visualizations)
4. Configure authentication providers if needed

## 📋 **Project Files**

```
BI-tool/
├── .github/workflows/     # GitHub Actions CI/CD
├── src/                   # Source code
│   ├── components/        # React components
│   ├── pages/            # Route components
│   ├── hooks/            # Custom hooks
│   ├── store/            # State management
│   ├── lib/              # Utilities
│   └── types/            # TypeScript definitions
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS config
├── tsconfig.json         # TypeScript config
└── .env.example          # Environment variables template
```
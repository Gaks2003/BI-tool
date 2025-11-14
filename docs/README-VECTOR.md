# Vector Database Setup for BI Tool

## Features Added

### 1. Large Dataset Support
- **Data Sampling**: Automatically sample large datasets (>1000 rows) for faster visualization
- **Pagination**: Tables now paginate with 50 rows per page
- **Aggregation**: Sum, Average, Count, Min, Max operations for grouped data
- **Performance Indicators**: Visual warnings for large datasets

### 2. Vector Database Integration
- **pgvector Extension**: Enables similarity search on your data
- **Semantic Search**: Find similar data rows based on content
- **Embeddings Storage**: Store vector representations of your data

## Setup Vector Database

1. **Enable pgvector in Supabase**:
   - Go to Database → Extensions
   - Search for "vector"
   - Enable the extension

2. **Run the vector setup SQL**:
   - Go to SQL Editor
   - Copy contents from `database-setup-vector.sql`
   - Execute the SQL

## Using Large Dataset Features

### When Creating Visualizations:

1. **Aggregation**: Choose how to combine data
   - Sum: Total values
   - Average: Mean values
   - Count: Number of records
   - Min/Max: Extreme values

2. **Sampling**: For datasets >1000 rows
   - Check "Use sampling for large datasets"
   - Set sample size (100-10000)
   - Faster rendering, representative results

### Best Practices:

- **Small datasets (<1000 rows)**: Use all data
- **Medium datasets (1000-10000 rows)**: Use sampling for charts, full data for tables
- **Large datasets (>10000 rows)**: Always use sampling and aggregation

## Vector Search (Advanced)

Use vector search to find similar data patterns:

```typescript
import { searchSimilarData, generateSimpleEmbedding } from './lib/vectorDb'

// Search for similar rows
const embedding = generateSimpleEmbedding("search query")
const results = await searchSimilarData(datasetId, embedding, 10)
```

## Performance Tips

1. Use aggregation for time-series data
2. Enable sampling for initial exploration
3. Create focused dashboards (5-10 visualizations max)
4. Use KPI cards for quick metrics instead of full charts

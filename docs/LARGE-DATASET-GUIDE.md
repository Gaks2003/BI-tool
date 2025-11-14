# Large Dataset Handling Guide

## Current Limits

### File Upload
- **Maximum rows**: 50,000 rows per dataset
- **File size**: ~100MB (depends on data structure)
- **Supported formats**: JSON, CSV, Excel (.xlsx, .xls)

### Automatic Optimizations
1. **Data Compression**: Removes null/empty values, trims strings
2. **Smart Sampling**: For datasets >50K rows, samples first 50K
3. **Efficient Storage**: Optimized JSONB storage in PostgreSQL

## Handling Larger Datasets

### Option 1: Database Connectors (Recommended for >50K rows)
Connect directly to your database:
```typescript
import { executeQuery } from './lib/dbConnectors'

// MySQL
const data = await executeQuery(connId, 'SELECT * FROM sales LIMIT 100000')

// PostgreSQL
const data = await executeQuery(connId, 'SELECT * FROM orders WHERE date > NOW() - INTERVAL 1 YEAR')

// MongoDB
const data = await executeQuery(connId, 'sales.find')
```

**Benefits**:
- No row limits
- Real-time data
- Query optimization
- Aggregation at source

### Option 2: Chunked Processing
For very large files, process in chunks:
```typescript
import { chunkData } from './utils/dataCompression'

const chunks = chunkData(largeDataset, 10000)
for (const chunk of chunks) {
  await createDataset(`${name}_chunk_${i}`, chunk)
}
```

### Option 3: Pre-Aggregation
Aggregate data before upload:
```typescript
// Instead of uploading 1M rows
const rawData = [...] // 1M rows

// Aggregate to summary
const aggregated = rawData.reduce((acc, row) => {
  const key = `${row.category}_${row.month}`
  if (!acc[key]) acc[key] = { category: row.category, month: row.month, sales: 0 }
  acc[key].sales += row.sales
  return acc
}, {})

// Upload only 1K rows
await createDataset(name, Object.values(aggregated))
```

### Option 4: External Storage
For massive datasets (>1GB):
1. Upload to S3/Google Cloud Storage
2. Store only the URL in BI Tool
3. Load data on-demand

## Performance Tips

### 1. Use Sampling
Enable sampling when creating visualizations:
- ✅ Check "Use sampling for large datasets"
- Set sample size: 1,000 - 10,000 rows
- Faster rendering, representative results

### 2. Use Aggregation
Always aggregate data:
- Sum, Average, Count instead of raw data
- Group by category/time period
- Reduces data points by 90%+

### 3. Optimize Queries
For database connectors:
```sql
-- ❌ Bad: Load everything
SELECT * FROM orders

-- ✅ Good: Filter and aggregate
SELECT 
  DATE_TRUNC('month', order_date) as month,
  category,
  SUM(amount) as total_sales
FROM orders
WHERE order_date > NOW() - INTERVAL 1 YEAR
GROUP BY month, category
```

### 4. Use Indexes
Create indexes on frequently queried columns:
```sql
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_category ON orders(category);
```

## Industry Best Practices

### Manufacturing/IoT
- **Challenge**: Millions of sensor readings
- **Solution**: Aggregate by hour/day, store only anomalies

### E-commerce
- **Challenge**: Millions of transactions
- **Solution**: Pre-aggregate by product/category/time

### Finance
- **Challenge**: High-frequency trading data
- **Solution**: Use time-series database, aggregate by minute/hour

### Healthcare
- **Challenge**: Patient records with privacy concerns
- **Solution**: Anonymize, aggregate by demographics

## Troubleshooting

### "Dataset too large" error
- Reduce rows to <50K
- Use database connector
- Pre-aggregate data

### Slow visualization rendering
- Enable sampling
- Use aggregation
- Reduce data points

### Out of memory
- Close other tabs
- Use web workers (automatic)
- Reduce sample size

## Future Enhancements

Coming soon:
- [ ] Streaming data support
- [ ] Incremental loading
- [ ] Data lake integration
- [ ] Spark/Hadoop connectors
- [ ] Real-time data pipelines

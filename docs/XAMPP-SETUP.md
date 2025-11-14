# XAMPP Integration Setup

## Benefits
- ✅ **Unlimited Data**: No row limits, handle millions of records
- ✅ **Local Storage**: Data stays on your machine
- ✅ **Fast Queries**: Direct database access
- ✅ **Real-time**: Always up-to-date data

## Setup Steps

### 1. Install XAMPP
Download from: https://www.apachefriends.org/

### 2. Start MySQL
- Open XAMPP Control Panel
- Click "Start" for MySQL
- Default port: 3306

### 3. Create Database
Open phpMyAdmin (http://localhost/phpmyadmin):
```sql
CREATE DATABASE sales_db;
USE sales_db;

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  category VARCHAR(100),
  price DECIMAL(10,2),
  stock INT,
  sales INT
);

-- Import your data
LOAD DATA INFILE 'C:/path/to/data.csv'
INTO TABLE products
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

### 4. Start Backend Server
```bash
cd backend
npm install
npm start
```

Server runs on: http://localhost:3001

### 5. Connect in BI Tool
1. Go to "XAMPP MySQL" in sidebar
2. Enter connection details:
   - Host: localhost
   - Port: 3306
   - Database: sales_db
   - Username: root
   - Password: (leave empty by default)
3. Click "Test Connection"
4. Select table and load data

## Usage Examples

### Load Large Dataset
```sql
-- Load 1 million rows
SELECT * FROM orders LIMIT 1000000
```

### Aggregate Data
```sql
-- Monthly sales summary
SELECT 
  DATE_FORMAT(order_date, '%Y-%m') as month,
  category,
  SUM(amount) as total_sales,
  COUNT(*) as order_count
FROM orders
WHERE order_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY month, category
```

### Join Tables
```sql
-- Products with sales data
SELECT 
  p.name,
  p.category,
  SUM(o.quantity) as total_sold,
  SUM(o.amount) as revenue
FROM products p
JOIN orders o ON p.id = o.product_id
GROUP BY p.id, p.name, p.category
```

## Troubleshooting

### Connection Failed
- Check XAMPP MySQL is running
- Verify port 3306 is not blocked
- Check username/password

### Backend Server Not Starting
```bash
cd backend
npm install
npm start
```

### Data Not Loading
- Check table exists in database
- Verify user has SELECT permissions
- Check query syntax

## Performance Tips

1. **Add Indexes**:
```sql
CREATE INDEX idx_date ON orders(order_date);
CREATE INDEX idx_category ON products(category);
```

2. **Use LIMIT**:
```sql
SELECT * FROM orders LIMIT 10000
```

3. **Aggregate at Source**:
```sql
-- Better than loading raw data
SELECT category, SUM(sales) FROM products GROUP BY category
```

## Security Notes

⚠️ **Production Use**:
- Change default MySQL password
- Create dedicated user with limited permissions
- Use SSL for connections
- Never expose backend server publicly

```sql
-- Create limited user
CREATE USER 'bi_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT ON sales_db.* TO 'bi_user'@'localhost';
FLUSH PRIVILEGES;
```

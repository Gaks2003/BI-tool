import { useState, useEffect } from 'react'
import { useDatasets } from '../hooks/useDatasets'
import { FileText, Download } from 'lucide-react'

export default function ReportsPage() {
  const { datasets } = useDatasets()
  const [selectedDataset, setSelectedDataset] = useState('')
  const [report, setReport] = useState<any>(null)

  const generateReport = () => {
    const dataset = datasets.find(d => d.id === selectedDataset)
    if (!dataset) return

    const data = dataset.data
    if (data.length === 0) return

    // Auto-detect field names
    const fields = Object.keys(data[0])
    const salesField = fields.find(f => f.toLowerCase().includes('sales')) || fields.find(f => typeof data[0][f] === 'number')
    const profitField = fields.find(f => f.toLowerCase().includes('profit'))
    const categoryField = fields.find(f => f.toLowerCase().includes('category') || f.toLowerCase().includes('segment'))
    const regionField = fields.find(f => f.toLowerCase().includes('region') || f.toLowerCase().includes('state') || f.toLowerCase().includes('city'))
    const productField = fields.find(f => f.toLowerCase().includes('product') || f.toLowerCase().includes('name'))
    
    // Calculate metrics
    const totalSales = salesField ? data.reduce((sum, row) => sum + (Number(row[salesField]) || 0), 0) : 0
    const totalProfit = profitField ? data.reduce((sum, row) => sum + (Number(row[profitField]) || 0), 0) : 0

    // Group by Category
    const byCategory: any = {}
    if (categoryField && salesField) {
      data.forEach(row => {
        const cat = row[categoryField] || 'Unknown'
        if (!byCategory[cat]) byCategory[cat] = { sales: 0, profit: 0, count: 0 }
        byCategory[cat].sales += Number(row[salesField]) || 0
        if (profitField) byCategory[cat].profit += Number(row[profitField]) || 0
        byCategory[cat].count += 1
      })
    }

    // Group by Region
    const byRegion: any = {}
    if (regionField && salesField) {
      data.forEach(row => {
        const reg = row[regionField] || 'Unknown'
        if (!byRegion[reg]) byRegion[reg] = { sales: 0, profit: 0, count: 0 }
        byRegion[reg].sales += Number(row[salesField]) || 0
        if (profitField) byRegion[reg].profit += Number(row[profitField]) || 0
        byRegion[reg].count += 1
      })
    }

    // Top products
    const productSales: any = {}
    if (productField && salesField) {
      data.forEach(row => {
        const prod = row[productField] || 'Unknown'
        if (!productSales[prod]) productSales[prod] = 0
        productSales[prod] += Number(row[salesField]) || 0
      })
    }
    const topProducts = Object.entries(productSales)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)

    setReport({
      totalSales,
      totalProfit,
      profitMargin: totalSales > 0 ? (totalProfit / totalSales * 100).toFixed(2) : '0',
      byCategory,
      byRegion,
      topProducts,
      totalOrders: data.length,
      fields: { salesField, profitField, categoryField, regionField, productField }
    })
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Visual Reports</h1>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">Select dataset</option>
            {datasets.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button
            onClick={generateReport}
            disabled={!selectedDataset}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', borderRadius: '4px', fontWeight: '600' }}
          >
            <FileText size={20} />
            Generate Report
          </button>
        </div>
      </div>

      {report && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Sales</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>${report.totalSales.toLocaleString()}</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Profit</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>${report.totalProfit.toLocaleString()}</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Profit Margin</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{report.profitMargin}%</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Orders</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{report.totalOrders.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Sales by Category</h3>
              {Object.entries(report.byCategory).map(([cat, data]: any) => (
                <div key={cat} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600' }}>{cat}</span>
                    <span>${data.sales.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#667eea', width: `${(data.sales / report.totalSales * 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Sales by Region</h3>
              {Object.entries(report.byRegion).map(([reg, data]: any) => (
                <div key={reg} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600' }}>{reg}</span>
                    <span>${data.sales.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#10b981', width: `${(data.sales / report.totalSales * 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Top 5 Products</h3>
              {report.topProducts.map(([prod, sales]: any, i: number) => (
                <div key={i} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>{prod}</div>
                  <div style={{ fontSize: '0.875rem', color: '#667eea' }}>${sales.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

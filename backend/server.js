const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json({ limit: '100mb' }))

app.post('/api/xampp/test', async (req, res) => {
  const { host, port, username, password } = req.body

  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user: username,
      password
    })

    await connection.query('CREATE DATABASE IF NOT EXISTS bi_datasets')
    await connection.query('USE bi_datasets')
    const [tables] = await connection.query('SHOW TABLES')
    const tableNames = tables.map(t => Object.values(t)[0])

    await connection.end()

    res.json({ success: true, tables: tableNames })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.post('/api/xampp/import', async (req, res) => {
  const { host, port, username, password, tableName, data } = req.body

  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user: username,
      password
    })

    await connection.query('CREATE DATABASE IF NOT EXISTS bi_datasets')
    await connection.query('USE bi_datasets')
    await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``)

    const cleanData = data.filter(row => {
      return Object.values(row).some(val => val !== null && val !== undefined && val !== '' && val !== 'NaN')
    })

    if (cleanData.length === 0) {
      throw new Error('No valid data found')
    }

    const columns = Object.keys(cleanData[0])
    const columnDefs = columns.map(col => {
      const sampleValue = cleanData[0][col]
      const type = typeof sampleValue === 'number' ? 'DECIMAL(15,2)' : 'TEXT'
      return `\`${col}\` ${type}`
    }).join(', ')

    await connection.query(`CREATE TABLE \`${tableName}\` (id INT PRIMARY KEY AUTO_INCREMENT, ${columnDefs})`)

    const batchSize = 1000
    for (let i = 0; i < cleanData.length; i += batchSize) {
      const batch = cleanData.slice(i, i + batchSize)
      const values = batch.map(row => {
        const vals = columns.map(col => {
          const val = row[col]
          if (val === null || val === undefined || val === '' || val === 'NaN') {
            return 'NULL'
          }
          return connection.escape(val)
        }).join(', ')
        return `(${vals})`
      }).join(', ')

      await connection.query(`INSERT INTO \`${tableName}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES ${values}`)
    }

    await connection.end()

    res.json({ success: true, message: `Imported ${cleanData.length} rows` })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.post('/api/xampp/query', async (req, res) => {
  const { host, port, username, password, query } = req.body

  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user: username,
      password,
      database: 'bi_datasets'
    })

    const [rows] = await connection.query(query)
    await connection.end()

    res.json({ success: true, data: rows })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})

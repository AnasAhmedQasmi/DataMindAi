import { useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Link } from 'react-router-dom'
import { Chart, ArcElement, LineElement, BarElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import clsx from 'clsx'

Chart.register(ArcElement, LineElement, BarElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

type ParsedData = {
  columns: string[]
  rows: any[]
}

type ChartSpec = {
  type: 'bar' | 'line' | 'pie' | 'scatter'
  x?: string
  y?: string
  series?: string
  title?: string
}

export default function Dashboard() {
  const [parsed, setParsed] = useState<ParsedData | null>(null)
  const [previewRows, setPreviewRows] = useState<any[]>([])
  const [detected, setDetected] = useState<string>('')
  const [summary, setSummary] = useState<string>('')
  const [charts, setCharts] = useState<ChartSpec[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chat, setChat] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const fileRef = useRef<HTMLInputElement | null>(null)

  async function onFilesSelected(file: File) {
    const ext = file.name.toLowerCase().split('.').pop()
    if (ext === 'csv') {
      await parseCsv(file)
    } else if (ext === 'xlsx' || ext === 'xls') {
      await parseXlsx(file)
    } else {
      alert('Unsupported file type')
    }
  }

  async function parseCsv(file: File) {
    const text = await file.text()
    const result = Papa.parse(text, { header: true, skipEmptyLines: true })
    const rows = result.data as any[]
    const columns = result.meta.fields || Object.keys(rows[0] || {})
    setParsed({ columns, rows })
    setPreviewRows(rows.slice(0, 10))
    await runAutoInsights({ columns, rows })
  }

  async function parseXlsx(file: File) {
    const data = await file.arrayBuffer()
    const wb = XLSX.read(data)
    const sheetName = wb.SheetNames[0]
    const ws = wb.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json(ws)
    const rows = json as any[]
    const columns = Object.keys(rows[0] || {})
    setParsed({ columns, rows })
    setPreviewRows(rows.slice(0, 10))
    await runAutoInsights({ columns, rows })
  }

  async function runAutoInsights(data: ParsedData) {
    // Placeholder detection & insights before backend is wired
    const detectedKind = detectDataKind(data)
    setDetected(detectedKind)

    // Simple heuristic summary
    const rowCount = data.rows.length
    const colCount = data.columns.length
    setSummary(`Detected: ${detectedKind}. Your dataset has ${rowCount} rows and ${colCount} columns. This is a placeholder summary. The backend AI will generate trends, anomalies, and recommended actions.`)

    // Generate simple charts suggestion (first numeric column over index)
    const numericCols = data.columns.filter(c => data.rows.some(r => typeof r[c] === 'number' || (!isNaN(parseFloat(r[c])) && r[c] !== '')))
    const catCols = data.columns.filter(c => !numericCols.includes(c))
    const charts: ChartSpec[] = []
    if (numericCols.length > 0) {
      charts.push({ type: 'line', x: '__index__', y: numericCols[0], title: `Trend of ${numericCols[0]}` })
    }
    if (numericCols.length > 0 && catCols.length > 0) {
      charts.push({ type: 'bar', x: catCols[0], y: numericCols[0], title: `${numericCols[0]} by ${catCols[0]}` })
    }
    setCharts(charts.slice(0, 3))
  }

  function detectDataKind(data: ParsedData): string {
    const cols = data.columns.map(c => c.toLowerCase())
    const contains = (k: string[]) => k.some(x => cols.includes(x))
    if (contains(['revenue', 'sales', 'amount', 'price'])) return 'Sales/Finance Data'
    if (contains(['campaign', 'clicks', 'impressions', 'ctr'])) return 'Marketing Data'
    if (contains(['patient', 'diagnosis', 'heart', 'bp'])) return 'Health Data'
    if (contains(['product', 'sku', 'inventory', 'stock'])) return 'Product/Inventory Data'
    return 'General Tabular Data'
  }

  async function onAsk() {
    if (!parsed || !chatInput.trim()) return
    const q = chatInput.trim()
    setChat(prev => [...prev, { role: 'user', content: q }])

    // Placeholder chat response before backend
    const answer = `Placeholder answer for: "${q}". Backend AI will compute and render relevant charts.`
    setChat(prev => [...prev, { role: 'assistant', content: answer }])
    setChatInput('')
  }

  const preview = useMemo(() => {
    if (!parsed) return null
    const columns = parsed.columns
    const rows = previewRows
    return (
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #eef0f4' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                {columns.map(c => (
                  <td key={c} style={{ padding: '8px 12px', borderBottom: '1px solid #f4f6fa', color: '#334155' }}>
                    {String(r[c] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }, [parsed, previewRows])

  function renderChart(spec: ChartSpec, index: number) {
    if (!parsed) return null
    const rows = parsed.rows

    if (spec.type === 'pie' && spec.x) {
      const groups: Record<string, number> = {}
      for (const row of rows) {
        const key = String(row[spec.x])
        groups[key] = (groups[key] || 0) + 1
      }
      const labels = Object.keys(groups)
      const data = Object.values(groups)
      return (
        <Pie key={index} data={{
          labels,
          datasets: [{ label: spec.title || 'Distribution', data, backgroundColor: gradientColors(labels.length) }]
        }} />
      )
    }

    const xKey = spec.x || '__index__'
    const yKey = spec.y
    const labels = rows.map((_, i) => (xKey === '__index__' ? String(i + 1) : String(rows[i][xKey!])))
    const dataVals = yKey ? rows.map(r => Number(r[yKey])) : []

    const dataset = {
      label: spec.title || `${yKey} over ${xKey}`,
      data: dataVals,
      borderColor: 'rgba(42,42,250,0.9)',
      backgroundColor: 'rgba(138,43,226,0.35)'
    }

    if (spec.type === 'line') return <Line key={index} data={{ labels, datasets: [dataset] }} />
    if (spec.type === 'bar') return <Bar key={index} data={{ labels, datasets: [dataset] }} />
    return null
  }

  function gradientColors(n: number) {
    const colors: string[] = []
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1)
      const r = 42
      const g = Math.round(42 + (138 - 42) * t)
      const b = Math.round(250 + (226 - 250) * t)
      colors.push(`rgba(${r},${g},${b},0.8)`)
    }
    return colors
  }

  async function downloadPdf() {
    const { default: html2canvas } = await import('html2canvas')
    const { jsPDF } = await import('jspdf')
    const node = document.getElementById('report-area')
    if (!node) return
    const canvas = await html2canvas(node)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = (pdf as any).getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('DataMindAI-Report.pdf')
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex' }}>
      <aside style={{ width: 240, padding: 16, borderRight: '1px solid #eef0f4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--dm-blue), var(--dm-violet))',
            display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800
          }}>🧠</div>
          <strong>DataMind AI</strong>
        </div>
        <nav style={{ display: 'grid', gap: 8 }}>
          <Link to="/app" className={clsx('card')} style={{ padding: 10, textDecoration: 'none', color: '#0b1021' }}>Dashboard 🧠</Link>
          <a className="card" style={{ padding: 10, color: '#0b1021' }}>History 📂</a>
          <a className="card" style={{ padding: 10, color: '#0b1021' }}>Settings ⚙️</a>
          <a className="card" style={{ padding: 10, color: '#0b1021' }} href="#pricing">Upgrade 💎</a>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <button className="btn-primary" onClick={downloadPdf}>Download AI Report (PDF)</button>
        </div>

        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              ref={fileRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onFilesSelected(f)
              }}
            />
          </div>
          {parsed && (
            <div style={{ marginTop: 12, color: '#4a5162' }}>
              <strong>Detected:</strong> {detected}
            </div>
          )}
        </div>

        {parsed && (
          <div id="report-area" style={{ display: 'grid', gap: 16 }}>
            <section className="card" style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>Preview</h3>
              {preview}
            </section>

            <section className="card" style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>AI Summary</h3>
              <p style={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{summary}</p>
            </section>

            <section className="card" style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>Charts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {charts.map((c, i) => (
                  <div key={i} className="card" style={{ padding: 12 }}>{renderChart(c, i)}</div>
                ))}
              </div>
            </section>

            <section className="card" style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>Ask AI</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #e6e8ef' }}
                  placeholder="What’s my top-performing product?"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button className="btn-primary" onClick={onAsk}>Ask</button>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {chat.map((m, idx) => (
                  <div key={idx} className="card" style={{ padding: 12, background: m.role === 'user' ? '#f8fafc' : 'white' }}>
                    <strong style={{ marginRight: 8 }}>{m.role === 'user' ? 'You' : 'DataMind'}:</strong>
                    <span>{m.content}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {!parsed && (
          <div className="card" style={{ padding: 24, textAlign: 'center', color: '#4a5162' }}>
            Upload your first dataset to get started!
          </div>
        )}
      </main>
    </div>
  )
}

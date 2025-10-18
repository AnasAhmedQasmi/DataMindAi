import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--dm-blue), var(--dm-violet))',
            display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800
          }}>
            🧠
          </div>
          <span style={{ fontWeight: 800, letterSpacing: -0.5 }}>DataMind AI</span>
        </div>
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="#features" style={{ color: '#0b1021' }}>Features</a>
          <a href="#pricing" style={{ color: '#0b1021' }}>Pricing</a>
          <Link to="/app" className="btn-primary" style={{ textDecoration: 'none' }}>Try It Now →</Link>
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <section style={{ padding: '72px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: 0 }}>
            Understand your data instantly with AI.
          </h1>
          <p style={{ maxWidth: 760, margin: '14px auto 24px', color: '#4a5162', fontSize: 18 }}>
            Upload your spreadsheets or connect your data — get instant reports, insights, and forecasts powered by AI.
          </p>
          <Link to="/app" className="btn-primary" style={{ textDecoration: 'none', fontSize: 18 }}>
            Try It Now →
          </Link>

          <div style={{
            maxWidth: 980,
            margin: '48px auto 0',
            padding: 24,
            borderRadius: 18,
            background: 'linear-gradient(180deg, rgba(42,42,250,0.06), rgba(138,43,226,0.05))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)'
          }} className="card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <Feature icon="⚡" title="Upload any CSV or Excel file." />
              <Feature icon="📊" title="Get AI-generated insights and charts." />
              <Feature icon="🤖" title="Ask questions in natural language." />
            </div>
          </div>
        </section>

        <section id="testimonials" style={{ padding: '32px 24px' }}>
          <div className="card" style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>What users say</h3>
            <p style={{ color: '#4a5162' }}>“Placeholder testimonials will go here.”</p>
          </div>
        </section>

        <section id="pricing" style={{ padding: '32px 24px' }}>
          <div className="card" style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>Pricing</h3>
            <ul>
              <li><strong>Free</strong>: 3 data uploads/month</li>
              <li><strong>Pro ($5.99/mo)</strong>: Unlimited uploads, AI chat, PDF exports, history</li>
            </ul>
          </div>
        </section>
      </main>

      <footer style={{ padding: '16px 24px', display: 'flex', gap: 16, justifyContent: 'center', color: '#4a5162' }}>
        <a href="#" style={{ color: '#4a5162' }}>Terms</a>
        <a href="#" style={{ color: '#4a5162' }}>Privacy</a>
        <a href="#" style={{ color: '#4a5162' }}>Contact</a>
      </footer>
    </div>
  )
}

function Feature({ icon, title }: { icon: string, title: string }) {
  return (
    <div className="card" style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontWeight: 600 }}>{title}</div>
    </div>
  )
}

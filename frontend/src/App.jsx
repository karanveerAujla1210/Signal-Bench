import { useState, useEffect, useRef } from 'react';
import './app.css';

const LOCATIONS = [
  { code: 'IN', name: 'India', dial: '+91', regions: ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'] },
  { code: 'US', name: 'United States', dial: '+1', regions: ['California','Florida','Georgia','Illinois','New York','Ohio','Pennsylvania','Texas','Washington'] },
  { code: 'CA', name: 'Canada', dial: '+1', regions: ['Alberta','British Columbia','Ontario','Quebec','Saskatchewan'] },
  { code: 'GB', name: 'United Kingdom', dial: '+44', regions: ['England','Northern Ireland','Scotland','Wales'] },
  { code: 'AU', name: 'Australia', dial: '+61', regions: ['New South Wales','Queensland','South Australia','Victoria','Western Australia'] },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', regions: ['Abu Dhabi','Dubai','Sharjah'] }
];

const STAGE_LABEL = { otp_sent: 'OTP Triggered', login_rejected: 'Login Rejected', timeout: 'Timeout' };

export default function App() {
  const [country, setCountry] = useState('IN');
  const [region, setRegion]   = useState('');
  const [phone, setPhone]     = useState('');
  const [running, setRunning] = useState(false);
  const [report, setReport]   = useState(null);
  const [runs, setRuns]       = useState(0);
  const [toast, setToast]     = useState('');
  const [filter, setFilter]   = useState('all'); // all | triggered | not
  const [search, setSearch]   = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const toastTimer = useRef(null);

  const loc = LOCATIONS.find(l => l.code === country) || LOCATIONS[0];

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }

  async function runTrigger() {
    const trimmed = phone.trim();
    if (!/^\+?[\d ()-]{7,18}$/.test(trimmed)) { showToast('Enter a valid phone number.'); return; }
    if (!region) { showToast('Choose a region first.'); return; }

    setRunning(true);
    setReport(null);
    setFilter('all');
    setSearch('');
    setShowRaw(false);

    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trimmed, country, region })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed.');
      setRuns(r => r + 1);
      setReport(data);
    } catch (e) {
      showToast(e.message || 'Backend unavailable.');
    } finally {
      setRunning(false);
    }
  }

  const filtered = report ? report.results.filter(r => {
    const matchFilter = filter === 'all' || (filter === 'triggered' ? r.triggered : !r.triggered);
    const matchSearch = !search || r.url.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }) : [];

  return (
    <>
      <div className="shell">
        <header>
          <div className="brand">
            <span className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h3l2-6 4 12 2-6h5"/><circle cx="4" cy="12" r="1" fill="currentColor"/></svg>
            </span>
            <span>signal bench<small>AUTH FLOW WORKSPACE</small></span>
          </div>
          <span className="mode-pill">Mock mode · no SMS</span>
        </header>

        <main>
          <section className="intro">
            <div>
              <p className="eyebrow">QA TOOL / 01</p>
              <h1>OTP flow simulator</h1>
              <p className="intro-copy">Enter a phone number — it routes to every site's login page and triggers an OTP request.</p>
            </div>
            <div className="run-count">RUNS THIS SESSION&nbsp; {String(runs).padStart(2, '0')}</div>
          </section>

          <section className="workbench">
            {/* ── LEFT: config ── */}
            <div className="config">
              <div className="section-heading"><h2>Configuration</h2><span className="step">01 / INPUT</span></div>

              <div className="location-fields">
                <div>
                  <label>Country</label>
                  <select value={country} onChange={e => { setCountry(e.target.value); setRegion(''); }}>
                    {LOCATIONS.map(l => <option key={l.code} value={l.code}>{l.name} ({l.dial})</option>)}
                  </select>
                </div>
                <div>
                  <label>Region / state</label>
                  <select value={region} onChange={e => setRegion(e.target.value)}>
                    <option value="">Choose a region</option>
                    {loc.regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <label>Phone number to route</label>
              <div className="phone-field">
                <span>{loc.dial}</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runTrigger()}
                  placeholder="98765 43210"
                  maxLength={18}
                />
              </div>
              <p className="helper">This number is routed to each site's login page to trigger an OTP. Never actually sent.</p>

              <button className="run-button" disabled={running} onClick={runTrigger}>
                {running
                  ? <><span className="spinner"/> Routing to all sites…</>
                  : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/></svg>Trigger OTP on all sites</>
                }
              </button>

              <div className="notice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>
                <span>Simulation only. No real HTTP requests are made. No SMS is sent.</span>
              </div>

              {report && (
                <div className="summary-box">
                  <div className="summary-row">
                    <span className="summary-label">Phone</span>
                    <span className="summary-val mono">{loc.dial} {report.phone}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Total sites</span>
                    <span className="summary-val">{report.summary.total}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">OTP triggered</span>
                    <span className="summary-val triggered">{report.summary.triggered}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Not triggered</span>
                    <span className="summary-val failed">{report.summary.notTriggered}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Request ID</span>
                    <span className="summary-val mono small">{report.requestId}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: results ── */}
            <div className="results">
              <div className="section-heading">
                <h2>Site trigger list</h2>
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                  {report && <button className="text-button" onClick={() => setShowRaw(v => !v)}>{showRaw ? 'Visual' : 'Raw JSON'}</button>}
                  <span className="step">02 / OUTPUT</span>
                </div>
              </div>

              {report && !showRaw && (
                <div className="filter-bar">
                  <div className="filter-tabs">
                    {['all','triggered','not'].map(f => (
                      <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                        {f === 'all' ? `All (${report.summary.total})` : f === 'triggered' ? `✓ Triggered (${report.summary.triggered})` : `✗ Not triggered (${report.summary.notTriggered})`}
                      </button>
                    ))}
                  </div>
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Search sites…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              )}

              {report && showRaw ? (
                <div style={{position:'relative'}}>
                  <pre className="raw-pre">{JSON.stringify(report, null, 2)}</pre>
                  <button className="copy-btn" onClick={() => { navigator.clipboard.writeText(JSON.stringify(report, null, 2)); showToast('Copied!'); }}>Copy</button>
                </div>
              ) : report ? (
                <div className="trigger-list">
                  {filtered.length === 0 && (
                    <div style={{padding:'24px',textAlign:'center',color:'var(--muted)',fontSize:'12px'}}>No results match your filter.</div>
                  )}
                  {filtered.map((item, i) => (
                    <div key={i} className={`trigger-row${item.triggered ? '' : ' fail'}`}>
                      <div className={`trigger-dot${item.triggered ? ' ok' : item.stage === 'timeout' ? ' slow' : ' err'}`}/>
                      <div className="trigger-info">
                        <div className="trigger-url">{item.url}</div>
                        <div className="trigger-meta">
                          <span className={`trigger-badge${item.triggered ? ' ok' : ' err'}`}>{STAGE_LABEL[item.stage]}</span>
                          <span className="trigger-reason">{item.reason}</span>
                        </div>
                      </div>
                      <div className="trigger-right">
                        {item.triggered && item.otp && (
                          <span className="otp-chip">{item.otp}</span>
                        )}
                        <span className="trigger-ms">{item.responseMs} ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div>
                    <div className="empty-graphic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>
                    </div>
                    <h3>Enter a phone number</h3>
                    <p>The number will be routed to all 303 sites. Results show which ones triggered an OTP.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <footer>
            <span>SIGNAL BENCH / LOCAL QA SIMULATOR</span>
            <span>NO REAL REQUESTS · NO SMS SENT · NO DATA STORED</span>
          </footer>
        </main>
      </div>

      {toast && <div className="toast show">{toast}</div>}
    </>
  );
}

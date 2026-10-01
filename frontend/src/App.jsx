import { useState, useEffect, useRef } from 'react';
import './app.css';

const STORAGE_KEY = 'signal-bench-mock-targets-v1';
const DEFAULTS = [
  { name: 'Site A · Sign in', behavior: 'success', selected: true },
  { name: 'Site B · Account portal', behavior: 'success', selected: true },
  { name: 'Site C · Checkout', behavior: 'failure', selected: true }
];
const CATEGORY_MAP = {
  'Banking': ['sbi','hdfc','icici','axis','kotak','zerodha','yesbank','idfcfirst','indusind','federal','rblbank','bandhan','aubank','southindian','karnataka','bankofbaroda','pnb','canara','unionbank','indianbank','bankofindia','centralbank','uco','bankofmaharashtra','idbi','iob','psb'],
  'Shopping': ['amazon','flipkart','meesho','myntra','ajio','tatacliq','snapdeal','nykaa','jiomart','croma','reliance','vijay','lenskart','firstcry','decathlon','adidas','pepperfry','urbanladder','purplle','tira','bewakoof','boat','titan','tanishq','caratlane','mamaearth','zivame','westside','pantaloons'],
  'Food': ['bigbasket','blinkit','zepto','dmart','naturesbasket','countrydelight','licious','freshtohome','swiggy','zomato','dominos','pizzahut','kfc','burgerking','eatsure','magicpin','eazydiner','dineout'],
  'Health': ['1mg','pharmeasy','netmeds','apollo','practo','medibuddy','healthify','cult'],
  'Finance': ['bajajfinserv','tatacapital','mahindrafinance','shriram','ltfinance','aditya','muthoot','manappuram','poonawalla','hero','hdbfs','iifl','moneyview','navi','kreditbee','cashe','fibe','lendingkart','indifi','paisabazaar','paytm','phonepe','google','mobikwik','freecharge','bharatpe','cred','razorpay','cashfree','payu','pine','instamojo','groww','upstox','angel','icicidirect','hdfcsec','kotak','5paisa','motilal','sharekhan','dhan','fyers','cams','kfin'],
  'Insurance': ['policybazaar','acko','godigit','hdfcergo','icicilombard','tataaig','bajaj','sbigeneral','lic','maxlife','hdfclife','icicipru','sbilife','starhealth','care','niva'],
  'Travel': ['makemytrip','goibibo','cleartrip','yatra','easemytrip','booking','agoda','airbnb','irctc','redbus','abhibus','oyo','ixigo','uber','ola','rapido','indigo','airindia','akasa','spicejet','emirates','qatar','singapore','etihad','british','lufthansa'],
  'Jobs': ['naukri','linkedin','indeed','foundit','apna','workindia','internshala','shine','timesjobs','cutshort','hirist','unstop'],
  'Education': ['byjus','unacademy','vedantu','pw.live','udemy','coursera','upgrad','simplilearn','greatlearning','testbook','adda247','embibe','khan','duolingo'],
  'Telecom': ['jio.com','airtel','myvi','bsnl','acttv','excitel','hathway','tataplay'],
  'Entertainment': ['netflix','primevideo','jiohotstar','sonyliv','zee5','mxplayer','hoichoi','spotify','gaana','jiosaavn','youtube'],
  'Social': ['facebook','instagram','x.com','reddit','snapchat','pinterest','discord','telegram','whatsapp'],
  'Government': ['digilocker','umang','incometax','gst','epfindia','esic','passport','uidai','ncs','parivahan','eshram','myscheme','mca','sebi','rbi'],
  'Real Estate': ['99acres','magicbricks','housing','nobroker','squareyards','proptiger'],
  'Automotive': ['cardekho','carwale','spinny','cars24','olx','bikedekho','maruti','tatamotors','mahindra','toyota','honda','mgmotor'],
  'B2B': ['indiamart','tradeindia','udaan','moglix','alibaba'],
  'SaaS': ['zoho','freshworks','salesforce','hubspot'],
  'Productivity': ['google.com','mail.google','microsoftonline','outlook','onedrive','teams','dropbox','canva','notion','slack','zoom','github','gitlab','atlassian','trello','asana','monday'],
  'Logistics': ['delhivery','bluedart','dtdc','ecomexpress','xpressbees','shiprocket','porter','shadowfax','ekart','indiapost'],
  'Utilities': ['tatapower','adani','bses','mahadiscom','igl','mahanagar','fastag','djb']
};

function getCategory(url) {
  const lower = url.toLowerCase();
  for (const [cat, keys] of Object.entries(CATEGORY_MAP)) {
    if (keys.some(k => lower.includes(k))) return cat;
  }
  return 'Other';
}
const LOCATIONS = [
  { code: 'IN', name: 'India', dial: '+91', regions: ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'] },
  { code: 'US', name: 'United States', dial: '+1', regions: ['California','Florida','Georgia','Illinois','New York','Ohio','Pennsylvania','Texas','Washington'] },
  { code: 'CA', name: 'Canada', dial: '+1', regions: ['Alberta','British Columbia','Ontario','Quebec','Saskatchewan'] },
  { code: 'GB', name: 'United Kingdom', dial: '+44', regions: ['England','Northern Ireland','Scotland','Wales'] },
  { code: 'AU', name: 'Australia', dial: '+61', regions: ['New South Wales','Queensland','South Australia','Victoria','Western Australia'] },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', regions: ['Abu Dhabi','Dubai','Sharjah'] }
];

function loadSites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.every(s => typeof s.name === 'string' && ['success','failure','slow'].includes(s.behavior))) return saved;
  } catch (_) {}
  return DEFAULTS.map(s => ({ ...s }));
}

export default function App() {
  const [sites, setSites] = useState(loadSites);
  const [predefinedUrls, setPredefinedUrls] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [country, setCountry] = useState('IN');
  const [region, setRegion] = useState('');
  const [phone, setPhone] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [runs, setRuns] = useState(0);
  const [toast, setToast] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const toastTimer = useRef(null);

  const loc = LOCATIONS.find(l => l.code === country) || LOCATIONS[0];

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(sites)); }, [sites]);

  useEffect(() => {
    fetch('/api/urls').then(r => r.json()).then(data => setPredefinedUrls(data.urls || [])).catch(() => {});
  }, []);

  const categories = ['All', ...Object.keys(CATEGORY_MAP), 'Other'];
  const filteredUrls = filterCategory === 'All' ? predefinedUrls : predefinedUrls.filter(u => getCategory(u) === filterCategory);

  function addPredefined(url) {
    if (sites.some(s => s.name === url)) return;
    setSites(prev => [...prev, { name: url, behavior: 'success', selected: true }]);
  }

  function addAllFiltered() {
    const toAdd = filteredUrls.filter(u => !sites.some(s => s.name === u));
    if (!toAdd.length) return;
    setSites(prev => [...prev, ...toAdd.map(u => ({ name: u, behavior: 'success', selected: true }))]);
  }

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  }

  function updateSite(index, patch) {
    setSites(prev => prev.map((s, i) => i === index ? { ...s, ...patch } : s));
  }

  function removeSite(index) {
    setSites(prev => prev.filter((_, i) => i !== index));
  }

  function addSite() {
    setSites(prev => [...prev, { name: `Mock target ${prev.length + 1}`, behavior: 'success', selected: true }]);
  }

  function toggleAll() {
    const allSelected = sites.every(s => s.selected);
    setSites(prev => prev.map(s => ({ ...s, selected: !allSelected })));
  }

  function handleImport() {
    const candidates = urlInput.match(/(?:https?:\/\/)?(?:www\.)?(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,}(?::\d{1,5})?(?:\/[^\s,;"'<>]*)?/gi) || [];
    const known = new Set(sites.map(s => { try { return new URL(s.name).href.toLowerCase(); } catch (_) { return ''; } }));
    let skipped = 0;
    const imported = [];
    for (const c of candidates) {
      const cleaned = c.replace(/[.,!?)}]+$/g, '');
      try {
        const url = new URL(/^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`);
        if (!['http:','https:'].includes(url.protocol) || !url.hostname.includes('.')) { skipped++; continue; }
        const norm = url.href;
        if (known.has(norm.toLowerCase())) { skipped++; continue; }
        known.add(norm.toLowerCase());
        imported.push({ name: norm, behavior: 'success', selected: true });
      } catch (_) { skipped++; }
    }
    if (!imported.length) { showToast(candidates.length ? 'No new valid URLs.' : 'No URLs found.'); return; }
    setSites(prev => [...prev, ...imported]);
    setUrlInput('');
    setShowImport(false);
    showToast(`Added ${imported.length} URL${imported.length === 1 ? '' : 's'}; skipped ${skipped}.`);
  }

  async function runSimulation() {
    if (!/^\+?[\d ()-]{7,18}$/.test(phone.trim())) { showToast('Enter a test number to label this run.'); return; }
    if (!region) { showToast('Choose a country and region first.'); return; }
    const selected = sites.filter(s => s.selected);
    if (!selected.length) { showToast('Select at least one mock target.'); return; }

    setRunning(true);
    setResults(null);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, region, targets: selected.map(s => ({ behavior: s.behavior, name: s.name })) })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'API request failed.');
      setRuns(r => r + 1);
      setResults({ items: selected.map((s, i) => ({ ...s, ...payload.results[i] })), loc, region, phone: phone.trim() });
    } catch (e) {
      showToast(e.message || 'API unavailable.');
    } finally {
      setRunning(false);
    }
  }

  const allSelected = sites.length > 0 && sites.every(s => s.selected);

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
              <p className="intro-copy">Exercise a multi-site verification flow with local mock responses.</p>
            </div>
            <div className="run-count">RUNS THIS SESSION&nbsp; {String(runs).padStart(2, '0')}</div>
          </section>

          <section className="workbench">
            <div className="config">
              <div className="section-heading"><h2>Test configuration</h2><span className="step">01 / INPUT</span></div>

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

              <label>Test phone number</label>
              <div className="phone-field">
                <span>{loc.dial}</span>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="98765 43210" maxLength={18} />
              </div>
              <p className="helper">Displayed in results only. Never sent or saved.</p>

              <div className="targets-head">
                <label>Mock targets</label>
                <div className="target-actions">
                  <button className="text-button" onClick={() => setShowImport(true)}>Import URLs</button>
                  <button className="text-button" onClick={toggleAll}>{allSelected ? 'Clear all' : 'Select all'}</button>
                </div>
              </div>

              <div className="site-list">
                {sites.map((site, i) => (
                  <div className="site-row" key={i}>
                    <input type="checkbox" checked={site.selected} onChange={e => updateSite(i, { selected: e.target.checked })} />
                    <input type="text" value={site.name} maxLength={48} onChange={e => updateSite(i, { name: e.target.value })} />
                    <select value={site.behavior} onChange={e => updateSite(i, { behavior: e.target.value })}>
                      <option value="success">Success</option>
                      <option value="failure">Failure</option>
                      <option value="slow">Timeout</option>
                    </select>
                    <button className="remove-site" onClick={() => removeSite(i)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>
                    </button>
                  </div>
                ))}
              </div>

              <button className="add-site" onClick={addSite}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                Add mock target
              </button>

              <button className="run-button" disabled={running} onClick={runSimulation}>
                {running ? <span>Simulating…</span> : <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/></svg>
                  Run simulated test
                </>}
              </button>

              {predefinedUrls.length > 0 && (
            <div style={{marginTop:'18px',borderTop:'1px solid var(--line)',paddingTop:'14px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                <label style={{margin:0}}>Predefined targets ({predefinedUrls.length})</label>
                <button className="text-button" onClick={addAllFiltered}>Add all filtered</button>
              </div>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{width:'100%',height:'34px',marginBottom:'8px',fontSize:'11px',padding:'0 8px'}}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <div style={{maxHeight:'180px',overflowY:'auto',display:'grid',gap:'4px'}}>
                {filteredUrls.map(url => (
                  <div key={url} style={{display:'flex',alignItems:'center',gap:'7px',padding:'5px 8px',border:'1px solid #e2e7df',background:'#fff',fontSize:'11px'}}>
                    <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:'var(--mono)',color:'var(--muted)'}}>{url}</span>
                    <button className="text-button" style={{flexShrink:0}} onClick={() => addPredefined(url)}>
                      {sites.some(s => s.name === url) ? '✓' : '+'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="notice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>
                <span>Local simulation only. No website is contacted and no SMS is sent.</span>
              </div>
            </div>

            <div className="results">
              <div className="section-heading">
                <h2>Test results</h2>
                {results
                  ? <div className="result-summary"><strong>{results.items.filter(r => r.status === 'accepted').length}/{results.items.length}</strong><span>{results.items.filter(r => r.status !== 'accepted').length ? `${results.items.filter(r => r.status !== 'accepted').length} issue(s)` : 'all simulated'}</span></div>
                  : <div className="result-summary"><strong>—</strong><span>awaiting run</span></div>
                }
              </div>

              {results ? (
                <div>
                  <div className="results-list">
                    {results.items.map((item, i) => (
                      <div className={`result-card ${item.status === 'accepted' ? '' : 'fail'}`} key={i} style={{ animationDelay: `${i * 65}ms` }}>
                        <div className="result-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {item.status === 'accepted' ? <path d="m5 12 4 4L19 6"/> : <path d="m7 7 10 10M17 7 7 17"/>}
                          </svg>
                        </div>
                        <div>
                          <div className="result-name">{item.name || 'Unnamed'}</div>
                          <div className="result-detail">{item.status === 'accepted' ? 'Mock accepted' : item.status === 'timeout' ? 'Simulated timeout' : 'Simulated rejection'}</div>
                        </div>
                        <div className="result-time">{item.responseMs} ms</div>
                      </div>
                    ))}
                    <div className="otp-preview"><span>Mock provider preview · not sent</span><code>••••••</code></div>
                  </div>
                  <div className="results-meta">{results.loc.name.toUpperCase()} / {results.region.toUpperCase()} · LABEL: {results.loc.dial} {results.phone} · RUN {String(runs).padStart(2, '0')}</div>
                </div>
              ) : (
                <div className="empty-state">
                  <div>
                    <div className="empty-graphic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h2"/></svg></div>
                    <h3>Ready when you are</h3>
                    <p>Select mock targets and run a test to see the flow results here.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <footer>
            <span>SIGNAL BENCH / LOCAL QA SIMULATOR</span>
            <span>NO EXTERNAL REQUESTS · NO PERSISTED PHONE DATA</span>
          </footer>
        </main>
      </div>

      {showImport && (
        <div className="dialog-backdrop" onClick={() => setShowImport(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="import-form">
              <div className="import-title">
                <div><h2>Import company URLs</h2><p>Paste links or load a CSV/TXT file.</p></div>
                <button className="dialog-close" onClick={() => setShowImport(false)}>×</button>
              </div>
              <label className="file-picker">
                Choose CSV or TXT file
                <input type="file" accept=".csv,.txt" onChange={async e => {
                  const [f] = e.target.files;
                  if (f) setUrlInput(await f.text());
                }} />
              </label>
              <textarea id="urlInput" value={urlInput} onChange={e => setUrlInput(e.target.value)} maxLength={20000} placeholder={"https://login.example.com/sign-in\nhttps://accounts.example.com/login"} spellCheck={false} />
              <p className="import-help">Only HTTP/HTTPS links are imported. Duplicates are skipped.</p>
              <div className="dialog-actions">
                <button onClick={() => setShowImport(false)}>Cancel</button>
                <button className="confirm-import" onClick={handleImport}>Import URLs</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast show">{toast}</div>}
    </>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .al { padding:20px 24px; font-family:'Plus Jakarta Sans',sans-serif; background:#f4f7fb; min-height:100vh; color:#0d1b2a; }
  .al-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .al-title { font-size:20px; font-weight:800; color:#0d1b2a; letter-spacing:-0.4px; }
  .al-sub { font-size:11px; color:#8a9ab5; margin-top:2px; font-weight:500; }

  /* KPI */
  .al-kpi { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; margin-bottom:12px; }
  .al-kc { background:#fff; border-radius:10px; padding:12px 14px; border:1px solid #e8eef5; position:relative; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
  .al-kc::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; border-radius:10px 10px 0 0; }
  .al-kc.c1::before{background:#6366f1;} .al-kc.c2::before{background:#00b89c;}
  .al-kc.c3::before{background:#f59e0b;} .al-kc.c4::before{background:#ef4444;}
  .al-kc.c5::before{background:#f43f5e;} .al-kc.c6::before{background:#0080ff;}
  .al-kc-lbl { font-size:9px; font-weight:700; color:#8a9ab5; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
  .al-kc-val { font-size:20px; font-weight:800; color:#0d1b2a; letter-spacing:-0.5px; line-height:1; }

  /* FILTERS */
  .al-filters { background:#fff; border-radius:10px; border:1px solid #e8eef5; padding:12px 16px; margin-bottom:10px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .al-inp { padding:7px 12px; border-radius:8px; border:1px solid #e3eaf2; font-size:12px; font-family:'Plus Jakarta Sans',sans-serif; color:#0d1b2a; outline:none; background:#f8fafc; }
  .al-inp:focus { border-color:#6366f1; background:#fff; }
  .al-btn { padding:7px 14px; border-radius:8px; border:none; font-size:12px; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.15s; }
  .al-btn.primary { background:#6366f1; color:#fff; }
  .al-btn.primary:hover { background:#4f46e5; }
  .al-btn.outline { background:#fff; border:1px solid #e3eaf2; color:#374151; }
  .al-btn.outline:hover { border-color:#6366f1; color:#6366f1; }

  /* TABS */
  .al-tabs { display:flex; gap:4px; margin-bottom:10px; background:#fff; border-radius:10px; padding:6px; border:1px solid #e8eef5; width:fit-content; }
  .al-tab { padding:7px 14px; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; border:none; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.15s; background:transparent; color:#8a9ab5; }
  .al-tab.active { background:#6366f1; color:#fff; }
  .al-tab:hover:not(.active) { background:#f4f7fb; color:#374151; }

  /* TABLE */
  .al-panel { background:#fff; border-radius:12px; border:1px solid #e8eef5; box-shadow:0 1px 4px rgba(0,0,0,0.04); overflow:hidden; }
  .al-tbl { width:100%; border-collapse:collapse; }
  .al-tbl th { font-size:9px; font-weight:700; color:#8a9ab5; text-transform:uppercase; letter-spacing:0.6px; padding:10px 14px; text-align:left; border-bottom:1px solid #f0f4f8; background:#f8fafc; white-space:nowrap; }
  .al-tbl td { padding:9px 14px; font-size:11px; border-bottom:1px solid #f8fafc; vertical-align:middle; color:#374151; }
  .al-tbl tr:last-child td { border-bottom:none; }
  .al-tbl tr:hover td { background:#fafcff; }
  .al-name { font-weight:700; color:#0d1b2a; font-size:12px; }
  .al-sub2 { font-size:9px; color:#b0bfcc; margin-top:1px; }

  /* BADGES */
  .badge { display:inline-flex; padding:2px 8px; border-radius:20px; font-size:9px; font-weight:700; white-space:nowrap; }
  .badge.sale    { background:#d1fae5; color:#065f46; }
  .badge.restock { background:#dbeafe; color:#1e40af; }
  .badge.adjust  { background:#fef3c7; color:#b45309; }
  .badge.expired { background:#fee2e2; color:#dc2626; }
  .badge.critical{ background:#fff7ed; color:#c2410c; }
  .badge.warning { background:#fef9c3; color:#854d0e; }
  .badge.ok      { background:#d1fae5; color:#065f46; }
  .badge.pending { background:#fef3c7; color:#b45309; }
  .badge.dispensed{background:#d1fae5; color:#065f46; }
  .badge.cancelled{background:#fee2e2; color:#dc2626; }
  .badge.purple  { background:#e0e7ff; color:#4338ca; }
  .badge.green   { background:#d1fae5; color:#065f46; }

  .skeleton { background:linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; border-radius:6px; }
  @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
  .empty { text-align:center; padding:40px 0; color:#8a9ab5; font-size:12px; font-weight:600; }

  @media(max-width:1100px){ .al-kpi{grid-template-columns:repeat(3,1fr);} }
  @media(max-width:700px){ .al-kpi{grid-template-columns:repeat(2,1fr);} .al{padding:12px 14px;} }
`;

function timeAgo(d) {
  const s = Math.floor((new Date() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const BASE = '/audit.php';

export default function AuditLogs() {
  const navigate = useNavigate();
  const [tab, setTab]         = useState('inventory');
  const [summary, setSummary] = useState(null);
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [sumLoading, setSumLoading] = useState(true);
  const [from, setFrom]       = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo]           = useState(() => new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchSummary = () => {
    setSumLoading(true);
    api.get(`${BASE}?action=summary&from=${from}&to=${to}`)
      .then(r => setSummary(r.data.data))
      .catch(() => setSummary(null))
      .finally(() => setSumLoading(false));
  };

  const fetchTab = () => {
    setLoading(true);
    const params = `action=${tab}&from=${from}&to=${to}${typeFilter ? `&type=${typeFilter}` : ''}`;
    api.get(`${BASE}?${params}`)
      .then(r => setData(r.data.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSummary(); }, [from, to]);
  useEffect(() => { fetchTab(); setTypeFilter(''); }, [tab, from, to]);

  const applyFilter = () => fetchTab();

  const kpis = summary ? [
    { cls:'c1', lbl:'Stock Changes',  val:summary.stock_changes },
    { cls:'c2', lbl:'Sales Made',     val:summary.total_sales },
    { cls:'c3', lbl:'Prescriptions',  val:summary.prescriptions },
    { cls:'c4', lbl:'Low Stock Items',val:summary.low_stock },
    { cls:'c5', lbl:'Expired Meds',   val:summary.expired },
    { cls:'c6', lbl:'Revenue (KES)',  val:`KES ${Number(summary.revenue).toLocaleString()}` },
  ] : [];

  const tabs = [
    { key:'inventory',     label:'📦 Inventory Changes' },
    { key:'sales',         label:'🛒 Sales Transactions' },
    { key:'prescriptions', label:'📋 Prescriptions' },
    { key:'expiry',        label:'⚠️ Expiry Compliance' },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="al">

        {/* HEADER */}
        <div className="al-header">
          <div>
            <div className="al-title">🔍 Audit Logs</div>
            <div className="al-sub">Comprehensive pharmacy activity trail — inventory, sales, prescriptions & compliance</div>
          </div>
          <button className="al-btn outline" onClick={() => navigate('/admin/dashboard')}>← Back to Dashboard</button>
        </div>

        {/* KPI SUMMARY */}
        <div className="al-kpi">
          {sumLoading ? [1,2,3,4,5,6].map(i => (
            <div key={i} className="al-kc c1">
              <div className="skeleton" style={{height:9,width:"60%",marginBottom:8}}/>
              <div className="skeleton" style={{height:20,width:"50%"}}/>
            </div>
          )) : kpis.map((k,i) => (
            <div key={i} className={`al-kc ${k.cls}`}>
              <div className="al-kc-lbl">{k.lbl}</div>
              <div className="al-kc-val">{k.val}</div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="al-filters">
        <div style={{fontSize:11,fontWeight:700,color:"#374151"}}>Date Range:</div>          <input className="al-inp" type="date" value={from} onChange={e => setFrom(e.target.value)}/>
          <span style={{fontSize:11,color:"#8a9ab5",fontWeight:600}}>to</span>
          <input className="al-inp" type="date" value={to} onChange={e => setTo(e.target.value)}/>

          {tab === 'inventory' && (
            <select className="al-inp" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="sale">Sale</option>
              <option value="restock">Restock</option>
              <option value="adjustment">Adjustment</option>
            </select>
          )}

          <button className="al-btn primary" onClick={applyFilter}>Apply Filter</button>

          <div style={{marginLeft:"auto",fontSize:11,color:"#8a9ab5",fontWeight:600}}>
            {data.length} records found
          </div>
        </div>

        {/* TABS */}
        <div className="al-tabs">
          {tabs.map(t => (
            <button key={t.key} className={`al-tab ${tab===t.key?"active":""}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="al-panel">
          {loading ? (
            <div style={{padding:20}}>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton" style={{height:36,marginBottom:8}}/>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="empty">
              <div style={{fontSize:32,marginBottom:8}}>🔍</div>
              No records found for selected filters
            </div>
          ) : (

            /* ── INVENTORY TABLE ── */
            tab === 'inventory' ? (
              <table className="al-tbl">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Change Type</th>
                    <th>Qty Change</th>
                    <th>Stock Before</th>
                    <th>Stock After</th>
                    <th>Expiry Date</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r,i) => (
                    <tr key={i}>
                      <td><div className="al-name">{r.medicine_name}</div></td>
                      <td><span className="badge purple">{r.category||'—'}</span></td>
                      <td>
                        <span className={`badge ${r.change_type==='sale'?'sale':r.change_type==='restock'?'restock':'adjust'}`}>
                          {r.change_type}
                        </span>
                      </td>
                      <td style={{fontWeight:700, color: r.quantity_change > 0 ? '#16a34a' : '#dc2626'}}>
                        {r.quantity_change > 0 ? `+${r.quantity_change}` : r.quantity_change}
                      </td>
                      <td style={{fontWeight:600}}>{r.stock_before}</td>
                      <td style={{fontWeight:600}}>{r.stock_after}</td>
                      <td style={{color: r.expiry_date && new Date(r.expiry_date) < new Date() ? '#dc2626' : '#374151'}}>
                        {r.expiry_date || '—'}
                      </td>
                      <td>
                        <div style={{fontSize:11}}>{new Date(r.created_at).toLocaleDateString('en-KE')}</div>
                        <div className="al-sub2">{timeAgo(r.created_at)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            /* ── SALES TABLE ── */
            ) : tab === 'sales' ? (
              <table className="al-tbl">
                <thead>
                  <tr>
                    <th>Sale #</th>
                    <th>Customer</th>
                    <th>Medicines</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Total (KES)</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r,i) => (
                    <tr key={i}>
                      <td><div className="al-name">#{r.sale_number}</div></td>
                      <td>{r.customer_name || '—'}</td>
                      <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={r.medicines}>
                        {r.medicines || '—'}
                      </td>
                      <td><span className="badge purple">{r.items_count} items</span></td>
                      <td><span className="badge green">{r.payment_method||'Cash'}</span></td>
                      <td style={{fontWeight:700,color:'#16a34a'}}>KES {parseFloat(r.total).toLocaleString()}</td>
                      <td>
                        <div style={{fontSize:11}}>{new Date(r.created_at).toLocaleDateString('en-KE')}</div>
                        <div className="al-sub2">{timeAgo(r.created_at)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            /* ── PRESCRIPTIONS TABLE ── */
            ) : tab === 'prescriptions' ? (
              <table className="al-tbl">
                <thead>
                  <tr>
                    <th>Rx #</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Blood Type</th>
                    <th>Conditions</th>
                    <th>Allergies</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r,i) => (
                    <tr key={i}>
                      <td><div className="al-name">#{r.prescription_number}</div></td>
                      <td>{r.patient_name || '—'}</td>
                      <td>{r.doctor_name || '—'}</td>
                      <td><span className="badge purple">{r.blood_type||'—'}</span></td>
                      <td style={{maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={r.conditions}>
                        {r.conditions||'None'}
                      </td>
                      <td style={{color: r.allergies && r.allergies !== 'None' ? '#dc2626' : '#374151', fontWeight: r.allergies && r.allergies !== 'None' ? 700 : 400}}>
                        {r.allergies||'None'}
                      </td>
                      <td>
                        <span className={`badge ${r.status?.toLowerCase()==='dispensed'?'dispensed':r.status?.toLowerCase()==='cancelled'?'cancelled':'pending'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{fontSize:11}}>{new Date(r.created_at).toLocaleDateString('en-KE')}</div>
                        <div className="al-sub2">{timeAgo(r.created_at)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            /* ── EXPIRY COMPLIANCE TABLE ── */
            ) : tab === 'expiry' ? (
              <table className="al-tbl">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Batch</th>
                    <th>Supplier</th>
                    <th>Stock</th>
                    <th>Min Stock</th>
                    <th>Expiry Date</th>
                    <th>Days Left</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r,i) => (
                    <tr key={i}>
                      <td><div className="al-name">{r.name}</div></td>
                      <td><span className="badge purple">{r.category||'—'}</span></td>
                      <td style={{fontSize:10,color:'#6366f1',fontWeight:600}}>{r.batch_number||'—'}</td>
                      <td>{r.supplier_name||'—'}</td>
                      <td style={{fontWeight:700, color: r.stock===0?'#dc2626':r.stock<=r.min_stock?'#b45309':'#0d1b2a'}}>
                        {r.stock}
                      </td>
                      <td style={{color:'#8a9ab5'}}>{r.min_stock}</td>
                      <td style={{fontWeight:600, color: r.expiry_status==='expired'?'#dc2626':r.expiry_status==='critical'?'#c2410c':'#374151'}}>
                        {r.expiry_date||'—'}
                      </td>
                      <td style={{fontWeight:700, color: r.days_to_expiry < 0 ? '#dc2626' : r.days_to_expiry < 30 ? '#c2410c' : '#16a34a'}}>
                        {r.days_to_expiry < 0 ? `${Math.abs(r.days_to_expiry)}d overdue` : `${r.days_to_expiry}d`}
                      </td>
                      <td><span className={`badge ${r.expiry_status}`}>{r.expiry_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null
          )}
        </div>

      </div>
    </>
  );
}
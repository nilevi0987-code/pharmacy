import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import api from "../services/api";

const C = {
  teal:"#1D9E75", tealLt:"#E1F5EE",
  purple:"#534AB7", purpleLt:"#EEEDFE",
  amber:"#BA7517", amberLt:"#FAEEDA",
  red:"#A32D2D", redLt:"#FCEBEB",
  blue:"#185FA5", blueLt:"#E6F1FB",
  gray:"#5F5E5A", grayLt:"#F1EFE8",
};
const CHART_COLORS = [C.teal,C.purple,C.amber,C.red,C.blue,"#3B6D11","#854F0B","#993C1D"];
const CATEGORIES   = ["Antibiotics","Analgesics","Antidiabetics","Antihypertensives","Gastrointestinal","Vitamins","Respiratory","Other"];

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;}
.rp{font-family:'DM Sans',sans-serif;background:#f7f8fa;min-height:100vh;color:#1a1a2e;}

/* NAV */
.rp-nav{background:#fff;border-bottom:0.5px solid #e4e7ed;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;position:sticky;top:0;z-index:100;}
.rp-nav-title{font-size:15px;font-weight:700;color:#1a1a2e;}
.rp-nav-sub{font-size:11px;color:#8a96a8;margin-top:1px;}

/* FILTER BAR */
.filter-bar{background:#fff;border-bottom:0.5px solid #e4e7ed;padding:10px 24px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.flbl{font-size:11px;font-weight:600;color:#8a96a8;}
.fi{padding:6px 10px;border:0.5px solid #d8dde6;border-radius:8px;font-size:11px;font-family:inherit;color:#1a1a2e;background:#fff;outline:none;cursor:pointer;transition:border-color 0.15s;}
.fi:focus,.fi:hover{border-color:#534AB7;}
.fsep{color:#c4cad4;font-size:11px;}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.14s;border:0.5px solid transparent;white-space:nowrap;}
.btn:disabled{opacity:0.5;cursor:not-allowed;}
.btn-teal{background:#1D9E75;color:#fff;border-color:#1D9E75;}.btn-teal:hover{opacity:0.88;}
.btn-purple{background:#534AB7;color:#fff;border-color:#534AB7;}.btn-purple:hover{opacity:0.88;}
.btn-amber{background:#BA7517;color:#fff;border-color:#BA7517;}.btn-amber:hover{opacity:0.88;}
.btn-red{background:#A32D2D;color:#fff;border-color:#A32D2D;}.btn-red:hover{opacity:0.88;}
.btn-blue{background:#185FA5;color:#fff;border-color:#185FA5;}.btn-blue:hover{opacity:0.88;}
.btn-green{background:#3B6D11;color:#fff;border-color:#3B6D11;}.btn-green:hover{opacity:0.88;}
.btn-outline{background:#fff;border-color:#d8dde6;color:#374151;}.btn-outline:hover{border-color:#534AB7;color:#534AB7;}
.btn-sm{padding:4px 9px;font-size:10px;}

/* PDF OVERLAY */
.pdf-overlay{position:fixed;inset:0;background:rgba(17,24,39,0.65);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(3px);}
.pdf-box{background:#fff;border-radius:18px;padding:36px 48px;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.2);min-width:280px;}
.pdf-spinner{width:48px;height:48px;border:3px solid #e4e7ed;border-top-color:#534AB7;border-radius:50%;animation:spin 0.75s linear infinite;margin:0 auto 18px;}
@keyframes spin{to{transform:rotate(360deg);}}
.pdf-box-title{font-size:15px;font-weight:700;color:#1a1a2e;margin:0 0 5px;}
.pdf-box-sub{font-size:11px;color:#8a96a8;margin:0;}

/* BODY */
.rp-body{padding:20px 24px;display:flex;flex-direction:column;gap:20px;}

/* REPORT CARDS GRID */
.report-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.report-card{background:#fff;border-radius:14px;border:0.5px solid #e4e7ed;padding:18px 20px;display:flex;flex-direction:column;gap:12px;transition:box-shadow 0.15s;}
.report-card:hover{box-shadow:0 6px 24px rgba(0,0,0,0.08);}
.rc-header{display:flex;align-items:center;gap:10px;}
.rc-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.rc-title{font-size:13px;font-weight:700;color:#1a1a2e;}
.rc-desc{font-size:10px;color:#8a96a8;margin-top:1px;}
.rc-stats{display:flex;gap:16px;}
.rc-stat-val{font-size:18px;font-weight:700;font-family:'DM Mono',monospace;line-height:1;}
.rc-stat-lbl{font-size:9px;color:#8a96a8;margin-top:2px;font-weight:600;text-transform:uppercase;}
.rc-actions{display:flex;gap:7px;flex-wrap:wrap;}

/* SECTION */
.sec-hdr{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.sec-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}
.sec-title{font-size:12px;font-weight:700;color:#1a1a2e;margin:0 0 1px;}
.sec-sub{font-size:10px;color:#8a96a8;margin:0;}
.sec-right{margin-left:auto;}

/* CARD */
.card{background:#fff;border-radius:12px;border:0.5px solid #e4e7ed;padding:16px 18px;}

/* TABLE */
.rtbl{width:100%;border-collapse:collapse;}
.rtbl th{font-size:9px;font-weight:700;color:#aab2c0;text-transform:uppercase;letter-spacing:0.5px;padding:0 0 8px;text-align:left;border-bottom:0.5px solid #f0f2f5;}
.rtbl td{padding:7px 0;font-size:10px;border-bottom:0.5px solid #f7f8fa;vertical-align:middle;color:#1a1a2e;}
.rtbl tr:last-child td{border-bottom:none;}
.rtbl tr:hover td{background:#fafbfc;}

/* STOCK BARS */
.stk-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:0.5px solid #f7f8fa;}
.stk-row:last-child{border-bottom:none;}
.stk-name{font-size:10px;font-weight:600;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100px;}
.stk-cat{font-size:8px;color:#aab2c0;}
.stk-bar-wrap{flex:1;height:4px;background:#f0f2f5;border-radius:2px;overflow:hidden;}
.stk-bar{height:100%;border-radius:2px;}
.badge{font-size:8px;font-weight:700;padding:2px 7px;border-radius:20px;white-space:nowrap;}

/* MISC */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.g3{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;}
.g21{display:grid;grid-template-columns:2fr 1fr;gap:12px;}
.divider{height:0.5px;background:#e4e7ed;margin:10px 0;}
.empty{text-align:center;padding:24px 0;color:#aab2c0;font-size:10px;font-weight:600;}
.skel{background:linear-gradient(90deg,#f0f2f5 25%,#e8eaee 50%,#f0f2f5 75%);background-size:200% 100%;animation:shimmer 1.3s infinite;border-radius:6px;}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.pay-row{margin-bottom:12px;}
.pay-top{display:flex;justify-content:space-between;font-size:10px;font-weight:600;color:#1a1a2e;margin-bottom:5px;}
.pay-bar-wrap{height:6px;background:#f0f2f5;border-radius:3px;overflow:hidden;margin-bottom:3px;}
.pay-bar{height:100%;border-radius:3px;}
.pay-sub{font-size:9px;color:#aab2c0;}
.profit-row{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:8px;margin-bottom:6px;}
.profit-lbl{font-size:10px;font-weight:600;flex:1;}
.profit-val{font-size:12px;font-weight:700;font-family:'DM Mono',monospace;}
.sale-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:0.5px solid #f7f8fa;}
.sale-row:last-child{border-bottom:none;}

.ctt{background:#1a1a2e;border-radius:7px;padding:7px 10px;border:none;}
.ctt p{margin:0;font-size:10px;font-weight:600;color:#fff;font-family:'DM Sans',sans-serif;}
.ctt span{color:#1D9E75;}

@media(max-width:1100px){.report-grid{grid-template-columns:repeat(2,1fr);}.g3,.g2,.g21{grid-template-columns:1fr;}}
@media(max-width:700px){.rp-body{padding:14px;}.report-grid{grid-template-columns:1fr;}.rp-nav,.filter-bar{padding:10px 14px;}}
`;

const CT = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="ctt">
      <p style={{marginBottom:2,color:"#aab2c0"}}>{label}</p>
      <p>KES <span>{Number(payload[0].value).toLocaleString()}</span></p>
    </div>
  );
};

const BASE = "http://localhost/pharmasys-backend/api";

export default function Reports() {
  const navigate = useNavigate();

  const [data,       setData]       = useState(null);
  const [invData,    setInvData]    = useState(null);
  const [sales,      setSales]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [catFilter,  setCatFilter]  = useState("");
  const [medFilter,  setMedFilter]  = useState("");

  const today = new Date().toISOString().split("T")[0];
  const monthStart = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}-01`;

  const [from, setFrom] = useState(monthStart);
  const [to,   setTo]   = useState(today);

  /* quick date presets */
  const setPreset = (p) => {
    const d = new Date();
    if (p==="today") { const s=d.toISOString().split("T")[0]; setFrom(s); setTo(s); }
    else if (p==="week") { const s=new Date(d-6*86400000).toISOString().split("T")[0]; setFrom(s); setTo(today); }
    else if (p==="month") { setFrom(monthStart); setTo(today); }
    else if (p==="year") { setFrom(`${d.getFullYear()}-01-01`); setTo(today); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rep, inv, sal] = await Promise.all([
        api.get("/reports/index.php", { params:{ from, to, category:catFilter } }),
        api.get("/dashboard/index.php"),
        api.get("/sales/index.php",   { params:{ from, to } }),
      ]);
      setData(rep.data.data);
      setInvData(inv.data.data);
      const raw = sal.data.data;
      setSales(Array.isArray(raw) ? raw : (raw?.sales||[]));
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchData(); },[from,to,catFilter]);

  /* PDF — single endpoint, report type param */
  const downloadPDF = async (type, label) => {
    setPdfLoading(label);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token") || sessionStorage.getItem("token") || "";
      const params = new URLSearchParams({ report: type, from, to, ...(catFilter && {category:catFilter}) });
      const res = await fetch(`${BASE}/reports/pdf.php?${params}`, {
        headers:{ Authorization:`Bearer ${token}` }
      });
      if (!res.ok) { const t=await res.text(); console.error(t); alert("PDF failed — check console."); return; }
      const blob = await res.blob();
      if (!blob.type.includes("pdf")) { const t=await blob.text(); console.error(t); alert("PDF failed:\n"+t.substring(0,300)); return; }
      window.open(URL.createObjectURL(blob), "_blank");
    } catch(e) {
      console.error(e);
      alert("Cannot connect to backend. Make sure XAMPP is running.");
    } finally { setPdfLoading(false); }
  };

  /* CSV */
  const dlCSV = (rows, name) => {
    if (!rows?.length) return alert("No data.");
    const h = Object.keys(rows[0]).join(",");
    const b = rows.map(r=>Object.values(r).map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF"+h+"\n"+b],{type:"text/csv;charset=utf-8;"}));
    const a = document.createElement("a"); a.href=url; a.download=name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };

  /* derived */
  const revenue     = parseFloat(data?.revenue||0);
  const txns        = data?.transactions||0;
  const estProfit   = revenue*0.40;
  const estExpenses = revenue*0.60;
  const trendData   = (data?.monthly||[]).map(m=>({month:m.month,revenue:parseFloat(m.revenue)}));
  const barData     = (data?.top_medicines||[]).slice(0,8).map(m=>({
    name:m.medicine_name.length>10?m.medicine_name.slice(0,10)+"…":m.medicine_name,
    units:parseInt(m.units),
  }));
  const donutData   = (data?.by_payment||[]).map(p=>({name:p.payment_method,value:parseInt(p.cnt)}));
  const filteredMeds= (invData?.low_stock_list||[]).filter(m=>!medFilter||m.name.toLowerCase().includes(medFilter.toLowerCase()));

  const Skel = ({h=14,w="100%"}) => <div className="skel" style={{height:h,width:w}}/>;

  /* stat helpers */
  const stat = (val, lbl, color) => (
    <div>
      <div className="rc-stat-val" style={{color}}>{loading?"…":val}</div>
      <div className="rc-stat-lbl">{lbl}</div>
    </div>
  );

  return (
    <div className="rp">
      <style>{css}</style>

      {pdfLoading && (
        <div className="pdf-overlay">
          <div className="pdf-box">
            <div className="pdf-spinner"/>
            <p className="pdf-box-title">Generating PDF…</p>
            <p className="pdf-box-sub">{pdfLoading}</p>
          </div>
        </div>
      )}

      {/* NAV */}
      <div className="rp-nav">
        <div>
          <div className="rp-nav-title">📊 Reports</div>
          <div className="rp-nav-sub">Select a period, then generate or preview any report</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchData}>↻ Refresh</button>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <span className="flbl">Period:</span>
        <input className="fi" type="date" value={from} onChange={e=>setFrom(e.target.value)}/>
        <span className="fsep">→</span>
        <input className="fi" type="date" value={to}   onChange={e=>setTo(e.target.value)}/>
        <span className="fsep">|</span>
        {["today","week","month","year"].map(p=>(
          <button key={p} className="fi" style={{cursor:"pointer",fontWeight:600}} onClick={()=>setPreset(p)}>
            {p==="today"?"Today":p==="week"?"Last 7 Days":p==="month"?"This Month":"This Year"}
          </button>
        ))}
        <span className="fsep">|</span>
        <span className="flbl">Category:</span>
        <select className="fi" value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
          <option value="">All</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <span className="fsep">|</span>
        <input className="fi" type="text" placeholder="Filter medicine…" value={medFilter} onChange={e=>setMedFilter(e.target.value)} style={{width:130}}/>
      </div>

      <div className="rp-body">

        {/* ════ REPORT CARDS ════ */}
        <div>
          <div className="sec-hdr">
            <div className="sec-icon" style={{background:C.purpleLt}}>📄</div>
            <div><p className="sec-title">Generate Reports</p><p className="sec-sub">Click "PDF" to open a printable report, or "CSV" to download data</p></div>
          </div>

          <div className="report-grid">

            {/* 1. Sales */}
            <div className="report-card">
              <div className="rc-header">
                <div className="rc-icon" style={{background:C.tealLt}}>🧾</div>
                <div>
                  <div className="rc-title">Sales Report</div>
                  <div className="rc-desc">All transactions, payment breakdown, daily totals</div>
                </div>
              </div>
              <div className="rc-stats">
                {stat(`KES ${revenue.toLocaleString(undefined,{maximumFractionDigits:0})}`,"Revenue",C.teal)}
                {stat(txns,"Transactions",C.purple)}
              </div>
              <div className="rc-actions">
                <button className="btn btn-teal btn-sm" onClick={()=>downloadPDF("sales","Sales Report")} disabled={!!pdfLoading}>⬇ PDF</button>
                <button className="btn btn-outline btn-sm" onClick={()=>dlCSV(sales.map(s=>({Sale:s.sale_number,Customer:s.customer_name,Date:s.created_at,Total:s.total,Payment:s.payment_method})),`sales-${from}-${to}.csv`)}>⬇ CSV</button>
              </div>
            </div>

            {/* 2. Stock */}
            <div className="report-card">
              <div className="rc-header">
                <div className="rc-icon" style={{background:C.amberLt}}>📦</div>
                <div>
                  <div className="rc-title">Stock Report</div>
                  <div className="rc-desc">All medicines, stock levels, top sellers</div>
                </div>
              </div>
              <div className="rc-stats">
                {stat(invData?.total_medicines||0,"Total Medicines",C.purple)}
                {stat(invData?.low_stock||0,"Low Stock",C.amber)}
              </div>
              <div className="rc-actions">
                <button className="btn btn-amber btn-sm" onClick={()=>downloadPDF("stock","Stock Report")} disabled={!!pdfLoading}>⬇ PDF</button>
                <button className="btn btn-outline btn-sm" onClick={()=>dlCSV((data?.top_medicines||[]).map((m,i)=>({Rank:i+1,Medicine:m.medicine_name,Category:m.category||"—",Stock:m.stock,"Units Sold":m.units,"Revenue KES":parseFloat(m.revenue).toFixed(2)})),`stock-${from}-${to}.csv`)}>⬇ CSV</button>
              </div>
            </div>

            {/* 3. Low Stock & Out of Stock */}
            <div className="report-card">
              <div className="rc-header">
                <div className="rc-icon" style={{background:C.redLt}}>⚠️</div>
                <div>
                  <div className="rc-title">Low Stock & Out of Stock</div>
                  <div className="rc-desc">Medicines below reorder level or completely out</div>
                </div>
              </div>
              <div className="rc-stats">
                {stat(invData?.low_stock||0,"Low Stock",C.amber)}
                {stat(invData?.out_of_stock||0,"Out of Stock",C.red)}
              </div>
              <div className="rc-actions">
                <button className="btn btn-red btn-sm" onClick={()=>downloadPDF("lowstock","Low Stock Report")} disabled={!!pdfLoading}>⬇ PDF</button>
                <button className="btn btn-outline btn-sm" onClick={()=>navigate("/inventory")}>Manage →</button>
              </div>
            </div>

            {/* 4. Expiry */}
            <div className="report-card">
              <div className="rc-header">
                <div className="rc-icon" style={{background:"#FFF0F0"}}>📅</div>
                <div>
                  <div className="rc-title">Expiry Report</div>
                  <div className="rc-desc">Exact medicines expiring soon + already expired</div>
                </div>
              </div>
              <div className="rc-stats">
                {stat(invData?.expiring_soon||0,"Expiring Soon",C.amber)}
                {stat(invData?.expired||0,"Expired",C.red)}
              </div>
              <div className="rc-actions">
                <button className="btn btn-red btn-sm" onClick={()=>downloadPDF("expiry","Expiry Report")} disabled={!!pdfLoading}>⬇ PDF</button>
                <button className="btn btn-outline btn-sm" onClick={()=>navigate("/expired")}>View All →</button>
              </div>
            </div>

            {/* 5. Profit */}
            <div className="report-card">
              <div className="rc-header">
                <div className="rc-icon" style={{background:"#EDFAF3"}}>💹</div>
                <div>
                  <div className="rc-title">Profit Report</div>
                  <div className="rc-desc">Revenue, cost of goods, net profit breakdown</div>
                </div>
              </div>
              <div className="rc-stats">
                {stat(`KES ${revenue.toLocaleString(undefined,{maximumFractionDigits:0})}`,"Revenue",C.teal)}
                {stat(`KES ${estProfit.toLocaleString(undefined,{maximumFractionDigits:0})}`,"Est. Profit","#3B6D11")}
              </div>
              <div className="rc-actions">
                <button className="btn btn-green btn-sm" onClick={()=>downloadPDF("profit","Profit Report")} disabled={!!pdfLoading}>⬇ PDF</button>
                <button className="btn btn-outline btn-sm" onClick={()=>dlCSV((data?.monthly||[]).map(m=>({Month:m.month,"Revenue KES":parseFloat(m.revenue).toFixed(2),Transactions:m.cnt||"—"})),`monthly-${from}-${to}.csv`)}>⬇ CSV</button>
              </div>
            </div>

            {/* 6. Full Report */}
            <div className="report-card" style={{borderColor:C.purple,borderWidth:1}}>
              <div className="rc-header">
                <div className="rc-icon" style={{background:C.purpleLt}}>📋</div>
                <div>
                  <div className="rc-title">Full Report</div>
                  <div className="rc-desc">All sections in one PDF — Sales, Stock, Expiry, Profit</div>
                </div>
              </div>
              <div className="rc-stats">
                {stat("5","Sections",C.purple)}
                {stat("All","Data",C.blue)}
              </div>
              <div className="rc-actions">
                <button className="btn btn-purple" onClick={()=>downloadPDF("full","Full Report")} disabled={!!pdfLoading} style={{fontSize:11}}>⬇ Download Full PDF</button>
              </div>
            </div>

          </div>
        </div>

        {/* ════ SALES PREVIEW ════ */}
        <div>
          <div className="sec-hdr">
            <div className="sec-icon" style={{background:C.tealLt}}>🧾</div>
            <div><p className="sec-title">Sales Preview</p><p className="sec-sub">{from} to {to}</p></div>
            <div className="sec-right" style={{display:"flex",gap:6}}>
              <button className="btn btn-outline btn-sm" onClick={()=>navigate("/sales-history")}>View Full History →</button>
            </div>
          </div>

          <div className="g3">
            {/* Trend */}
            <div className="card">
              <div style={{fontSize:11,fontWeight:700,marginBottom:4}}>Monthly Revenue</div>
              <div style={{fontSize:9,color:"#aab2c0",marginBottom:8}}>KES per month</div>
              {loading?<Skel h={120}/>:trendData.length===0?<div className="empty">No data</div>:(
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={trendData} margin={{top:4,right:4,left:-28,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false}/>
                    <XAxis dataKey="month" tick={{fontSize:7,fill:"#aab2c0"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:7,fill:"#aab2c0"}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CT/>}/>
                    <Line type="monotone" dataKey="revenue" stroke={C.purple} strokeWidth={2} dot={{fill:C.purple,r:3,strokeWidth:2,stroke:"#fff"}} activeDot={{r:4}}/>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Donut */}
            <div className="card">
              <div style={{fontSize:11,fontWeight:700,marginBottom:4}}>Payment Split</div>
              <div style={{fontSize:9,color:"#aab2c0",marginBottom:6}}>by count</div>
              {loading?<Skel h={120}/>:donutData.length===0?<div className="empty">No data</div>:(
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} paddingAngle={3} dataKey="value">
                      {donutData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i]}/>)}
                    </Pie>
                    <Tooltip formatter={(v,n)=>[`${v} sales`,n]} contentStyle={{borderRadius:8,border:"0.5px solid #e4e7ed",fontSize:9}}/>
                    <Legend iconType="circle" iconSize={5} formatter={v=><span style={{fontSize:8,fontWeight:600,color:"#5a6a80"}}>{v}</span>}/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Payment bars */}
            <div className="card">
              <div style={{fontSize:11,fontWeight:700,marginBottom:8}}>Revenue by Method</div>
              {loading?<Skel h={120}/>:
              data?.by_payment?.length?data.by_payment.map((p,i)=>{
                const total=data.by_payment.reduce((s,x)=>s+parseInt(x.cnt),0);
                const pct=total?Math.round((p.cnt/total)*100):0;
                return(
                  <div key={i} className="pay-row">
                    <div className="pay-top"><span>{p.payment_method}</span><span style={{color:C.teal,fontFamily:"'DM Mono',monospace"}}>{pct}%</span></div>
                    <div className="pay-bar-wrap"><div className="pay-bar" style={{width:`${pct}%`,background:C.teal}}/></div>
                    <div className="pay-sub">{p.cnt} transactions · KES {parseFloat(p.total).toLocaleString()}</div>
                  </div>
                );
              }):<div className="empty">No payment data</div>}
            </div>
          </div>

          {/* Recent sales table */}
          <div className="card" style={{marginTop:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700}}>Recent Transactions <span style={{fontSize:9,color:"#aab2c0",fontWeight:500}}>({sales.slice(0,15).length} shown)</span></div>
            </div>
            {loading?[1,2,3].map(i=><div key={i} style={{marginBottom:8}}><Skel h={12}/></div>):
            sales.length===0?<div className="empty">No sales in this period</div>:
            <table className="rtbl">
              <thead><tr><th>Sale #</th><th>Customer</th><th>Date</th><th>Payment</th><th>Total</th></tr></thead>
              <tbody>
                {sales.slice(0,15).map((s,i)=>(
                  <tr key={i}>
                    <td style={{fontWeight:600,color:C.purple,fontFamily:"'DM Mono',monospace",fontSize:9}}>{s.sale_number}</td>
                    <td style={{fontWeight:600}}>{s.customer_name||"Walk-in"}</td>
                    <td style={{color:"#aab2c0"}}>{s.created_at?.split(" ")[0]}</td>
                    <td><span className="badge" style={{background:C.tealLt,color:C.teal}}>💵 Cash</span></td>
                    <td style={{fontWeight:700,color:C.teal,fontFamily:"'DM Mono',monospace"}}>KES {parseFloat(s.total||0).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        </div>

        {/* ════ STOCK PREVIEW ════ */}
        <div>
          <div className="sec-hdr">
            <div className="sec-icon" style={{background:C.amberLt}}>📦</div>
            <div><p className="sec-title">Stock Preview</p><p className="sec-sub">Top sellers + low stock alerts</p></div>
            <div className="sec-right">
              <button className="btn btn-outline btn-sm" onClick={()=>navigate("/inventory")}>Manage Inventory →</button>
            </div>
          </div>

          <div className="g21">
            {/* Top medicines */}
            <div className="card">
              <div style={{fontSize:11,fontWeight:700,marginBottom:8}}>🏆 Top Selling Medicines</div>
              {loading?<Skel h={130}/>:barData.length===0?<div className="empty">No sales data</div>:(
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={barData} margin={{top:4,right:4,left:-24,bottom:22}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false}/>
                    <XAxis dataKey="name" tick={{fontSize:7,fill:"#aab2c0"}} axisLine={false} tickLine={false} angle={-20} textAnchor="end"/>
                    <YAxis tick={{fontSize:7,fill:"#aab2c0"}} axisLine={false} tickLine={false}/>
                    <Tooltip formatter={v=>[`${v} units`,"Sold"]} contentStyle={{borderRadius:8,border:"0.5px solid #e4e7ed",fontSize:9}}/>
                    <Bar dataKey="units" radius={[4,4,0,0]}>
                      {barData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="divider"/>
              {!loading&&data?.top_medicines?.length?(
                <table className="rtbl">
                  <thead><tr><th>#</th><th>Medicine</th><th>Stock</th><th>Sold</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {data.top_medicines.slice(0,6).map((m,i)=>(
                      <tr key={i}>
                        <td style={{fontWeight:700,color:i<3?C.amber:C.gray,fontSize:10}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</td>
                        <td style={{fontWeight:600,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.medicine_name}</td>
                        <td><span className="badge" style={{background:m.stock===0?C.redLt:m.stock<m.min_stock?C.amberLt:C.tealLt,color:m.stock===0?C.red:m.stock<m.min_stock?C.amber:C.teal}}>{m.stock||0}</span></td>
                        <td style={{fontWeight:600,color:C.purple,fontFamily:"'DM Mono',monospace"}}>{m.units}</td>
                        <td style={{fontWeight:600,color:C.teal,fontFamily:"'DM Mono',monospace"}}>KES {parseFloat(m.revenue).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ):null}
            </div>

            {/* Low + out of stock */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div className="card">
                <div style={{fontSize:11,fontWeight:700,marginBottom:4}}>⚠️ Low Stock</div>
                <div style={{fontSize:9,color:"#aab2c0",marginBottom:8}}>Below reorder level</div>
                {!invData?<Skel h={80}/>:
                filteredMeds.length===0?<div className="empty">✅ All healthy!</div>:
                filteredMeds.slice(0,5).map((m,i)=>{
                  const st=m.stock===0?"out":m.stock<=m.min_stock/2?"critical":"low";
                  const pct=m.min_stock?Math.min((m.stock/m.min_stock)*100,100):0;
                  const color=st==="out"||st==="critical"?C.red:C.amber;
                  return(
                    <div key={i} className="stk-row">
                      <div style={{minWidth:0,flex:1}}>
                        <div className="stk-name">{m.name}</div>
                        <div className="stk-cat">{m.category} · min:{m.min_stock}</div>
                        <div className="stk-bar-wrap" style={{marginTop:3}}><div className="stk-bar" style={{width:`${pct}%`,background:color}}/></div>
                      </div>
                      <span className="badge" style={{background:color+"18",color}}>{m.stock===0?"Out":`${m.stock} left`}</span>
                    </div>
                  );
                })}
              </div>

              <div className="card" style={{background:invData?.out_of_stock>0?C.redLt:""}}>
                <div style={{fontSize:11,fontWeight:700,marginBottom:4}}>🚫 Out of Stock</div>
                <div style={{fontSize:28,fontWeight:700,color:C.red,fontFamily:"'DM Mono',monospace",marginTop:6}}>{invData?.out_of_stock||0}</div>
                <div style={{fontSize:10,color:invData?.out_of_stock>0?C.red:"#aab2c0",marginTop:4}}>
                  {invData?.out_of_stock>0?"Need immediate restocking":"No issues!"}
                </div>
                {invData?.out_of_stock>0&&(
                  <button className="btn btn-red btn-sm" style={{marginTop:10}} onClick={()=>navigate("/inventory")}>Restock →</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ════ EXPIRY PREVIEW ════ */}
        <div>
          <div className="sec-hdr">
            <div className="sec-icon" style={{background:C.redLt}}>📅</div>
            <div><p className="sec-title">Expiry Preview</p><p className="sec-sub">Medicines requiring immediate attention</p></div>
            <div className="sec-right">
              <button className="btn btn-outline btn-sm" onClick={()=>navigate("/expired")}>View All →</button>
            </div>
          </div>
          <div className="g2">
            <div className="card">
              <div style={{fontSize:11,fontWeight:700,marginBottom:8}}>⚠️ Expiring Within 30 Days</div>
              {!invData?<Skel h={60}/>:invData.expiring_soon>0?(
                <div>
                  <div style={{fontSize:32,fontWeight:700,color:C.amber,fontFamily:"'DM Mono',monospace",marginBottom:8}}>{invData.expiring_soon}</div>
                  <div style={{padding:"8px 10px",background:C.amberLt,borderRadius:8,fontSize:10,color:C.amber,fontWeight:600,cursor:"pointer"}} onClick={()=>navigate("/expired")}>
                    Review and take action before they expire →
                  </div>
                </div>
              ):<div className="empty"><div style={{fontSize:20,marginBottom:4}}>✅</div>None expiring soon</div>}
            </div>
            <div className="card">
              <div style={{fontSize:11,fontWeight:700,marginBottom:8}}>🚨 Already Expired</div>
              {!invData?<Skel h={60}/>:invData.expired>0?(
                <div>
                  <div style={{fontSize:32,fontWeight:700,color:C.red,fontFamily:"'DM Mono',monospace",marginBottom:8}}>{invData.expired}</div>
                  <div style={{padding:"8px 10px",background:C.redLt,borderRadius:8,fontSize:10,color:C.red,fontWeight:600,cursor:"pointer"}} onClick={()=>navigate("/expired")}>
                    Remove from shelves immediately →
                  </div>
                </div>
              ):<div className="empty"><div style={{fontSize:20,marginBottom:4}}>✅</div>No expired medicines</div>}
            </div>
          </div>
        </div>

        {/* ════ PROFIT PREVIEW ════ */}
        <div>
          <div className="sec-hdr">
            <div className="sec-icon" style={{background:"#EDFAF3"}}>💹</div>
            <div><p className="sec-title">Profit Preview</p><p className="sec-sub">{from} to {to}</p></div>
          </div>
          <div className="g2">
            <div className="card">
              {loading?[1,2,3].map(i=><div key={i} style={{marginBottom:8}}><Skel h={40}/></div>):(
                <>
                  <div className="profit-row" style={{background:C.tealLt}}>
                    <div><div className="profit-lbl" style={{color:C.teal}}>Total Revenue</div><div style={{fontSize:9,color:C.teal}}>From {txns} transactions</div></div>
                    <div className="profit-val" style={{color:C.teal}}>KES {revenue.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                  </div>
                  <div className="profit-row" style={{background:C.redLt,marginTop:6}}>
                    <div><div className="profit-lbl" style={{color:C.red}}>Est. Expenses (COGS)</div><div style={{fontSize:9,color:C.red}}>~60% of revenue</div></div>
                    <div className="profit-val" style={{color:C.red}}>− KES {estExpenses.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                  </div>
                  <div className="divider"/>
                  <div className="profit-row" style={{background:C.purpleLt}}>
                    <div><div className="profit-lbl" style={{color:C.purple,fontSize:12}}>Net Profit</div></div>
                    <div className="profit-val" style={{color:C.purple,fontSize:16}}>KES {estProfit.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                  </div>
                  <div style={{marginTop:8,padding:"7px 10px",background:C.grayLt,borderRadius:7,fontSize:9,color:C.gray,fontWeight:600}}>
                    ℹ️ Connect supplier purchase records for exact profit figures.
                  </div>
                </>
              )}
            </div>
            <div className="card">
              <div style={{fontSize:11,fontWeight:700,marginBottom:8}}>Revenue by Month</div>
              {loading?<Skel h={150}/>:trendData.length===0?<div className="empty">No data</div>:(
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={trendData} margin={{top:4,right:4,left:-28,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false}/>
                    <XAxis dataKey="month" tick={{fontSize:7,fill:"#aab2c0"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:7,fill:"#aab2c0"}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CT/>}/>
                    <Bar dataKey="revenue" fill={C.teal} radius={[4,4,0,0]} opacity={0.85}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
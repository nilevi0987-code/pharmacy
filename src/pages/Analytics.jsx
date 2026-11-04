import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from "recharts";
import api from "../services/api";

const COLORS = ["#6366f1","#00b89c","#f59e0b","#ef4444","#0080ff","#f43f5e","#8b5cf6","#10b981"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  .an { padding: 10px 16px; font-family: 'Plus Jakarta Sans', sans-serif; background: #f4f7fb; height: calc(100vh - 52px); overflow: hidden; display: flex; flex-direction: column; color: #0d1b2a; }

  /* HEADER */
  .an-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; flex-shrink:0; }
  .an-hdr h1 { font-size:15px; font-weight:800; color:#0d1b2a; letter-spacing:-0.4px; margin:0 0 1px; }
  .an-hdr p { font-size:9px; color:#8a9ab5; margin:0; }
  .an-pill { background:#fff; border:1px solid #e3eaf2; border-radius:7px; padding:4px 9px; font-size:9px; color:#8a9ab5; font-weight:600; }

  /* KPI — compact clickable */
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; margin-bottom:8px; flex-shrink:0; }
  .kpi-card { background:#fff; border-radius:9px; padding:9px 12px; border:1px solid #e8eef5; box-shadow:0 1px 3px rgba(0,0,0,0.04); position:relative; overflow:hidden; cursor:pointer; transition:transform 0.15s,box-shadow 0.15s; display:flex; align-items:center; gap:10px; }
  .kpi-card:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,0.08); }
  .kpi-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:3px; border-radius:9px 0 0 9px; }
  .kpi-card.k1::before{background:#00e5c0;} .kpi-card.k2::before{background:#6366f1;}
  .kpi-card.k3::before{background:#f59e0b;} .kpi-card.k4::before{background:#ef4444;}
  .kpi-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
  .kpi-icon.k1{background:rgba(0,229,192,0.1);} .kpi-icon.k2{background:rgba(99,102,241,0.1);}
  .kpi-icon.k3{background:rgba(245,158,11,0.1);} .kpi-icon.k4{background:rgba(239,68,68,0.1);}
  .kpi-body { flex:1; min-width:0; }
  .kpi-val { font-size:16px; font-weight:800; color:#0d1b2a; letter-spacing:-0.5px; line-height:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .kpi-lbl { font-size:8px; color:#8a9ab5; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; }

  /* MAIN GRID */
  .main-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:7px; margin-bottom:7px; flex-shrink:0; }
  .bottom-grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; gap:7px; flex-shrink:0; }

  /* PANELS */
  .panel { background:#fff; border-radius:9px; padding:10px 12px; border:1px solid #e8eef5; box-shadow:0 1px 3px rgba(0,0,0,0.04); overflow:hidden; }
  .pt { font-size:11px; font-weight:800; color:#0d1b2a; margin:0 0 1px; }
  .ps { font-size:9px; color:#8a9ab5; margin:0 0 7px; }

  /* DIVIDER STAT between charts */
  .mid-stats { display:flex; flex-direction:column; justify-content:space-around; gap:6px; }
  .mid-stat { background:#f8fafc; border-radius:8px; padding:8px 10px; border:1px solid #e8eef5; text-align:center; }
  .mid-stat-val { font-size:15px; font-weight:800; color:#0d1b2a; line-height:1; }
  .mid-stat-lbl { font-size:8px; color:#8a9ab5; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; margin-top:2px; }
  .mid-stat-sub { font-size:8px; margin-top:1px; font-weight:600; }

  /* TABLE */
  .tbl { width:100%; border-collapse:collapse; }
  .tbl th { font-size:8px; font-weight:700; color:#b0bfcc; text-transform:uppercase; letter-spacing:0.5px; padding:0 0 6px; text-align:left; border-bottom:1px solid #f0f4f8; }
  .tbl td { padding:5px 0; font-size:10px; border-bottom:1px solid #f8fafc; vertical-align:middle; }
  .tbl tr:last-child td { border-bottom:none; }
  .tbl tr:hover td { background:#fafcff; }
  .tbl-top3 td { background:#fffbeb !important; }
  .rank { width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:800; flex-shrink:0; }
  .cat-chip { font-size:8px; font-weight:700; padding:1px 5px; border-radius:20px; background:#e0e7ff; color:#4338ca; }

  /* STOCK */
  .stock-row { display:flex; align-items:center; gap:7px; padding:5px 0; border-bottom:1px solid #f4f7fb; }
  .stock-row:last-child { border-bottom:none; }
  .stock-bar-wrap { flex:1; height:3px; background:#f0f4f8; border-radius:2px; overflow:hidden; }
  .stock-bar { height:100%; border-radius:2px; }
  .stock-badge { font-size:8px; font-weight:800; padding:1px 6px; border-radius:20px; white-space:nowrap; }
  .stock-badge.out,.stock-badge.critical{background:#fee2e2;color:#dc2626;}
  .stock-badge.low{background:#fef3c7;color:#b45309;}

  /* INSIGHTS */
  .ins-card { border-radius:8px; padding:8px 10px; border:1px solid; }
  .ins-card.blue{background:#eff6ff;border-color:#bfdbfe;}
  .ins-card.green{background:#f0fdf4;border-color:#bbf7d0;}
  .ins-card.amber{background:#fffbeb;border-color:#fde68a;}
  .ins-card.red{background:#fff1f2;border-color:#fecdd3;}
  .ins-card.purple{background:#f5f3ff;border-color:#ddd6fe;}
  .ins-ico { font-size:14px; margin-bottom:3px; }
  .ins-ttl { font-size:8px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.4px; }
  .ins-val { font-size:12px; font-weight:800; color:#0d1b2a; line-height:1.2; margin:2px 0; }
  .ins-desc { font-size:8px; color:#9ca3af; }

  /* TOOLTIP */
  .ctt { background:#0d1b2a; border-radius:7px; padding:6px 9px; }
  .ctt p { margin:0; font-size:10px; font-weight:700; color:#fff; font-family:'Plus Jakarta Sans',sans-serif; }
  .ctt span { color:#00e5c0; }

  .skeleton { background:linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; border-radius:7px; }
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .empty { text-align:center; padding:16px 0; color:#8a9ab5; font-size:10px; font-weight:600; }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="ctt">
      <p>{label}</p>
      <p>KES <span>{Number(payload[0].value).toLocaleString()}</span></p>
    </div>
  );
  return null;
};

function fillTrend(trend) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-KE", { weekday:"short", day:"2-digit" });
    const found = trend.find(t => t.date === label);
    result.push({ date: label, revenue: found ? found.revenue : 0 });
  }
  return result;
}

export default function Analytics() {
  const navigate  = useNavigate();
  const [summary,    setSummary]    = useState(null);
  const [trend,      setTrend]      = useState([]);
  const [topMeds,    setTopMeds]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [lowStock,   setLowStock]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics.php?action=summary'),
      api.get('/analytics.php?action=sales_trend'),
      api.get('/analytics.php?action=top_medicines'),
      api.get('/analytics.php?action=category_breakdown'),
      api.get('/analytics.php?action=low_stock'),
    ]).then(([s,t,m,c,l]) => {
      setSummary(s.data.data);
      setTrend(t.data.data||[]);
      setTopMeds(m.data.data||[]);
      setCategories(c.data.data||[]);
      setLowStock(l.data.data||[]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const dateStr   = new Date().toLocaleDateString("en-KE",{weekday:"short",year:"numeric",month:"short",day:"numeric"});
  const trendData = fillTrend(trend);
  const donutData = categories.map(c=>({name:c.category,value:c.total_sold}));
  const barData   = topMeds.slice(0,6).map(m=>({name:m.name.length>12?m.name.slice(0,12)+"…":m.name, units:m.total_sold}));
  const revenues  = trendData.map(d=>d.revenue);
  const recentAvg = revenues.slice(-3).reduce((a,b)=>a+b,0)/3;
  const prevAvg   = revenues.slice(0,3).reduce((a,b)=>a+b,0)/3;
  const trendDir  = recentAvg>=prevAvg?"📈 Upward":"📉 Downward";

  const kpis = summary ? [
    {cls:"k1",icon:"💰",val:`KES ${Number(summary.month_revenue).toLocaleString()}`,lbl:"Month Revenue",path:"/sales-history"},
    {cls:"k2",icon:"🧾",val:summary.total_sales.toLocaleString(),                   lbl:"Total Sales",   path:"/sales-history"},
    {cls:"k3",icon:"📦",val:(summary.total_units||0).toLocaleString(),              lbl:"Units Sold",    path:"/inventory"},
    {cls:"k4",icon:"⚠️",val:summary.low_stock_count,                               lbl:"Low Stock",     path:"/inventory"},
  ] : [];

  const insights = summary ? [
    {cls:"blue",  ico:"💊",ttl:"Top Medicine", val:topMeds[0]?.name||"—",           desc:"Most units sold"},
    {cls:"green", ico:"🏷️",ttl:"Top Category", val:categories[0]?.category||"—",    desc:"Highest volume"},
    {cls:"purple",ico:"📦",ttl:"Units Sold",   val:(summary.total_units||0).toLocaleString(), desc:"All medicines"},
    {cls:"amber", ico:"📈",ttl:"Trend",        val:trendDir,                         desc:"Last vs first 3 days"},
    {cls:"red",   ico:"⚠️",ttl:"Low Stock",   val:`${summary.low_stock_count} items`,desc:"Need restocking"},
  ] : [];

  return (
    <>
      <style>{styles}</style>
      <div className="an">

        {/* HEADER */}
        <div className="an-hdr">
          <div>
            <h1>📊 Analytics Dashboard</h1>
            <p>Real-time pharmacy performance overview</p>
          </div>
          <div className="an-pill">📅 {dateStr}</div>
        </div>

        {/* KPI CARDS — compact horizontal */}
        <div className="kpi-grid">
          {loading?[1,2,3,4].map(i=>(
            <div key={i} className="kpi-card k1">
              <div className="skeleton" style={{width:30,height:30,borderRadius:8,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div className="skeleton" style={{height:16,width:"70%",marginBottom:5}}/>
                <div className="skeleton" style={{height:8,width:"50%"}}/>
              </div>
            </div>
          )):kpis.map((k,i)=>(
            <div key={i} className={`kpi-card ${k.cls}`} onClick={()=>navigate(k.path)}>
              <div className={`kpi-icon ${k.cls}`}>{k.icon}</div>
              <div className="kpi-body">
                <div className="kpi-val">{k.val}</div>
                <div className="kpi-lbl">{k.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN ROW — Sales Chart | Mid Stats | Category Donut */}
        <div className="main-grid">

          {/* Sales Line Chart */}
          <div className="panel">
            <p className="pt">📈 Sales Revenue — Last 7 Days</p>
            <p className="ps">Daily revenue trend in KES</p>
            {loading?<div className="skeleton" style={{height:110}}/>:
            trendData.every(d=>d.revenue===0)?<div className="empty">No sales in last 7 days</div>:(
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={trendData} margin={{top:4,right:4,left:-28,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:7,fill:"#8a9ab5",fontWeight:600}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:7,fill:"#8a9ab5"}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2}
                    dot={{fill:"#6366f1",r:3,strokeWidth:2,stroke:"#fff"}}
                    activeDot={{r:4,fill:"#6366f1"}}/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* MID STATS — between the two charts */}
          <div className="panel mid-stats">
            {loading?[1,2,3].map(i=><div key={i} className="skeleton" style={{height:52}}/>):
            summary&&[
              {val:`KES ${Number(summary.today_revenue).toLocaleString()}`, lbl:"Today's Revenue",  sub:`${summary.today_sales} sales today`, color:"#00b89c", path:"/sales-history"},
              {val:`KES ${Number(summary.month_revenue).toLocaleString()}`, lbl:"Month Revenue",     sub:"this month",                         color:"#6366f1", path:"/sales-history"},
              {val:summary.expiring_soon,                                    lbl:"Expiring in 60d",  sub:"medicines",                          color:"#f59e0b", path:"/expired"},
            ].map((s,i)=>(
              <div key={i} className="mid-stat" onClick={()=>navigate(s.path)} style={{cursor:"pointer",transition:"transform 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                <div className="mid-stat-val" style={{color:s.color}}>{s.val}</div>
                <div className="mid-stat-lbl">{s.lbl}</div>
                <div className="mid-stat-sub" style={{color:s.color}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Category Donut */}
          <div className="panel">
            <p className="pt">🍩 Sales by Category</p>
            <p className="ps">Units sold per drug category</p>
            {loading?<div className="skeleton" style={{height:110}}/>:
            donutData.length===0?<div className="empty">No sales data yet</div>:(
              <ResponsiveContainer width="100%" height={110}>
                <PieChart>
                  <Pie data={donutData} cx="40%" cy="50%" innerRadius={30} outerRadius={52} paddingAngle={2} dataKey="value">
                    {donutData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[`${v} units`,n]} contentStyle={{borderRadius:8,border:"1px solid #e8eef5",fontSize:9}}/>
                  <Legend iconType="circle" iconSize={5} formatter={v=><span style={{fontSize:8,fontWeight:600,color:"#5a6a80"}}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* BOTTOM ROW — Top Medicines Bar | Low Stock | Insights x3 */}
        <div className="bottom-grid">

          {/* Top Medicines Bar Chart */}
          <div className="panel" style={{gridColumn:"span 2"}}>
            <p className="pt">🏆 Top Selling Medicines</p>
            <p className="ps">Units sold — top 6</p>
            {loading?<div className="skeleton" style={{height:130}}/>:
            barData.length===0?<div className="empty">No sales yet</div>:(
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={barData} margin={{top:4,right:4,left:-24,bottom:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false}/>
                  <XAxis dataKey="name" tick={{fontSize:7,fill:"#8a9ab5",fontWeight:600}} axisLine={false} tickLine={false} angle={-20} textAnchor="end"/>
                  <YAxis tick={{fontSize:7,fill:"#8a9ab5"}} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={v=>[`${v} units`,"Sold"]} contentStyle={{borderRadius:8,border:"1px solid #e8eef5",fontSize:9}}/>
                  <Bar dataKey="units" radius={[4,4,0,0]}>
                    {barData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Low Stock */}
          <div className="panel">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:1}}>
              <p className="pt" style={{margin:0}}>⚠️ Low Stock</p>
              {lowStock.length>0&&<button onClick={()=>navigate("/inventory")} style={{fontSize:8,fontWeight:700,color:"#6366f1",background:"#e0e7ff",border:"none",borderRadius:5,padding:"2px 6px",cursor:"pointer",fontFamily:"inherit"}}>Restock →</button>}
            </div>
            <p className="ps">Below reorder level</p>
            {loading?<div className="skeleton" style={{height:130}}/>:
            lowStock.length===0?<div className="empty">✅ All healthy!</div>:
            lowStock.slice(0,5).map((m,i)=>{
              const st=m.stock===0?"out":m.stock<=m.min_stock/2?"critical":"low";
              const pct=Math.min((m.stock/m.min_stock)*100,100);
              return(
                <div key={i} className="stock-row" style={{cursor:"pointer"}} onClick={()=>navigate("/inventory")}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:st==="out"||st==="critical"?"#ef4444":"#f59e0b",flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:9,color:"#0d1b2a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name}</div>
                    <div className="stock-bar-wrap" style={{marginTop:2}}>
                      <div className="stock-bar" style={{width:`${pct}%`,background:st==="out"||st==="critical"?"#ef4444":"#f59e0b"}}/>
                    </div>
                  </div>
                  <span className={`stock-badge ${st}`}>{m.stock===0?"Out":`${m.stock}`}</span>
                </div>
              );
            })}
          </div>

          {/* Insights x2 */}
          {loading?[1,2].map(i=><div key={i} className="skeleton" style={{borderRadius:9}}/>):
          insights.slice(0,2).map((ins,i)=>(
            <div key={i} className={`ins-card ${ins.cls}`}>
              <div className="ins-ico">{ins.ico}</div>
              <div className="ins-ttl">{ins.ttl}</div>
              <div className="ins-val">{ins.val}</div>
              <div className="ins-desc">{ins.desc}</div>
            </div>
          ))}

        </div>

      </div>
    </>
  );
}
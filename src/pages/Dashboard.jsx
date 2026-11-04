import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import api from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .dash { padding: 16px 20px; font-family: 'Plus Jakarta Sans', sans-serif; background: #f4f7fb; min-height: 100vh; color: #0d1b2a; }

  .dh { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .dh-greet { font-size:18px; font-weight:800; color:#0d1b2a; letter-spacing:-0.4px; }
  .dh-greet span { color:#00b89c; }
  .dh-sub { font-size:11px; color:#8a9ab5; margin-top:2px; font-weight:500; }
  .dh-sub strong { color:#f97316; }
  .dh-pill { background:#fff; border:1px solid #e3eaf2; border-radius:8px; padding:6px 12px; font-size:10px; color:#8a9ab5; font-weight:600; }

  /* KPI 6-col — NO sparklines, clean */
  .kpi6 { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; margin-bottom:10px; }
  .kc { background:#fff; border-radius:10px; padding:12px 14px; border:1px solid #e8eef5; position:relative; overflow:hidden; cursor:pointer; transition:transform 0.15s,box-shadow 0.15s; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
  .kc:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.07); }
  .kc::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; border-radius:10px 10px 0 0; background:#6366f1; }
  .kc-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .kc-lbl { font-size:9px; font-weight:700; color:#8a9ab5; text-transform:uppercase; letter-spacing:0.5px; }
  .kc-chip { font-size:9px; font-weight:700; padding:2px 6px; border-radius:20px; }
  .kc-chip.up{background:#d1fae5;color:#065f46;} .kc-chip.warn{background:#fff7ed;color:#c2410c;}
  .kc-val { font-size:22px; font-weight:800; color:#0d1b2a; letter-spacing:-0.6px; line-height:1; }
  .kc-sub { font-size:9px; color:#b0bfcc; margin-top:4px; font-weight:600; }

  /* QUICK ACTIONS */
  .qa { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:10px; }
  .qa-btn { background:#fff; border:1px solid #e8eef5; border-radius:9px; padding:10px 8px; display:flex; align-items:center; gap:8px; cursor:pointer; transition:all 0.15s; font-family:'Plus Jakarta Sans',sans-serif; }
  .qa-btn:hover { border-color:#6366f1; box-shadow:0 4px 14px rgba(99,102,241,0.1); }
  .qa-ico { font-size:16px; flex-shrink:0; }
  .qa-lbl { font-size:11px; font-weight:700; color:#5a6a80; }

  /* PANELS */
  .panel { background:#fff; border-radius:12px; padding:14px 16px; border:1px solid #e8eef5; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
  .pt { font-size:12px; font-weight:800; color:#0d1b2a; margin-bottom:2px; }
  .ps { font-size:10px; color:#8a9ab5; margin-bottom:10px; }

  /* GRID ROWS */
  .row { display:grid; gap:8px; margin-bottom:8px; }
  .r3  { grid-template-columns:1fr 1fr 1fr; }
  .r211{ grid-template-columns:2fr 1fr 1fr; }
  .r2  { grid-template-columns:1fr 1fr; }

  /* ACTIVITY */
  .al { display:flex; flex-direction:column; }
  .ar { display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid #f4f7fb; }
  .ar:last-child { border-bottom:none; }
  .ai { width:24px; height:24px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
  .ai.g{background:#d1fae5;} .ai.b{background:#ede9fe;} .ai.a{background:#fef3c7;} .ai.r{background:#fee2e2;}
  .ab { flex:1; min-width:0; }
  .at { font-size:11px; font-weight:700; color:#0d1b2a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .am { font-size:10px; color:#8a9ab5; margin-top:1px; }
  .ati { font-size:9px; color:#c0cfd8; font-weight:600; white-space:nowrap; }

  /* TABLES */
  .mt { width:100%; border-collapse:collapse; }
  .mt th { font-size:9px; font-weight:700; color:#b0bfcc; text-transform:uppercase; letter-spacing:0.6px; padding-bottom:8px; text-align:left; border-bottom:1px solid #f0f4f8; }
  .mt td { padding:6px 0; font-size:11px; border-bottom:1px solid #f8fafc; vertical-align:middle; }
  .mt tr:last-child td { border-bottom:none; }
  .mt tr:hover td { background:#fafcff; cursor:pointer; }
  .dn { font-weight:700; color:#0d1b2a; font-size:11px; }
  .dc { font-size:9px; color:#b0bfcc; margin-top:1px; }
  .sw { width:50px; height:4px; background:#f0f4f8; border-radius:2px; overflow:hidden; }
  .sb { height:100%; border-radius:2px; }
  .sb.critical{background:#ef4444;} .sb.low{background:#f59e0b;}
  .chip { display:inline-flex; padding:2px 7px; border-radius:20px; font-size:9px; font-weight:700; }
  .chip.critical{background:#fee2e2;color:#dc2626;} .chip.low{background:#fef3c7;color:#b45309;}
  .chip.purple{background:#e0e7ff;color:#4338ca;}
  .sc{font-size:10px;font-weight:800;padding:3px 8px;border-radius:20px;}
  .sc.red{background:#fee2e2;color:#dc2626;} .sc.amber{background:#fef3c7;color:#b45309;}

  .skeleton{background:linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%);background-size:200% 100%;animation:shimmer 1.2s infinite;border-radius:6px;}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .empty{text-align:center;padding:20px 0;color:#8a9ab5;font-size:11px;font-weight:600;}

  @media(max-width:1200px){
    .kpi6{grid-template-columns:repeat(3,1fr);}
    .r211,.r3{grid-template-columns:1fr 1fr;}
  }
  @media(max-width:800px){
    .kpi6{grid-template-columns:repeat(2,1fr);}
    .r2,.r3,.r211,.qa{grid-template-columns:1fr;}
    .dash{padding:10px 12px;}
  }
`;

const DONUT_COLORS = ["#6366f1","#00b89c","#f59e0b","#f43f5e","#0080ff","#10b981"];

function timeAgo(d) {
  const s = Math.floor((new Date()-new Date(d))/1000);
  if(s<60) return `${s}s ago`;
  if(s<3600) return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

const renderLabel = ({cx,cy,midAngle,innerRadius,outerRadius,percent}) => {
  if(percent<0.06) return null;
  const R=Math.PI/180, r=innerRadius+(outerRadius-innerRadius)*0.5;
  return <text x={cx+r*Math.cos(-midAngle*R)} y={cy+r*Math.sin(-midAngle*R)} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>{`${(percent*100).toFixed(0)}%`}</text>;
};

// Fill missing days in trend so all 7 always show
function fillTrend(trend) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-KE", { weekday:"short", day:"2-digit" });
    const found = trend.find(t => t.date === label);
    result.push({ date: label, revenue: found ? found.revenue : 0, num_sales: found ? found.num_sales : 0 });
  }
  return result;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api.get('/dashboard/index.php')
      .then(r=>setStats(r.data.data))
      .catch(()=>setStats(null))
      .finally(()=>setLoading(false));
  },[]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-KE",{weekday:"short",year:"numeric",month:"short",day:"numeric"});
  const hour = now.getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";

  const trendData = fillTrend(stats?.sales_trend||[]);
  const donutData = stats?.top_medicines?.map(m=>({name:m.medicine_name,value:parseInt(m.units)}))||[];

  const kpis = stats ? [
    {lbl:"Drugs in Stock",   val:stats.total_medicines.toLocaleString(),              chip:`${stats.low_stock} low`,            chipCls:stats.low_stock>0?"warn":"up", path:"/inventory",     sub:`${stats.out_of_stock} out of stock`},
    {lbl:"Pending Rx",       val:stats.pending_rx,                                    chip:"View",                              chipCls:"up",                          path:"/prescriptions", sub:"awaiting dispensing"},
    {lbl:"Today's Revenue",  val:`KES ${Number(stats.today_sales).toLocaleString()}`, chip:`${stats.today_transactions} sales`, chipCls:"up",                          path:"/sales-history", sub:"today"},
    {lbl:"Expiring/Expired", val:stats.expiring_soon+stats.expired,                  chip:"Act now",                           chipCls:"warn",                        path:"/expired",       sub:`${stats.expired} already expired`},
    {lbl:"Total Patients",   val:stats.total_patients.toLocaleString(),               chip:"View",                              chipCls:"up",                          path:"/patients",      sub:"registered"},
    {lbl:"Active Suppliers", val:stats.total_suppliers.toLocaleString(),              chip:"View",                              chipCls:"up",                          path:"/suppliers",     sub:"active"},
  ] : [];

  return (
    <>
      <style>{styles}</style>
      <div className="dash">


        {/* HEADER */}
        <div className="dh">
          <div>
            <div className="dh-greet">{greeting}, <span>Pharmacist </span></div>
            <div className="dh-sub">{stats?<>Snapshot — <strong>{stats.low_stock} stock alerts</strong> need attention</>:"Loading..."}</div>
          </div>
          <div className="dh-pill">📅 {dateStr}</div>
        </div>

        <div className="kpi6">
          {loading?[1,2,3,4,5,6].map(i=>(
            <div key={i} className="kc">
              <div className="skeleton" style={{height:9,width:"50%",marginBottom:8}}/>
              <div className="skeleton" style={{height:22,width:"60%",marginBottom:6}}/>
              <div className="skeleton" style={{height:9,width:"40%"}}/>
            </div>
          )):kpis.map((k,i)=>(
            <div key={i} className="kc" onClick={()=>navigate(k.path)}>
              <div className="kc-top">
                <div className="kc-lbl">{k.lbl}</div>
                <span className={`kc-chip ${k.chipCls}`}>{k.chip}</span>
              </div>
              <div className="kc-val">{k.val}</div>
              <div className="kc-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="qa">
          {[
            {icon:"",label:"New Prescription",path:"/prescriptions"},
            {icon:"",label:"New Sale",path:"/sales"},
            {icon:"",label:"Add Stock",path:"/inventory"},
            {icon:"",label:"Register Patient",path:"/patients"},
          ].map(a=>(
            <button key={a.label} className="qa-btn" onClick={()=>navigate(a.path)}>
              <span className="qa-ico">{a.icon}</span>
              <span className="qa-lbl">{a.label}</span>
            </button>
          ))}
        </div>

        {/* ROW 1 — Sales Trend | Top Medicines | Top Patients */}
        <div className="row r3" style={{marginBottom:8}}>

          {/* Sales Trend — all 7 days */}
          <div className="panel">
            <div className="pt"> Sales Trend</div>
            <div className="ps">Revenue — last 7 days</div>
            {loading?<div className="skeleton" style={{height:130}}/>:(
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={trendData} barSize={18} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:8,fill:"#8a9ab5",fontWeight:600}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:8,fill:"#8a9ab5"}} axisLine={false} tickLine={false}/>
                  <Tooltip
                    formatter={v=>[`KES ${Number(v).toLocaleString()}`,"Revenue"]}
                    contentStyle={{borderRadius:8,border:"1px solid #e8eef5",fontSize:10}}
                    cursor={{fill:"#f4f7fb"}}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Medicines Donut */}
          <div className="panel">
            <div className="pt"> Top Medicines</div>
            <div className="ps">Units sold this month</div>
            {loading?<div className="skeleton" style={{height:130}}/>:
            donutData.length===0?<div className="empty">No sales data yet</div>:(
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={donutData} cx="40%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={3} dataKey="value" labelLine={false} label={renderLabel}>
                    {donutData.map((_,i)=><Cell key={i} fill={DONUT_COLORS[i%DONUT_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[`${v} units`,n]} contentStyle={{borderRadius:8,border:"1px solid #e8eef5",fontSize:10}}/>
                  <Legend iconType="circle" iconSize={6} layout="vertical" align="right" verticalAlign="middle" formatter={v=><span style={{fontSize:9,fontWeight:600,color:"#5a6a80"}}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Patients */}
          <div className="panel">
            <div className="pt"> Top Patients</div>
            <div className="ps">Most frequent customers</div>
            {loading?<div className="skeleton" style={{height:130}}/>:
            stats?.top_patients?.length?(
              <table className="mt">
                <thead><tr><th>#</th><th>Patient</th><th>Visits</th><th>Spent</th></tr></thead>
                <tbody>
                  {stats.top_patients.map((p,i)=>(
                    <tr key={i}>
                      <td style={{color:"#b0bfcc",fontWeight:800,fontSize:10}}>{i+1}</td>
                      <td><div className="dn">{p.customer_name}</div></td>
                      <td><span className="chip purple">{p.visits}x</span></td>
                      <td style={{fontWeight:700,color:"#16a34a",fontSize:11}}>KES {parseFloat(p.total_spent).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ):<div className="empty">No patient data yet</div>}
          </div>
        </div>

        {/* ROW 2 — Recent Sales | Activity Feed | Restocked */}
        <div className="row r211" style={{marginBottom:8}}>

          <div className="panel">
            <div className="pt"> Recent Sales</div>
            <div className="ps">Latest transactions</div>
            <div className="al">
              {loading?[1,2,3,4].map(i=>(
                <div key={i} className="ar">
                  <div className="skeleton" style={{width:24,height:24,borderRadius:6,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div className="skeleton" style={{height:10,width:"75%",marginBottom:4}}/>
                    <div className="skeleton" style={{height:9,width:"55%"}}/>
                  </div>
                </div>
              )):stats?.recent_sales?.length?stats.recent_sales.map((s,i)=>(
                <div key={i} className="ar">
                  <div className="ai g"></div>
                  <div className="ab">
                    <div className="at">#{s.sale_number}</div>
                    <div className="am">{s.customer_name} · KES {parseFloat(s.total).toLocaleString()}</div>
                  </div>
                  <div className="ati">{timeAgo(s.created_at)}</div>
                </div>
              )):<div className="empty">No sales yet today</div>}
            </div>
          </div>

          <div className="panel">
            <div className="pt"> Activity Feed</div>
            <div className="ps">Recent events</div>
            <div className="al">
              {loading?[1,2,3,4].map(i=>(
                <div key={i} className="ar">
                  <div className="skeleton" style={{width:24,height:24,borderRadius:6,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div className="skeleton" style={{height:10,width:"75%",marginBottom:4}}/>
                    <div className="skeleton" style={{height:9,width:"55%"}}/>
                  </div>
                </div>
              )):stats?.activity_feed?.length?stats.activity_feed.map((a,i)=>(
                <div key={i} className="ar">
                  <div className={`ai ${a.type==="sale"?"g":"b"}`}>{a.type==="sale"?"🛒":"📦"}</div>
                  <div className="ab">
                    <div className="at">{a.subject}</div>
                    <div className="am">{a.detail}</div>
                  </div>
                  <div className="ati">{timeAgo(a.created_at)}</div>
                </div>
              )):<div className="empty">No recent activity</div>}
            </div>
          </div>

          <div className="panel">
            <div className="pt"> Restocked</div>
            <div className="ps">Latest additions</div>
            <div className="al">
              {loading?[1,2,3].map(i=>(
                <div key={i} className="ar">
                  <div className="skeleton" style={{width:24,height:24,borderRadius:6,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div className="skeleton" style={{height:10,width:"75%",marginBottom:4}}/>
                    <div className="skeleton" style={{height:9,width:"55%"}}/>
                  </div>
                </div>
              )):stats?.recent_restock?.length?stats.recent_restock.map((r,i)=>(
                <div key={i} className="ar">
                  <div className="ai b"></div>
                  <div className="ab">
                    <div className="at">{r.medicine_name}</div>
                    <div className="am">+{r.quantity_change} units · {r.stock_after} in stock</div>
                  </div>
                  <div className="ati">{timeAgo(r.created_at)}</div>
                </div>
              )):<div className="empty">No restocks yet</div>}
            </div>
          </div>
        </div>

        {/* ROW 3 — Low Stock | Expiring */}
        <div className="row r2">

          <div className="panel">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div><div className="pt">Low Stock</div><div className="ps" style={{marginBottom:0}}>Below reorder level</div></div>
              <span className="sc red">{stats?.low_stock_list?.length||0} items</span>
            </div>
            {loading?<div className="skeleton" style={{height:100}}/>:(
              <table className="mt">
                <thead><tr><th>Drug</th><th>Units</th><th>Level</th><th>Status</th></tr></thead>
                <tbody>
                  {stats?.low_stock_list?.length?stats.low_stock_list.slice(0,5).map((d,i)=>{
                    const s=d.stock===0?"critical":d.stock<=d.min_stock/2?"critical":"low";
                    return(
                      <tr key={i} onClick={()=>navigate("/inventory")}>
                        <td><div className="dn">{d.name}</div><div className="dc">{d.category}</div></td>
                        <td style={{fontWeight:700,color:s==="critical"?"#ef4444":"#f59e0b",fontSize:11}}>{d.stock}</td>
                        <td><div className="sw"><div className={`sb ${s}`} style={{width:`${Math.min((d.stock/d.min_stock)*100,100)}%`}}/></div></td>
                        <td><span className={`chip ${s}`}>{s}</span></td>
                      </tr>
                    );
                  }):<tr><td colSpan={4} style={{textAlign:"center",padding:14,color:"#8a9ab5",fontSize:11}}>All stock OK ✅</td></tr>}
                </tbody>
              </table>
            )}
          </div>

          <div className="panel">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div><div className="pt">📅 Expiring Soon</div><div className="ps" style={{marginBottom:0}}>Within 30 days</div></div>
              <span className="sc amber">{stats?.expiring_soon||0} items</span>
            </div>
            {loading?<div className="skeleton" style={{height:100}}/>:
            stats?.expiring_soon>0?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div onClick={()=>navigate("/expired")} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"#fef3c7",borderRadius:8,cursor:"pointer"}}>
                  <span style={{fontSize:15}}></span>
                  <div>
                    <div style={{fontWeight:700,color:"#b45309",fontSize:12}}>{stats.expiring_soon} expiring within 30 days</div>
                    <div style={{fontSize:10,color:"#92400e",marginTop:1}}>Click to view details</div>
                  </div>
                </div>
                {stats.expired>0&&(
                  <div onClick={()=>navigate("/expired")} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"#fee2e2",borderRadius:8,cursor:"pointer"}}>
                    <span style={{fontSize:15}}></span>
                    <div>
                      <div style={{fontWeight:700,color:"#dc2626",fontSize:12}}>{stats.expired} already expired!</div>
                      <div style={{fontSize:10,color:"#b91c1c",marginTop:1}}>Click to remove from shelves</div>
                    </div>
                  </div>
                )}
              </div>
            ):<div className="empty">✅ No medicines expiring soon</div>}
          </div>
        </div>

      </div>
    </>
  );
}
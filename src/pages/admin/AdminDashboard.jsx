import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../../services/api";

const DONUT_COLORS = ["#6366f1","#00b89c","#f59e0b","#f43f5e","#0080ff","#10b981"];

function timeAgo(d) {
  const s = Math.floor((new Date() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fillTrend(trend) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-KE", { weekday: "short", day: "2-digit" });
    const found = trend.find(t => t.date === label);
    result.push({ date: label, revenue: found ? found.revenue : 0 });
  }
  return result;
}

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const R = Math.PI / 180, r = innerRadius + (outerRadius - innerRadius) * 0.5;
  return <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/index.php')
      .then(res => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const kpis = stats ? [
    { label: "Total Medicines",  val: stats.total_medicines.toLocaleString(),                      sub: `${stats.low_stock} low · ${stats.out_of_stock} out`,  color: "#00b89c", path: "/inventory"      },
    { label: "Total Patients",   val: stats.total_patients.toLocaleString(),                       sub: "registered patients",                                   color: "#6366f1", path: "/patients"       },
    { label: "Today's Revenue",  val: `KES ${parseFloat(stats.today_sales).toLocaleString()}`,     sub: `${stats.today_transactions} transactions today`,        color: "#f59e0b", path: "/sales-history"  },
    { label: "Expiry Alerts",    val: (stats.expiring_soon + stats.expired).toString(),            sub: `${stats.expired} already expired`,                      color: "#f43f5e", path: "/expired"        },
    { label: "Active Suppliers", val: stats.total_suppliers.toLocaleString(),                      sub: "active suppliers",                                      color: "#0080ff", path: "/suppliers"      },
    { label: "Pending Rx",       val: stats.pending_rx.toString(),                                 sub: "awaiting dispensing",                                   color: "#10b981", path: "/prescriptions"  },
  ] : [];

  const quickActions = [
    { label: "User Management",  sub: "Manage system users",    path: "/admin/users",    color: "#6366f1" },
    { label: "View Reports",     sub: "Sales & analytics",      path: "/reports",        color: "#00b89c" },
    { label: "Inventory",        sub: "Browse medicines",        path: "/inventory",      color: "#f59e0b" },
    { label: "Audit Logs",       sub: "System activity trail",   path: "/admin/audit",    color: "#f43f5e" },
    { label: "Sales History",    sub: "All transactions",        path: "/sales-history",  color: "#0080ff" },
    { label: "Patients",         sub: "Patient records",         path: "/patients",       color: "#10b981" },
    { label: "Suppliers",        sub: "Supplier directory",      path: "/suppliers",      color: "#f97316" },
    { label: "Settings",         sub: "System preferences",      path: "/settings",       color: "#8b5cf6" },
  ];

  const donutData = stats?.top_medicines?.map(m => ({ name: m.medicine_name, value: parseInt(m.units) })) || [];
  const trendData = fillTrend(stats?.sales_trend || []);

  const skeleton = (h = 12, w = "100%") => (
    <div style={{ height: h, width: w, borderRadius: 6, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite" }} />
  );

  const panel = (children, extra = {}) => (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8eef5", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: "18px 20px", ...extra }}>
      {children}
    </div>
  );

  return (
    <div style={{ padding: "24px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh", boxSizing: "border-box" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .akc:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .aqa:hover { transform: translateY(-1px); border-color: var(--c) !important; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
        .amt tr:hover td { background: #fafcff; cursor: pointer; }
        .aar:hover { background: #f8fafc; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "#8a9ab5", margin: 0 }}>
            Welcome back, <strong style={{ color: "#6366f1" }}>{user?.name || "System Admin"}</strong> &middot; {dateStr}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/admin/users")} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: "#6366f1", color: "#fff" }}>
            Manage Users
          </button>
          <button onClick={logout} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid #e3eaf2", background: "#fff", color: "#f43f5e" }}>
            Logout
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 16 }}>
        {loading ? [1,2,3,4,5,6].map(i => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8eef5", padding: "18px 16px" }}>
            {skeleton(10, "55%")}
            <div style={{ marginTop: 10 }}>{skeleton(26, "65%")}</div>
            <div style={{ marginTop: 8 }}>{skeleton(9, "45%")}</div>
          </div>
        )) : kpis.map((k, i) => (
          <div key={i} className="akc" onClick={() => navigate(k.path)} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8eef5", padding: "18px 16px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: k.color, borderRadius: "14px 14px 0 0" }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.8px", lineHeight: 1, marginBottom: 8 }}>{k.val}</div>
            <div style={{ fontSize: 11, color: "#b0bfcc", fontWeight: 600 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {quickActions.map((a, i) => (
          <button key={i} className="aqa" onClick={() => navigate(a.path)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fff", border: "1.5px solid #e8eef5", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.15s", "--c": a.color }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1b2a" }}>{a.label}</div>
              <div style={{ fontSize: 10, color: "#8a9ab5", marginTop: 2 }}>{a.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ROW 1 — Sales Trend | Top Medicines | Top Patients */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>

        {panel(<>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a", marginBottom: 2 }}>Sales Trend</div>
          <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 14 }}>Revenue — last 7 days</div>
          {loading ? skeleton(170) : (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={trendData} barSize={22} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#8a9ab5", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#8a9ab5" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [`KES ${Number(v).toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 8, border: "1px solid #e8eef5", fontSize: 11 }} cursor={{ fill: "#f4f7fb" }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </>)}

        {panel(<>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a", marginBottom: 2 }}>Top Medicines</div>
          <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 14 }}>Units sold this month</div>
          {loading ? skeleton(170) : donutData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#8a9ab5", fontSize: 12 }}>No sales data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={donutData} cx="40%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" labelLine={false} label={renderLabel}>
                  {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} units`, n]} contentStyle={{ borderRadius: 8, border: "1px solid #e8eef5", fontSize: 11 }} />
                <Legend iconType="circle" iconSize={7} layout="vertical" align="right" verticalAlign="middle" formatter={v => <span style={{ fontSize: 10, fontWeight: 600, color: "#5a6a80" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </>)}

        {panel(<>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a", marginBottom: 2 }}>Top Patients</div>
          <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 14 }}>Most frequent customers</div>
          {loading ? skeleton(170) : stats?.top_patients?.length ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }} className="amt">
              <thead>
                <tr>
                  {["#", "Patient", "Visits", "Spent"].map(h => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#b0bfcc", textTransform: "uppercase", letterSpacing: "0.6px", paddingBottom: 10, textAlign: "left", borderBottom: "1px solid #f0f4f8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.top_patients.map((p, i) => (
                  <tr key={i}>
                    <td style={{ padding: "8px 0", fontSize: 12, color: "#b0bfcc", fontWeight: 800 }}>{i + 1}</td>
                    <td style={{ padding: "8px 0", fontSize: 12, fontWeight: 700, color: "#0d1b2a" }}>{p.customer_name}</td>
                    <td style={{ padding: "8px 0" }}><span style={{ background: "#e0e7ff", color: "#4338ca", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{p.visits}x</span></td>
                    <td style={{ padding: "8px 0", fontSize: 12, fontWeight: 700, color: "#16a34a" }}>KES {parseFloat(p.total_spent).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div style={{ textAlign: "center", padding: "40px 0", color: "#8a9ab5", fontSize: 12 }}>No patient data yet</div>}
        </>)}
      </div>

      {/* ROW 2 — Recent Sales | Activity Feed | Restocked */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>

        {panel(<>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a", marginBottom: 2 }}>Recent Sales</div>
          <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 14 }}>Latest transactions</div>
          {loading ? [1,2,3,4,5].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f4f7fb" }}>
              {skeleton(28, 28)}
              <div style={{ flex: 1 }}>{skeleton(11, "70%")}<div style={{ marginTop: 4 }}>{skeleton(9, "50%")}</div></div>
            </div>
          )) : stats?.recent_sales?.length ? stats.recent_sales.map((s, i) => (
            <div key={i} className="aar" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 6px", borderBottom: "1px solid #f4f7fb", transition: "background 0.15s", borderRadius: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#065f46", flexShrink: 0 }}>S</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0d1b2a" }}>#{s.sale_number}</div>
                <div style={{ fontSize: 11, color: "#8a9ab5", marginTop: 1 }}>{s.customer_name} · KES {parseFloat(s.total).toLocaleString()}</div>
              </div>
              <div style={{ fontSize: 10, color: "#c0cfd8", fontWeight: 600 }}>{timeAgo(s.created_at)}</div>
            </div>
          )) : <div style={{ textAlign: "center", padding: "30px 0", color: "#8a9ab5", fontSize: 12 }}>No sales yet</div>}
        </>)}

        {panel(<>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a", marginBottom: 2 }}>Activity Feed</div>
          <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 14 }}>Recent events</div>
          {loading ? [1,2,3,4].map(i => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f4f7fb" }}>
              {skeleton(28, 28)}<div style={{ flex: 1 }}>{skeleton(11, "70%")}</div>
            </div>
          )) : stats?.activity_feed?.length ? stats.activity_feed.map((a, i) => (
            <div key={i} className="aar" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 6px", borderBottom: "1px solid #f4f7fb", transition: "background 0.15s", borderRadius: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: a.type === "sale" ? "#d1fae5" : "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: a.type === "sale" ? "#065f46" : "#4338ca", flexShrink: 0 }}>{a.type === "sale" ? "S" : "R"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0d1b2a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.subject}</div>
                <div style={{ fontSize: 10, color: "#8a9ab5", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.detail}</div>
              </div>
              <div style={{ fontSize: 10, color: "#c0cfd8", fontWeight: 600 }}>{timeAgo(a.created_at)}</div>
            </div>
          )) : <div style={{ textAlign: "center", padding: "30px 0", color: "#8a9ab5", fontSize: 12 }}>No recent activity</div>}
        </>)}

        {panel(<>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a", marginBottom: 2 }}>Restocked</div>
          <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 14 }}>Latest additions</div>
          {loading ? [1,2,3].map(i => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f4f7fb" }}>
              {skeleton(28, 28)}<div style={{ flex: 1 }}>{skeleton(11, "70%")}</div>
            </div>
          )) : stats?.recent_restock?.length ? stats.recent_restock.map((r, i) => (
            <div key={i} className="aar" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 6px", borderBottom: "1px solid #f4f7fb", transition: "background 0.15s", borderRadius: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#4338ca", flexShrink: 0 }}>R</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0d1b2a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.medicine_name}</div>
                <div style={{ fontSize: 10, color: "#8a9ab5", marginTop: 1 }}>+{r.quantity_change} units · {r.stock_after} in stock</div>
              </div>
              <div style={{ fontSize: 10, color: "#c0cfd8", fontWeight: 600 }}>{timeAgo(r.created_at)}</div>
            </div>
          )) : <div style={{ textAlign: "center", padding: "30px 0", color: "#8a9ab5", fontSize: 12 }}>No restocks yet</div>}
        </>)}
      </div>

      {/* ROW 3 — Low Stock | Expiring */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

        {panel(<>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a" }}>Low Stock</div>
              <div style={{ fontSize: 11, color: "#8a9ab5", marginTop: 2 }}>Below reorder level</div>
            </div>
            <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20 }}>{stats?.low_stock_list?.length || 0} items</span>
          </div>
          {loading ? skeleton(130) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }} className="amt">
              <thead>
                <tr>
                  {["Drug", "Units", "Level", "Status"].map(h => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#b0bfcc", textTransform: "uppercase", letterSpacing: "0.6px", paddingBottom: 10, textAlign: "left", borderBottom: "1px solid #f0f4f8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats?.low_stock_list?.length ? stats.low_stock_list.slice(0, 6).map((d, i) => {
                  const s = d.stock === 0 ? "critical" : d.stock <= d.min_stock / 2 ? "critical" : "low";
                  return (
                    <tr key={i} onClick={() => navigate("/inventory")}>
                      <td style={{ padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0d1b2a" }}>{d.name}</div>
                        <div style={{ fontSize: 10, color: "#b0bfcc", marginTop: 1 }}>{d.category}</div>
                      </td>
                      <td style={{ padding: "8px 0", borderBottom: "1px solid #f8fafc", fontSize: 12, fontWeight: 700, color: s === "critical" ? "#ef4444" : "#f59e0b" }}>{d.stock}</td>
                      <td style={{ padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                        <div style={{ width: 60, height: 5, background: "#f0f4f8", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 2, width: `${Math.min((d.stock / d.min_stock) * 100, 100)}%`, background: s === "critical" ? "#ef4444" : "#f59e0b" }} />
                        </div>
                      </td>
                      <td style={{ padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                        <span style={{ background: s === "critical" ? "#fee2e2" : "#fef3c7", color: s === "critical" ? "#dc2626" : "#b45309", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{s}</span>
                      </td>
                    </tr>
                  );
                }) : <tr><td colSpan={4} style={{ textAlign: "center", padding: 20, color: "#8a9ab5", fontSize: 12 }}>All stock levels are OK</td></tr>}
              </tbody>
            </table>
          )}
        </>)}

        {panel(<>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a" }}>Expiring Soon</div>
              <div style={{ fontSize: 11, color: "#8a9ab5", marginTop: 2 }}>Within 30 days</div>
            </div>
            <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20 }}>{stats?.expiring_soon || 0} items</span>
          </div>
          {loading ? skeleton(130) : stats?.expiring_soon > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div onClick={() => navigate("/expired")} style={{ padding: "14px 16px", background: "#fef3c7", borderRadius: 10, cursor: "pointer", border: "1px solid #fde68a" }}>
                <div style={{ fontWeight: 700, color: "#b45309", fontSize: 13 }}>{stats.expiring_soon} medicines expiring within 30 days</div>
                <div style={{ fontSize: 11, color: "#92400e", marginTop: 4 }}>Click to view details and take action</div>
              </div>
              {stats.expired > 0 && (
                <div onClick={() => navigate("/expired")} style={{ padding: "14px 16px", background: "#fee2e2", borderRadius: 10, cursor: "pointer", border: "1px solid #fecaca" }}>
                  <div style={{ fontWeight: 700, color: "#dc2626", fontSize: 13 }}>{stats.expired} medicines already expired</div>
                  <div style={{ fontSize: 11, color: "#b91c1c", marginTop: 4 }}>Remove from shelves immediately</div>
                </div>
              )}
            </div>
          ) : <div style={{ textAlign: "center", padding: "40px 0", color: "#8a9ab5", fontSize: 12 }}>No medicines expiring soon</div>}
        </>)}
      </div>

    </div>
  );
}

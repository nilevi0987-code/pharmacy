import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .navbar {
    height: 52px; background: #0b0f1a; border-bottom: 1px solid #1a2235;
    display: flex; align-items: center; padding: 0 16px; gap: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: sticky; top: 0; z-index: 200; flex-shrink: 0;
  }
  .navbar-toggle {
    width: 32px; height: 32px; background: #141d2e; border: 1px solid #1e2a3a;
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; transition: all 0.2s; font-size: 14px;
  }
  .navbar-toggle:hover { background: #1e2a3a; border-color: #00e5c040; }
  .navbar-brand { font-size: 15px; font-weight: 800; color: #fff; letter-spacing: -0.3px; white-space: nowrap; flex-shrink: 0; }
  .navbar-brand span { color: #00e5c0; }
  .navbar-search-wrap { flex:1; max-width:380px; position:relative; }
  .navbar-search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); font-size:12px; pointer-events:none; }
  .navbar-search {
    width:100%; padding:7px 12px 7px 32px; background:#141d2e; border:1px solid #1e2a3a;
    border-radius:8px; font-size:12px; font-family:'Plus Jakarta Sans',sans-serif;
    color:#8aaac8; outline:none; transition:all 0.2s; box-sizing:border-box;
  }
  .navbar-search::placeholder { color:#2a3a55; }
  .navbar-search:focus { border-color:#00e5c040; background:#1a2538; color:#c0d0e0; }
  .navbar-right { margin-left:auto; display:flex; align-items:center; gap:6px; }
  .navbar-icon-btn {
    width:32px; height:32px; background:#141d2e; border:1px solid #1e2a3a;
    border-radius:8px; display:flex; align-items:center; justify-content:center;
    font-size:14px; cursor:pointer; transition:all 0.2s; position:relative;
  }
  .navbar-icon-btn:hover { background:#1e2a3a; }
  .notif-badge {
    position:absolute; top:-4px; right:-4px;
    min-width:16px; height:16px; background:#ef4444; border-radius:50%;
    font-size:8px; font-weight:800; color:#fff;
    display:flex; align-items:center; justify-content:center;
    border:2px solid #0b0f1a; padding:0 3px;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
    50%      { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
  }
  .navbar-divider { width:1px; height:20px; background:#1e2a3a; margin:0 2px; }
  .navbar-user {
    display:flex; align-items:center; gap:7px; padding:5px 10px 5px 5px;
    background:#141d2e; border:1px solid #1e2a3a; border-radius:8px;
    cursor:pointer; transition:all 0.2s;
  }
  .navbar-user:hover { background:#1e2a3a; }
  .navbar-avatar {
    width:24px; height:24px; background:linear-gradient(135deg,#00e5c0,#0080ff);
    border-radius:6px; display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:800; color:#fff; overflow:hidden; flex-shrink:0;
  }
  .navbar-user-name { font-size:11px; font-weight:700; color:#8aaac8; }
  .navbar-logout-btn {
    padding:6px 12px; background:#141d2e; border:1px solid #1e2a3a;
    border-radius:8px; color:#8aaac8; font-size:11px; font-weight:600;
    cursor:pointer; transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif;
  }
  .navbar-logout-btn:hover { background:#1a2a3a; border-color:#ef4444; color:#ef4444; }

  /* ── Notification Dropdown ── */
  .notif-wrap { position: relative; }
  .notif-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    width: 340px; background: #111827; border: 1px solid #1e2a3a;
    border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    z-index: 999; overflow: hidden;
    animation: notifFadeIn 0.18s ease;
  }
  @keyframes notifFadeIn {
    from { opacity:0; transform:translateY(-8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .notif-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 16px; border-bottom:1px solid #1e2a3a;
    background: linear-gradient(135deg,#0f172a,#111827);
  }
  .notif-title { font-size:13px; font-weight:800; color:#fff; display:flex; align-items:center; gap:6px; }
  .notif-count-pill {
    font-size:9px; font-weight:800; padding:2px 7px; border-radius:20px;
    background:#ef4444; color:#fff;
  }
  .notif-view-all {
    font-size:10px; font-weight:700; color:#00e5c0;
    cursor:pointer; background:none; border:none;
    font-family:'Plus Jakarta Sans',sans-serif;
  }
  .notif-view-all:hover { opacity:0.8; }
  .notif-section-hdr {
    display:flex; align-items:center; gap:6px;
    padding:10px 16px 6px;
    font-size:9px; font-weight:800; color:#4a5a75;
    text-transform:uppercase; letter-spacing:0.8px;
    border-bottom:1px solid #1a2235;
  }
  .notif-section-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .notif-item {
    display:flex; align-items:center; gap:10px;
    padding:9px 16px; border-bottom:1px solid #1a2235;
    cursor:pointer; transition:background 0.15s;
  }
  .notif-item:last-child { border-bottom:none; }
  .notif-item:hover { background:#1a2235; }
  .notif-icon {
    width:30px; height:30px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; flex-shrink:0;
  }
  .ni-expired  { background:rgba(239,68,68,0.15); }
  .ni-expiring { background:rgba(245,158,11,0.15); }
  .notif-body { flex:1; min-width:0; }
  .notif-name { font-size:11px; font-weight:700; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .notif-meta { font-size:9px; color:#4a5a75; margin-top:2px; }
  .notif-badge-tag {
    font-size:8px; font-weight:800; padding:2px 7px; border-radius:20px; flex-shrink:0; white-space:nowrap;
  }
  .nbt-expired  { background:rgba(239,68,68,0.15); color:#ef4444; }
  .nbt-expiring { background:rgba(245,158,11,0.15); color:#f59e0b; }
  .nbt-soon     { background:rgba(239,68,68,0.2);   color:#ef4444; }
  .notif-more {
    padding:7px 16px; font-size:10px; font-weight:700;
    cursor:pointer; transition:background 0.15s;
    border-bottom:1px solid #1a2235;
  }
  .notif-more:hover { background:#1a2235; }
  .notif-empty {
    padding:28px 16px; text-align:center;
    font-size:12px; color:#4a5a75; font-weight:600;
  }
  .notif-empty-icon { font-size:28px; margin-bottom:8px; }
  .notif-footer {
    padding:10px 16px; border-top:1px solid #1e2a3a;
    display:flex; align-items:center; justify-content:space-between;
    background:#0f172a;
  }
  .notif-footer-info { font-size:9px; color:#2a3a55; font-weight:600; }
  .notif-footer-btn {
    font-size:11px; font-weight:700; color:#00e5c0;
    background:none; border:none; cursor:pointer;
    font-family:'Plus Jakarta Sans',sans-serif;
    display:flex; align-items:center; gap:4px;
  }
  .notif-footer-btn:hover { opacity:0.8; }
`;

function daysLeft(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  return diff;
}

function formatExpiry(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric' });
}

export default function Navbar({ collapsed, onToggle }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [expiring,  setExpiring]  = useState([]);
  const [expired,   setExpired]   = useState([]);
  const [lastFetch, setLastFetch] = useState(null);
  const notifRef = useRef(null);

  const fetchAlerts = () => {
    api.get('/dashboard/index.php')
      .then(r => {
        const data = r.data.data;
        setExpiring(data.expiring_list || []);
        setExpired(data.expired_list   || []);
        setLastFetch(new Date());
      })
      .catch(() => {});
  };

  // Fetch on mount + auto-refresh every 60 seconds
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalNotifs = expiring.length + expired.length;

  const go = (path) => { navigate(path); setNotifOpen(false); };

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        <button className="navbar-toggle" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? '▶' : '◀'}
        </button>
        <div className="navbar-brand">Pharma<span>Sys</span></div>

        <div className="navbar-search-wrap">
          <span className="navbar-search-icon">🔍</span>
          <input className="navbar-search" type="search" placeholder="Search drugs, patients, prescriptions..."/>
        </div>

        <div className="navbar-right">

          {/* ── Bell ── */}
          <div className="notif-wrap" ref={notifRef}>
            <button
              className="navbar-icon-btn"
              title={totalNotifs > 0 ? `${totalNotifs} alerts` : 'Notifications'}
              onClick={() => setNotifOpen(o => !o)}
              style={notifOpen ? {background:'#1e2a3a'} : {}}
            >
              🔔
              {totalNotifs > 0 && (
                <span className="notif-badge">{totalNotifs > 99 ? '99+' : totalNotifs}</span>
              )}
            </button>

            {notifOpen && (
              <div className="notif-dropdown">

                {/* Header */}
                <div className="notif-header">
                  <div className="notif-title">
                    🔔 Alerts
                    {totalNotifs > 0 && <span className="notif-count-pill">{totalNotifs}</span>}
                  </div>
                  <button className="notif-view-all" onClick={() => go('/expired')}>
                    View all →
                  </button>
                </div>

                {totalNotifs === 0 ? (
                  <div className="notif-empty">
                    <div className="notif-empty-icon">✅</div>
                    <div>All medicines are fine!</div>
                    <div style={{fontSize:10,marginTop:4,color:'#2a3a55'}}>No expiry alerts right now</div>
                  </div>
                ) : (
                  <>
                    {/* ── Expired ── */}
                    {expired.length > 0 && (
                      <>
                        <div className="notif-section-hdr">
                          <div className="notif-section-dot" style={{background:'#ef4444'}}/>
                          Already Expired · {expired.length} medicine{expired.length>1?'s':''}
                        </div>
                        {expired.slice(0, 4).map((m, i) => {
                          const days = Math.abs(daysLeft(m.expiry_date));
                          return (
                            <div key={i} className="notif-item" onClick={() => go('/expired')}>
                              <div className="notif-icon ni-expired">💊</div>
                              <div className="notif-body">
                                <div className="notif-name">{m.name}</div>
                                <div className="notif-meta">
                                  Expired {days} day{days!==1?'s':''} ago · {formatExpiry(m.expiry_date)} · Stock: {m.stock}
                                </div>
                              </div>
                              <span className="notif-badge-tag nbt-expired">Expired</span>
                            </div>
                          );
                        })}
                        {expired.length > 4 && (
                          <div className="notif-more" onClick={() => go('/expired')}>
                            <span style={{color:'#ef4444'}}>+{expired.length - 4} more expired medicines →</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* ── Expiring Soon ── */}
                    {expiring.length > 0 && (
                      <>
                        <div className="notif-section-hdr">
                          <div className="notif-section-dot" style={{background:'#f59e0b'}}/>
                          Expiring Soon · {expiring.length} medicine{expiring.length>1?'s':''}
                        </div>
                        {expiring.slice(0, 4).map((m, i) => {
                          const days = daysLeft(m.expiry_date);
                          const urgent = days <= 7;
                          return (
                            <div key={i} className="notif-item" onClick={() => go('/expired')}>
                              <div className="notif-icon ni-expiring">⏰</div>
                              <div className="notif-body">
                                <div className="notif-name">{m.name}</div>
                                <div className="notif-meta">
                                  {days} day{days!==1?'s':''} left · {formatExpiry(m.expiry_date)} · Stock: {m.stock}
                                </div>
                              </div>
                              <span className={`notif-badge-tag ${urgent ? 'nbt-soon' : 'nbt-expiring'}`}>
                                {days}d left
                              </span>
                            </div>
                          );
                        })}
                        {expiring.length > 4 && (
                          <div className="notif-more" onClick={() => go('/expired')}>
                            <span style={{color:'#f59e0b'}}>+{expiring.length - 4} more expiring soon →</span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Footer */}
                <div className="notif-footer">
                  <span className="notif-footer-info">
                    {lastFetch ? `Updated ${lastFetch.toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'})}` : 'Loading...'}
                  </span>
                  <button className="notif-footer-btn" onClick={() => go('/expired')}>
                    Go to Expiry Alerts →
                  </button>
                </div>

              </div>
            )}
          </div>

          <button className="navbar-icon-btn" title="Settings" onClick={() => navigate('/settings')}>⚙️</button>
          <div className="navbar-divider"/>
          <div className="navbar-user" onClick={() => navigate('/settings')}>
            <div className="navbar-avatar">
              {user?.photo
                ? <img src={user.photo} alt="Profile" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : (user?.name || 'P').charAt(0)}
            </div>
            <span className="navbar-user-name">{user?.name || 'Pharmacist'}</span>
            <span style={{fontSize:9,color:'#2a3a55'}}>▾</span>
          </div>
          <button className="navbar-logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>
    </>
  );
}
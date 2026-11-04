import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .sidebar {
    background: #0b0f1a;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #1a2235;
    font-family: 'Plus Jakarta Sans', sans-serif;
    flex-shrink: 0;
    height: 100%;
    overflow: hidden;
    transition: width 0.25s cubic-bezier(.4,0,.2,1);
  }
  .sidebar.open  { width: 200px; }
  .sidebar.closed { width: 52px; }

  .sidebar-profile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 8px;
    margin: 6px 6px 2px;
    border-radius: 10px;
    background: #141d2e;
    border: 1px solid #1e2a3a;
    overflow: hidden;
    flex-shrink: 0;
    cursor: pointer;
    transition: background 0.2s;
  }
  .sidebar-profile:hover { background: #1e2a3a; }

  .sidebar-avatar {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, #00e5c0, #0080ff);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
    overflow: hidden;
  }
  .sidebar-avatar svg {
    width: 18px; height: 18px; fill: #fff;
  }
  .sidebar-profile-info { flex:1; min-width:0; transition: opacity 0.2s, width 0.2s; overflow: hidden; }
  .sidebar.closed .sidebar-profile-info { opacity: 0; width: 0; }
  .sidebar-profile-name { font-size:11px; font-weight:800; color:#c0d0e0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .sidebar-profile-role { font-size:9px; color:#3a5070; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-top:1px; }

  .sidebar-divider-top { height:1px; background:#1a2235; margin: 4px 8px 6px; flex-shrink:0; }

  .sidebar-nav {
    display: flex; flex-direction: column; gap: 1px;
    padding: 4px 6px; flex: 1;
    overflow-y: auto; overflow-x: hidden;
    scrollbar-width: thin; scrollbar-color: #1e2a3a transparent;
  }
  .sidebar-nav::-webkit-scrollbar { width: 3px; }
  .sidebar-nav::-webkit-scrollbar-thumb { background: #1e2a3a; border-radius: 3px; }

  .sidebar-label {
    font-size: 9px; font-weight: 700; color: #1e2d42;
    text-transform: uppercase; letter-spacing: 1px;
    padding: 6px 8px 4px; white-space: nowrap; overflow: hidden;
    transition: opacity 0.2s;
  }
  .sidebar.closed .sidebar-label { opacity: 0; }
  .sidebar-divider { height: 1px; background: #1a2235; margin: 4px 6px; }

  .nav-link {
    display: flex; align-items: center; gap: 9px;
    padding: 8px; border-radius: 8px;
    font-size: 12px; font-weight: 600; color: #3a5070;
    text-decoration: none; transition: all 0.15s;
    white-space: nowrap; overflow: hidden;
  }
  .nav-link:hover { background: #141d2e; color: #8aaac8; }
  .nav-link.active { background: linear-gradient(135deg,rgba(0,229,192,0.12),rgba(0,128,255,0.08)); color: #00e5c0; border: 1px solid rgba(0,229,192,0.15); }
  .nav-link.admin-active { background: linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.08)); color: #818cf8; border: 1px solid rgba(99,102,241,0.2); }
  .nav-icon { font-size: 15px; width: 18px; text-align: center; flex-shrink: 0; }
  .nav-text { transition: opacity 0.2s, width 0.2s; overflow: hidden; }
  .sidebar.closed .nav-text { opacity: 0; width: 0; }

  .sidebar-bottom {
    padding: 8px 6px 12px; border-top: 1px solid #1a2235; flex-shrink: 0;
  }
  .sidebar-logout {
    display: flex; align-items: center; gap: 8px;
    width: 100%; padding: 8px;
    background: none; border: none; cursor: pointer;
    border-radius: 8px; transition: background 0.2s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow: hidden;
  }
  .sidebar-logout:hover { background: rgba(239,68,68,0.1); }
  .sidebar-logout-icon { font-size: 15px; width: 18px; text-align: center; flex-shrink: 0; }
  .sidebar-logout-text { font-size: 12px; font-weight: 600; color: #ef4444; white-space: nowrap; transition: opacity 0.2s, width 0.2s; overflow: hidden; }
  .sidebar.closed .sidebar-logout-text { opacity: 0; width: 0; }
`;

const pharmacistLinks = [
  { to:'/dashboard',     icon:'', label:'Dashboard' },
  { to:'/inventory',     icon:'', label:'Inventory' },
  { to:'/prescriptions', icon:'', label:'Prescriptions' },
  { to:'/sales',         icon:'', label:'Sales / POS' },
  { to:'/sales-history', icon:'', label:'Sales History' },
  { to:'/patients',      icon:'', label:'Patients' },
  { to:'/suppliers',     icon:'', label:'Suppliers' },
  { to:'/expired',       icon:'', label:'Expiry Alerts' },
  { to:'/reports',       icon:'', label:'Reports' },
  { to:'/analytics',     icon:'', label:'Analytics' },
];

const adminManagementLinks = [
  { to:'/admin/dashboard', icon:'', label:'Admin Dashboard' },
  { to:'/admin/users',     icon:'', label:'User Management' },
  { to:'/admin/audit',     icon:'', label:'Audit Logs' },
];

const adminRaincheckLinks = [
  { to:'/inventory',     icon:'', label:'Inventory' },
  { to:'/sales-history', icon:'', label:'Sales History' },
  { to:'/expired',       icon:'', label:'Expiry Alerts' },
  { to:'/reports',       icon:'', label:'Reports' },
  { to:'/analytics',     icon:'', label:'Analytics' },
];

// Human SVG icon
const HumanIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>
);

export default function Sidebar({ collapsed }) {
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const cls = collapsed ? 'sidebar closed' : 'sidebar open';

  return (
    <>
      <style>{styles}</style>
      <aside className={cls}>

        {/* ── PROFILE at top ── */}
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {user?.photo
              ? <img src={user.photo} alt="Profile" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
              : <HumanIcon />
            }
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{user?.name || "Pharmacist"}</div>
            <div className="sidebar-profile-role">{user?.role || "pharmacist"}</div>
          </div>
        </div>

        <div className="sidebar-divider-top"/>

        {/* ── NAV LINKS ── */}
        <nav className="sidebar-nav">
          {isAdmin ? (
            <>
              <div className="sidebar-label">Management</div>
              {adminManagementLinks.map(l => (
                <NavLink key={l.to} to={l.to} className={({isActive}) => isActive ? 'nav-link admin-active' : 'nav-link'} title={l.label}>
                  <span className="nav-icon">{l.icon}</span>
                  <span className="nav-text">{l.label}</span>
                </NavLink>
              ))}
              <div className="sidebar-divider"/>
              {adminRaincheckLinks.map(l => (
                <NavLink key={l.to} to={l.to} className={({isActive}) => isActive ? 'nav-link admin-active' : 'nav-link'} title={l.label}>
                  <span className="nav-icon">{l.icon}</span>
                  <span className="nav-text">{l.label}</span>
                </NavLink>
              ))}
            </>
          ) : (
            <>
              <div className="sidebar-label">Main Menu</div>
              {pharmacistLinks.map(l => (
                <NavLink key={l.to} to={l.to} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} title={l.label}>
                  <span className="nav-icon">{l.icon}</span>
                  <span className="nav-text">{l.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* ── LOGOUT at bottom ── */}
        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={logout} title="Logout">
            <span className="sidebar-logout-icon">🚪</span>
            <span className="sidebar-logout-text">Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
}
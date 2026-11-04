import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'#f4f7fb' }}>
      <Navbar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <Sidebar collapsed={collapsed} />
        <main style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
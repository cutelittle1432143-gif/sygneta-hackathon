import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/automation', label: 'Automation Center' },
  { path: '/campaigns', label: 'Campaigns' },
  { path: '/farmers', label: 'Farmers' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/krishigarv', label: 'KrishiGarv' },
  { path: '/rag', label: 'Knowledge Base' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar" style={{ background: '#000000', borderRight: '1px solid var(--color-border)' }}>
      {/* Logo */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="/bhoomi.png" alt="Logo" style={{ height: '45px', width: 'auto', objectFit: 'contain' }} />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 16px', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Main Menu
          </span>
        </div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: isActive ? 700 : 500,
              textTransform: 'uppercase',
              color: isActive ? '#000000' : '#ffffff',
              background: isActive ? '#ffffff' : 'transparent',
              textDecoration: isActive ? 'none' : 'none',
              borderBottom: '1px solid transparent'
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Stats */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--color-border)',
        background: '#000000'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#ffffff', textTransform: 'uppercase' }}>DB Status</span>
          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700 }}>● SYNCED</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#ffffff', textTransform: 'uppercase' }}>Core Engine</span>
          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700 }}>● ONLINE</span>
        </div>
      </div>
    </aside>
  );
}

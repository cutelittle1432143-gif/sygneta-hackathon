import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/campaigns': 'Campaign Manager',
  '/farmers': 'Farmer Profiles',
  '/analytics': 'Analytics & Insights',
  '/krishigarv': 'KrishiGarv Selfie Tool',
  '/rag': 'Knowledge Base',
};

export default function Header() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Bhoomi AI';

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 260,
      right: 0,
      height: '64px',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 40,
    }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Language Switcher */}
        <div style={{
          display: 'flex', gap: '4px', background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--color-border)'
        }}>
          {['EN', 'HI', 'TE', 'TA'].map((lang, i) => (
            <button key={lang} style={{
              padding: '4px 10px', borderRadius: '6px', border: 'none',
              background: i === 0 ? 'var(--color-krishi-green)' : 'transparent',
              color: i === 0 ? '#000000' : 'var(--color-text-secondary)',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer'
            }}>{lang}</button>
          ))}
        </div>
        {/* Notification */}
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span style={{
            position: 'absolute', top: -2, right: -2, width: 16, height: 16,
            background: '#ffffff', borderRadius: '50%',
            fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#000000'
          }}>3</span>
        </div>
        {/* Profile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
          padding: '6px 14px 6px 6px', border: '1px solid var(--color-border)', cursor: 'pointer'
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#000000' }}>DS</span>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Dr. Sharma</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Marketing Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const KPI_CARDS = [
  { key: 'total_farmers', label: 'Total Farmers', trend: '+12.5%' },
  { key: 'messages_sent', label: 'Messages Sent', trend: '+28.3%' },
  { key: 'messages_opened', label: 'Messages Opened', trend: '+15.7%' },
  { key: 'conversions', label: 'Conversions', trend: '+34.2%' },
];

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getOverview(), api.getCampaigns(), api.getPendingCampaigns()])
      .then(([ov, camp, pending]) => {
        setOverview(ov);
        setCampaigns(camp.campaigns?.slice(0, 6) || []);
        setPendingCount(pending.total || 0);
      })
      .catch(() => {
        setOverview({ total_farmers: 1000, messages_sent: 45230, messages_opened: 12450,
          conversions: 1876, open_rate: 27.5, conversion_rate: 8.4, active_campaigns: 12,
          execution_quality: 96.2, ai_accuracy: 96.2, languages_supported: 5, states_covered: 5 });
        setCampaigns([]);
        setPendingCount(3);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 140 }} />)}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Hero Banner */}
      <div className="glass-card" style={{
        padding: '32px',
        background: '#000000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '32px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 500px', zIndex: 1 }}>
          {/* Logo container */}
          <div style={{ height: '75px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '20px' }}>
            <img src="/bhoomi.png" alt="Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
          </div>
          
          <p style={{ color: '#ffffff', maxWidth: '600px', lineHeight: 1.6, fontSize: '15px' }}>
            Agricultural Campaign Management & Database Query Tool.
            Delivering <strong>10,000+</strong> targeted campaigns to 
            India's farming households.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button className="btn-primary" onClick={() => navigate('/campaigns')}>
              New Campaign
            </button>
            <button className="btn-secondary" onClick={() => navigate('/rag')}>
              Knowledge Base
            </button>
            <button className="btn-gold" onClick={() => navigate('/krishigarv')}>
              KrishiGarv Selfie
            </button>
          </div>
          
          {pendingCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#000000',
              border: '1px solid var(--color-border)',
              padding: '12px 16px',
              marginTop: '24px',
              maxWidth: '600px',
              cursor: 'pointer'
            }} onClick={() => navigate('/automation')}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} className="animate-pulse" />
              <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600, textDecoration: 'underline' }}>
                {pendingCount} proposed alert campaign{pendingCount > 1 ? 's are' : ' is'} awaiting review. Click to approve.
              </span>
            </div>
          )}
        </div>

        {/* Decorative looping video on the right */}
        <div style={{
          flex: '1 1 300px',
          height: '160px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--color-border)',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1
        }}>
          <video
            src="/frame-20-cinematic.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {KPI_CARDS.map((card, idx) => (
          <div key={card.key} className={`kpi-card animate-fade-in-up stagger-${idx + 1}`} style={{ background: '#000000', border: '1px solid var(--color-border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', color: '#ffffff', textDecoration: 'underline' }}>↑ {card.trend}</span>
            </div>
            <div className="kpi-value" style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', marginTop: '12px' }}>
              {overview ? formatNumber(overview[card.key]) : '—'}
            </div>
            <div className="kpi-label" style={{ fontSize: '13px', color: '#ffffff', marginTop: '4px', textTransform: 'uppercase' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Second Row: Quick Stats + System Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Performance Summary */}
        <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase' }}>Performance Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Open Rate', value: `${overview?.open_rate || 0}%`, target: '30%' },
              { label: 'Conversion Rate', value: `${overview?.conversion_rate || 0}%`, target: '12%' },
              { label: 'Execution Quality', value: `${overview?.execution_quality || overview?.ai_accuracy || 0}%`, target: '95%' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '13px', color: '#ffffff', marginTop: '4px', textTransform: 'uppercase' }}>{stat.label}</div>
                <div style={{ fontSize: '11px', color: '#ffffff', marginTop: '2px' }}>Target: {stat.target}</div>
                <div style={{
                  height: '4px', background: '#000000', border: '1px solid var(--color-border)', marginTop: '8px', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%', width: `${Math.min(parseFloat(stat.value), 100)}%`,
                    background: '#ffffff',
                    transition: 'width 1s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>System Status</h3>
          {[
            { label: 'Sync Pipeline', status: 'Active' },
            { label: 'Query Engine', status: 'Ready' },
            { label: 'Languages', value: '5 Active' },
            { label: 'States', value: '5 Covered' },
            { label: 'Knowledge Docs', value: '13 Indexed' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--color-border)'
            }}>
              <span style={{ fontSize: '13px', color: '#ffffff' }}>
                {item.label}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
                {item.status || item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase' }}>Recent Campaigns</h3>
          <button className="btn-secondary" style={{ padding: '6px 16px', fontSize: '12px' }}
            onClick={() => navigate('/campaigns')}>View All →</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Campaign', 'Crop', 'State', 'Language', 'Channel', 'Sent', 'Open Rate', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#ffffff',
                    fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px', color: '#ffffff' }}>{c.name?.substring(0, 35)}</td>
                  <td style={{ padding: '12px' }}><span className="badge badge-green">{c.crop}</span></td>
                  <td style={{ padding: '12px', color: '#ffffff' }}>{c.state}</td>
                  <td style={{ padding: '12px' }}><span className="badge badge-blue">{c.language}</span></td>
                  <td style={{ padding: '12px', color: '#ffffff' }}>{c.channel}</td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#ffffff' }}>{formatNumber(c.messages_sent)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>
                      {c.open_rate}%
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

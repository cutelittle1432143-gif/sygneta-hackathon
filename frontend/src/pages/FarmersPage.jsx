import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ state: '', crop: '', language: '' });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getFarmers(filters), api.getFarmerStats()])
      .then(([f, s]) => { setFarmers(f.farmers || []); setStats(s); })
      .catch(() => setFarmers([]))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          {Object.entries(stats.by_state || {}).map(([state, count]) => (
            <div key={state} className="glass-card" style={{ padding: '16px', cursor: 'pointer',
              border: filters.state === state ? '1px solid #ffffff' : '1px solid var(--color-border)',
              background: filters.state === state ? '#ffffff' : '#000000',
              color: filters.state === state ? '#000000' : '#ffffff' }}
              onClick={() => setFilters({...filters, state: filters.state === state ? '' : state})}>
              <div style={{ fontSize: '11px', color: filters.state === state ? '#000000' : '#ffffff', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>{state}</div>
              <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{count}</div>
              <div style={{ fontSize: '11px', color: filters.state === state ? '#000000' : '#ffffff', textTransform: 'uppercase' }}>farmers</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', gap: '16px', alignItems: 'center', background: '#000000' }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>Filters:</span>
        <select className="input-field" style={{ width: 'auto' }} value={filters.state}
          onChange={e => setFilters({...filters, state: e.target.value})}>
          <option value="">All States</option>
          {['Andhra Pradesh', 'Maharashtra', 'Tamil Nadu', 'Punjab', 'Uttar Pradesh'].map(s =>
            <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-field" style={{ width: 'auto' }} value={filters.crop}
          onChange={e => setFilters({...filters, crop: e.target.value})}>
          <option value="">All Crops</option>
          {['Rice', 'Cotton', 'Wheat', 'Sugarcane', 'Groundnut'].map(c =>
            <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field" style={{ width: 'auto' }} value={filters.language}
          onChange={e => setFilters({...filters, language: e.target.value})}>
          <option value="">All Languages</option>
          {['Hindi', 'Telugu', 'Tamil', 'Marathi', 'Punjabi'].map(l =>
            <option key={l} value={l}>{l}</option>)}
        </select>
        {(filters.state || filters.crop || filters.language) && (
          <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}
            onClick={() => setFilters({ state: '', crop: '', language: '' })}>Clear</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '24px' }}>
        {/* Farmer List */}
        <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>
            Farmer Profiles ({farmers.length})
          </h3>
          {loading ? (
            <div>{[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8 }} />)}</div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {farmers.slice(0, 50).map(f => (
                <div key={f.id} onClick={() => setSelected(f)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px',
                  cursor: 'pointer',
                  background: selected?.id === f.id ? '#ffffff' : '#000000',
                  color: selected?.id === f.id ? '#000000' : '#ffffff',
                  border: selected?.id === f.id ? '1px solid #ffffff' : '1px solid var(--color-border)',
                  marginBottom: '6px'
                }}>
                  <div style={{
                    width: 40, height: 40, border: selected?.id === f.id ? '1px solid #000000' : '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                    fontWeight: 900, color: selected?.id === f.id ? '#000000' : '#ffffff'
                  }}>{f.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>{f.name}</div>
                    <div style={{ fontSize: '11px', color: selected?.id === f.id ? '#000000' : '#ffffff', display: 'flex', gap: '8px' }}>
                      <span>District: {f.district}</span>
                      <span>Crop: {f.crop}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge" style={{ fontSize: '10px', color: selected?.id === f.id ? '#000000' : '#ffffff', border: selected?.id === f.id ? '1px solid #000000' : '1px solid var(--color-border)' }}>{f.channel_preference}</span>
                    <div style={{ fontSize: '11px', color: selected?.id === f.id ? '#000000' : '#ffffff', marginTop: '4px', textTransform: 'uppercase', fontWeight: 700 }}>{f.language}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Farmer Detail */}
        {selected && (
          <div className="glass-card animate-slide-in" style={{ padding: '24px', background: '#000000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase' }}>Farmer Profile</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none',
                color: '#ffffff', cursor: 'pointer', fontSize: '18px', fontWeight: 800 }}>✕</button>
            </div>
            <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
              <div style={{
                width: 72, height: 72, margin: '0 auto 12px',
                border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                fontWeight: 900, color: '#ffffff'
              }}>{selected.name[0]}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase' }}>{selected.name}</div>
              <div style={{ fontSize: '13px', color: '#ffffff', textTransform: 'uppercase' }}>
                {selected.district}, {selected.state}
              </div>
            </div>
            {[
              ['Crop', selected.crop],
              ['Season', selected.crop_season],
              ['Stage', selected.growth_stage],
              ['Language', selected.language],
              ['Channel', selected.channel_preference],
              ['Phone Type', selected.phone_type],
              ['Farm Size', `${selected.farm_size_acres} acres`],
              ['Experience', `${selected.years_farming} years`],
              ['Receptivity', `${(selected.receptivity_score * 100).toFixed(0)}%`],
              ['Purchases', selected.previous_purchases],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
                <span style={{ color: '#ffffff', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>{label}</span>
                <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase' }}>
                Receptivity Score
              </div>
              <div style={{ height: '8px', background: '#000000', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${selected.receptivity_score * 100}%`,
                  background: '#ffffff',
                  transition: 'width 1s ease'
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

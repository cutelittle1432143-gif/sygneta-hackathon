import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

const COLORS = [
  '#ffffff',
  'rgba(255,255,255,0.85)',
  'rgba(255,255,255,0.7)',
  'rgba(255,255,255,0.5)',
  'rgba(255,255,255,0.3)',
  'rgba(255,255,255,0.15)'
];

export default function AnalyticsPage() {
  const [languages, setLanguages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getOverview(), api.getLanguages(), api.getChannels(),
      api.getFunnel(), api.getCampaignPerf(), api.getCropDist()
    ]).then(([ov, lang, ch, fun, camp, cr]) => {
      setLanguages(Object.entries(lang.data || {}).map(([name, value]) => ({ name, value })));
      setChannels(Object.entries(ch.data || {}).map(([name, data]) => ({ name, ...data })));
      setFunnel((fun.data || []).map(d => ({...d})));
      setCampaigns(camp.data || []);
      setCrops(Object.entries(cr.data || {}).map(([name, value]) => ({ name, value })));
    }).catch(() => {
      // Demo data
      setLanguages([{name:'Telugu',value:220},{name:'Tamil',value:195},{name:'Hindi',value:280},{name:'Marathi',value:175},{name:'Punjabi',value:130}]);
      setChannels([{name:'WhatsApp',farmers:600,open_rate:35,conversion_rate:12},{name:'SMS',farmers:250,open_rate:18,conversion_rate:6},{name:'Voice',farmers:150,open_rate:28,conversion_rate:9}]);
      setFunnel([{stage:'Targeted',count:1000},{stage:'Sent',count:850},{stage:'Delivered',count:750},{stage:'Opened',count:245},{stage:'Converted',count:78}]);
      setCampaigns([{name:'Rice Blast AP',sent:500,opened:150,converted:45},{name:'Cotton Bollworm MH',sent:350,opened:98,converted:28},{name:'Wheat Rust PB',sent:280,opened:89,converted:22}]);
      setCrops([{name:'Rice',value:300},{name:'Cotton',value:250},{name:'Wheat',value:200},{name:'Sugarcane',value:150},{name:'Groundnut',value:100}]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Language Distribution */}
        <div className="chart-container" style={{ background: '#000000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Language Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={languages} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={100} innerRadius={60} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                stroke="#000000" strokeWidth={2}>
                {languages.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#000000', border: '1px solid var(--color-border)', borderRadius: 0, color: '#ffffff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Distribution */}
        <div className="chart-container" style={{ background: '#000000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Crop Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={crops}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff', fontSize: 12 }} stroke="#ffffff" />
              <YAxis tick={{ fill: '#ffffff', fontSize: 12 }} stroke="#ffffff" />
              <Tooltip contentStyle={{ background: '#000000', border: '1px solid var(--color-border)', borderRadius: 0, color: '#ffffff' }} />
              <Bar dataKey="value" stroke="#ffffff" strokeWidth={1}>
                {crops.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Performance */}
        <div className="chart-container" style={{ background: '#000000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Channel Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {channels.map((ch, i) => (
              <div key={ch.name} style={{ padding: '16px', background: '#000000', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase' }}>
                    {ch.name}
                  </span>
                  <span style={{ fontSize: '13px', color: '#ffffff' }}>{ch.farmers} farmers</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#ffffff', marginBottom: '4px', textTransform: 'uppercase' }}>Open Rate</div>
                    <div style={{ height: '6px', background: '#000000', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${ch.open_rate}%`, background: '#ffffff' }} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '4px', color: '#ffffff' }}>{ch.open_rate}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#ffffff', marginBottom: '4px', textTransform: 'uppercase' }}>Conversion</div>
                    <div style={{ height: '6px', background: '#000000', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${ch.conversion_rate * 3}%`, background: 'rgba(255,255,255,0.5)' }} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '4px', color: '#ffffff' }}>{ch.conversion_rate}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="chart-container" style={{ background: '#000000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Conversion Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {funnel.map((stage, i) => {
              const maxCount = funnel[0]?.count || 1;
              const pct = ((stage.count / maxCount) * 100).toFixed(1);
              return (
                <div key={stage.stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>{stage.stage}</span>
                    <span style={{ fontSize: '13px', color: '#ffffff' }}>
                      {stage.count.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '32px', background: '#000000', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: COLORS[i % COLORS.length],
                      transition: 'width 1s ease',
                      display: 'flex', alignItems: 'center', paddingLeft: '12px',
                      fontSize: '12px', fontWeight: 800, color: (i % COLORS.length === 0 || i % COLORS.length === 1) ? '#000000' : '#ffffff'
                    }}>{stage.count.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Campaign Performance Chart */}
      <div className="chart-container" style={{ background: '#000000' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Campaign Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={campaigns.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis dataKey="name" tick={{ fill: '#ffffff', fontSize: 11 }} angle={-15} textAnchor="end" height={60} stroke="#ffffff" />
            <YAxis tick={{ fill: '#ffffff', fontSize: 12 }} stroke="#ffffff" />
            <Tooltip contentStyle={{ background: '#000000', border: '1px solid var(--color-border)', borderRadius: 0, color: '#ffffff' }} />
            <Bar dataKey="sent" fill="rgba(255,255,255,0.9)" name="Sent" />
            <Bar dataKey="opened" fill="rgba(255,255,255,0.6)" name="Opened" />
            <Bar dataKey="converted" fill="rgba(255,255,255,0.3)" name="Converted" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

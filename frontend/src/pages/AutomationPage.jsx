import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AutomationPage() {
  const [pending, setPending] = useState([]);
  const [logs, setLogs] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanStatusMsg, setScanStatusMsg] = useState('');
  const [activeReviewCampaign, setActiveReviewCampaign] = useState(null);
  const [activeLangTab, setActiveLangTab] = useState('English');
  const [approvingId, setApprovingId] = useState(null);

  const fetchData = async () => {
    try {
      const pRes = await api.getPendingCampaigns();
      setPending(pRes.campaigns || []);
      const lRes = await api.getTwilioLogs();
      setLogs(lRes.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setScanStatusMsg('Initiating news alert feeds scanning...');
    try {
      const res = await api.triggerAlertsScan();
      setScanStatusMsg(`Scan complete. Found ${res.fetched} threat items, added ${res.added} proposed campaigns to queue.`);
      await fetchData();
    } catch (err) {
      console.error(err);
      setScanStatusMsg('Scanning failed.');
    } finally {
      setScanning(false);
    }
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await api.approveCampaign(id);
      if (res.sent_live) {
        alert('Live Twilio SMS dispatched successfully to target test recipient!');
      } else {
        alert('Campaign activated and messages prepared for target farmers.');
      }
      setActiveReviewCampaign(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Campaign approval failed.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to dismiss this campaign threat?')) return;
    try {
      await api.rejectCampaign(id);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openReview = (campaign) => {
    setActiveReviewCampaign(campaign);
    const langs = Object.keys(campaign.message_templates || {});
    if (langs.length > 0) {
      setActiveLangTab(langs[0]);
    } else {
      setActiveLangTab('English');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, textTransform: 'uppercase' }}>Automation Center</h2>
          <p style={{ fontSize: '13px', color: '#ffffff', marginTop: '4px' }}>
            Orchestrate environmental weather scans, AI generation, and Twilio SMS dispatches.
          </p>
        </div>
        
        <button 
          onClick={handleScan} 
          disabled={scanning}
          className="btn-primary" 
          style={{
            padding: '10px 24px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {scanning ? (
            <>
              <svg className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTopColor: '#fff', borderRadius: '50%' }} viewBox="0 0 24 24" />
              Scanning Feeds...
            </>
          ) : (
            'Scan For News & Weather Alerts'
          )}
        </button>
      </div>

      {scanStatusMsg && (
        <div style={{
          padding: '12px 16px',
          background: '#000000',
          border: '1px solid var(--color-border)',
          fontSize: '13px',
          color: '#ffffff'
        }}>
          {scanStatusMsg}
        </div>
      )}

      {/* Grid: Status and Threat queue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '24px' }}>
        
        {/* Left column: Integration Statuses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '20px', background: '#000000' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', marginBottom: '16px', letterSpacing: '0.5px' }}>
              Service Integrations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Groq Integration */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg style={{ width: '16px', height: '16px', fill: '#ffffff' }} viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Groq AI Engine</div>
                  <div style={{ fontSize: '11px', color: '#ffffff' }}>llama-3.3-70b Online</div>
                </div>
              </div>

              {/* WeatherStack Integration */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg style={{ width: '16px', height: '16px', fill: '#ffffff' }} viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Weather Feeds</div>
                  <div style={{ fontSize: '11px', color: '#ffffff' }}>WeatherStack Synced</div>
                </div>
              </div>

              {/* Twilio SMS Integration */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg style={{ width: '16px', height: '16px', fill: '#ffffff' }} viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>SMS Gateway</div>
                  <div style={{ fontSize: '11px', color: '#ffffff' }}>Twilio SMS Configured</div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Quick Guide */}
          <div className="glass-card" style={{ padding: '20px', background: '#000000' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>How it works</h4>
            <p style={{ fontSize: '12px', color: '#ffffff', lineHeight: '1.5' }}>
              1. <b>Scan</b>: Retrives current weather metrics and news alerts.<br/><br/>
              2. <b>Review</b>: Evaluate targeting parameters and local translations.<br/><br/>
              3. <b>Approve</b>: Instantly triggers Twilio SMS and deploys customized campaign scripts.
            </p>
          </div>
        </div>

        {/* Right column: Pending Threats Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>
              Pending Threat Alerts Queue ({pending.length})
            </h3>
            
            {pending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#ffffff', fontSize: '14px' }}>
                No pending threat drafts in queue. Click "Scan For News & Weather Alerts" to fetch live data.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pending.map(camp => (
                  <div key={camp.id} style={{
                    background: '#000000',
                    border: '1px solid var(--color-border)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge" style={{ fontSize: '10px', textTransform: 'uppercase', marginRight: '8px' }}>
                          {camp.crop} ({camp.pest})
                        </span>
                        <span className="badge" style={{ fontSize: '10px' }}>
                          Targeting {camp.target_farmers} Farmers
                        </span>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, marginTop: '8px', textTransform: 'uppercase' }}>{camp.name}</h4>
                        <div style={{ fontSize: '12px', color: '#ffffff', marginTop: '4px' }}>
                          Location: <b>{camp.state}</b>, {camp.district || 'All Districts'}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" onClick={() => handleReject(camp.id)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                          Dismiss
                        </button>
                        <button className="btn-primary" onClick={() => openReview(camp)} style={{ padding: '6px 16px', fontSize: '12px' }}>
                          Review & Send
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '4px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Triggering News Source</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ffffff', fontStyle: 'italic' }}>
                          &ldquo;{camp.trigger_news_headline}&rdquo;
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Local Weather Matrix</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ffffff' }}>
                          {camp.trigger_weather}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Panel: Twilio Dispatch Logs */}
      <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Twilio SMS Delivery Logs</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>Recipient Farmer</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>Language</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>Campaign Alert</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>SMS Content</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>Twilio SID</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>Sent Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#ffffff' }}>
                    No campaigns approved yet. Deployed SMS logs will appear here.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#ffffff' }}>{log.farmer_name}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge" style={{ fontSize: '10px' }}>{log.language}</span>
                    </td>
                    <td style={{ padding: '12px', color: '#ffffff' }}>{log.campaign_name}</td>
                    <td style={{ padding: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#ffffff' }} title={log.content}>
                      {log.content}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '11px', color: '#ffffff' }}>{log.twilio_sid}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge" style={{ fontSize: '10px' }}>
                        ● Delivered
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#ffffff' }}>
                      {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Dialog overlay */}
      {activeReviewCampaign && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            maxWidth: '600px', width: '100%', padding: '28px',
            background: '#000000', overflowY: 'auto', maxHeight: '90vh'
          }}>
            <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase' }}>
              Review Automation Alert
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>Campaign Name</label>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>{activeReviewCampaign.name}</div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>Target Threat</label>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>{activeReviewCampaign.crop} ({activeReviewCampaign.pest})</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>Target Location</label>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>{activeReviewCampaign.state}, {activeReviewCampaign.district || 'All Districts'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>Audience Split</label>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{activeReviewCampaign.target_farmers} Farmers</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <label style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>Message Localizations</label>
                
                {/* Language tab links */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  {Object.keys(activeReviewCampaign.message_templates || {}).map(lang => (
                    <button 
                      key={lang}
                      onClick={() => setActiveLangTab(lang)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        textDecoration: activeLangTab === lang ? 'underline' : 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <div style={{ background: '#000000', padding: '16px', border: '1px solid var(--color-border)', marginTop: '12px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#ffffff', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                    {activeReviewCampaign.message_templates?.[activeLangTab] || 'No template available.'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setActiveReviewCampaign(null)} style={{ padding: '8px 20px', fontSize: '13px' }}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={() => handleApprove(activeReviewCampaign.id)} 
                disabled={approvingId !== null} 
                style={{ padding: '8px 24px', fontSize: '13px' }}
              >
                {approvingId ? 'Sending Live SMS...' : 'Approve & Send SMS'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

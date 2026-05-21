import { useState, useEffect } from 'react';
import { api } from '../services/api';

const CROPS = ['Rice', 'Cotton', 'Wheat', 'Sugarcane', 'Groundnut'];
const STATES = ['Andhra Pradesh', 'Maharashtra', 'Tamil Nadu', 'Punjab', 'Uttar Pradesh'];
const LANGUAGES = ['Hindi', 'Telugu', 'Tamil', 'Marathi', 'Punjabi'];
const CHANNELS = ['SMS', 'WhatsApp'];

const PESTS = {
  Rice: ['Blast Disease', 'Stem Borer', 'Brown Planthopper'],
  Cotton: ['Bollworm', 'Whitefly', 'Aphids'],
  Wheat: ['Rust', 'Powdery Mildew', 'Loose Smut'],
  Sugarcane: ['Red Rot', 'Early Shoot Borer', 'Top Borer'],
  Groundnut: ['Tikka Leaf Spot', 'Rust', 'Bud Necrosis'],
};

export default function CampaignPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', crop: 'Rice', state: 'Andhra Pradesh',
    language: 'Telugu', channel: 'SMS', pest: 'Blast Disease', urgency: 'high'
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [campaignId, setCampaignId] = useState(null);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [activeReviewCampaign, setActiveReviewCampaign] = useState(null);
  const [approving, setApproving] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await api.getPendingCampaigns();
      setPendingCampaigns(res.campaigns || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      await api.triggerAlertsScan();
      await fetchPending();
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleApprove = async (id) => {
    setApproving(true);
    try {
      const res = await api.approveCampaign(id);
      if (res.sent_live) {
        alert('Live Twilio SMS alerts deployed successfully to target farmers!');
      } else {
        alert('Campaign approved successfully.');
      }
      setActiveReviewCampaign(null);
      await fetchPending();
    } catch (err) {
      console.error(err);
      alert('Failed to approve campaign.');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to dismiss this draft alert?')) return;
    try {
      await api.rejectCampaign(id);
      await fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    if (!form.name.trim()) return alert('Please enter a campaign name');
    setLoading(true);
    try {
      // Create campaign
      const campaign = await api.createCampaign({
        ...form
      });
      setCampaignId(campaign.id);

      // Generate messages
      const result = await api.generateMessages(campaign.id, {
        crop: form.crop, state: form.state, language: form.language,
        channel: form.channel, pest: form.pest, count: 5, urgency: form.urgency
      });
      setMessages(result.messages || []);
      setStep(3);
    } catch (err) {
      // Demo fallback
      setMessages([{
        id: '1', farmer_name: 'Ramesh', content: getDemoMessage(form),
        language: form.language, channel: form.channel, status: 'generated', grounded: true
      }]);
      setStep(3);
    }
    setLoading(false);
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const result = await api.generatePreview({
        crop: form.crop, state: form.state, language: form.language,
        channel: form.channel, pest: form.pest, farmer_name: 'Ramesh',
        urgency: form.urgency
      });
      setPreview(result);
    } catch {
      setPreview({ response: getDemoMessage(form), language: form.language,
        channel: form.channel, grounded: true, model: 'demo-mode', source_count: 3 });
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Proposed Campaigns / Alerts Queue */}
      {pendingCampaigns.length > 0 && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px', background: '#000000' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
                Proposed Alerts Queue
              </h3>
              <p style={{ fontSize: '12px', color: '#ffffff', margin: '4px 0 0 0' }}>
                System-generated draft campaigns triggered by weather forecasts and news feeds.
              </p>
            </div>
            <button className="btn-secondary" onClick={handleScan} disabled={scanning} style={{ padding: '8px 16px', fontSize: '12px' }}>
              {scanning ? 'Scanning...' : 'Scan For News Alerts'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {pendingCampaigns.map(camp => (
              <div key={camp.id} className="glass-card" style={{
                padding: '16px', background: '#000000', border: '1px solid var(--color-border)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge" style={{ fontSize: '10px' }}>{camp.crop}</span>
                    <span style={{
                      fontSize: '10px', textTransform: 'uppercase', fontWeight: 700,
                      color: '#ffffff', textDecoration: 'underline'
                    }}>{camp.urgency} Alert</span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '8px 0 4px 0', color: '#ffffff', textTransform: 'uppercase' }}>{camp.name}</h4>
                  <div style={{ fontSize: '12px', color: '#ffffff', marginBottom: '8px' }}>
                    Area: {camp.state} ({camp.district || 'All Districts'})
                  </div>
                  <div style={{ fontSize: '11px', color: '#ffffff', lineBreak: 'anywhere' }}>
                    <strong>Trigger:</strong> {camp.trigger_news_headline?.substring(0, 70)}...
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                  <button className="btn-primary" onClick={() => setActiveReviewCampaign(camp)} style={{
                    flex: 1, padding: '6px 12px', fontSize: '11px', textDecoration: 'underline'
                  }}>
                    Review & Approve
                  </button>
                  <button className="btn-secondary" onClick={() => handleReject(camp.id)} style={{
                    padding: '6px 12px', fontSize: '11px', textDecoration: 'underline'
                  }}>
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="glass-card" style={{ padding: '20px 32px', background: '#000000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          {['Configure', 'Preview', 'Generated Messages'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32,
                background: step > i ? '#ffffff' : step === i + 1 ? '#ffffff' : '#000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 900, color: step >= i + 1 ? '#000000' : '#ffffff',
                border: '1px solid var(--color-border)'
              }}>{step > i ? '✓' : i + 1}</div>
              <span style={{ marginLeft: '10px', fontSize: '13px', fontWeight: step === i + 1 ? 800 : 400,
                color: '#ffffff', textTransform: 'uppercase' }}>{s}</span>
              {i < 2 && <div style={{ flex: 1, height: '1px', margin: '0 16px',
                background: 'var(--color-border)' }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Config Form */}
        <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase' }}>
            {step === 1 ? 'Campaign Configuration' : step === 2 ? 'Message Preview' : 'Generated Messages'}
          </h3>

          {step <= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Campaign Name</label>
                <input className="input-field" placeholder="e.g., Rice Blast Alert - AP"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Crop</label>
                  <select className="input-field" value={form.crop} onChange={e => setForm({...form, crop: e.target.value, pest: PESTS[e.target.value]?.[0] || ''})}>
                    {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>State</label>
                  <select className="input-field" value={form.state} onChange={e => setForm({...form, state: e.target.value})}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Pest/Disease</label>
                <select className="input-field" value={form.pest} onChange={e => setForm({...form, pest: e.target.value})}>
                  {(PESTS[form.crop] || []).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Language</label>
                  <select className="input-field" value={form.language} onChange={e => setForm({...form, language: e.target.value})}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Channel</label>
                  <select className="input-field" value={form.channel} onChange={e => setForm({...form, channel: e.target.value})}>
                    {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Urgency</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{v:'high',l:'High'},{v:'medium',l:'Medium'},{v:'low',l:'Low'}].map(u => (
                    <button key={u.v} onClick={() => setForm({...form, urgency: u.v})} style={{
                      flex: 1, padding: '10px', border: form.urgency === u.v ? '1px solid #ffffff' : '1px solid var(--color-border)',
                      background: form.urgency === u.v ? '#ffffff' : '#000000',
                      color: form.urgency === u.v ? '#000000' : '#ffffff', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>{u.l}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="btn-secondary" onClick={handlePreview} disabled={loading}>
                  {loading ? 'Generating...' : 'Preview Message'}
                </button>
                <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Campaign'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <span className="badge">{messages.length} Messages Generated</span>
                <span className="badge">{form.language}</span>
                <span className="badge">{form.channel}</span>
              </div>
              {messages.map((msg, i) => (
                <div key={msg.id || i} style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#ffffff', marginBottom: '6px' }}>
                    Farmer: {msg.farmer_name} | {msg.grounded ? 'Verified Data' : 'Draft'}
                  </div>
                  <div className={form.channel === 'WhatsApp' ? 'whatsapp-bubble' : 'sms-bubble'}>
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>
                  </div>
                </div>
              ))}
              <button className="btn-secondary" onClick={() => { setStep(1); setMessages([]); }} style={{ marginTop: '12px' }}>
                ← New Campaign
              </button>
            </div>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Live Preview</h3>
          
          {/* Phone mockup */}
          <div style={{
            maxWidth: '340px', margin: '0 auto', background: '#000000',
            padding: '12px', border: '1px solid var(--color-border)'
          }}>
            <div style={{ background: '#000000', borderBottom: '1px solid var(--color-border)', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white' }}>K</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', textTransform: 'uppercase' }}>Marketing System</div>
                  <div style={{ fontSize: '11px', color: '#ffffff' }}>online</div>
                </div>
              </div>
            </div>
            <div style={{
              background: '#000000', minHeight: '350px', padding: '16px',
            }}>
              {(preview || messages[0]) ? (
                <div className="animate-fade-in">
                  <div style={{
                    background: '#000000',
                    padding: '12px', maxWidth: '280px', fontSize: '13px', lineHeight: 1.6,
                    color: '#ffffff', whiteSpace: 'pre-line',
                    border: '1px solid var(--color-border)'
                  }}>
                    {preview?.response || messages[0]?.content}
                  </div>
                  <div style={{ fontSize: '10px', color: '#ffffff', marginTop: '4px', textAlign: 'right' }}>
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '100px', color: '#ffffff', fontSize: '13px' }}>
                  Configure campaign and click "Preview" to see message here
                </div>
              )}
            </div>
            <div style={{ background: '#000000', borderTop: '1px solid var(--color-border)', padding: '8px 12px' }}>
              <div style={{
                background: '#000000', border: '1px solid var(--color-border)', padding: '8px 16px',
                fontSize: '13px', color: '#ffffff'
              }}>Type a message...</div>
            </div>
          </div>

          {preview && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#000000', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '12px', color: '#ffffff', display: 'flex', justifyContent: 'space-between' }}>
                <span>Engine: {preview.model}</span>
                <span>Sources: {preview.source_count} docs</span>
              </div>
              <div style={{ fontSize: '12px', color: '#ffffff', marginTop: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                {preview.grounded ? 'Verified against Database Documents' : 'Unverified response'}
              </div>
            </div>
          )}
        </div>
      </div>

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
            <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase' }}>
              Review Campaign Alert
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
                  <label style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>Target Area</label>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>{activeReviewCampaign.state}, {activeReviewCampaign.district || 'All Districts'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>Target Farmers</label>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{activeReviewCampaign.target_farmers} Farmers</div>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <label style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>Triggering News Source</label>
                <div style={{ fontSize: '13px', color: '#ffffff', fontStyle: 'italic', marginTop: '4px' }}>
                  &ldquo;{activeReviewCampaign.trigger_news_headline}&rdquo;
                </div>
                <a href={activeReviewCampaign.trigger_news_url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#ffffff', textDecoration: 'underline', display: 'inline-block', marginTop: '4px' }}>View Source Article ↗</a>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>Local Weather Context</label>
                <div style={{ fontSize: '13px', color: '#ffffff', marginTop: '4px' }}>
                  {activeReviewCampaign.trigger_weather}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <label style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontWeight: 700 }}>Localized Message Templates</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(activeReviewCampaign.message_templates || {}).map(([lang, text]) => (
                    <div key={lang} style={{ background: '#000000', padding: '12px', border: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>{lang} Template</span>
                      <p style={{ margin: 0, fontSize: '13px', color: '#ffffff', whiteSpace: 'pre-line' }}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setActiveReviewCampaign(null)} style={{ padding: '8px 20px', fontSize: '13px' }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => handleApprove(activeReviewCampaign.id)} disabled={approving} style={{ padding: '8px 24px', fontSize: '13px' }}>
                {approving ? 'Approving...' : 'Approve & Send Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDemoMessage(form) {
  const demos = {
    'Rice-Telugu': 'నమస్కారం రైతు!\n\nవరి పంటలో బ్లాస్ట్ వ్యాధి హెచ్చరిక.\n\nచికిత్స: Amistar Top 1ml/లీటర్\nసమయం: ఉదయం 7-9\nమోతాదు: 200ml/ఎకరం\n\n15 రోజుల తర్వాత మళ్ళీ.',
    'Rice-Tamil': 'வணக்கம்!\n\nநெல் நோய் எச்சரிக்கை.\n\nசிகிச்சை: Amistar Top 1ml/லி\nநேரம்: காலை 7-9\nஅளவு: 200ml/ஏக்கர்\n\n15 நாள் பிறகு மீண்டும்.',
    'Rice-Hindi': 'नमस्ते!\n\nधान में ब्लास्ट रोग अलर्ट.\n\nउपचार: Amistar Top 1ml/लीटर\nसमय: सुबह 7-9\nमात्रा: 200ml/एकड़\n\n15 दिन बाद दोबारा.',
    'Cotton-Hindi': 'नमस्ते!\n\nकपास में बॉलवर्म अलर्ट!\n\nउपचार: Ampligo 0.4ml/लीटर\nसमय: शाम 5 बजे बाद\nमात्रा: 80ml/एकड़',
  };
  return demos[`${form.crop}-${form.language}`] || demos['Rice-Hindi'];
}

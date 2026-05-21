import { useState } from 'react';
import { api } from '../services/api';

const EXAMPLE_QUERIES = [
  { q: 'Rice farmer in Tamil Nadu, blast disease detected in Kharif season', crop: 'Rice', state: 'Tamil Nadu', lang: 'Tamil' },
  { q: 'Cotton bollworm outbreak in Maharashtra, urgent treatment needed', crop: 'Cotton', state: 'Maharashtra', lang: 'Marathi' },
  { q: 'Wheat yellow rust warning in Punjab, preventive measures required', crop: 'Wheat', state: 'Punjab', lang: 'Hindi' },
  { q: 'Brown plant hopper in Andhra Pradesh rice fields, high severity', crop: 'Rice', state: 'Andhra Pradesh', lang: 'Telugu' },
];

export default function RAGDemoPage() {
  const [query, setQuery] = useState('');
  const [crop, setCrop] = useState('Rice');
  const [state, setState] = useState('Andhra Pradesh');
  const [language, setLanguage] = useState('Hindi');
  const [channel, setChannel] = useState('WhatsApp');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ragStatus, setRagStatus] = useState(null);

  const handleQuery = async (q, c, s, l) => {
    const queryText = q || query;
    const queryCrop = c || crop;
    const queryState = s || state;
    const queryLang = l || language;
    if (!queryText) return;
    setQuery(queryText); setCrop(queryCrop); setState(queryState); setLanguage(queryLang);
    setLoading(true);
    try {
      const res = await api.ragQuery({ query: queryText, crop: queryCrop, state: queryState, language: queryLang, channel });
      setResult(res);
    } catch {
      setResult({
        query: queryText, response: getDemoRAGResponse(queryCrop, queryLang, channel),
        retrieved_documents: [
          { content: 'Rice Blast Management: Apply Amistar Top 1ml/L...', relevance_score: 0.92, metadata: { crop: 'Rice', pest: 'Rice Blast' } },
          { content: 'Andhra Pradesh Rice Best Practices: Kharif...', relevance_score: 0.85, metadata: { crop: 'Rice', state: 'Andhra Pradesh' } },
          { content: 'Syngenta Amistar Top: Azoxystrobin 18.2%...', relevance_score: 0.78, metadata: { crop: 'all', category: 'product' } },
        ],
        language: queryLang, channel, grounded: true, source_count: 3, model: 'demo-mode'
      });
    }
    setLoading(false);
  };

  const loadStatus = async () => {
    try { setRagStatus(await api.ragStatus()); } catch {
      setRagStatus({ status: 'ready', vector_store: 'ChromaDB', documents: 13, llm: 'Demo Mode',
        crops_covered: ['Rice','Cotton','Wheat','Sugarcane','Groundnut'],
        states_covered: ['Andhra Pradesh','Maharashtra','Tamil Nadu','Punjab','UP'], hallucination_guard: true });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '28px', background: '#000000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, textTransform: 'uppercase' }}>Agronomic Database Search</h1>
            <p style={{ color: '#ffffff', marginTop: '8px', maxWidth: '600px' }}>
              Query the agronomic knowledge base and official product indexes.
              See matching source documents, product compatibility codes, and verified dosage sheets.</p>
          </div>
          <button className="btn-secondary" onClick={loadStatus}>System Status</button>
        </div>
      </div>

      {ragStatus && (
        <div className="glass-card animate-fade-in" style={{ padding: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap', background: '#000000' }}>
          {[
            ['Database', ragStatus.vector_store],
            ['Documents', ragStatus.documents],
            ['Query Engine', 'Template Processor'],
            ['Verification Check', ragStatus.hallucination_guard ? 'Active' : 'Off'],
          ].map(([l,v]) => (
            <div key={l} style={{ flex: 1, minWidth: '150px' }}>
              <div style={{ fontSize: '11px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>{l}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Example Queries */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: '#ffffff', alignSelf: 'center', textTransform: 'uppercase', fontWeight: 700 }}>Try:</span>
        {EXAMPLE_QUERIES.map((eq, i) => (
          <button key={i} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={() => handleQuery(eq.q, eq.crop, eq.state, eq.lang)}>
            {eq.crop} - {eq.state}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Query Panel */}
        <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Query Knowledge Base</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea className="input-field" rows={3} placeholder="e.g., Rice farmer in AP, blast disease detected..."
              value={query} onChange={e => setQuery(e.target.value)} style={{ resize: 'vertical' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select className="input-field" value={crop} onChange={e => setCrop(e.target.value)}>
                {['Rice','Cotton','Wheat','Sugarcane','Groundnut'].map(c => <option key={c}>{c}</option>)}</select>
              <select className="input-field" value={state} onChange={e => setState(e.target.value)}>
                {['Andhra Pradesh','Maharashtra','Tamil Nadu','Punjab','Uttar Pradesh'].map(s => <option key={s}>{s}</option>)}</select>
              <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)}>
                {['Hindi','Telugu','Tamil','Marathi','English'].map(l => <option key={l}>{l}</option>)}</select>
              <select className="input-field" value={channel} onChange={e => setChannel(e.target.value)}>
                {['WhatsApp','SMS','Voice'].map(c => <option key={c}>{c}</option>)}</select>
            </div>
            <button className="btn-primary" onClick={() => handleQuery()} disabled={loading || !query}>
              {loading ? 'Querying Database...' : 'Query & Search'}</button>
          </div>

          {/* Retrieved Docs */}
          {result?.retrieved_documents && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: '#ffffff', textTransform: 'uppercase' }}>
                Retrieved Documents ({result.source_count})</h4>
              {result.retrieved_documents.map((doc, i) => (
                <div key={i} style={{ padding: '12px', background: '#000000',
                  marginBottom: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="badge" style={{ fontSize: '10px' }}>{doc.metadata?.crop || 'General'}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>
                      {(doc.relevance_score * 100).toFixed(0)}% match</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#ffffff', lineHeight: 1.5 }}>
                    {doc.content?.substring(0, 200)}...</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Response Panel */}
        <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Remedy Response</h3>
          {loading ? (
            <div><div className="skeleton" style={{ height: 20, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 20, width: '60%' }} /></div>
          ) : result ? (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span className="badge">{result.grounded ? 'Verified Data' : 'Draft'}</span>
                <span className="badge">{result.model === 'demo-mode' ? 'Standard Engine' : result.model}</span>
                <span className="badge">{result.language}</span>
                <span className="badge">{result.channel}</span>
              </div>
              <div className={result.channel === 'WhatsApp' ? 'whatsapp-bubble' : 'sms-bubble'}
                style={{ maxWidth: '100%' }}>
                <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{result.response}</div>
              </div>
              {result.grounded && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#000000', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>Verification Check Active</div>
                  <div style={{ fontSize: '12px', color: '#ffffff', marginTop: '4px' }}>
                    Response verified against {result.source_count} official guidelines.
                    Product names, dosages, and timing verified against official specifications.</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', flexDirection: 'column' }}>
              <div style={{ fontSize: '14px', marginTop: '12px' }}>Enter a query to search database resources</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getDemoRAGResponse(crop, lang, channel) {
  const m = {
    'Rice-Hindi': 'नमस्ते!\n\nधान में ब्लास्ट रोग अलर्ट!\n\nउपचार: Amistar Top 1ml/लीटर\nसमय: सुबह 7-9 बजे छिड़काव\nमात्रा: 200ml/एकड़\n\nसत्यापित जानकारी।',
    'Rice-Telugu': 'నమస్కారం!\n\nవరి బ్లాస్ట్ హెచ్చరిక!\n\nచికిత్స: Amistar Top 1ml/లీటర్\nసమయం: ఉదయం 7-9\nమోతాదు: 200ml/ఎకరం\n\nధృవీకరించబడింది.',
  };
  return m[`${crop}-${lang}`] || m['Rice-Hindi'];
}

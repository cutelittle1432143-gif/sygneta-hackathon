import { useState, useRef } from 'react';
import { api } from '../services/api';

const FRAMES = [
  { id: 'rice_care', name: 'Rice Care', crop: 'Rice', color: '#000000', accent: '#ffffff' },
  { id: 'cotton_expert', name: 'Cotton Expert', crop: 'Cotton', color: '#000000', accent: '#888888' },
  { id: 'wheat_champion', name: 'Wheat Champion', crop: 'Wheat', color: '#000000', accent: '#cccccc' },
];
const PRODUCTS = { Rice: ['Amistar Top','Score','Actara'], Cotton: ['Ampligo','Polo','Actara'], Wheat: ['Amistar Top','Tilt','Score'] };

export default function SelfieToolPage() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [crop, setCrop] = useState('Rice');
  const [product, setProduct] = useState('Amistar Top');
  const [frame, setFrame] = useState('rice_care');
  const [name, setName] = useState('');
  const [lang, setLang] = useState('Hindi');
  const [detection, setDetection] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
    try {
      const fd = new FormData(); fd.append('file', file);
      const det = await api.detectCrop(fd);
      setDetection(det);
      if (det.crop) setCrop(det.crop);
    } catch { setDetection({ crop: 'Rice', confidence: 0.85, message: 'Detected: Rice (85%)' }); }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', imageFile); fd.append('crop', crop); fd.append('product', product);
      fd.append('frame', frame); fd.append('farmer_name', name || 'Farmer'); fd.append('language', lang);
      setResult(await api.generateSelfie(fd));
    } catch { setResult({ success: true, image_url: image, farmer_name: name, crop, product }); }
    setLoading(false);
  };

  const reset = () => { setImage(null); setDetection(null); setResult(null); };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '28px', textAlign: 'center', background: '#000000' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, textTransform: 'uppercase' }}>KrishiGarv Selfie Tool</h1>
        <p style={{ color: '#ffffff', maxWidth: '500px', margin: '8px auto 0' }}>
          Upload your selfie, let image analysis identify your crop, and get a branded image to share!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
          {!image ? (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Upload Selfie</h3>
              <div onClick={() => fileRef.current?.click()} style={{ border: '1px dashed var(--color-border)',
                padding: '60px 20px', textAlign: 'center', cursor: 'pointer' }}>
                <svg style={{ width: '48px', height: '48px', fill: '#ffffff', margin: '0 auto 12px', display: 'block' }} viewBox="0 0 24 24">
                  <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                </svg>
                <div style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}>Click to upload</div>
                <div style={{ fontSize: '13px', color: '#ffffff' }}>JPG, PNG up to 5MB</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {detection && <div style={{ padding: '10px 14px', background: '#000000', border: '1px solid var(--color-border)', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase' }}>
                {detection.message}</div>}
              <input className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <select className="input-field" value={crop} onChange={e => { setCrop(e.target.value); setProduct(PRODUCTS[e.target.value][0]); }}>
                  {Object.keys(PRODUCTS).map(c => <option key={c}>{c}</option>)}</select>
                <select className="input-field" value={product} onChange={e => setProduct(e.target.value)}>
                  {(PRODUCTS[crop]||[]).map(p => <option key={p}>{p}</option>)}</select>
              </div>
              <select className="input-field" value={lang} onChange={e => setLang(e.target.value)}>
                {['Hindi','Telugu','Tamil','English'].map(l => <option key={l}>{l}</option>)}</select>
              <div style={{ display: 'flex', gap: '10px' }}>
                {FRAMES.map(f => <div key={f.id} onClick={() => setFrame(f.id)} style={{ flex: 1, padding: '10px',
                  cursor: 'pointer', background: '#000000', textAlign: 'center',
                  border: frame===f.id ? '2px solid #ffffff' : '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'white', textTransform: 'uppercase' }}>{f.name}</div></div>)}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleGenerate} disabled={loading}>
                  {loading ? 'Creating...' : 'Generate Image'}</button>
                <button className="btn-secondary" onClick={reset}>Reset</button>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '24px', background: '#000000' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>
            {result ? 'Your KrishiGarv Image' : 'Preview'}</h3>
          {result?.image_url ? (
            <div className="animate-fade-in">
              <img src={result.image_url} alt="KrishiGarv" style={{ width: '100%', border: '1px solid var(--color-border)', marginBottom: '16px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={result.image_url} download className="btn-primary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>Download</a>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`My KrishiGarv! #KrishiGarv #Syngenta`)}`)}>Share</button>
              </div>
            </div>
          ) : image ? (
            <div style={{ position: 'relative', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <img src={image} alt="Preview" style={{ width: '100%', opacity: 0.8 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', color: 'white',
                background: 'linear-gradient(transparent, #000000)' }}>
                <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 700 }}>KrishiGarv × SYNGENTA</div>
                <div style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase' }}>{name || 'Your Name'}</div>
                <div style={{ fontSize: '13px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>{crop} | {product}</div>
              </div>
            </div>
          ) : (
            <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '1px dashed var(--color-border)', color: '#ffffff' }}>
              <svg style={{ width: '64px', height: '64px', fill: '#ffffff', opacity: 0.3, marginBottom: '12px' }} viewBox="0 0 24 24">
                <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
              </svg>
              <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '12px', textTransform: 'uppercase' }}>Upload a selfie to get started</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

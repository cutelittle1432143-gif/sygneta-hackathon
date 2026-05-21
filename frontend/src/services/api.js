const BASE = '';

async function fetchJSON(url, opts = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  // Analytics
  getOverview: () => fetchJSON('/api/analytics/overview'),
  getLanguages: () => fetchJSON('/api/analytics/language-distribution'),
  getChannels: () => fetchJSON('/api/analytics/channel-performance'),
  getFunnel: () => fetchJSON('/api/analytics/conversion-funnel'),
  getCampaignPerf: () => fetchJSON('/api/analytics/campaign-performance'),
  getCropDist: () => fetchJSON('/api/analytics/crop-distribution'),
  getStateDist: () => fetchJSON('/api/analytics/state-distribution'),

  // Campaigns
  getCampaigns: (status) => fetchJSON(`/api/campaigns/${status ? `?status=${status}` : ''}`),
  getCampaign: (id) => fetchJSON(`/api/campaigns/${id}`),
  createCampaign: (data) => fetchJSON('/api/campaigns/', { method: 'POST', body: JSON.stringify(data) }),
  generateMessages: (id, data) => fetchJSON(`/api/campaigns/${id}/generate`, { method: 'POST', body: JSON.stringify(data) }),
  generatePreview: (data) => fetchJSON('/api/campaigns/generate-preview', { method: 'POST', body: JSON.stringify(data) }),
  getPendingCampaigns: () => fetchJSON('/api/campaigns/pending/list'),
  triggerAlertsScan: () => fetchJSON('/api/campaigns/trigger-scan', { method: 'POST' }),
  approveCampaign: (id) => fetchJSON(`/api/campaigns/${id}/approve`, { method: 'POST' }),
  rejectCampaign: (id) => fetchJSON(`/api/campaigns/${id}/reject`, { method: 'POST' }),
  getTwilioLogs: () => fetchJSON('/api/campaigns/twilio/logs'),

  // Farmers
  getFarmers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJSON(`/api/farmers/?${qs}`);
  },
  getFarmerStats: () => fetchJSON('/api/farmers/stats'),
  getFarmer: (id) => fetchJSON(`/api/farmers/${id}`),

  // RAG
  ragQuery: (data) => fetchJSON('/api/rag/query', { method: 'POST', body: JSON.stringify(data) }),
  ragStatus: () => fetchJSON('/api/rag/status'),
  ragRetrieve: (data) => fetchJSON('/api/rag/retrieve', { method: 'POST', body: JSON.stringify(data) }),

  // Selfie
  getFrames: () => fetchJSON('/api/selfie/frames'),
  detectCrop: (formData) => fetch('/api/selfie/detect-crop', { method: 'POST', body: formData }).then(r => r.json()),
  generateSelfie: (formData) => fetch('/api/selfie/generate', { method: 'POST', body: formData }).then(r => r.json()),
};

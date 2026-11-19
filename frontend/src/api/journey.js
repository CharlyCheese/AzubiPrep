import { api } from './client.js';

const base = '/journey/fiae';
export const journeyApi = {
  catalog: () => api.get(base),
  progressCatalog: () => api.get(`${base}/progress-catalog`),
  topic: (id) => api.get(`${base}/topics/${encodeURIComponent(id)}`),
  check: (id, body) => api.post(`${base}/topics/${encodeURIComponent(id)}/check`, body),
  evaluate: (id, body) => api.post(`${base}/topics/${encodeURIComponent(id)}/evaluate`, body),
};

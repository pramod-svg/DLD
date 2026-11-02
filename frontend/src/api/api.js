const API_BASE = '/api';

async function request(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || `HTTP ${res.status}`, status: res.status };
    }
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const api = {
  getElection: () => request('/elections'),
  createElection: (body) => request('/elections', { method: 'POST', body: JSON.stringify(body) }),
  resetElection: () => request('/elections/reset', { method: 'POST' }),
  getCandidates: () => request('/candidates'),
  addCandidate: (body) => request('/candidates', { method: 'POST', body: JSON.stringify(body) }),
  castVote: (body) => request('/votes', { method: 'POST', body: JSON.stringify(body) }),
  getResults: () => request('/results'),
  permitNextVoter: () => request('/session/permit', { method: 'POST' }),
};

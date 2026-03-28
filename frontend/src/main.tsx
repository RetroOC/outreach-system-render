/// <reference types="vite/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type AppState = {
  apiBase: string;
  apiKey: string;
};

type Account = { id: string; name: string; createdAt?: string };
type Campaign = { id: string; name: string; status: string; objective?: string };

type ApiResult<T> = { data?: T; error?: { code: string; message: string } };

const defaultApiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const defaultApiKey = import.meta.env.VITE_API_KEY || '';

function App() {
  const [config, setConfig] = React.useState<AppState>({ apiBase: defaultApiBase, apiKey: defaultApiKey });
  const [connected, setConnected] = React.useState<string>('Not checked');
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState('');
  const [status, setStatus] = React.useState('Ready');

  const [accountName, setAccountName] = React.useState('Neal Workspace');
  const [leadForm, setLeadForm] = React.useState({ email: '', firstName: '', company: '' });
  const [campaignForm, setCampaignForm] = React.useState({ name: 'New outbound campaign', objective: 'Book qualified calls' });

  const headers = React.useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey.trim()) h.Authorization = `Bearer ${config.apiKey.trim()}`;
    return h;
  }, [config]);

  async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
    const res = await fetch(`${config.apiBase}${path}`, {
      ...init,
      headers: {
        ...headers,
        ...(init?.headers || {}),
      },
    });
    return res.json();
  }

  async function checkHealth() {
    setStatus('Checking backend health...');
    try {
      const res = await request<{ ok: boolean }>('/health');
      if (res.data?.ok) {
        setConnected('Connected');
        setStatus('Backend reachable.');
      } else {
        setConnected('Failed');
        setStatus(res.error?.message || 'Health check failed');
      }
    } catch (error) {
      setConnected('Failed');
      setStatus(error instanceof Error ? error.message : 'Connection failed');
    }
  }

  async function createAccount() {
    setStatus('Creating account...');
    try {
      const res = await request<Account>('/accounts', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ name: accountName, settings: {} }),
      });
      if (res.data) {
        const next = [res.data, ...accounts];
        setAccounts(next);
        setSelectedAccountId(res.data.id);
        setStatus(`Account created: ${res.data.name}`);
      } else {
        setStatus(res.error?.message || 'Failed to create account');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create account');
    }
  }

  async function loadCampaigns(accountId: string) {
    if (!accountId) return;
    setStatus('Loading campaigns...');
    try {
      const res = await request<Campaign[]>(`/campaigns?accountId=${encodeURIComponent(accountId)}`);
      setCampaigns(res.data || []);
      setStatus('Campaigns loaded.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to load campaigns');
    }
  }

  async function createLead() {
    if (!selectedAccountId) {
      setStatus('Create/select an account first.');
      return;
    }
    setStatus('Creating lead...');
    try {
      const res = await request('/leads', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          accountId: selectedAccountId,
          email: leadForm.email,
          firstName: leadForm.firstName || undefined,
          company: leadForm.company || undefined,
          customFields: {},
        }),
      });
      if (res.data) {
        setLeadForm({ email: '', firstName: '', company: '' });
        setStatus('Lead created successfully.');
      } else {
        setStatus(res.error?.message || 'Failed to create lead');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create lead');
    }
  }

  async function createCampaign() {
    if (!selectedAccountId) {
      setStatus('Create/select an account first.');
      return;
    }
    setStatus('Creating campaign...');
    try {
      const res = await request<Campaign>('/campaigns', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          accountId: selectedAccountId,
          name: campaignForm.name,
          objective: campaignForm.objective,
          status: 'draft',
          settings: {},
          steps: [
            {
              stepNumber: 1,
              type: 'email',
              delay: { kind: 'after_enrollment', amount: 0, unit: 'minutes' },
              subjectTemplate: 'Quick question, {{firstName}}',
              bodyTemplate: 'Hi {{firstName}}, wanted to reach out about {{company}}.',
            },
            {
              stepNumber: 2,
              type: 'email',
              delay: { kind: 'after_previous_sent', amount: 3, unit: 'days' },
              subjectTemplate: 'Following up',
              bodyTemplate: 'Just circling back here.',
            },
          ],
        }),
      });
      if (res.data) {
        setCampaigns([res.data, ...campaigns]);
        setStatus(`Campaign created: ${res.data.name}`);
      } else {
        setStatus(res.error?.message || 'Failed to create campaign');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create campaign');
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">Working prototype</span>
          <h1>Outreach system prototype you can actually use in the next hour.</h1>
          <p>
            This prototype connects to the existing outreach-core API and gives you simple working flows for backend health,
            account creation, lead creation, and campaign creation.
          </p>
        </div>
        <div className="hero-card">
          <span>Prototype scope</span>
          <strong>Health · Accounts · Leads · Campaigns</strong>
          <p>Designed for speed, clarity, and immediate deployability.</p>
        </div>
      </header>

      <main className="grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">1. Configure</span>
              <h2>Backend connection</h2>
            </div>
            <span className={connected === 'Connected' ? 'badge success' : connected === 'Failed' ? 'badge danger' : 'badge'}>{connected}</span>
          </div>
          <div className="form-grid">
            <label>
              API base URL
              <input value={config.apiBase} onChange={(e) => setConfig({ ...config, apiBase: e.target.value })} placeholder="http://localhost:3000" />
            </label>
            <label>
              API key
              <input value={config.apiKey} onChange={(e) => setConfig({ ...config, apiKey: e.target.value })} placeholder="Optional bearer token" />
            </label>
          </div>
          <div className="actions">
            <button className="button primary" onClick={checkHealth}>Check backend</button>
          </div>
        </section>

        <section className="panel two-col">
          <div>
            <div className="panel-head">
              <div>
                <span className="eyebrow">2. Workspace</span>
                <h2>Create account</h2>
              </div>
            </div>
            <label>
              Account name
              <input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </label>
            <div className="actions">
              <button className="button primary" onClick={createAccount}>Create account</button>
            </div>
          </div>

          <div>
            <div className="panel-head">
              <div>
                <span className="eyebrow">Current account</span>
                <h2>Select active account</h2>
              </div>
            </div>
            <label>
              Account
              <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
                <option value="">Choose account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </label>
            <div className="actions">
              <button className="button secondary" onClick={() => loadCampaigns(selectedAccountId)}>Load campaigns</button>
            </div>
          </div>
        </section>

        <section className="panel two-col">
          <div>
            <div className="panel-head">
              <div>
                <span className="eyebrow">3. Leads</span>
                <h2>Create lead</h2>
              </div>
            </div>
            <label>
              Email
              <input value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="maya@northstar.com" />
            </label>
            <label>
              First name
              <input value={leadForm.firstName} onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })} placeholder="Maya" />
            </label>
            <label>
              Company
              <input value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} placeholder="Northstar" />
            </label>
            <div className="actions">
              <button className="button primary" onClick={createLead}>Create lead</button>
            </div>
          </div>

          <div>
            <div className="panel-head">
              <div>
                <span className="eyebrow">4. Campaigns</span>
                <h2>Create campaign</h2>
              </div>
            </div>
            <label>
              Campaign name
              <input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} />
            </label>
            <label>
              Objective
              <input value={campaignForm.objective} onChange={(e) => setCampaignForm({ ...campaignForm, objective: e.target.value })} />
            </label>
            <div className="actions">
              <button className="button primary" onClick={createCampaign}>Create campaign</button>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">5. Campaign list</span>
              <h2>Campaigns in selected account</h2>
            </div>
          </div>
          {campaigns.length === 0 ? (
            <div className="empty-state">No campaigns loaded yet.</div>
          ) : (
            <div className="list">
              {campaigns.map((campaign) => (
                <article key={campaign.id} className="list-item">
                  <div>
                    <strong>{campaign.name}</strong>
                    <p>{campaign.objective || 'No objective set'}</p>
                  </div>
                  <span className="badge">{campaign.status}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Status</span>
              <h2>Run log</h2>
            </div>
          </div>
          <div className="status-box">{status}</div>
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

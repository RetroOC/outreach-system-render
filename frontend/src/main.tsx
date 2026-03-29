/// <reference types="vite/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type Feature = { title: string; body: string };
type Metric = { value: string; label: string };
type Workflow = { step: string; title: string; body: string };
type Testimonial = { quote: string; author: string; role: string };

type Account = { id: string; name: string };
type Inbox = { id: string; emailAddress: string; provider: string; authStatus?: string };
type Campaign = { id: string; name: string; status: string; objective?: string };
type Lead = { id: string; email: string; firstName?: string; company?: string };

type ApiResult<T> = { data?: T; error?: { code: string; message: string } };

const features: Feature[] = [
  {
    title: 'All outreach operations in one place',
    body: 'Run campaigns, manage inboxes, monitor reply flow, and keep your outbound system controlled from one clean operating layer.',
  },
  {
    title: 'Built for deliverability-aware scale',
    body: 'Protect sender reputation with pacing logic, inbox controls, suppression handling, and stop-on-reply discipline.',
  },
  {
    title: 'From lead to reply without workflow sprawl',
    body: 'Move from targeting to sequence execution to reply handling without stitching together five different tools.',
  },
];

const metrics: Metric[] = [
  { value: '1', label: 'platform for campaigns, inboxes, and replies' },
  { value: '3x', label: 'clearer operator workflow than disconnected tools' },
  { value: '0', label: 'need for scattered sequence + inbox + ops stacks' },
];

const workflow: Workflow[] = [
  {
    step: '01',
    title: 'Set up the campaign',
    body: 'Define the offer, audience, and sequence logic in a structured campaign workspace.',
  },
  {
    step: '02',
    title: 'Connect Gmail manually',
    body: 'Create a Gmail inbox entry, mark it connected, and use manual test sends from the dashboard.',
  },
  {
    step: '03',
    title: 'Keep campaign execution paused',
    body: 'Create leads and campaigns now, but keep automation paused until you want live execution.',
  },
];

const testimonials: Testimonial[] = [
  {
    quote: 'Finally feels like an outbound product built around operations, not just message sending.',
    author: 'Revenue Lead',
    role: 'B2B SaaS',
  },
  {
    quote: 'The big win is clarity. Campaign state, inbox state, and reply state belong together.',
    author: 'Founder',
    role: 'Outbound-first startup',
  },
  {
    quote: 'This is the kind of system teams actually want once volume starts creating complexity.',
    author: 'Agency Operator',
    role: 'Lead generation',
  },
];

const defaultApiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const defaultApiKey = import.meta.env.VITE_API_KEY || '';

function App() {
  const [apiBase, setApiBase] = React.useState(defaultApiBase);
  const [apiKey, setApiKey] = React.useState(defaultApiKey);
  const [status, setStatus] = React.useState('Ready');
  const [health, setHealth] = React.useState('Not checked');

  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState('');
  const [accountName, setAccountName] = React.useState('Neal Workspace');

  const [inboxes, setInboxes] = React.useState<Inbox[]>([]);
  const [selectedInboxId, setSelectedInboxId] = React.useState('');
  const [inboxForm, setInboxForm] = React.useState({ emailAddress: '', displayName: '', dailyLimit: '50', hourlyLimit: '10' });
  const [testSend, setTestSend] = React.useState({ to: '', subject: 'Test from Neal', text: 'This is a manual Gmail test send from the dashboard.' });

  const [leadForm, setLeadForm] = React.useState({ email: '', firstName: '', company: '' });
  const [campaignForm, setCampaignForm] = React.useState({ name: 'Manual outreach campaign', objective: 'Book qualified calls' });
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);

  const baseHeaders = React.useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey.trim()) headers.Authorization = `Bearer ${apiKey.trim()}`;
    return headers;
  }, [apiKey]);

  async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        ...baseHeaders,
        ...(init?.headers || {}),
      },
    });
    return response.json();
  }

  async function checkHealth() {
    setStatus('Checking backend...');
    try {
      const result = await request<{ ok: boolean }>('/health');
      if (result.data?.ok) {
        setHealth('Connected');
        setStatus('Backend reachable.');
      } else {
        setHealth('Failed');
        setStatus(result.error?.message || 'Health check failed');
      }
    } catch (error) {
      setHealth('Failed');
      setStatus(error instanceof Error ? error.message : 'Health check failed');
    }
  }

  async function createAccount() {
    setStatus('Creating account...');
    try {
      const result = await request<Account>('/accounts', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ name: accountName, settings: {} }),
      });
      if (result.data) {
        const next = [result.data, ...accounts];
        setAccounts(next);
        setSelectedAccountId(result.data.id);
        setStatus(`Account created: ${result.data.name}`);
      } else {
        setStatus(result.error?.message || 'Failed to create account');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create account');
    }
  }

  async function createInbox() {
    if (!selectedAccountId) return setStatus('Create/select an account first.');
    setStatus('Creating Gmail inbox...');
    try {
      const result = await request<Inbox>('/inboxes', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          accountId: selectedAccountId,
          emailAddress: inboxForm.emailAddress,
          provider: 'gmail',
          displayName: inboxForm.displayName || undefined,
          dailyLimit: Number(inboxForm.dailyLimit),
          hourlyLimit: Number(inboxForm.hourlyLimit),
          minDelaySeconds: 0,
          sendingWindow: {},
        }),
      });
      if (result.data) {
        const next = [result.data, ...inboxes];
        setInboxes(next);
        setSelectedInboxId(result.data.id);
        setStatus(`Inbox created: ${result.data.emailAddress}`);
      } else {
        setStatus(result.error?.message || 'Failed to create inbox');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create inbox');
    }
  }

  async function connectInbox() {
    if (!selectedInboxId) return setStatus('Select an inbox first.');
    setStatus('Connecting inbox...');
    try {
      const result = await request<{ inboxId: string; authStatus: string }>(`/inboxes/${selectedInboxId}/connect`, {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      });
      if (result.data) {
        setInboxes((prev) => prev.map((item) => item.id === selectedInboxId ? { ...item, authStatus: result.data?.authStatus } : item));
        setStatus(`Inbox marked connected.`);
      } else {
        setStatus(result.error?.message || 'Failed to connect inbox');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to connect inbox');
    }
  }

  async function sendTestEmail() {
    if (!selectedInboxId) return setStatus('Select an inbox first.');
    setStatus('Sending test email...');
    try {
      const result = await request<{ provider: string; providerMessageId: string; acceptedAt: string }>(`/inboxes/${selectedInboxId}/send-test`, {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(testSend),
      });
      if (result.data) {
        setStatus(`Test email sent via ${result.data.provider}. Message ID: ${result.data.providerMessageId}`);
      } else {
        setStatus(result.error?.message || 'Failed to send test email');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to send test email');
    }
  }

  async function createLead() {
    if (!selectedAccountId) return setStatus('Create/select an account first.');
    setStatus('Creating lead...');
    try {
      const result = await request('/leads', {
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
      if (result.data) {
        const lead = result.data as Lead;
        setLeads((prev) => [lead, ...prev]);
        setLeadForm({ email: '', firstName: '', company: '' });
        setStatus(`Lead created: ${lead.email}`);
      } else {
        setStatus(result.error?.message || 'Failed to create lead');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create lead');
    }
  }

  async function createCampaign() {
    if (!selectedAccountId) return setStatus('Create/select an account first.');
    setStatus('Creating campaign...');
    try {
      const result = await request<Campaign>('/campaigns', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          accountId: selectedAccountId,
          name: campaignForm.name,
          objective: campaignForm.objective,
          status: 'draft',
          settings: { manualOnly: true },
          steps: [
            {
              stepNumber: 1,
              type: 'email',
              delay: { kind: 'after_enrollment', amount: 0, unit: 'minutes' },
              subjectTemplate: 'Quick question, {{firstName}}',
              bodyTemplate: 'Hi {{firstName}}, wanted to reach out about {{company}}.',
            },
          ],
        }),
      });
      if (result.data) {
        setCampaigns((prev) => [result.data!, ...prev]);
        setStatus(`Campaign created: ${result.data.name} (manual mode)`);
      } else {
        setStatus(result.error?.message || 'Failed to create campaign');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create campaign');
    }
  }

  async function loadCampaigns() {
    if (!selectedAccountId) return setStatus('Select an account first.');
    setStatus('Loading campaigns...');
    try {
      const result = await request<Campaign[]>(`/campaigns?accountId=${encodeURIComponent(selectedAccountId)}`);
      setCampaigns(result.data || []);
      setStatus('Campaigns loaded.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to load campaigns');
    }
  }

  React.useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">N</span>
          <span className="brand-copy">
            <strong>Neal</strong>
            <em>Outreach operating system</em>
          </span>
        </a>

        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#cta">Get started</a>
        </nav>

        <div className="topbar-actions">
          <a className="button button-ghost" href="#dashboard">Open dashboard</a>
          <a className="button button-primary" href="#dashboard">Start testing</a>
        </div>
      </header>

      <main className="page" id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Research-led outbound infrastructure</span>
            <h1>Launch, manage, and scale outbound from one clean operating system.</h1>
            <p className="hero-lede">
              Neal helps teams run campaigns, manage inboxes, protect deliverability, and handle replies without relying on a messy stack of disconnected tools.
            </p>
            <div className="hero-actions">
              <a className="button button-primary button-large" href="#dashboard">Open dashboard</a>
              <a className="button button-secondary button-large" href="#dashboard">Start testing</a>
            </div>
            <div className="hero-subnote">
              Built for founders, operators, and teams that want better control over outbound execution.
            </div>
          </div>

          <div className="hero-visual">
            <div className="ui-window primary-window">
              <div className="ui-header">
                <span />
                <span />
                <span />
                <strong>Campaign overview</strong>
              </div>
              <div className="ui-grid">
                <div className="ui-panel wide">
                  <span className="panel-label">Campaign</span>
                  <strong>Tanzania UHNI acquisition</strong>
                  <p>4-step sequence · buyer-side advisory angle · review ready</p>
                </div>
                <div className="stat-card"><strong>112</strong><span>enrolled leads</span></div>
                <div className="stat-card"><strong>61%</strong><span>capacity remaining</span></div>
                <div className="stat-card"><strong>7</strong><span>replies to route</span></div>
                <div className="stat-card"><strong>Healthy</strong><span>sender state</span></div>
              </div>
            </div>

            <div className="floating-box left-box">
              <span className="panel-label">Replies</span>
              <strong>Interested lead detected</strong>
              <p>Owner assignment and next action ready.</p>
            </div>

            <div className="floating-box right-box">
              <span className="panel-label">Inbox health</span>
              <strong>Safe sending window</strong>
              <p>Pacing and caps within limits.</p>
            </div>
          </div>
        </section>

        <section className="metrics-strip">
          {metrics.map((metric) => (
            <article key={metric.label} className="metric-block">
              <strong>{metric.value}</strong>
              <p>{metric.label}</p>
            </article>
          ))}
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="eyebrow">Why Neal</span>
            <h2>A serious outbound system should feel controlled, not improvised.</h2>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">How it works</span>
              <h2>Everything from campaign setup to reply handling in one workflow.</h2>
            </div>
            <p>
              Neal is designed to reduce operator friction while keeping campaign logic, inbox discipline, and reply visibility in the same system.
            </p>
          </div>
          <div className="workflow-grid">
            {workflow.map((item) => (
              <article key={item.step} className="workflow-card">
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section" id="dashboard">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">Manual dashboard</span>
              <h2>Create Gmail inboxes, send manual test emails, add leads, and create campaigns.</h2>
            </div>
            <p>
              Campaign automation remains paused. This dashboard is for manual setup and control only.
            </p>
          </div>

          <div className="dashboard-grid">
            <article className="dashboard-card full-span">
              <div className="card-head">
                <h3>Backend connection</h3>
                <span className={health === 'Connected' ? 'badge success' : health === 'Failed' ? 'badge danger' : 'badge'}>{health}</span>
              </div>
              <div className="form-grid two-col-grid">
                <label>
                  API base URL
                  <input value={apiBase} onChange={(e) => setApiBase(e.target.value)} placeholder="http://localhost:3000" />
                </label>
                <label>
                  API key
                  <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Bearer token if enabled" />
                </label>
              </div>
              <div className="action-row"><button className="button button-primary" onClick={checkHealth}>Check backend</button></div>
            </article>

            <article className="dashboard-card">
              <div className="card-head"><h3>Create account</h3></div>
              <label>
                Account name
                <input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </label>
              <div className="action-row"><button className="button button-primary" onClick={createAccount}>Create account</button></div>
              <label>
                Active account
                <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
                  <option value="">Choose account</option>
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
              </label>
            </article>

            <article className="dashboard-card">
              <div className="card-head"><h3>Create Gmail inbox</h3></div>
              <label>
                Gmail address
                <input value={inboxForm.emailAddress} onChange={(e) => setInboxForm({ ...inboxForm, emailAddress: e.target.value })} placeholder="yourgmail@gmail.com" />
              </label>
              <label>
                Display name
                <input value={inboxForm.displayName} onChange={(e) => setInboxForm({ ...inboxForm, displayName: e.target.value })} placeholder="Gershon" />
              </label>
              <div className="form-grid two-col-grid">
                <label>
                  Daily limit
                  <input value={inboxForm.dailyLimit} onChange={(e) => setInboxForm({ ...inboxForm, dailyLimit: e.target.value })} />
                </label>
                <label>
                  Hourly limit
                  <input value={inboxForm.hourlyLimit} onChange={(e) => setInboxForm({ ...inboxForm, hourlyLimit: e.target.value })} />
                </label>
              </div>
              <div className="action-row"><button className="button button-primary" onClick={createInbox}>Create Gmail inbox</button></div>
              <label>
                Select inbox
                <select value={selectedInboxId} onChange={(e) => setSelectedInboxId(e.target.value)}>
                  <option value="">Choose inbox</option>
                  {inboxes.map((inbox) => <option key={inbox.id} value={inbox.id}>{inbox.emailAddress} {inbox.authStatus ? `(${inbox.authStatus})` : ''}</option>)}
                </select>
              </label>
              <div className="action-row"><button className="button button-secondary" onClick={connectInbox}>Mark inbox connected</button></div>
            </article>

            <article className="dashboard-card">
              <div className="card-head"><h3>Manual Gmail test send</h3></div>
              <label>
                To
                <input value={testSend.to} onChange={(e) => setTestSend({ ...testSend, to: e.target.value })} placeholder="recipient@example.com" />
              </label>
              <label>
                Subject
                <input value={testSend.subject} onChange={(e) => setTestSend({ ...testSend, subject: e.target.value })} />
              </label>
              <label>
                Message
                <textarea value={testSend.text} onChange={(e) => setTestSend({ ...testSend, text: e.target.value })} rows={5} />
              </label>
              <div className="action-row"><button className="button button-primary" onClick={sendTestEmail}>Send test email</button></div>
            </article>

            <article className="dashboard-card">
              <div className="card-head"><h3>Add lead</h3></div>
              <label>
                Lead email
                <input value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} />
              </label>
              <label>
                First name
                <input value={leadForm.firstName} onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })} />
              </label>
              <label>
                Company
                <input value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} />
              </label>
              <div className="action-row"><button className="button button-primary" onClick={createLead}>Create lead</button></div>
            </article>

            <article className="dashboard-card">
              <div className="card-head"><h3>Create campaign</h3></div>
              <label>
                Campaign name
                <input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} />
              </label>
              <label>
                Objective
                <input value={campaignForm.objective} onChange={(e) => setCampaignForm({ ...campaignForm, objective: e.target.value })} />
              </label>
              <div className="action-row">
                <button className="button button-primary" onClick={createCampaign}>Create campaign</button>
                <button className="button button-secondary" onClick={loadCampaigns}>Load campaigns</button>
              </div>
            </article>

            <article className="dashboard-card full-span">
              <div className="card-head"><h3>Campaign list</h3></div>
              {campaigns.length === 0 ? (
                <div className="empty-box">No campaigns loaded yet.</div>
              ) : (
                <div className="list-box">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="list-item-row">
                      <div>
                        <strong>{campaign.name}</strong>
                        <p>{campaign.objective || 'No objective set'}</p>
                      </div>
                      <span className="badge">{campaign.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="dashboard-card full-span">
              <div className="card-head"><h3>Recently created leads</h3></div>
              {leads.length === 0 ? (
                <div className="empty-box">No leads created in this session yet.</div>
              ) : (
                <div className="list-box">
                  {leads.map((lead) => (
                    <div key={lead.id} className="list-item-row">
                      <div>
                        <strong>{lead.email}</strong>
                        <p>{lead.firstName || 'No first name'} · {lead.company || 'No company'}</p>
                      </div>
                      <span className="badge">lead</span>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="dashboard-card full-span">
              <div className="card-head"><h3>Status log</h3></div>
              <div className="status-log">{status}</div>
            </article>
          </div>
        </section>

        <section className="proof-section" id="proof">
          <div className="section-heading">
            <span className="eyebrow">Proof</span>
            <h2>Built for teams that care about message quality, operational control, and scaling without chaos.</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article key={item.author} className="testimonial-card">
                <p>“{item.quote}”</p>
                <div>
                  <strong>{item.author}</strong>
                  <span>{item.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section" id="cta">
          <div>
            <span className="eyebrow">Get started</span>
            <h2>Start using a cleaner outbound system.</h2>
            <p>
              Set up campaigns, connect Gmail manually, and keep campaign automation paused until you are ready.
            </p>
          </div>
          <div className="hero-actions">
            <a className="button button-primary button-large" href="#dashboard">Open dashboard</a>
            <a className="button button-secondary button-large" href="#dashboard">Start testing</a>
          </div>
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

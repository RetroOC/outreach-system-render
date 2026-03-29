/// <reference types="vite/client" />
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

type ApiResult<T> = { data?: T; error?: { code: string; message: string } };
type Account = { id: string; name: string };
type Inbox = { id: string; emailAddress: string; authStatus?: string };
type Lead = { id: string; email: string; firstName?: string; company?: string; tags: string[]; customFields: Record<string, unknown> };
type LeadImport = { id: string; fileName: string; status: string; headers: string[]; sampleRows: Record<string, string>[]; totalRows: number; mapping: Record<string, string>; customFieldKeys: string[]; tagNames: string[]; createdLeadIds: string[] };
type CampaignStep = { stepNumber: number; subjectTemplate: string; bodyTemplate: string; delay: { amount: number; unit: string } };
type Campaign = { id: string; name: string; status: string; objective?: string; settings: Record<string, unknown>; schedule: { timezone: string; allowedDays: number[]; startHour: number; endHour: number }; steps: CampaignStep[] };

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const dayOptions = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];
const fieldTargets = ["ignore", "email", "firstName", "lastName", "company", "title", "timezone", "source"];

function App() {
  const [apiBase, setApiBase] = React.useState(API_BASE);
  const [apiKey, setApiKey] = React.useState(API_KEY);
  const [status, setStatus] = React.useState("Ready");

  const [accountName, setAccountName] = React.useState("Outreach v3 workspace");
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState("");

  const [inboxes, setInboxes] = React.useState<Inbox[]>([]);
  const [selectedInboxId, setSelectedInboxId] = React.useState("");
  const [inboxEmail, setInboxEmail] = React.useState("operator@example.com");

  const [csvText, setCsvText] = React.useState("email,first_name,company,industry,region,is_founder\nalice@example.com,Alice,Acme,Fintech,UK,yes\nbob@example.com,Bob,Beacon,Health,DE,no");
  const [fileName, setFileName] = React.useState("leads.csv");
  const [leadImports, setLeadImports] = React.useState<LeadImport[]>([]);
  const [activeImportId, setActiveImportId] = React.useState("");
  const [mapping, setMapping] = React.useState<Record<string, string>>({});

  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [campaignName, setCampaignName] = React.useState("Founder campaign");
  const [campaignObjective, setCampaignObjective] = React.useState("Book intro calls");
  const [scheduleTimezone, setScheduleTimezone] = React.useState("Europe/Berlin");
  const [allowedDays, setAllowedDays] = React.useState<number[]>([1, 2, 3, 4, 5]);
  const [startHour, setStartHour] = React.useState("9");
  const [endHour, setEndHour] = React.useState("17");
  const [trackOpens, setTrackOpens] = React.useState(false);
  const [stopOnReply, setStopOnReply] = React.useState(true);
  const [subjectTemplate, setSubjectTemplate] = React.useState("{Quick|Fast} question, {{firstName}}");
  const [bodyTemplate, setBodyTemplate] = React.useState("Hi {{firstName}},\n\nSaw {{company}} and wanted to ask a {quick|brief} question about your {{industry}} motion.\n\nOpen to a short chat?");
  const [spintaxPreview, setSpintaxPreview] = React.useState("");

  const headers = React.useMemo(() => {
    const base: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey.trim()) base.Authorization = `Bearer ${apiKey.trim()}`;
    return base;
  }, [apiKey]);

  const activeImport = React.useMemo(() => leadImports.find((item) => item.id === activeImportId) || null, [leadImports, activeImportId]);

  async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
    const response = await fetch(`${apiBase}${path}`, { ...init, headers: { ...headers, ...(init?.headers || {}) } });
    return response.json();
  }

  async function createAccount() {
    setStatus("Creating account...");
    const result = await request<Account>("/accounts", { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ name: accountName, settings: {} }) });
    if (result.data) {
      setAccounts((prev) => [result.data!, ...prev]);
      setSelectedAccountId(result.data.id);
      setStatus(`Account ready: ${result.data.name}`);
    } else setStatus(result.error?.message || "Failed to create account");
  }

  async function createInbox() {
    if (!selectedAccountId) return setStatus("Create an account first.");
    const result = await request<Inbox>("/inboxes", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ accountId: selectedAccountId, emailAddress: inboxEmail, provider: "gmail", dailyLimit: 40, hourlyLimit: 8, minDelaySeconds: 90, sendingWindow: {} }),
    });
    if (result.data) {
      setInboxes((prev) => [result.data!, ...prev]);
      setSelectedInboxId(result.data.id);
      setStatus(`Inbox created: ${result.data.emailAddress}`);
    } else setStatus(result.error?.message || "Failed to create inbox");
  }

  async function uploadCsv() {
    if (!selectedAccountId) return setStatus("Create an account first.");
    const result = await request<LeadImport>("/lead-imports/upload", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ accountId: selectedAccountId, fileName, csv: csvText }),
    });
    if (result.data) {
      setLeadImports((prev) => [result.data!, ...prev]);
      setActiveImportId(result.data.id);
      const inferred = Object.fromEntries(result.data.headers.map((header) => {
        const normalized = header.toLowerCase();
        if (normalized.includes("email")) return [header, "email"];
        if (normalized.includes("first")) return [header, "firstName"];
        if (normalized.includes("last")) return [header, "lastName"];
        if (normalized.includes("company")) return [header, "company"];
        if (normalized.includes("title")) return [header, "title"];
        if (normalized.includes("time")) return [header, "timezone"];
        if (normalized.includes("source")) return [header, "source"];
        return [header, `custom:${header}`];
      }));
      setMapping(inferred);
      setStatus(`Uploaded ${result.data.totalRows} rows from ${result.data.fileName}`);
    } else setStatus(result.error?.message || "Upload failed");
  }

  async function saveMapping() {
    if (!activeImportId) return setStatus("Upload CSV first.");
    const result = await request<LeadImport>(`/lead-imports/${activeImportId}/map`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ mapping }),
    });
    if (result.data) {
      setLeadImports((prev) => prev.map((item) => item.id === result.data!.id ? result.data! : item));
      setStatus(`Mapping saved. ${result.data.customFieldKeys.length} custom fields and ${result.data.tagNames.length} tags discovered.`);
    } else setStatus(result.error?.message || "Mapping failed");
  }

  async function commitImport() {
    if (!activeImportId) return setStatus("No active import.");
    const result = await request<{ created: number }>(`/lead-imports/${activeImportId}/commit`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    if (result.data) {
      setStatus(`Imported ${result.data.created} leads.`);
      await loadLeads();
      await loadImports();
    } else setStatus(result.error?.message || "Commit failed");
  }

  async function loadLeads() {
    if (!selectedAccountId) return;
    const result = await request<Lead[]>(`/leads?accountId=${encodeURIComponent(selectedAccountId)}`);
    setLeads(result.data || []);
  }

  async function loadImports() {
    if (!selectedAccountId) return;
    const result = await request<LeadImport[]>(`/lead-imports?accountId=${encodeURIComponent(selectedAccountId)}`);
    const next = result.data || [];
    setLeadImports(next);
    if (!activeImportId && next[0]) setActiveImportId(next[0].id);
  }

  async function createCampaign() {
    if (!selectedAccountId) return setStatus("Create an account first.");
    const active = activeImport;
    const tags = Array.from(new Set(leads.flatMap((lead) => lead.tags))).filter(Boolean);
    const customFields = Array.from(new Set(leads.flatMap((lead) => Object.keys(lead.customFields || {})))).filter(Boolean);
    const result = await request<Campaign>("/campaigns", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({
        accountId: selectedAccountId,
        name: campaignName,
        objective: campaignObjective,
        status: "draft",
        settings: { trackOpens, stopOnReply, customFields: active?.customFieldKeys?.length ? active.customFieldKeys : customFields, tags: active?.tagNames?.length ? active.tagNames : tags },
        schedule: { timezone: scheduleTimezone, allowedDays, startHour: Number(startHour), endHour: Number(endHour) },
        steps: [{ stepNumber: 1, type: "email", delay: { kind: "after_enrollment", amount: 0, unit: "days" }, subjectTemplate, bodyTemplate }],
      }),
    });
    if (result.data) {
      setCampaigns((prev) => [result.data!, ...prev]);
      setStatus(`Campaign ready: ${result.data.name}`);
    } else setStatus(result.error?.message || "Campaign creation failed");
  }

  async function loadCampaigns() {
    if (!selectedAccountId) return;
    const result = await request<Campaign[]>(`/campaigns?accountId=${encodeURIComponent(selectedAccountId)}`);
    setCampaigns(result.data || []);
  }

  async function previewSpintax() {
    const sampleLead = leads[0] || { firstName: "Alice", company: "Acme", customFields: { industry: "Fintech" } };
    const values = { firstName: sampleLead.firstName || "there", company: sampleLead.company || "your company", ...(sampleLead.customFields || {}) };
    const result = await request<{ rendered: string }>("/spintax/render", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ template: `${subjectTemplate}\n\n${bodyTemplate}`, values }),
    });
    setSpintaxPreview(result.data?.rendered || result.error?.message || "Preview failed");
  }

  React.useEffect(() => {
    if (!selectedAccountId) return;
    loadLeads();
    loadImports();
    loadCampaigns();
  }, [selectedAccountId]);

  function toggleDay(day: number) {
    setAllowedDays((prev) => prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day].sort());
  }

  return (
    <div className="app-shell">
      <header className="header card">
        <div>
          <div className="eyebrow">Outreach system v3</div>
          <h1>Lemlist-style operator flow, shipped as a usable vertical slice.</h1>
          <p>Upload CSV leads, map columns, create custom fields and tags, preview spintax, and build a campaign with schedule/settings in one screen.</p>
        </div>
        <div className="connection-grid">
          <label><span>API base</span><input value={apiBase} onChange={(e) => setApiBase(e.target.value)} /></label>
          <label><span>API key</span><input value={apiKey} onChange={(e) => setApiKey(e.target.value)} /></label>
          <div className="status-box">{status}</div>
        </div>
      </header>

      <section className="grid two">
        <article className="card">
          <h2>1. Workspace</h2>
          <label><span>Account name</span><input value={accountName} onChange={(e) => setAccountName(e.target.value)} /></label>
          <div className="row"><button onClick={createAccount}>Create account</button></div>
          <label>
            <span>Active account</span>
            <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
              <option value="">Choose account</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
          </label>
          <label><span>Sending inbox</span><input value={inboxEmail} onChange={(e) => setInboxEmail(e.target.value)} /></label>
          <div className="row"><button onClick={createInbox}>Create inbox</button></div>
          {inboxes.length > 0 && <div className="stack">{inboxes.map((item) => <div className="pill" key={item.id}>{item.emailAddress} · {item.authStatus || "pending"}</div>)}</div>}
        </article>

        <article className="card">
          <h2>2. Upload CSV</h2>
          <label><span>File name</span><input value={fileName} onChange={(e) => setFileName(e.target.value)} /></label>
          <label><span>CSV content</span><textarea rows={10} value={csvText} onChange={(e) => setCsvText(e.target.value)} /></label>
          <div className="row"><button onClick={uploadCsv}>Upload import</button></div>
          <div className="stack compact">
            {leadImports.map((item) => (
              <button key={item.id} className={`list-button ${activeImportId === item.id ? "active" : ""}`} onClick={() => { setActiveImportId(item.id); setMapping(item.mapping || {}); }}>
                {item.fileName} · {item.totalRows} rows · {item.status}
              </button>
            ))}
          </div>
        </article>
      </section>

      {activeImport && (
        <section className="grid two">
          <article className="card">
            <h2>3. Field mapping</h2>
            <div className="stack">
              {activeImport.headers.map((header) => (
                <div className="mapping-row" key={header}>
                  <strong>{header}</strong>
                  <select value={mapping[header] || "ignore"} onChange={(e) => setMapping((prev) => ({ ...prev, [header]: e.target.value }))}>
                    {fieldTargets.map((target) => <option key={target} value={target}>{target}</option>)}
                    <option value={`custom:${header}`}>custom:{header}</option>
                    <option value={`tag:${header}`}>tag:{header}</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="row">
              <button onClick={saveMapping}>Save mapping</button>
              <button className="secondary" onClick={commitImport}>Commit import</button>
            </div>
          </article>

          <article className="card">
            <h2>4. Import preview</h2>
            <div className="meta-grid">
              <div><span>Rows</span><strong>{activeImport.totalRows}</strong></div>
              <div><span>Custom fields</span><strong>{activeImport.customFieldKeys.join(", ") || "—"}</strong></div>
              <div><span>Tags</span><strong>{activeImport.tagNames.join(", ") || "—"}</strong></div>
              <div><span>Imported leads</span><strong>{activeImport.createdLeadIds.length}</strong></div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>{activeImport.headers.map((header) => <th key={header}>{header}</th>)}</tr>
                </thead>
                <tbody>
                  {activeImport.sampleRows.map((row, index) => (
                    <tr key={index}>{activeImport.headers.map((header) => <td key={header}>{row[header]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      <section className="grid two">
        <article className="card">
          <h2>5. Leads created</h2>
          <div className="stack compact">
            {leads.length === 0 ? <div className="empty">No imported leads yet.</div> : leads.map((lead) => (
              <div className="lead-card" key={lead.id}>
                <strong>{lead.email}</strong>
                <span>{lead.firstName || "—"} · {lead.company || "—"}</span>
                <span>Tags: {lead.tags.join(", ") || "—"}</span>
                <span>Fields: {Object.keys(lead.customFields || {}).join(", ") || "—"}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>6. Campaign builder</h2>
          <label><span>Name</span><input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} /></label>
          <label><span>Objective</span><input value={campaignObjective} onChange={(e) => setCampaignObjective(e.target.value)} /></label>
          <div className="grid two inner-grid">
            <label><span>Timezone</span><input value={scheduleTimezone} onChange={(e) => setScheduleTimezone(e.target.value)} /></label>
            <div>
              <span className="label">Allowed days</span>
              <div className="row wrap">{dayOptions.map((day) => <button key={day.value} className={allowedDays.includes(day.value) ? "chip active" : "chip"} onClick={() => toggleDay(day.value)}>{day.label}</button>)}</div>
            </div>
            <label><span>Start hour</span><input value={startHour} onChange={(e) => setStartHour(e.target.value)} /></label>
            <label><span>End hour</span><input value={endHour} onChange={(e) => setEndHour(e.target.value)} /></label>
          </div>
          <div className="row wrap checkbox-row">
            <label className="checkbox"><input type="checkbox" checked={trackOpens} onChange={(e) => setTrackOpens(e.target.checked)} /> Track opens</label>
            <label className="checkbox"><input type="checkbox" checked={stopOnReply} onChange={(e) => setStopOnReply(e.target.checked)} /> Stop on reply</label>
          </div>
          <label><span>Subject template</span><input value={subjectTemplate} onChange={(e) => setSubjectTemplate(e.target.value)} /></label>
          <label><span>Body template</span><textarea rows={8} value={bodyTemplate} onChange={(e) => setBodyTemplate(e.target.value)} /></label>
          <div className="row">
            <button onClick={previewSpintax}>Preview spintax</button>
            <button className="secondary" onClick={createCampaign}>Create campaign</button>
            <button className="secondary" onClick={loadCampaigns}>Load campaigns</button>
          </div>
          <div className="preview-box">{spintaxPreview || "Spintax preview will render here."}</div>
        </article>
      </section>

      <section className="card">
        <h2>7. Saved campaigns</h2>
        <div className="stack compact">
          {campaigns.length === 0 ? <div className="empty">No campaigns yet.</div> : campaigns.map((campaign) => (
            <div className="campaign-card" key={campaign.id}>
              <div>
                <strong>{campaign.name}</strong>
                <span>{campaign.objective || "—"}</span>
              </div>
              <div>
                <span>{campaign.schedule.timezone} · {campaign.schedule.startHour}:00-{campaign.schedule.endHour}:00</span>
                <span>{campaign.steps[0]?.subjectTemplate}</span>
              </div>
              <div>
                <span>tags: {String(campaign.settings.tags || []).replace(/,/g, ", ") || "—"}</span>
                <span>custom fields: {String(campaign.settings.customFields || []).replace(/,/g, ", ") || "—"}</span>
              </div>
              <div className="pill">{campaign.status}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

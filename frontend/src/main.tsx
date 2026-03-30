/// <reference types="vite/client" />
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

type ApiResult<T> = { data?: T; error?: { code: string; message: string } };
type NavKey = "overview" | "leads" | "sequences" | "campaigns" | "inboxes";
type Account = { id: string; name: string };
type Inbox = { id: string; accountId?: string; emailAddress: string; authStatus?: string; provider?: string; dailyLimit?: number; hourlyLimit?: number; minDelaySeconds?: number; lastSyncAt?: string; healthStatus?: string };
type Lead = { id: string; email: string; firstName?: string; lastName?: string; company?: string; title?: string; timezone?: string; source?: string; tags: string[]; customFields: Record<string, unknown> };
type LeadImport = { id: string; fileName: string; status: string; headers: string[]; sampleRows: Record<string, string>[]; totalRows: number; mapping: Record<string, string>; customFieldKeys: string[]; tagNames: string[]; createdLeadIds: string[] };
type CampaignStep = { stepNumber: number; type?: "email"; subjectTemplate: string; bodyTemplate: string; delay: { kind?: "after_enrollment" | "after_previous_sent"; amount: number; unit: "minutes" | "hours" | "days" } };
type Campaign = { id: string; name: string; status: "draft" | "active" | "paused" | "archived"; objective?: string; settings: Record<string, unknown>; schedule: { timezone: string; allowedDays: number[]; startHour: number; endHour: number }; steps: CampaignStep[] };
type Sequence = { id: string; name: string; objective: string; steps: CampaignStep[]; createdAt: string };
type AuthState = { workspaceName: string; apiBase: string; apiKey: string; operatorName: string };
type CampaignStats = { campaignId: string; enrolled: number; active: number; completed: number; replied: number; bounced: number; unsubscribed: number; failed: number };

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const STORAGE_KEYS = {
  auth: "outreach-ui-auth",
  accounts: "outreach-ui-accounts",
  inboxes: "outreach-ui-inboxes",
  sequences: "outreach-ui-sequences",
};
const navItems: { key: NavKey; label: string; kicker: string }[] = [
  { key: "overview", label: "Overview", kicker: "Today" },
  { key: "leads", label: "Leads", kicker: "Import + organize" },
  { key: "sequences", label: "Sequences", kicker: "Build messaging" },
  { key: "campaigns", label: "Campaigns", kicker: "Launch + enroll" },
  { key: "inboxes", label: "Inboxes", kicker: "Deliverability" },
];
const fieldTargets = ["ignore", "email", "firstName", "lastName", "company", "title", "timezone", "source"];
const dayOptions = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];
const defaultCsv = "email,first_name,company,title,industry,region,is_founder\nalice@example.com,Alice,Acme,Founder,Fintech,UK,yes\nbob@example.com,Bob,Beacon,Revenue Lead,Health,DE,no\ncarol@example.com,Carol,Cascade,VP Growth,SaaS,US,no";
const defaultSequence = (): Sequence => ({
  id: crypto.randomUUID(),
  name: "Founder warm intro",
  objective: "Book intro calls",
  createdAt: new Date().toISOString(),
  steps: [
    {
      stepNumber: 1,
      type: "email",
      delay: { kind: "after_enrollment", amount: 0, unit: "days" },
      subjectTemplate: "Quick question, {{firstName}}",
      bodyTemplate: "Hi {{firstName}},\n\nSaw {{company}} and wanted to reach out with a quick idea for your {{industry}} motion.\n\nWorth a short chat this week?",
    },
    {
      stepNumber: 2,
      type: "email",
      delay: { kind: "after_previous_sent", amount: 3, unit: "days" },
      subjectTemplate: "Re: quick question",
      bodyTemplate: "Bumping this once, {{firstName}}.\n\nHappy to share a few specific ideas for {{company}} if helpful.",
    },
  ],
});

function useLocalStorageState<T>(key: string, fallback: T) {
  const [state, setState] = React.useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });
  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState] as const;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "OP";
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function App() {
  const [authed, setAuthed] = React.useState(() => Boolean(localStorage.getItem(STORAGE_KEYS.auth)));
  const [auth, setAuth] = useLocalStorageState<AuthState>(STORAGE_KEYS.auth, {
    workspaceName: "Bison Ops",
    apiBase: API_BASE,
    apiKey: API_KEY,
    operatorName: "Gershon",
  });
  const [nav, setNav] = React.useState<NavKey>("overview");
  const [status, setStatus] = React.useState("Ready.");
  const [accounts, setAccounts] = useLocalStorageState<Account[]>(STORAGE_KEYS.accounts, []);
  const [selectedAccountId, setSelectedAccountId] = React.useState("");
  const [inboxes, setInboxes] = useLocalStorageState<Inbox[]>(STORAGE_KEYS.inboxes, []);
  const [sequences, setSequences] = useLocalStorageState<Sequence[]>(STORAGE_KEYS.sequences, [defaultSequence()]);

  const [accountName, setAccountName] = React.useState("Outbound workspace");
  const [csvText, setCsvText] = React.useState(defaultCsv);
  const [fileName, setFileName] = React.useState("prospects-q2.csv");
  const [leadImports, setLeadImports] = React.useState<LeadImport[]>([]);
  const [activeImportId, setActiveImportId] = React.useState("");
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [leads, setLeads] = React.useState<Lead[]>([]);

  const [sequenceDraft, setSequenceDraft] = React.useState<Sequence>(defaultSequence());
  const [selectedSequenceId, setSelectedSequenceId] = React.useState("");
  const [spintaxPreview, setSpintaxPreview] = React.useState("");

  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = React.useState<Record<string, CampaignStats>>({});
  const [campaignName, setCampaignName] = React.useState("Founder campaign");
  const [campaignObjective, setCampaignObjective] = React.useState("Book intro calls");
  const [launchInboxId, setLaunchInboxId] = React.useState("");
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<string[]>([]);
  const [scheduleTimezone, setScheduleTimezone] = React.useState("Europe/Berlin");
  const [allowedDays, setAllowedDays] = React.useState<number[]>([1, 2, 3, 4, 5]);
  const [startHour, setStartHour] = React.useState("9");
  const [endHour, setEndHour] = React.useState("17");
  const [trackOpens, setTrackOpens] = React.useState(false);
  const [stopOnReply, setStopOnReply] = React.useState(true);

  const [inboxEmail, setInboxEmail] = React.useState("operator@example.com");
  const [testRecipient, setTestRecipient] = React.useState("deliverability-check@example.com");
  const [testSubject, setTestSubject] = React.useState("Testing deliverability");
  const [testBody, setTestBody] = React.useState("This is a test email from Bison Ops.");

  const activeImport = React.useMemo(() => leadImports.find((item) => item.id === activeImportId) || null, [leadImports, activeImportId]);
  const selectedAccount = React.useMemo(() => accounts.find((account) => account.id === selectedAccountId) || null, [accounts, selectedAccountId]);
  const selectedSequence = React.useMemo(() => sequences.find((item) => item.id === selectedSequenceId) || null, [sequences, selectedSequenceId]);
  const accountInboxes = React.useMemo(() => inboxes.filter((item) => !item.accountId || item.accountId === selectedAccountId), [inboxes, selectedAccountId]);
  const allTags = React.useMemo(() => Array.from(new Set(leads.flatMap((lead) => lead.tags))).filter(Boolean), [leads]);
  const allCustomFields = React.useMemo(() => Array.from(new Set(leads.flatMap((lead) => Object.keys(lead.customFields || {})))).filter(Boolean), [leads]);

  React.useEffect(() => {
    if (!selectedAccountId && accounts[0]) setSelectedAccountId(accounts[0].id);
  }, [accounts, selectedAccountId]);

  React.useEffect(() => {
    if (!selectedSequenceId && sequences[0]) setSelectedSequenceId(sequences[0].id);
  }, [sequences, selectedSequenceId]);

  React.useEffect(() => {
    if (!launchInboxId && accountInboxes[0]) setLaunchInboxId(accountInboxes[0].id);
  }, [accountInboxes, launchInboxId]);

  const headers = React.useMemo(() => {
    const base: Record<string, string> = { "Content-Type": "application/json" };
    if (auth.apiKey.trim()) base.Authorization = `Bearer ${auth.apiKey.trim()}`;
    return base;
  }, [auth.apiKey]);

  async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
    try {
      const response = await fetch(`${auth.apiBase}${path}`, { ...init, headers: { ...headers, ...(init?.headers || {}) } });
      return await response.json();
    } catch (error) {
      return { error: { code: "NETWORK_ERROR", message: error instanceof Error ? error.message : "Network request failed" } };
    }
  }

  async function createAccount() {
    setStatus("Creating workspace account...");
    const result = await request<Account>("/accounts", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ name: accountName, settings: {} }),
    });
    if (result.data) {
      setAccounts((prev) => [result.data!, ...prev.filter((item) => item.id !== result.data!.id)]);
      setSelectedAccountId(result.data.id);
      setStatus(`Workspace ready: ${result.data.name}`);
    } else setStatus(result.error?.message || "Failed to create workspace account.");
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
    if (next[0] && !activeImportId) {
      setActiveImportId(next[0].id);
      setMapping(next[0].mapping || {});
    }
  }

  async function loadCampaigns() {
    if (!selectedAccountId) return;
    const result = await request<Campaign[]>(`/campaigns?accountId=${encodeURIComponent(selectedAccountId)}`);
    const next = result.data || [];
    setCampaigns(next);
    for (const campaign of next) {
      const stats = await request<CampaignStats>(`/campaigns/${campaign.id}/stats`);
      if (stats.data) setCampaignStats((prev) => ({ ...prev, [campaign.id]: stats.data! }));
    }
  }

  React.useEffect(() => {
    if (!selectedAccountId) return;
    loadLeads();
    loadImports();
    loadCampaigns();
  }, [selectedAccountId]);

  async function uploadCsv() {
    if (!selectedAccountId) return setStatus("Create or select an account first.");
    setStatus("Uploading lead file...");
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
        if (normalized.includes("tag") || normalized.includes("founder")) return [header, `tag:${header}`];
        return [header, `custom:${header}`];
      }));
      setMapping(inferred);
      setStatus(`Imported file scaffolded: ${result.data.totalRows} rows ready for mapping.`);
    } else setStatus(result.error?.message || "Upload failed.");
  }

  async function saveMapping() {
    if (!activeImportId) return setStatus("Upload a CSV first.");
    const result = await request<LeadImport>(`/lead-imports/${activeImportId}/map`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ mapping }),
    });
    if (result.data) {
      setLeadImports((prev) => prev.map((item) => item.id === result.data!.id ? result.data! : item));
      setStatus(`Mapping saved with ${result.data.customFieldKeys.length} custom fields and ${result.data.tagNames.length} tags.`);
    } else setStatus(result.error?.message || "Failed to save mapping.");
  }

  async function commitImport() {
    if (!activeImportId) return setStatus("Nothing to commit yet.");
    const result = await request<{ created: number }>(`/lead-imports/${activeImportId}/commit`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    if (result.data) {
      setStatus(`Leads imported: ${result.data.created}`);
      await loadLeads();
      await loadImports();
      setNav("leads");
    } else setStatus(result.error?.message || "Commit failed.");
  }

  function resetSequenceDraft() {
    setSequenceDraft({
      id: crypto.randomUUID(),
      name: "New sequence",
      objective: "Start conversations",
      createdAt: new Date().toISOString(),
      steps: [{ stepNumber: 1, type: "email", delay: { kind: "after_enrollment", amount: 0, unit: "days" }, subjectTemplate: "Quick idea for {{company}}", bodyTemplate: "Hi {{firstName}},\n\nWanted to share a quick idea for {{company}}.\n\nWorth a look?" }],
    });
    setSpintaxPreview("");
  }

  function saveSequence() {
    const normalized: Sequence = {
      ...sequenceDraft,
      steps: sequenceDraft.steps.map((step, index) => ({ ...step, stepNumber: index + 1, type: "email" as const })),
    };
    setSequences((prev) => {
      const exists = prev.some((item) => item.id === normalized.id);
      return exists ? prev.map((item) => item.id === normalized.id ? normalized : item) : [normalized, ...prev];
    });
    setSelectedSequenceId(normalized.id);
    setStatus(`Sequence saved: ${normalized.name}`);
  }

  function loadSequenceIntoBuilder(sequenceId: string) {
    const sequence = sequences.find((item) => item.id === sequenceId);
    if (!sequence) return;
    setSelectedSequenceId(sequence.id);
    setSequenceDraft(JSON.parse(JSON.stringify(sequence)));
    setStatus(`Loaded sequence: ${sequence.name}`);
    setNav("sequences");
  }

  function addStep() {
    setSequenceDraft((prev) => ({
      ...prev,
      steps: [...prev.steps, { stepNumber: prev.steps.length + 1, type: "email", delay: { kind: "after_previous_sent", amount: 3, unit: "days" }, subjectTemplate: "Following up", bodyTemplate: "Hi {{firstName}},\n\nWanted to follow up in case this was relevant for {{company}}." }],
    }));
  }

  function updateStep(index: number, patch: Partial<CampaignStep>) {
    setSequenceDraft((prev) => ({ ...prev, steps: prev.steps.map((step, current) => current === index ? { ...step, ...patch } : step) }));
  }

  function removeStep(index: number) {
    setSequenceDraft((prev) => ({ ...prev, steps: prev.steps.filter((_, current) => current !== index).map((step, current) => ({ ...step, stepNumber: current + 1 })) }));
  }

  async function previewStep(stepIndex: number) {
    const step = sequenceDraft.steps[stepIndex];
    const sampleLead = leads[0] || { firstName: "Alice", company: "Acme", customFields: { industry: "Fintech" } };
    const values = { firstName: sampleLead.firstName || "there", company: sampleLead.company || "your company", ...(sampleLead.customFields || {}) };
    const result = await request<{ rendered: string }>("/spintax/render", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ template: `${step.subjectTemplate}\n\n${step.bodyTemplate}`, values }),
    });
    setSpintaxPreview(result.data?.rendered || result.error?.message || "Preview unavailable.");
  }

  async function createInbox() {
    if (!selectedAccountId) return setStatus("Create or select an account first.");
    const result = await request<Inbox>("/inboxes", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ accountId: selectedAccountId, emailAddress: inboxEmail, provider: "gmail", dailyLimit: 40, hourlyLimit: 8, minDelaySeconds: 90, sendingWindow: {} }),
    });
    if (result.data) {
      const next = { ...result.data, accountId: selectedAccountId };
      setInboxes((prev) => [next, ...prev.filter((item) => item.id !== next.id)]);
      setLaunchInboxId(next.id);
      setStatus(`Inbox created: ${next.emailAddress}`);
    } else setStatus(result.error?.message || "Failed to create inbox.");
  }

  async function connectInbox(inboxId: string) {
    setStatus("Verifying inbox connection...");
    const result = await request<{ inboxId: string; authStatus: string; provider: string; verifiedAt: string }>(`/inboxes/${inboxId}/connect`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    if (result.data) {
      setInboxes((prev) => prev.map((item) => item.id === inboxId ? { ...item, authStatus: result.data!.authStatus, provider: result.data!.provider, lastSyncAt: result.data!.verifiedAt, healthStatus: "healthy" } : item));
      setStatus(`Inbox connected: ${result.data.provider}`);
    } else setStatus(result.error?.message || "Inbox verification failed.");
  }

  async function checkInboxHealth(inboxId: string) {
    setStatus("Fetching inbox health...");
    const result = await request<Inbox & { remainingToday: number }>(`/inboxes/${inboxId}/health`);
    if (result.data) {
      setInboxes((prev) => prev.map((item) => item.id === inboxId ? { ...item, ...result.data } : item));
      setStatus(`Inbox health refreshed. Remaining today: ${result.data.remainingToday}`);
    } else setStatus(result.error?.message || "Health check failed.");
  }

  async function sendTest(inboxId: string) {
    setStatus("Sending test email...");
    const result = await request<{ providerMessageId?: string; accepted?: boolean }>(`/inboxes/${inboxId}/send-test`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ to: testRecipient, subject: testSubject, text: testBody }),
    });
    if (result.data) setStatus(`Test sent${result.data.providerMessageId ? ` · ${result.data.providerMessageId}` : ""}`);
    else setStatus(result.error?.message || "Test send failed.");
  }

  async function createCampaign() {
    if (!selectedAccountId) return setStatus("Create or select an account first.");
    const sequence = selectedSequence || sequenceDraft;
    const result = await request<Campaign>("/campaigns", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({
        accountId: selectedAccountId,
        name: campaignName,
        objective: campaignObjective,
        status: "draft",
        settings: { trackOpens, stopOnReply, tags: allTags, customFields: allCustomFields, sourceSequenceId: sequence.id, sourceSequenceName: sequence.name },
        schedule: { timezone: scheduleTimezone, allowedDays, startHour: Number(startHour), endHour: Number(endHour) },
        steps: sequence.steps.map((step, index) => ({ ...step, stepNumber: index + 1, type: "email", delay: { kind: step.delay.kind || (index === 0 ? "after_enrollment" : "after_previous_sent"), amount: step.delay.amount, unit: step.delay.unit } })),
      }),
    });
    if (result.data) {
      setCampaigns((prev) => [result.data!, ...prev]);
      setStatus(`Campaign created: ${result.data.name}`);
    } else setStatus(result.error?.message || "Campaign creation failed.");
  }

  async function launchCampaign(campaignId: string) {
    if (!launchInboxId) return setStatus("Select an inbox before launch.");
    if (!selectedLeadIds.length) return setStatus("Select at least one lead for enrollment.");
    setStatus("Enrolling leads into campaign...");
    const enrollment = await request<{ created: number }>(`/campaigns/${campaignId}/enrollments`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ leadIds: selectedLeadIds, inboxId: launchInboxId }),
    });
    if (!enrollment.data) return setStatus(enrollment.error?.message || "Failed to enroll leads.");
    const started = await request<Campaign>(`/campaigns/${campaignId}/start`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    if (started.data) {
      setCampaigns((prev) => prev.map((item) => item.id === campaignId ? started.data! : item));
      setStatus(`Campaign launched with ${enrollment.data.created} enrollments.`);
      await loadCampaigns();
    } else setStatus(started.error?.message || "Campaign started but status refresh failed.");
  }

  function toggleLeadSelection(leadId: string) {
    setSelectedLeadIds((prev) => prev.includes(leadId) ? prev.filter((item) => item !== leadId) : [...prev, leadId]);
  }

  function toggleAllLeads() {
    setSelectedLeadIds((prev) => prev.length === leads.length ? [] : leads.map((lead) => lead.id));
  }

  function toggleDay(day: number) {
    setAllowedDays((prev) => prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day].sort());
  }

  function signIn() {
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(auth));
    setAuthed(true);
    setStatus("Signed in.");
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEYS.auth);
    setAuthed(false);
  }

  if (!authed) {
    return (
      <div className="auth-shell">
        <div className="auth-hero">
          <div className="auth-copy">
            <div className="eyebrow">Bison-style outbound ops</div>
            <h1>Run outreach like a product, not a script.</h1>
            <p>Import leads, build multi-step sequences, connect inboxes, and launch campaigns from one clean operator workspace.</p>
            <div className="hero-points">
              <div><strong>Outcome-first</strong><span>Leads → sequence → inbox → launch.</span></div>
              <div><strong>Fast setup</strong><span>Use your existing backend and API key.</span></div>
              <div><strong>Operator-ready</strong><span>Feels like software your team could actually use.</span></div>
            </div>
          </div>
          <div className="auth-card">
            <div className="card-title"><h2>Sign in to workspace</h2><p>Use your API base and key to connect the operator UI.</p></div>
            <label><span>Workspace name</span><input value={auth.workspaceName} onChange={(e) => setAuth({ ...auth, workspaceName: e.target.value })} /></label>
            <label><span>Operator name</span><input value={auth.operatorName} onChange={(e) => setAuth({ ...auth, operatorName: e.target.value })} /></label>
            <label><span>API base URL</span><input value={auth.apiBase} onChange={(e) => setAuth({ ...auth, apiBase: e.target.value })} /></label>
            <label><span>API key</span><input type="password" value={auth.apiKey} onChange={(e) => setAuth({ ...auth, apiKey: e.target.value })} placeholder="Optional bearer token" /></label>
            <button className="primary-xl" onClick={signIn}>Enter workspace</button>
          </div>
        </div>
      </div>
    );
  }

  const activePageLabel = navItems.find((item) => item.key === nav)?.label || "Overview";

  return (
    <div className="product-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">B</div>
          <div>
            <strong>{auth.workspaceName}</strong>
            <span>Outbound control room</span>
          </div>
        </div>
        <nav className="nav-stack">
          {navItems.map((item) => (
            <button key={item.key} className={nav === item.key ? "nav-item active" : "nav-item"} onClick={() => setNav(item.key)}>
              <span>{item.label}</span>
              <small>{item.kicker}</small>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>Working account</strong>
          <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
            <option value="">Select account</option>
            {accounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}
          </select>
          <small>{selectedAccount ? `Using ${selectedAccount.name}` : "Create an account to start importing and launching."}</small>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <div className="eyebrow">{activePageLabel}</div>
            <h1>{nav === "overview" ? "Outbound overview" : nav === "leads" ? "Lead pipeline" : nav === "sequences" ? "Sequence builder" : nav === "campaigns" ? "Campaign launchpad" : "Inbox operations"}</h1>
          </div>
          <div className="topbar-actions">
            <div className="operator-pill">
              <div className="avatar">{initials(auth.operatorName)}</div>
              <div>
                <strong>{auth.operatorName}</strong>
                <span>{auth.apiBase}</span>
              </div>
            </div>
            <button className="ghost-button" onClick={signOut}>Sign out</button>
          </div>
        </header>

        <div className="status-banner">{status}</div>

        {nav === "overview" && (
          <section className="page-grid">
            <div className="hero-panel">
              <div>
                <div className="eyebrow">Pipeline snapshot</div>
                <h2>Build the motion once. Launch with confidence.</h2>
                <p>This version keeps the current backend contracts, then layers a cleaner product workflow on top: import leads, define messaging, connect inboxes, and launch campaigns.</p>
              </div>
              <div className="hero-actions">
                <button onClick={() => setNav("leads")}>Import leads</button>
                <button className="secondary" onClick={() => setNav("campaigns")}>Launch campaign</button>
              </div>
            </div>
            <div className="stats-grid">
              <StatCard label="Accounts" value={accounts.length} hint="Created from this UI" />
              <StatCard label="Leads" value={leads.length} hint="Loaded from backend" />
              <StatCard label="Sequences" value={sequences.length} hint="Saved locally for launch" />
              <StatCard label="Inboxes" value={accountInboxes.length} hint="Cached locally after creation" />
            </div>
            <div className="panel wide-panel">
              <div className="section-header"><h3>Recommended next steps</h3><span>Outcome-first path</span></div>
              <div className="workflow-row">
                <div className="workflow-step active"><strong>1</strong><span>Create/select account</span></div>
                <div className={leads.length ? "workflow-step active" : "workflow-step"}><strong>2</strong><span>Import leads</span></div>
                <div className={sequences.length ? "workflow-step active" : "workflow-step"}><strong>3</strong><span>Build sequence</span></div>
                <div className={accountInboxes.length ? "workflow-step active" : "workflow-step"}><strong>4</strong><span>Connect inbox</span></div>
                <div className={campaigns.length ? "workflow-step active" : "workflow-step"}><strong>5</strong><span>Launch campaign</span></div>
              </div>
            </div>
            <div className="panel">
              <div className="section-header"><h3>Create account</h3><span>Required once per workspace</span></div>
              <label><span>Account name</span><input value={accountName} onChange={(e) => setAccountName(e.target.value)} /></label>
              <div className="panel-actions"><button onClick={createAccount}>Create account</button></div>
            </div>
            <div className="panel">
              <div className="section-header"><h3>Launch readiness</h3><span>Live inputs</span></div>
              <ul className="checklist">
                <li className={selectedAccountId ? "good" : "pending"}>Account selected</li>
                <li className={leads.length ? "good" : "pending"}>Leads available</li>
                <li className={sequences.length ? "good" : "pending"}>Sequence saved</li>
                <li className={accountInboxes.length ? "good" : "pending"}>Inbox created</li>
              </ul>
            </div>
          </section>
        )}

        {nav === "leads" && (
          <section className="page-grid leads-grid">
            <div className="panel upload-panel">
              <div className="section-header"><h3>CSV import</h3><span>Upload and map in one flow</span></div>
              <label><span>File name</span><input value={fileName} onChange={(e) => setFileName(e.target.value)} /></label>
              <label><span>CSV content</span><textarea rows={10} value={csvText} onChange={(e) => setCsvText(e.target.value)} /></label>
              <div className="panel-actions"><button onClick={uploadCsv}>Upload CSV</button></div>
            </div>
            <div className="panel import-list-panel">
              <div className="section-header"><h3>Import runs</h3><span>Recent uploads</span></div>
              <div className="stack compact">
                {leadImports.length === 0 ? <div className="empty-state">No imports yet.</div> : leadImports.map((item) => (
                  <button key={item.id} className={activeImportId === item.id ? "import-card active" : "import-card"} onClick={() => { setActiveImportId(item.id); setMapping(item.mapping || {}); }}>
                    <strong>{item.fileName}</strong>
                    <span>{item.totalRows} rows · {item.status}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeImport && (
              <>
                <div className="panel wide-panel">
                  <div className="section-header"><h3>Field mapping</h3><span>Standard fields, tags, and custom fields</span></div>
                  <div className="mapping-list">
                    {activeImport.headers.map((header) => (
                      <div className="mapping-row" key={header}>
                        <div>
                          <strong>{header}</strong>
                          <small>{mapping[header]?.startsWith("custom:") ? "Stored as custom field" : mapping[header]?.startsWith("tag:") ? "Stored as tag" : "Standard field"}</small>
                        </div>
                        <select value={mapping[header] || "ignore"} onChange={(e) => setMapping((prev) => ({ ...prev, [header]: e.target.value }))}>
                          {fieldTargets.map((target) => <option key={target} value={target}>{target}</option>)}
                          <option value={`custom:${header}`}>custom:{header}</option>
                          <option value={`tag:${header}`}>tag:{header}</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="panel-actions">
                    <button onClick={saveMapping}>Save mapping</button>
                    <button className="secondary" onClick={commitImport}>Commit import</button>
                  </div>
                </div>
                <div className="panel">
                  <div className="section-header"><h3>Import preview</h3><span>{activeImport.totalRows} total rows</span></div>
                  <div className="summary-list">
                    <div><span>Custom fields</span><strong>{activeImport.customFieldKeys.join(", ") || "—"}</strong></div>
                    <div><span>Tags</span><strong>{activeImport.tagNames.join(", ") || "—"}</strong></div>
                    <div><span>Created leads</span><strong>{activeImport.createdLeadIds.length}</strong></div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr>{activeImport.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                      <tbody>
                        {activeImport.sampleRows.map((row, index) => <tr key={index}>{activeImport.headers.map((header) => <td key={header}>{row[header]}</td>)}</tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            <div className="panel wide-panel">
              <div className="section-header"><h3>Lead library</h3><span>{leads.length} leads synced from backend</span></div>
              {leads.length === 0 ? <div className="empty-state">No leads yet. Commit an import to populate the library.</div> : (
                <div className="lead-grid">
                  {leads.map((lead) => (
                    <div className="lead-item" key={lead.id}>
                      <div className="lead-topline">
                        <strong>{lead.firstName || lead.email}</strong>
                        <span>{lead.company || lead.email}</span>
                      </div>
                      <div className="lead-meta">{lead.email} {lead.title ? `· ${lead.title}` : ""}</div>
                      <div className="token-row">{lead.tags.length ? lead.tags.map((tag) => <span key={tag} className="token">#{tag}</span>) : <span className="muted">No tags</span>}</div>
                      <div className="field-stack">{Object.entries(lead.customFields || {}).slice(0, 4).map(([key, value]) => <span key={key}><strong>{key}</strong> {String(value)}</span>)}{!Object.keys(lead.customFields || {}).length && <span className="muted">No custom fields</span>}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {nav === "sequences" && (
          <section className="page-grid sequence-grid">
            <div className="panel sequence-library">
              <div className="section-header"><h3>Saved sequences</h3><span>Frontend-managed for now</span></div>
              <div className="panel-actions"><button className="secondary" onClick={resetSequenceDraft}>New sequence</button></div>
              <div className="stack compact">
                {sequences.map((sequence) => (
                  <button key={sequence.id} className={selectedSequenceId === sequence.id ? "import-card active" : "import-card"} onClick={() => loadSequenceIntoBuilder(sequence.id)}>
                    <strong>{sequence.name}</strong>
                    <span>{sequence.steps.length} steps · {sequence.objective}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="panel wide-panel">
              <div className="section-header"><h3>Sequence builder</h3><span>Multi-step email flow</span></div>
              <div className="sequence-meta-grid">
                <label><span>Name</span><input value={sequenceDraft.name} onChange={(e) => setSequenceDraft({ ...sequenceDraft, name: e.target.value })} /></label>
                <label><span>Objective</span><input value={sequenceDraft.objective} onChange={(e) => setSequenceDraft({ ...sequenceDraft, objective: e.target.value })} /></label>
              </div>
              <div className="sequence-steps">
                {sequenceDraft.steps.map((step, index) => (
                  <div className="step-card" key={index}>
                    <div className="step-header">
                      <div>
                        <div className="eyebrow">Step {index + 1}</div>
                        <h4>Email touchpoint</h4>
                      </div>
                      <button className="ghost-button" onClick={() => removeStep(index)} disabled={sequenceDraft.steps.length === 1}>Remove</button>
                    </div>
                    <div className="step-config-grid">
                      <label><span>Delay amount</span><input value={step.delay.amount} onChange={(e) => updateStep(index, { delay: { ...step.delay, amount: Number(e.target.value) } })} /></label>
                      <label><span>Unit</span><select value={step.delay.unit} onChange={(e) => updateStep(index, { delay: { ...step.delay, unit: e.target.value as CampaignStep["delay"]["unit"] } })}><option value="minutes">minutes</option><option value="hours">hours</option><option value="days">days</option></select></label>
                      <label><span>Delay anchor</span><select value={step.delay.kind || (index === 0 ? "after_enrollment" : "after_previous_sent")} onChange={(e) => updateStep(index, { delay: { ...step.delay, kind: e.target.value as CampaignStep["delay"]["kind"] } })}><option value="after_enrollment">after enrollment</option><option value="after_previous_sent">after previous sent</option></select></label>
                    </div>
                    <label><span>Subject</span><input value={step.subjectTemplate} onChange={(e) => updateStep(index, { subjectTemplate: e.target.value })} /></label>
                    <label><span>Body</span><textarea rows={7} value={step.bodyTemplate} onChange={(e) => updateStep(index, { bodyTemplate: e.target.value })} /></label>
                    <div className="panel-actions"><button className="secondary" onClick={() => previewStep(index)}>Preview</button></div>
                  </div>
                ))}
              </div>
              <div className="panel-actions">
                <button className="secondary" onClick={addStep}>Add step</button>
                <button onClick={saveSequence}>Save sequence</button>
              </div>
              <div className="preview-surface">{spintaxPreview || "Preview a step to see subject + body rendering with a sample lead."}</div>
            </div>
          </section>
        )}

        {nav === "campaigns" && (
          <section className="page-grid campaign-grid">
            <div className="panel launch-config-panel">
              <div className="section-header"><h3>Create campaign</h3><span>Uses saved sequence + existing backend campaign API</span></div>
              <label><span>Campaign name</span><input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} /></label>
              <label><span>Objective</span><input value={campaignObjective} onChange={(e) => setCampaignObjective(e.target.value)} /></label>
              <label><span>Sequence</span><select value={selectedSequenceId} onChange={(e) => setSelectedSequenceId(e.target.value)}>{sequences.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <div className="sequence-summary-box">{selectedSequence ? `${selectedSequence.steps.length} steps · ${selectedSequence.objective}` : "No sequence selected."}</div>
              <div className="schedule-grid">
                <label><span>Timezone</span><input value={scheduleTimezone} onChange={(e) => setScheduleTimezone(e.target.value)} /></label>
                <label><span>Start hour</span><input value={startHour} onChange={(e) => setStartHour(e.target.value)} /></label>
                <label><span>End hour</span><input value={endHour} onChange={(e) => setEndHour(e.target.value)} /></label>
              </div>
              <div>
                <span className="label">Allowed days</span>
                <div className="chip-row">{dayOptions.map((day) => <button key={day.value} className={allowedDays.includes(day.value) ? "chip active" : "chip"} onClick={() => toggleDay(day.value)}>{day.label}</button>)}</div>
              </div>
              <div className="toggle-row">
                <label className="checkbox"><input type="checkbox" checked={trackOpens} onChange={(e) => setTrackOpens(e.target.checked)} /> Track opens</label>
                <label className="checkbox"><input type="checkbox" checked={stopOnReply} onChange={(e) => setStopOnReply(e.target.checked)} /> Stop on reply</label>
              </div>
              <div className="panel-actions"><button onClick={createCampaign}>Create campaign</button><button className="secondary" onClick={loadCampaigns}>Refresh</button></div>
            </div>
            <div className="panel audience-panel">
              <div className="section-header"><h3>Launch audience</h3><span>Select leads + inbox before starting</span></div>
              <label><span>Send from inbox</span><select value={launchInboxId} onChange={(e) => setLaunchInboxId(e.target.value)}><option value="">Select inbox</option>{accountInboxes.map((item) => <option key={item.id} value={item.id}>{item.emailAddress}</option>)}</select></label>
              <div className="panel-actions"><button className="secondary" onClick={toggleAllLeads}>{selectedLeadIds.length === leads.length && leads.length ? "Clear selection" : "Select all leads"}</button></div>
              <div className="lead-picker-list">
                {leads.map((lead) => (
                  <label key={lead.id} className={selectedLeadIds.includes(lead.id) ? "lead-picker active" : "lead-picker"}>
                    <input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => toggleLeadSelection(lead.id)} />
                    <div>
                      <strong>{lead.firstName || lead.email}</strong>
                      <span>{lead.company || lead.email}</span>
                    </div>
                  </label>
                ))}
                {!leads.length && <div className="empty-state">Import leads first.</div>}
              </div>
            </div>
            <div className="panel wide-panel">
              <div className="section-header"><h3>Campaigns</h3><span>Drafts and launched motions</span></div>
              <div className="campaign-list">
                {campaigns.length === 0 ? <div className="empty-state">No campaigns yet.</div> : campaigns.map((campaign) => {
                  const stats = campaignStats[campaign.id];
                  return (
                    <div className="campaign-row" key={campaign.id}>
                      <div>
                        <strong>{campaign.name}</strong>
                        <span>{campaign.objective || "—"}</span>
                      </div>
                      <div>
                        <span>{campaign.steps.length} steps</span>
                        <span>{campaign.schedule.timezone} · {campaign.schedule.startHour}:00-{campaign.schedule.endHour}:00</span>
                      </div>
                      <div>
                        <span>Status</span>
                        <strong className={`status-pill ${campaign.status}`}>{campaign.status}</strong>
                      </div>
                      <div>
                        <span>Enrolled</span>
                        <strong>{stats?.enrolled ?? 0}</strong>
                      </div>
                      <div className="campaign-actions">
                        <button onClick={() => launchCampaign(campaign.id)}>Launch</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {nav === "inboxes" && (
          <section className="page-grid inbox-grid">
            <div className="panel">
              <div className="section-header"><h3>Add sending inbox</h3><span>Create an inbox using existing backend API</span></div>
              <label><span>Email address</span><input value={inboxEmail} onChange={(e) => setInboxEmail(e.target.value)} /></label>
              <div className="panel-actions"><button onClick={createInbox}>Create inbox</button></div>
            </div>
            <div className="panel wide-panel">
              <div className="section-header"><h3>Inboxes</h3><span>Locally cached after creation; backend has create/connect/health/test but no list endpoint yet</span></div>
              <div className="inbox-list">
                {accountInboxes.length === 0 ? <div className="empty-state">No inboxes for this account yet.</div> : accountInboxes.map((inbox) => (
                  <div className="inbox-card" key={inbox.id}>
                    <div>
                      <strong>{inbox.emailAddress}</strong>
                      <span>{inbox.provider || "gmail"}</span>
                    </div>
                    <div>
                      <span>Auth</span>
                      <strong>{inbox.authStatus || "pending"}</strong>
                    </div>
                    <div>
                      <span>Health</span>
                      <strong>{inbox.healthStatus || "unknown"}</strong>
                    </div>
                    <div className="campaign-actions">
                      <button className="secondary" onClick={() => connectInbox(inbox.id)}>Connect</button>
                      <button className="secondary" onClick={() => checkInboxHealth(inbox.id)}>Health</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel wide-panel">
              <div className="section-header"><h3>Test send</h3><span>Send a deliverability check from a selected inbox</span></div>
              <div className="schedule-grid">
                <label><span>Inbox</span><select value={launchInboxId} onChange={(e) => setLaunchInboxId(e.target.value)}><option value="">Select inbox</option>{accountInboxes.map((item) => <option value={item.id} key={item.id}>{item.emailAddress}</option>)}</select></label>
                <label><span>Recipient</span><input value={testRecipient} onChange={(e) => setTestRecipient(e.target.value)} /></label>
              </div>
              <label><span>Subject</span><input value={testSubject} onChange={(e) => setTestSubject(e.target.value)} /></label>
              <label><span>Message</span><textarea rows={6} value={testBody} onChange={(e) => setTestBody(e.target.value)} /></label>
              <div className="panel-actions"><button onClick={() => launchInboxId && sendTest(launchInboxId)} disabled={!launchInboxId}>Send test</button></div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

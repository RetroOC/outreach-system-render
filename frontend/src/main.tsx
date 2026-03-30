/// <reference types="vite/client" />
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

type ApiResult<T> = { data?: T; error?: { code: string; message: string } };
type NavKey = "overview" | "leads" | "campaigns" | "inbox" | "senders" | "warmup";
type Account = { id: string; name: string };
type Inbox = { id: string; accountId?: string; emailAddress: string; authStatus?: string; provider?: string; dailyLimit?: number; hourlyLimit?: number; minDelaySeconds?: number; lastSyncAt?: string; healthStatus?: string };
type Lead = { id: string; email: string; firstName?: string; lastName?: string; company?: string; title?: string; timezone?: string; source?: string; tags: string[]; customFields: Record<string, unknown> };
type LeadImport = { id: string; fileName: string; status: string; headers: string[]; sampleRows: Record<string, string>[]; totalRows: number; mapping: Record<string, string>; customFieldKeys: string[]; tagNames: string[]; createdLeadIds: string[] };
type CampaignStep = { stepNumber: number; type?: "email"; subjectTemplate: string; bodyTemplate: string; delay: { kind?: "after_enrollment" | "after_previous_sent"; amount: number; unit: "minutes" | "hours" | "days" } };
type Campaign = { id: string; name: string; status: "draft" | "active" | "paused" | "archived"; objective?: string; settings: Record<string, unknown>; schedule: { timezone: string; allowedDays: number[]; startHour: number; endHour: number }; steps: CampaignStep[] };
type Sequence = { id: string; name: string; objective: string; steps: CampaignStep[]; createdAt: string };
type AuthState = { workspaceName: string; apiBase: string; apiKey: string; operatorName: string };
type CampaignStats = { campaignId: string; enrolled: number; active: number; completed: number; replied: number; bounced: number; unsubscribed: number; failed: number };
type CampaignFlowTab = "leads" | "sequence" | "schedule" | "settings" | "senders" | "launch";
type SenderProfile = { id: string; name: string; email: string; reputation: number; provider: string; dailyLimit: number; status: "ready" | "warming" | "needs_attention"; accountId?: string };
type WarmupRow = { id: string; senderId: string; mailbox: string; progress: number; replies: number; opened: number; sentToday: number; phase: string };
type InboxThread = { id: string; name: string; company: string; subject: string; preview: string; state: "new" | "waiting" | "positive" | "closed"; channel: string; unread: boolean; at: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const STORAGE_KEYS = {
  auth: "outreach-ui-auth",
  accounts: "outreach-ui-accounts",
  inboxes: "outreach-ui-inboxes",
  sequences: "outreach-ui-sequences",
  senders: "outreach-ui-senders",
  warmup: "outreach-ui-warmup",
};
const navItems: { key: NavKey; label: string; kicker: string; icon: string }[] = [
  { key: "overview", label: "Dashboard", kicker: "Revenue pulse", icon: "◫" },
  { key: "leads", label: "Leads", kicker: "Prospects", icon: "◎" },
  { key: "campaigns", label: "Campaigns", kicker: "Sequences + launch", icon: "↗" },
  { key: "inbox", label: "Master Inbox", kicker: "Conversations", icon: "✉" },
  { key: "senders", label: "Sender Emails", kicker: "Mailboxes", icon: "◌" },
  { key: "warmup", label: "Warmup", kicker: "Deliverability", icon: "△" },
];
const flowTabs: { key: CampaignFlowTab; label: string }[] = [
  { key: "leads", label: "Leads" },
  { key: "sequence", label: "Sequence" },
  { key: "schedule", label: "Schedule" },
  { key: "settings", label: "Settings" },
  { key: "senders", label: "Sender Emails" },
  { key: "launch", label: "Launch" },
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
const defaultSenders = (): SenderProfile[] => [
  { id: crypto.randomUUID(), name: "Gershon", email: "gershon@bisonops.co", reputation: 91, provider: "Google Workspace", dailyLimit: 45, status: "ready" },
  { id: crypto.randomUUID(), name: "Revenue Team", email: "team@bisonops.co", reputation: 77, provider: "Google Workspace", dailyLimit: 30, status: "warming" },
  { id: crypto.randomUUID(), name: "Founder", email: "founder@bisonops.co", reputation: 59, provider: "Microsoft 365", dailyLimit: 20, status: "needs_attention" },
];
const defaultWarmup = (senders: SenderProfile[]): WarmupRow[] => senders.map((sender, index) => ({
  id: crypto.randomUUID(),
  senderId: sender.id,
  mailbox: sender.email,
  progress: [82, 61, 39][index] || 50,
  replies: [17, 9, 4][index] || 0,
  opened: [72, 45, 18][index] || 0,
  sentToday: [24, 17, 8][index] || 0,
  phase: ["Scaled", "Balanced", "Protected"][index] || "Balanced",
}));
const mockThreads: InboxThread[] = [
  { id: crypto.randomUUID(), name: "Alice Morgan", company: "Acme", subject: "Re: Quick intro", preview: "Happy to look at this next week — can you send a few times?", state: "positive", channel: "Campaign / Founder warm intro", unread: true, at: "2m ago" },
  { id: crypto.randomUUID(), name: "Jonas Beck", company: "Beacon", subject: "Pricing question", preview: "Before we book, can you clarify whether this covers SDR workflows too?", state: "waiting", channel: "Manual reply", unread: false, at: "18m ago" },
  { id: crypto.randomUUID(), name: "Carol Diaz", company: "Cascade", subject: "Not now", preview: "Circle back in Q3 after the current implementation wraps.", state: "closed", channel: "Campaign / DACH follow-up", unread: false, at: "1h ago" },
  { id: crypto.randomUUID(), name: "Mia Stone", company: "Northstar", subject: "Interested", preview: "Yes, this sounds relevant. Who on your side would run onboarding?", state: "new", channel: "Campaign / Founder warm intro", unread: true, at: "3h ago" },
];

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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function miniBarHeights(values: number[]) {
  const max = Math.max(...values, 1);
  return values.map((value) => `${Math.max(18, (value / max) * 100)}%`);
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
  const [senders, setSenders] = useLocalStorageState<SenderProfile[]>(STORAGE_KEYS.senders, defaultSenders());
  const [warmupRows, setWarmupRows] = useLocalStorageState<WarmupRow[]>(STORAGE_KEYS.warmup, []);

  const [accountName, setAccountName] = React.useState("Outbound workspace");
  const [csvText, setCsvText] = React.useState(defaultCsv);
  const [fileName, setFileName] = React.useState("prospects-q2.csv");
  const [leadImports, setLeadImports] = React.useState<LeadImport[]>([]);
  const [activeImportId, setActiveImportId] = React.useState("");
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [leadSearch, setLeadSearch] = React.useState("");

  const [sequenceDraft, setSequenceDraft] = React.useState<Sequence>(defaultSequence());
  const [selectedSequenceId, setSelectedSequenceId] = React.useState("");
  const [spintaxPreview, setSpintaxPreview] = React.useState("");
  const [selectedStepIndex, setSelectedStepIndex] = React.useState(0);

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
  const [campaignFlowTab, setCampaignFlowTab] = React.useState<CampaignFlowTab>("leads");
  const [showScheduleModal, setShowScheduleModal] = React.useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = React.useState("");

  const [inboxEmail, setInboxEmail] = React.useState("operator@example.com");
  const [testRecipient, setTestRecipient] = React.useState("deliverability-check@example.com");
  const [testSubject, setTestSubject] = React.useState("Testing deliverability");
  const [testBody, setTestBody] = React.useState("This is a test email from Bison Ops.");
  const [senderName, setSenderName] = React.useState("New sender");
  const [senderEmail, setSenderEmail] = React.useState("new-sender@bisonops.co");

  React.useEffect(() => {
    if (!warmupRows.length) setWarmupRows(defaultWarmup(senders));
  }, [senders, setWarmupRows, warmupRows.length]);

  const activeImport = React.useMemo(() => leadImports.find((item) => item.id === activeImportId) || null, [leadImports, activeImportId]);
  const selectedAccount = React.useMemo(() => accounts.find((account) => account.id === selectedAccountId) || null, [accounts, selectedAccountId]);
  const selectedSequence = React.useMemo(() => sequences.find((item) => item.id === selectedSequenceId) || null, [sequences, selectedSequenceId]);
  const accountInboxes = React.useMemo(() => inboxes.filter((item) => !item.accountId || item.accountId === selectedAccountId), [inboxes, selectedAccountId]);
  const allTags = React.useMemo(() => Array.from(new Set(leads.flatMap((lead) => lead.tags))).filter(Boolean), [leads]);
  const allCustomFields = React.useMemo(() => Array.from(new Set(leads.flatMap((lead) => Object.keys(lead.customFields || {})))).filter(Boolean), [leads]);
  const selectedCampaign = React.useMemo(() => campaigns.find((item) => item.id === selectedCampaignId) || campaigns[0] || null, [campaigns, selectedCampaignId]);
  const campaignSequence = selectedCampaign || null;
  const filteredLeads = React.useMemo(() => leads.filter((lead) => {
    const haystack = [lead.firstName, lead.lastName, lead.email, lead.company, lead.title, lead.source, ...lead.tags].join(" ").toLowerCase();
    return haystack.includes(leadSearch.toLowerCase());
  }), [leadSearch, leads]);

  React.useEffect(() => {
    if (!selectedAccountId && accounts[0]) setSelectedAccountId(accounts[0].id);
  }, [accounts, selectedAccountId]);
  React.useEffect(() => {
    if (!selectedSequenceId && sequences[0]) setSelectedSequenceId(sequences[0].id);
  }, [sequences, selectedSequenceId]);
  React.useEffect(() => {
    if (!launchInboxId && accountInboxes[0]) setLaunchInboxId(accountInboxes[0].id);
  }, [accountInboxes, launchInboxId]);
  React.useEffect(() => {
    if (!selectedCampaignId && campaigns[0]) setSelectedCampaignId(campaigns[0].id);
  }, [campaigns, selectedCampaignId]);

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
    const result = await request<Account>("/accounts", { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ name: accountName, settings: {} }) });
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
    const result = await request<{ created: number }>(`/lead-imports/${activeImportId}/commit`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } });
    if (result.data) {
      setStatus(`Leads imported: ${result.data.created}`);
      await loadLeads();
      await loadImports();
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
    setSelectedStepIndex(0);
    setSpintaxPreview("");
  }

  function saveSequence() {
    const normalized: Sequence = { ...sequenceDraft, steps: sequenceDraft.steps.map((step, index) => ({ ...step, stepNumber: index + 1, type: "email" as const })) };
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
    setSelectedStepIndex(0);
    setStatus(`Loaded sequence: ${sequence.name}`);
  }

  function addStep() {
    setSequenceDraft((prev) => ({ ...prev, steps: [...prev.steps, { stepNumber: prev.steps.length + 1, type: "email", delay: { kind: "after_previous_sent", amount: 3, unit: "days" }, subjectTemplate: "Following up", bodyTemplate: "Hi {{firstName}},\n\nWanted to follow up in case this was relevant for {{company}}." }] }));
    setSelectedStepIndex(sequenceDraft.steps.length);
  }

  function updateStep(index: number, patch: Partial<CampaignStep>) {
    setSequenceDraft((prev) => ({ ...prev, steps: prev.steps.map((step, current) => current === index ? { ...step, ...patch } : step) }));
  }

  function removeStep(index: number) {
    setSequenceDraft((prev) => ({ ...prev, steps: prev.steps.filter((_, current) => current !== index).map((step, current) => ({ ...step, stepNumber: current + 1 })) }));
    setSelectedStepIndex((current) => Math.max(0, Math.min(current, sequenceDraft.steps.length - 2)));
  }

  async function previewStep(stepIndex: number) {
    const step = sequenceDraft.steps[stepIndex];
    const sampleLead = leads[0] || { firstName: "Alice", company: "Acme", customFields: { industry: "Fintech" } };
    const values = { firstName: sampleLead.firstName || "there", company: sampleLead.company || "your company", ...(sampleLead.customFields || {}) };
    const result = await request<{ rendered: string }>("/spintax/render", { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ template: `${step.subjectTemplate}\n\n${step.bodyTemplate}`, values }) });
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
    const result = await request<{ inboxId: string; authStatus: string; provider: string; verifiedAt: string }>(`/inboxes/${inboxId}/connect`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } });
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
    const result = await request<{ providerMessageId?: string; accepted?: boolean }>(`/inboxes/${inboxId}/send-test`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ to: testRecipient, subject: testSubject, text: testBody }) });
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
      setSelectedCampaignId(result.data.id);
      setStatus(`Campaign created: ${result.data.name}`);
    } else setStatus(result.error?.message || "Campaign creation failed.");
  }

  async function launchCampaign(campaignId: string) {
    if (!launchInboxId) return setStatus("Select an inbox before launch.");
    if (!selectedLeadIds.length) return setStatus("Select at least one lead for enrollment.");
    setStatus("Enrolling leads into campaign...");
    const enrollment = await request<{ created: number }>(`/campaigns/${campaignId}/enrollments`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ leadIds: selectedLeadIds, inboxId: launchInboxId }) });
    if (!enrollment.data) return setStatus(enrollment.error?.message || "Failed to enroll leads.");
    const started = await request<Campaign>(`/campaigns/${campaignId}/start`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } });
    if (started.data) {
      setCampaigns((prev) => prev.map((item) => item.id === campaignId ? started.data! : item));
      setStatus(`Campaign launched with ${enrollment.data.created} enrollments.`);
      await loadCampaigns();
    } else setStatus(started.error?.message || "Campaign started but status refresh failed.");
  }

  function toggleLeadSelection(leadId: string) {
    setSelectedLeadIds((prev) => prev.includes(leadId) ? prev.filter((item) => item !== leadId) : [...prev, leadId]);
  }
  function toggleAllLeads() { setSelectedLeadIds((prev) => prev.length === filteredLeads.length ? [] : filteredLeads.map((lead) => lead.id)); }
  function toggleDay(day: number) { setAllowedDays((prev) => prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day].sort()); }
  function signIn() { localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(auth)); setAuthed(true); setStatus("Signed in."); }
  function signOut() { localStorage.removeItem(STORAGE_KEYS.auth); setAuthed(false); }

  function createSenderProfile() {
    const next: SenderProfile = { id: crypto.randomUUID(), name: senderName, email: senderEmail, provider: "Google Workspace", reputation: 71, dailyLimit: 25, status: "warming", accountId: selectedAccountId };
    setSenders((prev) => [next, ...prev]);
    setWarmupRows((prev) => [{ id: crypto.randomUUID(), senderId: next.id, mailbox: next.email, progress: 28, replies: 2, opened: 14, sentToday: 6, phase: "Protected" }, ...prev]);
    setStatus(`Sender added locally: ${next.email}`);
  }

  const bars = miniBarHeights([42, 51, 49, 67, 73, 69, 84, 79, 88, 97, 93, 104]);
  const totalActive = Object.values(campaignStats).reduce((sum, item) => sum + item.active, 0);
  const totalReplied = Object.values(campaignStats).reduce((sum, item) => sum + item.replied, 0);
  const totalEnrolled = Object.values(campaignStats).reduce((sum, item) => sum + item.enrolled, 0);
  const replyRate = totalEnrolled ? Math.round((totalReplied / totalEnrolled) * 100) : 0;

  if (!authed) {
    return (
      <div className="auth-shell">
        <div className="auth-hero auth-reimagined">
          <div className="auth-copy">
            <div className="eyebrow">Whitsiro-style outbound ops</div>
            <h1>Operate cold email from one calm, sharp control room.</h1>
            <p>Track pipeline health, manage senders, review replies, and move from leads to launch in a workflow that feels like an actual product.</p>
            <div className="auth-feature-grid">
              <div><strong>Minimal dashboard</strong><span>KPI cards, charting, tighter hierarchy.</span></div>
              <div><strong>Campaign workspace</strong><span>Step tabs, split-pane sequence editor, schedule picker.</span></div>
              <div><strong>Deliverability layer</strong><span>Sender emails, warmup, master inbox surfaces.</span></div>
            </div>
          </div>
          <div className="auth-card auth-card-elevated">
            <div className="card-title"><h2>Enter workspace</h2><p>Use your current backend where endpoints already exist.</p></div>
            <label><span>Workspace name</span><input value={auth.workspaceName} onChange={(e) => setAuth({ ...auth, workspaceName: e.target.value })} /></label>
            <label><span>Operator name</span><input value={auth.operatorName} onChange={(e) => setAuth({ ...auth, operatorName: e.target.value })} /></label>
            <label><span>API base URL</span><input value={auth.apiBase} onChange={(e) => setAuth({ ...auth, apiBase: e.target.value })} /></label>
            <label><span>API key</span><input type="password" value={auth.apiKey} onChange={(e) => setAuth({ ...auth, apiKey: e.target.value })} placeholder="Optional bearer token" /></label>
            <button className="primary-xl" onClick={signIn}>Open control room</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-shell bison-shell">
      <aside className="sidebar sidebar-polished">
        <div className="brand-block brand-block-strong">
          <div className="brand-mark">B</div>
          <div>
            <strong>{auth.workspaceName}</strong>
            <span>Outbound control room</span>
          </div>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">Workspace</span>
          <nav className="nav-stack">
            {navItems.map((item) => (
              <button key={item.key} className={nav === item.key ? "nav-item active" : "nav-item"} onClick={() => setNav(item.key)}>
                <div className="nav-item-main"><span className="nav-icon">{item.icon}</span><span>{item.label}</span></div>
                <small>{item.kicker}</small>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-note sidebar-note-elevated">
          <strong>Working account</strong>
          <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
            <option value="">Select account</option>
            {accounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}
          </select>
          <small>{selectedAccount ? `Using ${selectedAccount.name}` : "Create an account to start importing and launching."}</small>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar topbar-polished">
          <div>
            <div className="eyebrow">{navItems.find((item) => item.key === nav)?.label || "Dashboard"}</div>
            <h1>{nav === "overview" ? "Outbound dashboard" : nav === "leads" ? "Lead database" : nav === "campaigns" ? "Campaign builder" : nav === "inbox" ? "Master inbox" : nav === "senders" ? "Sender emails" : "Warmup center"}</h1>
          </div>
          <div className="topbar-actions">
            <div className="search-pill">⌘K · Search leads, campaigns, senders</div>
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
          <section className="page-grid dashboard-grid">
            <div className="panel dashboard-hero">
              <div className="hero-copy">
                <div className="eyebrow">Performance overview</div>
                <h2>Revenue pipeline in one glance.</h2>
                <p>Sharper visibility across active campaigns, positive replies, connected senders, and lead coverage — with a layout tuned to feel closer to Bison/Whitsiro product UX.</p>
                <div className="hero-actions">
                  <button onClick={() => setNav("campaigns")}>Create campaign</button>
                  <button className="secondary" onClick={() => setNav("leads")}>Review leads</button>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-card-head"><strong>Pipeline growth</strong><span>Last 12 days</span></div>
                <div className="chart-bars">{bars.map((height, index) => <div className="chart-bar" key={index} style={{ height }} />)}</div>
                <div className="chart-foot"><span>Positive trend</span><strong>+18.4%</strong></div>
              </div>
            </div>

            <div className="stats-grid stats-grid-wide">
              <div className="stat-card stat-card-soft"><span>Leads</span><strong>{formatNumber(leads.length)}</strong><small>Backend synced</small></div>
              <div className="stat-card stat-card-soft"><span>Active campaigns</span><strong>{formatNumber(totalActive || campaigns.filter((c) => c.status === "active").length)}</strong><small>Currently sending</small></div>
              <div className="stat-card stat-card-soft"><span>Reply rate</span><strong>{replyRate}%</strong><small>Across tracked enrollments</small></div>
              <div className="stat-card stat-card-soft"><span>Sender emails</span><strong>{formatNumber(senders.length)}</strong><small>Local/mailbox layer</small></div>
            </div>

            <div className="panel panel-span-7">
              <div className="section-header"><h3>Priority queue</h3><span>What needs attention now</span></div>
              <div className="priority-list">
                <div className="priority-row"><div><strong>{selectedAccount ? selectedAccount.name : "Create an account"}</strong><span>{selectedAccount ? "Workspace selected and ready for imports." : "Account required before backend actions."}</span></div><b className={selectedAccount ? "badge good" : "badge"}>{selectedAccount ? "Ready" : "Pending"}</b></div>
                <div className="priority-row"><div><strong>{campaigns.length} campaigns in motion</strong><span>{campaigns.length ? "Open the campaign workspace to tune sequencing or launch." : "No campaigns created yet."}</span></div><b className="badge">Campaigns</b></div>
                <div className="priority-row"><div><strong>{accountInboxes.length} connected inbox records</strong><span>Sender email and warmup surfaces are local-first until list APIs exist.</span></div><b className="badge warn">Ops</b></div>
              </div>
            </div>

            <div className="panel panel-span-5">
              <div className="section-header"><h3>Create account</h3><span>Backend-backed</span></div>
              <label><span>Account name</span><input value={accountName} onChange={(e) => setAccountName(e.target.value)} /></label>
              <div className="panel-actions"><button onClick={createAccount}>Create account</button></div>
              <div className="tiny-metrics">
                <div><span>Sequences</span><strong>{sequences.length}</strong></div>
                <div><span>Imports</span><strong>{leadImports.length}</strong></div>
                <div><span>Warmup mailboxes</span><strong>{warmupRows.length}</strong></div>
              </div>
            </div>
          </section>
        )}

        {nav === "leads" && (
          <section className="page-grid leads-page-grid">
            <div className="panel panel-span-12 filter-strip-panel">
              <div className="filter-strip">
                <div className="filter-chip active">All leads <strong>{filteredLeads.length}</strong></div>
                <div className="filter-chip">Imported <strong>{leadImports.length}</strong></div>
                <div className="filter-chip">Selected <strong>{selectedLeadIds.length}</strong></div>
                <div className="filter-chip">Tags <strong>{allTags.length}</strong></div>
                <div className="filter-chip">Custom fields <strong>{allCustomFields.length}</strong></div>
              </div>
            </div>
            <div className="panel panel-span-4">
              <div className="section-header"><h3>Import leads</h3><span>Current backend flow</span></div>
              <label><span>File name</span><input value={fileName} onChange={(e) => setFileName(e.target.value)} /></label>
              <label><span>CSV content</span><textarea rows={10} value={csvText} onChange={(e) => setCsvText(e.target.value)} /></label>
              <div className="panel-actions"><button onClick={uploadCsv}>Upload CSV</button></div>
              <div className="stack compact">
                {leadImports.map((item) => (
                  <button key={item.id} className={activeImportId === item.id ? "import-card active" : "import-card"} onClick={() => { setActiveImportId(item.id); setMapping(item.mapping || {}); }}>
                    <strong>{item.fileName}</strong>
                    <span>{item.totalRows} rows · {item.status}</span>
                  </button>
                ))}
                {!leadImports.length && <div className="empty-state">No imports yet.</div>}
              </div>
            </div>

            <div className="panel panel-span-8">
              <div className="section-header"><h3>Lead table</h3><span>Product-style list view</span></div>
              <div className="toolbar-row">
                <input value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} placeholder="Search by lead, company, title, tag" />
                <button className="secondary" onClick={toggleAllLeads}>{selectedLeadIds.length === filteredLeads.length && filteredLeads.length ? "Clear selection" : "Select visible"}</button>
              </div>
              <div className="table-wrap table-wrap-strong">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Title</th>
                      <th>Source</th>
                      <th>Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td><input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => toggleLeadSelection(lead.id)} /></td>
                        <td><div className="person-cell"><strong>{[lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.email}</strong><span>{lead.email}</span></div></td>
                        <td>{lead.company || "—"}</td>
                        <td>{lead.title || "—"}</td>
                        <td>{lead.source || "Manual"}</td>
                        <td><div className="token-row">{lead.tags.length ? lead.tags.slice(0, 2).map((tag) => <span key={tag} className="token">{tag}</span>) : <span className="muted">—</span>}</div></td>
                      </tr>
                    ))}
                    {!filteredLeads.length && <tr><td colSpan={6}><div className="empty-state">No leads loaded yet.</div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {activeImport && (
              <>
                <div className="panel panel-span-7">
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
                  <div className="panel-actions"><button onClick={saveMapping}>Save mapping</button><button className="secondary" onClick={commitImport}>Commit import</button></div>
                </div>
                <div className="panel panel-span-5">
                  <div className="section-header"><h3>Sample rows</h3><span>{activeImport.totalRows} total rows</span></div>
                  <div className="summary-list summary-list-compact">
                    <div><span>Custom fields</span><strong>{activeImport.customFieldKeys.join(", ") || "—"}</strong></div>
                    <div><span>Tags</span><strong>{activeImport.tagNames.join(", ") || "—"}</strong></div>
                    <div><span>Created leads</span><strong>{activeImport.createdLeadIds.length}</strong></div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr>{activeImport.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                      <tbody>{activeImport.sampleRows.map((row, index) => <tr key={index}>{activeImport.headers.map((header) => <td key={header}>{row[header]}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {nav === "campaigns" && (
          <section className="page-grid campaign-page-grid">
            <div className="panel panel-span-12 campaign-topbar-card">
              <div className="campaign-detail-header">
                <div>
                  <div className="eyebrow">Campaign detail</div>
                  <h2>{selectedCampaign?.name || campaignName}</h2>
                  <p>{selectedCampaign?.objective || campaignObjective}</p>
                </div>
                <div className="panel-actions"><button onClick={createCampaign}>Save campaign</button><button className="secondary" onClick={() => setShowScheduleModal(true)}>Edit schedule</button></div>
              </div>
              <div className="flow-tabs">
                {flowTabs.map((tab) => <button key={tab.key} className={campaignFlowTab === tab.key ? "flow-tab active" : "flow-tab"} onClick={() => setCampaignFlowTab(tab.key)}>{tab.label}</button>)}
              </div>
            </div>

            <div className="panel panel-span-5 campaigns-table-panel">
              <div className="section-header"><h3>Campaigns</h3><span>Backend-backed list</span></div>
              <div className="table-wrap table-wrap-strong">
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Status</th><th>Steps</th><th>Enrolled</th></tr></thead>
                  <tbody>
                    {campaigns.map((campaign) => {
                      const stats = campaignStats[campaign.id];
                      return (
                        <tr key={campaign.id} className={selectedCampaignId === campaign.id ? "row-selected" : ""} onClick={() => setSelectedCampaignId(campaign.id)}>
                          <td><div className="person-cell"><strong>{campaign.name}</strong><span>{campaign.objective || "—"}</span></div></td>
                          <td><span className={`status-pill ${campaign.status}`}>{campaign.status}</span></td>
                          <td>{campaign.steps.length}</td>
                          <td>{stats?.enrolled ?? 0}</td>
                        </tr>
                      );
                    })}
                    {!campaigns.length && <tr><td colSpan={4}><div className="empty-state">No campaigns yet.</div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {campaignFlowTab === "leads" && (
              <div className="panel panel-span-7">
                <div className="section-header"><h3>Lead audience</h3><span>Select prospects for this motion</span></div>
                <div className="lead-picker-list lead-picker-list-wide">
                  {filteredLeads.map((lead) => (
                    <label key={lead.id} className={selectedLeadIds.includes(lead.id) ? "lead-picker active" : "lead-picker"}>
                      <input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => toggleLeadSelection(lead.id)} />
                      <div>
                        <strong>{lead.firstName || lead.email}</strong>
                        <span>{lead.company || lead.email} · {lead.title || "No title"}</span>
                      </div>
                    </label>
                  ))}
                  {!filteredLeads.length && <div className="empty-state">Import leads first.</div>}
                </div>
              </div>
            )}

            {campaignFlowTab === "sequence" && (
              <div className="panel panel-span-7 sequence-editor-shell">
                <div className="sequence-toolbar">
                  <div className="mini-tabs">
                    <button className="mini-tab active">Steps</button>
                    <button className="mini-tab">Variants</button>
                    <button className="mini-tab">Preview</button>
                  </div>
                  <div className="panel-actions">
                    <button className="secondary" onClick={resetSequenceDraft}>New draft</button>
                    <button className="secondary" onClick={() => selectedSequenceId && loadSequenceIntoBuilder(selectedSequenceId)}>Load saved</button>
                  </div>
                </div>
                <div className="split-pane">
                  <div className="split-sidebar">
                    <div className="section-header"><h3>Sequence steps</h3><span>Local-first editor</span></div>
                    <label><span>Name</span><input value={sequenceDraft.name} onChange={(e) => setSequenceDraft({ ...sequenceDraft, name: e.target.value })} /></label>
                    <label><span>Objective</span><input value={sequenceDraft.objective} onChange={(e) => setSequenceDraft({ ...sequenceDraft, objective: e.target.value })} /></label>
                    <div className="stack compact">
                      {sequenceDraft.steps.map((step, index) => (
                        <button key={index} className={selectedStepIndex === index ? "sequence-node active" : "sequence-node"} onClick={() => setSelectedStepIndex(index)}>
                          <strong>Step {index + 1}</strong>
                          <span>{step.delay.amount} {step.delay.unit} · {step.subjectTemplate}</span>
                        </button>
                      ))}
                    </div>
                    <div className="panel-actions"><button className="secondary" onClick={addStep}>Add step</button><button onClick={saveSequence}>Save sequence</button></div>
                  </div>
                  <div className="split-main">
                    {sequenceDraft.steps[selectedStepIndex] && (
                      <>
                        <div className="step-header"><div><div className="eyebrow">Step {selectedStepIndex + 1}</div><h4>Email touchpoint</h4></div><button className="ghost-button" onClick={() => removeStep(selectedStepIndex)} disabled={sequenceDraft.steps.length === 1}>Remove</button></div>
                        <div className="step-config-grid">
                          <label><span>Delay amount</span><input value={sequenceDraft.steps[selectedStepIndex].delay.amount} onChange={(e) => updateStep(selectedStepIndex, { delay: { ...sequenceDraft.steps[selectedStepIndex].delay, amount: Number(e.target.value) } })} /></label>
                          <label><span>Unit</span><select value={sequenceDraft.steps[selectedStepIndex].delay.unit} onChange={(e) => updateStep(selectedStepIndex, { delay: { ...sequenceDraft.steps[selectedStepIndex].delay, unit: e.target.value as CampaignStep["delay"]["unit"] } })}><option value="minutes">minutes</option><option value="hours">hours</option><option value="days">days</option></select></label>
                          <label><span>Anchor</span><select value={sequenceDraft.steps[selectedStepIndex].delay.kind || (selectedStepIndex === 0 ? "after_enrollment" : "after_previous_sent")} onChange={(e) => updateStep(selectedStepIndex, { delay: { ...sequenceDraft.steps[selectedStepIndex].delay, kind: e.target.value as CampaignStep["delay"]["kind"] } })}><option value="after_enrollment">after enrollment</option><option value="after_previous_sent">after previous sent</option></select></label>
                        </div>
                        <label><span>Subject</span><input value={sequenceDraft.steps[selectedStepIndex].subjectTemplate} onChange={(e) => updateStep(selectedStepIndex, { subjectTemplate: e.target.value })} /></label>
                        <label><span>Body</span><textarea rows={10} value={sequenceDraft.steps[selectedStepIndex].bodyTemplate} onChange={(e) => updateStep(selectedStepIndex, { bodyTemplate: e.target.value })} /></label>
                        <div className="panel-actions"><button className="secondary" onClick={() => previewStep(selectedStepIndex)}>Preview message</button></div>
                        <div className="preview-surface preview-surface-tall">{spintaxPreview || "Preview a step to render subject + body against a sample lead."}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {campaignFlowTab === "schedule" && (
              <div className="panel panel-span-7">
                <div className="section-header"><h3>Schedule presets</h3><span>Card-based time windows</span></div>
                <div className="schedule-card-grid">
                  <button className="schedule-card active" onClick={() => { setAllowedDays([1,2,3,4,5]); setStartHour("9"); setEndHour("17"); setScheduleTimezone("Europe/Berlin"); }}><strong>Business hours</strong><span>Mon–Fri · 09:00–17:00</span></button>
                  <button className="schedule-card" onClick={() => { setAllowedDays([1,2,3,4,5]); setStartHour("8"); setEndHour("12"); }}><strong>Morning sprint</strong><span>Mon–Fri · 08:00–12:00</span></button>
                  <button className="schedule-card" onClick={() => { setAllowedDays([2,3,4]); setStartHour("10"); setEndHour("16"); }}><strong>Focused midweek</strong><span>Tue–Thu · 10:00–16:00</span></button>
                </div>
                <div className="schedule-inline-grid">
                  <label><span>Timezone</span><input value={scheduleTimezone} onChange={(e) => setScheduleTimezone(e.target.value)} /></label>
                  <label><span>Start hour</span><input value={startHour} onChange={(e) => setStartHour(e.target.value)} /></label>
                  <label><span>End hour</span><input value={endHour} onChange={(e) => setEndHour(e.target.value)} /></label>
                </div>
                <div><span className="label">Allowed days</span><div className="chip-row">{dayOptions.map((day) => <button key={day.value} className={allowedDays.includes(day.value) ? "chip active" : "chip"} onClick={() => toggleDay(day.value)}>{day.label}</button>)}</div></div>
                <div className="panel-actions"><button className="secondary" onClick={() => setShowScheduleModal(true)}>Open schedule modal</button></div>
              </div>
            )}

            {campaignFlowTab === "settings" && (
              <div className="panel panel-span-7">
                <div className="section-header"><h3>Campaign settings</h3><span>Core send controls</span></div>
                <label><span>Campaign name</span><input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} /></label>
                <label><span>Objective</span><input value={campaignObjective} onChange={(e) => setCampaignObjective(e.target.value)} /></label>
                <label><span>Sequence</span><select value={selectedSequenceId} onChange={(e) => setSelectedSequenceId(e.target.value)}>{sequences.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <div className="toggle-row">
                  <label className="checkbox"><input type="checkbox" checked={trackOpens} onChange={(e) => setTrackOpens(e.target.checked)} /> Track opens</label>
                  <label className="checkbox"><input type="checkbox" checked={stopOnReply} onChange={(e) => setStopOnReply(e.target.checked)} /> Stop on reply</label>
                </div>
                <div className="summary-list summary-list-compact"><div><span>Lead tags</span><strong>{allTags.join(", ") || "—"}</strong></div><div><span>Custom fields</span><strong>{allCustomFields.join(", ") || "—"}</strong></div></div>
              </div>
            )}

            {campaignFlowTab === "senders" && (
              <div className="panel panel-span-7">
                <div className="section-header"><h3>Sender email allocation</h3><span>Choose the mailbox for launch</span></div>
                <div className="sender-list">
                  {senders.map((sender) => (
                    <label key={sender.id} className={launchInboxId && accountInboxes.some((box) => box.id === launchInboxId && box.emailAddress === sender.email) ? "sender-row active" : "sender-row"}>
                      <input type="radio" name="sender" checked={accountInboxes.some((box) => box.id === launchInboxId && box.emailAddress === sender.email)} onChange={() => {
                        const existing = accountInboxes.find((box) => box.emailAddress === sender.email);
                        if (existing) setLaunchInboxId(existing.id);
                      }} />
                      <div><strong>{sender.email}</strong><span>{sender.provider} · Reputation {sender.reputation}</span></div>
                      <b className={`badge ${sender.status === "ready" ? "good" : sender.status === "warming" ? "warn" : "bad"}`}>{sender.status.replace("_", " ")}</b>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {campaignFlowTab === "launch" && (
              <div className="panel panel-span-7">
                <div className="section-header"><h3>Launch review</h3><span>Ready-state before sending</span></div>
                <div className="launch-grid">
                  <div className="review-card"><span>Selected leads</span><strong>{selectedLeadIds.length}</strong></div>
                  <div className="review-card"><span>Sequence steps</span><strong>{(selectedSequence || sequenceDraft).steps.length}</strong></div>
                  <div className="review-card"><span>Schedule</span><strong>{startHour}:00–{endHour}:00</strong></div>
                  <div className="review-card"><span>Sender inbox</span><strong>{launchInboxId ? accountInboxes.find((box) => box.id === launchInboxId)?.emailAddress || "Selected" : "Missing"}</strong></div>
                </div>
                <div className="panel-actions"><button onClick={() => selectedCampaign && launchCampaign(selectedCampaign.id)} disabled={!selectedCampaign}>Launch campaign</button><button className="secondary" onClick={loadCampaigns}>Refresh campaigns</button></div>
              </div>
            )}
          </section>
        )}

        {nav === "inbox" && (
          <section className="page-grid master-inbox-grid">
            <div className="panel panel-span-4 inbox-thread-panel">
              <div className="section-header"><h3>Conversations</h3><span>Local inbox shell</span></div>
              <div className="thread-list">
                {mockThreads.map((thread) => (
                  <button key={thread.id} className={thread.unread ? "thread-card unread" : "thread-card"}>
                    <div className="thread-top"><strong>{thread.name}</strong><span>{thread.at}</span></div>
                    <div className="thread-company">{thread.company} · {thread.channel}</div>
                    <div className="thread-subject">{thread.subject}</div>
                    <p>{thread.preview}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="panel panel-span-8 inbox-detail-panel">
              <div className="section-header"><h3>Reply workspace</h3><span>Master inbox layout</span></div>
              <div className="filter-strip compact-strip">
                <div className="filter-chip active">Unread</div>
                <div className="filter-chip">Positive</div>
                <div className="filter-chip">Waiting</div>
                <div className="filter-chip">Closed</div>
              </div>
              <div className="reply-thread-shell">
                <div className="message-bubble inbound"><strong>Alice Morgan</strong><p>Happy to look at this next week — can you send a few times?</p><span>2 min ago</span></div>
                <div className="message-bubble outbound"><strong>{auth.operatorName}</strong><p>Absolutely — I can do Wednesday 11:00 CET or Thursday 14:30 CET. Which works best?</p><span>Draft reply</span></div>
              </div>
              <label><span>Reply draft</span><textarea rows={9} defaultValue={"Absolutely — I can do Wednesday 11:00 CET or Thursday 14:30 CET. Which works best?"} /></label>
              <div className="panel-actions"><button>Send reply</button><button className="secondary">Snooze</button><button className="secondary">Mark closed</button></div>
            </div>
          </section>
        )}

        {nav === "senders" && (
          <section className="page-grid senders-grid">
            <div className="panel panel-span-4">
              <div className="section-header"><h3>Add sender email</h3><span>Frontend-local for now</span></div>
              <label><span>Name</span><input value={senderName} onChange={(e) => setSenderName(e.target.value)} /></label>
              <label><span>Email</span><input value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} /></label>
              <div className="panel-actions"><button onClick={createSenderProfile}>Add sender</button></div>
              <div className="section-header"><h3>Create backend inbox</h3><span>Existing endpoint</span></div>
              <label><span>Email address</span><input value={inboxEmail} onChange={(e) => setInboxEmail(e.target.value)} /></label>
              <div className="panel-actions"><button className="secondary" onClick={createInbox}>Create inbox</button></div>
            </div>
            <div className="panel panel-span-8">
              <div className="section-header"><h3>Sender email table</h3><span>Product-grade list</span></div>
              <div className="table-wrap table-wrap-strong">
                <table className="data-table">
                  <thead><tr><th>Mailbox</th><th>Provider</th><th>Reputation</th><th>Daily limit</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {senders.map((sender) => (
                      <tr key={sender.id}>
                        <td><div className="person-cell"><strong>{sender.name}</strong><span>{sender.email}</span></div></td>
                        <td>{sender.provider}</td>
                        <td>{sender.reputation}</td>
                        <td>{sender.dailyLimit}</td>
                        <td><span className={`status-pill ${sender.status === "ready" ? "active" : "draft"}`}>{sender.status.replace("_", " ")}</span></td>
                        <td><div className="inline-actions"><button className="secondary" onClick={() => { const inbox = accountInboxes.find((box) => box.emailAddress === sender.email); if (inbox) connectInbox(inbox.id); else setStatus("No backend inbox exists yet for this sender email."); }}>Connect</button><button className="secondary" onClick={() => { const inbox = accountInboxes.find((box) => box.emailAddress === sender.email); if (inbox) checkInboxHealth(inbox.id); else setStatus("Health checks need a created backend inbox."); }}>Health</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {nav === "warmup" && (
          <section className="page-grid warmup-grid">
            <div className="panel panel-span-12">
              <div className="section-header"><h3>Warmup overview</h3><span>Local warmup dashboard until backend support exists</span></div>
              <div className="warmup-cards">
                {warmupRows.map((row) => (
                  <div key={row.id} className="warmup-card">
                    <div className="warmup-top"><strong>{row.mailbox}</strong><span>{row.phase}</span></div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${row.progress}%` }} /></div>
                    <div className="warmup-metrics"><div><span>Progress</span><strong>{row.progress}%</strong></div><div><span>Replies</span><strong>{row.replies}</strong></div><div><span>Opened</span><strong>{row.opened}</strong></div><div><span>Sent today</span><strong>{row.sentToday}</strong></div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel panel-span-7">
              <div className="section-header"><h3>Warmup table</h3><span>Mailbox health progression</span></div>
              <div className="table-wrap table-wrap-strong">
                <table className="data-table">
                  <thead><tr><th>Mailbox</th><th>Phase</th><th>Progress</th><th>Replies</th><th>Opened</th></tr></thead>
                  <tbody>{warmupRows.map((row) => <tr key={row.id}><td>{row.mailbox}</td><td>{row.phase}</td><td>{row.progress}%</td><td>{row.replies}</td><td>{row.opened}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
            <div className="panel panel-span-5">
              <div className="section-header"><h3>Deliverability test</h3><span>Existing backend send-test</span></div>
              <div className="schedule-inline-grid">
                <label><span>Inbox</span><select value={launchInboxId} onChange={(e) => setLaunchInboxId(e.target.value)}><option value="">Select inbox</option>{accountInboxes.map((item) => <option value={item.id} key={item.id}>{item.emailAddress}</option>)}</select></label>
                <label><span>Recipient</span><input value={testRecipient} onChange={(e) => setTestRecipient(e.target.value)} /></label>
              </div>
              <label><span>Subject</span><input value={testSubject} onChange={(e) => setTestSubject(e.target.value)} /></label>
              <label><span>Message</span><textarea rows={6} value={testBody} onChange={(e) => setTestBody(e.target.value)} /></label>
              <div className="panel-actions"><button onClick={() => launchInboxId && sendTest(launchInboxId)} disabled={!launchInboxId}>Send test</button></div>
            </div>
          </section>
        )}

        {showScheduleModal && (
          <div className="modal-backdrop" onClick={() => setShowScheduleModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="section-header"><h3>Schedule picker</h3><span>Campaign send window</span></div>
              <div className="schedule-card-grid">
                <button className="schedule-card active"><strong>Business hours</strong><span>Best for most outbound motions</span></button>
                <button className="schedule-card"><strong>High intent</strong><span>Tighter send range with stronger reply windows</span></button>
                <button className="schedule-card"><strong>Protect reputation</strong><span>Slower ramp with conservative timing</span></button>
              </div>
              <div className="schedule-inline-grid">
                <label><span>Timezone</span><input value={scheduleTimezone} onChange={(e) => setScheduleTimezone(e.target.value)} /></label>
                <label><span>Start hour</span><input value={startHour} onChange={(e) => setStartHour(e.target.value)} /></label>
                <label><span>End hour</span><input value={endHour} onChange={(e) => setEndHour(e.target.value)} /></label>
              </div>
              <div><span className="label">Allowed days</span><div className="chip-row">{dayOptions.map((day) => <button key={day.value} className={allowedDays.includes(day.value) ? "chip active" : "chip"} onClick={() => toggleDay(day.value)}>{day.label}</button>)}</div></div>
              <div className="panel-actions"><button onClick={() => setShowScheduleModal(false)}>Apply schedule</button><button className="secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button></div>
            </div>
          </div>
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

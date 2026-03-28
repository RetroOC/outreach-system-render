import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type SidebarItem = { id: ViewId; label: string; eyebrow: string };
type ViewId = 'overview' | 'campaigns' | 'inboxes' | 'replies' | 'pipeline' | 'todo';
type Kpi = { label: string; value: string; delta: string; tone?: 'good' | 'warn' | 'neutral' };
type Campaign = {
  name: string;
  status: 'Draft' | 'Active' | 'Paused';
  objective: string;
  sequence: string;
  enrolled: number;
  replies: number;
  positiveRate: string;
  owner: string;
};
type Inbox = {
  address: string;
  provider: string;
  health: 'Healthy' | 'Degraded' | 'Paused';
  sentToday: string;
  cap: string;
  pacing: string;
};
type ReplyThread = {
  lead: string;
  company: string;
  intent: 'Interested' | 'Objection' | 'OOO' | 'Unsubscribe';
  status: string;
  waited: string;
  action: string;
};
type TodoItem = { title: string; detail: string; done?: boolean };

const sidebarItems: SidebarItem[] = [
  { id: 'overview', label: 'Overview', eyebrow: 'Today' },
  { id: 'campaigns', label: 'Campaigns', eyebrow: 'Execution' },
  { id: 'inboxes', label: 'Inboxes', eyebrow: 'Health' },
  { id: 'replies', label: 'Replies', eyebrow: 'Ops' },
  { id: 'pipeline', label: 'Pipeline', eyebrow: 'Build' },
  { id: 'todo', label: 'Todo', eyebrow: 'Next' },
];

const kpis: Kpi[] = [
  { label: 'Campaigns live', value: '03', delta: '+1 in scope', tone: 'good' },
  { label: 'Leads enrolled', value: '1,284', delta: 'cleaned + deduped', tone: 'neutral' },
  { label: 'Replies awaiting action', value: '07', delta: 'needs routing today', tone: 'warn' },
  { label: 'Inbox capacity remaining', value: '61%', delta: 'safe for current pacing', tone: 'good' },
];

const campaigns: Campaign[] = [
  {
    name: 'Tanzania UHNI ranch buyers',
    status: 'Active',
    objective: 'Private consultation booked',
    sequence: '4-step buyer-side sequence',
    enrolled: 112,
    replies: 14,
    positiveRate: '5.4%',
    owner: 'Gershon',
  },
  {
    name: 'Founder outbound system pilot',
    status: 'Draft',
    objective: 'Discovery calls with infra buyers',
    sequence: '3-step operator workflow',
    enrolled: 0,
    replies: 0,
    positiveRate: '—',
    owner: 'Neal',
  },
  {
    name: 'Agency revops offer',
    status: 'Paused',
    objective: 'Reposition value prop before relaunch',
    sequence: 'Needs new proof mapping',
    enrolled: 48,
    replies: 6,
    positiveRate: '4.1%',
    owner: 'Gershon',
  },
];

const inboxes: Inbox[] = [
  { address: 'founder@neal.so', provider: 'Google', health: 'Healthy', sentToday: '26', cap: '60', pacing: '8–11 min' },
  { address: 'team@neal.so', provider: 'Microsoft', health: 'Degraded', sentToday: '19', cap: '40', pacing: 'watch complaints' },
  { address: 'pilot@neal.so', provider: 'Google', health: 'Paused', sentToday: '0', cap: '25', pacing: 'auth refresh needed' },
];

const replies: ReplyThread[] = [
  { lead: 'Maya Chen', company: 'Northstar', intent: 'Interested', status: 'Waiting for owner', waited: '08m', action: 'Draft follow-up + assign' },
  { lead: 'Jonas Weber', company: 'Meridian', intent: 'Objection', status: 'Needs custom response', waited: '17m', action: 'Handle pricing pushback' },
  { lead: 'Nina Rossi', company: 'Auxo', intent: 'OOO', status: 'Auto-resume candidate', waited: '04m', action: 'Reschedule after return date' },
  { lead: 'Samir Patel', company: 'Atlas GTM', intent: 'Unsubscribe', status: 'Suppression required', waited: '02m', action: 'Confirm suppression sync' },
];

const backendTracks: { title: string; body: string; bullets: string[] }[] = [
  {
    title: 'Backend shape locked',
    body: 'OpenClaw stays the orchestration layer while `outreach-core` handles campaigns, inboxes, scheduling, replies, and reporting.',
    bullets: ['Fastify API scaffold exists', 'Postgres schema draft exists', 'Queue/worker skeleton exists'],
  },
  {
    title: 'Frontend rebuilt around operations',
    body: 'The UI is now aimed at operators: campaign state, inbox health, reply routing, and build pipeline instead of a pure marketing surface.',
    bullets: ['Overview dashboard', 'Campaign command view', 'Reply triage lane'],
  },
  {
    title: 'Immediate gap',
    body: 'The next step is wiring these views to live endpoints and replacing static state with API-backed data contracts.',
    bullets: ['Map UI to routes', 'Create fetch layer', 'Add load/error states'],
  },
];

const todo: TodoItem[] = [
  { title: 'Finalize schema + API contracts', detail: 'Freeze v1 payloads for campaigns, inbox health, replies, and reporting.' },
  { title: 'Wire live frontend data', detail: 'Replace static cards with fetchers against outreach-core endpoints.' },
  { title: 'Build campaign builder flow', detail: 'Create forms for steps, pacing, objectives, inbox assignment, and enrollment.' },
  { title: 'Reply ops surface', detail: 'Add classification, assignment, suppression confirmation, and thread history.', done: false },
  { title: 'Shipping', detail: 'Push to GitHub and deploy latest frontend build to Vercel.', done: false },
];

function App() {
  const [view, setView] = React.useState<ViewId>('overview');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">N</div>
          <div>
            <strong>Neal</strong>
            <p>Outreach operator system</p>
          </div>
        </div>

        <div className="sidebar-group">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? 'sidebar-item active' : 'sidebar-item'}
              onClick={() => setView(item.id)}
            >
              <span>{item.eyebrow}</span>
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>

        <div className="sidebar-note">
          <span>Build direction</span>
          <strong>Boring, reliable engine first.</strong>
          <p>Operator control, inbox safety, reply handling, then deeper AI layers.</p>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">Outreach rebuild</span>
            <h1>Frontend aligned to the actual backend shape</h1>
            <p>
              This is now an operator-facing shell for campaigns, inboxes, replies, and execution tracking — built to map cleanly onto `outreach-core`.
            </p>
          </div>
          <div className="topbar-card">
            <span>Current focus</span>
            <strong>Schema → routes → live data wiring</strong>
            <p>No hard blocker. Main dependency is freezing MVP contracts before deeper UI work.</p>
          </div>
        </header>

        <section className="kpi-grid">
          {kpis.map((item) => (
            <article key={item.label} className="panel kpi-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <em className={item.tone ? `tone-${item.tone}` : ''}>{item.delta}</em>
            </article>
          ))}
        </section>

        {view === 'overview' && <OverviewView />}
        {view === 'campaigns' && <CampaignView />}
        {view === 'inboxes' && <InboxView />}
        {view === 'replies' && <RepliesView />}
        {view === 'pipeline' && <PipelineView />}
        {view === 'todo' && <TodoView />}
      </main>
    </div>
  );
}

function OverviewView() {
  return (
    <div className="content-grid two-up">
      <section className="panel hero-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Operator overview</span>
            <h2>Everything that matters to run outbound without losing control.</h2>
          </div>
          <span className="status-chip good">MVP shell live</span>
        </div>

        <div className="hero-layout">
          <div className="hero-column">
            <div className="metric-band">
              <Metric label="Live campaigns" value="3" />
              <Metric label="Healthy inboxes" value="1 / 3" />
              <Metric label="Queued work" value="12 jobs" />
            </div>
            <div className="narrative-block">
              <strong>Why this rebuild happened</strong>
              <p>
                The old frontend looked premium but behaved like a brochure. The new direction is an execution surface: stateful, operator-visible, and aligned to how the backend actually works.
              </p>
            </div>
          </div>

          <div className="stack-list">
            {backendTracks.map((track) => (
              <article key={track.title} className="stack-card">
                <strong>{track.title}</strong>
                <p>{track.body}</p>
                <ul>
                  {track.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading compact-heading">
          <div>
            <span className="eyebrow">Reply pressure</span>
            <h2>Priority threads</h2>
          </div>
          <span className="status-chip warn">7 awaiting action</span>
        </div>
        <div className="reply-list compact-list">
          {replies.slice(0, 3).map((item) => (
            <ReplyCard key={item.lead} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CampaignView() {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Campaign command</span>
          <h2>Campaigns should show execution state, not just marketing intent.</h2>
        </div>
        <span className="status-chip neutral">Static data now → API next</span>
      </div>

      <div className="table-list">
        {campaigns.map((campaign) => (
          <article key={campaign.name} className="table-row campaign-row">
            <div>
              <strong>{campaign.name}</strong>
              <p>{campaign.objective}</p>
            </div>
            <div>
              <span className={`status-pill ${campaign.status.toLowerCase()}`}>{campaign.status}</span>
              <p>{campaign.sequence}</p>
            </div>
            <div>
              <strong>{campaign.enrolled}</strong>
              <p>enrolled</p>
            </div>
            <div>
              <strong>{campaign.replies}</strong>
              <p>replies</p>
            </div>
            <div>
              <strong>{campaign.positiveRate}</strong>
              <p>positive reply rate</p>
            </div>
            <div>
              <strong>{campaign.owner}</strong>
              <p>owner</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function InboxView() {
  return (
    <section className="content-grid three-up">
      {inboxes.map((inbox) => (
        <article key={inbox.address} className="panel inbox-card">
          <div className="section-heading compact-heading">
            <div>
              <span className="eyebrow">{inbox.provider}</span>
              <h2>{inbox.address}</h2>
            </div>
            <span className={`status-chip ${inbox.health === 'Healthy' ? 'good' : inbox.health === 'Degraded' ? 'warn' : 'bad'}`}>{inbox.health}</span>
          </div>
          <div className="inbox-metrics">
            <Metric label="Sent today" value={inbox.sentToday} />
            <Metric label="Daily cap" value={inbox.cap} />
          </div>
          <div className="narrative-block">
            <strong>Pacing / notes</strong>
            <p>{inbox.pacing}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

function RepliesView() {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Reply operations</span>
          <h2>Replies need triage, intent, and an obvious next action.</h2>
        </div>
        <span className="status-chip warn">Routing surface</span>
      </div>
      <div className="reply-list">
        {replies.map((item) => (
          <ReplyCard key={item.lead} item={item} />
        ))}
      </div>
    </section>
  );
}

function PipelineView() {
  return (
    <section className="content-grid two-up">
      <article className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Build pipeline</span>
            <h2>What was achieved</h2>
          </div>
        </div>
        <ul className="timeline-list">
          <li>Backend service scaffold, scheduler, storage abstraction, worker skeleton, and webhook enforcement are already in place.</li>
          <li>Campaign stats, suppressions, reply ingestion pipeline, and job queue foundations exist in the backend.</li>
          <li>Frontend has now been rebuilt from a landing page into an execution-oriented MVP shell.</li>
        </ul>
      </article>

      <article className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Next execution window</span>
            <h2>What happens next</h2>
          </div>
        </div>
        <ul className="timeline-list">
          <li>Freeze v1 API contracts for campaigns, inbox health, replies, and reporting.</li>
          <li>Replace static frontend state with real fetchers and environment-based API configuration.</li>
          <li>Build the first real operator workflows: campaign builder, reply routing, and inbox health drilldowns.</li>
        </ul>
      </article>
    </section>
  );
}

function TodoView() {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Execution todo</span>
          <h2>Rebuild tasks after analysis</h2>
        </div>
      </div>
      <div className="todo-list">
        {todo.map((item) => (
          <article key={item.title} className={item.done ? 'todo-item done' : 'todo-item'}>
            <div className="todo-marker">{item.done ? '✓' : '•'}</div>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReplyCard({ item }: { item: ReplyThread }) {
  return (
    <article className="reply-card">
      <div>
        <span className="eyebrow">{item.company}</span>
        <strong>{item.lead}</strong>
      </div>
      <div>
        <span className={`intent-pill ${item.intent.toLowerCase().replace(/\s+/g, '-')}`}>{item.intent}</span>
        <p>{item.status}</p>
      </div>
      <div>
        <strong>{item.waited}</strong>
        <p>waiting</p>
      </div>
      <div>
        <strong>{item.action}</strong>
        <p>next action</p>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

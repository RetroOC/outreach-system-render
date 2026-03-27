import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type Screen = { id: string; eyebrow: string; label: string };

const screens: Screen[] = [
  { id: 'landing', eyebrow: 'Marketing', label: 'Landing page' },
  { id: 'auth', eyebrow: 'Access', label: 'Auth screen' },
  { id: 'onboarding', eyebrow: 'Setup', label: 'Onboarding states' },
  { id: 'import', eyebrow: 'Setup', label: 'Import + mapping states' },
  { id: 'persona', eyebrow: 'Setup', label: 'Persona setup states' },
  { id: 'generation', eyebrow: 'AI', label: 'Generation states' },
  { id: 'workbench', eyebrow: 'Editor', label: 'Sequence workbench' },
  { id: 'overlay', eyebrow: 'Editor', label: 'Modal + dropdown states' },
  { id: 'system', eyebrow: 'UI system', label: 'Empty / success / error' },
];

const navMetrics = [
  { label: 'Coverage', value: '9 views', detail: 'All key product states surfaced' },
  { label: 'Style', value: 'Mono', detail: 'Black / white / gray first' },
  { label: 'Intent', value: 'Reviewable', detail: 'Screenshot-ready over full wiring' },
];

function App() {
  const [active, setActive] = React.useState('landing');

  return (
    <div className="app-shell">
      <aside className="rail">
        <div>
          <div className="brand-mark">N</div>
          <div className="brand-title">Neal Outreach</div>
          <div className="brand-subtitle">Research-led outbound control room</div>
        </div>

        <nav className="screen-nav">
          {screens.map((screen) => (
            <button key={screen.id} className={screen.id === active ? 'screen-link active' : 'screen-link'} onClick={() => setActive(screen.id)}>
              <span>{screen.eyebrow}</span>
              <strong>{screen.label}</strong>
            </button>
          ))}
        </nav>

        <div className="rail-footer">
          <div className="tiny-label">Direction</div>
          <p>Minimal premium SaaS, serious GTM posture, cohesive from landing through operator workbench.</p>
        </div>
      </aside>

      <main className="stage">
        <header className="stage-header">
          <div>
            <div className="tiny-label">Frontend prototype</div>
            <h1>{screens.find((screen) => screen.id === active)?.label}</h1>
          </div>
          <div className="header-actions">
            <button className="ghost-button">Review system</button>
            <button className="primary-button">Open live view</button>
          </div>
        </header>

        <section className="metrics-row">
          {navMetrics.map((metric) => (
            <div className="metric-card" key={metric.label}>
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-detail">{metric.detail}</div>
            </div>
          ))}
        </section>

        <div className="screen-frame">
          {active === 'landing' && <LandingPage />}
          {active === 'auth' && <AuthScreen />}
          {active === 'onboarding' && <OnboardingStates />}
          {active === 'import' && <ImportStates />}
          {active === 'persona' && <PersonaStates />}
          {active === 'generation' && <GenerationStates />}
          {active === 'workbench' && <WorkbenchStates />}
          {active === 'overlay' && <OverlayStates />}
          {active === 'system' && <SystemStates />}
        </div>
      </main>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="landing-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow-pill">Research-led outreach infrastructure</div>
          <h2>Outbound for operators who care what gets sent.</h2>
          <p>
            Neal gives GTM teams a single environment for lead intake, persona definition, sequence construction, inbox control, and reply handling — with the posture of an internal research desk, not a volume machine.
          </p>
          <div className="row-actions">
            <button className="primary-button">Request operator access</button>
            <button className="ghost-button">View product flow</button>
          </div>
        </div>
        <div className="hero-card-stack">
          <div className="hero-card large">
            <div className="tiny-label">Sequence quality</div>
            <strong>Signal-based structure. Human-readable copy. Tight operational control.</strong>
            <div className="hero-grid">
              <StatPill label="Positive replies" value="38" />
              <StatPill label="Healthy inboxes" value="3 / 3" />
              <StatPill label="Suppressed safely" value="112" />
            </div>
          </div>
          <div className="hero-card small muted-panel">
            <span className="tiny-label">Built for</span>
            <strong>Outbound operators, RevOps teams, founders running high-stakes campaigns</strong>
          </div>
        </div>
      </section>

      <section className="landing-grid three">
        <FeatureCard title="Lead intake with discipline" body="Import, map, validate, and segment leads before they touch a sequence." />
        <FeatureCard title="Persona-first sequence design" body="Build around buyer context, triggers, proof, and exclusions instead of copy templates." />
        <FeatureCard title="Reply handling that closes the loop" body="Classify, draft, and route replies without losing operational state." />
      </section>

      <section className="landing-grid two">
        <div className="feature-panel deep">
          <div className="tiny-label">Operator workflow</div>
          <h3>Setup → map → define persona → generate → refine → ship</h3>
          <p>The product is opinionated about sequence quality and calm control. Every major state is visible, from empty and loading to partially configured and at-risk.</p>
        </div>
        <div className="feature-panel">
          <div className="tiny-label">Why it feels different</div>
          <ul className="detail-list compact-list">
            <li><span>Interface</span><strong>Quiet, structured, premium</strong></li>
            <li><span>Workflow</span><strong>Research before generation</strong></li>
            <li><span>Safety</span><strong>Suppression, inbox pacing, auditability</strong></li>
            <li><span>Audience</span><strong>Serious GTM teams, not spray-and-pray senders</strong></li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function AuthScreen() {
  return (
    <div className="center-stage">
      <div className="center-card auth-card split-card">
        <div>
          <div className="eyebrow-pill">Workspace access</div>
          <h2>Enter the control room.</h2>
          <p>Secure access for campaign operators, founders, and RevOps leads running live sending infrastructure.</p>
          <div className="input-stack">
            <label>Work email<input value="gershon@neal.systems" readOnly /></label>
            <label>Password<input value="••••••••••••" readOnly /></label>
          </div>
          <div className="row-actions">
            <button className="ghost-button">Use Google SSO</button>
            <button className="primary-button">Sign in</button>
          </div>
        </div>
        <div className="auth-side muted-panel">
          <div className="tiny-label">Workspace health</div>
          <ul className="detail-list compact-list">
            <li><span>Inboxes connected</span><strong>3</strong></li>
            <li><span>Pending review replies</span><strong>7</strong></li>
            <li><span>Queued leads</span><strong>147</strong></li>
          </ul>
          <div className="status-row">
            <div className="status-chip success">Ready</div>
            <div className="status-chip">2FA enabled</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingStates() {
  return (
    <div className="state-grid two-up">
      <section className="panel">
        <ProgressHeader activeStep={1} />
        <div className="state-card-row">
          <StateCard title="Empty workspace" body="No lead sources added yet. Start by importing a CSV, connecting Apollo, or pasting a list." badge="Empty" />
          <StateCard title="Partially configured" body="Lead source selected, but mapping is incomplete. 2 required fields still missing." badge="Needs work" variant="warning" />
        </div>
      </section>
      <section className="panel">
        <div className="tiny-label">Onboarding progress states</div>
        <div className="progress-stack">
          <ProgressLine label="Lead source" state="Done" tone="done" />
          <ProgressLine label="Field mapping" state="Active" tone="active" />
          <ProgressLine label="Persona setup" state="Waiting" />
          <ProgressLine label="Sequence generation" state="Disabled" tone="disabled" />
        </div>
        <div className="row-actions top-gap">
          <button className="ghost-button">Save for later</button>
          <button className="primary-button">Continue</button>
        </div>
      </section>
    </div>
  );
}

function ImportStates() {
  return (
    <div className="state-grid import-layout">
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="tiny-label">Lead import</div>
            <h3>Source selection</h3>
          </div>
          <div className="status-chip">Step 1</div>
        </div>
        <div className="source-grid">
          <SelectableCard title="CSV upload" detail="Selected · 2,431 rows detected" active />
          <SelectableCard title="Paste rows" detail="Hover state preview" />
          <SelectableCard title="Apollo segment" detail="Disabled until auth" disabled />
          <SelectableCard title="Clay table" detail="Last synced 18m ago" />
        </div>
        <div className="upload-panel mono-panel">
          <div>
            <div className="tiny-label">Selected file</div>
            <strong>q2_revops_targets.csv</strong>
            <p>Detected 6 recognizable columns and 1 custom signal field.</p>
          </div>
          <button className="primary-button">Continue to mapping</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="tiny-label">Field mapping</div>
            <h3>Main and edge states</h3>
          </div>
          <div className="status-chip warning">2 issues</div>
        </div>
        <div className="mapping-table">
          <MappingRow incoming="first_name" target="First name" state="Matched" />
          <MappingRow incoming="company" target="Company" state="Matched" />
          <MappingRow incoming="email" target="Work email" state="Matched" />
          <MappingRow incoming="linkedin" target="Unmapped" state="Required" warning />
          <MappingRow incoming="headcount_bucket" target="Custom field" state="Custom" />
        </div>
      </section>
    </div>
  );
}

function PersonaStates() {
  return (
    <div className="state-grid two-up">
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="tiny-label">Persona definition</div>
            <h3>Configured state</h3>
          </div>
          <div className="status-chip success">Ready</div>
        </div>
        <div className="persona-layout mono-grid">
          <PersonaBlock label="Target persona" value="VP / Head of RevOps at 100–1000 employee B2B SaaS" />
          <PersonaBlock label="Primary pain" value="Scaling outbound quality while SDR volume rises" />
          <PersonaBlock label="Proof" value="31% increase in positive reply rate with tighter research workflows" />
          <PersonaBlock label="Exclude" value="Solo founders, agencies, sub-30 employee companies" muted />
        </div>
      </section>
      <section className="panel muted-panel">
        <div className="panel-header">
          <div>
            <div className="tiny-label">Persona setup</div>
            <h3>Incomplete / no-data state</h3>
          </div>
          <div className="status-chip">Draft</div>
        </div>
        <div className="empty-state small-empty">
          <strong>No proof points added yet</strong>
          <p>Add a concrete result, customer archetype, or operator insight before generating copy.</p>
          <button className="ghost-button">Add proof point</button>
        </div>
      </section>
    </div>
  );
}

function GenerationStates() {
  return (
    <div className="state-grid two-up">
      <section className="panel center-panel">
        <div className="loader-ring" />
        <div className="eyebrow-pill">Generation in progress</div>
        <h3>Building sequence structure</h3>
        <p>Clustering triggers, selecting a framework, and drafting message steps.</p>
        <div className="generation-log wide-log">
          <LogRow text="Imported 2,431 leads and validated required columns" tone="done" />
          <LogRow text="Resolved persona: RevOps operators with active team growth" tone="done" />
          <LogRow text="Drafting step 1 and 2 with trigger-based structure" tone="live" />
          <LogRow text="Preparing fallback variants and objection handling" />
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="tiny-label">Outcome states</div>
            <h3>Success / error coverage</h3>
          </div>
        </div>
        <div className="state-card-row stack">
          <StateCard title="Generation complete" body="4-step sequence produced with one framework recommendation and two variant notes." badge="Success" variant="success" />
          <StateCard title="Generation blocked" body="Insufficient persona proof. Add at least one proof point or customer signal to continue." badge="Error" variant="error" />
          <StateCard title="Disabled" body="Generate button remains off until mapping and persona setup are complete." badge="Disabled" />
        </div>
      </section>
    </div>
  );
}

function WorkbenchStates() {
  return (
    <div className="workbench-shell">
      <aside className="workbench-left">
        <div className="workbench-block">
          <div className="tiny-label">Sequence</div>
          <h3>RevOps operator wedge</h3>
          <div className="status-row wrap">
            <div className="status-chip success">Draft</div>
            <div className="status-chip">4 steps</div>
            <div className="status-chip warning">1 step needs review</div>
          </div>
        </div>
        <div className="workbench-block">
          <div className="list-heading"><span>Lead / persona list</span><span>147</span></div>
          <LeadCard name="Maya Chen" company="Northstar Health" title="VP Revenue Operations" meta="Selected · high fit · hiring 4 SDRs" selected />
          <LeadCard name="Jonas Weber" company="Axiom Cloud" title="Head of Growth" meta="Hover / ready" />
          <LeadCard name="Clara Rossi" company="Helio Finance" title="Director Demand Gen" meta="Partially enriched" muted />
        </div>
      </aside>

      <section className="workbench-center">
        <div className="editor-topbar">
          <div>
            <div className="tiny-label">Sequence workbench</div>
            <h3>Central editor</h3>
          </div>
          <div className="editor-actions">
            <button className="ghost-button small">Preview</button>
            <button className="primary-button small">Approve</button>
          </div>
        </div>
        <div className="step-tabs">
          <button className="step-tab active">Email 01</button>
          <button className="step-tab">Email 02</button>
          <button className="step-tab">Bump</button>
          <button className="step-tab">Break-up</button>
          <button className="step-tab add">＋</button>
        </div>
        <div className="editor-card">
          <div className="editor-field"><span className="tiny-label">Subject</span><strong>Noticed Northstar is building RevOps capacity</strong></div>
          <div className="editor-field body-copy">Maya — saw Northstar is hiring several SDR roles right now, which usually means your RevOps layer is about to absorb a lot of new process load.\n\nWe help teams turn that moment into a cleaner outbound system: research signals, persona-aware sequencing, inbox pacing, and reply handling in one operator workflow.\n\nIf useful, I can show you how similar teams tightened personalization quality without adding manual research overhead.</div>
          <div className="editor-footer"><span>Active</span><span>Selected framework</span><span>Confidence high</span></div>
        </div>
        <div className="composer-card">
          <div className="tiny-label">AI composer</div>
          <div className="chat-bubble user">Tighten paragraph two and make it more founder-sharp.</div>
          <div className="chat-bubble ai">I’d keep the hiring signal, reduce platform language, and emphasize operational leverage.</div>
          <div className="composer-input"><input value="Shorten and sharpen." readOnly /><button className="primary-button small">Send</button></div>
        </div>
      </section>

      <aside className="workbench-right">
        <div className="context-card">
          <div className="tiny-label">Research context</div>
          <h3>Maya Chen</h3>
          <ul className="detail-list compact-list">
            <li><span>Hiring signal</span><strong>4 open SDR roles</strong></li>
            <li><span>Recent theme</span><strong>Attribution drift</strong></li>
            <li><span>Best angle</span><strong>Scale without quality loss</strong></li>
          </ul>
        </div>
        <div className="context-card muted-panel">
          <div className="tiny-label">No-data side state</div>
          <strong>Research still loading for 18 leads</strong>
          <p>Workbench stays usable while context backfills in parallel.</p>
        </div>
      </aside>
    </div>
  );
}

function OverlayStates() {
  return (
    <div className="overlay-shell">
      <div className="workbench-shell subdued">
        <aside className="workbench-left"><div className="workbench-block muted-panel slim-block" /></aside>
        <section className="workbench-center"><div className="editor-card muted-panel large-block" /></section>
        <aside className="workbench-right"><div className="context-card muted-panel slim-block" /></aside>
      </div>
      <div className="modal-backdrop" />
      <div className="overlay-layout">
        <div className="modal-card">
          <div className="panel-header">
            <div>
              <div className="tiny-label">Add step</div>
              <h3>Insert a new sequence step</h3>
            </div>
            <button className="ghost-button small">Close</button>
          </div>
          <div className="modal-grid">
            <SelectableCard title="Email step" detail="Selected state" active />
            <SelectableCard title="Bump" detail="Hover-ready option" />
            <SelectableCard title="Break-up" detail="Available" />
            <SelectableCard title="Manual task" detail="Disabled in auto mode" disabled />
          </div>
          <div className="inline-form">
            <label>Delay<input value="3 days" readOnly /></label>
            <label>Framework<input value="Observation → thesis → invitation" readOnly /></label>
          </div>
        </div>

        <div className="dropdown-card">
          <div className="tiny-label">Framework search</div>
          <label className="search-field">Search<input value="tri" readOnly /></label>
          <div className="dropdown-list">
            <DropdownItem title="Trigger event → relevance → proof" body="Best for signal-based openers" active />
            <DropdownItem title="Observation → thesis → invitation" body="Calm and consultative" />
            <DropdownItem title="Peer benchmark → gap → meeting ask" body="Benchmark-led framing" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemStates() {
  return (
    <div className="state-grid three-up">
      <StateCard title="Empty campaigns" body="No sequences created yet. Start from persona setup or duplicate a prior framework." badge="No data" />
      <StateCard title="Import succeeded" body="2,431 leads imported. 2,308 valid, 123 suppressed or malformed." badge="Success" variant="success" />
      <StateCard title="Connection error" body="Apollo sync failed. Authentication expired and requires reconnect." badge="Error" variant="error" />
      <StateCard title="Button disabled" body="Send test remains unavailable until an inbox is connected and healthy." badge="Disabled" />
      <StateCard title="Partial setup" body="Campaign created, but sequence still lacks approved copy on step 3." badge="Partial" variant="warning" />
      <StateCard title="Empty replies" body="No reply threads yet. Once responses arrive, this area becomes the operator inbox." badge="Empty" />
    </div>
  );
}

function ProgressHeader({ activeStep }: { activeStep: number }) {
  const steps = ['Lead source', 'Field mapping', 'Persona setup', 'Generate'];
  return (
    <div>
      <div className="tiny-label">Setup flow</div>
      <div className="flow-progress top-gap">
        {steps.map((step, index) => {
          const n = index + 1;
          const cls = n < activeStep ? 'progress-item done' : n === activeStep ? 'progress-item active' : 'progress-item';
          return (
            <div className={cls} key={step}>
              <span>{n < activeStep ? '✓' : `0${n}`}</span>
              <strong>{step}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressLine({ label, state, tone }: { label: string; state: string; tone?: 'done' | 'active' | 'disabled' }) {
  return (
    <div className={tone ? `progress-line ${tone}` : 'progress-line'}>
      <strong>{label}</strong>
      <span>{state}</span>
    </div>
  );
}

function StateCard({ title, body, badge, variant }: { title: string; body: string; badge: string; variant?: 'success' | 'error' | 'warning' }) {
  return (
    <div className={variant ? `state-card ${variant}` : 'state-card'}>
      <div className={variant ? `status-chip ${variant}` : 'status-chip'}>{badge}</div>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="feature-panel">
      <div className="tiny-label">Capability</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function SelectableCard({ title, detail, active, disabled }: { title: string; detail: string; active?: boolean; disabled?: boolean }) {
  const cls = disabled ? 'option-card disabled' : active ? 'option-card active' : 'option-card';
  return (
    <div className={cls}>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function MappingRow({ incoming, target, state, warning }: { incoming: string; target: string; state: string; warning?: boolean }) {
  return (
    <div className="mapping-row">
      <div><span className="tiny-label">Incoming</span><strong>{incoming}</strong></div>
      <div className="arrow">→</div>
      <div><span className="tiny-label">Mapped to</span><strong>{target}</strong></div>
      <div className={warning ? 'status-chip warning' : state === 'Matched' ? 'status-chip success' : 'status-chip'}>{state}</div>
    </div>
  );
}

function PersonaBlock({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={muted ? 'persona-block muted' : 'persona-block'}>
      <span className="tiny-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LeadCard({ name, company, title, meta, selected, muted }: { name: string; company: string; title: string; meta: string; selected?: boolean; muted?: boolean }) {
  const cls = muted ? 'lead-card muted' : selected ? 'lead-card selected' : 'lead-card';
  return (
    <div className={cls}>
      <strong>{name}</strong>
      <span>{title}</span>
      <span>{company}</span>
      <div className="lead-meta"><span>{meta}</span></div>
    </div>
  );
}

function DropdownItem({ title, body, active }: { title: string; body: string; active?: boolean }) {
  return (
    <div className={active ? 'dropdown-item active' : 'dropdown-item'}>
      <div>
        <strong>{title}</strong>
        <span>{body}</span>
      </div>
      <span className="tiny-label">↵</span>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LogRow({ text, tone }: { text: string; tone?: 'done' | 'live' }) {
  return (
    <div className="log-row"><span className={tone ? `log-dot ${tone}` : 'log-dot'} />{text}</div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

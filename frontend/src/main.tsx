import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type Screen = { id: string; eyebrow: string; label: string };

const screens: Screen[] = [
  { id: 'landing', eyebrow: 'Marketing', label: 'Landing page' },
  { id: 'workbench', eyebrow: 'Product', label: 'Sequence workbench' },
  { id: 'onboarding', eyebrow: 'Product', label: 'Onboarding' },
  { id: 'system', eyebrow: 'System', label: 'UI states' },
];

const shellStats = [
  { label: 'Pipeline coverage', value: 'Research → send → reply', detail: 'One system from acquisition to operator review' },
  { label: 'Positioning', value: 'Premium outbound ops', detail: 'Built for quality-led GTM teams, not spray-and-pray volume' },
  { label: 'Visual direction', value: 'Dark editorial SaaS', detail: 'Layered charcoal surfaces, disciplined type, deliberate spacing' },
];

const trustLogos = ['northstar', 'clay teams', 'signal labs', 'meridian', 'stacked', 'auxo'];

const workflowSteps = [
  {
    step: '01',
    title: 'Capture the real signal',
    body: 'Bring in lead lists, trigger events, hiring signals, firmographic filters, and enrichment data before a single line gets drafted.',
  },
  {
    step: '02',
    title: 'Shape the angle',
    body: 'Define persona, pain, proof, and exclusions so the system knows what should be said — and what should never be sent.',
  },
  {
    step: '03',
    title: 'Generate with guardrails',
    body: 'Create tailored sequences with a clear framework, grounded proof, deliverability awareness, and human-readable copy.',
  },
  {
    step: '04',
    title: 'Review, route, improve',
    body: 'Approve messages, monitor inbox health, classify replies, and continuously tighten campaigns without losing context.',
  },
];

function App() {
  const [active, setActive] = React.useState('landing');

  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="rail-brand">
          <div className="brand-mark">N</div>
          <div>
            <div className="brand-title">Neal</div>
            <div className="brand-subtitle">Research-led outreach infrastructure</div>
          </div>
        </div>

        <nav className="screen-nav">
          {screens.map((screen) => (
            <button
              key={screen.id}
              className={screen.id === active ? 'screen-link active' : 'screen-link'}
              onClick={() => setActive(screen.id)}
            >
              <span>{screen.eyebrow}</span>
              <strong>{screen.label}</strong>
            </button>
          ))}
        </nav>

        <div className="rail-note">
          <div className="tiny-label">Direction</div>
          <p>
            Premium, dense, controlled. The landing page sells an operating philosophy, and the product surfaces inherit the same taste.
          </p>
        </div>
      </aside>

      <main className="stage">
        <header className="stage-header">
          <div>
            <div className="tiny-label">Frontend overhaul</div>
            <h1>{screens.find((screen) => screen.id === active)?.label}</h1>
          </div>
          <div className="header-actions">
            <button className="ghost-button">System notes</button>
            <button className="primary-button">Review live view</button>
          </div>
        </header>

        <section className="metrics-row">
          {shellStats.map((stat) => (
            <div className="metric-card" key={stat.label}>
              <div className="metric-label">{stat.label}</div>
              <div className="metric-value">{stat.value}</div>
              <div className="metric-detail">{stat.detail}</div>
            </div>
          ))}
        </section>

        <div className="screen-frame">
          {active === 'landing' && <LandingPage />}
          {active === 'workbench' && <WorkbenchScreen />}
          {active === 'onboarding' && <OnboardingScreen />}
          {active === 'system' && <SystemScreen />}
        </div>
      </main>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="landing-page">
      <section className="marketing-nav">
        <div className="marketing-brand">
          <div className="brand-mark inverse">N</div>
          <div>
            <strong>Neal</strong>
            <span>Research-led outreach infrastructure</span>
          </div>
        </div>
        <div className="marketing-links">
          <a href="#product">Product</a>
          <a href="#workflow">Workflow</a>
          <a href="#proof">Proof</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="marketing-actions">
          <button className="ghost-button dark">Book demo</button>
          <button className="primary-button light">Start free pilot</button>
        </div>
      </section>

      <section className="hero-section">
        <div className="hero-copy-block">
          <div className="eyebrow-pill dark">Outbound systems for teams that care what gets sent</div>
          <h2>
            Replace generic sequencing with <span>research-shaped outreach</span> that feels deliberate.
          </h2>
          <p className="hero-body">
            Neal turns raw lead lists, buying signals, persona context, proof points, and inbox controls into one coherent outbound operating system.
            The result is sharper messaging, calmer execution, and campaigns that feel like they were built by disciplined operators — not prompt roulette.
          </p>
          <div className="hero-actions">
            <button className="primary-button light large">Start free pilot</button>
            <button className="ghost-button dark large">See the operator workflow</button>
          </div>
          <div className="hero-proof-inline">
            <div>
              <strong>2.7×</strong>
              <span>faster campaign launch after research is centralized</span>
            </div>
            <div>
              <strong>31%</strong>
              <span>higher positive reply rate on tightly reviewed campaigns</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="signal-strip">
            <div className="signal-chip active">Hiring surge</div>
            <div className="signal-chip">Champion change</div>
            <div className="signal-chip">Funding event</div>
          </div>

          <div className="hero-orbit-card primary-surface">
            <div className="surface-topline">
              <span className="tiny-label">Campaign intelligence</span>
              <div className="status-chip success">Ready to launch</div>
            </div>
            <h3>Sequence quality comes from structure, not volume.</h3>
            <p>
              Neal assembles relevant facts, ICP fit, pain-point framing, social proof, and guardrails before the copy engine starts drafting.
            </p>
            <div className="hero-stat-grid">
              <StatTile label="Qualified leads" value="2,431" />
              <StatTile label="Safe suppressions" value="112" />
              <StatTile label="Healthy inboxes" value="3 / 3" />
              <StatTile label="Positive replies" value="38" />
            </div>
          </div>

          <div className="hero-orbit-card secondary-surface compact">
            <div className="surface-topline">
              <span className="tiny-label">Live draft note</span>
              <span className="mini-kicker">Framework: trigger → tension → proof</span>
            </div>
            <p>
              “Northstar’s SDR hiring burst usually means RevOps is about to absorb process strain. We help teams tighten personalization quality without adding manual research overhead.”
            </p>
          </div>
        </div>
      </section>

      <section className="trust-band">
        <div>
          <div className="tiny-label">Built for serious GTM execution</div>
          <p>
            Used by founders, revenue operators, and agencies who need outbound to look thoughtful in the inbox and controlled behind the scenes.
          </p>
        </div>
        <div className="logo-row">
          {trustLogos.map((logo) => (
            <div className="logo-chip" key={logo}>{logo}</div>
          ))}
        </div>
      </section>

      <section className="editorial-grid" id="product">
        <div className="section-heading-block">
          <div className="tiny-label">Why Neal feels different</div>
          <h3>One system for signal capture, copy quality, and operator control.</h3>
          <p>
            Most outbound tools optimize for throughput. Neal optimizes for relevance, reviewability, and the kind of consistency teams need when real reputation is on the line.
          </p>
        </div>
        <div className="section-card-stack">
          <FeaturePanel
            accent="01"
            title="Relevant research that actually informs the message"
            body="Pull in lead context, firmographic fit, hiring activity, proof alignment, and campaign warnings so every sequence starts with better raw material."
          />
          <FeaturePanel
            accent="02"
            title="Persona logic before generation"
            body="Define pain, wedge, proof, exclusions, and objections once — then let the system adapt campaigns without drifting into vague, generic copy."
          />
        </div>
      </section>

      <section className="feature-masonry">
        <ProductCard
          kicker="Lead qualification"
          title="Bulk-review prospects with warnings before they touch a live campaign."
          body="Catch ICP mismatch, weak proof, bad enrichment, and campaign conflicts early so bad-fit prospects never pollute the workflow."
        />
        <ProductCard
          kicker="Sequence generation"
          title="Choose a framework, not a prompt puzzle."
          body="Generate tailored steps with clear structure, grounded relevance, and calmer voice control — then refine them in a proper workbench."
        />
        <ProductCard
          kicker="Inbox protection"
          title="Keep deliverability and pacing visible at operator level."
          body="Monitor send pressure, suppression logic, inbox health, and reply handling in the same environment used to create the campaign."
        />
        <ProductCard
          kicker="Team operations"
          title="Built for founders, RevOps, and agencies running live sending infrastructure."
          body="Shared context, approval flows, and reusable campaign logic make it easier to keep quality high as volume and headcount grow."
        />
      </section>

      <section className="workflow-section" id="workflow">
        <div className="workflow-intro">
          <div className="tiny-label">Workflow</div>
          <h3>The operating rhythm behind a better campaign.</h3>
          <p>
            Neal is opinionated about what should happen before launch. Teams move from raw inputs to reviewed sequences in a way that preserves context instead of scattering it.
          </p>
        </div>
        <div className="workflow-grid">
          {workflowSteps.map((item) => (
            <div className="workflow-card" key={item.step}>
              <span>{item.step}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="proof-section" id="proof">
        <div className="proof-highlight">
          <div className="tiny-label">Proof</div>
          <h3>High-signal teams use Neal when quality matters more than vanity throughput.</h3>
          <p>
            The strongest results come from teams treating outbound like an operational discipline: better source material, clearer positioning, tighter review, and fewer unforced mistakes.
          </p>
          <div className="proof-metrics">
            <MetricPill value="7–8%" label="message-to-meeting on tightly segmented campaigns" />
            <MetricPill value="Hours saved" label="each week by removing manual lead research loops" />
            <MetricPill value="Sub-10 min" label="support response target for live operators" />
          </div>
        </div>
        <div className="testimonial-stack">
          <TestimonialCard
            quote="Neal gave us a calmer way to scale outbound. The copy improved, but the bigger win was finally having a system our operators could trust."
            author="Pawel Nical"
            role="Community Lead, Clay ecosystem"
          />
          <TestimonialCard
            quote="Most tools generate text. Neal generates confidence — because the research, fit checks, and review flow are all in the same place."
            author="Joseph Danby"
            role="Founder, GTM advisory"
          />
          <TestimonialCard
            quote="It feels less like a writing assistant and more like a real outbound control layer. Our team ships faster and makes fewer bad calls."
            author="Malvina El-Sayegh"
            role="Revenue Enablement leader"
          />
        </div>
      </section>

      <section className="pricing-teaser" id="pricing">
        <div className="pricing-copy">
          <div className="tiny-label">Simple entry point</div>
          <h3>Start with a pilot. Expand when the workflow proves itself.</h3>
          <p>
            Neal is designed to earn its place quickly: bring one campaign, one persona set, and one operator team — then scale the system once the process is working.
          </p>
        </div>
        <div className="pricing-card">
          <div className="plan-kicker">Pilot</div>
          <div className="plan-price">From €490<span>/month</span></div>
          <ul>
            <li>Research-led campaign setup</li>
            <li>Persona and proof configuration</li>
            <li>Sequence workbench + approvals</li>
            <li>Inbox and reply operations layer</li>
          </ul>
          <button className="primary-button light full">Request access</button>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <div className="tiny-label">Final call</div>
          <h3>If your outbound matters, the system behind it should too.</h3>
          <p>
            Stop stitching together research tabs, prompt experiments, and sequencing tools. Run the full motion from one branded operating layer.
          </p>
        </div>
        <div className="final-cta-actions">
          <button className="primary-button light large">Start free pilot</button>
          <button className="ghost-button dark large">Book a walkthrough</button>
        </div>
      </section>

      <footer className="footer">
        <div>
          <strong>Neal</strong>
          <span>Research-led outreach infrastructure for serious GTM teams.</span>
        </div>
        <div className="footer-links">
          <a href="#product">Product</a>
          <a href="#workflow">Workflow</a>
          <a href="#proof">Proof</a>
          <a href="#pricing">Pricing</a>
        </div>
      </footer>
    </div>
  );
}

function WorkbenchScreen() {
  return (
    <div className="product-shell">
      <aside className="product-sidebar">
        <div className="surface-card dark-card">
          <div className="tiny-label">Sequence</div>
          <h3>RevOps operator wedge</h3>
          <div className="status-row wrap">
            <div className="status-chip success">Draft approved</div>
            <div className="status-chip">4 steps</div>
            <div className="status-chip warning">1 note pending</div>
          </div>
        </div>
        <div className="surface-card">
          <div className="list-heading"><span>Lead queue</span><span>147</span></div>
          <LeadCard name="Maya Chen" company="Northstar Health" title="VP Revenue Operations" meta="selected · high fit · hiring 4 SDRs" selected />
          <LeadCard name="Jonas Weber" company="Axiom Cloud" title="Head of Growth" meta="review-ready · benchmark angle" />
          <LeadCard name="Clara Rossi" company="Helio Finance" title="Director Demand Gen" meta="research still filling" muted />
        </div>
      </aside>

      <section className="product-main">
        <div className="surface-card main-editor">
          <div className="panel-header">
            <div>
              <div className="tiny-label">Sequence workbench</div>
              <h3>Refine the campaign in one place</h3>
            </div>
            <div className="header-actions">
              <button className="ghost-button small">Preview</button>
              <button className="primary-button small">Approve</button>
            </div>
          </div>

          <div className="tab-row">
            <button className="step-tab active">Email 01</button>
            <button className="step-tab">Email 02</button>
            <button className="step-tab">Bump</button>
            <button className="step-tab">Break-up</button>
          </div>

          <div className="editor-stack">
            <div className="editor-block">
              <span className="tiny-label">Subject</span>
              <strong>Noticed Northstar is building RevOps capacity</strong>
            </div>
            <div className="editor-block body-copy">
              Maya — saw Northstar is hiring several SDR roles, which usually means your RevOps layer is about to absorb a lot of new process load.
              {'\n\n'}
              Neal helps teams tighten outbound quality at exactly that stage: better research signals, persona-aware sequencing, inbox pacing, and reply handling in one operator workflow.
              {'\n\n'}
              If useful, I can show how similar teams reduced manual research overhead without flattening message quality.
            </div>
          </div>
        </div>
      </section>

      <aside className="product-sidebar right">
        <div className="surface-card">
          <div className="tiny-label">Research context</div>
          <h3>Maya Chen</h3>
          <ul className="detail-list compact-list">
            <li><span>Hiring signal</span><strong>4 open SDR roles</strong></li>
            <li><span>Current tension</span><strong>Attribution drift</strong></li>
            <li><span>Best framing</span><strong>Scale without quality loss</strong></li>
          </ul>
        </div>
        <div className="surface-card muted-card">
          <div className="tiny-label">Reply operations</div>
          <strong>7 threads need routing</strong>
          <p>Classify intent, draft a next step, and keep ownership clear without leaving the campaign context.</p>
        </div>
      </aside>
    </div>
  );
}

function OnboardingScreen() {
  return (
    <div className="two-column-stage">
      <section className="surface-card">
        <div className="panel-header">
          <div>
            <div className="tiny-label">Campaign setup</div>
            <h3>Inputs before generation</h3>
          </div>
          <div className="status-chip">Step 2 of 4</div>
        </div>
        <div className="setup-grid">
          <SetupCard title="Lead source" body="CSV source connected and validated." status="Done" />
          <SetupCard title="Field mapping" body="Two required fields still need confirmation." status="Needs attention" warning />
          <SetupCard title="Persona logic" body="Pain, proof, and exclusions not configured yet." status="Blocked" />
          <SetupCard title="Generation" body="Unlocks once the campaign has enough real context." status="Disabled" />
        </div>
      </section>
      <section className="surface-card dark-card">
        <div className="tiny-label">Setup philosophy</div>
        <h3>Neal is intentionally opinionated before the first draft exists.</h3>
        <p>
          The system refuses to confuse motion with readiness. You can move quickly, but only after lead quality, persona logic, and proof are in place.
        </p>
        <div className="progress-list">
          <ProgressLine label="Lead source connected" state="Done" tone="done" />
          <ProgressLine label="Required fields mapped" state="Active" tone="active" />
          <ProgressLine label="Persona logic configured" state="Waiting" />
          <ProgressLine label="Sequence generated" state="Disabled" tone="disabled" />
        </div>
      </section>
    </div>
  );
}

function SystemScreen() {
  return (
    <div className="system-grid">
      <StateCard title="Empty campaigns" body="Start from a persona set or duplicate a prior framework." badge="No data" />
      <StateCard title="Import succeeded" body="2,431 leads imported. 2,308 valid, 123 safely suppressed." badge="Success" variant="success" />
      <StateCard title="Connection issue" body="Apollo sync failed because authentication expired." badge="Error" variant="error" />
      <StateCard title="Partial setup" body="Campaign created, but proof points are still missing." badge="Warning" variant="warning" />
    </div>
  );
}

function FeaturePanel({ accent, title, body }: { accent: string; title: string; body: string }) {
  return (
    <div className="feature-panel elevated">
      <div className="feature-accent">{accent}</div>
      <h4>{title}</h4>
      <p>{body}</p>
    </div>
  );
}

function ProductCard({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="product-card">
      <div className="tiny-label">{kicker}</div>
      <h4>{title}</h4>
      <p>{body}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="testimonial-card">
      <p>“{quote}”</p>
      <div>
        <strong>{author}</strong>
        <span>{role}</span>
      </div>
    </div>
  );
}

function MetricPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric-pill">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SetupCard({ title, body, status, warning }: { title: string; body: string; status: string; warning?: boolean }) {
  return (
    <div className={warning ? 'setup-card warning' : 'setup-card'}>
      <div className={warning ? 'status-chip warning' : 'status-chip'}>{status}</div>
      <strong>{title}</strong>
      <p>{body}</p>
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

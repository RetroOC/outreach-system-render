import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type NavItem = { label: string; href: string };
type Feature = { eyebrow: string; title: string; body: string };
type WorkflowStep = { step: string; title: string; body: string };
type StoryCard = { id: string; label: string; title: string; summary: string; metrics: { label: string; value: string }[]; bullets: string[] };
type UseCase = { name: string; title: string; body: string; points: string[] };

const navItems: NavItem[] = [
  { label: 'Product', href: '#product' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Teams', href: '#teams' },
  { label: 'Pricing', href: '#pricing' },
];

const features: Feature[] = [
  {
    eyebrow: 'Research-led generation',
    title: 'The message is only as good as the context behind it.',
    body: 'Neal turns live signals, fit logic, case proof, and operator judgment into reusable campaign inputs so outbound starts from substance instead of guesswork.',
  },
  {
    eyebrow: 'Operator control',
    title: 'Designed for teams that care what actually gets sent.',
    body: 'Review states, pacing controls, health indicators, and reply routing stay visible from setup to launch instead of being hidden behind a copy generator.',
  },
  {
    eyebrow: 'Reusable systems',
    title: 'Build a repeatable motion without turning the workflow brittle.',
    body: 'Carry forward frameworks, proof libraries, exclusions, and positioning rules without stacking prompts and disconnected docs across the team.',
  },
];

const workflow: WorkflowStep[] = [
  {
    step: '01',
    title: 'Collect real context',
    body: 'Lead sources, hiring signals, firmographics, enrichment, and proof points are assembled before copy generation begins.',
  },
  {
    step: '02',
    title: 'Define the angle',
    body: 'Set persona tension, exclusions, positioning, and proof so every campaign has a clear strategic frame.',
  },
  {
    step: '03',
    title: 'Generate inside guardrails',
    body: 'Draft tailored outreach with rationale attached, strong reviewability, and visible constraints for operators.',
  },
  {
    step: '04',
    title: 'Run and refine live',
    body: 'Approve, launch, route replies, and improve performance without breaking the chain of context across tools.',
  },
];

const storyCards: StoryCard[] = [
  {
    id: 'signals',
    label: 'Signal intelligence',
    title: 'See why an account belongs in the sequence before writing to it.',
    summary: 'A live research surface that pulls together fit, timing, champion movement, and proof alignment in one operator view.',
    metrics: [
      { label: 'Qualified accounts', value: '148' },
      { label: 'Proof match score', value: '91%' },
      { label: 'Warnings resolved', value: '23' },
    ],
    bullets: ['Hiring surge detected', 'Champion changed 19 days ago', 'Relevant proof: 2 RevOps case studies'],
  },
  {
    id: 'workbench',
    label: 'Sequence workbench',
    title: 'Shape the message while the reasoning stays attached.',
    summary: 'Drafting, approvals, pacing, and framework logic sit in one deliberate composition rather than in separate tools and tabs.',
    metrics: [
      { label: 'Steps generated', value: '4' },
      { label: 'Approval status', value: 'Ready' },
      { label: 'Reply trend', value: '+31%' },
    ],
    bullets: ['Framework: trigger → tension → proof', 'Sending pressure within safe range', 'Review required before launch'],
  },
  {
    id: 'ops',
    label: 'Reply operations',
    title: 'Run the live outbound motion without losing quality control.',
    summary: 'Classify replies, assign owners, suppress risk, and keep inbox operations tied to the exact campaign context that created them.',
    metrics: [
      { label: 'Threads awaiting route', value: '7' },
      { label: 'Avg. triage time', value: '08m' },
      { label: 'Inbox health', value: 'Stable' },
    ],
    bullets: ['Intent classification active', 'Owner handoff rules applied', 'Suppression changes synced'],
  },
];

const useCases: UseCase[] = [
  {
    name: 'Founders',
    title: 'Launch targeted outbound without building a brittle stack.',
    body: 'Move from rough lead sources to credible outreach quickly while keeping quality high from the first campaign onward.',
    points: ['Sharper first campaigns', 'Less manual research drag', 'Clearer positioning discipline'],
  },
  {
    name: 'RevOps teams',
    title: 'Standardize quality across operators, inboxes, and campaigns.',
    body: 'Keep fit checks, message frameworks, pacing, and reply handling consistent as more people touch the motion.',
    points: ['Shared campaign logic', 'Safer launch controls', 'Less performance drift'],
  },
  {
    name: 'Agencies',
    title: 'Deliver premium outbound execution clients can actually trust.',
    body: 'Give every account a research-backed workflow, cleaner approvals, and a more convincing operational surface.',
    points: ['Faster client review', 'Reusable proof systems', 'Higher-quality deliverables'],
  },
];

const testimonials = [
  {
    quote: 'Neal made our outbound feel intentional again. The win was not just better copy — it was better judgment built into the workflow.',
    author: 'Pawel Nical',
    role: 'Community Lead, Clay ecosystem',
  },
  {
    quote: 'It feels closer to a control layer than a writing tool. Research, review, and live operations finally sit in the same product.',
    author: 'Joseph Danby',
    role: 'Founder, GTM advisory',
  },
  {
    quote: 'You can tell this was designed for teams who care about reputation, not vanity volume. That difference shows up everywhere.',
    author: 'Malvina El-Sayegh',
    role: 'Revenue Enablement leader',
  },
];

const logos = ['Northstar', 'Meridian', 'Atlas GTM', 'Signal Labs', 'Auxo', 'Stacked'];

function useReveal() {
  React.useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.14 }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
}

function App() {
  const [activeStory, setActiveStory] = React.useState(storyCards[0].id);
  const [activeUseCase, setActiveUseCase] = React.useState(0);
  const currentStory = storyCards.find((item) => item.id === activeStory) ?? storyCards[0];

  useReveal();

  return (
    <div className="site-shell">
      <div className="orb orb-a" />
      <div className="orb orb-b" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Neal home">
          <span className="brand-mark">N</span>
          <span className="brand-text">
            <strong>Neal</strong>
            <em>Research-led outreach infrastructure</em>
          </span>
        </a>

        <nav className="nav">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="topbar-actions">
          <a className="ghost-link" href="#footer">
            Login
          </a>
          <a className="button button-primary" href="#cta">
            Book demo
          </a>
        </div>
      </header>

      <main className="page" id="top">
        <section className="hero-panel reveal" data-reveal>
          <div className="hero-copy">
            <div className="eyebrow">Premium outbound systems for quality-led teams</div>
            <h1>
              Relevant outreach built from <span>real research</span>, not templates.
            </h1>
            <p className="hero-lede">
              Neal gives serious GTM teams one elegant operating layer for signal capture, message strategy, approvals, inbox health, and live reply operations.
            </p>

            <div className="hero-actions">
              <a className="button button-primary button-large" href="#pricing">
                Start with a pilot
              </a>
              <a className="button button-secondary button-large" href="#product">
                See product story
              </a>
            </div>

            <div className="hero-proof-row">
              <div className="mini-proof">
                <strong>2.7×</strong>
                <span>faster campaign setup once research is centralized</span>
              </div>
              <div className="mini-proof">
                <strong>31%</strong>
                <span>higher positive reply rate on tightly reviewed campaigns</span>
              </div>
              <div className="mini-proof">
                <strong>End-to-end</strong>
                <span>research, drafting, approvals, and reply handling in one system</span>
              </div>
            </div>
          </div>

          <div className="hero-stage">
            <div className="hero-stack">
              <div className="product-frame frame-primary">
                <FrameHeader title="Outbound control tower" label="Live campaign" />
                <div className="frame-grid">
                  <div className="data-cluster wide">
                    <span className="cluster-label">Campaign thesis</span>
                    <p>
                      Northstar is hiring four SDRs while headcount stays flat in RevOps — strong indicator that process strain is rising before pipeline quality does.
                    </p>
                  </div>
                  <StatCard value="2,431" label="Qualified leads" />
                  <StatCard value="112" label="Safe suppressions" />
                  <StatCard value="Ready" label="Launch state" />
                  <StatCard value="38" label="Positive replies" />
                </div>
              </div>

              <div className="product-frame frame-secondary left">
                <FrameHeader title="Signal queue" label="Priority" compact />
                <div className="list-card">
                  <QueueRow name="Maya Chen" meta="high fit · hiring surge" strong />
                  <QueueRow name="Jonas Weber" meta="champion changed · ready" />
                  <QueueRow name="Clara Rossi" meta="proof missing · hold" muted />
                </div>
              </div>

              <div className="product-frame frame-secondary right">
                <FrameHeader title="Reply routing" label="Ops" compact />
                <div className="ops-card">
                  <span className="intent-pill">Intent: interested</span>
                  <strong>7 threads need routing</strong>
                  <p>Assign owner, draft the next step, and protect sending quality from the same surface.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip reveal" data-reveal>
          <div>
            <div className="eyebrow subtle">Trusted by serious GTM operators</div>
            <p>
              Built for founders, revenue teams, and agencies that need outbound to feel credible in the inbox and controlled behind the scenes.
            </p>
          </div>
          <div className="logo-row">
            {logos.map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>
        </section>

        <section className="editorial-band reveal" data-reveal>
          <div className="section-intro split-intro">
            <div>
              <div className="eyebrow">Why Neal exists</div>
              <h2>Most outbound systems optimize for throughput. The best teams need relevance, reviewability, and control.</h2>
            </div>
            <p>
              When research is weak, the message gets generic. When execution is fragmented, quality slips at launch. Neal is built to solve both problems at the same time.
            </p>
          </div>

          <div className="contrast-showcase">
            <article className="contrast-card muted-card">
              <span>Generic template</span>
              <strong>Low-signal intro. Weak proof. Easy to ignore.</strong>
              <p>Most tools generate passable copy over incomplete context and hope volume covers the quality problem.</p>
            </article>
            <article className="contrast-card accent-card">
              <span>Research-shaped draft</span>
              <strong>Specific trigger, clear tension, relevant proof, visible review state.</strong>
              <p>Neal keeps the source material, strategic angle, and operator guardrails attached all the way to send.</p>
            </article>
          </div>
        </section>

        <section className="feature-grid reveal" data-reveal>
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span className="eyebrow subtle">{feature.eyebrow}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="workflow-section reveal" data-reveal id="workflow">
          <div className="section-intro narrow">
            <div className="eyebrow">How it works</div>
            <h2>A better outbound motion starts before the first draft exists.</h2>
          </div>

          <div className="workflow-rail">
            {workflow.map((item) => (
              <article className="workflow-step" key={item.step}>
                <span className="step-index">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="product-story reveal" data-reveal id="product">
          <div className="section-intro story-intro">
            <div>
              <div className="eyebrow">Product story</div>
              <h2>Not a brochure mockup — a product narrative with real states, pacing, and operational depth.</h2>
            </div>
            <p>
              Move through the workflow and see how Neal handles research, drafting, and live operations in one coherent interface system.
            </p>
          </div>

          <div className="story-layout">
            <div className="story-nav">
              {storyCards.map((item) => (
                <button
                  key={item.id}
                  className={item.id === activeStory ? 'story-tab active' : 'story-tab'}
                  onClick={() => setActiveStory(item.id)}
                >
                  <span>{item.label}</span>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </button>
              ))}
            </div>

            <div className="story-stage">
              <div className="product-frame story-frame">
                <FrameHeader title={currentStory.label} label="Operator view" />
                <div className="story-body">
                  <aside className="story-sidebar">
                    <div>
                      <span className="sidebar-kicker">Current state</span>
                      <h3>{currentStory.title}</h3>
                    </div>
                    <ul>
                      {currentStory.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </aside>

                  <div className="story-canvas">
                    <div className="story-metrics">
                      {currentStory.metrics.map((metric) => (
                        <StatCard key={metric.label} value={metric.value} label={metric.label} />
                      ))}
                    </div>

                    <div className="canvas-shell">
                      <div className="canvas-topline">
                        <strong>{currentStory.summary}</strong>
                        <span className="live-state">Live view</span>
                      </div>
                      <div className="canvas-panels">
                        <div className="canvas-panel tall" />
                        <div className="canvas-panel short" />
                        <div className="canvas-panel short dim" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="teams-section reveal" data-reveal id="teams">
          <div className="section-intro split-intro">
            <div>
              <div className="eyebrow">Who it is for</div>
              <h2>Built for teams that treat outbound like an operating discipline.</h2>
            </div>
            <p>
              Different teams use Neal differently, but the value stays the same: better source material, more control, and stronger consistency.
            </p>
          </div>

          <div className="teams-layout">
            <div className="team-tabs">
              {useCases.map((item, index) => (
                <button
                  key={item.name}
                  className={index === activeUseCase ? 'team-tab active' : 'team-tab'}
                  onClick={() => setActiveUseCase(index)}
                >
                  <span>{item.name}</span>
                  <strong>{item.title}</strong>
                </button>
              ))}
            </div>

            <div className="team-detail">
              <span className="eyebrow subtle">{useCases[activeUseCase].name}</span>
              <h3>{useCases[activeUseCase].title}</h3>
              <p>{useCases[activeUseCase].body}</p>
              <ul>
                {useCases[activeUseCase].points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="testimonial-section reveal" data-reveal>
          <div className="section-intro narrow">
            <div className="eyebrow">Social proof</div>
            <h2>High-signal teams use Neal when quality matters more than vanity volume.</h2>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article className="testimonial-card" key={item.author}>
                <p>“{item.quote}”</p>
                <div>
                  <strong>{item.author}</strong>
                  <span>{item.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pricing-section reveal" data-reveal id="pricing">
          <div className="pricing-copy">
            <div className="eyebrow">Pricing</div>
            <h2>Start with a pilot. Expand once the workflow proves itself.</h2>
            <p>
              Bring one campaign, one persona set, and one operator team. Neal is designed to earn its place quickly before you scale the motion further.
            </p>
          </div>

          <div className="pricing-card premium-card">
            <span className="eyebrow subtle">Pilot</span>
            <div className="price-row">
              <strong>From €490</strong>
              <span>/month</span>
            </div>
            <ul>
              <li>Research-led campaign setup</li>
              <li>Persona and proof configuration</li>
              <li>Sequence workbench with approvals</li>
              <li>Inbox and reply operations layer</li>
            </ul>
            <a className="button button-primary button-large full-width" href="#cta">
              Request access
            </a>
          </div>
        </section>

        <section className="cta-section reveal" data-reveal id="cta">
          <div>
            <div className="eyebrow">Final CTA</div>
            <h2>If your outbound matters, the system behind it should too.</h2>
            <p>
              Stop stitching together research tabs, prompt experiments, and sequencing tools. Run the motion from one premium operating layer.
            </p>
          </div>
          <div className="hero-actions">
            <a className="button button-primary button-large" href="#top">
              Book demo
            </a>
            <a className="button button-secondary button-large" href="#product">
              Explore product
            </a>
          </div>
        </section>
      </main>

      <footer className="footer" id="footer">
        <div className="footer-brand">
          <a className="brand" href="#top">
            <span className="brand-mark">N</span>
            <span className="brand-text">
              <strong>Neal</strong>
              <em>Research-led outreach infrastructure</em>
            </span>
          </a>
          <p>Premium outbound systems for founders, RevOps teams, and agencies that care what gets sent.</p>
        </div>

        <div className="footer-columns">
          <div>
            <span>Explore</span>
            <a href="#product">Product</a>
            <a href="#workflow">Workflow</a>
            <a href="#teams">Teams</a>
          </div>
          <div>
            <span>Company</span>
            <a href="#pricing">Pricing</a>
            <a href="#cta">Book demo</a>
            <a href="#top">Login</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FrameHeader({ title, label, compact }: { title: string; label: string; compact?: boolean }) {
  return (
    <div className={compact ? 'frame-header compact' : 'frame-header'}>
      <div className="header-dots">
        <span />
        <span />
        <span />
      </div>
      <strong>{title}</strong>
      <em>{label}</em>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function QueueRow({ name, meta, strong, muted }: { name: string; meta: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={muted ? 'queue-row muted' : strong ? 'queue-row active' : 'queue-row'}>
      <strong>{name}</strong>
      <span>{meta}</span>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

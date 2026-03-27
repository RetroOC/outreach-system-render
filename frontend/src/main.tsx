import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type ProofPanel = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  insight: string;
  metrics: { label: string; value: string }[];
  notes: string[];
};

type UseCase = {
  title: string;
  body: string;
  badge: string;
  outcomes: string[];
};

const trustLogos = ['Northstar', 'Meridian', 'Stacked', 'Signal Labs', 'Atlas GTM', 'Auxo'];

const breakdownCards = [
  {
    title: 'Templates flatten the signal',
    body: 'Most outbound tools treat everyone like the same prospect with a few merge tags attached. The result is generic copy that feels obviously automated.',
  },
  {
    title: 'Research lives in the wrong place',
    body: 'Context gets scattered across tabs, enrichment tools, notes, and docs — so the actual campaign is built on partial memory instead of grounded inputs.',
  },
  {
    title: 'Operators lose control at launch',
    body: 'Without review layers, pacing visibility, and reply routing, quality degrades the moment the campaign leaves strategy and hits live sending.',
  },
];

const workflowSteps = [
  {
    step: '01',
    title: 'Collect real context',
    body: 'Lead lists, hiring signals, firmographics, enrichment, and proof points come together before the first draft exists.',
  },
  {
    step: '02',
    title: 'Define the angle',
    body: 'Set persona tension, exclusions, proof, and positioning so every campaign is shaped by strategy instead of prompt improvisation.',
  },
  {
    step: '03',
    title: 'Generate inside guardrails',
    body: 'Draft tailored outreach with framework-level structure, consistent voice, and clear operator visibility into why each message exists.',
  },
  {
    step: '04',
    title: 'Review and improve live',
    body: 'Approve campaigns, monitor inbox health, route replies, and refine performance without breaking context across tools.',
  },
];

const valueCards = [
  {
    kicker: 'Research-led generation',
    title: 'Relevant outreach starts with better source material.',
    body: 'Neal turns signals, proof, and persona logic into reusable campaign inputs so the system drafts from substance instead of guesswork.',
  },
  {
    kicker: 'Operator confidence',
    title: 'A premium workflow for people who care what gets sent.',
    body: 'Review states, warnings, pacing controls, and reply operations stay visible throughout the motion — not hidden behind a copy generator.',
  },
  {
    kicker: 'Reusable systems',
    title: 'Build once, refine continuously.',
    body: 'Carry forward frameworks, positioning rules, and team-wide playbooks without turning the product into a maze of brittle prompts.',
  },
];

const proofPanels: ProofPanel[] = [
  {
    id: 'research',
    label: 'Research cockpit',
    title: 'See the inputs before the copy.',
    subtitle: 'Qualification, proof, and timing signals in one command surface.',
    insight: 'The page feels alive because the product proof is interactive: switch views, inspect details, and see how the system thinks.',
    metrics: [
      { label: 'High-fit prospects', value: '148' },
      { label: 'Warnings resolved', value: '23' },
      { label: 'Proof match score', value: '91%' },
    ],
    notes: ['Hiring surge detected', 'Champion changed 19 days ago', 'Relevant proof: 2 RevOps case studies'],
  },
  {
    id: 'sequence',
    label: 'Sequence workbench',
    title: 'Shape the message with context still attached.',
    subtitle: 'Framework-driven drafting with review states, pacing, and rationale.',
    insight: 'Instead of a dead mockup, the workbench behaves like a real product window with tabs, metadata, and active states.',
    metrics: [
      { label: 'Steps generated', value: '4' },
      { label: 'Positive reply trend', value: '+31%' },
      { label: 'Approval status', value: 'Ready' },
    ],
    notes: ['Framework: trigger → tension → proof', 'Inbox pressure within safe range', 'Reply routing enabled'],
  },
  {
    id: 'operations',
    label: 'Reply operations',
    title: 'Run the live workflow without losing the thread.',
    subtitle: 'Classify replies, assign owners, and protect sending quality from the same layer.',
    insight: 'This anchors the premium SaaS feel: the system is not just for drafting copy — it manages the outbound motion end to end.',
    metrics: [
      { label: 'Threads awaiting route', value: '7' },
      { label: 'Avg. triage time', value: '08m' },
      { label: 'Inbox health', value: 'Stable' },
    ],
    notes: ['Intent classification active', 'Owner handoff rules applied', 'Suppression changes synced'],
  },
];

const useCases: UseCase[] = [
  {
    badge: 'Founders',
    title: 'Launch targeted outbound without building a brittle stack.',
    body: 'Use Neal to move from raw lead sources to credible outreach faster, while keeping message quality high from the start.',
    outcomes: ['Sharper first campaigns', 'Less manual research drag', 'Clearer positioning discipline'],
  },
  {
    badge: 'RevOps teams',
    title: 'Standardize quality across operators and inboxes.',
    body: 'Keep fit checks, frameworks, pacing, and reply handling consistent as more people touch the outbound machine.',
    outcomes: ['Shared campaign logic', 'Safer launch controls', 'Less performance drift'],
  },
  {
    badge: 'Agencies',
    title: 'Deliver premium outbound execution clients can actually trust.',
    body: 'Give every account a research-backed workflow, cleaner approvals, and more confidence in what reaches the inbox.',
    outcomes: ['Faster client review', 'Reusable proof systems', 'Higher-quality deliverables'],
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

function useReveal() {
  React.useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.16 }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
}

function App() {
  const [activePanel, setActivePanel] = React.useState(proofPanels[0].id);
  const [activeUseCase, setActiveUseCase] = React.useState(0);
  const currentPanel = proofPanels.find((panel) => panel.id === activePanel) ?? proofPanels[0];

  useReveal();

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePanel((current) => {
        const index = proofPanels.findIndex((panel) => panel.id === current);
        return proofPanels[(index + 1) % proofPanels.length].id;
      });
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="page-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <header className="site-nav">
        <a className="brand" href="#top">
          <span className="brand-mark">N</span>
          <span className="brand-copy">
            <strong>Neal</strong>
            <em>Research-led outreach infrastructure</em>
          </span>
        </a>
        <nav className="nav-links">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="#use-cases">Use cases</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-actions">
          <a className="text-link" href="#footer">Login</a>
          <a className="button primary" href="#final-cta">Book demo</a>
        </div>
      </header>

      <main className="landing" id="top">
        <section className="hero section reveal" data-reveal>
          <div className="hero-copy">
            <div className="eyebrow">Premium outbound systems for quality-led teams</div>
            <h1>
              Relevant outreach, built from <span>real research</span> — not templates.
            </h1>
            <p className="lede">
              Neal turns live buying signals, persona logic, proof, and review controls into one elegant outbound operating layer. The result is messaging that feels deliberate — and a workflow operators can actually trust.
            </p>
            <div className="hero-actions">
              <a className="button primary large" href="#pricing">Start with a pilot</a>
              <a className="button secondary large" href="#product-proof">See product proof</a>
            </div>
            <div className="hero-stats">
              <Stat value="2.7×" label="faster campaign setup once research is centralized" />
              <Stat value="31%" label="higher positive reply rate on tightly reviewed campaigns" />
              <Stat value="3/3" label="healthy inboxes visible in one operator view" />
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-tags">
              <span className="tag active">Hiring surge</span>
              <span className="tag">Champion change</span>
              <span className="tag">Funding event</span>
            </div>

            <div className="window hero-window main-window">
              <WindowChrome title="Campaign intelligence" />
              <div className="window-body">
                <div className="mini-grid">
                  <Metric value="2,431" label="Qualified leads" />
                  <Metric value="112" label="Safe suppressions" />
                  <Metric value="38" label="Positive replies" />
                  <Metric value="Ready" label="Launch state" />
                </div>
                <div className="message-preview">
                  <div className="pill-row">
                    <span className="pill">Research complete</span>
                    <span className="pill">Framework locked</span>
                    <span className="pill">Inbox safe</span>
                  </div>
                  <p>
                    “Northstar’s SDR hiring burst usually means RevOps is about to absorb more process load. Neal helps teams improve personalization quality without adding manual research overhead.”
                  </p>
                </div>
              </div>
            </div>

            <div className="stacked-shot shot-left">
              <WindowChrome title="Lead queue" compact />
              <div className="stacked-list">
                <Lead name="Maya Chen" meta="high fit · hiring 4 SDRs" selected />
                <Lead name="Jonas Weber" meta="benchmark angle · ready" />
                <Lead name="Clara Rossi" meta="proof missing · hold" muted />
              </div>
            </div>

            <div className="stacked-shot shot-right">
              <WindowChrome title="Reply routing" compact />
              <div className="reply-box">
                <span className="route">Intent: interested</span>
                <strong>7 threads need routing</strong>
                <p>Assign owner, draft next step, and protect sending quality from the same surface.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-band section reveal" data-reveal>
          <div>
            <div className="eyebrow">Trusted by serious GTM operators</div>
            <p>
              Built for founders, revenue teams, and agencies who need outbound to feel thoughtful in the inbox and controlled behind the scenes.
            </p>
          </div>
          <div className="trust-logos">
            {trustLogos.map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>
        </section>

        <section className="problem section reveal" data-reveal>
          <div className="section-heading">
            <div className="eyebrow">The problem</div>
            <h2>Most outbound systems optimize for throughput. The best teams need relevance, reviewability, and control.</h2>
            <p>
              When research is weak, the message gets generic. When execution is fragmented, quality slips at launch. Neal is built to solve both problems at once.
            </p>
          </div>
          <div className="problem-shot window editorial-shot">
            <WindowChrome title="Message audit" />
            <div className="audit-grid">
              <div className="audit-card danger">
                <strong>Generic template</strong>
                <p>Low-signal intro. No specific trigger. Weak proof alignment.</p>
              </div>
              <div className="audit-card success">
                <strong>Research-shaped draft</strong>
                <p>Hiring context, persona tension, and relevant case proof all present before send.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="breakdown section reveal" data-reveal>
          {breakdownCards.map((card, index) => (
            <article className="breakdown-card" key={card.title} style={{ animationDelay: `${index * 80}ms` }}>
              <span className="card-index">0{index + 1}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </section>

        <section className="how-it-works section reveal" data-reveal id="how-it-works">
          <div className="section-heading narrow">
            <div className="eyebrow">How it works</div>
            <h2>A better outbound motion starts before the first draft exists.</h2>
          </div>
          <div className="workflow-grid">
            {workflowSteps.map((step) => (
              <article className="workflow-card" key={step.step}>
                <span className="step-no">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="value-section section reveal" data-reveal id="product">
          <div className="section-heading">
            <div className="eyebrow">Product value</div>
            <h2>One system for signal capture, copy quality, and operator control.</h2>
            <p>
              Neal brings together the parts that usually live in separate tools: qualification, positioning logic, generation, approvals, inbox health, and reply operations.
            </p>
          </div>
          <div className="value-layout">
            <div className="value-cards">
              {valueCards.map((card) => (
                <article className="value-card" key={card.title}>
                  <span className="eyebrow small">{card.kicker}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
            <div className="window value-shot">
              <WindowChrome title="Campaign setup" />
              <div className="setup-panel">
                <div className="setup-step done"><span>Lead source connected</span><em>Done</em></div>
                <div className="setup-step active"><span>Persona logic configured</span><em>Active</em></div>
                <div className="setup-step"><span>Proof matched to segment</span><em>Waiting</em></div>
                <div className="setup-step dim"><span>Generation unlocked</span><em>Pending</em></div>
              </div>
            </div>
          </div>
        </section>

        <section className="proof section reveal" data-reveal id="product-proof">
          <div className="proof-copy">
            <div className="eyebrow">Workflow / product proof</div>
            <h2>Screenshot-heavy, interactive, and grounded in a real workflow.</h2>
            <p>
              Switch between product states to explore how Neal handles research, drafting, and live reply operations. The page should feel like a living product, not a static brochure.
            </p>
            <div className="proof-tabs">
              {proofPanels.map((panel) => (
                <button
                  key={panel.id}
                  className={panel.id === activePanel ? 'proof-tab active' : 'proof-tab'}
                  onClick={() => setActivePanel(panel.id)}
                >
                  {panel.label}
                </button>
              ))}
            </div>
            <div className="insight-box">
              <strong>{currentPanel.title}</strong>
              <p>{currentPanel.insight}</p>
            </div>
          </div>

          <div className="proof-stage">
            <div className="window product-window interactive-window">
              <WindowChrome title={currentPanel.label} />
              <div className="product-body">
                <div className="product-sidebar">
                  <span className="eyebrow small">{currentPanel.subtitle}</span>
                  <ul>
                    {currentPanel.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
                <div className="product-canvas">
                  <div className="canvas-header">
                    <strong>{currentPanel.title}</strong>
                    <span className="live-dot">Live view</span>
                  </div>
                  <div className="canvas-metrics">
                    {currentPanel.metrics.map((metric) => (
                      <Metric key={metric.label} value={metric.value} label={metric.label} />
                    ))}
                  </div>
                  <div className="canvas-card-stack">
                    <div className="canvas-card large" />
                    <div className="canvas-card medium" />
                    <div className="canvas-card small" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="use-cases section reveal" data-reveal id="use-cases">
          <div className="section-heading narrow">
            <div className="eyebrow">Use cases</div>
            <h2>Built for teams that treat outbound like an operating discipline.</h2>
          </div>
          <div className="use-case-layout">
            <div className="use-case-tabs">
              {useCases.map((item, index) => (
                <button
                  key={item.title}
                  className={index === activeUseCase ? 'use-case-tab active' : 'use-case-tab'}
                  onClick={() => setActiveUseCase(index)}
                >
                  <span>{item.badge}</span>
                  <strong>{item.title}</strong>
                </button>
              ))}
            </div>
            <div className="window use-case-shot">
              <WindowChrome title={useCases[activeUseCase].badge} />
              <div className="use-case-detail">
                <h3>{useCases[activeUseCase].title}</h3>
                <p>{useCases[activeUseCase].body}</p>
                <ul>
                  {useCases[activeUseCase].outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonials section reveal" data-reveal>
          <div className="section-heading narrow">
            <div className="eyebrow">Proof / testimonials</div>
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

        <section className="pricing section reveal" data-reveal id="pricing">
          <div className="pricing-copy">
            <div className="eyebrow">Pricing teaser</div>
            <h2>Start with a pilot. Expand once the workflow proves itself.</h2>
            <p>
              Bring one campaign, one persona set, and one operator team. Neal is designed to earn its place quickly before you scale the motion further.
            </p>
          </div>
          <div className="pricing-card">
            <span className="eyebrow small">Pilot</span>
            <div className="price">From €490<span>/month</span></div>
            <ul>
              <li>Research-led campaign setup</li>
              <li>Persona and proof configuration</li>
              <li>Sequence workbench + approvals</li>
              <li>Inbox and reply operations layer</li>
            </ul>
            <a className="button primary full" href="#final-cta">Request access</a>
          </div>
        </section>

        <section className="final-cta section reveal" data-reveal id="final-cta">
          <div>
            <div className="eyebrow">Final CTA</div>
            <h2>If your outbound matters, the system behind it should too.</h2>
            <p>Stop stitching together research tabs, prompt experiments, and sequencing tools. Run the motion from one premium operating layer.</p>
          </div>
          <div className="hero-actions">
            <a className="button primary large" href="#top">Book demo</a>
            <a className="button secondary large" href="#product">Explore product</a>
          </div>
        </section>
      </main>

      <footer className="footer section" id="footer">
        <div className="footer-brand">
          <a className="brand" href="#top">
            <span className="brand-mark">N</span>
            <span className="brand-copy">
              <strong>Neal</strong>
              <em>Research-led outreach infrastructure</em>
            </span>
          </a>
          <p>Premium outbound systems for founders, RevOps teams, and agencies that care what gets sent.</p>
        </div>
        <div className="footer-links">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="#use-cases">Use cases</a>
          <a href="#pricing">Pricing</a>
          <a href="#top">Login</a>
          <a href="#final-cta">Book demo</a>
        </div>
      </footer>
    </div>
  );
}

function WindowChrome({ title, compact }: { title: string; compact?: boolean }) {
  return (
    <div className={compact ? 'window-chrome compact' : 'window-chrome'}>
      <div className="window-dots">
        <span />
        <span />
        <span />
      </div>
      <strong>{title}</strong>
      <em>{compact ? 'Live' : 'Operator view'}</em>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric-tile">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="hero-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Lead({ name, meta, selected, muted }: { name: string; meta: string; selected?: boolean; muted?: boolean }) {
  return (
    <div className={muted ? 'lead-row muted' : selected ? 'lead-row selected' : 'lead-row'}>
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

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type NavItem = { label: string; href: string };
type Stat = { value: string; label: string };
type Feature = { title: string; body: string; bullets: string[] };
type WorkflowStep = { step: string; title: string; body: string };
type Card = { title: string; body: string; tag: string };
type Testimonial = { quote: string; author: string; role: string };
type Faq = { question: string; answer: string };

const nav: NavItem[] = [
  { label: 'Product', href: '#product' },
  { label: 'Why Neal', href: '#why' },
  { label: 'Proof', href: '#proof' },
  { label: 'Pricing', href: '#pricing' },
];

const stats: Stat[] = [
  { value: '20+', label: 'operator controls built into campaign execution' },
  { value: '1', label: 'system for research, sequencing, inboxes, and replies' },
  { value: '0', label: 'need to juggle five disconnected outbound tools' },
];

const features: Feature[] = [
  {
    title: 'Build campaigns from research, not from vibes',
    body: 'Neal is designed to keep lead context, positioning, proof, and send logic attached from planning through launch.',
    bullets: ['Research-backed sequence framing', 'Reusable campaign logic', 'Clear review before launch'],
  },
  {
    title: 'Protect deliverability while you scale',
    body: 'Inbox limits, warmup-aware sending, suppression logic, and reply-triggered stops are part of the operating model—not afterthoughts.',
    bullets: ['Daily caps and pacing controls', 'Stop-on-reply enforcement', 'Suppression and unsubscribe protection'],
  },
  {
    title: 'Run live replies from one surface',
    body: 'Instead of losing context in inbox chaos, operators can triage replies, assign owners, and keep campaign state tied to every conversation.',
    bullets: ['Central reply queue', 'Intent routing and next actions', 'Campaign-linked thread context'],
  },
];

const workflow: WorkflowStep[] = [
  { step: '01', title: 'Define the target and buying angle', body: 'Lock ICP, offer, objections, proof, exclusions, and desired CTA before the first sequence is drafted.' },
  { step: '02', title: 'Build the sequence with operator guardrails', body: 'Create structured steps, sending windows, inbox assignment logic, and review states around each campaign.' },
  { step: '03', title: 'Launch without losing inbox quality', body: 'Send through controlled pacing, mailbox rotation, and deliverability-aware infrastructure that stays visible.' },
  { step: '04', title: 'Route replies and improve the system', body: 'Classify intent, stop future sends when needed, and improve campaigns from actual operating data.' },
];

const productCards: Card[] = [
  {
    tag: 'Campaign command',
    title: 'See campaign state, sequence structure, and send readiness in one place.',
    body: 'The homepage should communicate system confidence. So the product story here shows structure, not abstract marketing fluff.',
  },
  {
    tag: 'Reply operations',
    title: 'Handle hot replies, objections, OOO, and unsubscribes without context switching.',
    body: 'Operators need a live operations layer that feels controlled and legible, especially once multiple inboxes and campaigns are running.',
  },
  {
    tag: 'Inbox health',
    title: 'Track mailbox pressure, capacity, and pacing before deliverability becomes a fire drill.',
    body: 'A serious outbound product should visually reassure the buyer that scaling does not mean reckless sending.',
  },
];

const testimonials: Testimonial[] = [
  {
    quote: 'This feels much closer to a real outbound operating system than another sequence tool with AI sprinkled on top.',
    author: 'Revenue operator',
    role: 'Mid-market SaaS',
  },
  {
    quote: 'The best part is the framing: campaign logic, inbox controls, and reply handling are treated like the product, not hidden implementation details.',
    author: 'Outbound consultant',
    role: 'Agency lead',
  },
  {
    quote: 'If deliverability, sequencing, and reply context live together, the team can finally scale without losing discipline.',
    author: 'Founder',
    role: 'B2B services company',
  },
];

const faqs: Faq[] = [
  {
    question: 'What is Neal supposed to replace?',
    answer: 'Neal is meant to reduce the sprawl between outreach planning docs, sequencing tools, inbox operations, and reply management. The direction is one coherent outbound operating layer rather than five partially connected tools.',
  },
  {
    question: 'How is it different from lemlist or Smartlead?',
    answer: 'Those tools are strong references for conversion-focused positioning and clear product communication. Neal’s differentiator is the deeper emphasis on operator control, architecture clarity, and a backend-first system that can support custom workflows inside OpenClaw.',
  },
  {
    question: 'Is the product fully live today?',
    answer: 'The backend foundation exists and the frontend is being rebuilt in public. The landing page is now designed to match the quality bar of modern outbound SaaS sites, while the app itself continues to be wired to real backend endpoints.',
  },
  {
    question: 'Who is this for first?',
    answer: 'Founders, lean GTM teams, operators, and agencies that care about relevance, control, and trust—not just sending more volume.',
  },
];

function App() {
  return (
    <div className="page-shell">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />

      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">N</span>
          <span className="brand-copy">
            <strong>Neal</strong>
            <em>Outbound operating system</em>
          </span>
        </a>

        <nav className="nav">
          {nav.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="topbar-actions">
          <a className="text-link" href="#proof">See proof</a>
          <a className="button button-primary" href="#cta">Book demo</a>
        </div>
      </header>

      <main id="top" className="page">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Research-led outreach infrastructure</span>
            <h1>Run outbound from one system that actually respects relevance, deliverability, and reply operations.</h1>
            <p className="hero-lede">
              Neal is being built for teams that want more than a sequence sender. Plan campaigns, control inboxes, route replies, and scale outreach without turning the workflow brittle.
            </p>
            <div className="hero-actions">
              <a className="button button-primary button-large" href="#cta">Book a demo</a>
              <a className="button button-secondary button-large" href="#product">See the product story</a>
            </div>
            <div className="hero-proof">
              <span>Inspired by the best parts of lemlist and Smartlead:</span>
              <strong>clear positioning, visible workflow, repeated CTAs, and product-led proof.</strong>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card main-visual">
              <div className="visual-head">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
                <strong>Campaign command center</strong>
              </div>
              <div className="visual-grid">
                <div className="visual-panel wide">
                  <span className="mini-label">Campaign thesis</span>
                  <p>
                    High-trust outreach for premium buyers requires stronger proof, cleaner targeting, and more disciplined inbox handling than generic volume tools provide.
                  </p>
                </div>
                <Metric value="4-step" label="sequence structure" />
                <Metric value="61%" label="safe inbox capacity" />
                <Metric value="7" label="replies awaiting action" />
                <Metric value="Ready" label="launch state" />
              </div>
            </div>

            <div className="floating-card left-card">
              <span className="mini-label">Reply queue</span>
              <strong>Interested lead needs owner assignment</strong>
              <p>Thread linked to campaign, inbox, and next action.</p>
            </div>

            <div className="floating-card right-card">
              <span className="mini-label">Inbox health</span>
              <strong>Daily cap respected</strong>
              <p>Warmup-aware pacing with suppression safeguards.</p>
            </div>
          </div>
        </section>

        <section className="logo-strip">
          <span>Built for the quality bar set by serious outbound SaaS</span>
          <div className="logo-row">
            <span>Lemlist-level clarity</span>
            <span>Smartlead-style system proof</span>
            <span>Operator-first workflow</span>
            <span>Backend-driven product story</span>
          </div>
        </section>

        <section className="stats-strip" id="why">
          {stats.map((item) => (
            <article key={item.label} className="stat-block">
              <strong>{item.value}</strong>
              <p>{item.label}</p>
            </article>
          ))}
        </section>

        <section className="split-section">
          <div className="section-copy">
            <span className="eyebrow">Why the last version was wrong</span>
            <h2>The last site looked like an internal dashboard. Competitor homepages convert because they tell a sharper story.</h2>
          </div>
          <div className="compare-grid">
            <article className="compare-card bad-card">
              <span>What I did before</span>
              <strong>Built a product shell first.</strong>
              <p>Useful for app direction, wrong for a homepage. It asked visitors to understand the internals before trusting the product.</p>
            </article>
            <article className="compare-card good-card">
              <span>What this rebuild does</span>
              <strong>Leads with value, proof, workflow, and credibility.</strong>
              <p>That is what strong SaaS landing pages do: clear promise, strong CTA, product snapshots, proof, repeated conversion moments.</p>
            </article>
          </div>
        </section>

        <section className="feature-section">
          <div className="section-heading">
            <span className="eyebrow">Why teams will care</span>
            <h2>Neal is positioned as a serious outbound operating layer, not just another cold email sender.</h2>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <ul>
                  {feature.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section" id="product">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">How it works</span>
              <h2>A cleaner, competitor-grade structure: promise → workflow → proof → CTA.</h2>
            </div>
            <p>
              This section exists because lemlist and Smartlead both do a good job of reducing complexity into obvious operating steps. Neal should do the same.
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

        <section className="product-story-section">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">Product story</span>
              <h2>Show enough of the product to feel real, without turning the homepage into the app.</h2>
            </div>
            <p>
              That balance is where good SaaS pages win. They show confidence, structure, and workflow without overwhelming the visitor.
            </p>
          </div>
          <div className="product-card-grid">
            {productCards.map((card) => (
              <article key={card.title} className="product-card">
                <span>{card.tag}</span>
                <strong>{card.title}</strong>
                <p>{card.body}</p>
                <div className="product-placeholder" />
              </article>
            ))}
          </div>
        </section>

        <section className="testimonial-section" id="proof">
          <div className="section-heading">
            <span className="eyebrow">Why this style was chosen</span>
            <h2>Because modern outbound SaaS pages work when they feel direct, structured, and legible.</h2>
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

        <section className="pricing-section" id="pricing">
          <div className="pricing-copy">
            <span className="eyebrow">Pricing</span>
            <h2>Start with a focused pilot. Expand once the system proves itself.</h2>
            <p>
              The right move here is not fake enterprise bloat. It is a crisp offer, a clear call to action, and confidence that the product is being built around real outbound operations.
            </p>
          </div>
          <article className="pricing-card">
            <span className="plan-tag">Pilot</span>
            <div className="price-row">
              <strong>From €490</strong>
              <span>/ month</span>
            </div>
            <ul>
              <li>Research-led campaign setup</li>
              <li>Operator-facing workflow and controls</li>
              <li>Inbox health and reply operations direction</li>
              <li>Backend-driven rebuild path inside OpenClaw</li>
            </ul>
            <a className="button button-primary button-large full-width" href="#cta">Request access</a>
          </article>
        </section>

        <section className="faq-section">
          <div className="section-heading">
            <span className="eyebrow">FAQ</span>
            <h2>Questions a buyer will actually have</h2>
          </div>
          <div className="faq-list">
            {faqs.map((item) => (
              <article key={item.question} className="faq-item">
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section" id="cta">
          <div>
            <span className="eyebrow">Final CTA</span>
            <h2>If outbound matters, the system behind it should feel like a real product—not a patched-together stack.</h2>
            <p>
              This rebuild aims to meet the quality bar set by the best SaaS landing pages in the category while still sounding like Neal.
            </p>
          </div>
          <div className="hero-actions">
            <a className="button button-primary button-large" href="#top">Book demo</a>
            <a className="button button-secondary button-large" href="#product">See product story</a>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

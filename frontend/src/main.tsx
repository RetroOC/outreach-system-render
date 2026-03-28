import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type Feature = { title: string; body: string };
type Metric = { value: string; label: string };
type Workflow = { step: string; title: string; body: string };

type Testimonial = { quote: string; author: string; role: string };

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
    title: 'Launch with control',
    body: 'Run outreach through connected inboxes with visible pacing, health, and send-readiness states.',
  },
  {
    step: '03',
    title: 'Handle replies centrally',
    body: 'See conversations, route intent, stop future sends when needed, and keep context tied to each campaign.',
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

function App() {
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
          <a href="#proof">Proof</a>
          <a href="#cta">Get started</a>
        </nav>

        <div className="topbar-actions">
          <a className="button button-ghost" href="/signin">Sign in</a>
          <a className="button button-primary" href="/signup">Sign up</a>
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
              <a className="button button-primary button-large" href="/signup">Sign up</a>
              <a className="button button-secondary button-large" href="/signin">Sign in</a>
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
                <div className="stat-card">
                  <strong>112</strong>
                  <span>enrolled leads</span>
                </div>
                <div className="stat-card">
                  <strong>61%</strong>
                  <span>capacity remaining</span>
                </div>
                <div className="stat-card">
                  <strong>7</strong>
                  <span>replies to route</span>
                </div>
                <div className="stat-card">
                  <strong>Healthy</strong>
                  <span>sender state</span>
                </div>
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
              Set up campaigns, connect inboxes, and run reply-aware outbound from a product that is built to stay legible as you grow.
            </p>
          </div>
          <div className="hero-actions">
            <a className="button button-primary button-large" href="/signup">Sign up</a>
            <a className="button button-secondary button-large" href="/signin">Sign in</a>
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

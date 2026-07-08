import { useEffect, useRef, useState } from 'react';
import { createExperience } from './scene/Experience.js';

const EMAIL = 'ritika2501ra@gmail.com';

const LINKS = {
  email: `mailto:${EMAIL}`,
  phone: 'tel:+918449113322',
  linkedin: 'https://www.linkedin.com/in/ritika-jain', // TODO: replace with exact profile URL
  resume: '/Ritika_Jain_CV.pdf',
};

// Copies text using the async Clipboard API, falling back to the legacy
// execCommand path when it's unavailable or blocked. Resolves true on success.
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// Opens the mail client where one is configured; always copies the address to the
// clipboard so the visitor never leaves empty-handed (e.g. desktops with no mail app).
function EmailButton() {
  const [label, setLabel] = useState('Email');
  const timer = useRef(null);

  const handleClick = async () => {
    // Let the default mailto navigation proceed for anyone with a mail client.
    const ok = await copyText(EMAIL);
    setLabel(ok ? 'Copied!' : EMAIL);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLabel('Email'), 2200);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <a className="btn primary" href={LINKS.email} onClick={handleClick}>
      {label}
    </a>
  );
}

function Canvas() {
  const ref = useRef(null);
  useEffect(() => {
    // If WebGL is unavailable, skip the 3D stage rather than crashing the app —
    // the content remains readable on the dark background.
    try {
      return createExperience(ref.current);
    } catch (err) {
      console.warn('3D stage disabled:', err);
    }
  }, []);
  return <canvas ref={ref} className="stage" aria-hidden="true" />;
}

/* Fade/slide content in as it enters the viewport. */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.25 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* Counts up when scrolled into view. */
function Stat({ value, suffix = '', label, decimals = 0 }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    let raf;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now) => {
          const p = Math.min((now - t0) / 1600, 1);
          setN(value * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return (
    <div className="stat" ref={ref}>
      <span className="stat-num">{n.toFixed(decimals)}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

const CERTS = [
  { name: 'Harvard Aspire Leaders Program', org: 'Aspire Institute · April 2026' },
  { name: 'McKinsey Forward Program', org: 'McKinsey & Company' },
  { name: 'Leadership & Emotional Intelligence', org: 'Indian School of Business (ISB)' },
  { name: 'Aha! Product Management Certification', org: 'Aha!' },
  { name: 'Technical Product Management', org: 'LinkedIn Learning' },
  { name: 'SDLC: Management & Implementation', org: 'Certification' },
  { name: 'Communication Networks — Silver', org: 'NPTEL' },
  { name: 'Digital Circuits — Silver', org: 'NPTEL' },
];

export default function App() {
  useReveal();
  return (
    <>
      <Canvas />
      <main>
        {/* ——— Opening scene ——— */}
        <section className="panel hero">
          <div className="reveal in">
            <p className="kicker">Chapter zero — where every system begins</p>
            <h1>Ritika Jain</h1>
            <p className="role">Technology Consultant · Business Analyst</p>
            <p className="tagline">A consultant who turns complexity into clarity.</p>
            <div className="scroll-hint" aria-hidden="true">
              <span>Scroll to begin the story</span>
              <div className="scroll-line" />
            </div>
          </div>
        </section>

        {/* ——— Chapter 1 ——— */}
        <section className="panel left">
          <div className="card reveal">
            <p className="kicker">Chapter 01 — The Foundation</p>
            <h2>Every system starts with a single point.</h2>
            <p className="body">
              An electronics engineer by training — <strong>B.Tech, Kamla Nehru Institute of
              Technology</strong>, graduating in 2023 with a <strong>9.25/10 CGPA</strong> — Ritika's
              first encounter with real-world systems came at the scale of a nation's railways.
            </p>
            <div className="entry">
              <h3>Summer Analyst Intern · Banaras Locomotive Works, Indian Railways</h3>
              <p className="dates">July – August 2022</p>
              <p className="body">
                Evaluated 500+ operational and logistics records to engineer workflow improvements,
                automating roughly <strong>40% of manual data-entry pipelines</strong> and validating
                redesigned procedures alongside senior officers before regional rollout.
              </p>
            </div>
          </div>
        </section>

        {/* ——— Chapter 2 ——— */}
        <section className="panel right">
          <div className="card reveal">
            <p className="kicker">Chapter 02 — Learning the Craft</p>
            <h2>Points become connections.</h2>
            <div className="entry">
              <h3>Technology Scholar · PhonePe</h3>
              <p className="dates">November – December 2022</p>
              <p className="body">
                Engineered scalable backend components with <strong>Node.js and MongoDB</strong> for
                payment data management, and analysed core transaction architecture and ledger
                reconciliation flows behind transaction reliability and fraud detection.
              </p>
            </div>
            <div className="entry">
              <h3>Product Consultant Intern · The Stare</h3>
              <p className="dates">October – November 2023</p>
              <p className="body">
                Authored user stories and high-fidelity Figma wireframes that lifted onboarding
                completion by <strong>25%</strong>, wrote the PRD for the central search &amp;
                discovery module — saving <strong>200+ engineering hours</strong> — and ran 10+ user
                interviews to eliminate friction points.
              </p>
            </div>
          </div>
        </section>

        {/* ——— Chapter 3 ——— */}
        <section className="panel tall">
          <div className="card wide reveal">
            <p className="kicker">Chapter 03 — The Transformation</p>
            <h2>Then the system scaled to three million people.</h2>
            <div className="entry">
              <h3>System Engineer · Tata Consultancy Services, New Delhi</h3>
              <p className="dates">December 2023 – Present · Government Defence Finance Digital Transformation (Rs. 1,000+ Cr programme)</p>
            </div>
            <div className="stats">
              <Stat value={3} suffix="M+" label="beneficiaries served" />
              <Stat value={35} suffix="%" label="faster payment turnaround" />
              <Stat value={2} suffix="M" label="USD annual operational impact" />
              <Stat value={98} suffix="%" label="on-time sprint delivery" />
            </div>
            <ul className="body bullets">
              <li>Primary liaison between government stakeholders, business units, and engineering teams — steering end-to-end solution delivery across Agile sprints.</li>
              <li>Mapped complex payment workflows and drove the process redesign behind the 35% turnaround improvement.</li>
              <li>SQL-based transaction analysis and data modelling that surfaced ~USD 2M in annual operational impact.</li>
              <li>Authored 8+ Functional Requirement Documents, user stories, and specs for mobile-enabled enhancements.</li>
              <li>Co-built the data-backed business case that secured a <strong>Rs. 400+ Cr programme expansion</strong>.</li>
            </ul>
          </div>
        </section>

        {/* ——— Chapter 4 ——— */}
        <section className="panel left">
          <div className="card wide reveal">
            <p className="kicker">Chapter 04 — Continuous Growth</p>
            <h2>The path keeps rising.</h2>
            <div className="milestones">
              {CERTS.map((c) => (
                <div className="milestone" key={c.name}>
                  <span className="dot" aria-hidden="true" />
                  <div>
                    <p className="m-name">{c.name}</p>
                    <p className="m-org">{c.org}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="toolkit">
              <span>Toolkit</span> SQL · Python · Java · Node.js · MongoDB · Jira · Figma · Notion ·
              Scrum · FRDs &amp; PRDs · Gap &amp; ROI Analysis · Stakeholder Management
            </p>
          </div>
        </section>

        {/* ——— Closing scene ——— */}
        <section className="panel hero">
          <div className="reveal">
            <p className="kicker">Epilogue — the next chapter</p>
            <h2 className="closing">Let's write it together.</h2>
            <p className="body center">
              Delhi NCR, India — open to consulting, business analysis, and product roles.
            </p>
            <div className="contact-row">
              <EmailButton />
              <a className="btn" href={LINKS.phone}>Call Me</a>
              <a className="btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <a className="btn" href={LINKS.resume} download>Download resume</a>
            </div>
            <p className="fineprint">Ritika Jain · {new Date().getFullYear()}</p>
          </div>
        </section>
      </main>
    </>
  );
}

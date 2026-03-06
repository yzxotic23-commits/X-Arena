import { useState } from "react";

/* ─────────────────────────────────────────
   GLOBAL STYLES injected once into <head>
───────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');

  /* Nexokora Techno: loaded locally if available, otherwise Orbitron as closest match */
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

  @font-face {
    font-family: 'NexokoraTechno';
    src: local('Nexokora Techno'), local('NexokoraTechno-Regular'),
         url('NexokoraTechno-Regular.woff2') format('woff2'),
         url('NexokoraTechno-Regular.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Manrope', sans-serif;
    background: #E8EAED;
    color: #111;
  }

  :root {
    --red: #D32F2F;
    --red-dark: #B71C1C;
    --bg: #E8EAED;
    --white: #FFFFFF;
    --black: #111111;
    --gray: #666666;
    --gray-light: #888888;
  }

  /* NAVBAR */
  .navbar {
    background: var(--white);
    padding: 15px 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 14px;
    margin: 18px 28px 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    cursor: pointer;
  }
  .logo-text {
    font-family: 'NexokoraTechno', 'Orbitron', sans-serif;
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 2.5px;
    color: var(--black);
    text-transform: uppercase;
    line-height: 1;
  }
  .logo-text-white { color: var(--white); }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 36px;
  }
  .nav-link {
    font-family: 'Manrope', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #222;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
  }
  .nav-link:hover { color: var(--red); }

  .btn-signup {
    font-family: 'Manrope', sans-serif;
    background: var(--red);
    color: var(--white);
    border: none;
    padding: 10px 26px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
    letter-spacing: 0.2px;
  }
  .btn-signup:hover { background: var(--red-dark); }

  /* HERO */
  .hero {
    text-align: center;
    padding: 64px 24px 54px;
    background: var(--bg);
  }
  .hero-logo-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-bottom: 22px;
  }
  .hero-logo-text {
    font-family: 'NexokoraTechno', 'Orbitron', sans-serif;
    font-weight: 700;
    font-size: 52px;
    letter-spacing: 5px;
    color: var(--black);
    text-transform: uppercase;
    line-height: 1;
  }
  .hero-tagline {
    font-family: 'Manrope', sans-serif;
    font-size: 17px;
    font-weight: 500;
    color: #444;
    max-width: 370px;
    margin: 0 auto 36px;
    line-height: 1.65;
  }
  .hero-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .btn-enter {
    font-family: 'Manrope', sans-serif;
    background: var(--red);
    color: var(--white);
    border: none;
    padding: 13px 30px;
    border-radius: 9px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
    letter-spacing: 0.2px;
  }
  .btn-enter:hover { background: var(--red-dark); }
  .btn-rank {
    font-family: 'Manrope', sans-serif;
    background: transparent;
    color: var(--red);
    border: 2px solid var(--red);
    padding: 12px 30px;
    border-radius: 9px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
    letter-spacing: 0.2px;
  }
  .btn-rank:hover { background: rgba(211,47,47,0.07); }

  /* FEATURES */
  .features {
    padding: 12px 28px 72px;
    background: var(--bg);
  }
  .feat-header {
    text-align: center;
    margin-bottom: 38px;
  }
  .feat-header h2 {
    font-family: 'Manrope', sans-serif;
    font-size: 42px;
    font-weight: 900;
    line-height: 1.18;
    color: var(--black);
  }
  .feat-header h2 .red { color: var(--red); display: block; }
  .feat-header p {
    font-family: 'Manrope', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: var(--gray);
    max-width: 400px;
    margin: 14px auto 0;
    line-height: 1.65;
  }

  /* CARD GRID */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    max-width: 900px;
    margin: 0 auto;
  }
  .card {
    background: var(--white);
    border-radius: 18px;
    padding: 34px 24px 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.055);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.10);
  }
  .card.active { background: var(--red); }
  .card-icon {
    width: 68px;
    height: 68px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card-icon svg { width: 100%; height: 100%; }
  .card h3 {
    font-family: 'Manrope', sans-serif;
    font-size: 16px;
    font-weight: 800;
    color: var(--black);
    margin-bottom: 10px;
  }
  .card p {
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--gray);
    line-height: 1.65;
  }
  .card.active h3 { color: var(--white); }
  .card.active p  { color: rgba(255,255,255,0.85); }

  /* FOOTER */
  footer {
    background: #111;
    color: var(--white);
    padding: 58px 52px 44px;
    display: grid;
    grid-template-columns: 1.7fr 1fr 1.6fr;
    gap: 48px;
  }
  .foot-desc {
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #888;
    margin: 16px 0 26px;
    line-height: 1.7;
    max-width: 230px;
  }
  .socials {
    display: flex;
    gap: 14px;
    align-items: center;
  }
  .socials a {
    color: var(--white);
    text-decoration: none;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
  }
  .socials a:hover { opacity: 0.65; }
  .socials svg { width: 20px; height: 20px; }

  .foot-col h4 {
    font-family: 'Manrope', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--white);
    margin-bottom: 22px;
  }
  .foot-col ul { list-style: none; }
  .foot-col li { margin-bottom: 13px; }
  .foot-col a {
    text-decoration: none;
    color: #888;
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    font-weight: 500;
    transition: color 0.2s;
  }
  .foot-col a:hover { color: var(--white); }

  .foot-news h4 {
    font-family: 'Manrope', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--white);
    margin-bottom: 8px;
  }
  .foot-news p {
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #888;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  .email-row {
    display: flex;
    align-items: center;
    background: #222;
    border-radius: 50px;
    overflow: hidden;
    padding: 4px 4px 4px 18px;
    border: 1px solid #2e2e2e;
  }
  .email-row input {
    background: transparent;
    border: none;
    color: var(--white);
    font-family: 'Manrope', sans-serif;
    font-size: 14px;
    flex: 1;
    outline: none;
    padding: 8px 0;
  }
  .email-row input::placeholder { color: #555; }
  .email-row button {
    background: var(--red);
    color: var(--white);
    border: none;
    padding: 11px 24px;
    border-radius: 50px;
    font-family: 'Manrope', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
  }
  .email-row button:hover { background: var(--red-dark); }

  @media (max-width: 720px) {
    .cards-grid { grid-template-columns: 1fr; }
    footer { grid-template-columns: 1fr; gap: 32px; }
    nav { padding: 12px 18px; margin: 10px 10px 0; }
    .hero-logo-text { font-size: 32px; }
    .feat-header h2 { font-size: 28px; }
  }
`;

/* ─── SVG ICONS ─── */

const LogoIcon = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
    <rect width="30" height="30" rx="6" fill="#D32F2F"/>
    <rect x="5"    y="5"    width="8.5" height="8.5" rx="1.5" fill="#fff"/>
    <rect x="16.5" y="5"    width="8.5" height="8.5" rx="1.5" fill="#fff"/>
    <rect x="5"    y="16.5" width="8.5" height="8.5" rx="1.5" fill="#fff"/>
    <rect x="16.5" y="16.5" width="8.5" height="8.5" rx="1.5" fill="#111"/>
  </svg>
);

const HeroLogoIcon = () => (
  <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
    <rect width="58" height="58" rx="11" fill="#D32F2F"/>
    <rect x="10" y="10" width="16" height="16" rx="2.5" fill="#fff"/>
    <rect x="32" y="10" width="16" height="16" rx="2.5" fill="#fff"/>
    <rect x="10" y="32" width="16" height="16" rx="2.5" fill="#fff"/>
    <rect x="32" y="32" width="16" height="16" rx="2.5" fill="#111"/>
  </svg>
);

/* Stacked database cylinders */
const IconDatabase = ({ color = "#111" }) => (
  <svg viewBox="0 0 68 68" fill="none">
    <ellipse cx="34" cy="14" rx="20" ry="6" fill={color === "#fff" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.06)"} stroke={color} strokeWidth="2.2"/>
    <line x1="14" y1="14" x2="14" y2="27" stroke={color} strokeWidth="2.2"/>
    <line x1="54" y1="14" x2="54" y2="27" stroke={color} strokeWidth="2.2"/>
    <ellipse cx="34" cy="27" rx="20" ry="6" fill={color === "#fff" ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.04)"} stroke={color} strokeWidth="2.2"/>
    <line x1="14" y1="27" x2="14" y2="40" stroke={color} strokeWidth="2.2"/>
    <line x1="54" y1="27" x2="54" y2="40" stroke={color} strokeWidth="2.2"/>
    <ellipse cx="34" cy="40" rx="20" ry="6" fill={color === "#fff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.03)"} stroke={color} strokeWidth="2.2"/>
    <line x1="14" y1="40" x2="14" y2="53" stroke={color} strokeWidth="2.2"/>
    <line x1="54" y1="40" x2="54" y2="53" stroke={color} strokeWidth="2.2"/>
    <ellipse cx="34" cy="53" rx="20" ry="6" fill={color === "#fff" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.02)"} stroke={color} strokeWidth="2.2"/>
  </svg>
);

/* Monitor with pie chart (left) + bar chart (right) */
const IconMonitorChart = () => (
  <svg viewBox="0 0 68 68" fill="none">
    {/* Monitor bezel */}
    <rect x="4" y="6" width="60" height="42" rx="4" stroke="#111" strokeWidth="2.3" fill="none"/>
    {/* Pie circle */}
    <circle cx="21" cy="27" r="10" stroke="#111" strokeWidth="2.2" fill="none"/>
    {/* Pie filled slice ~120° */}
    <path d="M21 27 L21 17 A10 10 0 0 1 29.66 32 Z" fill="#111"/>
    {/* Vertical divider */}
    <line x1="37" y1="11" x2="37" y2="43" stroke="#ccc" strokeWidth="1.3" strokeDasharray="3 2"/>
    {/* Bar chart: 3 bars ascending right */}
    <rect x="40" y="32" width="5" height="10" rx="1" fill="#111"/>
    <rect x="47" y="25" width="5" height="17" rx="1" fill="#111"/>
    <rect x="54" y="17" width="5" height="25" rx="1" fill="#111"/>
    {/* Stand stem */}
    <line x1="34" y1="48" x2="34" y2="57" stroke="#111" strokeWidth="2.3" strokeLinecap="round"/>
    {/* Base */}
    <line x1="22" y1="57" x2="46" y2="57" stroke="#111" strokeWidth="2.3" strokeLinecap="round"/>
  </svg>
);

/* Rising bar chart + magnifier */
const IconBarMagnifier = () => (
  <svg viewBox="0 0 68 68" fill="none">
    {/* 3 rising bars */}
    <rect x="4"  y="44" width="9" height="16" rx="1.5" fill="#111"/>
    <rect x="17" y="34" width="9" height="26" rx="1.5" fill="#111"/>
    <rect x="30" y="24" width="9" height="36" rx="1.5" fill="#111"/>
    {/* Magnifier circle */}
    <circle cx="52" cy="25" r="12" stroke="#111" strokeWidth="2.5" fill="none"/>
    {/* Upward trend line inside glass */}
    <polyline points="44,31 52,19 60,27" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Arrow tip */}
    <polyline points="55,19 60,19 60,24" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Handle */}
    <line x1="61" y1="34" x2="67" y2="42" stroke="#111" strokeWidth="2.8" strokeLinecap="round"/>
  </svg>
);

/* ─── DATA ─── */
const features = [
  {
    id: 1,
    icon: <IconDatabase color="#fff" />,
    title: "Data Visualization",
    desc: "The ability to present complex data in a visually understandable way, such as through charts.",
    active: true,
  },
  {
    id: 2,
    icon: <IconMonitorChart />,
    title: "Integration",
    desc: "Seamless integration with other software and tools that a business uses, creating a unified system",
    active: false,
  },
  {
    id: 3,
    icon: <IconBarMagnifier />,
    title: "Squad Competition",
    desc: "Allowing users to tailor the dashboard to their specific needs and preferences.",
    active: false,
  },
  {
    id: 4,
    icon: <IconDatabase color="#111" />,
    title: "Reporting",
    desc: "Generating detailed reports that provide insights into the business's performance.",
    active: false,
  },
  {
    id: 5,
    icon: <IconMonitorChart />,
    title: "User Access Control",
    desc: "Managing who can access and interact with the dashboard, ensuring data security.",
    active: false,
  },
  {
    id: 6,
    icon: <IconBarMagnifier />,
    title: "Analytics",
    desc: "Features that facilitate teamwork and communication among team members.",
    active: false,
  },
];

/* ─── SUB-COMPONENTS ─── */

const Navbar = () => (
  <nav className="navbar">
    <div className="logo">
      <LogoIcon size={30} />
      <span className="logo-text">X-Arena</span>
    </div>
    <div className="nav-links">
      <a href="#" className="nav-link">Faq's</a>
      <a href="#" className="nav-link">Support</a>
      <button className="btn-signup">Signup</button>
    </div>
  </nav>
);

const Hero = () => (
  <section className="hero">
    <div className="hero-logo-wrap">
      <HeroLogoIcon />
      <span className="hero-logo-text">X-Arena</span>
    </div>
    <p className="hero-tagline">
      Track your performance, compete with<br />
      your squad and climb the leaderboard!
    </p>
    <div className="hero-btns">
      <button className="btn-enter">Enter Arena &nbsp;→</button>
      <button className="btn-rank">Your Rank</button>
    </div>
  </section>
);

const FeatureCard = ({ icon, title, desc, active }) => (
  <div className={`card${active ? " active" : ""}`}>
    <div className="card-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const Features = () => (
  <section className="features">
    <div className="feat-header">
      <h2>
        Real-Time Insights,
        <span className="red">Real-Time Results</span>
      </h2>
      <p>Gamified dashboard that enable users to perform various targets and activities related to their rank</p>
    </div>
    <div className="cards-grid">
      {features.map((f) => (
        <FeatureCard key={f.id} {...f} />
      ))}
    </div>
  </section>
);

const Footer = () => {
  const [email, setEmail] = useState("");
  return (
    <footer>
      {/* Brand */}
      <div>
        <div className="logo">
          <LogoIcon size={28} />
          <span className="logo-text logo-text-white">X-Arena</span>
        </div>
        <p className="foot-desc">
          Saas dashboard that enable users to perform various tasks and activities related to their business
        </p>
        <div className="socials">
          {/* LinkedIn */}
          <a href="#" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="#fff">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
          {/* Facebook */}
          <a href="#" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="#fff">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          {/* Instagram */}
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div className="foot-col">
        <h4>Quick Links</h4>
        <ul>
          {["About Us", "Solutions", "Pricing", "Mission"].map((l) => (
            <li key={l}><a href="#">{l}</a></li>
          ))}
        </ul>
      </div>

      {/* Newsletter */}
      <div className="foot-news">
        <h4>Newsletter</h4>
        <p>Enter your email to get discounts and offers</p>
        <div className="email-row">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={() => setEmail("")}>Send</button>
        </div>
      </div>
    </footer>
  );
};

/* ─── ROOT APP ─── */
export default function App() {
  // Inject global CSS once
  if (typeof document !== "undefined" && !document.getElementById("xarena-styles")) {
    const style = document.createElement("style");
    style.id = "xarena-styles";
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
  }

  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}

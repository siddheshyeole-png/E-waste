import React from 'react';
import Button from '../components/Button';

// Sample dataset for environmental statistics
const STATS = [
  {
    id: 1,
    title: 'Volume Tonnage',
    value: '45,280 kg',
    label: 'E-Waste Safely Diverted',
    trend: '+14.2% this quarter',
    meta: 'EPA Metric',
    icon: 'scale'
  },
  {
    id: 2,
    title: 'Hardware Units',
    value: '18,450+',
    label: 'Certified Devices Recycled',
    trend: 'Circular Parts Reused',
    meta: '98.4%',
    icon: 'devices'
  },
  {
    id: 3,
    title: 'Logistics Reach',
    value: '32 Centers',
    label: 'Active Collection Hubs',
    trend: 'Van Fleet Active',
    meta: 'Daily',
    icon: 'location_on'
  },
  {
    id: 4,
    title: 'Carbon Abatement',
    value: '128 Tons',
    label: 'CO₂ Emissions Prevented',
    trend: 'Verified Net Offset',
    meta: 'Scope 3',
    icon: 'energy_savings_leaf'
  }
];

// Sample dataset for 4-step workflow
const STEPS = [
  {
    num: 1,
    title: 'Register / Quick Sign Up',
    desc: 'Create a student or household account in under 1 minute with university SSO or email authentication.',
    tag: 'Takes ~45 seconds',
    icon: 'person_add'
  },
  {
    num: 2,
    title: 'List Your E-Waste',
    desc: 'Select electronic categories (laptop, phones, batteries) and estimated item quantities in our digital catalog.',
    tag: 'Live Weight Estimation',
    icon: 'inventory_2'
  },
  {
    num: 3,
    title: 'Schedule Pickup',
    desc: 'Pick convenient date & time slot for certified collection van pickup straight from your building door or dorm lobby.',
    tag: 'SMS & Dispatch Alert',
    icon: 'event_available'
  },
  {
    num: 4,
    title: 'Recycle Responsibly',
    desc: 'Collector picks up items and delivers to certified recycling units. Receive an instant green recycling certificate.',
    tag: 'Digital Certificate Issued',
    icon: 'verified_user'
  }
];

// Sample dataset for e-waste categories
const CATEGORIES = [
  {
    id: 'EW-01-MOB',
    title: 'Mobile Phones & Tablets',
    icon: 'smartphone',
    items: 'Smartphones, iPads, chargers, smartwatches, power leads, and audio accessories.',
    detailTitle: 'Key Recoverable Metals:',
    detailText: 'Gold circuitry, cobalt cells, copper antenna traces, indium tin oxide glass.',
    badge: 'Accepted',
    priority: 'Free Pick'
  },
  {
    id: 'EW-02-CMP',
    title: 'Computers & Laptops',
    icon: 'laptop_mac',
    items: 'Desktops, MacBooks, PC towers, keyboards, servers, RAM modules, and GPUs.',
    detailTitle: 'Security Handling:',
    detailText: 'DoD-compliant magnetic degaussing & physical hard drive puncturing included.',
    badge: 'Accepted',
    priority: 'Free Pick'
  },
  {
    id: 'EW-03-DSP',
    title: 'TVs & Monitors',
    icon: 'tv',
    items: 'LED, LCD flat displays, old CRT monitors, television units, and display cords.',
    detailTitle: 'Environmental Note:',
    detailText: 'Phosphor & leaded glass isolated in negative pressure cleanrooms.',
    badge: 'Accepted',
    priority: 'Free Pick'
  },
  {
    id: 'EW-04-BAT',
    title: 'Batteries & Power Banks',
    icon: 'battery_charging_full',
    items: 'Li-ion packs, dry cells, UPS lead-acid batteries, nickel-cadmium modular cells.',
    detailTitle: 'Containment Protocol:',
    detailText: 'Fire-retardant vermiculite transport boxes used on all dispatched runs.',
    badge: 'Accepted',
    priority: 'High Priority'
  },
  {
    id: 'EW-05-PRN',
    title: 'Printers & Scanners',
    icon: 'print',
    items: 'Inkjets, laserjet printers, toner cartridges, photocopiers, and all feed rollers.',
    detailTitle: 'Polymer Processing:',
    detailText: 'Heavy engineered ABS plastics separated and granulated for injection molding.',
    badge: 'Accepted',
    priority: 'Free Pick'
  },
  {
    id: 'EW-06-OTH',
    title: 'Household Electronics',
    icon: 'home_iot_device',
    items: 'Microwaves, power cables, Wi-Fi routers, lab scales, remotes, and audio stereos.',
    detailTitle: 'Fractional Breakdown:',
    detailText: 'Transformers stripped for pure oxygen-free high thermal conductivity copper.',
    badge: 'Accepted',
    priority: 'Free Pick'
  }
];

// Sample dataset for benefits
const BENEFITS = [
  {
    title: 'Protects the Environment',
    desc: 'Prevents toxic lead, mercury, beryllium, and cadmium from leaching into groundwater aquifers and fertile campus soils.',
    highlight: 'Zero Bio-accumulation',
    icon: 'shield',
    variant: 'danger'
  },
  {
    title: 'Recovers Valuable Materials',
    desc: 'Reclaims high-purity gold, silver, copper, palladium, and rare-earth neodymium magnets for new hardware supply chains.',
    highlight: 'Urban Mining Efficiency',
    icon: 'toll',
    variant: 'primary'
  },
  {
    title: 'Reduces Landfill Waste',
    desc: 'Diverts bulky, non-biodegradable flame-retardant plastic housings from suffocating municipal landfills and incinerators.',
    highlight: '99.2% Diverted Target',
    icon: 'delete_sweep',
    variant: 'secondary'
  },
  {
    title: 'Promotes Responsible Recycling',
    desc: 'Strict adherence to national Pollution Control Board protocols, Basel convention safety, and tamper-proof green audit trails.',
    highlight: 'ISO 14001 Compliant',
    icon: 'policy',
    variant: 'primary'
  }
];

// Sample dataset for collection flow
const FLOW_STEPS = [
  { step: 'Step 01', title: 'User Submits Request', desc: 'Online schedule intake', icon: 'send' },
  { step: 'Step 02', title: 'Request is Reviewed', desc: 'Automated dispatch audit', icon: 'find_in_page' },
  { step: 'Step 03', title: 'Pickup is Scheduled', desc: 'Van slot confirmed', icon: 'departure_board' },
  { step: 'Step 04', title: 'E-Waste Collected', desc: 'Weight barcode stamped', icon: 'front_loader' },
  { step: 'Step 05', title: 'Certified Recycling', desc: 'Green manifest sealed', icon: 'verified' }
];

function Home({ onNavigate }) {
  return (
    <div className="page-wrapper home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="section-container">
          <div className="hero-grid">
            {/* Left Column: Heading and CTAs */}
            <div className="hero-content">
              <div className="hero-pill">
                <span className="pulse-dot"></span>
                <span>🌱 Certified Eco-Friendly Recycling Initiative</span>
              </div>
              <h1 className="hero-title">
                Recycle Your E-Waste. <br />
                <span className="hero-title-highlight">Protect Our Future.</span>
              </h1>
              <p className="hero-subtitle">
                Schedule free, safe, and doorstep collection of old electronics. We ensure
                certified, eco-friendly dismantling and zero landfill footprint for a greener tomorrow.
              </p>

              <div className="hero-actions">
                <Button
                  variant="primary"
                  onClick={() => onNavigate('request-pickup')}
                  icon="arrow_forward"
                >
                  Request a Pickup
                </Button>
                <a href="#how-it-works" className="btn btn-secondary">
                  <span className="material-symbols-outlined btn-icon text-primary">play_circle</span>
                  Learn How It Works
                </a>
              </div>

              {/* Trust Badges */}
              <div className="hero-trust-badges">
                <div className="trust-badge">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  <span>100% Free Doorstep Pickup</span>
                </div>
                <div className="trust-badge">
                  <span className="material-symbols-outlined text-primary">security</span>
                  <span>Data Destruction Guarantee</span>
                </div>
                <div className="trust-badge">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  <span>Certified Recycling</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic with Floating Badges */}
            <div className="hero-visual">
              <div className="hero-image-card">
                <img
                  src="/hero-illustration.png"
                  alt="Eco-Friendly E-Waste Collection Truck and Volunteers"
                  className="hero-image"
                />

                {/* Floating Badge 1 */}
                <div className="floating-badge badge-top-right">
                  <div className="badge-icon-box bg-secondary-container text-primary">
                    <span className="material-symbols-outlined">recycling</span>
                  </div>
                  <div>
                    <span className="badge-subtitle">Verified Diverted</span>
                    <strong className="badge-title">45,000+ kg Recycled</strong>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="floating-badge badge-bottom-left">
                  <div className="badge-icon-box bg-primary-fixed text-on-primary-fixed">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <div>
                    <span className="badge-subtitle">Campus Benchmark</span>
                    <strong className="badge-title text-primary">Zero Landfill Policy</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATISTICS SECTION (Our Environmental Impact) */}
      <section className="stats-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-tag">Audit Metrics</span>
              <h2 className="section-heading">Our Environmental Impact</h2>
            </div>
            <p className="section-subtext">
              Measurable, audited outcomes across collection docks, lab departments, student dorms, and residential zones.
            </p>
          </div>

          <div className="stats-grid">
            {STATS.map((stat) => (
              <div key={stat.id} className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-title">{stat.title}</span>
                  <div className="stat-icon-wrapper">
                    <span className="material-symbols-outlined">{stat.icon}</span>
                  </div>
                </div>
                <div>
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div className="stat-footer">
                  <span className="stat-trend">
                    <span className="material-symbols-outlined icon-inline">trending_up</span>
                    {stat.trend}
                  </span>
                  <span className="stat-meta">{stat.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-tag">Streamlined Logistics</span>
            <h2 className="section-heading">How It Works in 4 Steps</h2>
            <p className="section-subtext">
              From obsolete gadgets in your drawer to raw, sorted components safely delivered to licensed smelters and recyclers.
            </p>
          </div>

          <div className="steps-grid">
            {STEPS.map((step) => (
              <div key={step.num} className="step-card">
                <div>
                  <div className="step-card-header">
                    <span className="step-number">{step.num}</span>
                    <span className="material-symbols-outlined step-icon">{step.icon}</span>
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
                <div className="step-footer">
                  <span className="step-tag">
                    <span className="material-symbols-outlined icon-inline">schedule</span>
                    {step.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. E-WASTE CATEGORIES PREVIEW */}
      <section className="categories-section" id="categories">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-tag">Catalog Index</span>
              <h2 className="section-heading">Common E-Waste We Accept</h2>
              <p className="section-subtext">
                Proper handling for household and institutional electronics with certified hazardous material separation.
              </p>
            </div>
            <button
              onClick={() => onNavigate('request-pickup')}
              className="link-btn text-primary font-semibold"
            >
              Browse full material index →
            </button>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="category-card">
                <div>
                  <div className="category-card-top">
                    <div className="category-icon-box">
                      <span className="material-symbols-outlined">{cat.icon}</span>
                    </div>
                    <span className="category-badge">
                      <span className="status-dot"></span>
                      {cat.badge}
                    </span>
                  </div>
                  <h3 className="category-title">{cat.title}</h3>
                  <p className="category-items">{cat.items}</p>
                  <div className="category-metals-box">
                    <strong className="block text-sm mb-1">{cat.detailTitle}</strong>
                    <p className="text-xs text-muted">{cat.detailText}</p>
                  </div>
                </div>
                <div className="category-footer">
                  <span className="text-xs font-mono text-muted">Audit Code: {cat.id}</span>
                  <span className="category-priority">{cat.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY RECYCLE E-WASTE? (BENEFITS) */}
      <section className="benefits-section">
        <div className="section-container">
          <div className="benefits-wrapper">
            <div className="section-header-centered">
              <span className="section-tag">Ecological Imperative</span>
              <h2 className="section-heading">Why Recycle E-Waste?</h2>
              <p className="section-subtext">
                Electronics are filled with high-value natural elements, but when discarded in dumpsters, they become persistent biological toxins.
              </p>
            </div>

            <div className="benefits-grid">
              {BENEFITS.map((benefit, idx) => (
                <div key={idx} className="benefit-card">
                  <div>
                    <div className={`benefit-icon-box benefit-${benefit.variant}`}>
                      <span className="material-symbols-outlined">{benefit.icon}</span>
                    </div>
                    <h3 className="benefit-title">{benefit.title}</h3>
                    <p className="benefit-desc">{benefit.desc}</p>
                  </div>
                  <div className="benefit-footer">
                    <span className={`benefit-highlight text-${benefit.variant}`}>
                      {benefit.highlight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. COLLECTION PROCESS TIMELINE / FLOW */}
      <section className="flow-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-tag">Custody Chain</span>
            <h2 className="section-heading">End-to-End Collection Flow</h2>
            <p className="section-subtext">
              Transparent custodial tracking from booking confirmation to industrial certified refining.
            </p>
          </div>

          <div className="flow-card">
            <div className="flow-timeline">
              <div className="flow-line"></div>
              {FLOW_STEPS.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flow-step">
                    <div className="flow-icon-box">
                      <span className="material-symbols-outlined">{step.icon}</span>
                    </div>
                    <span className="flow-step-number">{step.step}</span>
                    <h4 className="flow-step-title">{step.title}</h4>
                    <p className="flow-step-desc">{step.desc}</p>
                  </div>
                  {idx < FLOW_STEPS.length - 1 && (
                    <span className="material-symbols-outlined flow-arrow">chevron_right</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL-TO-ACTION (CTA) BANNER */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-banner">
            <div className="cta-content">
              <div className="cta-pill">
                <span className="material-symbols-outlined icon-inline">eco</span>
                Zero-Cost Collection Campus-Wide
              </div>
              <h2 className="cta-title">
                Have old electronics lying around at home or dorm?
              </h2>
              <p className="cta-subtitle">
                Join thousands of responsible citizens. Book a free doorstep pickup today and earn an authenticated recycling certificate.
              </p>
            </div>
            <div className="cta-actions">
              <Button
                variant="secondary"
                onClick={() => onNavigate('request-pickup')}
                icon="calendar_month"
                className="cta-btn-white"
              >
                Schedule a Pickup Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

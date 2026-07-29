import React, { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AuthDialog from '../auth/AuthDialog';
import useOnScreen from '../../hooks/useOnScreen';

const Home = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [authRole, setAuthRole] = useState(null);

  const openAuth = (mode, role = null) => {
    setAuthMode(mode);
    setAuthRole(role);
    setShowAuth(true);
  };

  // scroll-reveal refs — must be inside the component
  const [aboutRef, aboutVisible] = useOnScreen();
  const [featuresRef, featuresVisible] = useOnScreen();
  const [hiwRef, hiwVisible] = useOnScreen();
  const [contactRef, contactVisible] = useOnScreen();

  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = () => {
    // basic validation
    if (!contactForm.firstName || !contactForm.email || !contactForm.message) {
      alert('Please fill in at least First Name, Email, and Message.');
      return;
    }

    setShowSuccess(true);

    // reset the form fields
    setContactForm({
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: ''
    });

    // auto-hide the success banner after a few seconds
    setTimeout(() => setShowSuccess(false), 4000);
  };

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

  return (
    <>
      <header>
        <Navbar expand="lg" className="custom-navbar">
          <div className="container-fluid px-4">
            <Navbar.Brand href="#home" className='title'>
              Forest<span style={{ color: '#3B6D11' }}>Guard</span>
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />

            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mx-auto" style={{ position: 'relative', left: '5vw' }}>
                <Nav.Link href="#home" className='nave-link'>Home</Nav.Link>
                <Nav.Link href="#about" className='nave-link'>About</Nav.Link>
                <Nav.Link href="#features" className='nave-link'>Features</Nav.Link>
                <Nav.Link href="#how-it-works" className='nave-link'>How It Works</Nav.Link>
                <Nav.Link href="#contact" className='nave-link'>Contact Us</Nav.Link>
              </Nav>
              <Nav className="ms-auto align-items-center">
                <Nav.Link onClick={() => openAuth('signin')} className='nav-sign-in'>
                  <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                </Nav.Link>
                <Nav.Link onClick={() => openAuth('register')} className='nav-register-btn ms-lg-3'>
                  <i className="bi bi-person-plus me-2"></i>Register
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </div>
        </Navbar>
      </header>

      <main>
        <section className='section1' id='home'>
          <div className='hero d-flex align-items-center'>
            <div className='container-fluid'>
              <div className='text-center'>
                <span><h2>Welcome to Forest Guard</h2></span>
                <h1>Saving Today's Trees for Tomorrow's World</h1>
                <h3>Committed to covering and conserving every forest in Sri Lanka</h3>
                <button className='btn-home1' onClick={() => openAuth('register', 'company')}>Register Company</button>
                <button
  className='btn-home2'
  onClick={() => {
    document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
  }}
>
  Learn More
</button>
              </div>
            </div>
          </div>
        </section>

        {/* about section */}
        <section
          ref={aboutRef}
          className={`section2 fade-section ${aboutVisible ? 'is-visible' : ''}`}
          id='about'
        >
          <div className='container'>
            <div className="about-inner">

              {/* Badge */}
              <div className="about-badge">
                <span className="leaf-icon">🌿</span> About Forest Guard
              </div>

              {/* Heading */}
              <h2 className="about-heading">
                Sustainable Forests,<br />
                <span className="heading-green">Sustainable Future</span>
              </h2>
              <p className="about-sub">
                A government initiative designed to combat illegal logging and promote transparent
                timber management across Sri Lanka.
              </p>

              {/* Two column layout */}
              <div className="about-layout">

                {/* Left: text + stats */}
                <div className="about-text-col">
                  <p>Forests play a critical role in maintaining environmental balance, biodiversity,
                  and economic sustainability. However, illegal logging, uncontrolled timber harvesting,
                  and lack of proper monitoring have caused serious issues across Sri Lanka.</p>

                  <p>Forest Guard is a centralized digital platform that enables government authorities,
                  timber companies, and forest officers to collaborate through transparent, regulated,
                  and sustainable processes including mandatory replantation programs after every
                  tree cutting activity.</p>

                  <div className="about-stats">
                    <div className="stat-card"><div className="stat-num">24/7</div><div className="stat-label">Active Monitoring</div></div>
                    <div className="stat-card"><div className="stat-num"> 3</div><div className="stat-label">User Roles</div></div>
                    <div className="stat-card"><div className="stat-num">100%</div><div className="stat-label">Transparent Process</div></div>
                    <div className="stat-card"><div className="stat-num">Map</div><div className="stat-label">Based Interface</div></div>
                  </div>
                </div>

                {/* Right: feature cards */}
                <div className="about-cards">
                  {[
                    { icon: "🌳", color: "green", title: "Forest Protection", desc: "Prevent illegal logging through role-based access and a structured cutting request and approval system." },
                    { icon: "🌱", color: "teal", title: "Mandatory Replantation", desc: "Every cutting activity is tracked with enforced replantation and seed collection to ensure sustainability." },
                    { icon: "🗺️", color: "blue", title: "Interactive Map Monitoring", desc: "Visualize forest areas, cutting zones, and replantation regions using an integrated Leaflet.js map interface." },
                    { icon: "📊", color: "amber", title: "Transparency & Reporting", desc: "Admin dashboards, violation tracking, and timber sales records ensure full accountability." },
                  ].map((item, i) => (
                    <div className={`about-card`} key={i}>
                      <div className={`card-icon icon-${item.color}`}>{item.icon}</div>
                      <div>
                        <p className="card-title">{item.title}</p>
                        <p className="card-desc">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* features section */}
        <section
          ref={featuresRef}
          className={`section3 fade-section ${featuresVisible ? 'is-visible' : ''}`}
          id='features'
        >
          <div className='container'>
            <div className='features-inner'>

              <div className='features-header'>
                <div className='features-badge'>🌲 Our Features</div>
                <h2 className='features-heading'>Comprehensive Forest Management</h2>
                <p className='features-sub'>Everything you need to monitor, regulate, and sustain forest resources effectively.</p>
              </div>

              <div className='features-grid'>
                {[
                  {
                    icon: '👥',
                    title: 'Company Registration',
                    desc: 'Streamlined registration and approval process for timber companies with complete documentation management.'
                  },
                  {
                    icon: '🗺️',
                    title: 'Interactive Map',
                    desc: 'Select and monitor forest areas using an intuitive map-based interface with real-time data visualization.'
                  },
                  {
                    icon: '📋',
                    title: 'Request Management',
                    desc: 'Submit and track timber cutting requests with transparent approval workflows and status updates.'
                  },
                  {
                    icon: '🌱',
                    title: 'Replantation Tracking',
                    desc: 'Monitor mandatory replantation activities ensuring sustainable forest regeneration and growth.'
                  },
                  {
                    icon: '🌾',
                    title: 'Seed Collection',
                    desc: 'Manage seed collection activities to support native species preservation and forest biodiversity.'
                  },
                  {
                    icon: '🛡️',
                    title: 'Violation Detection',
                    desc: 'Advanced monitoring systems to detect and manage violations in forest usage and illegal activities.'
                  },
                ].map((item, i) => (
                  <div className='feature-card' key={i}>
                    <div className='feature-icon-wrap'>
                      <span className='feature-icon'>{item.icon}</span>
                    </div>
                    <h3 className='feature-title'>{item.title}</h3>
                    <p className='feature-desc'>{item.desc}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* how it works section */}
        <section
          ref={hiwRef}
          className={`section4 fade-section ${hiwVisible ? 'is-visible' : ''}`}
          id='how-it-works'
        >
          <div className='container'>
            <div className='hiw-inner'>

              <div className='hiw-header'>
                <div className='hiw-badge'>⚙️ Process</div>
                <h2 className='hiw-heading'>How Forest Guard Works</h2>
                <p className='hiw-sub'>A transparent, step-by-step process ensuring sustainable timber management.</p>
              </div>

              <div className='hiw-grid'>
                {[
                  {
                    step: '01',
                    icon: '🏢',
                    title: 'Company Registration',
                    desc: 'Timber companies register with required documentation and await admin approval to access the system.'
                  },
                  {
                    step: '02',
                    icon: '📄',
                    title: 'Submit Cutting Request',
                    desc: 'Select forest areas on the interactive map and submit timber cutting requests with detailed plans.'
                  },
                  {
                    step: '03',
                    icon: '✅',
                    title: 'Officer Inspection',
                    desc: 'Forest officers inspect and verify requests on-site before granting approval for harvesting.'
                  },
                  {
                    step: '04',
                    icon: '🌿',
                    title: 'Replantation & Compliance',
                    desc: 'After cutting, mandatory replantation is tracked and monitored to ensure forest sustainability.'
                  },
                ].map((item, i, arr) => (
                  <div className='hiw-step-wrap' key={i}>
                    <div className='hiw-card'>
                      <div className='hiw-step-num'>{item.step}</div>
                      <div className='hiw-icon-wrap'>
                        <span className='hiw-icon'>{item.icon}</span>
                      </div>
                      <h3 className='hiw-title'>{item.title}</h3>
                      <p className='hiw-desc'>{item.desc}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className='hiw-arrow'>→</div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ── Section 5 : Contact ── */}
        <section
          ref={contactRef}
          className={`section5 fade-section ${contactVisible ? 'is-visible' : ''}`}
          id='contact'
        >
          <div className='container'>
            <div className='contact-inner'>

              <div className='contact-header'>
                <div className='contact-badge'>📬 Contact</div>
                <h2 className='contact-heading'>Get In Touch</h2>
                <p className='contact-sub'>
                  Have questions about Forest Guard? We're here to help you get started.
                </p>
              </div>

              <div className='contact-layout'>

                {/* Left : info */}
                <div className='contact-info'>
                  <h3 className='contact-org'>Ministry of Environment</h3>
                  <p className='contact-org-desc'>
                    Forest Guard is an initiative by the Ministry of Environment, Sri Lanka,
                    dedicated to sustainable forest management and conservation.
                  </p>

                  <div className='contact-details'>
                    <div className='contact-item'>
                      <div className='contact-icon'>📍</div>
                      <div>
                        <p className='contact-item-label'>Address</p>
                        <p className='contact-item-value'>82 Rajamalwatta Road, Battaramulla, Sri Lanka</p>
                      </div>
                    </div>
                    <div className='contact-item'>
                      <div className='contact-icon'>📞</div>
                      <div>
                        <p className='contact-item-label'>Phone</p>
                        <p className='contact-item-value'>+94 11 2034 100</p>
                      </div>
                    </div>
                    <div className='contact-item'>
                      <div className='contact-icon'>✉️</div>
                      <div>
                        <p className='contact-item-label'>Email</p>
                        <p className='contact-item-value'>info@forestguard.lk</p>
                      </div>
                    </div>
                    <div className='contact-item'>
                      <div className='contact-icon'>🕐</div>
                      <div>
                        <p className='contact-item-label'>Hours</p>
                        <p className='contact-item-value'>Mon - Fri: 8:30 AM - 4:30 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right : form */}
                <div className='contact-form-wrap'>
                  <div className='contact-row'>
                    <div className='contact-field'>
                      <label className='contact-label'>First Name</label>
                      <input
                        className='contact-input'
                        type='text'
                        name='firstName'
                        placeholder='Enter your first name'
                        value={contactForm.firstName}
                        onChange={handleContactChange}
                      />
                    </div>
                    <div className='contact-field'>
                      <label className='contact-label'>Last Name</label>
                      <input
                        className='contact-input'
                        type='text'
                        name='lastName'
                        placeholder='Enter your last name'
                        value={contactForm.lastName}
                        onChange={handleContactChange}
                      />
                    </div>
                  </div>

                  <div className='contact-field'>
                    <label className='contact-label'>Email</label>
                    <input
                      className='contact-input'
                      type='email'
                      name='email'
                      placeholder='Enter your email'
                      value={contactForm.email}
                      onChange={handleContactChange}
                    />
                  </div>

                  <div className='contact-field'>
                    <label className='contact-label'>Subject</label>
                    <select
                      className='contact-input contact-select'
                      name='subject'
                      value={contactForm.subject}
                      onChange={handleContactChange}
                    >
                      <option value=''>Select a subject</option>
                      <option value='general'>General Inquiry</option>
                      <option value='registration'>Company Registration</option>
                      <option value='cutting'>Cutting Request</option>
                      <option value='violation'>Violation Report</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>

                  <div className='contact-field'>
                    <label className='contact-label'>Message</label>
                    <textarea
                      className='contact-input contact-textarea'
                      name='message'
                      placeholder='Enter your message'
                      value={contactForm.message}
                      onChange={handleContactChange}
                    />
                  </div>

                  <button className='contact-btn' onClick={handleSendMessage}>
                    <span>✉</span> Send Message
                  </button>

                  {showSuccess && (
                    <div className='contact-success-banner'>
                      ✅ Message sent successfully! We'll get back to you soon.
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className='footer'>
        <div className='container'>
          <div className='footer-inner'>

            {/* Col 1 : brand */}
            <div className='footer-brand'>
              <div className='footer-logo'>
                <div className='footer-logo-icon'>🌲</div>
                <span className='footer-logo-text'>
                  <span className='logo-forest'>Forest</span>
                  <span className='logo-guard'>Guard</span>
                </span>
              </div>
              <p className='footer-desc'>
                A government initiative for sustainable timber management,
                protecting Sri Lanka's forests for future generations.
              </p>
              <div className='footer-contacts'>
                <div className='footer-contact-item'>
                  <span>📍</span> Battaramulla, Sri Lanka
                </div>
                <div className='footer-contact-item'>
                  <span>📞</span> +94 11 2034 100
                </div>
                <div className='footer-contact-item'>
                  <span>✉️</span> info@forestguard.lk
                </div>
              </div>
            </div>

            {/* Col 2 : Services */}
            <div className='footer-col'>
              <h4 className='footer-col-title'>Services</h4>
              <ul className='footer-links'>
                <li><a href='#'>Company Registration</a></li>
                <li><a href='#'>Cutting Requests</a></li>
                <li><a href='#'>Replantation Tracking</a></li>
                <li><a href='#'>Violation Reports</a></li>
              </ul>
            </div>

            {/* Col 3 : Resources */}
            <div className='footer-col'>
              <h4 className='footer-col-title'>Resources</h4>
              <ul className='footer-links'>
                <li><a href='#'>Documentation</a></li>
                <li><a href='#'>User Guide</a></li>
                <li><a href='#'>API Reference</a></li>
                <li><a href='#'>Support Center</a></li>
              </ul>
            </div>

            {/* Col 4 : Legal */}
            <div className='footer-col'>
              <h4 className='footer-col-title'>Legal</h4>
              <ul className='footer-links'>
                <li><a href='#'>Privacy Policy</a></li>
                <li><a href='#'>Terms of Service</a></li>
                <li><a href='#'>Cookie Policy</a></li>
                <li><a href='#'>Compliance</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className='footer-bottom'>
            <p className='footer-copy'>
              © 2026 Forest Guard. Ministry of Environment, Sri Lanka.
            </p>
            <div className='footer-socials'>
              <a href='#' className='footer-social-btn' aria-label='Website'>🌐</a>
              <a href='#' className='footer-social-btn' aria-label='Email'>✉️</a>
              <a href='#' className='footer-social-btn' aria-label='Phone'>📞</a>
              <a href='#' className='footer-social-btn' aria-label='External'>↗</a>
            </div>
          </div>

        </div>
      </footer>

      <AuthDialog
        isOpen={showAuth}
        initialMode={authMode}
        initialRole={authRole}
        onClose={() => setShowAuth(false)}
      />
    </>
  );
};

export default Home;
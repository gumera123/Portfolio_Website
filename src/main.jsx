import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation
} from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Code2,
  Database,
  Download,
  ExternalLink,
  GitBranch,
  GraduationCap,
  Mail,
  Menu,
  Moon,
  Network,
  Server,
  ShieldCheck,
  Sparkles,
  Sun,
  TerminalSquare,
  Wrench,
  X
} from 'lucide-react';
import './styles.css';

const contactEndpoint = import.meta.env.VITE_CONTACT_ENDPOINT || '/api/inquiry';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Skills', href: '/skills' },
  { label: 'Projects', href: '/projects' },
  { label: 'Experience', href: '/experience' },
  { label: 'Goals', href: '/goals' },
  { label: 'Contact', href: '/contact' }
];

const skillGroups = [
  { title: 'Frontend', icon: Code2, skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'] },
  { title: 'Backend', icon: Server, skills: ['Node.js', 'Express.js', 'Laravel'] },
  { title: 'Database', icon: Database, skills: ['MongoDB', 'MongoDB Atlas'] },
  { title: 'Deployment & Tools', icon: TerminalSquare, skills: ['Git', 'GitHub', 'Linux', 'SSH', 'Server Deployment'] },
  {
    title: 'Technical & Professional',
    icon: Wrench,
    skills: [
      'Technical Troubleshooting',
      'System Debugging',
      'Documentation',
      'Team Collaboration',
      'Hardware & Software Support',
      'Computer Systems Servicing (CSS NC II)'
    ]
  }
];

const projects = [
  {
    title: 'NSync App',
    tag: 'Mobile Collaboration Platform',
    description:
      'A full-stack mobile application for collaboration and productivity designed to help teams manage tasks, organize workflows, track progress, and improve communication in real time.',
    tech: ['React Native', 'Expo', 'Firebase Cloud Services'],
    accent: 'aqua',
    cover: '/project-covers/nsync-app.jpg',
    coverClass: 'cover-nsync'
  },
  {
    title: 'Higa App',
    tag: 'Mobile App Experience',
    description:
      'A mobile application project focused on delivering a clean, practical user experience with an emphasis on fast access to core features and smooth everyday use.',
    tech: ['Mobile UI', 'App Development', 'User Experience'],
    accent: 'emerald',
    cover: '/project-covers/higa-app.svg',
    coverClass: 'cover-higa'
  },
  {
    title: 'Sui Move Smart Contracts Portfolio',
    tag: 'Blockchain Development',
    description:
      'A portfolio project highlighting smart contract work built around the Sui Move ecosystem, showing practical blockchain development skills and on-chain logic.',
    tech: ['Sui Move', 'Smart Contracts', 'Blockchain'],
    accent: 'aqua',
    cover: '/project-covers/sui-move-smart-contracts-portfolio.png',
    coverClass: 'cover-sui'
  },
  {
    title: 'COT Inventory System',
    tag: 'Live Inventory Management',
    description:
      'A deployed inventory management platform designed for product tracking, reporting, and record management in a live server environment.',
    tech: ['MongoDB', 'Express.js', 'React', 'Node.js'],
    accent: 'emerald',
    cover: '/project-covers/cot-inventory-system.png',
    coverClass: 'cover-cot'
  }
];

const goals = [
  'Build scalable, production-ready systems',
  'Advance backend architecture expertise',
  'Improve DevOps and deployment practices',
  'Gain professional software engineering experience',
  'Continue growing as a full-stack developer'
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 28, restDelta: 0.001 });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>{loading && <Loader />}</AnimatePresence>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />
      <Navbar
        theme={theme}
        menuOpen={menuOpen}
        onMenu={() => setMenuOpen((value) => !value)}
        onCloseMenu={() => setMenuOpen(false)}
        onTheme={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
      />
      <ScrollToTop />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function Loader() {
  return (
    <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
      <motion.div
        className="loader-mark"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        JG
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        Preparing jorrygumera.com
      </motion.p>
    </motion.div>
  );
}

function Navbar({ theme, menuOpen, onMenu, onCloseMenu, onTheme }) {
  return (
    <header className="navbar">
      <Link className="brand" to="/" aria-label="Jorry Gumera home">
        <span>JG</span>
    
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink key={item.href} className={({ isActive }) => (isActive ? 'active' : '')} to={item.href}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-actions">
        <button className="icon-button" onClick={onTheme} aria-label="Toggle color theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="icon-button mobile-only" onClick={onMenu} aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {navItems.map((item) => (
              <NavLink key={item.href} to={item.href} onClick={onCloseMenu}>
                {item.label}
              </NavLink>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <section className="section home-brief">
        <SectionIntro
          eyebrow="Portfolio Overview"
          title="Dedicated to production-ready development, IT support, and scalable systems engineering."
          copy="Feel free to inspect my background, skills, projects, experience, and contact details."
        />
        <div className="overview-grid">
          <Link className="overview-card" to="/projects">
            <Code2 />
            <h3>Project Work</h3>
            <p>Mobile collaboration tooling and deployed inventory management systems.</p>
          </Link>
          <Link className="overview-card" to="/skills">
            <Server />
            <h3>Technical Stack</h3>
            <p>MERN, Laravel, React Native, Firebase, GitHub workflows, Linux, SSH, and deployment.</p>
          </Link>
          <Link className="overview-card" to="/contact">
            <Mail />
            <h3>Recruiter Contact</h3>
            <p>Direct email, GitHub profile, resume access, and a polished inquiry form.</p>
          </Link>
        </div>
      </section>
    </>
  );
}

function Hero() {
  return (
    <section id="home" className="hero section">
      <div className="hero-visual" aria-hidden="true">
        <motion.div className="code-orbit orbit-one" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 7 }}>
          <TerminalSquare size={18} />
          build --prod
        </motion.div>
        <motion.div className="code-orbit orbit-two" animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 8 }}>
          <Network size={18} />
          api / deploy
        </motion.div>
        <div className="grid-glow" />
      </div>
      <motion.div className="hero-content" initial="hidden" animate="show" variants={fadeUp}>
        <p className="eyebrow"><Sparkles size={16} /> BSIT Graduate</p>
        <h1>JORRY E. GUMERA</h1>
        <h2>Full-Stack Developer/ IT Assistant</h2>
        <p className="hero-copy">
          Full-stack developer and IT support specialist focused on building scalable web and mobile applications, modern Laravel systems, and reliable user-centered solutions. Experienced in MERN stack development, deployment workflows, technical troubleshooting, and practical system management.
        </p>
        <div className="cta-row">
          <Link className="button primary" to="/projects">
            View Projects <ArrowRight size={18} />
          </Link>
          <a className="button secondary" href="/My_Resume.pdf" download>
            Download Resume <Download size={18} />
          </a>
          <Link className="button ghost" to="/contact">
            Contact Me <Mail size={18} />
          </Link>
        </div>
      </motion.div>
      <Link className="scroll-cue" to="/about" aria-label="Open about page">
        <span>Explore</span>
        <ChevronDown size={20} />
      </Link>
    </section>
  );
}

function SectionIntro({ eyebrow, title, copy }) {
  return (
    <motion.div className="section-intro" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </motion.div>
  );
}

function About() {
  return (
    <section id="about" className="section">
      <SectionIntro
        eyebrow="About"
        title="Full-stack developer with practical experience in web systems, IT troubleshooting, and user-centered solutions."
        copy="Focused on building reliable software, creating user-centered experiences, and continuously improving technical skills through real-world practice."
      />
      <div className="about-grid">
        <motion.article className="glass-panel about-card" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <GraduationCap />
          <p>
            Jorry E. Gumera is a Bachelor of Science in Information Technology graduate with hands-on experience in
            full-stack development, mobile application development, and modern web systems.
          </p>
          <p>
            He has developed multiple real-world projects including inventory management systems, mobile applications,
            and web-based platforms using modern technologies and collaborative development practices.
          </p>
        </motion.article>
        <motion.article className="glass-panel about-card" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <ShieldCheck />
          <p>
            His technical experience includes MERN stack development, GitHub workflows, frontend and backend
            development, deployment processes, system debugging, technical troubleshooting, and project documentation.
          </p>
          <p>
            He is also a CSS NC II certificate holder, strengthening his practical knowledge in computer systems
            servicing, hardware troubleshooting, networking fundamentals, and technical support.
          </p>
        </motion.article>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="section alt-section">
      <SectionIntro eyebrow="Skills" title="Modern web, mobile, backend, and technical support capability." />
      <div className="skills-grid">
        {skillGroups.map((group, index) => {
          const Icon = group.icon;
          return (
            <motion.article
              className="skill-card"
              key={group.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="card-head">
                <Icon size={22} />
                <h3>{group.title}</h3>
              </div>
              <div className="skill-pills">
                {group.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="section">
      <SectionIntro
        eyebrow="Projects"
        title="Scalable solutions built for production projects."
        copy="Engineering high-impact applications and reliable systems with a focus on stability and business growth."
      />
      <div className="project-grid">
        {projects.map((project, index) => (
          <motion.article
            className={`project-card ${project.accent}`}
            key={project.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
          >
            <div className="project-preview">
              <img
                className={`project-cover ${project.coverClass || ''}`.trim()}
                src={project.cover}
                alt={`${project.title} cover image`}
                loading="lazy"
              />
            </div>
            <div className="project-body">
              <p className="project-tag">{project.tag}</p>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="tech-list">
                {project.tech.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
              <div className="project-actions">
                <a className="button compact secondary" href="https://github.com/gumera123" target="_blank" rel="noreferrer">
                  <GitBranch size={17} /> Repository
                </a>
                <Link className="button compact ghost" to="/contact">
                  <ExternalLink size={17} /> Live Demo
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section id="experience" className="section alt-section">
      <SectionIntro eyebrow="Experience" title="Practical responsibility across technical and operational environments." />
      <div className="experience-grid">
        <ExperienceCard
          icon={BriefcaseBusiness}
          title="Technical Support Experience"
          items={[
            'Provided technical troubleshooting and IT support assistance',
            'Handled system debugging, setup, and configuration tasks',
            'Assisted with practical problem-solving in real-world technical environments'
          ]}
        />
        <ExperienceCard
          icon={CheckCircle2}
          title="Operations & Management Experience"
          items={[
            'Managed boarding house responsibilities and daily operations',
            'Demonstrated adaptability, organization, and responsibility while balancing academic and technical work'
          ]}
        />
      </div>
    </section>
  );
}

function ExperienceCard({ icon: Icon, title, items }) {
  return (
    <motion.article className="glass-panel experience-card" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
      <Icon />
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </motion.article>
  );
}

function Goals() {
  return (
    <section id="goals" className="section">
      <SectionIntro eyebrow="Goals" title="Professional roadmap for the next stage of growth." />
      <div className="timeline">
        {goals.map((goal, index) => (
          <motion.div
            className="timeline-item"
            key={goal}
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07 }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{goal}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const formId = useMemo(() => `form-${Math.random().toString(36).slice(2)}`, []);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleInquirySubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim() || '',
      message: formData.get('message')?.toString().trim() || ''
    };

    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Unable to send inquiry right now.');
      }

      setStatus('success');
      form.reset();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Unable to send inquiry right now.');
    }
  }

  return (
    <section id="contact" className="section contact-section">
      <SectionIntro
        eyebrow="Contact"
        title="Available for full-stack development opportunities."
        copy="For recruiter inquiries, project conversations, or technical opportunities, reach out directly."
      />
      <div className="contact-grid">
        <div className="contact-panel">
          <a href="mailto:gumerajorry00@gmail.com"><Mail size={18} /> gumerajorry00@gmail.com</a>
          <a href="https://github.com/gumera123" target="_blank" rel="noreferrer"><GitBranch size={18} /> github.com/gumera123</a>
          <a className="button primary" href="/My_Resume.pdf" download>
            Download Resume <Download size={18} />
          </a>
        </div>
        <form className="contact-form" aria-labelledby={formId} onSubmit={handleInquirySubmit}>
          <h3 id={formId}>Send a message</h3>
          <label>
            Name
            <input type="text" name="name" placeholder="Your name" required />
          </label>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>
          <label>
            Message
            <textarea name="message" rows="5" placeholder="Tell me about the opportunity" required />
          </label>
          <button className="button primary" type="submit">
            {status === 'sending' ? 'Sending...' : 'Submit Inquiry'} <ArrowRight size={18} />
          </button>
          {status === 'success' && <p className="form-success">Your inquiry was sent successfully. I’ll reply to the email address you provided.</p>}
          {status === 'error' && <p className="form-error">{errorMessage}</p>}
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p></p>
      <span>© 2026 Jorry E. Gumera. Full-Stack Developer.</span>
    </footer>
  );
}

export default App;

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import {
  BrowserRouter,
  Link,
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
  FolderKanban,
  GitBranch,
  GraduationCap,
  House,
  ListChecks,
  Mail,
  Menu,
  Moon,
  Pencil,
  Phone,
  Plus,
  ScrollText,
  Server,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TerminalSquare,
  Trash2,
  UserRound,
  Wrench,
  X
} from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from './components/AdminAuthContext.jsx';
import AdminPage from './components/AdminPage.jsx';
import { AdminCardMenu, AdminEditButton, PortfolioAdminProvider } from './components/PortfolioAdmin.jsx';
import { DEFAULT_PORTFOLIO_CONTENT, validatePortfolioContent } from './data/portfolioContent.js';
import { supabase } from './lib/supabase.js';
import './styles.css';

const navItems = [
  { label: 'Home', href: '/', icon: House },
  { label: 'About', href: '/#about', icon: UserRound },
  { label: 'Skills', href: '/#skills', icon: Wrench },
  { label: 'Certificates', href: '/#certificates', icon: ScrollText },
  { label: 'Projects', href: '/#projects', icon: FolderKanban },
  { label: 'Experience', href: '/#experience', icon: BriefcaseBusiness },
  { label: 'Goals', href: '/#goals', icon: Target },
  { label: 'Contact', href: '/#contact', icon: Mail }
];

const skillIcons = {
  code: Code2,
  server: Server,
  database: Database,
  terminal: TerminalSquare,
  wrench: Wrench
};
const aboutIcons = { graduation: GraduationCap, shield: ShieldCheck };
const experienceIcons = { briefcase: BriefcaseBusiness, check: CheckCircle2 };
const contactIcons = { mail: Mail, phone: Phone, github: GitBranch, external: ExternalLink };
const isPdfAsset = (path) => /\.pdf(?:$|[?#])/i.test(path);

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio-theme') || 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(DEFAULT_PORTFOLIO_CONTENT);
  const [contentError, setContentError] = useState('');
  const { isAdmin, signOut } = useAdminAuth();
  const { pathname } = useLocation();
  const isAdminPage = pathname === '/admin' || pathname === '/admin/';
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 28, restDelta: 0.001 });
  const handleContentSaved = (nextContent) => {
    setContent(nextContent);
    setContentError('');
  };
  const resumeEditor = {
    title: 'Update resume',
    mode: 'resume',
    value: { resume: content.resume },
    commit: (edited, current) => ({ ...current, resume: edited.resume })
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('portfolio-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#0F0E0A' : '#EDEAE4'
    );
  }, [theme]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    supabase
      .from('portfolio_content')
      .select('content')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setContentError(`Portfolio content could not be loaded: ${error.message}`);
          console.error('Portfolio content could not be loaded:', error);
          return;
        }
        if (!data) return;
        const validationError = validatePortfolioContent(data.content);
        if (validationError) {
          setContentError(`Saved portfolio content is invalid: ${validationError}`);
          console.error('Saved portfolio content is invalid:', validationError);
          return;
        }
        setContent(data.content);
        setContentError('');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 980px)');
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const syncScrollLock = () => {
      const shouldLock = menuOpen && mobileViewport.matches;
      document.body.style.overflow = shouldLock ? 'hidden' : previousBodyOverflow;
      document.documentElement.style.overflow = shouldLock ? 'hidden' : previousHtmlOverflow;
    };

    syncScrollLock();
    mobileViewport.addEventListener('change', syncScrollLock);
    return () => {
      mobileViewport.removeEventListener('change', syncScrollLock);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [menuOpen]);

  return (
    <PortfolioAdminProvider isAdmin={isAdmin} content={content} onContentSaved={handleContentSaved}>
    <>
      {!isAdminPage && <AnimatePresence>{loading && <Loader />}</AnimatePresence>}
      {!isAdminPage && <motion.div className="scroll-progress" style={{ scaleX: progress }} />}
      {!isAdminPage && isAdmin && <AdminModeBanner onSignOut={signOut} resumeEditor={resumeEditor} />}
      {!isAdminPage && (
        <Navbar
          content={content}
          theme={theme}
          menuOpen={menuOpen}
          onMenu={() => setMenuOpen((value) => !value)}
          onCloseMenu={() => setMenuOpen(false)}
          onTheme={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
        />
      )}
      {!isAdminPage && <ScrollToTop />}
      <main className={isAdminPage ? 'admin-main' : ''}>
        {!isAdminPage && contentError && <p className="content-error" role="alert">{contentError}</p>}
        <Routes>
          <Route path="/" element={<Home content={content} />} />
          <Route path="/about" element={<About content={content} />} />
          <Route path="/skills" element={<Skills content={content} />} />
          <Route path="/certificates" element={<Certificates content={content} />} />
          <Route path="/projects" element={<Projects content={content} />} />
          <Route path="/experience" element={<Experience content={content} />} />
          <Route path="/goals" element={<Goals content={content} />} />
          <Route path="/contact" element={<Contact content={content} />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer content={content} />}
    </>
    </PortfolioAdminProvider>
  );
}

function AdminModeBanner({ onSignOut, resumeEditor }) {
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    const result = await onSignOut();
    if (result.error) setError(`Sign out failed: ${result.error.message}`);
  };

  return (
    <div className="admin-mode-banner">
      <span>Admin preview</span>
      {error && <span role="alert">{error}</span>}
      <AdminEditButton editor={resumeEditor} showOnHome>Update resume</AdminEditButton>
      <button type="button" onClick={handleSignOut}>Sign out</button>
    </div>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const section = document.getElementById(hash.slice(1));
      if (section) {
        window.requestAnimationFrame(() => section.scrollIntoView({ behavior: 'smooth' }));
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

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
        Welcome to My Portfolio
      </motion.p>
    </motion.div>
  );
}

function Navbar({ content, theme, menuOpen, onMenu, onCloseMenu, onTheme }) {
  const { pathname, hash } = useLocation();
  const [visibleSection, setVisibleSection] = useState('');

  useEffect(() => {
    if (pathname !== '/') {
      setVisibleSection('');
      return undefined;
    }

    const sections = navItems
      .map((item) => document.getElementById(
        item.href === '/' ? 'home' : item.href.split('#')[1]
      ))
      .filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];
      if (current) setVisibleSection(current.target.id);
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  const isCurrentItem = (item) => {
    if (item.href === '/') {
      return pathname === '/' && (
        visibleSection === 'home' || (!visibleSection && !hash)
      );
    }
    const section = item.href.split('#')[1];
    return Boolean(section) && (
      (pathname === '/' && (
        visibleSection ? visibleSection === section : hash === `#${section}`
      )) ||
      pathname === `/${section}`
    );
  };

  return (
    <header className="navbar">
      <div className="sidebar-top">
        <Link className="brand" to="/" aria-label="Jorry Gumera home">
          <img src={content.brand.logo} alt={`${content.brand.name} logo`} />
          <span className="brand-copy">
            <strong>{content.brand.name}</strong>
            <small>{content.brand.subtitle}</small>
          </span>
        </Link>
        <button className="icon-button theme-toggle" onClick={onTheme} aria-label="Toggle color theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <p className="nav-heading">Explore</p>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            className={isCurrentItem(item) ? 'active' : ''}
            aria-current={isCurrentItem(item) ? 'page' : undefined}
            to={item.href}
          >
            <item.icon size={17} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="nav-actions">
        <button
          className="icon-button mobile-only"
          onClick={onMenu}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={isCurrentItem(item) ? 'active' : ''}
                aria-current={isCurrentItem(item) ? 'page' : undefined}
                to={item.href}
                onClick={onCloseMenu}
              >
                <item.icon size={17} aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Home({ content }) {
  return (
    <div className="home-page">
      <Hero content={content} />
      <About content={content} />
      <Skills content={content} />
      <Certificates content={content} />
      <Projects content={content} />
      <Experience content={content} />
      <Goals content={content} />
      <Contact content={content} />
    </div>
  );
}

function Hero({ content }) {
  const profileImageEditor = {
    title: 'Profile picture',
    mode: 'profile-photo',
    value: { profileImage: content.profileImage },
    commit: (edited, current) => ({ ...current, profileImage: edited.profileImage })
  };
  const eyebrowEditor = {
    title: 'Role eyebrow',
    value: { eyebrow: content.hero.eyebrow },
    commit: (edited, current) => ({
      ...current,
      hero: { ...current.hero, eyebrow: edited.eyebrow }
    })
  };
  const roleEditor = {
    title: 'Role',
    value: { role: content.hero.role },
    commit: (edited, current) => ({
      ...current,
      hero: { ...current.hero, role: edited.role }
    })
  };
  const summaryEditor = {
    title: 'Summary',
    value: { summary: content.hero.summary },
    commit: (edited, current) => ({
      ...current,
      hero: { ...current.hero, summary: edited.summary }
    })
  };
  const displayName = content.hero.name
    .trim()
    .toLocaleLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toLocaleUpperCase());
  const [firstName, ...remainingName] = displayName.split(/\s+/);
  const middleInitial = /^[A-Z]\.$/.test(remainingName[0] ?? '') ? remainingName[0] : null;
  const lastName = remainingName.slice(middleInitial ? 1 : 0);

  return (
    <section id="home" className="hero section">
      <div className="hero-visual">
        <div className="grid-glow" aria-hidden="true" />
        <ProfilePhoto src={content.profileImage} />
        <div className="hero-photo-edit">
          <AdminEditButton editor={profileImageEditor} showOnHome>Edit photo</AdminEditButton>
        </div>
      </div>
      <motion.div className="hero-content" initial="hidden" animate="show" variants={fadeUp}>
        <div className="hero-eyebrow-row">
          <p className="eyebrow"><Sparkles size={16} /> {content.hero.eyebrow}</p>
          <AdminEditButton editor={eyebrowEditor} showOnHome>Edit eyebrow</AdminEditButton>
        </div>
        <h1>
          <span className="hero-name-first">
            {firstName}{middleInitial ? ` ${middleInitial}` : ''}
          </span>
          {lastName.length > 0 && (
            <span className="hero-name-last">{lastName.join(' ')}</span>
          )}
        </h1>
        <div className="hero-role-row">
          <h2>{content.hero.role}</h2>
          <AdminEditButton editor={roleEditor} showOnHome>Edit role</AdminEditButton>
        </div>
        <div className="hero-summary-row">
          <p className="hero-copy">{content.hero.summary}</p>
          <AdminEditButton editor={summaryEditor} showOnHome>Edit summary</AdminEditButton>
        </div>
        <div className="availability-block" role="status">
          <span className="availability-indicator" aria-hidden="true" />
          <div>
            <strong>{content.hero.availabilityTitle}</strong>
            <p>{content.hero.availabilityText}</p>
          </div>
          <Link className="availability-link" to="/#contact">
            Let&apos;s Work Together <ArrowRight size={16} />
          </Link>
        </div>
        <div className="cta-row">
          <Link className="button primary" to="/#projects">
            View Projects <ArrowRight size={18} />
          </Link>
          <a className="button secondary" href={content.resume} download>
            Download Resume <Download size={18} />
          </a>
          <Link className="button ghost" to="/#contact">
            Contact Me <Mail size={18} />
          </Link>
        </div>
      </motion.div>
      <Link className="scroll-cue" to="/#about" aria-label="Scroll to about section">
        <span>Explore</span>
        <ChevronDown size={20} />
      </Link>
    </section>
  );
}

function ProfilePhoto({ src }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [src]);

  return (
    <div className="profile-photo-shell">
      {imageFailed ? (
        <div className="profile-photo-fallback" role="img" aria-label="Jorry E. Gumera profile photo">
          JG
        </div>
      ) : (
        <img
          className="profile-photo"
          src={src}
          alt="Jorry E. Gumera profile photo"
          width="640"
          height="640"
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}

function SectionIntro({ eyebrow, title, copy, adminEditor }) {
  return (
    <motion.div className="section-intro" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
      <p className="eyebrow">{eyebrow}</p>
      {title && <h2>{title}</h2>}
      {copy && <p>{copy}</p>}
      {adminEditor && (
        <AdminEditButton editor={adminEditor} showOnHome>
          {adminEditor.buttonLabel}
        </AdminEditButton>
      )}
    </motion.div>
  );
}

function About({ content }) {
  const { eyebrow, title, copy } = content.sections.about;
  const editor = {
    title: 'Edit About section',
    buttonLabel: 'Edit About',
    showOnHome: true,
    value: content.sections.about,
    commit: (edited, current) => ({
      ...current,
      sections: { ...current.sections, about: edited }
    })
  };
  return (
    <section id="about" className="section about-page">
      <SectionIntro eyebrow={eyebrow} title={title} copy={copy} adminEditor={editor} />
      <div className="about-grid">
        {content.aboutCards.map((card, index) => {
          const Icon = aboutIcons[card.icon] || UserRound;
          const cardEditor = {
            title: `Edit About card ${index + 1}`,
            mode: 'about-card',
            value: { paragraphs: [...card.paragraphs] },
            commit: (edited, current) => ({
              ...current,
              aboutCards: current.aboutCards.map((item, itemIndex) => (
                itemIndex === index ? { ...item, paragraphs: edited.paragraphs } : item
              ))
            })
          };
          const actions = [
            { label: 'Edit Card', editor: cardEditor, icon: Pencil }
          ];
          return (
            <motion.article className="glass-panel about-card" key={`${card.icon}-${index}`} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <div className="about-card-toolbar">
                <Icon aria-hidden="true" />
                <AdminCardMenu actions={actions} label={`About card ${index + 1}`} showOnHome />
              </div>
              {card.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function Skills({ content }) {
  const { eyebrow, title } = content.sections.skills;
  const addCardEditor = {
    title: 'Add skill card',
    value: { title: '' },
    commit: (edited, current) => ({
      ...current,
      skills: [...current.skills, { title: edited.title, icon: 'wrench', skills: [] }]
    })
  };
  return (
    <section id="skills" className="section alt-section skills-page">
      <SectionIntro eyebrow={eyebrow} title={title} />
      <div className="skills-add-toolbar">
        <AdminEditButton editor={addCardEditor} showOnHome icon={Plus}>Add Card</AdminEditButton>
      </div>
      <div className="skills-grid">
        {content.skills.map((group, index) => {
          const Icon = skillIcons[group.icon] || Wrench;
          const editCardEditor = {
            title: `Edit ${group.title} card`,
            value: { title: group.title },
            commit: (edited, current) => ({
              ...current,
              skills: current.skills.map((item, itemIndex) => (
                itemIndex === index ? { ...item, title: edited.title } : item
              ))
            })
          };
          const addSkillEditor = {
            title: `Add skill to ${group.title}`,
            value: { skill: '' },
            commit: (edited, current) => ({
              ...current,
              skills: current.skills.map((item, itemIndex) => (
                itemIndex === index
                  ? { ...item, skills: [...item.skills, edited.skill] }
                  : item
              ))
            })
          };
          const editSkillsEditor = {
            title: `Edit skills in ${group.title}`,
            value: { skills: [...group.skills] },
            commit: (edited, current) => ({
              ...current,
              skills: current.skills.map((item, itemIndex) => (
                itemIndex === index ? { ...item, skills: edited.skills } : item
              ))
            })
          };
          const deleteCardEditor = {
            title: `Delete ${group.title} card?`,
            mode: 'delete',
            value: {},
            commit: (_edited, current) => ({
              ...current,
              skills: current.skills.filter((_item, itemIndex) => itemIndex !== index)
            })
          };
          const actions = [
            { label: 'Add Skill', editor: addSkillEditor, icon: Plus },
            { label: 'Edit Card Name', editor: editCardEditor, icon: Pencil },
            { label: 'Edit Skills', editor: editSkillsEditor, icon: ListChecks },
            { label: 'Delete Card', editor: deleteCardEditor, icon: Trash2, danger: true }
          ];
          return (
            <motion.article
              className="skill-card"
              key={group.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <AdminCardMenu actions={actions} label={group.title} showOnHome />
              <div className="card-head skill-card-heading">
                <Icon size={22} />
                <h3>{group.title}</h3>
              </div>
              <div className="skill-pills">
                {group.skills.map((skill, skillIndex) => (
                  <span key={`${skill}-${skillIndex}`}>{skill}</span>
                ))}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function Projects({ content }) {
  const { eyebrow, title, copy } = content.sections.projects;
  const addProjectEditor = {
    title: 'Add project',
    mode: 'project-add',
    value: { title: '', description: '', tech: '', repo: '', demo: '' },
    commit: (edited, current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          title: edited.title.trim(),
          tag: 'Project',
          description: edited.description.trim(),
          tech: edited.tech.split(',').map((item) => item.trim()).filter(Boolean),
          accent: 'aqua',
          cover: edited.cover,
          coverClass: '',
          repo: edited.repo.trim(),
          demo: edited.demo.trim()
        }
      ]
    })
  };
  const editor = {
    title: 'Edit Projects Page',
    buttonLabel: 'Edit Page Section',
    value: content.sections.projects,
    commit: (edited, current) => ({
      ...current,
      sections: { ...current.sections, projects: edited }
    })
  };
  return (
    <section id="projects" className="section projects-page">
      <SectionIntro eyebrow={eyebrow} title={title} copy={copy} adminEditor={editor} />
      <div className="projects-add-toolbar">
        <AdminEditButton editor={addProjectEditor} icon={Plus} showOnHome>Add Project</AdminEditButton>
      </div>
      <div className="project-grid">
        {content.projects.map((project, index) => {
          const editProjectEditor = {
            title: `Edit ${project.title}`,
            mode: 'project-edit',
            value: {
              title: project.title,
              description: project.description,
              tech: project.tech.join(', '),
              repo: project.repo || '',
              demo: project.demo || '',
              cover: project.cover
            },
            commit: (edited, current) => ({
              ...current,
              projects: current.projects.map((item, itemIndex) => (
                itemIndex === index
                  ? {
                    ...item,
                    title: edited.title.trim(),
                    description: edited.description.trim(),
                    tech: edited.tech.split(',').map((tech) => tech.trim()).filter(Boolean),
                    repo: edited.repo.trim(),
                    demo: edited.demo.trim(),
                    cover: edited.cover
                  }
                  : item
              ))
            })
          };
          const deleteProjectEditor = {
            title: `Delete ${project.title}?`,
            mode: 'delete',
            confirmationText: 'This will permanently delete this project from your portfolio.',
            value: {},
            commit: (_edited, current) => ({
              ...current,
              projects: current.projects.filter((_item, itemIndex) => itemIndex !== index)
            })
          };
          return (
            <motion.article
              className={`project-card editable-project-card ${project.accent}`}
              key={`${project.title}-${index}`}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <AdminCardMenu
                actions={[
                  { label: 'Edit Project', editor: editProjectEditor, icon: Pencil },
                  { label: 'Delete Project', editor: deleteProjectEditor, icon: Trash2, danger: true }
                ]}
                label={project.title}
                showOnHome
              />
              <div className={`project-preview ${project.coverClass || ''}`.trim()}>
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
                  {project.repo && (
                    <a className="button compact secondary" href={project.repo} target="_blank" rel="noreferrer">
                      <GitBranch size={17} /> Repository
                    </a>
                  )}
                  {project.demo && (
                    <a className="button compact ghost" href={project.demo} target="_blank" rel="noreferrer">
                      <ExternalLink size={17} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function Certificates({ content }) {
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const { eyebrow, title, copy } = content.sections.certificates;
  const addCertificateEditor = {
    title: 'Add certificate',
    mode: 'certificate-add',
    value: { title: '' },
    commit: (edited, current) => ({
      ...current,
      certificates: [...current.certificates, { title: edited.title, file: edited.file }]
    })
  };
  const editor = {
    title: 'Edit Certificates Page',
    buttonLabel: 'Edit Page Section',
    value: content.sections.certificates,
    commit: (edited, current) => ({
      ...current,
      sections: { ...current.sections, certificates: edited }
    })
  };

  useEffect(() => {
    if (!selectedCertificate) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedCertificate(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCertificate]);

  return (
    <>
      <section id="certificates" className="section certificates-page">
        <SectionIntro eyebrow={eyebrow} title={title} copy={copy} adminEditor={editor} />
        <div className="certificates-add-toolbar">
          <AdminEditButton editor={addCertificateEditor} icon={Plus} showOnHome>Add Certificate</AdminEditButton>
        </div>
        <div className="project-grid">
          {content.certificates.map((certificate, index) => {
            const editCertificateEditor = {
              title: `Edit ${certificate.title}`,
              mode: 'certificate-edit',
              value: { ...certificate },
              commit: (edited, current) => ({
                ...current,
                certificates: current.certificates.map((item, itemIndex) => (
                  itemIndex === index ? edited : item
                ))
              })
            };
            const deleteCertificateEditor = {
              title: `Delete ${certificate.title}?`,
              mode: 'delete',
              confirmationText: 'This will permanently delete this certificate.',
              value: {},
              commit: (_edited, current) => ({
                ...current,
                certificates: current.certificates.filter((_item, itemIndex) => itemIndex !== index)
              })
            };
            return (
              <motion.article
                className="project-card certificate-card"
                key={`${certificate.title}-${index}`}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <AdminCardMenu
                  actions={[
                    { label: 'Edit Certificate', editor: editCertificateEditor, icon: Pencil },
                    { label: 'Delete Certificate', editor: deleteCertificateEditor, icon: Trash2, danger: true }
                  ]}
                  label={certificate.title}
                  showOnHome
                />
                <div className="project-preview certificate-preview">
                  {isPdfAsset(certificate.file) ? (
                    <div className="certificate-pdf-card"><ScrollText size={32} /> PDF certificate</div>
                  ) : (
                    <img
                      className="project-cover certificate-cover"
                      src={certificate.file}
                      alt={certificate.title}
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="project-body">
                  <p className="project-tag">Certificate</p>
                  <h3>{certificate.title.replace(/\.[^/.]+$/, '')}</h3>
                  <div className="project-actions">
                    <button
                      className="button compact secondary"
                      type="button"
                      onClick={() => setSelectedCertificate(certificate)}
                    >
                      <ExternalLink size={17} /> View Certificate
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
      <AnimatePresence>
        {selectedCertificate && (
          <motion.div
            className="certificate-modal"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCertificate(null)}
          >
            <motion.div
              className="certificate-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="certificate-dialog-title"
              initial={{ scale: 0.96, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="certificate-dialog-header">
                <div className="certificate-dialog-heading">
                  <span className="certificate-dialog-kicker">Certificate preview</span>
                  <h2 id="certificate-dialog-title">
                    {selectedCertificate.title.replace(/\.[^/.]+$/, '').replaceAll('_', ' ')}
                  </h2>
                </div>
                <button
                  className="certificate-dialog-close"
                  type="button"
                  aria-label="Close certificate"
                  onClick={() => setSelectedCertificate(null)}
                >
                  <X size={28} />
                </button>
              </div>
              <div className="certificate-dialog-content">
                <div className="certificate-image-frame">
                  {isPdfAsset(selectedCertificate.file) ? (
                    <iframe src={selectedCertificate.file} title={selectedCertificate.title} />
                  ) : (
                    <img src={selectedCertificate.file} alt={selectedCertificate.title} />
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Experience({ content }) {
  const { eyebrow, title } = content.sections.experience;
  const editor = {
    title: 'Experience section',
    buttonLabel: 'Edit Experience',
    value: {
      eyebrow: content.sections.experience.eyebrow,
      title: content.sections.experience.title
    },
    commit: (edited, current) => ({
      ...current,
      sections: {
        ...current.sections,
        experience: { ...current.sections.experience, ...edited }
      }
    })
  };
  const addExperienceEditor = {
    title: 'Add experience',
    value: { title: '', items: [''] },
    commit: (edited, current) => ({
      ...current,
      experience: [...current.experience, { icon: 'briefcase', ...edited }]
    })
  };
  return (
    <section id="experience" className="section alt-section experience-page">
      <SectionIntro eyebrow={eyebrow} title={title} adminEditor={editor} />
      <div className="experience-add-toolbar">
        <AdminEditButton editor={addExperienceEditor} icon={Plus} showOnHome>Add Experience</AdminEditButton>
      </div>
      <div className="experience-grid">
        {content.experience.map((entry, index) => {
          const editExperienceEditor = {
            title: `Edit ${entry.title} card`,
            value: { title: entry.title, items: [...entry.items] },
            commit: (edited, current) => ({
              ...current,
              experience: current.experience.map((item, itemIndex) => (
                itemIndex === index ? { ...item, ...edited } : item
              ))
            })
          };
          const deleteExperienceEditor = {
            title: `Delete ${entry.title}?`,
            mode: 'delete',
            confirmationText: 'This will permanently delete this experience entry from your portfolio.',
            value: {},
            commit: (_edited, current) => ({
              ...current,
              experience: current.experience.filter((_item, itemIndex) => itemIndex !== index)
            })
          };
          const actions = [
            { label: 'Edit Card', editor: editExperienceEditor, icon: Pencil },
            { label: 'Delete Experience', editor: deleteExperienceEditor, icon: Trash2, danger: true }
          ];
          return (
            <ExperienceCard
              key={`${entry.title}-${index}`}
              icon={experienceIcons[entry.icon] || BriefcaseBusiness}
              title={entry.title}
              items={entry.items}
              actions={actions}
            />
          );
        })}
      </div>
    </section>
  );
}

function ExperienceCard({ icon: Icon, title, items, actions }) {
  return (
    <motion.article className="glass-panel experience-card" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
      <AdminCardMenu actions={actions} label={title} showOnHome />
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

function Goals({ content }) {
  const { eyebrow, title } = content.sections.goals;
  const editor = {
    title: 'Goals section',
    buttonLabel: 'Edit Goals',
    value: { section: content.sections.goals, goals: content.goals },
    commit: (edited, current) => ({
      ...current,
      sections: { ...current.sections, goals: edited.section },
      goals: edited.goals
    })
  };
  return (
    <section id="goals" className="section goals-page">
      <SectionIntro eyebrow={eyebrow} title={title} adminEditor={editor} />
      <div className="timeline">
        {content.goals.map((goal, index) => (
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

function Contact({ content }) {
  const { eyebrow, title, copy } = content.sections.contact;
  const editor = {
    title: 'Contact section',
    buttonLabel: 'Edit Contact',
    value: {
      section: content.sections.contact,
      contact: content.contact,
      resume: content.resume,
      footer: content.footer
    },
    commit: (edited, current) => ({
      ...current,
      sections: { ...current.sections, contact: edited.section },
      contact: edited.contact,
      resume: edited.resume,
      footer: edited.footer
    })
  };
  return (
    <section id="contact" className="section contact-section contact-page">
      <SectionIntro eyebrow={eyebrow} title={title} copy={copy} adminEditor={editor} />
      <div className="contact-grid">
        <div className="contact-panel">
          {content.contact.map((entry, index) => {
            const Icon = contactIcons[entry.icon] || ExternalLink;
            const isExternal = /^https?:\/\//i.test(entry.href);
            return (
              <a href={entry.href} key={`${entry.href}-${index}`} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noreferrer' : undefined}>
                <Icon size={18} /> {entry.label}
              </a>
            );
          })}
          <a className="button primary" href={content.resume} download>
            Download Resume <Download size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer({ content }) {
  return (
    <footer className="footer">
      <p></p>
      <span>{content.footer}</span>
    </footer>
  );
}

export default App;

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AdminAuthProvider>
      <App />
    </AdminAuthProvider>
  </BrowserRouter>
);

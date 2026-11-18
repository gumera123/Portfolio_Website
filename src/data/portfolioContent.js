export const DEFAULT_PORTFOLIO_CONTENT = {
  brand: {
    name: 'Jorry Gumera',
    subtitle: 'PORTFOLIO',
    logo: '/logo.jpg'
  },
  profileImage: '/profile.jpg',
  resume: '/My_Resume.pdf',
  hero: {
    eyebrow: 'BSIT Graduate',
    name: 'JORRY E. GUMERA',
    role: 'Full-Stack Developer/ IT Assistant',
    summary:
      'Full-stack developer and IT support specialist focused on building scalable web and mobile applications, modern Laravel systems, and reliable user-centered solutions. Experienced in MERN stack development, deployment workflows, technical troubleshooting, and practical system management.',
    availabilityTitle: 'Open to new opportunities',
    availabilityText: 'Available for full-stack, backend, and IT support roles.'
  },
  sections: {
    about: {
      eyebrow: 'About',
      title:
        'Full-stack developer with practical experience in web systems, IT troubleshooting, and user-centered solutions.',
      copy:
        'Focused on building reliable software, creating user-centered experiences, and continuously improving technical skills through real-world practice.'
    },
    skills: {
      eyebrow: 'Skills',
      title: 'Modern web, mobile, backend, and technical support capability.'
    },
    certificates: {
      eyebrow: 'Certificates',
      title: 'Verified learning, technical certifications, and professional development.',
      copy:
        'A collection of certificates, training completions, and professional development achievements.'
    },
    projects: {
      eyebrow: 'Projects',
      title: 'Scalable solutions built for production projects.',
      copy:
        'Engineering high-impact applications and reliable systems with a focus on stability and business growth.'
    },
    experience: {
      eyebrow: 'Experience',
      title: 'Practical responsibility across technical and operational environments.'
    },
    goals: {
      eyebrow: 'Goals',
      title: 'Professional roadmap for the next stage of growth.'
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Available for full-stack development opportunities.',
      copy:
        'For recruiter inquiries, project conversations, or technical opportunities, reach out directly.'
    }
  },
  aboutCards: [
    {
      icon: 'graduation',
      paragraphs: [
        'Jorry E. Gumera is a Bachelor of Science in Information Technology graduate with hands-on experience in full-stack development, mobile application development, and modern web systems.',
        'He has developed multiple real-world projects including inventory management systems, mobile applications, and web-based platforms using modern technologies and collaborative development practices.'
      ]
    },
    {
      icon: 'shield',
      paragraphs: [
        'His technical experience includes MERN stack development, GitHub workflows, frontend and backend development, deployment processes, system debugging, technical troubleshooting, and project documentation.',
        'He is also a CSS NC II certificate holder, strengthening his practical knowledge in computer systems servicing, hardware troubleshooting, networking fundamentals, and technical support.'
      ]
    }
  ],
  skills: [
    { title: 'Frontend', icon: 'code', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'] },
    { title: 'Backend', icon: 'server', skills: ['Node.js', 'Express.js', 'Laravel'] },
    { title: 'Database', icon: 'database', skills: ['MongoDB', 'MongoDB Atlas', 'Firebase', 'Supabase'] },
    {
      title: 'Deployment & Tools',
      icon: 'terminal',
      skills: ['Git', 'GitHub', 'Linux', 'SSH', 'Server Deployment']
    },
    {
      title: 'Technical & Professional',
      icon: 'wrench',
      skills: [
        'Technical Troubleshooting',
        'System Debugging',
        'Documentation',
        'Team Collaboration',
        'Hardware & Software Support',
        'Computer Systems Servicing (CSS NC II)'
      ]
    }
  ],
  projects: [
    {
      title: 'NSync App',
      tag: 'Mobile Collaboration Platform',
      description:
        'A full-stack mobile application for collaboration and productivity designed to help teams manage tasks, organize workflows, track progress, and improve communication in real time.',
      tech: ['React Native', 'Expo', 'Firebase Cloud Services'],
      accent: 'aqua',
      cover: '/project-covers/nsync-app.jpg',
      coverClass: 'cover-nsync',
      repo: 'https://github.com/gumera123/NSyncTenantApp',
      demo: ''
    },
    {
      title: 'Higa App',
      tag: 'Mobile App Experience',
      description:
        'A mobile application project focused on delivering a clean, practical user experience with an emphasis on fast access to core features and smooth everyday use.',
      tech: ['Mobile UI', 'App Development', 'User Experience'],
      accent: 'emerald',
      cover: '/project-covers/higa-app.svg',
      coverClass: 'cover-higa',
      repo: 'https://github.com/Jaykerd123/HigaononTranslator',
      demo: ''
    },
    {
      title: 'Sui Move Smart Contracts Portfolio',
      tag: 'Blockchain Development',
      description:
        'A portfolio project highlighting smart contract work built around the Sui Move ecosystem, showing practical blockchain development skills and on-chain logic.',
      tech: ['Sui Move', 'Smart Contracts', 'Blockchain'],
      accent: 'aqua',
      cover: '/project-covers/sui-move-smart-contracts-portfolio.png',
      coverClass: 'cover-sui',
      repo: 'https://github.com/gumera123/DEVCONSUI_MoveCodeCamp2026_Level1_Gumera',
      demo: ''
    },
    {
      title: 'COT Inventory System',
      tag: 'Live Inventory Management',
      description:
        'A deployed inventory management platform designed for product tracking, reporting, and record management in a live server environment.',
      tech: ['MongoDB', 'Express.js', 'React', 'Node.js'],
      accent: 'emerald',
      cover: '/project-covers/cot-inventory-system.png',
      coverClass: 'cover-cot',
      repo: 'https://github.com/berttot/COT-Inventory-Management-System',
      demo: ''
    }
  ],
  certificates: [
    { title: 'AI_Literacy_Certification.png', file: '/certificates/AI_Literacy_Certification.png' },
    {
      title: 'Certificate_of_Participation_Jorry_Gumera.png',
      file: '/certificates/Certificate_of_Participation_Jorry_Gumera.png'
    },
    {
      title: 'CCNA Switching Routing and Wireless Essentials.png',
      file: '/certificates/CCNA Switching Routing and Wireless Essentials.png'
    },
    {
      title: 'Computer Systems Servicing NC II',
      file: '/certificates/Computer_System_Servicing_NCII.jpg'
    },
    { title: 'DEVCON_Certificate.png', file: '/certificates/DEVCON_Certificate.png' },
    { title: 'DIGI-MC_2025_Certificate.png', file: '/certificates/DIGI-MC_2025_Certificate.png' },
    { title: 'Netwoking_2_Certificate.png', file: '/certificates/Netwoking_2_Certificate.png' },
    {
      title: 'Wadhwani Foundation Certificate.jpg',
      file: '/certificates/Wadhwani Foundation Certificate.jpg'
    }
  ],
  experience: [
    {
      icon: 'briefcase',
      title: 'Technical Support Experience',
      items: [
        'Provided technical troubleshooting and IT support assistance',
        'Handled system debugging, setup, and configuration tasks',
        'Assisted with practical problem-solving in real-world technical environments'
      ]
    },
    {
      icon: 'check',
      title: 'Operations & Management Experience',
      items: [
        'Managed boarding house responsibilities and daily operations',
        'Demonstrated adaptability, organization, and responsibility while balancing academic and technical work'
      ]
    }
  ],
  goals: [
    'Build scalable, production-ready systems',
    'Advance backend architecture expertise',
    'Improve DevOps and deployment practices',
    'Gain professional software engineering experience',
    'Continue growing as a full-stack developer'
  ],
  contact: [
    { icon: 'mail', label: 'gumerajorry00@gmail.com', href: 'mailto:gumerajorry00@gmail.com' },
    { icon: 'phone', label: '0938 314 4573', href: 'tel:+639383144573' },
    { icon: 'github', label: 'github.com/gumera123', href: 'https://github.com/gumera123' },
    {
      icon: 'external',
      label: 'facebook.com/jorry.Eredera',
      href: 'https://www.facebook.com/jorry.Eredera'
    },
    {
      icon: 'external',
      label: 'linkedin.com/in/jorry-gumera',
      href: 'https://www.linkedin.com/in/jorry-gumera-3a56b4385/?isSelfProfile=true'
    },
    { icon: 'external', label: 'instagram.com', href: 'https://www.instagram.com/' }
  ],
  footer: '© 2026 Jorry E. Gumera. Full-Stack Developer.'
};

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string';
const hasText = (value) => isText(value) && value.trim().length > 0;
const hasTextArray = (value) => Array.isArray(value) && value.every(isText);
const isSafeAssetUrl = (value) =>
  hasText(value) && (/^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value));
const isSafeLink = (value) =>
  hasText(value) && (/^https?:\/\//i.test(value) || /^(mailto|tel):/i.test(value) || /^\/(?!\/)/.test(value));

export function validatePortfolioContent(value) {
  if (!isObject(value)) return 'Content must be a JSON object.';
  if (!isObject(value.brand) || !hasText(value.brand.name) || !hasText(value.brand.subtitle) || !isSafeAssetUrl(value.brand.logo)) {
    return 'brand must include a name, subtitle, and safe logo URL.';
  }
  if (!isSafeAssetUrl(value.profileImage) || !isSafeAssetUrl(value.resume)) {
    return 'profileImage and resume must be safe asset URLs.';
  }
  if (!isObject(value.hero) || !['eyebrow', 'name', 'role', 'summary', 'availabilityTitle', 'availabilityText'].every((key) => hasText(value.hero[key]))) {
    return 'hero must include its required text fields.';
  }
  const sectionKeys = ['about', 'skills', 'certificates', 'projects', 'experience', 'goals', 'contact'];
  if (!isObject(value.sections) || !sectionKeys.every((key) => isObject(value.sections[key]))) {
    return 'sections must include all portfolio section settings.';
  }
  if (!Object.values(value.sections).every((section) =>
    hasText(section.eyebrow) && hasText(section.title) && (section.copy === undefined || isText(section.copy))
  )) {
    return 'Each section must include its eyebrow, title, and optional copy text.';
  }
  if (!Array.isArray(value.aboutCards) || !value.aboutCards.every((card) =>
    isObject(card) && hasText(card.icon) && hasTextArray(card.paragraphs)
  )) {
    return 'aboutCards must be a list of cards with paragraph lists.';
  }
  if (!Array.isArray(value.skills) || !value.skills.every((group) =>
    isObject(group) && hasText(group.title) && hasText(group.icon) &&
    hasTextArray(group.skills) && group.skills.every((skill) => skill.trim().length > 0)
  )) {
    return 'skills must be a list of titled groups with skill lists.';
  }
  if (!Array.isArray(value.projects) || !value.projects.every((project) =>
    isObject(project) && ['title', 'tag', 'description'].every((key) => hasText(project[key])) &&
    isSafeAssetUrl(project.cover) && hasTextArray(project.tech) &&
    ['repo', 'demo'].every((key) => project[key] === undefined || project[key] === '' || /^https?:\/\//i.test(project[key]))
  )) {
    return 'projects must be a list with title, tag, description, cover, and tech fields.';
  }
  if (!Array.isArray(value.certificates) || !value.certificates.every((certificate) =>
    isObject(certificate) && hasText(certificate.title) && isSafeAssetUrl(certificate.file)
  )) {
    return 'certificates must be a list with title and file fields.';
  }
  if (!Array.isArray(value.experience) || !value.experience.every((entry) =>
    isObject(entry) && hasText(entry.icon) && hasText(entry.title) && hasTextArray(entry.items)
  )) {
    return 'experience must be a list with titled entries and item lists.';
  }
  if (!hasTextArray(value.goals)) return 'goals must be a list of text values.';
  if (!Array.isArray(value.contact) || !value.contact.every((entry) =>
    isObject(entry) && hasText(entry.label) && isSafeLink(entry.href) && hasText(entry.icon)
  )) {
    return 'contact must be a list of safe links with labels and URLs.';
  }
  if (!hasText(value.footer)) return 'footer must be a text value.';
  return null;
}

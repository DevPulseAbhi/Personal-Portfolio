import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Copy,
  Mail,
  Menu,
  Moon,
  MapPin,
  Network,
  Search,
  Server,
  Sparkles,
  Sun,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { portfolio } from "./config/portfolio";
import { fetchGithubData, summarizeRepositories } from "./services/github";

const navItems = [
  "About",
  "Education",
  "Skills",
  "Projects",
  "GitHub",
  "Contributions",
  "Experience",
  "Contact",
];
const fadeUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };
const projectIcons = {
  learning: BookOpen,
  systempulse: Activity,
  routeforge: Network,
};

function SectionLabel({ children, index }) {
  return (
    <div className="section-label">
      <span>{index}</span>
      <span>{children}</span>
    </div>
  );
}

function ContributionGraph({ state }) {
  if (state.status === "loading")
    return (
      <div className="contribution-panel">
        <div>
          <span className="eyebrow">Contribution activity</span>
          <h3>Loading the real signal.</h3>
        </div>
        <span className="github-loading">
          Fetching contribution data <span className="loading-bar" />
        </span>
      </div>
    );
  if (state.status === "error")
    return (
      <div className="contribution-panel contribution-empty">
        <div>
          <span className="eyebrow">Contribution activity</span>
          <h3>Graph unavailable right now.</h3>
        </div>
        <p>
          Set the server-only <code>GITHUB_TOKEN</code> in Vercel to enable
          authenticated contribution history. No contribution data is fabricated
          here.
        </p>
      </div>
    );

  return (
    <div className="contribution-panel">
      <div className="contribution-heading">
        <div>
          <span className="eyebrow">Contribution activity · {state.year}</span>
          <h3>{state.total.toLocaleString()} contributions</h3>
        </div>
        <span className="contribution-source">Live from GitHub GraphQL</span>
      </div>
      <div
        className="contribution-grid"
        aria-label={`${state.total} GitHub contributions in ${state.year}`}
      >
        {state.weeks
          .flatMap((week) => week.contributionDays)
          .map((day) => (
            <span
              key={day.date}
              title={`${day.contributionCount} contributions on ${day.date}`}
              className={`level-${Math.min(day.contributionCount, 4)}`}
            />
          ))}
      </div>
      <div className="contribution-legend">
        <span>Less</span>
        <i className="level-0" />
        <i className="level-1" />
        <i className="level-2" />
        <i className="level-3" />
        <i className="level-4" />
        <span>More</span>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState("dark");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [github, setGithub] = useState({
    status: "loading",
    profile: null,
    repositories: [],
  });
  const [contributions, setContributions] = useState({
    status: "loading",
    year: new Date().getFullYear(),
    total: 0,
    weeks: [],
  });
  const [repoSearch, setRepoSearch] = useState("");
  const [repoSort, setRepoSort] = useState("updated");
  const [copied, setCopied] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [contactStatus, setContactStatus] = useState("idle");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const revealElements = document.querySelectorAll("[data-reveal]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -48px" }
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchGithubData(portfolio.githubUsername)
      .then(({ profile, repositories }) =>
        setGithub({ status: "ready", profile, repositories }),
      )
      .catch(() =>
        setGithub({ status: "error", profile: null, repositories: [] }),
      );

    fetch(`/api/github-contributions?year=${new Date().getFullYear()}`, {
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Contribution data unavailable");
        return response.json();
      })
      .then((calendar) =>
        setContributions({
          status: "ready",
          year: new Date().getFullYear(),
          total: calendar.totalContributions,
          weeks: calendar.weeks,
        }),
      )
      .catch(() =>
        setContributions((current) => ({ ...current, status: "error" })),
      );
  }, []);

  const summary = useMemo(
    () => summarizeRepositories(github.repositories),
    [github.repositories],
  );
  const filteredRepos = useMemo(
    () =>
      github.repositories
        .filter((repository) =>
          `${repository.name} ${repository.description || ""} ${repository.language || ""}`
            .toLowerCase()
            .includes(repoSearch.toLowerCase()),
        )
        .sort((a, b) => {
          if (repoSort === "stars")
            return b.stargazers_count - a.stargazers_count;
          if (repoSort === "name") return a.name.localeCompare(b.name);
          return new Date(b.updated_at) - new Date(a.updated_at);
        }),
    [github.repositories, repoSearch, repoSort],
  );

  function copyEmail() {
    navigator.clipboard.writeText(portfolio.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function submitContact(event) {
    event.preventDefault();
    setContactStatus("ready");
    window.location.href = `mailto:${portfolio.email}?subject=Portfolio inquiry from ${event.currentTarget.name.value}&body=${encodeURIComponent(event.currentTarget.message.value)}`;
  }

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="nav-wrap">
        <nav className="nav container" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Abhinav Deshwal home">
            <span>AD</span>
            <strong>
              ABHINAV<span>.</span>
            </strong>
          </a>
          <div className={`nav-links ${mobileOpen ? "is-open" : ""}`}>
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
          <div className="nav-actions">
            <button
              className="icon-button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <a className="nav-cta" href={`mailto:${portfolio.email}`}>
              Let's talk <ArrowUpRight size={15} />
            </a>
            <button
              className="menu-button icon-button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero container" data-reveal="hero">
          <div className="hero-copy">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="kicker"
            >
              <span className="pulse-dot" /> {portfolio.specialization}
            </motion.div>
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.08 }}
            >
              Building systems
              <br />
              <em>that move ideas.</em>
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="hero-intro"
            >
              I'm Abhinav, an MCA student and aspiring cloud engineer interested
              in the space where thoughtful software meets dependable
              infrastructure.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="hero-actions"
            >
              <a className="button button-primary" href="#projects">
                Explore my work <ArrowUpRight size={16} />
              </a>
              <a
                className="button button-quiet"
                href={portfolio.githubUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Code2 size={16} /> GitHub
              </a>
            </motion.div>
            <div className="hero-meta">
              <span>
                <MapPin size={14} /> {portfolio.location}
              </span>
              <span>
                <Terminal size={14} /> {portfolio.title.split(" | ")[0]}
              </span>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="hero-visual"
          >
            <div className="portrait-card">
              <div className="portrait-grid" />
              <div className="abstract-scene" role="img" aria-label="Abstract orbital system visual">
                <div className="scene-haze" />
                <div className="scene-orbit scene-orbit-wide" />
                <div className="scene-orbit scene-orbit-tall" />
                <div className="scene-ring ring-back" />
                <div className="scene-core">
                  <div className="core-surface" />
                  <div className="core-cut" />
                  <div className="core-highlight" />
                </div>
                <div className="scene-node node-primary" />
                <div className="scene-node node-secondary" />
                <div className="scene-tag">FLUID / SYSTEMS</div>
              </div>
              <div className="portrait-caption">
                <span>ABSTRACT / 001</span>
                <strong>Ideas in motion.</strong>
              </div>
              <div className="orbit orbit-a" />
              <div className="orbit orbit-b" />
              <span className="coord coord-one">28.9845° N</span>
              <span className="coord coord-two">77.7064° E</span>
            </div>
            <div className="floating-note note-top">
              <Sparkles size={14} />
              <span>
                Always learning
                <br />
                <strong>one layer deeper</strong>
              </span>
            </div>
            <div className="floating-note note-bottom">
              <span className="mini-line" /> availability{" "}
              <strong>by configuration</strong>
            </div>
          </motion.div>
        </section>

        <section id="about" className="section container about-section" data-reveal>
          <div className="about-heading">
            <SectionLabel index="01" children="About" />
            <h2>
              Beyond
              <br />
              <em>the code.</em>
            </h2>
          </div>
          <div className="about-content">
            <p className="lead">
              I like turning open-ended problems into clear, useful systems. My
              current focus is cloud computing and DevOps, with a growing
              toolkit across full-stack development, automation, and AI-assisted
              workflows.
            </p>
            <p>
              After a B.Sc. in Computer Science, I am pursuing my MCA at
              Chandigarh University. I learn by building practical applications,
              taking them apart, and improving the pieces that make them
              reliable.
            </p>
            <div className="principle">
              <span>“</span>
              <div>
                <strong>
                  Learn continuously.
                  <br />
                  Build fearlessly.
                  <br />
                  Improve relentlessly.
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section id="education" className="section container" data-reveal>
          <SectionLabel index="02" children="Education" />
          <div className="section-heading">
            <h2>
              The foundation
              <br />
              <em>underneath it all.</em>
            </h2>
            <p>
              Every useful system starts with a willingness to understand the
              fundamentals.
            </p>
          </div>
          <div className="education-grid">
            {portfolio.education.map((item, index) => (
              <motion.article
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 18 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="education-item"
                key={item.degree}
              >
                <span className="edu-number">0{index + 1}</span>
                <div>
                  <span className="eyebrow">{item.period}</span>
                  <h3>{item.degree}</h3>
                  <p>{item.school}</p>
                  {item.detail && <small>{item.detail}</small>}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="skills" className="section container" data-reveal>
          <SectionLabel index="03" children="Toolkit" />
          <div className="section-heading split-heading">
            <h2>
              Tools for
              <br />
              <em>real work.</em>
            </h2>
            <p>
              Comfortable across the stack, currently going deeper into the
              infrastructure that makes software dependable.
            </p>
          </div>
          <div className="skills-grid">
            {portfolio.skillGroups.map((group) => (
              <div className="skill-group" key={group.label}>
                <span className="eyebrow">{group.label}</span>
                <div className="skill-list">
                  {group.items.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="section container projects-section" data-reveal>
          <SectionLabel index="04" children="Selected work" />
          <div className="section-heading split-heading">
            <h2>
              Things I’ve
              <br />
              <em>been building.</em>
            </h2>
            <p>
              A selection of concepts and applications shaped by curiosity,
              iteration, and a bias toward making ideas tangible.
            </p>
          </div>
          <div className="projects-grid">
            {portfolio.projects.map((project, index) => (
              <motion.article
                whileHover={{ y: -5 }}
                className={`project-card accent-${project.accent} ${index === 0 ? "project-featured" : ""}`}
                key={project.key}
                onClick={() => setSelectedProject(project)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedProject(project);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View ${project.name} details`}
              >
                <div className="project-art">
                  <span className="project-index">0{index + 1}</span>
                    <div className="art-symbol">
                      {(() => {
                        const ProjectIcon = projectIcons[project.icon] || [MapPin, Sparkles, Server, Code2, Zap, Network][index];
                        return <ProjectIcon />;
                      })()}
                    </div>
                  <span className="art-corner">
                    {project.key.toUpperCase()} / 2026
                  </span>
                </div>
                <div className="project-info">
                  <span className="eyebrow">{project.eyebrow}</span>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <div className="project-footer">
                    <div className="stack-tags">
                      {project.stack.slice(0, 3).map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                    <button
                      className="round-arrow"
                      aria-label={`View ${project.name} details`}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="github" className="section github-section" data-reveal>
          <div className="container">
            <SectionLabel index="05" children="Live signal" />
            <div className="github-header">
              <div>
                <h2>
                  Open source,
                  <br />
                  <em>open process.</em>
                </h2>
                <p>
                  Real-time public activity from{" "}
                  <a
                    href={portfolio.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{portfolio.githubUsername}
                  </a>
                  .
                </p>
              </div>
              <a
                className="button button-quiet"
                href={portfolio.githubUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Code2 size={16} /> View profile <ArrowUpRight size={15} />
              </a>
            </div>
            <div id="contributions">
              <ContributionGraph state={contributions} />
            </div>
            {github.status === "loading" && (
              <div className="github-loading">
                Fetching public GitHub data <span className="loading-bar" />
              </div>
            )}
            {github.status === "error" && (
              <div className="github-error">
                GitHub data is temporarily unavailable. The rest of the
                portfolio is still here, intact.
              </div>
            )}
            {github.status === "ready" && (
              <>
                <div className="github-stats">
                  <div>
                    <strong>{github.profile.public_repos}</strong>
                    <span>Public repos</span>
                  </div>
                  <div>
                    <strong>{github.profile.followers}</strong>
                    <span>Followers</span>
                  </div>
                  <div>
                    <strong>{summary.stars}</strong>
                    <span>Stars received</span>
                  </div>
                  <div>
                    <strong>{github.profile.following}</strong>
                    <span>Following</span>
                  </div>
                </div>
                <div className="repo-toolbar">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      value={repoSearch}
                      onChange={(event) => setRepoSearch(event.target.value)}
                      placeholder="Search repositories"
                      aria-label="Search repositories"
                    />
                  </div>
                  <select
                    value={repoSort}
                    onChange={(event) => setRepoSort(event.target.value)}
                    aria-label="Sort repositories"
                  >
                    <option value="updated">Recently updated</option>
                    <option value="stars">Most stars</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>
                <div className="repo-list">
                  {filteredRepos.map((repo) => (
                    <a
                      className="repo-row"
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div>
                        <strong>{repo.name}</strong>
                        <span>
                          {repo.description || "No description available."}
                        </span>
                      </div>
                      <div className="repo-meta">
                        <span>{repo.language || "Various"}</span>
                        <span>★ {repo.stargazers_count}</span>
                        <ArrowUpRight size={15} />
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section
          id="experience"
          className="section container experience-section"
          data-reveal
        >
          <SectionLabel index="06" children="Experience" />
          <div className="section-heading split-heading">
            <h2>
              Still becoming
              <br />
              <em>the engineer.</em>
            </h2>
            <p>
              The timeline is less about titles and more about the kinds of
              problems I keep choosing to spend time with.
            </p>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-date">NOW / 2026</span>
              <div>
                <h3>MCA · Cloud Computing & DevOps</h3>
                <p>
                  Deepening the foundations: cloud infrastructure, Linux,
                  deployment workflows, and the systems thinking behind reliable
                  software.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-date">RECENTLY</span>
              <div>
                <h3>Independent software development</h3>
                <p>
                  Building full-stack applications, AI-assisted tools, and
                  data-focused experiments that turn coursework into something
                  practical.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-date">PECATHON</span>
              <div>
                <h3>Team leadership & collaborative building</h3>
                <p>
                  Exploring a privacy-focused browser agent concept while
                  learning how ideas become clearer through a team.
                </p>
              </div>
            </div>
          </div>
          <div className="exploring">
            <div>
              <span className="eyebrow">Currently exploring</span>
              <h3>
                Following the next
                <br />
                <em>interesting question.</em>
              </h3>
            </div>
            <div className="explore-list">
              {portfolio.exploring.map((item, index) => (
                <span key={item}>
                  <i>0{index + 1}</i>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section container resume-section" data-reveal>
          <SectionLabel index="07" children="Resume" />
          <div className="resume-panel">
            <div>
              <span className="eyebrow">A work in progress</span>
              <h2>
                Resume
                <br />
                <em>coming soon.</em>
              </h2>
            </div>
            <p>
              The full story is being shaped with the same care as the work. A
              downloadable PDF will appear here when it is ready.
            </p>
            {portfolio.resumeAvailable && (
              <a className="button button-primary" href={portfolio.resumePath}>
                Download PDF <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </section>

        <section id="contact" className="contact-section" data-reveal>
          <div className="container contact-grid">
            <div>
              <SectionLabel index="08" children="Contact" />
              <h2>
                Have an idea?
                <br />
                <em>Let’s build something.</em>
              </h2>
              <p>
                Whether it’s a thoughtful product, a cloud challenge, or simply
                a good conversation about technology, my inbox is open.
              </p>
              <div className="contact-links">
                <a href={`mailto:${portfolio.email}`}>
                  <Mail size={17} /> {portfolio.email}
                </a>
                <button onClick={copyEmail}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}{" "}
                  {copied ? "Copied" : "Copy email"}
                </button>
                <a
                  href={portfolio.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Terminal size={17} /> LinkedIn <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
            <form className="contact-form" onSubmit={submitContact}>
              <label>
                Name
                <input name="name" required placeholder="Your name" />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Subject
                <input
                  name="subject"
                  required
                  placeholder="What are we making?"
                />
              </label>
              <label>
                Message
                <textarea
                  name="message"
                  required
                  rows="4"
                  placeholder="A few words to start..."
                />
              </label>
              <button className="button button-primary" type="submit">
                Send via email <ArrowUpRight size={16} />
              </button>
              {contactStatus === "ready" && (
                <small className="form-note">
                  Your email client should open with the message ready to send.
                </small>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="footer container">
        <div className="footer-top">
          <a className="brand" href="#top">
            <span>AD</span>
            <strong>
              ABHINAV<span>.</span>
            </strong>
          </a>
          <p>{portfolio.tagline}</p>
          <div className="footer-social">
            <a
              href={portfolio.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Code2 size={17} />
            </a>
            <a
              href={portfolio.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <Terminal size={17} />
            </a>
            <a href={`mailto:${portfolio.email}`} aria-label="Email">
              <Mail size={17} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Abhinav Deshwal</span>
          <span>Designed with curiosity. Built with passion.</span>
          {portfolio.resumeAvailable && (
            <a href={portfolio.resumePath} className="resume-link">
              Resume <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </footer>
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="project-modal"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="modal-close icon-button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
              >
                <X size={18} />
              </button>
              <span className="eyebrow">{selectedProject.eyebrow}</span>
              <h2>{selectedProject.name}</h2>
              <p>{selectedProject.description}</p>
              <div className="stack-tags">
                {selectedProject.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <p className="modal-note">
                Repository association can be added from the central portfolio
                configuration once the matching public repository is available.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

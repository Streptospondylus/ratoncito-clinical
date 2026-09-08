import { useEffect, useState, type ReactNode } from "react";
import { appConfig } from "./config";
import {
  diagnosticPanels,
  examRows,
  hypotheses,
  historyEntries,
  sectionMeta,
  stimulusRows,
  type IconName,
  type StimulusRow
} from "./data";
import {
  getHypothesisFeedback,
  getProgressPercent,
  isReadyForSynthesis,
  type HypothesisState,
  type RevealStage,
  type SectionId
} from "./domain";

const navigation: SectionId[] = [
  "overview",
  "history",
  "examination",
  "diagnostics",
  "differentials",
  "synthesis"
];

const iconPaths: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4" />
    </>
  ),
  pulse: <path d="M3 12h3l2-5 4 10 2-5h7" />,
  flask: (
    <>
      <path d="M9 3h6M10 3v6.2L5.8 17a2.5 2.5 0 0 0 2.1 3.8h8.2a2.5 2.5 0 0 0 2.1-3.8L14 9.2V3" />
      <path d="M8 15h8" />
    </>
  ),
  branch: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 5h5a5 5 0 0 1 5 5v7M8 5h5a5 5 0 0 0 5-5" />
    </>
  ),
  report: (
    <>
      <path d="M6 3.5h9l3 3V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V7h4M8 11h6M8 15h7M8 18h4" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </>
  ),
  chevron: <path d="m8 10 4 4 4-4" />,
  check: <path d="m5 12 4 4L19 6" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.8 12s3.2-5 9.2-5 9.2 5 9.2 5-3.2 5-9.2 5-9.2-5-9.2-5Z" />
      <circle cx="12" cy="12" r="2.2" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 19 6v5.1c0 4.2-2.6 7.8-7 9.7-4.4-1.9-7-5.5-7-9.7V6l7-2.8Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  note: (
    <>
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 9h16" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  spark: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  )
};

function Icon({
  name,
  size = 18,
  strokeWidth = 1.8
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {iconPaths[name]}
    </svg>
  );
}

function LogoMark({ large = false }: { large?: boolean }) {
  return (
    <span className={large ? "logo-mark logo-mark-large" : "logo-mark"} aria-hidden="true">
      <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <rect height="42" rx="13" width="42" x="3" y="3" />
        <path d="M14 24h20M24 14v20" />
        <circle cx="34" cy="14" r="3.4" />
      </svg>
    </span>
  );
}

function RatIllustration() {
  return (
    <svg
      aria-label="Illustration stylisée d’un rat noir à visée clinique"
      className="rat-illustration"
      role="img"
      viewBox="0 0 420 260"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ratBody" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#dce4e1" />
          <stop offset="1" stopColor="#aebdb8" />
        </linearGradient>
        <linearGradient id="ratEar" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#e3b6aa" />
          <stop offset="1" stopColor="#c7887d" />
        </linearGradient>
      </defs>
      <path
        d="M59 202c78 20 198 16 293-19 25-9 38-6 47 3 8 8 5 17-9 19-44 6-83 25-122 35-82 20-164 5-209-22Z"
        fill="#d3ded9"
        opacity=".55"
      />
      <path
        d="M57 169c13-47 64-76 135-70 64 5 119 36 119 76 0 37-47 59-112 59-79 0-143-23-142-65Z"
        fill="url(#ratBody)"
        stroke="#6f8580"
        strokeWidth="3"
      />
      <path
        d="M255 112c6-28 28-46 49-41 17 4 22 22 14 37-8 16-26 25-49 27Z"
        fill="url(#ratBody)"
        stroke="#6f8580"
        strokeWidth="3"
      />
      <path
        d="M281 74c-6-23 3-45 19-48 15-3 25 11 24 28-1 16-12 28-31 34Z"
        fill="url(#ratEar)"
        stroke="#6f8580"
        strokeWidth="3"
      />
      <path
        d="M300 72c-3-14 2-27 11-29 8-1 13 6 12 16-1 9-8 16-18 20Z"
        fill="#f0ccc2"
        opacity=".9"
      />
      <path
        d="M304 109c-1-21 9-36 24-39 13-2 25 9 25 23 0 16-12 29-34 35Z"
        fill="url(#ratEar)"
        stroke="#6f8580"
        strokeWidth="3"
      />
      <path
        d="M319 106c1-11 7-19 15-20 7-1 12 5 11 12-1 9-8 16-20 20Z"
        fill="#f0ccc2"
        opacity=".9"
      />
      <path
        d="M302 111c15 2 25 9 30 22"
        fill="none"
        stroke="#506964"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <circle cx="323" cy="99" fill="#19363b" r="4.4" />
      <circle cx="324.2" cy="97.8" fill="#f7faf8" r="1.2" />
      <path d="M340 119c13 1 23 5 34 11M339 124c14 5 24 11 33 20M339 114c13-4 24-4 36-2" fill="none" stroke="#637b75" strokeLinecap="round" strokeWidth="2" />
      <path d="M270 190c4 15 2 27-6 38M298 184c4 14 3 24-3 34" fill="none" stroke="#6f8580" strokeLinecap="round" strokeWidth="5" />
      <path d="M96 206c-3 13-2 22 4 29M124 211c-1 12 1 20 7 27" fill="none" stroke="#6f8580" strokeLinecap="round" strokeWidth="5" />
      <path
        d="M58 177c-27 5-37 17-34 29 3 12 21 15 38 5"
        fill="none"
        stroke="#8fa29c"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <path d="M173 117c26 5 44 5 62 0" fill="none" opacity=".55" stroke="#eff5f2" strokeLinecap="round" strokeWidth="4" />
      <path d="M208 166c-9 7-18 7-27 0" fill="none" stroke="#748b85" strokeLinecap="round" strokeWidth="2.5" />
      <circle cx="236" cy="111" fill="#d77a5f" r="4" />
    </svg>
  );
}

function Sparkline() {
  return (
    <svg
      aria-label="Courbe synthétique de la réponse observée"
      className="sparkline"
      role="img"
      viewBox="0 0 420 130"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 101H420M0 66H420M0 31H420" stroke="#d9e5e0" strokeDasharray="2 7" />
      <path d="M0 99C33 100 42 95 72 96S111 100 139 93 168 72 194 78 222 91 248 80 275 48 300 54 328 76 350 55 385 26 420 35V130H0Z" fill="#d7eee9" opacity=".72" />
      <path d="M0 99C33 100 42 95 72 96S111 100 139 93 168 72 194 78 222 91 248 80 275 48 300 54 328 76 350 55 385 26 420 35" fill="none" stroke="#1d7976" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      <circle cx="300" cy="54" fill="#fff" r="5" stroke="#d77a5f" strokeWidth="3" />
      <circle cx="420" cy="35" fill="#1d7976" r="4" />
    </svg>
  );
}

function StatusPill({
  children,
  tone = "green"
}: {
  children: ReactNode;
  tone?: "green" | "warm" | "muted";
}) {
  return (
    <span className={"status-pill status-pill-" + tone}>
      <span className="status-dot" />
      {children}
    </span>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="section-description">{description}</p>
      </div>
      {children ? <div className="intro-action">{children}</div> : null}
    </div>
  );
}

function Field({
  label,
  value,
  muted = false
}: {
  label: string;
  value: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className={muted ? "field field-muted" : "field"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Portal({ onOpen }: { onOpen: () => void }) {
  return (
    <main className="portal-shell">
      <div className="portal-orbit portal-orbit-one" />
      <div className="portal-orbit portal-orbit-two" />
      <header className="portal-header">
        <div className="brand-lockup brand-lockup-light">
          <LogoMark />
          <div>
            <strong>{appConfig.clinic.shortName}</strong>
            <span>Référé vétérinaire</span>
          </div>
        </div>
        <span className="portal-secure">
          <Icon name="shield" size={15} />
          Accès clinique
        </span>
      </header>

      <div className="portal-content">
        <section className="portal-copy">
          <p className="portal-kicker">
            <span className="live-line" />
            {appConfig.clinic.service}
          </p>
          <h1>
            Un dossier atypique
            <br />
            attend votre lecture.
          </h1>
          <p className="portal-lede">
            Une évaluation spécialisée a été préparée pour un patient NAC présentant
            une réponse comportementale persistante. Les éléments sont prêts à être
            examinés.
          </p>
          <button className="primary-button primary-button-light" onClick={onOpen}>
            Ouvrir le dossier
            <Icon name="arrow" size={17} />
          </button>
          <p className="portal-footnote">
            Dossier référé · {appConfig.case.id} · Lecture optimisée pour mobile
          </p>
        </section>

        <section aria-label="Aperçu du dossier" className="portal-preview">
          <div className="preview-topline">
            <div className="brand-lockup">
              <LogoMark />
              <div>
                <strong>{appConfig.clinic.shortName}</strong>
                <span>Unité NAC</span>
              </div>
            </div>
            <StatusPill>Prêt</StatusPill>
          </div>
          <div className="preview-divider" />
          <div className="preview-label">DOSSIER RÉFÉRÉ</div>
          <div className="preview-patient">
            <div>
              <h2>{appConfig.patient.name}</h2>
              <p>
                <em>{appConfig.patient.species}</em> · {appConfig.patient.sex.toLowerCase()}
              </p>
            </div>
            <div className="preview-avatar">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="preview-row">
            <span>Motif de consultation</span>
            <strong>Réponse contextuelle reproductible</strong>
          </div>
          <div className="preview-row">
            <span>Priorité</span>
            <strong className="warm-text">À évaluer</strong>
          </div>
          <div className="preview-progress">
            <span>
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <small>6 modules cliniques</small>
          </div>
          <div className="preview-stamp">
            <Icon name="lock" size={14} />
            Données confidentielles
          </div>
        </section>
      </div>

      <footer className="portal-footer">
        <span>{appConfig.clinic.name}</span>
        <span>·</span>
        <span>{appConfig.clinic.tagline}</span>
        <span className="footer-version">Interface de consultation v. 1.0</span>
      </footer>
    </main>
  );
}

function ClosureScreen() {
  return (
    <main className="closure-shell">
      <div className="closure-card">
        <div className="closure-mark">
          <LogoMark large />
        </div>
        <p className="eyebrow">Évaluation terminée</p>
        <h1>Dossier validé</h1>
        <div className="closure-rule" />
        <p className="closure-link">Lien maintenu</p>
        <p className="closure-meta">
          {appConfig.case.id} <span>·</span> {appConfig.clinic.service}
        </p>
      </div>
      <p className="closure-footer">
        {appConfig.clinic.shortName} · {appConfig.clinic.name}
      </p>
    </main>
  );
}

function App() {
  const [started, setStarted] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [visited, setVisited] = useState<SectionId[]>([]);
  const [openedPanels, setOpenedPanels] = useState<string[]>([]);
  const [selectedStimulus, setSelectedStimulus] = useState("individual-a");
  const [hypothesisState, setHypothesisState] = useState<
    Record<string, HypothesisState>
  >({});
  const [revealStage, setRevealStage] = useState<RevealStage>("idle");
  const [closed, setClosed] = useState(false);

  const recipientName = appConfig.recipient.displayName.trim();
  const visitedCount = new Set(visited).size;
  const diagnosticsComplete = openedPanels.length === diagnosticPanels.length;
  const classifiedCount = Object.keys(hypothesisState).length;
  const readyForSynthesis = isReadyForSynthesis(
    openedPanels.length,
    diagnosticPanels.length,
    classifiedCount,
    hypotheses.length
  );
  const progress = getProgressPercent(visited);

  useEffect(() => {
    const nextStage: Partial<Record<RevealStage, RevealStage>> = {
      preparing: "variable",
      variable: "identifying",
      identifying: "revealed"
    };
    const delays: Partial<Record<RevealStage, number>> = {
      preparing: 750,
      variable: 1150,
      identifying: 1450
    };
    const next = nextStage[revealStage];
    const delay = delays[revealStage];

    if (!next || !delay) {
      return;
    }

    const timer = window.setTimeout(() => setRevealStage(next), delay);

    return () => window.clearTimeout(timer);
  }, [revealStage]);

  function markVisited(section: SectionId) {
    setVisited((current) =>
      current.includes(section) ? current : [...current, section]
    );
  }

  function navigate(section: SectionId) {
    if (section === "synthesis" && !readyForSynthesis) {
      return;
    }
    setActiveSection(section);
    markVisited(section);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function openDossier() {
    setStarted(true);
    setVisited(["overview"]);
  }

  function togglePanel(id: string) {
    setOpenedPanels((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function classify(id: string, value: HypothesisState) {
    setHypothesisState((current) => ({ ...current, [id]: value }));
  }

  function generateSynthesis() {
    if (!readyForSynthesis) {
      return;
    }
    setRevealStage("preparing");
    setActiveSection("synthesis");
    markVisited("synthesis");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (!started) {
    return <Portal onOpen={openDossier} />;
  }

  if (closed) {
    return <ClosureScreen />;
  }

  function renderOverview() {
    return (
      <section className="page-section">
        <SectionIntro
          eyebrow={sectionMeta.overview.eyebrow}
          title="Ratoncito"
          description="Vue d’ensemble du dossier avant ouverture du raisonnement clinique."
        >
          <StatusPill>Évaluation active</StatusPill>
        </SectionIntro>

        <div className="overview-grid">
          <article className="card patient-hero-card">
            <div className="patient-hero-meta">
              <div>
                <p className="card-eyebrow">PATIENT NAC · {appConfig.case.id}</p>
                <span className="patient-referral">Dossier référé</span>
              </div>
              <span className="record-symbol">R</span>
            </div>
            <div className="patient-hero-body">
              <div className="patient-visual">
                <div className="patient-visual-grid" />
                <RatIllustration />
                <span className="visual-caption">OBSERVATION CLINIQUE</span>
              </div>
              <div className="patient-identity">
                <h2>{appConfig.patient.name}</h2>
                <p className="patient-species">
                  <em>{appConfig.patient.species}</em>
                  <span>·</span>
                  {appConfig.patient.sex}
                </p>
                <div className="patient-fields">
                  <Field label="Âge" value={appConfig.patient.age} />
                  <Field label="Poids" value={appConfig.patient.weight} />
                  <Field label="État corporel" value={appConfig.patient.bodyCondition} />
                  <Field label="Service" value="NAC · cas complexes" muted />
                </div>
              </div>
            </div>
            <div className="patient-hero-footer">
              <span>
                <Icon name="calendar" size={15} />
                {appConfig.case.date}
              </span>
              <span>
                <Icon name="user" size={15} />
                {appConfig.case.attendingClinician}
              </span>
            </div>
          </article>

          <article className="card signal-card">
            <div className="card-heading">
              <div>
                <p className="card-eyebrow">SIGNAL CLINIQUE</p>
                <h2>Réponse contextuelle</h2>
              </div>
              <span className="icon-badge icon-badge-teal">
                <Icon name="pulse" size={18} />
              </span>
            </div>
            <p className="card-lede">
              Variation physiologique observée lors d’un stimulus spécifique.
            </p>
            <div className="chart-wrap">
              <Sparkline />
              <div className="chart-axis">
                <span>Repos</span>
                <span>Exposition</span>
                <span>Récupération</span>
              </div>
            </div>
            <div className="signal-reading">
              <div>
                <span className="reading-value">+22<small>%</small></span>
                <span className="reading-label">variation relative maximale</span>
              </div>
              <StatusPill tone="warm">À caractériser</StatusPill>
            </div>
          </article>

          <article className="card referral-card">
            <div className="card-heading">
              <div>
                <p className="card-eyebrow">MOTIF DE RÉFÉRÉ</p>
                <h2>Problème à résoudre</h2>
              </div>
              <span className="icon-badge icon-badge-sand">
                <Icon name="note" size={18} />
              </span>
            </div>
            <p className="referral-question">
              Modification comportementale persistante avec réponse physiologique
              contextuelle reproductible.
            </p>
            <div className="tag-row">
              <span className="tag">Persistant</span>
              <span className="tag">Sélectif</span>
              <span className="tag">Non aigu</span>
            </div>
            <button className="text-button" onClick={() => navigate("history")}>
              Lire l’anamnèse
              <Icon name="arrow" size={16} />
            </button>
          </article>

          <article className="card case-note-card">
            <div className="case-note-top">
              <span className="note-pin">
                <Icon name="spark" size={14} />
              </span>
              <span className="card-eyebrow">NOTE DE RÉFÉRENCE</span>
            </div>
            <p>
              « La réponse semble liée à un facteur constant. Le patient reste
              parfaitement fonctionnel en dehors des épisodes. »
            </p>
            <span className="note-signature">— Dossier transmis au service NAC</span>
          </article>
        </div>

        <div className="next-step-bar">
          <div>
            <span className="step-index">01</span>
            <div>
              <p className="card-eyebrow">PROCHAINE ÉTAPE</p>
              <strong>Reconstituer l’évolution du phénomène</strong>
            </div>
          </div>
          <button className="primary-button" onClick={() => navigate("history")}>
            Ouvrir l’anamnèse
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </section>
    );
  }

  function renderHistory() {
    return (
      <section className="page-section">
        <SectionIntro
          eyebrow={sectionMeta.history.eyebrow}
          title="Anamnèse"
          description="Historique structuré rapporté avant l’évaluation spécialisée."
        >
          <span className="section-counter">4 éléments documentés</span>
        </SectionIntro>

        <div className="history-layout">
          <article className="card timeline-card">
            <div className="card-heading card-heading-wide">
              <div>
                <p className="card-eyebrow">HISTORIQUE RAPPORTÉ</p>
                <h2>Chronologie du phénomène</h2>
              </div>
              <Icon name="clipboard" size={21} />
            </div>
            <div className="timeline">
              {historyEntries.map((entry, index) => (
                <div className="timeline-item" key={entry.label}>
                  <div className="timeline-rail">
                    <span className={index === historyEntries.length - 1 ? "timeline-dot timeline-dot-current" : "timeline-dot"} />
                    {index < historyEntries.length - 1 ? <span className="timeline-line" /> : null}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-heading">
                      <div>
                        <span className="timeline-date">{entry.date}</span>
                        <h3>{entry.label}</h3>
                      </div>
                      <span className="timeline-index">0{index + 1}</span>
                    </div>
                    <p>{entry.text}</p>
                    <div className="tag-row">
                      {entry.tags.map((tag) => (
                        <span className="tag tag-muted" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="history-aside">
            <article className="card quote-card">
              <span className="quote-mark">“</span>
              <p>
                Le rapprochement avec le facteur concerné semble modifier
                immédiatement l’état de vigilance.
              </p>
              <div className="quote-footer">
                <span className="avatar-initials">P</span>
                <span>
                  <strong>Propriétaire</strong>
                  <small>Entretien de référé</small>
                </span>
              </div>
            </article>
            <article className="card interpretation-card">
              <div className="interpretation-heading">
                <span className="icon-badge icon-badge-teal">
                  <Icon name="search" size={17} />
                </span>
                <p className="card-eyebrow">LECTURE INITIALE</p>
              </div>
              <h3>Un phénomène surtout contextuel</h3>
              <p>
                L’absence d’altération générale oriente vers une observation
                comparative avant toute hypothèse organique lourde.
              </p>
            </article>
          </aside>
        </div>

        <div className="next-step-bar">
          <div>
            <span className="step-index">02</span>
            <div>
              <p className="card-eyebrow">PROCHAINE ÉTAPE</p>
              <strong>Vérifier l’état général et les constantes</strong>
            </div>
          </div>
          <button className="primary-button" onClick={() => navigate("examination")}>
            Passer à l’examen
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </section>
    );
  }

  function renderExamination() {
    return (
      <section className="page-section">
        <SectionIntro
          eyebrow={sectionMeta.examination.eyebrow}
          title="Examen clinique"
          description="Observation non contrainte, puis examen général et comportemental."
        >
          <StatusPill>État général conservé</StatusPill>
        </SectionIntro>

        <div className="examination-top-grid">
          <article className="card observation-card">
            <div className="card-heading">
              <div>
                <p className="card-eyebrow">OBSERVATION DIRECTE</p>
                <h2>Patient présenté éveillé</h2>
              </div>
              <span className="icon-badge icon-badge-teal">
                <Icon name="eye" size={18} />
              </span>
            </div>
            <p>
              Réactif, manipulable, sans signe de détresse ni altération manifeste
              de la locomotion. Le comportement est d’abord observé sans contention.
            </p>
            <div className="observation-status">
              <span className="status-check">
                <Icon name="check" size={14} />
              </span>
              <span>
                <strong>Examen non contributif au repos</strong>
                <small>Une variation apparaît uniquement en contexte ciblé.</small>
              </span>
            </div>
          </article>
          <article className="card contextual-card">
            <div className="contextual-label">
              <span className="pulse-orb" />
              Variation contextuelle
            </div>
            <div className="contextual-value">+22<span>%</span></div>
            <p>variation relative maximale de la fréquence cardiaque lors de l’exposition</p>
            <div className="contextual-bar">
              <span />
            </div>
            <span className="contextual-foot">Mesure d’appoint · à interpréter avec le contexte</span>
          </article>
        </div>

        <article className="card exam-table-card">
          <div className="card-heading card-heading-wide">
            <div>
              <p className="card-eyebrow">EXAMEN GÉNÉRAL</p>
              <h2>Constantes et observations</h2>
            </div>
            <span className="table-context">
              <Icon name="calendar" size={14} />
              Au repos
            </span>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paramètre</th>
                  <th>Résultat</th>
                  <th>Interprétation</th>
                  <th aria-label="Statut" />
                </tr>
              </thead>
              <tbody>
                {examRows.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>
                      <strong>{row.value}</strong>
                    </td>
                    <td>{row.interpretation}</td>
                    <td>
                      <span className={"table-status table-status-" + (row.tone || "neutral")}>
                        <span />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="exam-note">
            <Icon name="note" size={15} />
            <p>
              Sur le plan comportemental : orientation préférentielle et répétée
              vers un stimulus particulier, avec recherche active de rapprochement.
            </p>
          </div>
        </article>

        <div className="next-step-bar">
          <div>
            <span className="step-index">03</span>
            <div>
              <p className="card-eyebrow">PROCHAINE ÉTAPE</p>
              <strong>Comparer les examens disponibles</strong>
            </div>
          </div>
          <button className="primary-button" onClick={() => navigate("diagnostics")}>
            Consulter les examens
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </section>
    );
  }

  function renderPanelBody(panelId: string) {
    const panel = diagnosticPanels.find((item) => item.id === panelId);
    if (!panel) {
      return null;
    }

    if (panel.id === "behavior") {
      const selected = stimulusRows.find((row) => row.id === selectedStimulus) || stimulusRows[0];
      return (
        <div className="panel-body behavior-panel-body">
          <div className="behavior-method">
            <div>
              <p className="card-eyebrow">PROTOCOLE COMPARATIF</p>
              <h3>Sept conditions · exposition standardisée</h3>
            </div>
            <span className="method-badge">
              <Icon name="shield" size={14} />
              Répétition x3
            </span>
          </div>
          <p className="panel-body-intro">
            Les conditions non spécifiques déclenchent des réponses faibles à
            modérées. Sélectionnez une ligne pour examiner la dynamique observée.
          </p>
          <div className="stimulus-list" role="list">
            {stimulusRows.map((row) => (
              <button
                aria-pressed={row.id === selectedStimulus}
                className={
                  "stimulus-row stimulus-row-" +
                  row.response +
                  (row.id === selectedStimulus ? " stimulus-row-selected" : "")
                }
                key={row.id}
                onClick={() => setSelectedStimulus(row.id)}
                role="listitem"
              >
                <span className="stimulus-indicator" />
                <span className="stimulus-main">
                  <strong>{row.label}</strong>
                  <small>{row.detail}</small>
                </span>
                <span className="stimulus-response">{row.responseLabel}</span>
                <Icon name="chevron" size={16} />
              </button>
            ))}
          </div>
          <div className="stimulus-detail">
            <div className="stimulus-detail-header">
              <div>
                <span className="card-eyebrow">LECTURE DU SIGNAL</span>
                <h3>{selected.label}</h3>
              </div>
              <span className={"response-badge response-badge-" + selected.response}>
                {selected.responseLabel}
              </span>
            </div>
            <div className="stimulus-metrics">
              <div>
                <span>Latence d’orientation</span>
                <strong>{selected.orientation}</strong>
              </div>
              <div>
                <span>Persistance de l’attention</span>
                <strong>{selected.attention}</strong>
              </div>
              <div>
                <span>Approche / contact</span>
                <strong>{selected.approach}</strong>
              </div>
              <div>
                <span>Retour au calme</span>
                <strong>{selected.recovery}</strong>
              </div>
            </div>
            <div className="signal-scale">
              <span>Intensité relative</span>
              <div>
                <i className="scale-low" />
                <i className="scale-mid" />
                <i className="scale-high" />
                <b className={"scale-marker scale-marker-" + selected.response} />
              </div>
              <small>Faible <span>Modérée</span> Forte</small>
            </div>
          </div>
          <p className="panel-footnote">{panel.note}</p>
        </div>
      );
    }

    if (panel.id === "exploration") {
      return (
        <div className="panel-body exploration-body">
          <div className="exploration-visual">
            <div className="exploration-scan">
              <span />
              <span />
              <span />
              <span />
              <div className="scan-crosshair">
                <i />
                <i />
              </div>
            </div>
            <span className="scan-label">EXPLORATION<br />CLINIQUE CIBLÉE</span>
          </div>
          <div className="exploration-copy">
            <p className="card-eyebrow">DÉCISION D’EXPLORATION</p>
            <h3>Aucune imagerie lourde indiquée à ce stade</h3>
            <p>
              L’état général conservé, l’examen non contributif et la dépendance
              stricte au contexte ne justifient pas une exploration invasive.
            </p>
            <div className="decision-line">
              <span className="status-check">
                <Icon name="check" size={14} />
              </span>
              <strong>Surveillance clinique et comparaison comportementale</strong>
            </div>
            <p className="panel-footnote">{panel.note}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="panel-body">
        <div className="data-table-wrap">
          <table className="data-table lab-table">
            <thead>
              <tr>
                <th>Paramètre</th>
                <th>Résultat</th>
                <th>Référence</th>
                <th>Lecture</th>
              </tr>
            </thead>
            <tbody>
              {panel.rows?.map((row) => (
                <tr key={row.analyte}>
                  <td>{row.analyte}</td>
                  <td>
                    <strong>{row.value}</strong>
                  </td>
                  <td className="reference-cell">{row.reference}</td>
                  <td>
                    <span className="inline-ok">
                      <Icon name="check" size={13} />
                      {row.interpretation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-summary">
          <span className="summary-check">
            <Icon name="check" size={14} />
          </span>
          <div>
            <strong>{panel.summary}</strong>
            <p>{panel.note}</p>
          </div>
        </div>
      </div>
    );
  }

  function renderDiagnostics() {
    return (
      <section className="page-section">
        <SectionIntro
          eyebrow={sectionMeta.diagnostics.eyebrow}
          title="Examens complémentaires"
          description="Ouvrez chaque module pour comparer les pistes organiques et contextuelles."
        >
          <span className="section-counter">
            {openedPanels.length} / {diagnosticPanels.length} modules consultés
          </span>
        </SectionIntro>

        <div className="diagnostic-notice">
          <span className="notice-icon">
            <Icon name="shield" size={17} />
          </span>
          <p>
            <strong>Lecture progressive du dossier.</strong> Les trois premiers
            modules évaluent les causes classiques. L’analyse comportementale
            compare ensuite la sélectivité de la réponse.
          </p>
        </div>

        <div className="diagnostic-stack">
          {diagnosticPanels.map((panel, index) => {
            const isOpen = openedPanels.includes(panel.id);
            return (
              <article className={isOpen ? "card diagnostic-panel is-open" : "card diagnostic-panel"} key={panel.id}>
                <button
                  aria-expanded={isOpen}
                  className="diagnostic-panel-trigger"
                  onClick={() => togglePanel(panel.id)}
                >
                  <span className="panel-number">0{index + 1}</span>
                  <span className="panel-icon">
                    <Icon name={panel.icon} size={19} />
                  </span>
                  <span className="panel-title">
                    <span>{panel.eyebrow}</span>
                    <strong>{panel.title}</strong>
                    <small>{panel.description}</small>
                  </span>
                  <span className="panel-status">
                    <StatusPill tone={panel.id === "behavior" ? "warm" : "muted"}>
                      {panel.status}
                    </StatusPill>
                    <Icon name="chevron" size={18} />
                  </span>
                </button>
                {isOpen ? renderPanelBody(panel.id) : null}
              </article>
            );
          })}
        </div>

        <div className="next-step-bar">
          <div>
            <span className="step-index">04</span>
            <div>
              <p className="card-eyebrow">PROCHAINE ÉTAPE</p>
              <strong>Évaluer les hypothèses différentielles</strong>
            </div>
          </div>
          <button className="primary-button" onClick={() => navigate("differentials")}>
            Ouvrir les hypothèses
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </section>
    );
  }

  function renderDifferentials() {
    return (
      <section className="page-section differential-page">
        <SectionIntro
          eyebrow={sectionMeta.differentials.eyebrow}
          title="Hypothèses diagnostiques"
          description="Évaluation différentielle du tableau clinique à partir des données disponibles."
        >
          <span className="section-counter">
            {classifiedCount} / {hypotheses.length} classifiées
          </span>
        </SectionIntro>

        <div className="hypothesis-list">
          <div aria-hidden="true" className="hypothesis-list-header">
            <span>Réf.</span>
            <span>Hypothèse</span>
            <span>Éléments disponibles</span>
            <span>Décision clinique</span>
          </div>
          {hypotheses.map((hypothesis, index) => {
            const state = hypothesisState[hypothesis.id];
            const isCorrect = state === hypothesis.expected;
            return (
              <article
                className={
                  "hypothesis-card" +
                  (state ? " hypothesis-card-classified" : "") +
                  (isCorrect ? " hypothesis-card-correct" : "")
                }
                key={hypothesis.id}
              >
                <span className="hypothesis-index">0{index + 1}</span>
                <div className="hypothesis-name">
                  <span>{hypothesis.category}</span>
                  <h3>{hypothesis.label}</h3>
                </div>
                <p className="hypothesis-rationale">{hypothesis.rationale}</p>
                <div className="hypothesis-decision">
                  {state ? (
                    <span className={"decision-badge decision-badge-" + state}>
                      <Icon name={state === "retain" ? "check" : "note"} size={13} />
                      {state === "retain" ? "Retenue" : state === "exclude" ? "Écartée" : "Incertaine"}
                    </span>
                  ) : (
                    <span className="decision-pending">À classer</span>
                  )}
                  <div className="decision-actions" role="group" aria-label={"Classer " + hypothesis.label}>
                    <button
                      className={state === "retain" ? "decision-button decision-button-selected" : "decision-button"}
                      onClick={() => classify(hypothesis.id, "retain")}
                    >
                      Retenir
                    </button>
                    <button
                      className={state === "uncertain" ? "decision-button decision-button-selected" : "decision-button"}
                      onClick={() => classify(hypothesis.id, "uncertain")}
                    >
                      Incertain
                    </button>
                    <button
                      className={state === "exclude" ? "decision-button decision-button-selected" : "decision-button"}
                      onClick={() => classify(hypothesis.id, "exclude")}
                    >
                      Écarter
                    </button>
                  </div>
                </div>
                {state ? (
                  <div className={isCorrect ? "hypothesis-feedback feedback-positive" : "hypothesis-feedback"}>
                    <Icon name={isCorrect ? "check" : "note"} size={14} />
                    <span>{getHypothesisFeedback(hypothesis.expected, state, hypothesis.feedback)}</span>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className={readyForSynthesis ? "synthesis-gate synthesis-gate-ready" : "synthesis-gate"}>
          <div className="gate-status">
            <span className="gate-icon">
              <Icon name={readyForSynthesis ? "check" : "lock"} size={18} />
            </span>
            <div>
              <p className="card-eyebrow">VALIDATION DE LA SYNTHÈSE</p>
              <strong>
                {readyForSynthesis
                  ? "Synthèse prête à être générée."
                  : "Synthèse actuellement verrouillée."}
              </strong>
              <small>
                {diagnosticsComplete
                  ? `${classifiedCount} / ${hypotheses.length} hypothèses évaluées.`
                  : "Examens complémentaires encore incomplets."}
              </small>
            </div>
          </div>
          <button
            className="primary-button"
            disabled={!readyForSynthesis}
            onClick={generateSynthesis}
          >
            Générer la synthèse
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </section>
    );
  }

  function renderSynthesis() {
    const stage = revealStage === "idle" ? "preparing" : revealStage;
    const associatedPhrase = recipientName
      ? "à la présence de " + recipientName
      : "à la présence du facteur associé";

    return (
      <section className="page-section synthesis-page">
        <SectionIntro
          eyebrow={sectionMeta.synthesis.eyebrow}
          title="Synthèse clinique"
          description="Génération du rapport d’évaluation à partir des éléments consultés."
        >
          <span className="section-counter">Analyse terminée</span>
        </SectionIntro>

        <div className="reveal-stage">
          <div className="reveal-stage-line">
            <span className={stage === "preparing" ? "stage-dot stage-dot-active" : "stage-dot stage-dot-done"} />
            <span className={stage === "variable" ? "stage-dot stage-dot-active" : stage === "preparing" ? "stage-dot" : "stage-dot stage-dot-done"} />
            <span className={stage === "identifying" ? "stage-dot stage-dot-active" : stage === "revealed" ? "stage-dot stage-dot-done" : "stage-dot"} />
            <span className={stage === "revealed" ? "stage-dot stage-dot-active" : "stage-dot"} />
          </div>
          <div className="reveal-stage-labels">
            <span>Données croisées</span>
            <span>Variable isolée</span>
            <span>Identification</span>
            <span>Rapport final</span>
          </div>
        </div>

        <article
          aria-live="polite"
          className={"reveal-card reveal-card-" + stage}
        >
          <div className="reveal-card-top">
            <span className="reveal-emblem">
              <Icon name={stage === "preparing" ? "pulse" : "spark"} size={21} />
            </span>
            <span className="card-eyebrow">ANALYSE DE CORRÉLATION</span>
            <span className="reveal-case">{appConfig.case.id}</span>
          </div>
          {stage === "preparing" ? (
            <div className="reveal-preparing">
              <span className="loader-ring" />
              <h2>Croisement des observations…</h2>
              <p>Recherche de la variable commune aux épisodes documentés.</p>
            </div>
          ) : (
            <div className="reveal-content">
              <p className="reveal-label">Variable commune retrouvée dans l’ensemble des épisodes</p>
              <div className="variable-display">
                <span className="variable-marker">A</span>
                <strong>Individu A</strong>
                <StatusPill tone="warm">Constante</StatusPill>
              </div>
              {stage === "identifying" ? (
                <div className="identifying-line">
                  <span className="loader-small" />
                  Identification en cours…
                </div>
              ) : null}
              {stage === "revealed" ? (
                <div className="identified-person">
                  <span>Individu A :</span>
                  <strong>{recipientName || "[prénom à renseigner]"}</strong>
                </div>
              ) : null}
            </div>
          )}
        </article>

        {stage === "revealed" ? (
          <article className="card clinical-report-card">
            <div className="report-header">
              <div>
                <p className="card-eyebrow">RAPPORT DE SYNTHÈSE · VALIDATION FINALE</p>
                <h2>Conclusion de l’évaluation</h2>
              </div>
              <span className="report-stamp">
                <Icon name="shield" size={15} />
                Revu
              </span>
            </div>
            <div className="report-body">
              <p>
                Les observations recueillies mettent en évidence une réponse
                persistante, spécifique et hautement reproductible associée à un
                seul facteur identifié.
              </p>
              <p>
                Aucune anomalie organique, métabolique, neurologique ou toxique
                susceptible d’expliquer l’ensemble du tableau n’a pu être mise en
                évidence au terme des investigations disponibles.
              </p>
              <p>
                Les hypothèses pathologiques classiques ne permettent pas
                d’expliquer de manière satisfaisante le phénomène observé.
              </p>
              <p>
                Le comportement du patient apparaît stable dans le temps, non
                aléatoire, et étroitement associé <strong>{associatedPhrase}</strong>.
              </p>
              <div className="report-outcome">
                <div>
                  <span>Résultat</span>
                  <strong>{appConfig.finalCopy.result}</strong>
                </div>
                <div>
                  <span>Évolution attendue</span>
                  <strong>{appConfig.finalCopy.expectedCourse}</strong>
                </div>
                <div>
                  <span>Conduite recommandée</span>
                  <strong>{appConfig.finalCopy.recommendation}</strong>
                </div>
              </div>
            </div>
            <div className="report-footer">
              <span>
                <Icon name="user" size={14} />
                {appConfig.case.attendingClinician}
              </span>
              <span>
                <Icon name="calendar" size={14} />
                {appConfig.case.date}
              </span>
              <button className="primary-button" onClick={() => setClosed(true)}>
                Clore le dossier
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </article>
        ) : (
          <div className="synthesis-waiting">
            <Icon name="lock" size={15} />
            La synthèse finale sera disponible après l’identification de la variable.
          </div>
        )}
      </section>
    );
  }

  function renderActiveSection() {
    switch (activeSection) {
      case "history":
        return renderHistory();
      case "examination":
        return renderExamination();
      case "diagnostics":
        return renderDiagnostics();
      case "differentials":
        return renderDifferentials();
      case "synthesis":
        return renderSynthesis();
      case "overview":
      default:
        return renderOverview();
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>
      <header className="topbar">
        <div className="brand-lockup">
          <LogoMark />
          <div>
            <strong>{appConfig.clinic.shortName}</strong>
            <span>{appConfig.clinic.service}</span>
          </div>
        </div>
        <div className="topbar-case">
          <span>DOSSIER</span>
          <strong>{appConfig.case.id}</strong>
        </div>
        <div className="topbar-right">
          <StatusPill>Évaluation active</StatusPill>
          <span className="topbar-divider" />
          <span className="topbar-secure">
            <Icon name="shield" size={15} />
            Session sécurisée
          </span>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span>Parcours clinique</span>
            <small>{visitedCount} / 6</small>
          </div>
          <nav aria-label="Sections du dossier" className="side-nav">
            {navigation.map((section, index) => {
              const meta = sectionMeta[section];
              const isActive = section === activeSection;
              const isVisited = visited.includes(section);
              const isLocked = section === "synthesis" && !readyForSynthesis;
              return (
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={
                    "side-nav-item" +
                    (isActive ? " side-nav-item-active" : "") +
                    (isVisited ? " side-nav-item-visited" : "") +
                    (isLocked ? " side-nav-item-locked" : "")
                  }
                  disabled={isLocked}
                  key={section}
                  onClick={() => navigate(section)}
                  title={isLocked ? "Complétez l’analyse avant la synthèse" : meta.label}
                >
                  <span className="nav-index">0{index}</span>
                  <span className="nav-icon">
                    <Icon name={meta.icon} size={17} />
                  </span>
                  <span className="nav-label">{meta.label}</span>
                  {isVisited && !isActive ? (
                    <span className="nav-check">
                      <Icon name="check" size={12} />
                    </span>
                  ) : isLocked ? (
                    <span className="nav-lock">
                      <Icon name="lock" size={12} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
          <div className="sidebar-bottom">
            <div className="progress-heading">
              <span>Progression dossier</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: progress + "%" }} />
            </div>
            <p>Les modules consultés restent accessibles à tout moment.</p>
            <div className="sidebar-case">
              <span className="sidebar-case-icon">
                <Icon name="lock" size={14} />
              </span>
              <span>
                <strong>Accès restreint</strong>
                <small>{appConfig.case.date}</small>
              </span>
            </div>
          </div>
        </aside>

        <main className="main-content" id="main-content">
          <div className="content-context">
            <span>
              {appConfig.clinic.name} <b>/</b> {appConfig.clinic.service}
            </span>
            <span>
              <Icon name="shield" size={13} />
              Dossier confidentiel
            </span>
          </div>
          {renderActiveSection()}
        </main>
      </div>

      <nav aria-label="Navigation mobile" className="mobile-nav">
        {navigation.map((section, index) => {
          const meta = sectionMeta[section];
          const isLocked = section === "synthesis" && !readyForSynthesis;
          return (
            <button
              aria-current={activeSection === section ? "page" : undefined}
              className={activeSection === section ? "mobile-nav-item mobile-nav-item-active" : "mobile-nav-item"}
              disabled={isLocked}
              key={section}
              onClick={() => navigate(section)}
            >
              <span className="mobile-nav-icon">
                <Icon name={meta.icon} size={17} />
                {visited.includes(section) && activeSection !== section ? <i /> : null}
              </span>
              <span>{index === 0 ? "Accueil" : meta.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;

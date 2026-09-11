import { useEffect, useRef, useState, type ReactNode } from "react";
import { appConfig } from "./config";
import {
  diagnosticPanels,
  examRows,
  hypotheses,
  historyEntries,
  sectionMeta,
  stimulusRows,
  type IconName
} from "./data";
import {
  getHypothesisFeedback,
  getReviewStatus,
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

function PatientPhoto() {
  return <img className="patient-photo" src={import.meta.env.BASE_URL + "images/ratoncito-examen.jpg"}
    alt="Ratoncito, rat brun éveillé sur une table d’examen, accompagné d’un petit paquet cadeau." width="1536" height="1024" />;
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
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {children ? <div className="intro-action">{children}</div> : null}
    </div>
  );
}

function Portal({ onOpen }: { onOpen: () => void }) {
  return (
    <main className="referral-cover">
      <header className="document-heading"><span>DOSSIER DE RÉFÉRÉ</span><span>{appConfig.case.id}</span></header>
      <div className="cover-recipient"><span>À l’attention de</span><strong>{appConfig.recipient.displayName || "La vétérinaire destinataire"}</strong>
        <span>{appConfig.clinic.name} · {appConfig.clinic.location}</span></div>
      <h1>Ratoncito</h1>
      <p className="cover-species"><em>{appConfig.patient.species}</em> · mâle · {appConfig.patient.weight}</p>
      <PatientPhoto />
      <dl className="document-fields"><div><dt>Motif</dt><dd>Recherche de contact exclusive. Coopération dépendante d’un individu familier.</dd></div>
        <div><dt>État général</dt><dd>Conservé. Difficulté à maintenir le repos en séparation.</dd></div>
        <div><dt>Pièce jointe</dt><dd>Petit présent retrouvé avec le patient. Destinataire unique.</dd></div></dl>
      <button className="primary-button" onClick={onOpen}>Examiner le dossier<Icon name="arrow" size={17} /></button>
      <footer className="document-footer">{appConfig.case.date} · Observation individuelle</footer>
    </main>
  );
}

function ClosureScreen({ adopted, onReturn }: { adopted: boolean; onReturn: () => void }) {
  return <main className={"closure-document " + (adopted ? "closure-accepted" : "closure-refused")}>
    <div className="closure-sheet">
      <header className="closure-heading">
        <span>{adopted ? "ADOPTION VALIDÉE" : "CLÔTURE DU DOSSIER"}</span>
        <span>{appConfig.case.id}</span>
      </header>
      <section className="closure-body" aria-labelledby="closure-title">
        <p className="closure-kicker">{adopted ? "Décision de prise en charge" : "Compte rendu d’incident"}</p>
        <h1 id="closure-title" tabIndex={-1}>{adopted ? <>Adoption de<br />Ratoncito.</> : <>Décès de<br />Ratoncito.</>}</h1>
        {adopted ? <>
          <p className="closure-accepted-copy">
            Vous avez adopté Ratoncito. Il est désormais placé sous votre responsabilité et va prendre toute sa place dans votre quotidien.
          </p>
          <p className="closure-accepted-copy">
            Il est très heureux et présente une espérance de vie exceptionnellement longue pour son espèce&nbsp;: il est donc possible que vous viviez toute votre vie ensemble.
          </p>
          <p className="closure-care">Prenez soin de lui.</p>
          <div className="closure-validation">
            <strong>ADOPTION VALIDÉE</strong>
            <span>LIEN MAINTENU</span>
          </div>
        </> : <>
          <p className="closure-incident">À la sortie de la clinique, Ratoncito s’est jeté de lui-même dans la gueule d’un chat. Aucune intervention n’a pu être réalisée.</p>
          <dl className="closure-status"><div><dt>Issue</dt><dd>Décès</dd></div><div><dt>Dossier</dt><dd>Clos</dd></div></dl>
        </>}
      </section>
      <footer className="closure-bottom">
        {adopted ? <p className="closure-date">{appConfig.case.date}</p> : <p className="closure-date">{appConfig.case.date}</p>}
        <button className="closure-return" onClick={onReturn}>Retour au dossier</button>
      </footer>
    </div>
  </main>;
}

function App() {
  const [started, setStarted] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [visited, setVisited] = useState<SectionId[]>([]);
  const [openedPanels, setOpenedPanels] = useState<string[]>([]);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [selectedStimulus, setSelectedStimulus] = useState("individual-a");
  const [hypothesisState, setHypothesisState] = useState<
    Record<string, HypothesisState>
  >({});
  const [revealStage, setRevealStage] = useState<RevealStage>("idle");
  const [closed, setClosed] = useState(false);
  const [adopted, setAdopted] = useState(false);
  const returnToContract = useRef(false);

  const recipientName = appConfig.recipient.displayName.trim();
  const visitedCount = new Set(visited).size;
  const classifiedCount = Object.keys(hypothesisState).length;
  const review = getReviewStatus(
    openedPanels,
    diagnosticPanels.map((panel) => panel.id),
    Object.keys(hypothesisState),
    hypotheses.map((hypothesis) => hypothesis.id)
  );
  const readyForSynthesis = review.ready;
  const nextPanel = diagnosticPanels.find((panel) => panel.id === review.missingPanels[0]);

  useEffect(() => {
    if (returnToContract.current && !closed) {
      const contract = document.getElementById("adoption-contract");
      contract?.focus({ preventScroll: true });
      contract?.scrollIntoView({ block: "start", behavior: "instant" });
      returnToContract.current = false;
      return;
    }
    if (started) {
      document.getElementById(closed ? "closure-title" : "main-content")?.focus({ preventScroll: true });
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    }
  }, [started, activeSection, closed]);

  useEffect(() => {
    if (activeSection === "diagnostics" && expandedPanel) {
      const trigger = document.getElementById("panel-trigger-" + expandedPanel);
      trigger?.focus({ preventScroll: true });
      trigger?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [activeSection, expandedPanel]);

  useEffect(() => {
    if (revealStage !== "preparing") {
      return;
    }
    const timer = window.setTimeout(() => setRevealStage("revealed"), 350);
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
    if (section === "synthesis" && revealStage === "idle") {
      setRevealStage(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "revealed" : "preparing");
    }
    setActiveSection(section);
    markVisited(section);
  }

  function openDossier() {
    setStarted(true);
    setVisited(["overview"]);
  }

  function togglePanel(id: string) {
    setExpandedPanel((current) => current === id ? null : id);
    setOpenedPanels((current) =>
      current.includes(id) ? current : [...current, id]
    );
  }

  function classify(id: string, value: HypothesisState) {
    setHypothesisState((current) => ({ ...current, [id]: value }));
  }

  function generateSynthesis() {
    if (!readyForSynthesis) {
      return;
    }
    navigate("synthesis");
  }

  function resumeReview() {
    if (nextPanel) {
      navigate("diagnostics");
      setExpandedPanel(nextPanel.id);
      setOpenedPanels((current) => current.includes(nextPanel.id) ? current : [...current, nextPanel.id]);
    } else if (review.missingHypotheses.length) {
      const card = document.getElementById("hypothesis-" + review.missingHypotheses[0]);
      card?.focus({ preventScroll: true });
      card?.scrollIntoView({ block: "start", behavior: "instant" });
    } else {
      generateSynthesis();
    }
  }

  if (!started) {
    return <Portal onOpen={openDossier} />;
  }

  if (closed) {
    return <ClosureScreen adopted={adopted} onReturn={() => { returnToContract.current = true; setClosed(false); }} />;
  }

  function renderOverview() {
    return <section className="page-section">
      <SectionIntro eyebrow="Identification" title="Ratoncito" description="" />
      <article className="card patient-record"><PatientPhoto />
        <div className="record-content"><dl className="document-fields">
          <div><dt>Espèce</dt><dd><em>{appConfig.patient.species}</em> · {appConfig.patient.sex}</dd></div>
          <div><dt>Signalement</dt><dd>Pelage brun. {appConfig.patient.age}. {appConfig.patient.weight}. État corporel : {appConfig.patient.bodyCondition}.</dd></div>
          <div><dt>Nom d’usage</dt><dd>« Mon raton ». Orientation immédiate à cet appel par l’individu familier.</dd></div>
          <div><dt>Admission</dt><dd>Patient retrouvé avec un petit cadeau. Conservation du paquet à proximité, sans comportement alimentaire associé.</dd></div>
          <div><dt>Motif de référé</dt><dd>Repos, prise alimentaire et coopération nettement améliorés auprès d’un seul individu. Recherche de proximité persistante en son absence.</dd></div>
        </dl></div>
      </article>
      <div className="next-step-bar"><button className="primary-button" onClick={() => navigate("history")}>Anamnèse<Icon name="arrow" size={17} /></button></div>
    </section>;
  }

  function renderHistory() {
    return (
      <section className="page-section">
        <SectionIntro
          eyebrow={sectionMeta.history.eyebrow}
          title="Anamnèse"
          description=""
        >
          <span className="section-counter">4 éléments documentés</span>
        </SectionIntro>

        <div className="history-layout">
          <article className="card timeline-card">
            <div className="card-heading card-heading-wide">
              <div>
                <p className="card-eyebrow">HISTORIQUE RAPPORTÉ</p>
                <h2>Anamnèse chronologique</h2>
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

        </div>

        <div className="next-step-bar">
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
          description="Observation avant contention."
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
              Éveillé, locomotion conservée. Examen toléré brièvement avec un tiers ;
              maintien volontaire et coopération prolongée au contact de l’individu familier.
            </p>
            <div className="observation-status">
              <span className="status-check">
                <Icon name="check" size={14} />
              </span>
              <span>
                <strong>Contact volontaire</strong>
                <small>Relâchement postural, exploration interrompue, repos maintenu.</small>
              </span>
            </div>
          </article>
          <figure className="card contact-observation">
            <img className="patient-photo" src={import.meta.env.BASE_URL + "images/ratoncito-contact.jpg"}
              alt="Ratoncito au repos, la tête au contact d’une main détendue." width="1536" height="1024" loading="lazy" />
            <figcaption>Observation au contact · relâchement postural.</figcaption>
          </figure>
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
              6 présentations / condition
            </span>
          </div>
          <p className="panel-body-intro">
            Comparaison des conditions d’exposition dans le même environnement. Coopération évaluée séparément avec un opérateur témoin et l’individu A.
          </p>
          <div className="comparison-table-wrap">
            <table className="comparison-table"><caption>Coopération observée · 6 présentations</caption>
              <thead><tr><th>Tâche</th><th>Opérateur témoin</th><th>Individu A</th></tr></thead>
              <tbody>
                <tr><th>Réponse à l’appel</th><td>1 / 6</td><td>6 / 6</td></tr>
                <tr><th>Maintien au contact</th><td>0 / 6</td><td>6 / 6</td></tr>
                <tr><th>Prise du repas proposé</th><td>2 / 6</td><td>6 / 6</td></tr>
                <tr><th>Repos sans contrôle de la sortie</th><td>0 / 6</td><td>6 / 6</td></tr>
              </tbody>
            </table>
          </div>
          <p className="panel-body-intro">Rire caractéristique, dit « de sorcière » : orientation immédiate. Odeur familière : recherche de la source, puis maintien à proximité.</p>
          <div className="stimulus-list" role="group" aria-label="Conditions d’exposition">
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
          <div className="stimulus-detail" aria-live="polite">
            <div className="stimulus-detail-header">
              <div>
                <span className="card-eyebrow">OBSERVATIONS COMPORTEMENTALES</span>
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
          <div className="exploration-copy">
            <p className="card-eyebrow">DÉCISION D’EXPLORATION</p>
            <h3>Pas d’indication d’imagerie avancée à ce stade</h3>
            <p>
              L’état général conservé, l’examen non contributif et la dépendance
              stricte au contexte ne motivent pas, à ce stade, d’examen d’imagerie avancée.
            </p>
            <div className="decision-line">
              <span className="status-check">
                <Icon name="check" size={14} />
              </span>
              <strong>Surveillance clinique et comparaison comportementale</strong>
            </div>
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
          description=""
        >
          <span className="section-counter">
            {openedPanels.length} / {diagnosticPanels.length} examens consultés
          </span>
        </SectionIntro>

        <div className="diagnostic-stack">
          {diagnosticPanels.map((panel, index) => {
            const isOpen = expandedPanel === panel.id;
            return (
              <article className={isOpen ? "card diagnostic-panel is-open" : "card diagnostic-panel"} key={panel.id}>
                <button
                  id={"panel-trigger-" + panel.id}
                  aria-expanded={isOpen}
                  aria-controls={"panel-" + panel.id}
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
                    <span className="panel-review-state">{openedPanels.includes(panel.id) ? "Consulté" : "À consulter"}</span>
                  </span>
                  <span className="panel-status">
                    <StatusPill tone={panel.id === "behavior" ? "warm" : "muted"}>
                      {panel.status}
                    </StatusPill>
                    <Icon name="chevron" size={18} />
                  </span>
                </button>
                <div id={"panel-" + panel.id} hidden={!isOpen}>
                  {isOpen ? renderPanelBody(panel.id) : null}
                </div>
              </article>
            );
          })}
        </div>

        <div className="next-step-bar">
          <button className="primary-button" onClick={nextPanel ? resumeReview : readyForSynthesis ? generateSynthesis : () => navigate("differentials")}>
            {nextPanel ? "Consulter : " + nextPanel.title : readyForSynthesis ? "Établir le compte rendu" : "Classer les hypothèses"}
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
          description=""
        >
          <span className="section-counter">
            {classifiedCount} / {hypotheses.length} classifiées
          </span>
        </SectionIntro>

        {nextPanel ? <div className="review-notice">
          <p>Examens à consulter : {diagnosticPanels.filter((panel) => review.missingPanels.includes(panel.id)).map((panel) => panel.title).join(", ")}.</p>
          <button className="text-button" onClick={resumeReview}>Reprendre les examens<Icon name="arrow" size={16} /></button>
        </div> : null}
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
                id={"hypothesis-" + hypothesis.id}
                tabIndex={-1}
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
                      aria-pressed={state === "retain"}
                      className={state === "retain" ? "decision-button decision-button-selected" : "decision-button"}
                      onClick={() => classify(hypothesis.id, "retain")}
                    >
                      Retenir
                    </button>
                    <button
                      aria-pressed={state === "uncertain"}
                      className={state === "uncertain" ? "decision-button decision-button-selected" : "decision-button"}
                      onClick={() => classify(hypothesis.id, "uncertain")}
                    >
                      Incertain
                    </button>
                    <button
                      aria-pressed={state === "exclude"}
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
                  ? "Compte rendu disponible."
                  : "Évaluation incomplète."}
              </strong>
              <small>
                {`${openedPanels.length} / ${diagnosticPanels.length} examens consultés · ${classifiedCount} / ${hypotheses.length} hypothèses classées.`}
              </small>
            </div>
          </div>
          <button
            className="primary-button"
            onClick={resumeReview}
          >
            {nextPanel ? "Reprendre les examens" : review.missingHypotheses.length ? "Compléter les classifications" : "Établir le compte rendu"}
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </section>
    );
  }

  function renderSynthesis() {
    const isRevealed = revealStage === "revealed";
    return <section className="page-section synthesis-page">
      <SectionIntro eyebrow="Compte rendu" title="Synthèse & conduite à tenir" description="" />
      {!isRevealed ? <div className="card report-pending" role="status">Établissement du compte rendu…</div> : <>
        <article className="card clinical-report-card">
          <header className="report-header">
            <div>
              <p className="card-eyebrow">COMPTE RENDU DE CONSULTATION · NAC</p>
              <h2>Ratoncito</h2>
            </div>
            <span className="report-reference">{appConfig.case.id}</span>
          </header>
          <div className="report-body report-sections">
            <section className="report-section report-section-identity">
              <h3>1 · Identification du patient</h3>
              <dl className="report-facts">
                <div><dt>Patient</dt><dd>Ratoncito, dit « mon raton »</dd></div>
                <div><dt>Espèce</dt><dd><em>{appConfig.patient.species}</em> · {appConfig.patient.sex}</dd></div>
                <div><dt>Signalement</dt><dd>{appConfig.patient.age} · {appConfig.patient.weight} · état corporel {appConfig.patient.bodyCondition}</dd></div>
              </dl>
            </section>
            <section className="report-section">
              <h3>2 · Motif de consultation</h3>
              <p>Recherche persistante d’un contact exclusif, avec repos, prise alimentaire et coopération nettement améliorés auprès d’un seul individu familier.</p>
            </section>
            <section className="report-section">
              <h3>3 · Anamnèse</h3>
              <p>Attachement ancien et stable. Orientation immédiate à l’appel « mon raton », reconnaissance de la voix, du rire et de l’odeur. En séparation, contrôle du point de sortie et préparation du lieu de repos ; apaisement sans délai au rapprochement. Repas préparés et repos partagé devant Hunter × Hunter associés à une meilleure stabilité.</p>
            </section>
            <section className="report-section">
              <h3>4 · Examen clinique</h3>
              <dl className="report-facts report-facts-compact">
                {examRows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd><strong>{row.value}</strong><span>{row.interpretation}</span></dd></div>)}
              </dl>
            </section>
            <section className="report-section">
              <h3>5 · Hématologie</h3>
              <p><strong>Profil non contributif.</strong> Hématocrite à 46 %, formule leucocytaire sans particularité et frottis sanguin non contributif. Aucune anomalie hématologique majeure mise en évidence.</p>
            </section>
            <section className="report-section">
              <h3>6 · Biochimie</h3>
              <dl className="report-lab-grid">
                <div><dt>Glucose</dt><dd>8,9 mmol/L</dd></div><div><dt>Urée</dt><dd>4,1 mmol/L</dd></div>
                <div><dt>Créatinine</dt><dd>31 µmol/L</dd></div><div><dt>ALT</dt><dd>61 UI/L</dd></div>
                <div><dt>Protéines totales</dt><dd>72 g/L</dd></div><div><dt>Sodium</dt><dd>139 mmol/L</dd></div>
              </dl>
              <p className="report-note">Profil sans anomalie susceptible d’expliquer le tableau ; valeurs comparées avec prudence aux intervalles publiés chez le rat de compagnie.</p>
            </section>
            <section className="report-section">
              <h3>7 · Exploration clinique</h3>
              <p>Aucune atteinte organique objectivable. En l’absence de signe d’appel et compte tenu du caractère strictement contextuel, aucune indication d’imagerie avancée n’est retenue à ce stade.</p>
            </section>
            <section className="report-section">
              <h3>8 · Analyse comportementale comparative</h3>
              <div className="report-highlight">
                <strong>Individu identifié : {recipientName || "vous"}</strong>
                <span>Orientation 0,7 s · approche et contact 6/6 · coopération 6/6 · retour au calme &lt; 10 s au contact</span>
              </div>
              <p>La réponse forte, sélective et reproductible n’est reproduite ni par l’environnement familier, ni par l’alimentation, l’enrichissement, la manipulation neutre, un opérateur inconnu ou la condition contrôle.</p>
            </section>
            <section className="report-section">
              <h3>9 · Hypothèses diagnostiques écartées</h3>
              <p>Affection métabolique, cause neurologique, affection cardio-respiratoire primaire, processus douloureux et cause toxique : hypothèses non soutenues par l’examen, les analyses disponibles et la spécificité contextuelle.</p>
            </section>
            <section className="report-section">
              <h3>10 · Hypothèse incertaine</h3>
              <p><strong>Trouble comportemental primaire.</strong> Le caractère sélectif ne suffit pas à l’établir ; aucun retentissement durable sur l’alimentation ou l’activité n’est documenté.</p>
            </section>
            <section className="report-section">
              <h3>11 · Hypothèse retenue</h3>
              <p><strong>Réponse spécifique à un stimulus identifié.</strong> Cette hypothèse rend compte de la sélectivité, de la répétabilité et de la résolution au rapprochement sans ajouter de maladie non documentée.</p>
            </section>
            <section className="report-section">
              <h3>12 · Discussion clinique</h3>
              <p>La conservation de l’état général, l’absence de déficit focal et le bilan biologique rassurant rendent une origine organique peu probable. La concordance temporelle des réponses à la voix, à l’odeur et au contact, associée à l’échec des conditions de substitution, soutient un attachement individuel marqué.</p>
            </section>
            <section className="report-section report-section-conclusion">
              <h3>13 · Conclusion</h3>
              <p>Attachement individuel marqué à {recipientName || "l’individu identifié"}, avec recherche persistante de présence et apaisement reproductible au contact.</p>
            </section>
            <section className="report-section report-section-plan">
              <h3>14 · Conduite à tenir</h3>
              <p>Prise en charge par l’individu identifié, maintien des repères familiers, des routines alimentaires, du repos partagé et des contacts relationnels essentiels. Surveillance de l’état général, de l’appétit et de toute modification comportementale.</p>
            </section>
          </div>
        </article>

        <article className="card adoption-contract" id="adoption-contract" tabIndex={-1} aria-labelledby="contract-title">
          <header className="contract-header">
            <p className="card-eyebrow">ANNEXE AU COMPTE RENDU · SUIVI DU BIEN-ÊTRE</p>
            <h2 id="contract-title">Conditions essentielles de prise en charge en cas d’adoption</h2>
            <p>Ces dispositions répondent aux besoins affectifs, relationnels et environnementaux observés chez Ratoncito. Leur maintien conditionne son équilibre.</p>
          </header>
          <dl className="contract-sections">
            <div><dt>Objet du suivi</dt><dd>Préserver durablement les conditions dans lesquelles le patient s’alimente, se repose et coopère avec stabilité.</dd></div>
            <div><dt>Patient</dt><dd>Ratoncito, dit « mon raton ».</dd></div>
            <div><dt>Adoptante</dt><dd>{recipientName || "Vous"}, individu de référence identifié au cours de l’exploration.</dd></div>
            <div><dt>Conditions d’environnement</dt><dd>Hébergement à proximité physique de l’adoptante, avec accès régulier aux contacts rapprochés et maintien des repères familiers.</dd></div>
            <div><dt>Conditions de repos</dt><dd>Repos partagé, notamment devant Hunter × Hunter, avec possibilité de demeurer au contact et de surveiller paisiblement les mouvements des pieds.</dd></div>
            <div><dt>Alimentation et routines</dt><dd>Repas réguliers préparés ou accompagnés par l’adoptante, sorties alimentaires au restaurant et rituels de retrouvailles incluant la remise de son cadeau.</dd></div>
            <div><dt>Contacts et besoins relationnels essentiels</dt><dd>Affection, écoute, proximité soutenue et bouche-à-bouche. Le coït, désigné « pan pan », ainsi que le besoin de téter font partie des modalités relationnelles indispensables documentées dans ce dossier.</dd></div>
            <div><dt>Signes de bien-être à préserver</dt><dd>Approche spontanée, maintien volontaire au contact, prise alimentaire régulière, relâchement postural et repos sans contrôle anxieux de la sortie.</dd></div>
            <div><dt>Conséquences possibles d’une privation</dt><dd>Recherche persistante de l’individu, vigilance accrue, difficulté à maintenir le repos et diminution de la coopération ou de la prise alimentaire.</dd></div>
            <div><dt>Recommandations de suivi</dt><dd>Maintenir ces conditions toute la vie du patient et réévaluer sans délai toute altération durable de l’appétit, de l’activité ou de l’état général.</dd></div>
          </dl>
          <div className="contract-validation">
            <p><strong>Validation de la prise en charge</strong><span>Acceptez-vous d’assurer ces conditions essentielles au bien-être de Ratoncito ?</span></p>
            <div className="contract-actions">
              <button className="primary-button" onClick={() => { setAdopted(true); setClosed(true); }}>Oui, j’adopte Ratoncito</button>
              <button className="secondary-button" onClick={() => { setAdopted(false); setClosed(true); }}>Non</button>
            </div>
          </div>
        </article>
      </>}
    </section>;
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
            Observation individuelle
          </span>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span>Pièces du dossier</span>
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
            <div className="sidebar-case">
              <span className="sidebar-case-icon">
                <Icon name="lock" size={14} />
              </span>
              <span>
                <strong>Dossier de référé</strong>
                <small>{appConfig.case.date}</small>
              </span>
            </div>
          </div>
        </aside>

        <main className="main-content" id="main-content" tabIndex={-1}>
          <div className="content-context">
            <span>
              {appConfig.clinic.name} <b>/</b> {appConfig.clinic.service}
            </span>
            <span>
              <Icon name="shield" size={13} />
              Destinataire unique
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

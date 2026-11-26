import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { getPublicHome, type PublicHomeData } from "../public-home-api";

type Props = {
  onNavigate: (path: string) => void;
};

const numberFormat = new Intl.NumberFormat("es-GT");

export default function PublicHomePage({ onNavigate }: Props) {
  const [home, setHome] = useState<PublicHomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHome = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      setHome(await getPublicHome(signal));
    } catch (loadError) {
      if (!signal?.aborted) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar la página pública.",
        );
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadHome(controller.signal);
    return () => controller.abort();
  }, [loadHome]);

  if (!home) {
    return (
      <main className="homeState">
        <a className="homeBrand" href="/">Tech<span>Odyssey</span><i>✦</i></a>
        {loading ? (
          <p role="status">Cargando TechOdyssey…</p>
        ) : (
          <div className="homeError" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => void loadHome()}>
              Reintentar
            </button>
          </div>
        )}
      </main>
    );
  }

  const { content, statistics, leaderboard } = home;
  const firstAvailableTechnology = content.technologies.find(
    (technology) => technology.status === "active" && technology.path,
  );
  const metrics = [
    {
      icon: "◉",
      label: content.participantsLabel,
      value: statistics.participantCount,
    },
    {
      icon: "⚗",
      label: content.completedModulesLabel,
      value: statistics.completedModuleCount,
    },
    {
      icon: "♜",
      label: content.experiencePointsLabel,
      value: statistics.totalExperiencePoints,
    },
    {
      icon: "✦",
      label: content.activeTechnologiesLabel,
      value: statistics.activeTechnologyCount,
    },
  ];

  return (
    <main className="publicHome">
      <header className="homeHeader">
        <div className="homeShell homeNavigation">
          <a className="homeBrand" href="/" aria-label="TechOdyssey, inicio">
            Tech<span>Odyssey</span><i>✦</i>
          </a>
          <nav aria-label="Navegación principal">
            <a href="#technologies">Tecnologías</a>
            <a href="#community">Comunidad</a>
            <a href="#how-it-works">Cómo funciona</a>
          </nav>
          <button
            className="homeLoginButton"
            type="button"
            disabled={!firstAvailableTechnology}
            onClick={() => {
              if (firstAvailableTechnology) onNavigate(firstAvailableTechnology.path);
            }}
          >
            <span aria-hidden="true">↪</span> Iniciar sesión
          </button>
        </div>
      </header>

      <section className="homeHero">
        <div className="heroSky" aria-hidden="true">
          <span className="heroPeak heroPeakBack" />
          <span className="heroPeak heroPeakFront" />
          <span className="heroCity" />
          <span className="heroPixelMark">✦</span>
        </div>
        <div className="homeShell heroLayout">
          <div className="heroMain">
            <span className="homeEyebrow">{content.heroEyebrow}</span>
            <h1>
              {content.heroTitle} <strong>{content.heroHighlight}</strong>
            </h1>
            <p>{content.heroDescription}</p>
            <a className="homePrimaryButton" href="#technologies">
              <span aria-hidden="true">◎</span>
              {content.heroCallToAction}
              <span aria-hidden="true">→</span>
            </a>
            <div className="heroBenefits">
              {content.benefits.map((benefit) => (
                <div className="heroBenefit" key={benefit.title}>
                  <span aria-hidden="true">{benefit.icon}</span>
                  <div>
                    <strong>{benefit.title}</strong>
                    <small>{benefit.description}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="heroQuote">
            <span className="quoteMark" aria-hidden="true">“</span>
            <p>{content.heroQuote}</p>
            <strong>{content.heroQuoteAttribution}</strong>
            <i aria-hidden="true" />
          </aside>
        </div>
      </section>

      <section className="homeSection homeShell" id="technologies">
        <div className="homeSectionHeading">
          <span className="homeEyebrow">Tu próxima aventura</span>
          <h2>{content.technologyHeading}</h2>
          <p>{content.technologyDescription}</p>
        </div>
        <div className="homeTechnologyGrid">
          {content.technologies.map((technology) => {
            const available = technology.status === "active" && Boolean(technology.path);
            return (
              <article
                className={available ? "homeTechnologyCard isAvailable" : "homeTechnologyCard"}
                key={technology.code}
                style={{ "--technology-color": technology.color } as CSSProperties}
              >
                <div className="technologyCardTop">
                  <span className="technologyCodeIcon">{technology.icon}</span>
                  <span className={available ? "homeStatus isAvailable" : "homeStatus"}>
                    {technology.statusLabel}
                  </span>
                </div>
                <h3>{technology.name}</h3>
                <p>{technology.description}</p>
                <button
                  type="button"
                  className={available ? "technologyAction" : "technologyAction isDisabled"}
                  disabled={!available}
                  onClick={() => onNavigate(technology.path)}
                >
                  {available ? "Ver ruta" : "Muy pronto"}
                  {available && <span aria-hidden="true">→</span>}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="communitySection" id="community">
        <div className="homeShell communityPanel">
          <div className="communityHeadingRow">
            <div>
              <span className="homeEyebrow">Progreso compartido</span>
              <h2>{content.communityHeading}</h2>
            </div>
            <span className="liveIndicator"><i /> Datos de la comunidad</span>
          </div>
          <div className="communityMetrics">
            {metrics.map((metric) => (
              <article className="communityMetric" key={metric.label}>
                <span className="metricIcon" aria-hidden="true">{metric.icon}</span>
                <div>
                  <strong>{numberFormat.format(metric.value)}</strong>
                  <small>{metric.label}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="homeShell leaderboardSection">
        <div className="leaderboardPanel">
          <div className="leaderboardMain">
            <div className="leaderboardHeading">
              <div>
                <span className="homeEyebrow">Clasificación general</span>
                <h2>{content.leaderboardHeading}</h2>
                <p>{content.leaderboardDescription}</p>
              </div>
              <span className="topBadge">TOP {content.leaderboardLimit}</span>
            </div>
            <div className="leaderboardTableWrap">
              {leaderboard.length === 0 ? (
                <p className="leaderboardEmpty">{content.leaderboardEmptyMessage}</p>
              ) : (
                <table className="leaderboardTable">
                  <thead>
                    <tr>
                      <th scope="col">Posición</th>
                      <th scope="col">Participante</th>
                      <th scope="col">Nivel</th>
                      <th scope="col">XP</th>
                      <th scope="col">Módulos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((participant) => (
                      <tr key={participant.position}>
                        <td>
                          <span className={`leaderRank rank-${participant.position}`}>
                            {participant.position}
                          </span>
                        </td>
                        <td className="leaderEmail">{participant.email}</td>
                        <td>{participant.level}</td>
                        <td className="leaderExperience">
                          {numberFormat.format(participant.experiencePoints)}
                        </td>
                        <td>{numberFormat.format(participant.completedModuleCount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <small className="leaderboardUpdated">
              Actualizado {new Date(home.updatedAt).toLocaleTimeString("es-GT")}
            </small>
          </div>
          <aside className="leaderboardCallout">
            <span className="leaderboardTrophy" aria-hidden="true">♜</span>
            <div>
              <h3>{content.closingHeading}</h3>
              <p>{content.closingDescription}</p>
              <button
                type="button"
                className="homePrimaryButton"
                disabled={!firstAvailableTechnology}
                onClick={() => {
                  if (firstAvailableTechnology) onNavigate(firstAvailableTechnology.path);
                }}
              >
                {content.closingCallToAction}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </aside>
          <button
            className="leaderboardRefresh"
            type="button"
            disabled={loading}
            onClick={() => void loadHome()}
          >
            {loading ? "Actualizando…" : "Actualizar datos"}
          </button>
          {error && <p className="leaderboardError" role="alert">{error}</p>}
        </div>
      </section>

      <section className="homeShell learningSection" id="how-it-works">
        <div className="homeSectionHeading">
          <span className="homeEyebrow">Tu misión comienza aquí</span>
          <h2>{content.learningStepsHeading}</h2>
        </div>
        <div className="learningSteps">
          {content.learningSteps.map((step) => (
            <article className="learningStep" key={step.code}>
              <span className="stepNumber">{step.code}</span>
              <span className="stepIcon" aria-hidden="true">{step.icon}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="homeFooter">
        <div className="homeShell footerContent">
          <a className="homeBrand" href="/">Tech<span>Odyssey</span><i>✦</i></a>
          <p>Aprende hoy. Construye el mañana.</p>
          <span>© {new Date().getFullYear()} TechOdyssey</span>
        </div>
      </footer>
    </main>
  );
}

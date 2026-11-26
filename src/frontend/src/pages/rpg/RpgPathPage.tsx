import { useEffect, useState } from "react";
import GamificationAccountPanel from "./GamificationAccountPanel";
import RpgDiagnostic from "./RpgDiagnostic";
import { diagnosticCopy } from "./diagnostic-content";
import {
  completeModule,
  GamificationApiError,
  getCurrentSession,
  getCompletedUnits,
  type AuthResponse,
} from "./gamification-api";
import LearningModulePage from "./m01/LearningModulePage";
import M02ModulePage from "./m02/M02ModulePage";
import M03U01ModulePage from "./m03/M03U01ModulePage";
import {
  calculateTechnologyProgress,
  getModuleProgressKey,
  hasCompletedRequiredUnits,
} from "./progress-utils";
import "./rpg-path.css";

type ModuleStatus = "available" | "locked";
type PageMode =
  | "path"
  | "intro"
  | "diagnostic"
  | "m01"
  | "m02"
  | "m03-u01";
const rpgTechnology = {
  code: "rpg",
  moduleCodes: Array.from(
    { length: 19 },
    (_, index) => `M${String(index).padStart(2, "0")}`,
  ),
} as const;
const m01RequiredUnits = Array.from(
  { length: 7 },
  (_, index) => `M01-S${String(index + 1).padStart(2, "0")}`,
);

interface LearningModule {
  id: string;
  title: string;
  description: string;
  status: ModuleStatus;
}

const baseModules: LearningModule[] = [
  {
    id: "M00",
    title: diagnosticCopy["module-title"],
    description: diagnosticCopy["module-description"],
    status: "available",
  },
  {
    id: "M01",
    title: "IBM i y Visual Studio Code",
    description:
      "Conoce IBM i, sus objetos y el entorno moderno de desarrollo.",
    status: "locked",
  },
  {
    id: "M02",
    title: "Anatomía de un programa Free RPG",
    description:
      "Explora la sintaxis Free RPG y su ciclo de edición en VS Code.",
    status: "locked",
  },
  {
    id: "M03",
    title: "Variables, constantes y tipos",
    description: "Declara, inicializa y utiliza datos correctamente.",
    status: "locked",
  },
  {
    id: "M04",
    title: "Operadores y expresiones",
    description: "Construye cálculos, comparaciones y expresiones lógicas.",
    status: "locked",
  },
  {
    id: "M05",
    title: "Control de flujo",
    description: "Aplica IF, ELSEIF, ELSE y SELECT en reglas de negocio.",
    status: "locked",
  },
  {
    id: "M06",
    title: "Ciclos y procesamiento repetitivo",
    description: "Repite procesos con ciclos controlados y legibles.",
    status: "locked",
  },
  {
    id: "M07",
    title: "Funciones integradas",
    description: "Transforma y consulta datos con funciones integradas de RPG.",
    status: "locked",
  },
  {
    id: "M08",
    title: "Estructuras de datos y arreglos",
    description: "Organiza datos relacionados con estructuras y arreglos.",
    status: "locked",
  },
  {
    id: "M09",
    title: "Db2 for i y SQL embebido",
    description: "Consulta y actualiza datos con SQL en aplicaciones RPG.",
    status: "locked",
  },
  {
    id: "M10",
    title: "Acceso nativo a archivos",
    description: "Trabaja con archivos de IBM i mediante operaciones RPG.",
    status: "locked",
  },
  {
    id: "M11",
    title: "Procedimientos e ILE",
    description: "Organiza programas RPG con procedimientos y componentes ILE.",
    status: "locked",
  },
  {
    id: "M12",
    title: "Errores, logging y observabilidad",
    description: "Diagnostica fallos y registra el comportamiento del programa.",
    status: "locked",
  },
  {
    id: "M13",
    title: "Pruebas de software",
    description: "Verifica el comportamiento RPG con pruebas reproducibles.",
    status: "locked",
  },
  {
    id: "M14",
    title: "Git y trabajo colaborativo",
    description: "Controla cambios y colabora en proyectos RPG.",
    status: "locked",
  },
  {
    id: "M15",
    title: "Lectura de RPG fijo",
    description: "Interpreta fuentes RPG escritos en formato posicional.",
    status: "locked",
  },
  {
    id: "M16",
    title: "Modernización a RPG Free",
    description: "Moderniza fuentes RPG posicionales hacia formato libre.",
    status: "locked",
  },
  {
    id: "M17",
    title: "IA aplicada al desarrollo IBM i",
    description: "Aplica IA como apoyo al trabajo de desarrollo en IBM i.",
    status: "locked",
  },
  {
    id: "M18",
    title: "Proyecto integrador",
    description: "Integra las competencias de la ruta en un proyecto final.",
    status: "locked",
  },
];

export default function RpgPathPage() {
  const [pageMode, setPageMode] = useState<PageMode>("path");
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [completedM01Units, setCompletedM01Units] = useState<string[]>([]);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [authPanelOpen, setAuthPanelOpen] = useState(false);
  const [pendingM00Completion, setPendingM00Completion] = useState(false);
  const [pendingM01Completion, setPendingM01Completion] = useState(false);
  const [pendingM02Completion, setPendingM02Completion] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [rewardError, setRewardError] = useState(false);
  const [awardingPoints, setAwardingPoints] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentSession()
      .then((profile) => {
        if (active) setSession(profile);
      })
      .catch((error: unknown) => {
        if (active) {
          setSessionError(
            error instanceof Error
              ? `No se pudo cargar la sesión: ${error.message}`
              : "No se pudo cargar la sesión.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const accountEmail = session?.email;
    if (!accountEmail) {
      setCompletedM01Units([]);
      return;
    }

    let active = true;
    void getCompletedUnits(rpgTechnology.code, "M01")
      .then((units) => {
        if (active) setCompletedM01Units(units);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setSessionError(
          error instanceof Error
            ? `No se pudo verificar el avance de M01: ${error.message}`
            : "No se pudo verificar el avance de M01.",
        );
      });

    return () => {
      active = false;
    };
  }, [session?.email]);

  const awardM00Points = async () => {
    setRewardMessage(null);
    setRewardError(false);
    setAwardingPoints(true);
    try {
      const completion = await completeModule(rpgTechnology.code, "M00");
      setSession((current) =>
        current ? { ...current, ...completion.progress } : current,
      );
      setPendingM00Completion(false);
      setRewardMessage(
        completion.pointsAwarded > 0
          ? `¡Diagnóstico completado! Ganaste ${completion.pointsAwarded} XP.`
          : "El diagnóstico ya estaba acreditado; no se sumaron XP adicionales.",
      );
    } catch (error) {
      if (error instanceof GamificationApiError && error.status === 401) {
        setSession(null);
        setAuthPanelOpen(true);
        setRewardMessage("Inicia sesión para guardar el progreso y recibir los XP.");
      } else {
        setRewardError(true);
        setRewardMessage(
          error instanceof Error
            ? `No se pudo guardar el progreso: ${error.message}`
            : "No se pudo guardar el progreso. Inténtalo de nuevo.",
        );
      }
    } finally {
      setAwardingPoints(false);
    }
  };

  const awardM01Points = async () => {
    setRewardMessage(null);
    setRewardError(false);
    setAwardingPoints(true);
    try {
      const completion = await completeModule(rpgTechnology.code, "M01");
      setSession((current) =>
        current ? { ...current, ...completion.progress } : current,
      );
      setPendingM01Completion(false);
      setRewardMessage(
        completion.pointsAwarded > 0
          ? `¡Módulo M01 completado! Ganaste ${completion.pointsAwarded} XP.`
          : "El módulo M01 ya estaba acreditado; no se sumaron XP adicionales.",
      );
    } catch (error) {
      if (error instanceof GamificationApiError && error.status === 401) {
        setSession(null);
        setAuthPanelOpen(true);
        setRewardMessage("Inicia sesión para guardar el progreso y recibir los XP.");
      } else {
        setRewardError(true);
        setRewardMessage(
          error instanceof Error
            ? `No se pudo guardar el progreso: ${error.message}`
            : "No se pudo guardar el progreso. Inténtalo de nuevo.",
        );
      }
    } finally {
      setAwardingPoints(false);
    }
  };

  const awardM02Points = async () => {
    setRewardMessage(null);
    setRewardError(false);
    setAwardingPoints(true);
    try {
      const completion = await completeModule(rpgTechnology.code, "M02");
      setSession((current) =>
        current ? { ...current, ...completion.progress } : current,
      );
      setPendingM02Completion(false);
      setRewardMessage(
        completion.pointsAwarded > 0
          ? `¡Módulo M02 completado! Ganaste ${completion.pointsAwarded} XP.`
          : "El módulo M02 ya estaba acreditado; no se sumaron XP adicionales.",
      );
    } catch (error) {
      if (error instanceof GamificationApiError && error.status === 401) {
        setSession(null);
        setAuthPanelOpen(true);
        setRewardMessage("Inicia sesión para guardar el progreso y recibir los XP.");
      } else {
        setRewardError(true);
        setRewardMessage(
          error instanceof Error
            ? `No se pudo guardar el progreso: ${error.message}`
            : "No se pudo guardar el progreso. Inténtalo de nuevo.",
        );
      }
    } finally {
      setAwardingPoints(false);
    }
  };

  const retryPendingReward = () => {
    if (pendingM02Completion) {
      void awardM02Points();
    } else if (pendingM01Completion) {
      void awardM01Points();
    } else {
      void awardM00Points();
    }
  };

  const handleAuthenticated = async () => {
    setSessionError(null);
    if (pendingM00Completion) {
      await awardM00Points();
    }
    if (pendingM01Completion) {
      await awardM01Points();
    }
    if (pendingM02Completion) {
      await awardM02Points();
    }
  };

  const completedModulesForProgress = new Set(session?.completedModules ?? []);
  const modules = baseModules.map((module) => {
    if (
      module.id === "M01"
      && (
        diagnosticScore !== null
        || session?.completedModules.includes(
          getModuleProgressKey(rpgTechnology.code, "M00"),
        )
      )
    ) {
      return { ...module, status: "available" as ModuleStatus };
    }
    if (
      module.id === "M02"
      && (
        completedModulesForProgress.has(
          getModuleProgressKey(rpgTechnology.code, "M01"),
        )
        || hasCompletedRequiredUnits(completedM01Units, m01RequiredUnits)
      )
    ) {
      return { ...module, status: "available" as ModuleStatus };
    }
    if (
      module.id === "M03"
      && completedModulesForProgress.has(
        getModuleProgressKey(rpgTechnology.code, "M02"),
      )
    ) {
      return { ...module, status: "available" as ModuleStatus };
    }
    return module;
  });

  const technologyProgress = calculateTechnologyProgress(
    Array.from(completedModulesForProgress),
    rpgTechnology.code,
    rpgTechnology.moduleCodes,
  );

  const goHome = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const openModule = (moduleId: string) => {
    if (moduleId === "M00") {
      setPageMode("intro");
    } else if (moduleId === "M01") {
      setPageMode("m01");
    } else if (moduleId === "M02") {
      setPageMode("m02");
    } else if (moduleId === "M03") {
      setPageMode("m03-u01");
    }
  };

  if (pageMode === "m01") {
    return (
      <LearningModulePage
        onBack={() => setPageMode("path")}
        accountKey={session?.email ?? null}
        technologyCode={rpgTechnology.code}
        moduleCode="M01"
        onComplete={() => {
          setPendingM01Completion(true);
          if (session) {
            void awardM01Points();
          } else {
            setRewardMessage("Inicia sesión para guardar el progreso y recibir 100 XP.");
          }
        }}
      />
    );
  }

  if (pageMode === "m02") {
    return (
      <M02ModulePage
        onBack={() => setPageMode("path")}
        accountKey={session?.email ?? null}
        technologyCode={rpgTechnology.code}
        moduleCode="M02"
        onComplete={() => {
          setPendingM02Completion(true);
          if (session) {
            void awardM02Points();
          } else {
            setRewardMessage("Inicia sesión para guardar el progreso y recibir 100 XP.");
          }
        }}
      />
    );
  }

  if (pageMode === "m03-u01") {
    return (
      <M03U01ModulePage
        onBack={() => setPageMode("path")}
        accountKey={session?.email ?? null}
        technologyCode={rpgTechnology.code}
        moduleCode="M03"
      />
    );
  }

  if (pageMode === "diagnostic") {
    return (
      <RpgDiagnostic
        isAuthenticated={session !== null}
        rewardMessage={rewardMessage}
        rewardError={rewardError}
        awardingPoints={awardingPoints}
        onRequestLogin={() => {
          setPageMode("intro");
          setAuthPanelOpen(true);
        }}
        onRetryReward={() => void awardM00Points()}
        onBack={() => setPageMode("intro")}
        onComplete={(score) => {
          setDiagnosticScore(score);
          setPendingM00Completion(true);
          if (session) {
            void awardM00Points();
          } else {
            setRewardMessage("Inicia sesión para guardar el progreso y recibir 100 XP.");
          }
        }}
      />
    );
  }

  if (pageMode === "intro") {
    return (
      <main className="diagnosticPage">
        <nav className="pathNavigation pathNavigationLight">
          <button
            className="brandLink brandLinkDark"
            type="button"
            onClick={goHome}
          >
            TechOdyssey
          </button>

          <button
            className="backLink backLinkDark"
            type="button"
            onClick={() => setPageMode("path")}
          >
            ← Volver a la ruta RPG
          </button>
          <GamificationAccountPanel
            session={session}
            loadingSession={loadingSession}
            sessionError={sessionError}
            open={authPanelOpen}
            onOpenChange={setAuthPanelOpen}
            onSessionChange={setSession}
            onAuthenticated={handleAuthenticated}
          />
        </nav>

        {rewardMessage && (
          <div
            className={rewardError ? "rewardNotice rewardNoticeError" : "rewardNotice"}
            role={rewardError ? "alert" : "status"}
          >
            {rewardMessage}
          </div>
        )}
        {rewardError && session && (
          <button
            className="moduleButton rewardRetryButton"
            type="button"
            disabled={awardingPoints}
            onClick={retryPendingReward}
          >
            Reintentar guardar XP
          </button>
        )}

        <section className="diagnosticHero">
          <span className="routeBadge">M00 · Diagnóstico inicial</span>
          <h1>{diagnosticCopy["intro-title"]}</h1>
          <p>{diagnosticCopy["intro-description"]}</p>
        </section>

        <section className="diagnosticPanel">
          <div>
            <span className="diagnosticStep">Antes de comenzar</span>
            <h2>¿Qué evaluaremos?</h2>
            <ul className="diagnosticList">
              {diagnosticCopy["evaluation-topics"].map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>

          <aside className="diagnosticSummary">
            <strong>{diagnosticCopy["questions-per-attempt"]} preguntas por intento</strong>
            <span>Tiempo estimado: {diagnosticCopy["estimated-time"]}</span>
            <span>{diagnosticCopy["sampling-description"]}</span>
            {diagnosticScore !== null && (
              <span>Último resultado: {diagnosticScore}%</span>
            )}
            {session && (
              <span>Nivel {session.level} · {session.experiencePoints} XP</span>
            )}
            <button
              className="moduleButton diagnosticButton"
              type="button"
              onClick={() => setPageMode("diagnostic")}
            >
              Iniciar diagnóstico
            </button>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="pathPage">
      <header className="pathHeader">
        <nav className="pathNavigation">
          <button className="brandLink" type="button" onClick={goHome}>
            TechOdyssey
          </button>
          <button className="backLink" type="button" onClick={goHome}>
            ← Volver a tecnologías
          </button>
          <GamificationAccountPanel
            session={session}
            loadingSession={loadingSession}
            sessionError={sessionError}
            open={authPanelOpen}
            onOpenChange={setAuthPanelOpen}
            onSessionChange={setSession}
            onAuthenticated={handleAuthenticated}
          />
        </nav>

        {rewardMessage && (
          <div
            className={rewardError ? "rewardNotice rewardNoticeError" : "rewardNotice"}
            role={rewardError ? "alert" : "status"}
          >
            {rewardMessage}
          </div>
        )}
        {rewardError && session && (
          <button
            className="moduleButton rewardRetryButton"
            type="button"
            disabled={awardingPoints}
            onClick={retryPendingReward}
          >
            Reintentar guardar XP
          </button>
        )}

        <div className="pathHero">
          <span className="routeBadge">Ruta tecnológica</span>
          <h1>IBM i y RPG</h1>
          <p>
            Aprende IBM i, Visual Studio Code, RPG Free, Db2 for i, ILE, Git y
            modernización mediante una ruta progresiva.
          </p>
          <div className="pathSummary">
            <div><strong>19</strong><span>Módulos</span></div>
            <div><strong>180 h</strong><span>Duración estimada</span></div>
            <div><strong>{technologyProgress}%</strong><span>Progreso actual</span></div>
          </div>
        </div>
      </header>

      <section className="pathContent">
        <div className="sectionHeading pathHeading">
          <span className="eyebrow">Currículo</span>
          <h2>Comienza por los fundamentos</h2>
          <p>
            Los módulos se desbloquean progresivamente al completar las
            actividades y evaluaciones obligatorias.
          </p>
        </div>

        <div className="moduleList">
          {modules.map((module, index) => (
            <article
              className={
                module.status === "available"
                  ? "moduleCard moduleCardAvailable"
                  : "moduleCard moduleCardLocked"
              }
              key={module.id}
            >
              <div className="moduleOrder">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="moduleInformation">
                <span className="moduleCode">{module.id}</span>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>

              {module.status === "available" ? (
                <button
                  className="moduleButton"
                  type="button"
                  onClick={() => openModule(module.id)}
                >
                  {module.id === "M00" && diagnosticScore !== null
                    ? "Repetir"
                    : completedModulesForProgress.has(
                      getModuleProgressKey(rpgTechnology.code, module.id),
                    )
                      ? "Continuar"
                      : "Comenzar"}
                </button>
              ) : (
                <span className="moduleLocked">🔒 Bloqueado</span>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

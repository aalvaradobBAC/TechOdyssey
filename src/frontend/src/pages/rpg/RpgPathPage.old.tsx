import { useState } from "react";
import "./rpg-path.css";

type ModuleStatus = "available" | "locked";

interface LearningModule {
  id: string;
  title: string;
  description: string;
  status: ModuleStatus;
}

const modules: LearningModule[] = [
  {
    id: "M00",
    title: "Diagnóstico y ruta personalizada",
    description:
      "Identifica conocimientos previos y define el punto de entrada recomendado.",
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
    title: "Anatomía de un programa RPG",
    description:
      "Comprende la estructura de un programa RPG totalmente libre.",
    status: "locked",
  },
  {
    id: "M03",
    title: "Variables, constantes y tipos",
    description:
      "Declara, inicializa y utiliza datos correctamente.",
    status: "locked",
  },
  {
    id: "M04",
    title: "Operadores y expresiones",
    description:
      "Construye cálculos, comparaciones y expresiones lógicas.",
    status: "locked",
  },
  {
    id: "M05",
    title: "Control de flujo",
    description:
      "Aplica IF, ELSEIF, ELSE y SELECT en reglas de negocio.",
    status: "locked",
  },
];

export default function RpgPathPage() {
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  const goHome = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  if (showDiagnostic) {
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
            onClick={() => setShowDiagnostic(false)}
          >
            ← Volver a la ruta RPG
          </button>
        </nav>

        <section className="diagnosticHero">
          <span className="routeBadge">M00 · Diagnóstico inicial</span>
          <h1>Construyamos tu ruta personalizada</h1>
          <p>
            Esta evaluación identifica tu experiencia en programación,
            IBM i, RPG, SQL, Visual Studio Code y Git. No afecta tu puntuación.
          </p>
        </section>

        <section className="diagnosticPanel">
          <div>
            <span className="diagnosticStep">Antes de comenzar</span>
            <h2>¿Qué evaluaremos?</h2>

            <ul className="diagnosticList">
              <li>Fundamentos de programación</li>
              <li>Conceptos de IBM i y objetos</li>
              <li>Experiencia previa con RPG</li>
              <li>SQL y acceso a datos</li>
              <li>Visual Studio Code y Git</li>
            </ul>
          </div>

          <aside className="diagnosticSummary">
            <strong>15 preguntas</strong>
            <span>Tiempo estimado: 12 minutos</span>
            <span>Resultado: ruta recomendada</span>

            <button
              className="moduleButton diagnosticButton"
              type="button"
              onClick={() =>
                window.alert(
                  "El cuestionario diagnóstico será el siguiente componente que construiremos.",
                )
              }
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
        </nav>

        <div className="pathHero">
          <span className="routeBadge">Ruta tecnológica</span>
          <h1>IBM i y RPG</h1>
          <p>
            Aprende IBM i, Visual Studio Code, RPG Free, Db2 for i, ILE, Git y
            modernización mediante una ruta progresiva.
          </p>

          <div className="pathSummary">
            <div>
              <strong>19</strong>
              <span>Módulos</span>
            </div>
            <div>
              <strong>180 h</strong>
              <span>Duración estimada</span>
            </div>
            <div>
              <strong>0%</strong>
              <span>Progreso actual</span>
            </div>
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
                  onClick={() => setShowDiagnostic(true)}
                >
                  Comenzar
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

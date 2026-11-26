import { useMemo, useState } from "react";
import content from "./m01-content.json";
import "./m01-module.css";

type KnowledgeCheck = {
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
};

type Topic = {
  title: string;
  content?: string[];
  steps?: string[];
  items?: Array<{ code?: string; name?: string; purpose?: string }>;
};

type ModuleStep = { title: string; description: string };

type Section = {
  id: string;
  order: number;
  title: string;
  estimatedMinutes: number;
  type: string;
  introduction?: string;
  topics?: Topic[];
  requirements?: string[];
  steps?: ModuleStep[];
  securityNotes?: string[];
  successCriteria?: string[];
  failureScenarios?: Array<{ problem: string; review: string }>;
  knowledgeCheck?: KnowledgeCheck;
  mission?: {
    title: string;
    scenario: string;
    deliverables: string[];
    scoring: Array<{ criterion: string; weight: number }>;
  };
};

type Props = {
  onBack: () => void;
  onComplete?: (score: number) => void;
};

export default function M01ModulePage({ onBack, onComplete }: Props) {
  const sections = content.sections as Section[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const section = sections[currentIndex];
  const progress = Math.round((completedSections.length / sections.length) * 100);
  const sectionComplete = completedSections.includes(section.id);

  const totalMinutes = useMemo(
    () => sections.reduce((total, item) => total + item.estimatedMinutes, 0),
    [sections],
  );

  const markComplete = () => {
    if (!sectionComplete) {
      const updated = [...completedSections, section.id];
      setCompletedSections(updated);
      if (updated.length === sections.length) onComplete?.(100);
    }
  };

  const goToSection = (index: number) => {
    setCurrentIndex(index);
    setSelectedAnswer(null);
    setFeedbackVisible(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateKnowledge = () => {
    if (selectedAnswer === null || !section.knowledgeCheck) return;
    setFeedbackVisible(true);
    if (selectedAnswer === section.knowledgeCheck.correctOption) markComplete();
  };

  return (
    <main className="m01Page">
      <header className="m01Topbar">
        <button className="m01Brand" type="button" onClick={onBack}>TechOdyssey</button>
        <div className="m01TopProgress">
          <span>M01 · {progress}% completado</span>
          <div><i style={{ width: `${progress}%` }} /></div>
        </div>
        <button className="m01Exit" type="button" onClick={onBack}>← Volver a la ruta</button>
      </header>

      <section className="m01Hero">
        <div>
          <span className="m01Badge">Módulo 01</span>
          <h1>{content.module.title}</h1>
          <p>{content.module.subtitle}</p>
        </div>
        <div className="m01Metrics">
          <div><strong>{sections.length}</strong><span>Secciones</span></div>
          <div><strong>{Math.round(totalMinutes / 60)} h</strong><span>Duración</span></div>
          <div><strong>{content.module.minimumScore}%</strong><span>Aprobación</span></div>
        </div>
      </section>

      <div className="m01Layout">
        <aside className="m01Sidebar">
          <span className="m01SidebarTitle">Contenido del módulo</span>
          <nav>
            {sections.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={index === currentIndex ? "m01NavItem m01NavItemActive" : "m01NavItem"}
                onClick={() => goToSection(index)}
              >
                <span>{completedSections.includes(item.id) ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <div><strong>{item.title}</strong><small>{item.estimatedMinutes} min</small></div>
              </button>
            ))}
          </nav>
        </aside>

        <article className="m01Content">
          <header className="m01SectionHeader">
            <div>
              <span>{section.id} · {section.type.replace("-", " ")}</span>
              <h2>{section.title}</h2>
              {section.introduction && <p>{section.introduction}</p>}
            </div>
            <strong>{section.estimatedMinutes} min</strong>
          </header>

          {section.topics?.map((topic) => (
            <section className="m01Topic" key={topic.title}>
              <h3>{topic.title}</h3>
              {topic.content?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {topic.steps && <ol>{topic.steps.map((item) => <li key={item}>{item}</li>)}</ol>}
              {topic.items && (
                <div className="m01ObjectGrid">
                  {topic.items.map((item) => (
                    <div key={item.code}><code>{item.code}</code><strong>{item.name}</strong><p>{item.purpose}</p></div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {section.requirements && <InfoList title="Requisitos" items={section.requirements} />}

          {section.steps && (
            <section className="m01Topic">
              <h3>Práctica guiada</h3>
              <div className="m01StepList">
                {section.steps.map((item, index) => (
                  <div key={item.title}><span>{index + 1}</span><div><strong>{item.title}</strong><p>{item.description}</p></div></div>
                ))}
              </div>
            </section>
          )}

          {section.securityNotes && <InfoList title="Controles de seguridad" items={section.securityNotes} warning />}
          {section.successCriteria && <InfoList title="Criterios de éxito" items={section.successCriteria} />}

          {section.failureScenarios && (
            <section className="m01Topic">
              <h3>Si algo falla</h3>
              <div className="m01FailureGrid">
                {section.failureScenarios.map((item) => <div key={item.problem}><strong>{item.problem}</strong><p>{item.review}</p></div>)}
              </div>
            </section>
          )}

          {section.knowledgeCheck && (
            <section className="m01Check">
              <span>Comprobación de conocimiento</span>
              <h3>{section.knowledgeCheck.question}</h3>
              <div className="m01Answers">
                {section.knowledgeCheck.options.map((option, index) => (
                  <button
                    type="button"
                    className={selectedAnswer === index ? "m01Answer m01AnswerSelected" : "m01Answer"}
                    onClick={() => { setSelectedAnswer(index); setFeedbackVisible(false); }}
                    key={option}
                  >
                    <b>{String.fromCharCode(65 + index)}</b>{option}
                  </button>
                ))}
              </div>
              <button className="m01Primary" type="button" disabled={selectedAnswer === null} onClick={validateKnowledge}>Validar respuesta</button>
              {feedbackVisible && (
                <div className={selectedAnswer === section.knowledgeCheck.correctOption ? "m01Feedback correct" : "m01Feedback incorrect"}>
                  <strong>{selectedAnswer === section.knowledgeCheck.correctOption ? "Respuesta correcta" : "Respuesta incorrecta"}</strong>
                  <p>{section.knowledgeCheck.explanation}</p>
                </div>
              )}
            </section>
          )}

          {section.mission && (
            <section className="m01Mission">
              <span>Misión de cierre</span><h3>{section.mission.title}</h3><p>{section.mission.scenario}</p>
              <h4>Entregables</h4><ul>{section.mission.deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
              <h4>Puntuación</h4>
              <div className="m01Scoring">{section.mission.scoring.map((item) => <div key={item.criterion}><span>{item.criterion}</span><strong>{item.weight}%</strong></div>)}</div>
            </section>
          )}

          {!section.knowledgeCheck && (
            <button className="m01Primary" type="button" onClick={markComplete} disabled={sectionComplete}>
              {sectionComplete ? "Sección completada" : "Marcar como completada"}
            </button>
          )}

          <footer className="m01Navigation">
            <button type="button" disabled={currentIndex === 0} onClick={() => goToSection(currentIndex - 1)}>← Anterior</button>
            <button type="button" disabled={currentIndex === sections.length - 1} onClick={() => goToSection(currentIndex + 1)}>Siguiente →</button>
          </footer>
        </article>
      </div>
    </main>
  );
}

function InfoList({ title, items, warning = false }: { title: string; items: string[]; warning?: boolean }) {
  return <section className={warning ? "m01InfoList warning" : "m01InfoList"}><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

import { useEffect, useMemo, useState } from "react";
import content from "./m01-content.json";
import M01Section05 from "./M01Section05";
import M01Section04 from "./M01Section04";
import {
  completeUnit,
  getCompletedUnits,
} from "../gamification-api";
import {
  calculateAssessmentScore,
  selectRandomIndex,
  shuffleOptions,
} from "../progress-utils";
import "./m01-module.css";

type KnowledgeCheck = {
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  hint?: string;
  code?: string;
};
type KnowledgeCheckBank = { questions: KnowledgeCheck[] };

function getKnowledgeQuestions(
  knowledgeCheck: KnowledgeCheck | KnowledgeCheckBank | undefined,
): KnowledgeCheck[] {
  if (!knowledgeCheck) return [];
  return "questions" in knowledgeCheck
    ? knowledgeCheck.questions
    : [knowledgeCheck];
}

type Topic = {
  title: string;
  content?: string[];
  steps?: string[];
  codeCaption?: string;
  code?: string;
  items?: Array<{ code?: string; name?: string; purpose?: string }>;
};

type ModuleStep = { title: string; description: string };
type ChallengeTextResult = {
  valid: boolean;
  missing: string[];
  forbidden: string[];
};
type ModuleAssessment = {
  title: string;
  introduction: string;
  questions: KnowledgeCheck[];
};

type Challenge = {
  title: string;
  instruction: string;
  deliverables: string[];
  successCriteria: string[];
  ordering?: {
    prompt: string;
    blocks: string[];
    correctOrder: string[];
  };
  freeText?: {
    prompt: string;
    originalText?: string;
    placeholder?: string;
    lines?: Array<{
      prompt: string;
      originalText: string;
      placeholder: string;
      requiredPattern: string;
      forbiddenPatterns?: string[];
    }>;
    requiredPatterns?: string[];
    forbiddenPatterns?: string[];
  };
  solution?: {
    caption: string;
    code: string;
  };
};

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
  challenge?: Challenge;
  knowledgeCheck?: KnowledgeCheck | KnowledgeCheckBank;
  mission?: {
    title: string;
    scenario: string;
    deliverables: string[];
    scoring: Array<{ criterion: string; weight: number }>;
  };
};

export type LearningModuleContent = {
  module: {
    id: string;
    title: string;
    subtitle: string;
    estimatedMinutes: number;
    minimumScore: number;
    completionBadge?: string;
    mission?: { title: string; scenario: string };
    assessment?: ModuleAssessment;
  };
  sections: Section[];
};

const defaultContent: LearningModuleContent = content;

type Props = {
  onBack: () => void;
  onComplete?: (score: number) => void;
  accountKey?: string | null;
  technologyCode: string;
  moduleCode: string;
  moduleContent?: LearningModuleContent;
  completionMode?: "module" | "units";
};

export default function LearningModulePage({
  onBack,
  onComplete,
  accountKey,
  technologyCode,
  moduleCode,
  moduleContent,
  completionMode = "module",
}: Props) {
  const module = moduleContent ?? defaultContent;
  const sections = module.sections;
  const localStorageKey = [
    "learning-progress.units",
    technologyCode.toLowerCase(),
    moduleCode.toLowerCase(),
    accountKey?.toLowerCase() ?? "anonymous",
  ].join(":");
  const legacyLocalStorageKey = technologyCode === "rpg" && moduleCode === "M01"
    ? accountKey
      ? `m01.completedSections:${accountKey.toLowerCase()}`
      : "m01.completedSections"
    : null;
  const readLocalCompletedUnits = () => {
    try {
      const saved = window.localStorage.getItem(localStorageKey)
        ?? (legacyLocalStorageKey
          ? window.localStorage.getItem(legacyLocalStorageKey)
          : null);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string =>
            sections.some((item) => item.id === id),
          )
        : [];
    } catch {
      return [];
    }
  };
  const [completedSections, setCompletedSections] = useState<string[]>(() => {
    return readLocalCompletedUnits();
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    const completed = readLocalCompletedUnits();
    const nextIndex = sections.findIndex((item) => !completed.includes(item.id));
    return nextIndex >= 0 ? nextIndex : 0;
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [checkedChallengeCriteria, setCheckedChallengeCriteria] = useState<string[]>([]);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [orderedBlocks, setOrderedBlocks] = useState<string[]>([]);
  const [orderingResult, setOrderingResult] = useState<boolean | null>(null);
  const [challengeText, setChallengeText] = useState("");
  const [challengeLineAnswers, setChallengeLineAnswers] =
    useState<Record<number, string>>({});
  const [challengeTextResult, setChallengeTextResult] =
    useState<ChallengeTextResult | null>(null);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, number>>({});
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [knowledgeAttempt, setKnowledgeAttempt] = useState(0);
  const [knowledgeQuestionIndex, setKnowledgeQuestionIndex] = useState(() => {
    const questions = getKnowledgeQuestions(sections[currentIndex]?.knowledgeCheck);
    return questions.length > 0 ? selectRandomIndex(questions.length) : 0;
  });
  const [assessmentAttempt, setAssessmentAttempt] = useState(0);

  const section = sections[currentIndex];
  const knowledgeQuestions = getKnowledgeQuestions(section.knowledgeCheck);
  const activeKnowledgeCheck =
    knowledgeQuestions[knowledgeQuestionIndex] ?? knowledgeQuestions[0] ?? null;
  const progress = Math.round((completedSections.length / sections.length) * 100);
  const sectionComplete = completedSections.includes(section.id);
  const moduleComplete = completedSections.length === sections.length;
  const unitLabel = moduleCode === "M02" ? "Unidad" : "Sección";
  const unitsLabel = moduleCode === "M02" ? "Unidades" : "Secciones";
  const criteriaComplete = section.challenge?.successCriteria.every((criterion) =>
    checkedChallengeCriteria.includes(criterion),
  ) ?? true;
  const challengeComplete = criteriaComplete
    && (!section.challenge?.ordering || orderingResult === true)
    && (!section.challenge?.freeText || challengeTextResult?.valid === true);
  const assessmentPassed = assessmentScore !== null
    && assessmentScore >= module.module.minimumScore;
  const knowledgeOptions = useMemo(
    () => activeKnowledgeCheck
      ? shuffleOptions(
          activeKnowledgeCheck.options,
          activeKnowledgeCheck.correctOption,
        )
      : null,
    [activeKnowledgeCheck, knowledgeAttempt],
  );
  const assessmentOptionSets = useMemo(
    () => module.module.assessment?.questions.map((question) =>
      shuffleOptions(question.options, question.correctOption),
    ) ?? [],
    [module.module.assessment, assessmentAttempt],
  );

  useEffect(() => {
    const ordering = section.challenge?.ordering;
    setOrderedBlocks(ordering?.blocks ?? []);
    setOrderingResult(ordering ? null : true);
    setChallengeText("");
    setChallengeLineAnswers({});
    setChallengeLineAnswers({});
    setChallengeTextResult(null);
    setDraggedBlockIndex(null);
    setSolutionVisible(false);
  }, [section.id, section.challenge?.ordering]);

  useEffect(() => {
    if (!accountKey) return;
    let active = true;
    void getCompletedUnits(technologyCode, moduleCode)
      .then((serverSections) => {
        if (!active) return;
        setProgressError(null);
        setCompletedSections(() => {
          const serverCompleted = Array.from(new Set(serverSections));
          window.localStorage.setItem(
            localStorageKey,
            JSON.stringify(serverCompleted),
          );
          const nextIndex = sections.findIndex(
            (item) => !serverCompleted.includes(item.id),
          );
          setCurrentIndex(nextIndex >= 0 ? nextIndex : sections.length - 1);
          return serverCompleted;
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setProgressError(
          error instanceof Error
            ? `No se pudo sincronizar el progreso con el servidor: ${error.message}`
            : "No se pudo sincronizar el progreso con el servidor.",
        );
      });

    return () => {
      active = false;
    };
  }, [accountKey, localStorageKey, moduleCode, sections, technologyCode]);

  const totalMinutes = useMemo(
    () => sections.reduce((total, item) => total + item.estimatedMinutes, 0),
    [sections],
  );

  const markComplete = () => {
    if (!sectionComplete) {
      const updated = [...completedSections, section.id];
      setCompletedSections(updated);
      window.localStorage.setItem(localStorageKey, JSON.stringify(updated));
      if (accountKey) {
        void completeUnit(technologyCode, moduleCode, section.id)
          .then(() => setProgressError(null))
          .catch((error: unknown) => {
            setProgressError(
              error instanceof Error
                ? `La unidad quedó guardada en este navegador, pero no se pudo sincronizar con el servidor: ${error.message}`
                : "La unidad quedó guardada en este navegador, pero no se pudo sincronizar con el servidor.",
            );
          });
      }
      if (
        completionMode === "module"
        && updated.length === sections.length
        && !module.module.assessment
      ) {
        onComplete?.(100);
      }
    }
  };

  const goToSection = (index: number) => {
    setCurrentIndex(index);
    setSelectedAnswer(null);
    setFeedbackVisible(false);
    setKnowledgeAttempt((attempt) => attempt + 1);
    const nextQuestions = getKnowledgeQuestions(sections[index]?.knowledgeCheck);
    setKnowledgeQuestionIndex(
      nextQuestions.length > 0 ? selectRandomIndex(nextQuestions.length) : 0,
    );
    setCheckedChallengeCriteria([]);
    setSolutionVisible(false);
    setOrderingResult(null);
    setChallengeText("");
    setChallengeTextResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const moveOrderingBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedBlocks.length) return;
    setOrderedBlocks((current) => {
      const updated = [...current];
      const [moved] = updated.splice(fromIndex, 1);
      if (moved === undefined) return current;
      updated.splice(toIndex, 0, moved);
      return updated;
    });
    setOrderingResult(null);
    setSolutionVisible(false);
  };

  const validateOrdering = () => {
    const expected = section.challenge?.ordering?.correctOrder;
    if (!expected) return;
    setOrderingResult(
      orderedBlocks.length === expected.length
      && orderedBlocks.every((block, index) => block === expected[index]),
    );
  };

  const validateChallengeText = () => {
    const freeText = section.challenge?.freeText;
    if (!freeText) return;
    if (freeText.lines) {
      const missing: string[] = [];
      const forbidden: string[] = [];
      freeText.lines.forEach((line, index) => {
        const answer = (challengeLineAnswers[index] ?? "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();
        const required = line.requiredPattern.toLowerCase().replace(/\s+/g, " ").trim();
        const forbiddenMatch = line.forbiddenPatterns?.find((pattern) =>
          answer.includes(pattern.toLowerCase()),
        );
        const syntaxValid =
          answer.startsWith("dcl-s ")
          && answer.endsWith(";")
          && answer.split(/\s+/).length >= 3;
        if (!syntaxValid || answer !== required) {
          missing.push(`Línea ${index + 1}: ${line.requiredPattern}`);
        }
        if (forbiddenMatch) forbidden.push(line.originalText);
      });
      setChallengeTextResult({
        valid: missing.length === 0 && forbidden.length === 0,
        missing,
        forbidden,
      });
      return;
    }
    const normalized = challengeText
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    const missing = (freeText.requiredPatterns ?? []).filter(
      (pattern) => !normalized.includes(pattern.toLowerCase()),
    );
    const forbidden =
      freeText.forbiddenPatterns?.filter((pattern) =>
        normalized.includes(pattern.toLowerCase()),
      ) ?? [];
    setChallengeTextResult({
      valid: missing.length === 0 && forbidden.length === 0,
      missing,
      forbidden,
    });
  };

  const validateKnowledge = () => {
    if (
      selectedAnswer === null
      || !activeKnowledgeCheck
      || !knowledgeOptions
      || !challengeComplete
    ) return;
    setFeedbackVisible(true);
    if (selectedAnswer === knowledgeOptions.correctOption) markComplete();
  };

  const retryKnowledgeWithNewQuestion = () => {
    if (knowledgeQuestions.length === 0) return;
    setKnowledgeQuestionIndex((previousIndex) =>
      selectRandomIndex(
        knowledgeQuestions.length,
        Math.random,
        previousIndex,
      ),
    );
    setKnowledgeAttempt((attempt) => attempt + 1);
    setSelectedAnswer(null);
    setFeedbackVisible(false);
  };

  const submitAssessment = () => {
    const assessment = module.module.assessment;
    if (!assessment?.questions.every((_, index) => assessmentAnswers[index] !== undefined)) {
      return;
    }

    const score = calculateAssessmentScore(
      assessment.questions.map((_, index) =>
        assessmentAnswers[index] === assessmentOptionSets[index]?.correctOption,
      ),
    );
    setAssessmentScore(score);
    if (score >= module.module.minimumScore) onComplete?.(score);
  };

  return (
    <main className="m01Page">
      <header className="m01Topbar">
        <button className="m01Brand" type="button" onClick={onBack}>TechOdyssey</button>
        <div className="m01TopProgress">
          <span>{moduleCode} · {progress}% completado</span>
          <div><i style={{ width: `${progress}%` }} /></div>
        </div>
        <button className="m01Exit" type="button" onClick={onBack}>← Volver a la ruta</button>
      </header>

      <section className="m01Hero">
        <div>
          <span className="m01Badge">Módulo {moduleCode.slice(1)}</span>
          <h1>{module.module.title}</h1>
          <p>{module.module.subtitle}</p>
          {module.module.mission && (
            <p className="m01MissionBrief">
              <strong>{module.module.mission.title}: </strong>{module.module.mission.scenario}
            </p>
          )}
        </div>
        <div className="m01Metrics">
          <div><strong>{sections.length}</strong><span>{unitsLabel}</span></div>
          <div><strong>{Math.round(totalMinutes / 60)} h</strong><span>Duración</span></div>
          <div><strong>{module.module.minimumScore}%</strong><span>Aprobación</span></div>
        </div>
      </section>

      <div className="m01Layout">
        <aside className="m01Sidebar">
          <span className="m01SidebarTitle">{unitsLabel} del módulo</span>
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

        {section.id === "M01-S04" ? (
          <article className="m01Content">
            <M01Section04 onComplete={markComplete} />
            <footer className="m01Navigation">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => goToSection(currentIndex - 1)}
              >
                ← Anterior
              </button>
              <button
                type="button"
                disabled={currentIndex === sections.length - 1}
                onClick={() => goToSection(currentIndex + 1)}
              >
                Siguiente →
              </button>
            </footer>
          </article>
        ) : section.id === "M01-S05" ? (
          <article className="m01Content">
            <M01Section05 onComplete={markComplete} />
            <footer className="m01Navigation">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => goToSection(currentIndex - 1)}
              >
                ← Anterior
              </button>
              <button
                type="button"
                disabled={currentIndex === sections.length - 1}
                onClick={() => goToSection(currentIndex + 1)}
              >
                Siguiente →
              </button>
            </footer>
          </article>
        ) : (
        <article className="m01Content">
          <header className="m01SectionHeader">
            <div>
              <span>{section.id} · {section.type.replace("-", " ")}</span>
              <h2>{section.title}</h2>
              {section.introduction && <p>{section.introduction}</p>}
            </div>
            <strong>{section.estimatedMinutes} min</strong>
          </header>

          {progressError && <p className="m01ProgressError" role="alert">{progressError}</p>}

          {section.topics?.map((topic) => (
            <section className="m01Topic" key={topic.title}>
              <h3>{topic.title}</h3>
              {topic.content?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {topic.steps && <ol>{topic.steps.map((item) => <li key={item}>{item}</li>)}</ol>}
              {topic.code && (
                <figure className="m01CodeExample">
                  {topic.codeCaption && <figcaption>{topic.codeCaption}</figcaption>}
                  <pre><code>{topic.code}</code></pre>
                </figure>
              )}
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

          {section.challenge && (
            <section className="m01Challenge">
              <span>Desafío de la misión</span>
              <h3>{section.challenge.title}</h3>
              <p>{section.challenge.instruction}</p>
              {section.challenge.ordering && (
                <div className="m01Ordering">
                  <h4>Desafío de ordenamiento</h4>
                  <p>{section.challenge.ordering.prompt}</p>
                  <ol>
                    {orderedBlocks.map((block, index) => (
                      <li
                        key={block}
                        draggable
                        onDragStart={() => setDraggedBlockIndex(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (draggedBlockIndex !== null) {
                            moveOrderingBlock(draggedBlockIndex, index);
                          }
                          setDraggedBlockIndex(null);
                        }}
                        onDragEnd={() => setDraggedBlockIndex(null)}
                      >
                        <span>{block}</span>
                        <div>
                          <button
                            type="button"
                            onClick={() => moveOrderingBlock(index, index - 1)}
                            disabled={index === 0}
                            aria-label={`Mover ${block} hacia arriba`}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveOrderingBlock(index, index + 1)}
                            disabled={index === orderedBlocks.length - 1}
                            aria-label={`Mover ${block} hacia abajo`}
                          >
                            ↓
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <button
                    className="m01Primary"
                    type="button"
                    onClick={validateOrdering}
                  >
                    Validar orden
                  </button>
                  {orderingResult !== null && (
                    <p className="m01OrderingFeedback" role="status">
                      {orderingResult
                        ? "Orden correcto. Continúa con la práctica."
                        : "El orden todavía no coincide. Revisa los bloques y vuelve a intentarlo."}
                    </p>
                  )}
                </div>
              )}
              {section.challenge.freeText && (
                <div className="m01FreeTextChallenge">
                  <h4>Escribe tu solución</h4>
                  <p>{section.challenge.freeText.prompt}</p>
                  {section.challenge.freeText.lines ? (
                    <div className="m01FreeTextLines">
                      {section.challenge.freeText.lines.map((line, index) => (
                        <div className="m01FreeTextLine" key={line.originalText}>
                          <strong>Línea {index + 1}: {line.prompt}</strong>
                          <span>Original: <code>{line.originalText}</code></span>
                          <label htmlFor={`${section.id}-line-${index}`}>
                            Escribe la declaración corregida
                          </label>
                          <input
                            id={`${section.id}-line-${index}`}
                            type="text"
                            value={challengeLineAnswers[index] ?? ""}
                            placeholder={line.placeholder}
                            spellCheck={false}
                            onChange={(event) => {
                              setChallengeLineAnswers((current) => ({
                                ...current,
                                [index]: event.target.value,
                              }));
                              setChallengeTextResult(null);
                              setSolutionVisible(false);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {section.challenge.freeText.originalText && (
                        <>
                          <strong className="m01FreeTextLabel">Bloque original a corregir</strong>
                          <pre className="m01FreeTextOriginal">
                            <code>{section.challenge.freeText.originalText}</code>
                          </pre>
                        </>
                      )}
                      <label htmlFor={`${section.id}-challenge-text`}>
                        Escribe aquí las líneas corregidas
                      </label>
                      <textarea
                        id={`${section.id}-challenge-text`}
                        value={challengeText}
                        placeholder={section.challenge.freeText.placeholder}
                        spellCheck={false}
                        onChange={(event) => {
                          setChallengeText(event.target.value);
                          setChallengeTextResult(null);
                          setSolutionVisible(false);
                        }}
                      />
                    </>
                  )}
                  <button
                    className="m01Primary"
                    type="button"
                    disabled={
                      section.challenge.freeText.lines
                        ? section.challenge.freeText.lines.some(
                            (_, index) =>
                              (challengeLineAnswers[index] ?? "").trim().length === 0,
                          )
                        : challengeText.trim().length === 0
                    }
                    onClick={validateChallengeText}
                  >
                    Validar líneas escritas
                  </button>
                  {challengeTextResult !== null && (
                    <div
                      className={
                        challengeTextResult.valid
                          ? "m01ChallengeTextFeedback correct"
                          : "m01ChallengeTextFeedback incorrect"
                      }
                      role="status"
                    >
                      {challengeTextResult.valid
                        ? "Las líneas esenciales son correctas. Continúa con el checklist."
                        : (
                          <>
                            <strong>La solución todavía no es válida.</strong>
                            {challengeTextResult.forbidden.length > 0 && (
                              <p>
                                Reemplaza estas líneas débiles:
                              </p>
                            )}
                            {challengeTextResult.forbidden.map((line) => (
                              <code key={line}>{line}</code>
                            ))}
                            {challengeTextResult.missing.length > 0 && (
                              <p>
                                Agrega o corrige estas líneas requeridas:
                              </p>
                            )}
                            {challengeTextResult.missing.map((line) => (
                              <code key={line}>{line}</code>
                            ))}
                          </>
                        )}
                    </div>
                  )}
                </div>
              )}
              <h4>Entregables</h4>
              <ul>{section.challenge.deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
              <h4>Comprueba tu avance</h4>
              <p>Completa el reto y marca cada criterio para habilitar la comprobación. Puedes volver a intentarlo sin penalización.</p>
              <div className="m01ChallengeCriteria">
                {section.challenge.successCriteria.map((criterion) => (
                  <label key={criterion}>
                    <input
                      type="checkbox"
                      checked={checkedChallengeCriteria.includes(criterion)}
                      onChange={(event) => {
                        setSolutionVisible(false);
                        setCheckedChallengeCriteria((current) =>
                          event.target.checked
                            ? [...current, criterion]
                            : current.filter((item) => item !== criterion),
                        );
                      }}
                    />
                    <span>{criterion}</span>
                  </label>
                ))}
              </div>
              {section.challenge.solution && (
                <div className="m01SolutionCompare">
                  <button
                    className="m01Primary"
                    type="button"
                    disabled={!challengeComplete}
                    aria-expanded={solutionVisible}
                    aria-controls={`${section.id}-solution`}
                    onClick={() => setSolutionVisible((visible) => !visible)}
                  >
                    {solutionVisible ? "Ocultar solución" : "Checklist completo: comparar solución"}
                  </button>
                  {solutionVisible && challengeComplete && (
                    <div className="m01SolutionGrid" id={`${section.id}-solution`}>
                      <section>
                        <h4>Tu archivo en VS Code</h4>
                        <p>
                          Abre tu archivo local y compáralo manualmente con la
                          referencia. La aplicación no puede leer archivos de tu
                          equipo.
                        </p>
                      </section>
                      <figure className="m01CodeExample">
                        <figcaption>{section.challenge.solution.caption}</figcaption>
                        <pre><code>{section.challenge.solution.code}</code></pre>
                      </figure>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {section.failureScenarios && (
            <section className="m01Topic">
              <h3>Si algo falla</h3>
              <div className="m01FailureGrid">
                {section.failureScenarios.map((item) => <div key={item.problem}><strong>{item.problem}</strong><p>{item.review}</p></div>)}
              </div>
            </section>
          )}

          {activeKnowledgeCheck && (
            <section className="m01Check">
              <span>Comprobación de conocimiento</span>
              {knowledgeQuestions.length > 1 && (
                <small>
                  Pregunta aleatoria de un banco de {knowledgeQuestions.length}
                </small>
              )}
              <h3>{activeKnowledgeCheck.question}</h3>
              {activeKnowledgeCheck.code && (
                <figure className="m01CodeExample">
                  <figcaption>Fragmento para analizar</figcaption>
                  <pre><code>{activeKnowledgeCheck.code}</code></pre>
                </figure>
              )}
              <div className="m01Answers">
                {knowledgeOptions?.options.map((option, index) => (
                  <button
                    type="button"
                    disabled={feedbackVisible}
                    className={selectedAnswer === index ? "m01Answer m01AnswerSelected" : "m01Answer"}
                    onClick={() => {
                      setSelectedAnswer(index);
                      setFeedbackVisible(false);
                    }}
                    key={option}
                  >
                    <b>{String.fromCharCode(65 + index)}</b>{option}
                  </button>
                ))}
              </div>
              <button
                className="m01Primary"
                type="button"
                disabled={selectedAnswer === null || !challengeComplete}
                onClick={validateKnowledge}
              >
                {section.challenge ? "Validar reto y respuesta" : "Validar respuesta"}
              </button>
              {feedbackVisible && (
                <div className={selectedAnswer === knowledgeOptions?.correctOption ? "m01Feedback correct" : "m01Feedback incorrect"}>
                  <strong>{selectedAnswer === knowledgeOptions?.correctOption ? "Respuesta correcta" : "Respuesta incorrecta"}</strong>
                  <p>{activeKnowledgeCheck.explanation}</p>
                  {selectedAnswer !== knowledgeOptions?.correctOption && activeKnowledgeCheck.hint && (
                    <p><strong>Pista para reintentar: </strong>{activeKnowledgeCheck.hint}</p>
                  )}
                </div>
              )}
              {feedbackVisible && selectedAnswer !== knowledgeOptions?.correctOption && (
                <button
                  className="m01Primary"
                  type="button"
                  onClick={retryKnowledgeWithNewQuestion}
                >
                  {knowledgeQuestions.length > 1
                    ? "Reintentar con otra pregunta"
                    : "Intentar de nuevo"}
                </button>
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

          {moduleComplete && module.module.assessment && (
            <section className="m01Check m01Assessment">
              <span>Evaluación de cierre</span>
              <h3>{module.module.assessment.title}</h3>
              <p>{module.module.assessment.introduction}</p>
              {module.module.assessment.questions.map((question, questionIndex) => (
                <fieldset className="m01AssessmentQuestion" key={question.question}>
                  <legend>{questionIndex + 1}. {question.question}</legend>
                  <div className="m01Answers">
                    {assessmentOptionSets[questionIndex]?.options.map((option, optionIndex) => (
                      <button
                        type="button"
                        className={
                          assessmentAnswers[questionIndex] === optionIndex
                            ? "m01Answer m01AnswerSelected"
                            : "m01Answer"
                        }
                        onClick={() => {
                          setAssessmentAnswers((current) => ({
                            ...current,
                            [questionIndex]: optionIndex,
                          }));
                          setAssessmentScore(null);
                        }}
                        key={option}
                      >
                        <b>{String.fromCharCode(65 + optionIndex)}</b>{option}
                      </button>
                    ))}
                  </div>
                  {assessmentScore !== null && (
                    <div className={
                      assessmentAnswers[questionIndex] === assessmentOptionSets[questionIndex]?.correctOption
                        ? "m01Feedback correct"
                        : "m01Feedback incorrect"
                    }>
                      <p>{question.explanation}</p>
                      {assessmentAnswers[questionIndex] !== assessmentOptionSets[questionIndex]?.correctOption
                        && question.hint
                        && <p><strong>Pista para repasar: </strong>{question.hint}</p>}
                    </div>
                  )}
                </fieldset>
              ))}
              <button
                className="m01Primary"
                type="button"
                disabled={!module.module.assessment?.questions.every(
                  (_, index) => assessmentAnswers[index] !== undefined,
                )}
                onClick={() => {
                  if (assessmentScore !== null) {
                    setAssessmentAnswers({});
                    setAssessmentScore(null);
                    setAssessmentAttempt((attempt) => attempt + 1);
                  } else {
                    submitAssessment();
                  }
                }}
              >
                {assessmentScore === null ? "Evaluar respuestas" : "Intentar evaluación de nuevo"}
              </button>
              {assessmentScore !== null && (
                <div
                  className={assessmentPassed ? "m01Feedback correct" : "m01Feedback incorrect"}
                  role="status"
                >
                  <strong>
                    Resultado: {assessmentScore}%.
                    {assessmentPassed
                      ? " Misión completada."
                      : ` Necesitas al menos ${module.module.minimumScore}%; puedes revisar y reintentar.`}
                  </strong>
                </div>
              )}
            </section>
          )}

          {moduleComplete && assessmentPassed && module.module.completionBadge && (
            <section className="m01Mission" aria-live="polite">
              <span>Insignia obtenida</span>
              <h3>🎖️ {module.module.completionBadge}</h3>
            </section>
          )}

          {!section.knowledgeCheck && (
            <button className="m01Primary" type="button" onClick={markComplete} disabled={sectionComplete}>
              {sectionComplete ? `${unitLabel} completada` : "Marcar como completada"}
            </button>
          )}

          <footer className="m01Navigation">
            <button type="button" disabled={currentIndex === 0} onClick={() => goToSection(currentIndex - 1)}>← Anterior</button>
            {currentIndex === sections.length - 1 ? (
              <button type="button" disabled={!moduleComplete || (module.module.assessment !== undefined && !assessmentPassed)} onClick={onBack}>
                Finalizar módulo →
              </button>
            ) : (
              <button type="button" onClick={() => goToSection(currentIndex + 1)}>
                Siguiente →
              </button>
            )}
          </footer>
        </article>
        )}
      </div>
    </main>
  );
}

function InfoList({ title, items, warning = false }: { title: string; items: string[]; warning?: boolean }) {
  return <section className={warning ? "m01InfoList warning" : "m01InfoList"}><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

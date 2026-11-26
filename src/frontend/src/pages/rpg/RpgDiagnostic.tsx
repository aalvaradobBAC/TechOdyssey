import { useEffect, useMemo, useRef, useState } from "react";
import { diagnosticCopy, diagnosticQuestions } from "./diagnostic-content";
import type { DiagnosticQuestion } from "./diagnostic-content-parser";
import { shuffleOptions } from "./progress-utils";
import "./rpg-path.css";

type Props = {
  isAuthenticated: boolean;
  rewardMessage: string | null;
  rewardError: boolean;
  awardingPoints: boolean;
  onRequestLogin: () => void;
  onRetryReward: () => void;
  onBack: () => void;
  onComplete?: (score: number) => void;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function buildAttempt(): DiagnosticQuestion[] {
  const questions = diagnosticQuestions;
  const categories = [...new Set(questions.map((question) => question.category))];
  const selected: DiagnosticQuestion[] = [];

  for (const category of categories) {
    const categoryQuestions = questions.filter(
      (question) => question.category === category,
    );
    if (categoryQuestions.length > 0) {
      selected.push(shuffle(categoryQuestions)[0]);
    }
  }

  const remaining = shuffle(
    questions.filter(
      (question) => !selected.some((item) => item.id === question.id),
    ),
  );

  const attempt = shuffle([
    ...selected,
    ...remaining.slice(
      0,
      Math.max(0, diagnosticCopy["questions-per-attempt"] - selected.length),
    ),
  ]).slice(0, diagnosticCopy["questions-per-attempt"]);

  return attempt.map((question) => {
    const shuffled = shuffleOptions(
      question.options,
      question.correctOption,
    );
    return {
      ...question,
      options: shuffled.options,
      correctOption: shuffled.correctOption,
    };
  });
}

export default function RpgDiagnostic({
  isAuthenticated,
  rewardMessage,
  rewardError,
  awardingPoints,
  onRequestLogin,
  onRetryReward,
  onBack,
  onComplete,
}: Props) {
  const questions = useMemo(() => buildAttempt(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);
  const completionReported = useRef(false);

  const current = questions[currentIndex];
  const selectedOption = answers[current.id];
  const answered = selectedOption !== undefined;

  const score = useMemo(
    () =>
      questions.reduce(
        (total, question) =>
          total + (answers[question.id] === question.correctOption ? 1 : 0),
        0,
      ),
    [answers, questions],
  );

  const percentage = Math.round((score / questions.length) * 100);

  useEffect(() => {
    if (completed && !completionReported.current) {
      completionReported.current = true;
      onComplete?.(percentage);
    }
  }, [completed, onComplete, percentage]);

  if (completed) {
    const recommendation =
      percentage >= 80
        ? diagnosticCopy["recommendation-high"]
        : percentage >= 50
          ? diagnosticCopy["recommendation-medium"]
          : diagnosticCopy["recommendation-low"];

    return (
      <main className="diagnosticPage">
        <section className="diagnosticResult">
          <span className="routeBadge">Diagnóstico completado</span>
          <h1>Resultado: {percentage}%</h1>
          <p>{recommendation}</p>
          <div className="resultMetrics">
            <div><strong>{score}</strong><span>Respuestas correctas</span></div>
            <div><strong>{questions.length - score}</strong><span>Por reforzar</span></div>
            <div><strong>{questions.length}</strong><span>Total</span></div>
          </div>
          {awardingPoints && (
            <p className="rewardNotice" role="status">Guardando tu progreso…</p>
          )}
          {rewardMessage && (
            <p
              className={rewardError ? "rewardNotice rewardNoticeError" : "rewardNotice"}
              role={rewardError ? "alert" : "status"}
            >
              {rewardMessage}
            </p>
          )}
          {!isAuthenticated && (
            <button
              className="moduleButton rewardActionButton"
              type="button"
              onClick={onRequestLogin}
            >
              Iniciar sesión para guardar mis XP
            </button>
          )}
          {rewardError && isAuthenticated && (
            <button
              className="secondaryButton rewardActionButton"
              type="button"
              onClick={onRetryReward}
              disabled={awardingPoints}
            >
              Reintentar guardar XP
            </button>
          )}
          <button className="moduleButton" type="button" onClick={onBack}>
            Volver a la ruta RPG
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="diagnosticPage">
      <nav className="pathNavigation pathNavigationLight">
        <strong className="brandLink brandLinkDark">TechOdyssey</strong>
        <button className="backLink backLinkDark" type="button" onClick={onBack}>
          ← Salir del diagnóstico
        </button>
      </nav>

      <section className="diagnosticQuestionShell">
        <header className="questionHeader">
          <div>
            <span className="diagnosticStep">M00 · Diagnóstico adaptativo</span>
            <h1>Pregunta {currentIndex + 1} de {questions.length}</h1>
          </div>
          <strong>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</strong>
        </header>

        <div className="questionProgress">
          <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <article className="questionCard">
          <div className="questionMetadata">
            <span>{current.category.toUpperCase()}</span>
            <span>Nivel {current.level}</span>
          </div>

          <div className="scenarioBox">
            <strong>Escenario</strong>
            <p>{current.scenario}</p>
          </div>

          <h2>{current.question}</h2>

          <div className="answerList">
            {current.options.map((option, optionIndex) => (
              <button
                className={
                  selectedOption === optionIndex
                    ? "answerOption answerOptionSelected"
                    : "answerOption"
                }
                key={option}
                type="button"
                onClick={() =>
                  setAnswers((previous) => ({
                    ...previous,
                    [current.id]: optionIndex,
                  }))
                }
              >
                <span>{String.fromCharCode(65 + optionIndex)}</span>
                {option}
              </button>
            ))}
          </div>

          <footer className="questionActions">
            <button
              className="secondaryButton"
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((value) => value - 1)}
            >
              Anterior
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                className="moduleButton"
                type="button"
                disabled={!answered}
                onClick={() => setCurrentIndex((value) => value + 1)}
              >
                Siguiente
              </button>
            ) : (
              <button
                className="moduleButton"
                type="button"
                disabled={!answered}
                onClick={() => setCompleted(true)}
              >
                Finalizar diagnóstico
              </button>
            )}
          </footer>
        </article>
      </section>
    </main>
  );
}

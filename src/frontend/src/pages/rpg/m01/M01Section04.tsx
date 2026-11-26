import { useState } from "react";
import section from "./m01-section-04.json";
import "./m01-section-04.css";

export default function M01Section04({ onComplete }: { onComplete: () => void }) {
  const [path, setPath] = useState<"quick" | "guided" | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const complete = checked.length === section.completionChecklist.length;

  return (
    <div className="s04Root">
      <header className="s04Header">
        <span>M01-S04 · Laboratorio guiado</span>
        <h2>{section.title}</h2>
        <p>{section.introduction}</p>
      </header>

      {!path && (
        <section className="s04PathChoice">
          <h3>Selecciona el recorrido</h3>
          <div className="s04PathGrid">
            {section.experiencePaths.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPath(item.id as "quick" | "guided")}
              >
                <strong>{item.title}</strong>
                <span>{item.audience}</span>
                <small>
                  {item.estimatedMinutes} min · {item.description}
                </small>
              </button>
            ))}
          </div>
        </section>
      )}

      {path && (
        <>
          <button
            className="s04ChangePath"
            type="button"
            onClick={() => setPath(null)}
          >
            ← Cambiar recorrido
          </button>

          {path === "guided" && (
            <section className="s04Section">
              <h3>Conoce la interfaz</h3>
              <div className="s04InterfaceGrid">
                {section.interfaceGuide.map((item) => (
                  <article key={item.name}>
                    <b>{item.name}</b>
                    <span>{item.location}</span>
                    <p>{item.purpose}</p>
                    <small>Acción: {item.action}</small>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="s04Section">
            <h3>Requisitos</h3>
            <ul className="s04Requirements">
              {section.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="s04Section">
            <h3>{path === "quick" ? "Ruta rápida" : "Práctica paso a paso"}</h3>
            <div className="s04StepList">
              {section.steps.map((item, index) => (
                <details key={item.title} open={path === "guided" && index === 0}>
                  <summary>
                    <i>{index + 1}</i>
                    <strong>{item.title}</strong>
                    <span>Ver detalle</span>
                  </summary>
                  <div className="s04StepBody">
                    <p>{item.description}</p>
                    <aside className="s04Expected">
                      <b>Resultado esperado</b>
                      <span>{item.expectedResult}</span>
                    </aside>
                    <aside className="s04Trouble">
                      <b>Si no funciona</b>
                      <span>{item.troubleshooting}</span>
                    </aside>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="s04Security">
            <h3>Controles de seguridad</h3>
            <ul>
              {section.securityNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {path === "guided" && (
            <section className="s04Section">
              <h3>Glosario</h3>
              <div className="s04Glossary">
                {section.glossary.map((item) => (
                  <div key={item.term}>
                    <b>{item.term}</b>
                    <span>{item.definition}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="s04Checklist">
            <h3>Comprobación final</h3>
            <p>Marca cada evidencia únicamente después de verificarla en Visual Studio Code.</p>
            {section.completionChecklist.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={checked.includes(item)}
                  onChange={(event) =>
                    setChecked((current) =>
                      event.target.checked
                        ? [...current, item]
                        : current.filter((value) => value !== item),
                    )
                  }
                />
                <span>{item}</span>
              </label>
            ))}
            <button type="button" disabled={!complete} onClick={onComplete}>
              Completar sección
            </button>
          </section>
        </>
      )}
    </div>
  );
}

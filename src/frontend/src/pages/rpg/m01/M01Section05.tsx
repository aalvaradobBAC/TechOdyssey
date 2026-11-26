import { useState } from "react";
import content from "./m01-section-05.json";
import "./m01-section-05.css";

export default function M01Section05({ onComplete }: { onComplete: () => void }) {
  const [openStep, setOpenStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const correct = answer === content.challenge.correctOption;
  const canComplete = correct && checked.length === content.checklist.length;

  return <div className="s05Root">
    <header className="s05Header"><span>M01-S05 · Laboratorio con código</span><h2>{content.title}</h2><p>{content.objective}</p></header>
    <section className="s05Scenario"><div><span>Escenario de trabajo</span><h3>{content.scenario.title}</h3><p>{content.scenario.description}</p></div><code>{content.scenario.environment}</code></section>
    <section className="s05Concepts"><h3>Conceptos antes de comenzar</h3><div>{content.concepts.map(x=><article key={x.term}><strong>{x.term}</strong><p>{x.definition}</p></article>)}</div></section>
    <section className="s05Practice"><h3>Práctica guiada</h3><div className="s05Timeline">{content.steps.map((step,index)=><article className={openStep===index?"active":""} key={step.title}><button type="button" onClick={()=>setOpenStep(index)}><i>{index+1}</i><span><strong>{step.title}</strong><small>{openStep===index?"Ocultar detalle":"Ver instrucciones"}</small></span></button>{openStep===index&&<div className="s05Detail"><p>{step.instruction}</p><div className="s05Code"><div>Ejemplo</div><pre><code>{step.example}</code></pre></div><aside className="s05Expected"><b>Resultado esperado</b><span>{step.expected}</span></aside><aside className="s05Warning"><b>Validación o riesgo</b><span>{step.warning}</span></aside></div>}</article>)}</div></section>
    <section className="s05Challenge"><span>Desafío de comprensión</span><h3>{content.challenge.title}</h3><p>{content.challenge.instruction}</p><div className="s05Code"><div>RPGLE</div><pre><code>{content.challenge.code}</code></pre></div><div className="s05Options">{content.challenge.options.map((option,index)=><button type="button" className={answer===index?"selected":""} onClick={()=>setAnswer(index)} key={option}><b>{String.fromCharCode(65+index)}</b><span>{option}</span></button>)}</div>{answer!==null&&<div className={correct?"s05Feedback correct":"s05Feedback incorrect"}><strong>{correct?"Respuesta correcta":"Revisa la selección"}</strong><p>{content.challenge.explanation}</p></div>}</section>
    <section className="s05Checklist"><h3>Evidencia de finalización</h3><p>Marca cada punto después de realizarlo en el entorno de entrenamiento.</p>{content.checklist.map(item=><label key={item}><input type="checkbox" checked={checked.includes(item)} onChange={e=>setChecked(v=>e.target.checked?[...v,item]:v.filter(x=>x!==item))}/><span>{item}</span></label>)}<button type="button" disabled={!canComplete} onClick={onComplete}>Completar sección</button></section>
  </div>;
}

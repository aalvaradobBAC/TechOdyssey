import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  parseDiagnosticCopy,
  parseDiagnosticQuestions,
} from "./diagnostic-content-parser.ts";

const contentPath = new URL(
  "../../../../../technologies/rpg/curriculum/modules/M00-diagnostico/content.md",
  import.meta.url,
);
const questionsPath = new URL(
  "../../../../../technologies/rpg/curriculum/modules/M00-diagnostico/questions.csv",
  import.meta.url,
);

test("M00 source files parse and preserve their configured diagnostic shape", () => {
  const copy = parseDiagnosticCopy(readFileSync(contentPath, "utf8"));
  const questions = parseDiagnosticQuestions(readFileSync(questionsPath, "utf8"));

  assert.equal(copy["questions-per-attempt"], 10);
  assert.equal(questions.length, 12);
  assert.equal(new Set(questions.map((question) => question.category)).size, 5);
  assert.ok(questions.every((question) => question.options.length === 4));
});

test("CSV parser supports quoted commas, escaped quotes, and embedded newlines", () => {
  const csv = [
    "id,category,level,scenario,question,option_a,option_b,option_c,option_d,correct_option,explanation",
    'TEST-001,test,1,"Un escenario, con coma","¿Qué opción funciona?","Texto ""citado""","Línea uno',
    'línea dos","Otra opción","Última opción",A,"Explicación, con coma"',
  ].join("\r\n");
  const [question] = parseDiagnosticQuestions(csv);

  assert.equal(question.scenario, "Un escenario, con coma");
  assert.equal(question.options[0], 'Texto "citado"');
  assert.equal(question.options[1], "Línea uno\r\nlínea dos");
  assert.equal(question.correctOption, 0);
});

test("invalid CSV and Markdown are rejected with actionable errors", () => {
  assert.throws(
    () => parseDiagnosticQuestions("id,question\nTEST-001,¿Qué?"),
    /must use these columns in order/,
  );
  assert.throws(
    () => parseDiagnosticQuestions([
      "id,category,level,scenario,question,option_a,option_b,option_c,option_d,correct_option,explanation",
      "DUP-001,test,1,Escenario,¿Qué?,A,B,C,D,A,Explicación",
      "DUP-001,test,1,Escenario,¿Qué?,A,B,C,D,A,Explicación",
    ].join("\n")),
    /duplicate question id/,
  );
  assert.throws(
    () => parseDiagnosticCopy("# M00\n## intro-title\nSin el resto de secciones"),
    /Invalid diagnostic Markdown/,
  );
  assert.throws(
    () => parseDiagnosticCopy("# M00\n## intro-title\nA\n## intro-title\nB"),
    /duplicate section/,
  );
});

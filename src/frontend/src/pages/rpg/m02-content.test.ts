import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const content: unknown = JSON.parse(
  readFileSync(
    new URL(
      "../../../../../technologies/rpg/curriculum/modules/M02-anatomia-rpg/m02-content.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

test("M02 defines four progressive units with a practice, challenge, and retryable check", () => {
  assert.ok(isRecord(content));
  assert.ok(isRecord(content.module));
  assert.equal(content.module.id, "M02");
  assert.equal(content.module.title, "Anatomía de un programa Free RPG");
  assert.equal(content.module.completionBadge, "Arquitecto de Sintaxis Libre");
  assert.ok(Array.isArray(content.sections));
  assert.deepEqual(
    content.sections.map((section) => isRecord(section) ? section.id : null),
    ["M02-U01", "M02-U02", "M02-U03", "M02-U04"],
  );

  for (const section of content.sections) {
    assert.ok(isRecord(section));
    assert.ok(Array.isArray(section.steps) && section.steps.length >= 3);
    assert.ok(isRecord(section.challenge));
    assert.ok(Array.isArray(section.challenge.deliverables));
    assert.ok(Array.isArray(section.challenge.successCriteria));
    assert.ok(isRecord(section.challenge.solution));
    assert.equal(typeof section.challenge.solution.caption, "string");
    assert.equal(typeof section.challenge.solution.code, "string");
    assert.ok(isRecord(section.knowledgeCheck));
    assert.ok(Array.isArray(section.knowledgeCheck.options));
    assert.equal(typeof section.knowledgeCheck.hint, "string");
    const correctOption = section.knowledgeCheck.correctOption;
    assert.ok(
      typeof correctOption === "number"
      && Number.isInteger(correctOption)
      && correctOption >= 0
      && correctOption < section.knowledgeCheck.options.length,
    );
  }
});

test("M02-U01 teaches the free-form header, comments, semicolons, and VS Code practice", () => {
  assert.ok(isRecord(content));
  assert.ok(Array.isArray(content.sections));
  const section = content.sections.find(
    (item) => isRecord(item) && item.id === "M02-U01",
  );
  assert.ok(isRecord(section));
  assert.ok(Array.isArray(section.topics));
  assert.ok(Array.isArray(section.steps) && section.steps.length >= 3);
  assert.ok(isRecord(section.challenge));
  assert.ok(isRecord(section.knowledgeCheck));

  const example = section.topics.find(
    (topic) => isRecord(topic) && typeof topic.code === "string",
  );
  assert.ok(isRecord(example));
  assert.match(example.code, /^\*\*FREE\n\/\*/);
  assert.match(example.code, /Autor:[\s\S]*Fecha:[\s\S]*Propósito:/);
  assert.doesNotMatch(example.code, /CTL-OPT|DSPLY|RETURN/i);
  const u01Text = section.topics
    .filter(isRecord)
    .flatMap((topic) =>
      Array.isArray(topic.content)
        ? topic.content.filter((item): item is string => typeof item === "string")
        : [],
    )
    .join("\n");
  assert.match(u01Text, /formato totalmente libre/i);
  assert.match(u01Text, /columna 1/i);
  assert.match(u01Text, /punto y coma/i);
  assert.equal(section.challenge.title, "Desafío 1B: Tu Primer Lienzo");
  assert.equal(section.challenge.successCriteria.length, 3);
  assert.equal(section.knowledgeCheck.options.length, 3);
  assert.match(section.knowledgeCheck.question, /Desafío 1A/);
});

test("M02-U02 provides an accessible ordering task for the five source blocks", () => {
  assert.ok(isRecord(content));
  assert.ok(Array.isArray(content.sections));
  const section = content.sections.find(
    (item) => isRecord(item) && item.id === "M02-U02",
  );
  assert.ok(isRecord(section));
  assert.ok(isRecord(section.challenge));
  assert.ok(isRecord(section.challenge.ordering));
  assert.equal(section.challenge.ordering.blocks.length, 5);
  assert.equal(section.challenge.ordering.correctOrder.length, 5);
  assert.deepEqual(
    [...section.challenge.ordering.correctOrder].sort(),
    [...section.challenge.ordering.blocks].sort(),
  );
});

test("M02-U03 covers the specified DSPLY syntax errors", () => {
  assert.ok(isRecord(content));
  assert.ok(Array.isArray(content.sections));
  const section = content.sections.find(
    (item) => isRecord(item) && item.id === "M02-U03",
  );
  assert.ok(isRecord(section));
  assert.ok(isRecord(section.knowledgeCheck));
  assert.match(section.knowledgeCheck.code, /DSPLY "Bienvenido a RPG"/);
  assert.match(section.knowledgeCheck.code, /DSPLY "Bienvenido a RPG"\n\*INLR/);
});

test("M02-U04 includes a repairable source and a complete reference solution", () => {
  assert.ok(isRecord(content));
  assert.ok(Array.isArray(content.sections));
  const section = content.sections.find(
    (item) => isRecord(item) && item.id === "M02-U04",
  );
  assert.ok(isRecord(section));
  assert.ok(Array.isArray(section.topics));
  assert.ok(isRecord(section.challenge));
  assert.ok(isRecord(section.challenge.solution));
  const brokenSource = section.topics.find(
    (topic) =>
      isRecord(topic)
      && typeof topic.code === "string"
      && topic.code.startsWith("// Programa de prueba"),
  );
  assert.ok(isRecord(brokenSource));
  assert.match(brokenSource.code, /^\/\/ Programa de prueba\n\*\*FREE/);
  assert.match(section.challenge.solution.code, /^\*\*FREE\nCTL-OPT/);
  assert.match(section.challenge.solution.code, /\*INLR = \*ON;\nRETURN;$/);
});

test("M02 final assessment contains five questions and applies the configured 80 percent threshold", () => {
  assert.ok(isRecord(content));
  assert.ok(isRecord(content.module));
  assert.equal(content.module.minimumScore, 80);
  assert.ok(isRecord(content.module.assessment));
  assert.ok(Array.isArray(content.module.assessment.questions));
  assert.equal(content.module.assessment.questions.length, 5);

  for (const question of content.module.assessment.questions) {
    assert.ok(isRecord(question));
    assert.ok(Array.isArray(question.options));
    const correctOption = question.correctOption;
    assert.ok(
      typeof correctOption === "number"
      && Number.isInteger(correctOption)
      && correctOption >= 0
      && correctOption < question.options.length,
    );
  }
});

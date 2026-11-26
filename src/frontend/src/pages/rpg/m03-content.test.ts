import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const content: unknown = JSON.parse(
  readFileSync(
    new URL(
      "../../../../../technologies/rpg/curriculum/modules/M03-variables-tipos/m03-u01-content.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const secondUnit: unknown = JSON.parse(
  readFileSync(
    new URL(
      "../../../../../technologies/rpg/curriculum/modules/M03-variables-tipos/m03-u02-content.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const thirdUnit: unknown = JSON.parse(
  readFileSync(
    new URL(
      "../../../../../technologies/rpg/curriculum/modules/M03-variables-tipos/m03-u03-content.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

test("M03-U01 defines a single progressive variable contract unit", () => {
  assert.ok(isRecord(content));
  assert.ok(isRecord(content.module));
  assert.equal(content.module.id, "M03");
  assert.equal(content.module.title, "Variables, constantes y tipos");
  assert.equal(content.module.completionBadge, "Guardián de Tipos");
  assert.ok(!("assessment" in content.module));
  assert.ok(Array.isArray(content.sections));
  assert.equal(content.sections.length, 1);

  const [section] = content.sections;
  assert.ok(isRecord(section));
  assert.equal(section.id, "M03-U01");
  assert.ok(Array.isArray(section.topics));
  assert.ok(Array.isArray(section.steps));
  assert.ok(isRecord(section.challenge));
  assert.ok(isRecord(section.knowledgeCheck));
  assert.ok(Array.isArray(section.knowledgeCheck.questions));
  assert.ok(section.knowledgeCheck.questions.length >= 3);
  assert.equal(
    new Set(
      section.knowledgeCheck.questions.map((question) =>
        isRecord(question) ? question.question : undefined,
      ),
    ).size,
    section.knowledgeCheck.questions.length,
  );
  assert.ok(isRecord(section.mission));
});

test("M03-U01 teaches DCL-S anatomy, INZ, naming, and text length", () => {
  assert.ok(isRecord(content));
  assert.ok(Array.isArray(content.sections));
  const [section] = content.sections;
  assert.ok(isRecord(section));
  assert.ok(Array.isArray(section.topics));

  assert.ok(
    section.topics.some(
      (topic) =>
        isRecord(topic)
        && Array.isArray(topic.items)
        && topic.items.some(
          (item) =>
            isRecord(item)
            && item.code === "INZ('')",
        ),
    ),
  );

  const declarationExample = section.topics.find(
    (topic) =>
      isRecord(topic)
      && topic.code === "dcl-s nombreCliente varchar(60) inz('');",
  );
  assert.ok(isRecord(declarationExample));

  const contractTopic = section.topics.find(
    (topic) =>
      isRecord(topic)
      && topic.title === "Las cinco respuestas del contrato",
  );
  assert.ok(isRecord(contractTopic));
  assert.ok(Array.isArray(contractTopic.items));
  assert.equal(contractTopic.items.length, 5);
  assert.ok(
    contractTopic.items.every(
      (item) =>
        isRecord(item)
        && typeof item.code === "string"
        && typeof item.purpose === "string",
    ),
  );

  assert.ok(
    section.topics.some(
      (topic) =>
        isRecord(topic)
        && Array.isArray(topic.content)
        && topic.content.some(
          (paragraph) =>
            typeof paragraph === "string"
            && paragraph.includes("DCL-S"),
        ),
    ),
  );
});

test("M03-U01 challenge and knowledge check are retryable and fully specified", () => {
  assert.ok(isRecord(content));
  assert.ok(Array.isArray(content.sections));
  const [section] = content.sections;
  assert.ok(isRecord(section));

  assert.ok(isRecord(section.challenge));
  assert.ok(Array.isArray(section.challenge.deliverables));
  assert.ok(Array.isArray(section.challenge.successCriteria));
  assert.ok(isRecord(section.challenge.ordering));
  assert.ok(isRecord(section.challenge.solution));
  assert.ok(isRecord(section.challenge.freeText));
  assert.ok(Array.isArray(section.challenge.freeText.lines));
  assert.equal(section.challenge.freeText.lines.length, 3);
  assert.ok(
    section.challenge.freeText.lines.every(
      (line) =>
        isRecord(line)
        && typeof line.prompt === "string"
        && typeof line.originalText === "string"
        && typeof line.requiredPattern === "string"
        && line.requiredPattern.toLowerCase().startsWith("dcl-s ")
        && line.requiredPattern.endsWith(";"),
    ),
  );
  assert.equal(
    section.challenge.ordering.correctOrder.length,
    section.challenge.ordering.blocks.length,
  );
  assert.notDeepEqual(
    section.challenge.ordering.blocks,
    section.challenge.ordering.correctOrder,
  );

  assert.ok(isRecord(section.knowledgeCheck));
  assert.ok(Array.isArray(section.knowledgeCheck.questions));
  assert.ok(section.knowledgeCheck.questions.length >= 3);
  assert.equal(
    new Set(
      section.knowledgeCheck.questions.map((question) =>
        isRecord(question) ? question.question : undefined,
      ),
    ).size,
    section.knowledgeCheck.questions.length,
  );
  for (const question of section.knowledgeCheck.questions) {
    assert.ok(isRecord(question));
    assert.ok(Array.isArray(question.options) && question.options.length >= 3);
    assert.equal(typeof question.explanation, "string");
    const correctOption = question.correctOption;
    assert.ok(
      typeof correctOption === "number"
      && Number.isInteger(correctOption)
      && correctOption >= 0
      && correctOption < question.options.length,
    );
  }
});

test("M03-U02 differentiates CHAR, VARCHAR, and textual identifiers", () => {
  assert.ok(isRecord(secondUnit));
  assert.ok(isRecord(secondUnit.module));
  assert.equal(secondUnit.module.id, "M03");
  assert.ok(Array.isArray(secondUnit.sections));
  assert.equal(secondUnit.sections.length, 1);
  const [section] = secondUnit.sections;
  assert.ok(isRecord(section));
  assert.equal(section.id, "M03-U02");
  assert.ok(Array.isArray(section.topics));
  const topics = section.topics.filter(isRecord);
  assert.ok(topics.some((topic) => topic.code === "dcl-s codigoPais char(2);"));
  assert.ok(topics.some((topic) => topic.code === "dcl-s nombreCliente varchar(60);"));
  assert.ok(topics.some((topic) => topic.code === "dcl-s numeroCuenta char(12);"));
});

test("M03-U02 requires three independently validated DCL-S declarations", () => {
  assert.ok(isRecord(secondUnit));
  assert.ok(Array.isArray(secondUnit.sections));
  const [section] = secondUnit.sections;
  assert.ok(isRecord(section));
  assert.ok(isRecord(section.challenge));
  assert.ok(isRecord(section.challenge.freeText));
  assert.ok(Array.isArray(section.challenge.freeText.lines));
  assert.equal(section.challenge.freeText.lines.length, 3);
  assert.ok(
    section.challenge.freeText.lines.every(
      (line) =>
        isRecord(line)
        && typeof line.prompt === "string"
        && typeof line.requiredPattern === "string"
        && line.requiredPattern.toLowerCase().startsWith("dcl-s ")
        && line.requiredPattern.endsWith(";"),
    ),
  );
  assert.ok(isRecord(section.knowledgeCheck));
  assert.ok(Array.isArray(section.knowledgeCheck.questions));
  assert.ok(section.knowledgeCheck.questions.length >= 3);
  for (const question of section.knowledgeCheck.questions) {
    assert.ok(isRecord(question));
    assert.ok(Array.isArray(question.options));
    assert.equal(typeof question.explanation, "string");
    assert.equal(typeof question.hint, "string");
    assert.ok(
      typeof question.correctOption === "number"
      && question.correctOption >= 0
      && question.correctOption < question.options.length,
    );
  }
});

test("M03-U03 models integer signs, ranges, and decimal precision", () => {
  assert.ok(isRecord(thirdUnit));
  assert.ok(isRecord(thirdUnit.module));
  assert.equal(thirdUnit.module.id, "M03");
  assert.ok(Array.isArray(thirdUnit.sections));
  assert.equal(thirdUnit.sections.length, 1);
  const [section] = thirdUnit.sections;
  assert.ok(isRecord(section));
  assert.equal(section.id, "M03-U03");
  assert.ok(Array.isArray(section.topics));
  const topicCodes = section.topics
    .filter(isRecord)
    .map((topic) => topic.code)
    .filter((code): code is string => typeof code === "string");
  assert.ok(topicCodes.includes("dcl-s variacionIntentos int(10) inz(0);"));
  assert.ok(
    topicCodes.includes("dcl-s saldoDisponible packed(13:2) inz(0);"),
  );
  assert.ok(
    topicCodes.includes(
      "dcl-s importeContable packed(13:2);\ndcl-s importeInterfaz zoned(13:2);\ndcl-s factorDecimal bindec(9:2);",
    ),
  );

  const integerTopic = section.topics.find(
    (topic) => isRecord(topic) && topic.title === "Enteros con signo y sin signo",
  );
  assert.ok(isRecord(integerTopic));
  assert.ok(
    Array.isArray(integerTopic.content)
    && integerTopic.content.some(
      (paragraph) =>
        typeof paragraph === "string"
        && paragraph.includes("INT(5) admite de -32768 a 32767")
        && paragraph.includes("UNS(5) de 0 a 65535"),
    ),
  );

  assert.ok(isRecord(section.challenge));
  assert.ok(isRecord(section.challenge.freeText));
  assert.ok(Array.isArray(section.challenge.freeText.lines));
  assert.equal(section.challenge.freeText.lines.length, 3);
  assert.ok(
    section.challenge.freeText.lines.every(
      (line) =>
        isRecord(line)
        && typeof line.requiredPattern === "string"
        && line.requiredPattern.toLowerCase().startsWith("dcl-s ")
        && line.requiredPattern.endsWith(";"),
    ),
  );
  assert.ok(isRecord(section.knowledgeCheck));
  assert.ok(Array.isArray(section.knowledgeCheck.questions));
  assert.ok(section.knowledgeCheck.questions.length >= 3);
  for (const question of section.knowledgeCheck.questions) {
    assert.ok(isRecord(question));
    assert.ok(Array.isArray(question.options) && question.options.length >= 3);
    assert.equal(typeof question.explanation, "string");
    assert.ok(
      typeof question.correctOption === "number"
      && Number.isInteger(question.correctOption)
      && question.correctOption >= 0
      && question.correctOption < question.options.length,
    );
  }
});

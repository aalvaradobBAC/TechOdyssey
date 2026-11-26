import { z } from "zod";

const csvColumns = [
  "id",
  "category",
  "level",
  "scenario",
  "question",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_option",
  "explanation",
] as const;

const optionIndexes = { A: 0, B: 1, C: 2, D: 3 } as const;

const questionSchema = z.object({
  id: z.string().trim().min(1),
  category: z.string().trim().min(1),
  level: z.coerce.number().int().positive(),
  scenario: z.string().trim().min(1),
  question: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).length(4),
  correctOption: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().trim().min(1),
}).transform(({ correctOption, ...question }) => ({
  ...question,
  correctOption: optionIndexes[correctOption],
}));

const diagnosticCopySchema = z.object({
  "module-title": z.string().trim().min(1),
  "module-description": z.string().trim().min(1),
  "intro-title": z.string().trim().min(1),
  "intro-description": z.string().trim().min(1),
  "evaluation-topics": z.array(z.string().trim().min(1)).min(1),
  "questions-per-attempt": z.coerce.number().int().positive(),
  "estimated-time": z.string().trim().min(1),
  "sampling-description": z.string().trim().min(1),
  "recommendation-high": z.string().trim().min(1),
  "recommendation-medium": z.string().trim().min(1),
  "recommendation-low": z.string().trim().min(1),
}).strict();

export type DiagnosticQuestion =
  Omit<z.infer<typeof questionSchema>, "correctOption">
  & { correctOption: number };
export type DiagnosticCopy = z.infer<typeof diagnosticCopySchema>;

function parseCsvRows(csv: string): string[][] {
  const input = csv.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let insideQuotes = false;
  let afterClosingQuote = false;

  const finishRow = () => {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
    row = [];
    field = "";
    afterClosingQuote = false;
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (insideQuotes) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        insideQuotes = false;
        afterClosingQuote = true;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0 || afterClosingQuote) {
        throw new Error(`CSV contains an unexpected quote at character ${index + 1}.`);
      }
      insideQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
      afterClosingQuote = false;
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      finishRow();
    } else if (afterClosingQuote) {
      if (character !== " " && character !== "\t") {
        throw new Error(`CSV contains unexpected content after a quoted field at character ${index + 1}.`);
      }
    } else {
      field += character;
    }
  }

  if (insideQuotes) throw new Error("CSV contains an unterminated quoted field.");
  if (row.length > 0 || field.length > 0) finishRow();
  return rows;
}

function describeIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "content"}: ${issue.message}`)
    .join("; ");
}

export function parseDiagnosticQuestions(csv: string): DiagnosticQuestion[] {
  const [header, ...records] = parseCsvRows(csv);

  if (!header || header.join(",") !== csvColumns.join(",")) {
    throw new Error(`Diagnostic CSV must use these columns in order: ${csvColumns.join(",")}.`);
  }
  if (records.length === 0) throw new Error("Diagnostic CSV must contain at least one question.");

  const ids = new Set<string>();
  return records.map((record, index) => {
    const rowNumber = index + 2;
    if (record.length !== csvColumns.length) {
      throw new Error(`Diagnostic CSV row ${rowNumber} must contain ${csvColumns.length} columns.`);
    }

    const [id, category, level, scenario, question, ...answerFields] = record;
    const [optionA, optionB, optionC, optionD, correctOption, explanation] = answerFields;
    const parsed = questionSchema.safeParse({
      id,
      category,
      level,
      scenario,
      question,
      options: [optionA, optionB, optionC, optionD],
      correctOption,
      explanation,
    });

    if (!parsed.success) {
      throw new Error(`Invalid diagnostic CSV row ${rowNumber}: ${describeIssues(parsed.error)}.`);
    }
    if (ids.has(parsed.data.id)) {
      throw new Error(`Diagnostic CSV contains duplicate question id "${parsed.data.id}".`);
    }
    ids.add(parsed.data.id);
    return parsed.data;
  });
}

export function parseDiagnosticCopy(markdown: string): DiagnosticCopy {
  const sections: Record<string, string> = {};
  let currentSection: string | undefined;

  for (const line of markdown.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const heading = line.match(/^##\s+([a-z0-9-]+)\s*$/i);
    if (heading) {
      currentSection = heading[1].toLowerCase();
      if (currentSection in sections) {
        throw new Error(`Diagnostic Markdown contains duplicate section "${currentSection}".`);
      }
      sections[currentSection] = "";
    } else if (/^#\s+/.test(line)) {
      continue;
    } else if (currentSection) {
      sections[currentSection] += `${sections[currentSection] ? "\n" : ""}${line}`;
    } else if (line.trim()) {
      throw new Error("Diagnostic Markdown must place content under a level-two heading.");
    }
  }

  const topicLines = (sections["evaluation-topics"] ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (topicLines.some((line) => !line.startsWith("- "))) {
    throw new Error('Diagnostic Markdown section "evaluation-topics" must use a bullet list.');
  }

  const parsed = diagnosticCopySchema.safeParse({
    ...sections,
    "evaluation-topics": topicLines.map((line) => line.slice(2)),
    "questions-per-attempt": sections["questions-per-attempt"]?.trim(),
  });

  if (!parsed.success) {
    throw new Error(`Invalid diagnostic Markdown: ${describeIssues(parsed.error)}.`);
  }

  return parsed.data;
}

import diagnosticMarkdown from "../../../../../technologies/rpg/curriculum/modules/M00-diagnostico/content.md?raw";
import questionsCsv from "../../../../../technologies/rpg/curriculum/modules/M00-diagnostico/questions.csv?raw";
import { parseDiagnosticCopy, parseDiagnosticQuestions } from "./diagnostic-content-parser";

export const diagnosticCopy = parseDiagnosticCopy(diagnosticMarkdown);
export const diagnosticQuestions = parseDiagnosticQuestions(questionsCsv);

if (diagnosticCopy["questions-per-attempt"] > diagnosticQuestions.length) {
  throw new Error(
    `M00 requests ${diagnosticCopy["questions-per-attempt"]} questions per attempt, but only ${diagnosticQuestions.length} are defined.`,
  );
}

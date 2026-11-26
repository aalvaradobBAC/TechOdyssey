import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateAssessmentScore,
  calculateTechnologyProgress,
  hasCompletedRequiredUnits,
  selectRandomIndex,
  shuffleOptions,
} from "./progress-utils.ts";

test("technology progress counts only distinct completed modules in that technology", () => {
  const rpgModules = Array.from(
    { length: 19 },
    (_, index) => `M${String(index).padStart(2, "0")}`,
  );

  assert.equal(
    calculateTechnologyProgress(
      ["rpg/M00", "rpg/M01", "rpg/M01", "rpg/M99", "java/M01"],
      "rpg",
      rpgModules,
    ),
    11,
  );
});

test("technology progress clamps to 100 and returns zero for an empty curriculum", () => {
  assert.equal(
    calculateTechnologyProgress(["rpg/M00", "rpg/M01"], "rpg", ["M00"]),
    100,
  );
  assert.equal(calculateTechnologyProgress(["rpg/M00"], "rpg", []), 0);
});

test("assessment score is calculated against the exact number of questions", () => {
  assert.equal(calculateAssessmentScore([true, true, true, true, false]), 80);
  assert.equal(calculateAssessmentScore([true, true, true, false, false]), 60);
  assert.equal(calculateAssessmentScore([]), 0);
});

test("a prerequisite is satisfied only when every required unit is complete", () => {
  const requiredUnits = Array.from(
    { length: 7 },
    (_, index) => `M01-S${String(index + 1).padStart(2, "0")}`,
  );

  assert.equal(hasCompletedRequiredUnits(requiredUnits, requiredUnits), true);
  assert.equal(hasCompletedRequiredUnits(requiredUnits.slice(1), requiredUnits), false);
  assert.equal(hasCompletedRequiredUnits([], []), false);
});

test("option shuffle preserves the original correct answer", () => {
  const shuffled = shuffleOptions(
    ["incorrect A", "correct", "incorrect B"],
    1,
    () => 0,
  );

  assert.equal(shuffled.options.length, 3);
  assert.equal(shuffled.options[shuffled.correctOption], "correct");
  assert.deepEqual(
    [...shuffled.options].sort(),
    ["correct", "incorrect A", "incorrect B"].sort(),
  );
});

test("random question selection avoids repeating the previous question on retry", () => {
  assert.equal(selectRandomIndex(4, () => 0, 0), 1);
  assert.equal(selectRandomIndex(4, () => 0.99, 2), 3);
  assert.equal(selectRandomIndex(1, () => 0.5, 0), 0);
  assert.throws(() => selectRandomIndex(0), /empty bank/);
});

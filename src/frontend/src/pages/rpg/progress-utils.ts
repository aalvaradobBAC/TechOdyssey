export function getModuleProgressKey(
  technologyCode: string,
  moduleCode: string,
): string {
  return `${technologyCode}/${moduleCode}`;
}

export function calculateTechnologyProgress(
  completedModules: readonly string[],
  technologyCode: string,
  technologyModuleCodes: readonly string[],
): number {
  const knownModules = new Set(technologyModuleCodes);
  if (knownModules.size === 0) return 0;

  const prefix = `${technologyCode}/`;
  const completedInTechnology = new Set(
    completedModules.filter((moduleKey) => {
      if (!moduleKey.startsWith(prefix)) return false;
      const moduleCode = moduleKey.slice(prefix.length);
      return knownModules.has(moduleCode);
    }),
  );

  return Math.min(
    100,
    Math.round((completedInTechnology.size / knownModules.size) * 100),
  );
}

export function calculateAssessmentScore(correctAnswers: readonly boolean[]): number {
  if (correctAnswers.length === 0) return 0;
  const correctCount = correctAnswers.filter(Boolean).length;
  return Math.round((correctCount / correctAnswers.length) * 100);
}

export function hasCompletedRequiredUnits(
  completedUnits: readonly string[],
  requiredUnits: readonly string[],
): boolean {
  const completed = new Set(completedUnits);
  return requiredUnits.length > 0
    && requiredUnits.every((unitCode) => completed.has(unitCode));
}

export type ShuffledOptions = {
  options: string[];
  correctOption: number;
};

export function shuffleOptions(
  options: readonly string[],
  correctOption: number,
  random: () => number = Math.random,
): ShuffledOptions {
  const entries = options.map((text, originalIndex) => ({
    text,
    isCorrect: originalIndex === correctOption,
  }));

  for (let index = entries.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [entries[index], entries[randomIndex]] =
      [entries[randomIndex], entries[index]];
  }

  return {
    options: entries.map((entry) => entry.text),
    correctOption: entries.findIndex((entry) => entry.isCorrect),
  };
}

export function selectRandomIndex(
  itemCount: number,
  random: () => number = Math.random,
  previousIndex?: number,
): number {
  if (!Number.isInteger(itemCount) || itemCount < 1) {
    throw new Error("Cannot select a question from an empty bank.");
  }
  if (itemCount === 1) return 0;

  const availableCount =
    previousIndex !== undefined && previousIndex >= 0 && previousIndex < itemCount
      ? itemCount - 1
      : itemCount;
  const selectedIndex = Math.floor(random() * availableCount);

  return previousIndex !== undefined
    && previousIndex >= 0
    && previousIndex < itemCount
    && selectedIndex >= previousIndex
    ? selectedIndex + 1
    : selectedIndex;
}

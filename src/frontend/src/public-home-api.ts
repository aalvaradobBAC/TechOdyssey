import { z } from "zod";
import { apiBaseUrl } from "./api-base";

const publicHomeSchema = z.object({
  content: z.object({
    leaderboardLimit: z.number().int().positive(),
    heroEyebrow: z.string(),
    heroTitle: z.string(),
    heroHighlight: z.string(),
    heroDescription: z.string(),
    heroCallToAction: z.string(),
    heroQuote: z.string(),
    heroQuoteAttribution: z.string(),
    benefits: z.array(z.object({
      icon: z.string(),
      title: z.string(),
      description: z.string(),
    })),
    technologyHeading: z.string(),
    technologyDescription: z.string(),
    communityHeading: z.string(),
    participantsLabel: z.string(),
    completedModulesLabel: z.string(),
    experiencePointsLabel: z.string(),
    activeTechnologiesLabel: z.string(),
    leaderboardHeading: z.string(),
    leaderboardDescription: z.string(),
    leaderboardEmptyMessage: z.string(),
    learningStepsHeading: z.string(),
    learningSteps: z.array(z.object({
      code: z.string(),
      icon: z.string(),
      title: z.string(),
      description: z.string(),
    })),
    closingHeading: z.string(),
    closingDescription: z.string(),
    closingCallToAction: z.string(),
    technologies: z.array(z.object({
      code: z.string(),
      name: z.string(),
      description: z.string(),
      status: z.enum(["active", "planned", "maintenance"]),
      statusLabel: z.string(),
      color: z.string(),
      icon: z.string(),
      path: z.string(),
    })),
  }),
  statistics: z.object({
    participantCount: z.number().int().nonnegative(),
    completedModuleCount: z.number().int().nonnegative(),
    totalExperiencePoints: z.number().int().nonnegative(),
    activeTechnologyCount: z.number().int().nonnegative(),
  }),
  leaderboard: z.array(z.object({
    position: z.number().int().positive(),
    email: z.string().email(),
    experiencePoints: z.number().int().nonnegative(),
    level: z.number().int().positive(),
    completedModuleCount: z.number().int().nonnegative(),
  })),
  updatedAt: z.string(),
});

export type PublicHomeData = z.infer<typeof publicHomeSchema>;

export async function getPublicHome(signal?: AbortSignal): Promise<PublicHomeData> {
  const response = await fetch(`${apiBaseUrl}/api/public/home`, {
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    throw new Error(`No se pudo cargar la página pública (${response.status}).`);
  }

  return publicHomeSchema.parse(await response.json());
}

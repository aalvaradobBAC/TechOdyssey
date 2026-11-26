import { z } from "zod";
import { apiBaseUrl } from "../../api-base";

const authResponseSchema = z.object({
  email: z.string().email(),
  experiencePoints: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  completedModules: z.array(z.string()),
  canResetPasswords: z.boolean(),
});

const progressSchema = authResponseSchema.omit({
  email: true,
  canResetPasswords: true,
});

const completionResponseSchema = z.object({
  pointsAwarded: z.number().int().nonnegative(),
  progress: progressSchema,
});

const completedUnitsResponseSchema = z.object({
  completedUnits: z.array(z.string()),
});

const unitCompletionResponseSchema = z.object({
  completed: z.boolean(),
});

const adminAccountRecoverySchema = z.object({
  email: z.string().email(),
});

const problemSchema = z.object({
  title: z.string().optional(),
  detail: z.string().optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type LearnerProgress = z.infer<typeof progressSchema>;
export type ModuleCompletionResponse = z.infer<typeof completionResponseSchema>;

export class GamificationApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GamificationApiError";
  }
}

async function ensureSuccessfulResponse(response: Response): Promise<void> {
  if (response.ok) return;

  let message = `La solicitud falló (${response.status}).`;
  if (response.headers.get("content-type")?.includes("json")) {
    const body: unknown = await response.json();
    const problem = problemSchema.safeParse(body);
    if (problem.success) {
      message = problem.data.detail ?? problem.data.title ?? message;
    }
  }

  throw new GamificationApiError(message, response.status);
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  await ensureSuccessfulResponse(response);
  return schema.parse(await response.json());
}

export async function getCurrentSession(): Promise<AuthResponse | null> {
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    credentials: "include",
  });
  if (response.status === 401) return null;

  await ensureSuccessfulResponse(response);
  return authResponseSchema.parse(await response.json());
}

export function register(email: string, password: string): Promise<AuthResponse> {
  return request("/api/auth/register", authResponseSchema, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request("/api/auth/login", authResponseSchema, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  await ensureSuccessfulResponse(response);
}

export function completeModule(
  technologyCode: string,
  moduleCode: string,
): Promise<ModuleCompletionResponse> {
  return request(
    `/api/progress/${encodeURIComponent(technologyCode)}/${encodeURIComponent(moduleCode)}/complete`,
    completionResponseSchema,
    {
      method: "POST",
    },
  );
}

export async function getCompletedUnits(
  technologyCode: string,
  moduleCode: string,
): Promise<string[]> {
  const response = await fetch(
    `${apiBaseUrl}/api/progress/${encodeURIComponent(technologyCode)}/${encodeURIComponent(moduleCode)}/units`,
    {
      credentials: "include",
    },
  );
  if (response.status === 401) return [];

  await ensureSuccessfulResponse(response);
  return completedUnitsResponseSchema.parse(await response.json()).completedUnits;
}

export async function completeUnit(
  technologyCode: string,
  moduleCode: string,
  unitCode: string,
): Promise<boolean> {
  const result = await request(
    `/api/progress/${encodeURIComponent(technologyCode)}/${encodeURIComponent(moduleCode)}/units/${encodeURIComponent(unitCode)}/complete`,
    unitCompletionResponseSchema,
    { method: "POST" },
  );
  return result.completed;
}

export async function resetUserPassword(
  targetEmail: string,
  newPassword: string,
  resetSecret: string,
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/admin/password-reset`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Reset-Key": resetSecret,
    },
    body: JSON.stringify({ targetEmail, newPassword }),
  });
  await ensureSuccessfulResponse(response);
}

export function recoverAdminAccount(
  newPassword: string,
  resetSecret: string,
): Promise<z.infer<typeof adminAccountRecoverySchema>> {
  return request("/api/admin/recover-account", adminAccountRecoverySchema, {
    method: "POST",
    headers: { "X-Admin-Reset-Key": resetSecret },
    body: JSON.stringify({ newPassword }),
  });
}

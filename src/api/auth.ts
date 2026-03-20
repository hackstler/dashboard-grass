import { apiRequest } from "./http";
import type { User, LoginResponse, InviteValidation } from "../types";

export type { AuthStrategyType, LoginResponse } from "../types";

export function getAuthStrategy(): "password" | "firebase" {
  const raw = import.meta.env["VITE_AUTH_STRATEGY"];
  if (raw === "firebase") return "firebase";
  return "password";
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    public: true,
  });
  localStorage.setItem("auth_token", data.token);
  return data;
}

export async function loginWithFirebaseToken(
  idToken: string
): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { idToken },
    public: true,
  });
  localStorage.setItem("auth_token", data.token);
  return data;
}

export async function getMe(): Promise<User | null> {
  if (!isLoggedIn()) return null;
  try {
    const data = await apiRequest<{
      userId: string;
      email: string;
      name: string | null;
      surname: string | null;
      phone: string | null;
      orgId: string;
      role?: string;
      onboardingComplete?: boolean;
      firstName?: string | null;
      lastName?: string | null;
      orgFeatures?: Record<string, unknown>;
    }>("/auth/me");
    return {
      id: data.userId,
      email: data.email,
      name: data.name ?? null,
      surname: data.surname ?? null,
      phone: data.phone ?? null,
      orgId: data.orgId,
      role: (data.role === "admin" ? "admin" : data.role === "super_admin" ? "super_admin" : "user") as User["role"],
      onboardingComplete: data.onboardingComplete,
      firstName: data.firstName,
      lastName: data.lastName,
      orgFeatures: data.orgFeatures as User["orgFeatures"],
    };
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem("auth_token");
}

export function isLoggedIn(): boolean {
  return localStorage.getItem("auth_token") !== null;
}

export async function validateInviteToken(token: string): Promise<InviteValidation> {
  return apiRequest<InviteValidation>(
    `/auth/invite/validate?token=${encodeURIComponent(token)}`,
    { public: true },
  );
}

export async function registerWithInvite(data: {
  inviteToken: string;
  idToken?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}): Promise<LoginResponse> {
  const resp = await apiRequest<LoginResponse>("/auth/register-with-invite", {
    method: "POST",
    body: data,
    public: true,
  });
  localStorage.setItem("auth_token", resp.token);
  return resp;
}

export async function completeOnboarding(): Promise<void> {
  await apiRequest("/auth/profile", {
    method: "PATCH",
    body: { onboardingComplete: true },
  });
}

export async function updateProfile(data: {
  email?: string;
  name?: string;
  surname?: string;
  phone?: string;
  password?: string;
}): Promise<User> {
  const resp = await apiRequest<{
    data: {
      id: string;
      email: string | null;
      name: string | null;
      surname: string | null;
      phone: string | null;
      orgId: string;
      role: string;
      createdAt: string;
    };
  }>("/auth/profile", {
    method: "PATCH",
    body: data,
  });
  return {
    id: resp.data.id,
    email: resp.data.email ?? "",
    name: resp.data.name ?? null,
    surname: resp.data.surname ?? null,
    phone: resp.data.phone ?? null,
    orgId: resp.data.orgId,
    role: (resp.data.role === "admin" ? "admin" : resp.data.role === "super_admin" ? "super_admin" : "user") as User["role"],
  };
}

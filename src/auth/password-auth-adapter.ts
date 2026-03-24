import type { AuthAdapter } from "./auth-adapter";
import { login, registerWithInvite, logout as apiLogout } from "../api/auth";

export class PasswordAuthAdapter implements AuthAdapter {
  readonly strategyName = "password" as const;
  readonly supportsPasswordManagement = true;

  async loginWithGoogle(): Promise<void> {
    throw new Error("Google sign-in is not available in password mode");
  }

  async loginWithCredentials(email: string, password: string): Promise<void> {
    await login(email, password);
  }

  async registerWithGoogle(): Promise<void> {
    throw new Error("Google registration is not available in password mode");
  }

  async registerWithCredentials(
    inviteToken: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
  ): Promise<void> {
    await registerWithInvite({
      inviteToken,
      email,
      password,
      firstName,
      lastName,
      phone,
    });
  }

  async handleRedirectResult(): Promise<boolean> {
    return false;
  }

  async logout(): Promise<void> {
    apiLogout();
  }
}

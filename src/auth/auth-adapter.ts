export interface AuthAdapter {
  readonly strategyName: "password" | "firebase";
  readonly supportsPasswordManagement: boolean;

  loginWithGoogle(): Promise<void>;
  loginWithCredentials(email: string, password: string): Promise<void>;
  registerWithGoogle(
    inviteToken: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
  ): Promise<void>;
  registerWithCredentials(
    inviteToken: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
  ): Promise<void>;
  handleRedirectResult(): Promise<boolean>;
  logout(): Promise<void>;
}

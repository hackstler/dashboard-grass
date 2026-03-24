import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  GoogleAuthProvider,
  signOut,
  type UserCredential,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "../config/firebase";
import type { AuthAdapter } from "./auth-adapter";
import { loginWithFirebaseToken, registerWithInvite, logout as apiLogout } from "../api/auth";

const googleProvider = new GoogleAuthProvider();

/**
 * Stores pending registration context so handleRedirectResult can complete
 * the flow when the user returns from a Google redirect (fallback).
 */
const REDIRECT_CONTEXT_KEY = "firebase_redirect_context";

interface RedirectContext {
  type: "login" | "register";
  inviteToken?: string;
  firstName?: string;
  lastName?: string;
}

function saveRedirectContext(ctx: RedirectContext): void {
  sessionStorage.setItem(REDIRECT_CONTEXT_KEY, JSON.stringify(ctx));
}

function consumeRedirectContext(): RedirectContext | null {
  const raw = sessionStorage.getItem(REDIRECT_CONTEXT_KEY);
  sessionStorage.removeItem(REDIRECT_CONTEXT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RedirectContext;
  } catch {
    return null;
  }
}

/**
 * Waits for Firebase to resolve auth state (needed after redirect).
 * Returns the current Firebase user or null after timeout.
 */
function waitForAuthUser(timeoutMs = 3000): Promise<FirebaseUser | null> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  return new Promise((resolve) => {
    const timer = setTimeout(() => { unsub(); resolve(null); }, timeoutMs);
    const unsub = onAuthStateChanged(auth, (user) => {
      clearTimeout(timer);
      unsub();
      resolve(user);
    });
  });
}

/**
 * Try popup first; fall back to redirect only when popup is blocked.
 * Returns the UserCredential on success, or null if fell back to redirect.
 */
async function googleSignIn(redirectCtx: RedirectContext): Promise<UserCredential | null> {
  const auth = getFirebaseAuth();
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment" ||
      code === "auth/popup-closed-by-user"
    ) {
      // Popup unavailable — fall back to redirect
      saveRedirectContext(redirectCtx);
      await signInWithRedirect(auth, googleProvider);
      return null; // page navigates away
    }
    throw err;
  }
}

export class FirebaseAuthAdapter implements AuthAdapter {
  readonly strategyName = "firebase" as const;
  readonly supportsPasswordManagement = false;

  async loginWithGoogle(): Promise<void> {
    const result = await googleSignIn({ type: "login" });
    if (!result) return; // redirect flow — page navigated away

    const idToken = await result.user.getIdToken();
    await loginWithFirebaseToken(idToken);
  }

  async loginWithCredentials(): Promise<void> {
    throw new Error("Password login is not available with Firebase authentication");
  }

  async registerWithGoogle(
    inviteToken: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
  ): Promise<void> {
    const result = await googleSignIn({ type: "register", inviteToken, firstName, lastName });
    if (!result) return; // redirect flow — page navigated away

    const idToken = await result.user.getIdToken();
    await registerWithInvite({
      inviteToken,
      idToken,
      firstName,
      lastName,
      phone,
    });
  }

  async registerWithCredentials(): Promise<void> {
    throw new Error("Password registration is not available with Firebase authentication");
  }

  /**
   * Handles the return from a redirect-based sign-in (fallback flow).
   * Uses getRedirectResult first; if that returns null (known Firebase issue
   * on Safari, in-app browsers, etc.), falls back to onAuthStateChanged.
   */
  async handleRedirectResult(): Promise<boolean> {
    const auth = getFirebaseAuth();

    // 1. Standard: try getRedirectResult
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const idToken = await result.user.getIdToken();
        const ctx = consumeRedirectContext();

        if (ctx?.type === "register" && ctx.inviteToken) {
          await registerWithInvite({
            inviteToken: ctx.inviteToken,
            idToken,
            firstName: ctx.firstName,
            lastName: ctx.lastName,
          });
        } else {
          await loginWithFirebaseToken(idToken);
        }
        return true;
      }
    } catch (err) {
      // getRedirectResult can throw in some environments — don't bail yet
      console.warn("[FirebaseAuth] getRedirectResult failed, trying fallback:", err);
    }

    // 2. Fallback: getRedirectResult returned null or threw.
    //    If we have a pending redirect context, check if Firebase has a current user.
    const ctx = consumeRedirectContext();
    if (!ctx) return false;

    const firebaseUser = await waitForAuthUser();
    if (!firebaseUser) return false;

    const idToken = await firebaseUser.getIdToken(true);

    if (ctx.type === "register" && ctx.inviteToken) {
      await registerWithInvite({
        inviteToken: ctx.inviteToken,
        idToken,
        firstName: ctx.firstName,
        lastName: ctx.lastName,
      });
    } else {
      await loginWithFirebaseToken(idToken);
    }

    return true;
  }

  async logout(): Promise<void> {
    const auth = getFirebaseAuth();
    await signOut(auth);
    apiLogout();
  }
}
